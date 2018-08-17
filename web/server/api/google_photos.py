from datetime import datetime

from apiclient.discovery import build
from oauth2client import client
from httplib2 import Http

class GooglePhotos:
  """
  Wrapper class around Google Photos Library client API.

  See the discovery documents for details: https://www.googleapis.com/discovery/v1/apis/photoslibrary/v1/rest
  """

  def get_service(self, google_auth):
    creds = client.GoogleCredentials(google_auth.access_token, 
        '226657794555-jp7ph38s8rcpqbu4pjepsg24aphp03qd.apps.googleusercontent.com',
        'U_Vg-axeRGFDxTyOXDl6oYeO',
        google_auth.refresh_token,
        datetime.utcnow(),
        'https://www.googleapis.com/oauth2/v4/token',
        'oomkik-1.0')
    service = build('photoslibrary', 'v1', http=creds.authorize(Http()))
    return service

  def get_albums(self, google_auth):
    service = self.get_service(google_auth)

    # Call the Photo v1 API
    results = service.albums().list(
        pageSize=10, fields="nextPageToken,albums(id,title)").execute()
    albums = results.get('albums', [])
    return albums

  def get_album_photos(self, google_auth, album_id):
    service = self.get_service(google_auth)

    # Call the Photo v1 API
    # The search method is expecting a single kwarg name `body`.
    results = service.mediaItems().search(
      body = { 'albumId': album_id }
    ).execute()
    items = results.get('mediaItems', [])
    return items

  def get_album_photo_url(self, google_auth, photo_id):
    service = self.get_service(google_auth)

    # Call the Photo v1 API
    results = service.mediaItems().get(mediaItemId=photo_id).execute()
    items = results.get('baseUrl', '')
    return items
