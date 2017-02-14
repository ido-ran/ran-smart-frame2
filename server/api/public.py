import webapp2
import json

from google.appengine.api import users
from google.appengine.ext import ndb

from serializers import clone_for_json
from models import Frame, Photo

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

class PublicPhotoApiTODO(webapp2.RequestHandler):

    def get(self, frame_id, stream_id, photo_id):
        stream_key = ndb.Key('Stream', int(stream_id))
        photo_key = ndb.Key('Photo', int(photo_id), parent=stream_key)
        photo = photo_key.get()

        bucket_name = os.environ.get('BUCKET_NAME',
                                     app_identity.get_default_gcs_bucket_name())

        filename = "/{0}/pics/{1:x}.png".format(bucket_name, photo.crc32c)

        try:
            file_stat = gcs.stat(filename)
            gcs_file = gcs.open(filename)
            self.response.headers['Content-Type'] = file_stat.content_type
            self.response.headers['Cache-Control'] = 'private, max-age=31536000' # cache for upto 1 year
            self.response.headers['ETag'] = file_stat.etag
            self.response.write(gcs_file.read())
            gcs_file.close()

        except gcs.NotFoundError:
            self.response.status = 404
            self.response.write('photo not found')
