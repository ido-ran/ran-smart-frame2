
export const STREAMS_LOAD_SUCCESS = 'STREAMS_LOAD_SUCCESS'
export const STREAMS_LOAD_FAIL = 'STREAMS_LOAD_FAIL'

export const STREAM_LOAD_SUCCESS = 'STREAM_LOAD_SUCCESS'
export const STREAM_LOAD_FAIL = 'STREAM_LOAD_FAIL'

export const STREAM_PHOTOS_LOAD_SUCCESS = 'STREAM_PHOTOS_LOAD_SUCCESS'
export const STREAM_PHOTOS_LOAD_FAIL = 'STREAM_PHOTOS_LOAD_FAIL'

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

function streamLoadSuccess(stream) {
  return {
    type: STREAM_LOAD_SUCCESS,
    payload: stream
  }
}

function streamLoadFail(streamId, error) {
  return {
    type: STREAM_LOAD_FAIL,
    streamId,
    error
  }
}

function streamPhotosLoadSuccess(photos) {
  return {
    type: STREAM_PHOTOS_LOAD_SUCCESS,
    payload: photos
  }
}

function streamPhotosLoadFail(streamId, error) {
  return {
    type: STREAM_PHOTOS_LOAD_FAIL,
    streamId,
    error
  }
}

export function loadStream(streamId) {
  return dispatch => {
    fetch(`/api/streams/${streamId}`, {
      credentials: 'include'
    })
    .then(function(response) {
      var contentType = response.headers.get("content-type")
      if(response.ok && contentType && contentType.indexOf("application/json") !== -1) {
        return response.json().then(function(json) {
          dispatch(streamLoadSuccess(json))
        });
      } else {
        dispatch(streamLoadFail(streamId))
      }
    })
    .catch(error => dispatch(streamLoadFail(streamId, error)))
  }
}

export function loadStreamPhotos(streamId) {
  return dispatch => {
    fetch(`/api/streams/${streamId}/photos?include_thumbnail=true`, {
      credentials: 'include'
    })
    .then(function(response) {
      var contentType = response.headers.get("content-type")
      if(response.ok && contentType && contentType.indexOf("application/json") !== -1) {
        return response.json().then(function(json) {
          dispatch(streamPhotosLoadSuccess(json))
        });
      } else {
        dispatch(streamPhotosLoadFail(streamId))
      }
    })
    .catch(error => dispatch(streamPhotosLoadFail(streamId, error)))
  }
}
