#!/usr/bin/env python

import os
import urllib

from google.appengine.api import users

import webapp2
import json

import copy

from models import Stream, Photo, Frame
from api.me import MeApi
from api.streams import StreamsApi, StreamApi
from api.photos import PhotosApi, PhotoApi
from api.frames import FramesApi, FrameApi
from api.frame_streams import FrameStreamsApi, FrameStreamApi
from api.public import PublicApi, PublicPhotoApi
from auth import GoogleAuthHandler
from api.google_auth_api import GoogleAuthApi
from api.google_albums_api import GoogleAlbumsApi
from api.datastore_upgrade import DatastoreUpgrade
from api.google_oauth_endpoint import GoogleOAuthEndpointApi
from api.device_link import DeviceLinkAdmin

app = webapp2.WSGIApplication([

    webapp2.Route(r'/auth/google-auth-callback', GoogleAuthHandler),
    webapp2.Route(r'/api/google-auth', GoogleAuthApi),
    webapp2.Route(r'/api/google-auth/endpoint', GoogleOAuthEndpointApi),
    webapp2.Route(r'/api/google-albums/<external_user_id>', GoogleAlbumsApi),

    webapp2.Route(r'/api/streams', StreamsApi),
    webapp2.Route(r'/api/streams/<id>', StreamApi),
    webapp2.Route(r'/api/streams/<stream_id>/photos', PhotosApi),
    webapp2.Route(r'/api/streams/<stream_id>/photos/<photo_id>', PhotoApi),
    webapp2.Route(r'/api/streams/<stream_id>/photos/<photo_id>/<photo_label>', PhotoApi),

    webapp2.Route(r'/api/me', MeApi),
    
    webapp2.Route(r'/api/frames', FramesApi),
    webapp2.Route(r'/api/frames/<id>', FrameApi),
    webapp2.Route(r'/api/frames/<frame_id>/streams', FrameStreamsApi),
    webapp2.Route(r'/api/frames/<frame_id>/streams/<stream_id>', FrameStreamApi),

    webapp2.Route(r'/public/api/frames/<id>', PublicApi),
    webapp2.Route(r'/public/api/frames/<frame_id>/streams/<stream_id>/photos/<photo_id>', PublicPhotoApi),

    # This route is part of DeviceLink process. This route is used by the admin console
    # after selecting a specific frame to link to a device and enter the secret presented
    # on the device.
    webapp2.Route(r'/api/frames/<frame_id>/link-device', DeviceLinkAdmin),    

    # Management
    webapp2.Route(r'/mgmt/upgrade/0001/stream-type', DatastoreUpgrade),

], debug=True)
