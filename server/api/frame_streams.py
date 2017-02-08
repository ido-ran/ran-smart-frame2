import webapp2
import json

from google.appengine.api import users
from google.appengine.ext import ndb

from serializers import default_json_serializer
from models import Frame, Stream

class FrameStreamsApi(webapp2.RequestHandler):

    def post(self, frame_id):
        stream_id = self.request.get('stream_id')

        frame_key = ndb.Key('Frame', int(frame_id))
        stream_key = ndb.Key('Stream', int(stream_id))

        frame = frame_key.get()
        if stream_key in frame.streams:
            self.response.status = 403 # forbidden
            self.response.write('stream is alreay linked to this frame')
        else:
            frame.streams.append(stream_key)
            frame.put()
            self.response.out.write("ok")


class FrameStreamApi(webapp2.RequestHandler):
    def delete(self, frame_id, stream_id):
        frame_key = ndb.Key('Frame', int(frame_id))
        stream_key = ndb.Key('Stream', int(stream_id))

        frame = frame_key.get()
        if not stream_key in frame.streams:
            self.response.status = 403 # forbidden
            self.response.write('stream is not linked to this frame')
        else:
            frame.streams.remove(stream_key)
            frame.put()
            self.response.out.write("ok")
