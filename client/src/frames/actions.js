
export const FRAMES_LOAD_SUCCESS = 'FRAMES_LOAD_SUCCESS'
export const FRAMEMS_LOAD_FAIL = 'FRAMEMS_LOAD_FAIL'

function framesLoadSuccess(frames) {
  return {
    type: FRAMES_LOAD_SUCCESS,
    payload: frames
  }
}

function framesLoadFail(error) {
  return {
    type: FRAMEMS_LOAD_FAIL,
    error
  }
}

export function loadFrames() {
  return dispatch => {
    fetch('/api/frames', {
      credentials: 'include'
    })
    .then(function(response) {
      var contentType = response.headers.get("content-type")
      if(response.ok && contentType && contentType.indexOf("application/json") !== -1) {
        return response.json().then(function(json) {
          dispatch(framesLoadSuccess(json))
        });
      } else {
        dispatch(framesLoadFail())
      }
    })
    .catch(error => dispatch(framesLoadFail(error)))
  }
}
