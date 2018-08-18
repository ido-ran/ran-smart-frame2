import webapp2
import json
from datetime import datetime

from google.appengine.api import users
from google.appengine.ext import ndb

from apiclient.discovery import build
from oauth2client import client
from httplib2 import Http

from serializers import default_json_serializer
from models import GoogleAuth, Stream
from googlephotos.google_photos import GooglePhotos

class GoogleAlbumsApi(webapp2.RequestHandler):

    def get(self, external_user_id):
        google_auth = GoogleAuth.get_by_user_and_external_user(users.get_current_user().user_id(), external_user_id)

        if (google_auth is None):
            self.response.status = 404
            self.response.write('GoogleAuth not found')
        else:
            google_photos = GooglePhotos(google_auth)
            albums = google_photos.get_albums()

            if not albums:
                print 'albums is None'
                self.response.headers['Content-Type'] = 'application/json'
                self.response.out.write([])
            else:
                print('Albums:')
                for item in albums:
                    print('{0} ({1})'.format(item['title'].encode('utf8'), item['id']))

                self.response.headers['Content-Type'] = 'application/json'
                self.response.out.write(json.dumps([g for g in albums], default=default_json_serializer))

    def post(self, external_user_id):
        name = self.request.get('name')
        google_album_id = self.request.get('googleAlbumId')

        google_auth = GoogleAuth.get_by_user_and_external_user(users.get_current_user().user_id(), external_user_id)

        if (google_auth is None):
            self.response.status = 404
            self.response.write('GoogleAuth not found')
        else:
            stream = Stream(name = name,
                            type = 'google-photos-album',
                            google_auth_key = google_auth.key,
                            google_album_id = google_album_id,
                            created_by_user_id=users.get_current_user().user_id())
            stream.put()
            self.response.out.write("ok")
