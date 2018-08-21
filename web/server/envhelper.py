import os

import dangare_secrets

def is_production():
    return os.getenv('SERVER_SOFTWARE', '').startswith('Google App Engine/')
