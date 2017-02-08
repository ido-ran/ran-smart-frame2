import webapp2
import json
import base64
import crcmod
import logging
import os

from google.appengine.api import app_identity
from google.appengine.api import users
from google.appengine.ext import ndb
from google.appengine.api import images

import cloudstorage as gcs

from serializers import default_json_serializer
from models import Photo

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
