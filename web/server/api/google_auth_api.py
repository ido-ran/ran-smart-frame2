import webapp2
import json

from google.appengine.api import users
from google.appengine.ext import ndb

from serializers import default_json_serializer
from models import GoogleAuth

class GoogleAuthApi(webapp2.RequestHandler):

    def get(self):
        google_auths = GoogleAuth.query_by_user_id(users.get_current_user().user_id()).fetch()

        self.response.headers['Content-Type'] = 'application/json'
        self.response.out.write(json.dumps([dict(g.to_dict(), **dict(id=g.key.id())) for g in google_auths], default=default_json_serializer))
