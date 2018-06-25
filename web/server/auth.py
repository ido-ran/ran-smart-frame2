import webapp2
import json
import logging
import urllib
import httplib2
import json

from google.appengine.api import users
from google.appengine.ext import ndb

class GoogleAuthHandler(webapp2.RequestHandler):

    def get(self):
        code = self.request.get('code')

        http = httplib2.Http()

        url = 'https://www.googleapis.com/oauth2/v4/token'   
        body = {'code': code,
                'client_id': '226657794555-jp7ph38s8rcpqbu4pjepsg24aphp03qd.apps.googleusercontent.com',
                'client_secret': 'U_Vg-axeRGFDxTyOXDl6oYeO',
                'redirect_uri': 'http://localhost:8080/auth/google-auth-callback',
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

            url = 'https://www.googleapis.com/plus/v1/people/me?key=' + access_token
            headers = {'Authorization': 'Bearer ' + access_token}
            response, content = http.request(url, 'GET', headers=headers)

            self.response.out.write('hello, auth, ' + content)

        # access_key = self.request.get('access_key')
        # key = ndb.Key('Frame', int(id))
        # frame = key.get()

        # if (frame is None or frame.access_key != access_key):
        #     self.response.status = 404
        #     self.response.write('frame not found')
        # else:
        #     streams = [stream.get() for stream in frame.streams]

        #     frame_with_streams = {
        #         'frame': frame.serialize(),
        #         'streams': ([self.serialize_stream(s) for s in streams])
        #     }

        #     self.response.headers['Content-Type'] = 'application/json'
        #     self.response.out.write(json.dumps(frame_with_streams))
