from google.appengine.ext import ndb

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

    @classmethod
    def query_by_owner(cls, user_id):
        return cls.query(cls.created_by_user_id == user_id).order(-cls.updated_at)

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
