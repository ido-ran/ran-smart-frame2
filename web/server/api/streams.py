import webapp2
import json

from google.appengine.api import users
from google.appengine.ext import ndb

from serializers import default_json_serializer
from models import Stream

class StreamsApi(webapp2.RequestHandler):

    def get(self):
        owner_streams = Stream.query_by_owner(users.get_current_user().user_id()).fetch()

        self.response.headers['Content-Type'] = 'application/json'
        self.response.out.write(json.dumps([g.serialize() for g in owner_streams], default=default_json_serializer))

    def post(self):
        # We set the same parent key on the 'Greeting' to ensure each
        # Greeting is in the same entity group. Queries across the
        # single entity group will be consistent. However, the write
        # rate to a single entity group should be limited to
        # ~1/second.
        name = self.request.get('name')
        stream = Stream(name = name, created_by_user_id=users.get_current_user().user_id())
        stream.put()

        self.response.out.write("ok")

class StreamApi(webapp2.RequestHandler):

    def get(self, id):
        key = ndb.Key('Stream', int(id))
        stream = key.get()

        if (stream is None):
            self.response.status = 404
            self.response.write('stream not found')
        else:
            self.response.headers['Content-Type'] = 'application/json'
            self.response.out.write(json.dumps(stream.serialize(), default=default_json_serializer))
            # self.response.out.write(json.dumps(dict(stream.to_dict(), **dict(id=stream.key.id())), default=default_json_serializer))
