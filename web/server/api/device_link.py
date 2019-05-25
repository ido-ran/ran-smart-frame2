import webapp2
import json
import string
import random
import logging
from datetime import datetime

from google.appengine.ext import ndb
from google.appengine.api import users

from serializers import default_json_serializer, clone_for_json

from models import DeviceLink

class DeviceLinkStart(webapp2.RequestHandler):
    """DeviceLinkStart manages starting a device link from a device

    See `Device Link diagram <../../docs/link-device-to-frame.md>`_ for more details about device linking.
    """

    def get(self, link_id):
        link_key = ndb.Key(DeviceLink, int(link_id))
        device_link = link_key.get()

        # If the device link was created more than 5 minutes ago, ignore this call
        if (not device_link or not device_link.is_time_valid()):
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
        device_link = DeviceLink(
                    device_ip = self.request.remote_addr,
                    secret=self.generate_secret(),
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

class DeviceLinkAdmin(webapp2.RequestHandler):
    """ Manage connecting a frame to a device from the admin console"""

    def post(self, frame_id):
        # Get the secret to match for the device link
        secret = self.request.get('secret')
        if (not secret):
            self.response.status = 400
            self.response.write('Device link secret is required')
            return

        frame_key = ndb.Key('Frame', int(frame_id))
        frame = frame_key.get()

        if (not frame.current_user_has_access()):
            logging.warn('The user {user} tried to link device to the frame {frame} which he/she do not have access'.format(
                user=users.get_current_user().user_id(),
                frame=frame.key.id()
            ))
            self.response.status = 404
            self.response.write('Frame not found')
            return

        device_link = DeviceLink.get_by_secret(secret)
        if (not device_link):
            logging.info('The user {user} tried to link a device but no DeviceLink was found for the secret specified'.format(
                user=users.get_current_user().user_id(),
            ))
            self.response.status = 404
            self.response.write('No frame match your secret')
            return

        # we have the frame and device to link
        device_link.frame_key = frame_key
        device_link.put()
        self.response.write('ok')
