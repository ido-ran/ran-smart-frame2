import logging

from datetime import datetime

from apiclient.discovery import build
from oauth2client import client
from httplib2 import Http

import params

logger = logging.getLogger(__name__)

class GooglePhotos:
  """
  Wrapper class around Google Photos Library client API.

  See the discovery documents for details: https://www.googleapis.com/discovery/v1/apis/photoslibrary/v1/rest
  """

  def __init__(self, google_auth):
    self.google_auth = google_auth
    self.service = self.get_service()

  def get_service(self):
    creds = client.GoogleCredentials(self.google_auth.access_token, 
        params.oauth_client_id(),
        params.oatuh_client_secret(),
        self.google_auth.refresh_token,
        datetime.utcnow(),
        'https://www.googleapis.com/oauth2/v4/token',
        'oomkik-1.0')
    service = build('photoslibrary', 'v1', http=creds.authorize(Http()))
    return service

  def get_albums(self):
    # Call the Photo v1 API
    results = self.service.albums().list(
        pageSize=10, fields="nextPageToken,albums(id,title)").execute()
    albums = results.get('albums', [])
    return albums

  def get_album_photos(self, album_id, max_pages):
    # Call the Photo v1 API
    # The search method is expecting a single kwarg name `body`.
    logger.info('Requesting Google Photos Album. albumId: %s', album_id)

    photos = []
    page_token = ''
    pages_fetched = 0

    while pages_fetched == 0 or (page_token != '' and pages_fetched < max_pages):

      logger.info('Requesting Google Photos Album. albumId: %s PageIndex: %d', album_id, pages_fetched)

      results = self.service.mediaItems().search(
        body = { 
          'albumId': album_id,
          'pageSize': 100, # request for the maximum of 100 photos per request
          'pageToken': page_token,
        }
      ).execute()

      items = results.get('mediaItems', [])
      photos.extend(items)

      # If we have nextPageToken we'll fetch it according to the max pages we are allowed to fetch
      page_token = results.get('nextPageToken')
      pages_fetched += 1

    return photos

  def get_album_photo_url(self, photo_id):
    # Call the Photo v1 API
    results = self.service.mediaItems().get(mediaItemId=photo_id).execute()
    items = results.get('baseUrl', '')
    return items
