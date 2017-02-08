#!/usr/bin/env python

import os
import urllib

from google.appengine.api import users
from google.appengine.ext import ndb

import webapp2
import json

import copy

from models import Stream, Photo, Frame
from api.me import MeApi
from api.streams import StreamsApi, StreamApi
from api.photos import PhotosApi, PhotoApi
from api.frames import FramesApi, FrameApi
from api.frame_streams import FrameStreamsApi, FrameStreamApi

app = webapp2.WSGIApplication([
    webapp2.Route(r'/api/streams', StreamsApi),
    webapp2.Route(r'/api/streams/<id>', StreamApi),
    webapp2.Route(r'/api/streams/<stream_id>/photos', PhotosApi),
    webapp2.Route(r'/api/streams/<stream_id>/photos/<photo_id>', PhotoApi),
    webapp2.Route(r'/api/me', MeApi),
    webapp2.Route(r'/api/frames', FramesApi),
    webapp2.Route(r'/api/frames/<id>', FrameApi),
    webapp2.Route(r'/api/frames/<frame_id>/streams', FrameStreamsApi),
    webapp2.Route(r'/api/frames/<frame_id>/streams/<stream_id>', FrameStreamApi),
], debug=True)
