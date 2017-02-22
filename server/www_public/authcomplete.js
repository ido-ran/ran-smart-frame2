var accessToken;
var parts = location.search.substring(1).split('&');

    for (var i = 0; i < parts.length; i++) {
        var nv = parts[i].split('=');
        if (!nv[0]) continue;
        if (nv[0] == 'accesstoken') {
          accessToken = nv[1];
          break;
        }
    }

if (!accessToken) {
  location = '/'
} else {
  localStorage.setItem("accessToken", accessToken);
  location = '/app/index.html'
}
