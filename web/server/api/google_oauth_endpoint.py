import webapp2
import json

import params

class GoogleOAuthEndpointApi(webapp2.RequestHandler):

    def get(self):
        ENDPOINT_TEMPLATE = 'https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id={}&redirect_uri={}&scope=email%20profile%20https://www.googleapis.com/auth/photoslibrary.readonly&access_type=offline&state=add-google-photo-library-album&include_granted_scopes=true&prompt=consent'
        self.response.headers['Content-Type'] = 'application/json'
        self.response.out.write(json.dumps({
            'oauth_endpoint': ENDPOINT_TEMPLATE.format(params.oauth_client_id(), params.oauth_redirect_url(self.request))
        }))
