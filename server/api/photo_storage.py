import logging
import os
import logging
import urllib

from google.appengine.api import app_identity

import cloudstorage as gcs

from models import Photo

def read_photo_from_storage(photo, label, response):
    bucket_name = os.environ.get('BUCKET_NAME',
                                 app_identity.get_default_gcs_bucket_name())

    filename = format_photo_file_name(bucket_name, photo.created_by_user_id, photo.crc32c, label)

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

def write_photo_to_storage(user_id, checksum, label, file_type, image_content):
    bucket_name = os.environ.get('BUCKET_NAME',
                                 app_identity.get_default_gcs_bucket_name())

    filename = format_photo_file_name(bucket_name, user_id, checksum, label)

    write_retry_params = gcs.RetryParams(backoff_factor=1.1)
    gcs_file = gcs.open(filename,
                        'w',
                        content_type=file_type,
                        options={'x-goog-meta-crc32c': "{0:x}".format(checksum)},
                        retry_params=write_retry_params)
    gcs_file.write(image_content)
    gcs_file.close()

def format_photo_file_name(bucket_name, user_id, checksum, label):
    return urllib.quote("/{0}/pics/{1}/{2:x}_{3}.png".format(bucket_name, user_id, checksum, label))
