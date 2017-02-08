import webapp2
import json

from google.appengine.api import users
from google.appengine.ext import ndb

from serializers import default_json_serializer
from models import Frame

class FramesApi(webapp2.RequestHandler):

    def get(self):
        owner_frames = Frame.query_by_owner(users.get_current_user().user_id()).fetch()

        self.response.headers['Content-Type'] = 'application/json'
        self.response.out.write(json.dumps([g.serialize() for g in owner_frames], default=default_json_serializer))

    def post(self):
        name = self.request.get('name')
        frame = Frame(name = name, created_by_user_id=users.get_current_user().user_id())
        frame.put()

        self.response.out.write("ok")

# I'll use this method to serialize objects instead of the complex json.dumps.
# this seem to be more compsable, still not the best.
def clone_for_json(obj):
    import calendar, datetime
    clone = obj.to_dict()
    for attr, val in clone.items():
        # logging.info("attr {0} type:{1}".format(attr, type(val)))
        if (isinstance(val, datetime.datetime)):
            clone[attr] = int(
                calendar.timegm(val.timetuple()) * 1000 +
                val.microsecond / 1000
            )
        elif (isinstance(val, ndb.Key)):
            clone[attr] = val.id()

    # Add the entity numeric id.
    clone['id'] = obj.key.id()
    return clone

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
