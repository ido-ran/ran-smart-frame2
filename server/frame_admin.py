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

from google.appengine.api import users
from google.appengine.ext import ndb

import webapp2
import json

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


# [START app]
app = webapp2.WSGIApplication([
    webapp2.Route(r'/api/streams', StreamsApi),
    webapp2.Route(r'/api/streams/<id:\d+>', StreamApi),
    webapp2.Route(r'/api/me', MeApi),
], debug=True)
# [END app]
