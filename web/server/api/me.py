import webapp2
import json

from google.appengine.api import users
from serializers import default_json_serializer

class MeApi(webapp2.RequestHandler):

    def get(self):
        me = {
            'email': users.get_current_user().email()
        }
        self.response.headers['Content-Type'] = 'application/json'
        self.response.out.write(json.dumps(me, default=default_json_serializer))
