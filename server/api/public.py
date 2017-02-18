import webapp2
import json

from google.appengine.api import users
from google.appengine.ext import ndb

from serializers import clone_for_json
from models import Frame, Photo
from photo_storage import read_photo_from_storage

class PublicApi(webapp2.RequestHandler):

    def get(self, id):
        access_key = self.request.get('access_key')
        key = ndb.Key('Frame', int(id))
        frame = key.get()

        if (frame is None or frame.access_key != access_key):
            self.response.status = 404
            self.response.write('frame not found')
        else:
            streams = [stream.get() for stream in frame.streams]

            frame_with_streams = {
                'frame': frame.serialize(),
                'streams': ([self.serialize_stream(s) for s in streams])
            }

            self.response.headers['Content-Type'] = 'application/json'
            self.response.out.write(json.dumps(frame_with_streams))

    @staticmethod
    def fetch_photos(stream_key):
        photos_query = Photo.query(ancestor=stream_key)
        photos = photos_query.fetch(10)

        return [g.serialize() for g in photos]

    @staticmethod
    def serialize_stream(stream):
        serialized_stream = clone_for_json(stream)
        serialized_stream['photos'] = PublicApi.fetch_photos(stream.key)
        return serialized_stream

class PublicPhotoApi(webapp2.RequestHandler):

    def get(self, frame_id, stream_id, photo_id):
        access_key = self.request.get('access_key')
        stream_key = ndb.Key('Stream', int(stream_id))

        frame_key = ndb.Key('Frame', int(frame_id))
        frame = frame_key.get()

        if (frame is None or frame.access_key != access_key):
            self.response.status = 404
            self.response.write('frame not found')
            return

        if (not stream_key in frame.streams):
            self.response.status = 404
            self.response.write('frame not found')
            return

        photo_key = ndb.Key('Photo', int(photo_id), parent=stream_key)
        photo = photo_key.get()

        if (photo is None):
            self.response.status = 404
            self.response.write('picture not found')
            return

        read_photo_from_storage(photo, self.response)
