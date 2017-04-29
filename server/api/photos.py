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
from photo_storage import read_photo_from_storage

class PhotosApi(webapp2.RequestHandler):

    def get(self, stream_id):
        stream_key = ndb.Key('Stream', int(stream_id))

        photos_query = Photo.query(ancestor=stream_key)
        photos = photos_query.fetch(10)

        include_thumbnail = self.request.get('include_thumbnail')

        self.response.headers['Content-Type'] = 'application/json'

        if (include_thumbnail):
            self.response.out.write(json.dumps([dict(g.to_dict(), **dict(id=g.key.id(), thumbnail=base64.b64encode(g.thumbnail))) for g in photos], default=default_json_serializer))
        else:
            self.response.out.write(json.dumps([dict(g.to_dict(), **dict(id=g.key.id(), thumbnail='')) for g in photos], default=default_json_serializer))

    def post(self, stream_id):
        stream_key = ndb.Key('Stream', int(stream_id))

        img_field = self.request.POST.get('image')
        uploaded_file_content = img_field.file.read()
        uploaded_file_type = img_field.type

        # Process the image by rotating it 0 degress in order to fix
        # the image orientation based on EXIF data.
        process_image = images.Image(image_data=uploaded_file_content)
        process_image.set_correct_orientation(images.CORRECT_ORIENTATION)
        process_image.rotate(0)
        process_image_content = process_image.execute_transforms(parse_source_metadata=True)
        logging.info("image metadata {0}".format(process_image.get_original_metadata()))

        # If the processed image actually was rotated because of EXIF orientation
        # we use the processed image, otherwise we use the original file content.
        if ('Orientation' in process_image.get_original_metadata() and
            process_image.get_original_metadata()['Orientation'] in [3, 6, 8]):
            image_content_to_save = process_image_content
            logging.info('using processed image')
        else:
            image_content_to_save = uploaded_file_content
            logging.info('using original image')

        thumbnail = images.resize(image_content_to_save, 200, 200)

        # even if we process the file we calc the crc using original upload content.
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
        gcs_file.write(image_content_to_save)
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

        read_photo_from_storage(photo, self.response)
