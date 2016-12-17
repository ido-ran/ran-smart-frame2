#!/usr/bin/env python

# Copyright 2016 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# [START imports]
import os
import urllib
import logging

from google.appengine.api import users
from google.appengine.ext import ndb
from google.appengine.api import images

import cloudstorage as gcs
import os
from google.appengine.api import app_identity

import crcmod
import webapp2
import json
import base64

# [END imports]

class Stream(ndb.Model):
    """Model a photo stream"""
    name = ndb.StringProperty(indexed=False)
    created_by_user_id = ndb.StringProperty()
    created_at = ndb.DateTimeProperty(auto_now_add=True)
    updated_at = ndb.DateTimeProperty(auto_now=True)

    @classmethod
    def query_by_owner(cls, user_id):
        return cls.query(cls.created_by_user_id == user_id).order(-cls.updated_at)

class Photo(ndb.Model):
    """Model a single photo in a stream"""
    name = ndb.StringProperty(indexed=False)
    created_by_user_id = ndb.StringProperty(indexed=True)
    created_at = ndb.DateTimeProperty(auto_now_add=True)
    storage_path = ndb.StringProperty(indexed=False)
    thumbnail = ndb.BlobProperty()
    crc32c = ndb.IntegerProperty(indexed=False)

def default_json_serializer(obj):
    """Default JSON serializer."""
    import calendar, datetime

    if isinstance(obj, datetime.datetime):
        if obj.utcoffset() is not None:
            obj = obj - obj.utcoffset()
        millis = int(
            calendar.timegm(obj.timetuple()) * 1000 +
            obj.microsecond / 1000
        )
        return millis
    raise TypeError('Not sure how to serialize %s' % (obj,))

class MeApi(webapp2.RequestHandler):

    def get(self):
        me = {
            'email': users.get_current_user().email()
        }
        self.response.headers['Content-Type'] = 'application/json'
        self.response.out.write(json.dumps(me, default=default_json_serializer))


class StreamsApi(webapp2.RequestHandler):

    def get(self):
        owner_streams = Stream.query_by_owner(users.get_current_user().user_id()).fetch()

        self.response.headers['Content-Type'] = 'application/json'
        self.response.out.write(json.dumps([dict(g.to_dict(), **dict(id=g.key.id())) for g in owner_streams], default=default_json_serializer))

    def post(self):
        # We set the same parent key on the 'Greeting' to ensure each
        # Greeting is in the same entity group. Queries across the
        # single entity group will be consistent. However, the write
        # rate to a single entity group should be limited to
        # ~1/second.
        name = self.request.get('name')
        stream = Stream(name = name, created_by_user_id=users.get_current_user().user_id())
        stream.put()

        self.response.out.write("ok")

class StreamApi(webapp2.RequestHandler):

    def get(self, id):
        key = ndb.Key('Stream', int(id))
        stream = key.get()

        if (stream is None):
            self.response.status = 404
            self.response.write('stream not found')
        else:
            self.response.headers['Content-Type'] = 'application/json'
            self.response.out.write(json.dumps(dict(stream.to_dict(), **dict(id=stream.key.id())), default=default_json_serializer))
            # self.response.out.write(json.dumps(dict(stream.to_dict(), **dict(id=stream.key.id())), default=default_json_serializer))

