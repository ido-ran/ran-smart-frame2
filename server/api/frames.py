import webapp2
import json
import string
import random

from google.appengine.api import users
from google.appengine.ext import ndb

from serializers import default_json_serializer, clone_for_json
from models import Frame

class FramesApi(webapp2.RequestHandler):

    def get(self):
        owner_frames = Frame.query_by_owner(users.get_current_user().user_id()).fetch()

        self.response.headers['Content-Type'] = 'application/json'
        self.response.out.write(json.dumps([g.serialize() for g in owner_frames], default=default_json_serializer))

    def post(self):
        name = self.request.get('name')
        frame = Frame(
                    name = name,
                    created_by_user_id=users.get_current_user().user_id(),
                    access_key=self.generate_random_string(40)
                    )
        frame.put()

        self.response.out.write("ok")

    @staticmethod
    def generate_random_string(n):
        chars = string.ascii_uppercase + string.ascii_lowercase + string.digits
        return ''.join(random.SystemRandom().choice(chars) for _ in range(n))

class FrameApi(webapp2.RequestHandler):

    def get(self, id):
        key = ndb.Key('Frame', int(id))
        frame = key.get()

        if (frame is None):
            self.response.status = 404
            self.response.write('frame not found')
        else:
            streams = [stream.get() for stream in frame.streams]

            frame_with_streams = {
                'frame': frame.serialize(),
                'streams': ([clone_for_json(s) for s in streams])
            }

            self.response.headers['Content-Type'] = 'application/json'
            self.response.out.write(json.dumps(frame_with_streams))
