import os

import dangare_secrets

def is_production():
    return os.getenv('SERVER_SOFTWARE', '').startswith('Google App Engine/')

def oauth_client_id():
    return dangare_secrets.OAUTH_CLIENT_ID

def oatuh_client_secret():
    return dangare_secrets.OAUTH_CLIENT_SECRET

def oauth_redirect_url(request):
    if (is_production()):
        return '{}/auth/google-auth-callback'.format(request.application_url)
    else:
        host_only = request.host_url[:request.host_url.rfind(':')]
        return '{}:8080/auth/google-auth-callback'.format(host_only)