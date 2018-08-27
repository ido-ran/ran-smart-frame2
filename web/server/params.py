import dangare_secrets
import envhelper

def oauth_client_id():
    return dangare_secrets.OAUTH_CLIENT_ID

def oatuh_client_secret():
    return dangare_secrets.OAUTH_CLIENT_SECRET

def app_frontend_base_url(request):
    """ Get the application frontend url """
    if (envhelper.is_production()):
        return request.application_url
    else:
        host_only = request.host_url[:request.host_url.rfind(':')]
        return '{}:3000'.format(host_only)

def oauth_redirect_url(request):
    if (envhelper.is_production()):
        return '{}/auth/google-auth-callback'.format(request.application_url)
    else:
        host_only = request.host_url[:request.host_url.rfind(':')]
        return '{}:8080/auth/google-auth-callback'.format(host_only)