#!/usr/bin/env python

import os
import urllib

from google.appengine.api import users

import webapp2
import json

import copy

from models import Stream, Photo, Frame
from api.public import PublicApi, PublicPhotoApi
from api.device_link import DeviceLinkStart

app = webapp2.WSGIApplication([

    webapp2.Route(r'/public/api/frames/<id>', PublicApi),
    webapp2.Route(r'/public/api/frames/<frame_id>/streams/<stream_id>/photos/<photo_id>', PublicPhotoApi),
    
    # Route to start the linking process between a device and a frame.
    webapp2.Route(r'/public/api/link/start', DeviceLinkStart),
    webapp2.Route(r'/public/api/link/start/<link_id>', DeviceLinkStart),

], debug=True)
