import { generateAction } from '../actionGenerators'

export const STREAMS_LOAD_START = 'STREAMS_LOAD_START'
export const STREAMS_LOAD_SUCCESS = 'STREAMS_LOAD_SUCCESS'
export const STREAMS_LOAD_FAIL = 'STREAMS_LOAD_FAIL'

export const STREAM_LOAD_START = 'STREAM_LOAD_START'
export const STREAM_LOAD_SUCCESS = 'STREAM_LOAD_SUCCESS'
export const STREAM_LOAD_FAIL = 'STREAM_LOAD_FAIL'

export const STREAM_PHOTOS_LOADING = 'STREAM_PHOTOS_LOADING'
export const STREAM_PHOTOS_LOAD_SUCCESS = 'STREAM_PHOTOS_LOAD_SUCCESS'
export const STREAM_PHOTOS_LOAD_FAIL = 'STREAM_PHOTOS_LOAD_FAIL'

export const GOOGLE_AUTH_LOAD_START = 'GOOGLE_AUTH_LOAD_START'
export const GOOGLE_AUTH_LOAD_SUCCESS = 'GOOGLE_AUTH_LOAD_SUCCESS'
export const GOOGLE_AUTH_LOAD_FAIL = 'GOOGLE_AUTH_LOAD_FAIL'

export function loadStreams() {
  return generateAction('/api/streams', 
  STREAMS_LOAD_START,
  STREAMS_LOAD_SUCCESS,
  STREAMS_LOAD_FAIL);
}

export function loadStream(streamId) {
  return generateAction(`/api/streams/${streamId}`, 
    STREAM_LOAD_START,
    STREAM_LOAD_SUCCESS,
    STREAM_LOAD_FAIL);
}

export function loadStreamPhotos(streamId) {
  return generateAction(`/api/streams/${streamId}/photos`, 
    STREAM_PHOTOS_LOADING,
    STREAM_PHOTOS_LOAD_SUCCESS,
    STREAM_PHOTOS_LOAD_FAIL);
}

export function loadGoogleAuth() {
  return generateAction('/api/google-auth', 
  GOOGLE_AUTH_LOAD_START,
  GOOGLE_AUTH_LOAD_SUCCESS,
  GOOGLE_AUTH_LOAD_FAIL);
}