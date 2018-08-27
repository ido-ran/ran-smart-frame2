from google.appengine.ext import ndb
import os
from google.appengine.api import app_identity

from models import Photo
from googlephotos.google_photos import GooglePhotos
from photo_storage import read_photo_from_storage, write_photo_to_storage

class PhotoInfo:

  def __init__(self, id):
    self.id = id

  def serialize(self):
    return {
      'id': self.id
    }

def get_stream_photos(stream):

  if (stream.type == 'files'):
    photos_query = Photo.query(ancestor=stream.key)
    photos = photos_query.fetch(1000)
    return [PhotoInfo(photo.key.id()) for photo in photos]    

  elif (stream.type == 'google-photos-album'):
    google_auth = stream.google_auth_key.get()
    google_photos = GooglePhotos(google_auth)
    photos = google_photos.get_album_photos(stream.google_album_id)
    print('google-photos')
    print(photos)
    return [PhotoInfo(photo['id']) for photo in photos]

  return photos

def get_photo(stream, photo_id, photo_label, web_handler):
  if (stream.type == 'files'):
      photo_key = ndb.Key('Photo', int(photo_id), parent=stream.key)
      photo = photo_key.get()

      bucket_name = os.environ.get('BUCKET_NAME',
                                  app_identity.get_default_gcs_bucket_name())

      read_photo_from_storage(photo, photo_label, web_handler.response)
  elif (stream.type == 'google-photos-album'):
      google_auth = stream.google_auth_key.get()
      google_photos = GooglePhotos(google_auth)
      photo_url = google_photos.get_album_photo_url(photo_id)

      if (photo_label == 'main'):
          photo_url += '=d' # add the download parameter (https://developers.google.com/photos/library/guides/access-media-items#image-base-urls)
      else:
          photo_url += '=w206-h160' # add width & height parameters

      return web_handler.redirect(str(photo_url))

  else:
      web_handler.response.status = 500
      web_handler.response.write('stream type not supported')
