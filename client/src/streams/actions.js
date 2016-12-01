
export const STREAMS_LOAD_SUCCESS = 'STREAMS_LOAD_SUCCESS'
export const STREAMS_LOAD_FAIL = 'STREAMS_LOAD_FAIL'

function streamsLoadSuccess(streams) {
  return {
    type: STREAMS_LOAD_SUCCESS,
    payload: streams
  }
}

function streamsLoadFail(error) {
  return {
    type: STREAMS_LOAD_FAIL,
    error
  }
}

export function loadStreams() {
  return dispatch => {
    fetch('/api/streams', {
      credentials: 'include'
    })
    .then(function(response) {
      var contentType = response.headers.get("content-type")
      if(response.ok && contentType && contentType.indexOf("application/json") !== -1) {
        return response.json().then(function(json) {
          dispatch(streamsLoadSuccess(json))
        });
      } else {
        dispatch(streamsLoadFail())
      }
    })
    .catch(error => dispatch(streamsLoadFail(error)))
  }
}
