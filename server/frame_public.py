#!/usr/bin/env python

import os
import urllib

from google.appengine.api import users

import webapp2
import json

import copy

from models import Stream, Photo, Frame
from api.public import PublicApi, PublicPhotoApi

app = webapp2.WSGIApplication([

    webapp2.Route(r'/public/api/frames/<id>', PublicApi),
    webapp2.Route(r'/public/api/frames/<frame_id>/streams/<stream_id>/photos/<photo_id>', PublicPhotoApi),

], debug=True)
