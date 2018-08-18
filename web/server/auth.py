import webapp2
import json
import logging
import urllib
import httplib2
import json

from google.appengine.api import users
from google.appengine.ext import ndb

from models import GoogleAuth

import params

class GoogleAuthHandler(webapp2.RequestHandler):

    def get(self):
        code = self.request.get('code')

        http = httplib2.Http()

        url = 'https://www.googleapis.com/oauth2/v4/token'   
        body = {'code': code,
                'client_id': params.oauth_client_id(),
                'client_secret': params.oatuh_client_secret(),
                'redirect_uri': params.oauth_redirect_url(self.request),
                'grant_type': 'authorization_code'
        }
        headers = {'Content-type': 'application/x-www-form-urlencoded'}
        response, content = http.request(url, 'POST', headers=headers, body=urllib.urlencode(body))

        oauth2Response = json.loads(content)
        for key, value in oauth2Response.iteritems() :
            print key, value

        if ('error' in oauth2Response):
            self.response.out.write('FAIL ' + content)
        else:
            access_token = oauth2Response['access_token'] if 'access_token' in oauth2Response else ''
            refresh_token = oauth2Response['refresh_token'] if 'refresh_token' in oauth2Response else ''

            # Get Google user info including id.
            url = 'https://www.googleapis.com/plus/v1/people/me?key=' + access_token
            headers = {'Authorization': 'Bearer ' + access_token}
            response, content = http.request(url, 'GET', headers=headers)

            google_user_info = json.loads(content)
            google_user_id = google_user_info['id']

            current_user_id = users.get_current_user().user_id()

            # Try to find exist GoogleAuth record
            google_auth = GoogleAuth.get_by_user_and_external_user(
                current_user_id, google_user_id)

            if (google_auth is None):
                # We didn't had this authentication before, create a new one
                google_auth = GoogleAuth(
                    user_id = current_user_id,
                    external_user_id = google_user_id
                )

            google_auth.access_token = access_token
            google_auth.refresh_token = refresh_token
            google_auth.last_email = google_user_info['emails'][0]['value']

            google_auth.put()

            self.redirect('http://localhost:3000/streams/add-google-photo-album')