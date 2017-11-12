import * as types from './actions';


const initStat = {
  loaded: false, item: {},
  photosLoaded: false, photos:[]
}

export default function (state = initStat, action) {
    switch (action.type) {
        case types.STREAM_LOAD_SUCCESS: {
            return Object.assign({}, state, {item: action.payload, loaded: true});
        }
        case types.STREAM_PHOTOS_LOADING: {
          return Object.assign({}, state, { photosLoaded: false });
        }
        case types.STREAM_PHOTOS_LOAD_SUCCESS: {
            return Object.assign({}, state, {photos: action.payload, photosLoaded: true});
        }
        default: {
            return state;
        }
    }

}
