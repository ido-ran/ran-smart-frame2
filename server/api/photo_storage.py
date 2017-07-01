import logging
import os
import logging

from google.appengine.api import app_identity

import cloudstorage as gcs

from models import Photo

def read_photo_from_storage(photo, response):
    bucket_name = os.environ.get('BUCKET_NAME',
                                 app_identity.get_default_gcs_bucket_name())

    filename = "/{0}/pics/{1:x}.png".format(bucket_name, photo.crc32c)

    try:
        file_stat = gcs.stat(filename)
        gcs_file = gcs.open(filename)
        response.headers['Content-Type'] = file_stat.content_type
        response.headers['Cache-Control'] = 'private, max-age=31536000' # cache for upto 1 year
        response.headers['ETag'] = file_stat.etag
        response.write(gcs_file.read())
        gcs_file.close()

    except gcs.NotFoundError:
        logging.exception("Fail to read photo file")
        response.status = 404
        response.write('photo file not found')
