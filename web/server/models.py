from datetime import datetime

from google.appengine.ext import ndb
from google.appengine.api import users

class Photo(ndb.Model):
    """Model a single photo in a stream"""
    name = ndb.StringProperty(indexed=False)
    created_by_user_id = ndb.StringProperty(indexed=True)
    created_at = ndb.DateTimeProperty(auto_now_add=True)
    sha256 = ndb.StringProperty(indexed=False)

    def serialize(self):
        return {
            'id': self.key.id()
        }

class GoogleAuth(ndb.Model):
    """Model an authentication with Google OAuth2"""
    external_user_id = ndb.StringProperty(indexed=True)
    user_id = ndb.StringProperty(indexed=True)
    last_email = ndb.StringProperty(indexed=False)
    access_token = ndb.StringProperty(indexed=False)
    refresh_token = ndb.StringProperty(indexed=False)
    created_at = ndb.DateTimeProperty(auto_now_add=True)
    updated_at = ndb.DateTimeProperty(auto_now=True)

    @classmethod
    def get_by_user_and_external_user(cls, user_id, external_user_id):
        return cls.query().filter(cls.user_id == user_id and cls.external_user_id == external_user_id).get()

    @classmethod
    def query_by_user_id(cls, user_id):
        return cls.query().filter(cls.user_id == user_id)

class Stream(ndb.Model):
    """Model a photo stream"""
    name = ndb.StringProperty(indexed=False)
    created_by_user_id = ndb.StringProperty()
    created_at = ndb.DateTimeProperty(auto_now_add=True)
    updated_at = ndb.DateTimeProperty(auto_now=True)
    type = ndb.StringProperty(indexed=False, default='files')
    google_auth_key = ndb.KeyProperty(kind=GoogleAuth)
    google_album_id = ndb.StringProperty(indexed=False, default='')

    @classmethod
    def query_by_owner(cls, user_id):
        return cls.query(cls.created_by_user_id == user_id).order(-cls.updated_at)

    def serialize(self):
        return {
            'id': self.key.id(),
            'name': self.name,
            'created_by_user_id': self.created_by_user_id,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
        }

class Frame(ndb.Model):
    """Model a digital frame"""
    name = ndb.StringProperty(indexed=False)
    created_by_user_id = ndb.StringProperty(indexed=True)
    created_at = ndb.DateTimeProperty(auto_now_add=True)
    updated_at = ndb.DateTimeProperty(auto_now=True)
    streams = ndb.KeyProperty(kind=Stream, repeated=True)
    access_key = ndb.StringProperty(indexed=True)

    @classmethod
    def query_by_owner(cls, user_id):
        return cls.query(cls.created_by_user_id == user_id).order(-cls.updated_at)

    def serialize(self):
        return {
            'id': self.key.id(),
            'name': self.name,
            'access_key': self.access_key
        }
    
    def current_user_has_access(self):
        """ Check if the current user has access to this frame """
        current_user_id = users.get_current_user().user_id()
        return self.created_by_user_id == current_user_id


class DeviceLink(ndb.Model):
    """Model the information for the process to link a device to a frame"""
    device_ip = ndb.StringProperty(indexed=False)
    secret = ndb.StringProperty(indexed=True)
    created_at = ndb.DateTimeProperty(auto_now_add=True)
    updated_at = ndb.DateTimeProperty(auto_now=True)
    frame_key = ndb.KeyProperty(kind=Frame)

    @classmethod
    def get_by_secret(cls, secret):
        """ Get (if exists) the latest DeviceLink matching the secret that is valid """
        candidate = cls.query().filter(cls.secret == secret).order(-cls.created_at).get()
        if candidate and not candidate.is_valid_to_link():
            candidate = None
        
        return candidate

    def is_valid_to_link(self):
        """ Check if this DeviceLink valid to link a frame to """
        
        # If this DeviceLink is already linked, it is not valid for linking...
        if (self.frame_key):
            return False

        return not self.is_time_valid()

    def is_time_valid(self):
        """ Check if this DeviceLink is still valid """
        now = datetime.now()
        time_delta = now - self.created_at
        minutes_since_created = time_delta.total_seconds() / 60

        return (minutes_since_created < 5)
