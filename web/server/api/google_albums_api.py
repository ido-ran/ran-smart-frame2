import webapp2
import json
from datetime import datetime

from google.appengine.api import users
from google.appengine.ext import ndb

from apiclient.discovery import build
from oauth2client import client
from httplib2 import Http

from serializers import default_json_serializer
from models import GoogleAuth

class GoogleAlbumsApi(webapp2.RequestHandler):

    def get(self, external_user_id):
        google_auth = GoogleAuth.get_by_user_and_external_user(users.get_current_user().user_id(), external_user_id)

        if (google_auth is None):
            self.response.status = 404
            self.response.write('GoogleAuth not found')
        else:
            creds = client.GoogleCredentials(google_auth.access_token, 
                '226657794555-jp7ph38s8rcpqbu4pjepsg24aphp03qd.apps.googleusercontent.com',
                'U_Vg-axeRGFDxTyOXDl6oYeO',
                google_auth.refresh_token,
                datetime.utcnow(),
                'https://www.googleapis.com/oauth2/v4/token',
                'oomkik-1.0')
            service = build('photoslibrary', 'v1', http=creds.authorize(Http()))

            # Call the Photo v1 API
            results = service.albums().list(
                pageSize=10, fields="nextPageToken,albums(id,title)").execute()
            albums = results.get('albums', [])
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
