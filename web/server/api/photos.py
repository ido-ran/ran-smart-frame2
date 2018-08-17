import webapp2
import json
import base64
import logging
import os
import hashlib

from google.appengine.api import app_identity
from google.appengine.api import users
from google.appengine.ext import ndb
from google.appengine.api import images

import cloudstorage as gcs

from serializers import default_json_serializer
from models import Photo
from photo_storage import read_photo_from_storage, write_photo_to_storage
from google_photos import GooglePhotos

class PhotosApi(webapp2.RequestHandler):

    def get(self, stream_id):
        stream_key = ndb.Key('Stream', int(stream_id))
        stream = stream_key.get()

        print('type is ' + stream.type)
        if (stream.type == 'files'):
            photos_query = Photo.query(ancestor=stream_key)
            photos = photos_query.fetch(1000)

            self.response.headers['Content-Type'] = 'application/json'
            self.response.out.write(json.dumps([dict(g.to_dict(), **dict(id=g.key.id())) for g in photos], default=default_json_serializer))

        elif (stream.type == 'google-photos-album'):
            google_auth = stream.google_auth_key.get()
            google_photos = GooglePhotos()
            photos = google_photos.get_album_photos(google_auth, stream.google_album_id)

            self.response.headers['Content-Type'] = 'application/json'
            self.response.out.write(json.dumps([g for g in photos], default=default_json_serializer))

        else:
            self.response.status = 500
            self.response.write('stream type not supported')

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

        # even if we process the file we calc the hash using original upload content.
        checksum = base64.urlsafe_b64encode(hashlib.sha256(uploaded_file_content).digest())
        logging.info("sha256: {0}".format(checksum))

        write_photo_to_storage(users.get_current_user().user_id(), checksum, 'main', uploaded_file_type, image_content_to_save)
        write_photo_to_storage(users.get_current_user().user_id(), checksum, 'thumbnail', uploaded_file_type, thumbnail)

        photo = Photo(
                      parent = stream_key,
                      created_by_user_id=users.get_current_user().user_id(),
                      sha256=checksum)
        photo.put()

        self.response.out.write("ok")

class PhotoApi(webapp2.RequestHandler):

    def get(self, stream_id, photo_id, photo_label='main'):
        stream_key = ndb.Key('Stream', int(stream_id))
        stream = stream_key.get()

        if (stream.type == 'files'):
            photo_key = ndb.Key('Photo', int(photo_id), parent=stream_key)
            photo = photo_key.get()

            bucket_name = os.environ.get('BUCKET_NAME',
                                        app_identity.get_default_gcs_bucket_name())

            read_photo_from_storage(photo, photo_label, self.response)
        elif (stream.type == 'google-photos-album'):
            google_auth = stream.google_auth_key.get()
            google_photos = GooglePhotos()
            photo_url = google_photos.get_album_photo_url(google_auth, photo_id)

            if (photo_label == 'main'):
                photo_url += '=d' # add the download parameter (https://developers.google.com/photos/library/guides/access-media-items#image-base-urls)
            else:
                photo_url += '=w206-h160' # add width & height parameters

            return self.redirect(str(photo_url))

        else:
            self.response.status = 500
            self.response.write('stream type not supported')
