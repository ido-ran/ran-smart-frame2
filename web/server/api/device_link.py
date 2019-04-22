import webapp2
import json
import string
import random
import logging
from datetime import datetime

from google.appengine.ext import ndb

from serializers import default_json_serializer, clone_for_json

from models import DeviceLink

class DeviceLinkStart(webapp2.RequestHandler):

    def get(self, link_id):
        link_key = ndb.Key(DeviceLink, int(link_id))
        device_link = link_key.get()

        # If the device link was created more than 5 minutes ago, ignore this call
        now = datetime.now()
        time_delta = now - device_link.created_at
        minutes_since_created = time_delta.total_seconds() / 60

        logging.info('**** min since created: ' + str(minutes_since_created))

        if (minutes_since_created > 5):
            self.response.status = 404
            self.response.write('Device link not found')
            return

        if (device_link.frame_key):
            logging.info('linked frame key:' + str(device_link.frame_key))
            frame = device_link.frame_key.get()
            logging.info('linked frame:' + str(frame))
            response = {
                'frame_id': frame.key.id(),
                'access_key': frame.access_key,
                'name': frame.name,
            }
        else:
            response = {}

        self.response.headers['Content-Type'] = 'application/json'
        self.response.out.write(json.dumps(response))

    def post(self):
        ddddebug = ndb.Key('Frame', 6333186975989760)
        device_link = DeviceLink(
                    device_ip = self.request.remote_addr,
                    secret=self.generate_secret(),
                    frame_key=ddddebug
                    )
        device_link.put()

        response = {
            'id': device_link.key.id(),
            'secret': device_link.secret
        }

        logging.info('**** start link')
        logging.info(response)

        self.response.headers['Content-Type'] = 'application/json'
        self.response.out.write(json.dumps(response))

    def generate_secret(self):
        chars = string.ascii_uppercase + string.ascii_lowercase + string.digits
        return ''.join(random.SystemRandom().choice(chars) for _ in range(4))
