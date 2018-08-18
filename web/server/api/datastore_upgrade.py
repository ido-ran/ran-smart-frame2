import webapp2
import json

from google.appengine.ext import ndb

from models import Stream

class DatastoreUpgrade(webapp2.RequestHandler):

    def get(self):
      streams = Stream.query()
      to_put = []

      for stream in streams:
        if (not stream.type):
          stream.type = 'files'
          to_put.append(stream)
      
      if (to_put):
        ndb.put_multi(to_put)
        self.response.out.write("update type to files for " + str(len(to_put)) + " stream")
      else:
        self.response.out.write("No stream updated, all streams had type property set")