class PhotosApi(webapp2.RequestHandler):

    def get(self, stream_id):
        stream_key = ndb.Key('Stream', int(stream_id))

        photos_query = Photo.query(ancestor=stream_key)
        photos = photos_query.fetch(10)

        self.response.headers['Content-Type'] = 'application/json'
        self.response.out.write(json.dumps([dict(g.to_dict(), **dict(id=g.key.id(), thumbnail=base64.b64encode(g.thumbnail))) for g in photos], default=default_json_serializer))

    def post(self, stream_id):
        stream_key = ndb.Key('Stream', int(stream_id))

        img_field = self.request.POST.get('image')
        uploaded_file_content = img_field.file.read()
        uploaded_file_type = img_field.type
        thumbnail = images.resize(uploaded_file_content, 200, 200)

        crc32_func = crcmod.predefined.mkCrcFun('crc-32c')
        checksum = crc32_func(uploaded_file_content)
        logging.info("checksum 10:{0} hex:{0:x}".format(checksum))

        bucket_name = os.environ.get('BUCKET_NAME',
                                     app_identity.get_default_gcs_bucket_name())

        filename = "/{0}/pics/{1:x}.png".format(bucket_name, checksum)

        write_retry_params = gcs.RetryParams(backoff_factor=1.1)
        gcs_file = gcs.open(filename,
                            'w',
                            content_type=uploaded_file_type,
                            options={'x-goog-meta-crc32c': "{0:x}".format(checksum)},
                            retry_params=write_retry_params)
        gcs_file.write(uploaded_file_content)
        gcs_file.close()

        photo = Photo(
                      parent = stream_key,
                      created_by_user_id=users.get_current_user().user_id(),
                      thumbnail=thumbnail,
                      crc32c=checksum)
        photo.put()

        self.response.out.write("ok")

class PhotoApi(webapp2.RequestHandler):

    def get(self, stream_id, photo_id):
        stream_key = ndb.Key('Stream', int(stream_id))
        photo_key = ndb.Key('Photo', int(photo_id), parent=stream_key)
        photo = photo_key.get()

        bucket_name = os.environ.get('BUCKET_NAME',
                                     app_identity.get_default_gcs_bucket_name())

        filename = "/{0}/pics/{1:x}.png".format(bucket_name, photo.crc32c)

        try:
            file_stat = gcs.stat(filename)
            gcs_file = gcs.open(filename)
            self.response.headers['Content-Type'] = file_stat.content_type
            self.response.write(gcs_file.read())
            gcs_file.close()

        except gcs.NotFoundError:
            self.response.status = 404
            self.response.write('photo not found')


class TestApi(webapp2.RequestHandler):
    def get(self):
      bucket_name = os.environ.get('BUCKET_NAME',
                                   app_identity.get_default_gcs_bucket_name())

      self.response.headers['Content-Type'] = 'text/plain'
      self.response.write('Demo GCS Application running from Version: '
                          + os.environ['CURRENT_VERSION_ID'] + '\n')
      self.response.write('Using bucket name: ' + bucket_name + '\n\n')

class TestWriteApi(webapp2.RequestHandler):
    def get(self):
      """Create a file.

      The retry_params specified in the open call will override the default
      retry params for this particular file handle.

      Args:
        filename: filename.
      """
      bucket_name = os.environ.get('BUCKET_NAME',
                                   app_identity.get_default_gcs_bucket_name())



      filename = '/%s/main/sub/test-file' % bucket_name
      self.response.write('Creating file %s\n' % filename)

      write_retry_params = gcs.RetryParams(backoff_factor=1.1)
      gcs_file = gcs.open(filename,
                          'w',
                          content_type='text/plain',
                          options={'x-goog-meta-foo': 'foo',
                                   'x-goog-meta-bar': 'bar'},
                          retry_params=write_retry_params)
      gcs_file.write('abcde\n')
      gcs_file.write('xyz\n')
      gcs_file.close()

class TestReadApi(webapp2.RequestHandler):
    def get(self):
      bucket_name = os.environ.get('BUCKET_NAME',
                                   app_identity.get_default_gcs_bucket_name())

      filename = '/%s/main/sub/test-file' % bucket_name
      self.response.write('Abbreviated file content (first line and last 1K):\n')

      gcs_file = gcs.open(filename)
      self.response.write(gcs_file.read())
      gcs_file.close()

# [START app]
app = webapp2.WSGIApplication([
    webapp2.Route(r'/api/streams', StreamsApi),
    webapp2.Route(r'/api/streams/<id>', StreamApi),
    webapp2.Route(r'/api/streams/<stream_id>/photos', PhotosApi),
    webapp2.Route(r'/api/streams/<stream_id>/photos/<photo_id>', PhotoApi),
    webapp2.Route(r'/api/me', MeApi),
    webapp2.Route(r'/api/test', TestApi),
    webapp2.Route(r'/api/test/write', TestWriteApi),
    webapp2.Route(r'/api/test/read', TestReadApi),
], debug=True)
# [END app]
