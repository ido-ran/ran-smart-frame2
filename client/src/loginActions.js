
export const GET_LOGIN_SUCCESS = 'GET_LOGIN_SUCCESS'
export const GET_LOGIN_FAIL = 'GET_LOGIN_FAIL'

function getUserInfoError(error) {
  return {
    type: GET_LOGIN_FAIL,
    error
  }
}

export function getUserInfo() {
  return dispatch => {
    fetch('/api/me', {
      credentials: 'include'
    })
    .then(function(response) {
      var contentType = response.headers.get("content-type")
      if(response.ok && contentType && contentType.indexOf("application/json") !== -1) {
        return response.json().then(function(json) {
          dispatch({
            type: GET_LOGIN_SUCCESS,
            me: json
          })
        });
      } else {
        dispatch(getUserInfoError())
      }
    })
    .catch(error => dispatch(getUserInfoError(error)))
  }
}
