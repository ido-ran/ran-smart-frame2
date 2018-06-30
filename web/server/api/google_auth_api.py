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

    # def post(self):
    #     # We set the same parent key on the 'Greeting' to ensure each
    #     # Greeting is in the same entity group. Queries across the
    #     # single entity group will be consistent. However, the write
    #     # rate to a single entity group should be limited to
    #     # ~1/second.
    #     name = self.request.get('name')
    #     stream = Stream(name = name, created_by_user_id=users.get_current_user().user_id())
    #     stream.put()

    #     self.response.out.write("ok")
