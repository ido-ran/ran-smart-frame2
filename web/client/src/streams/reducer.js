import * as types from './actions';


const initStat = {
    loaded: false, items: [],
    googleAuthLoaded: false, googleAuth: [],
    googlePhotoAlbumsLoaded: false, googlePhotoAlbums: []
}

export default function (state = initStat, action) {
    switch (action.type) {
        case types.STREAMS_LOAD_SUCCESS: {
            return Object.assign({}, state, {items: action.payload, loaded: true});
        }
        case types.GOOGLE_AUTH_LOAD_SUCCESS: {
            return Object.assign({}, state, {
                googleAuthLoaded: true,
                googleAuth: action.payload
            })
        }
        case types.GOOGLE_ALBUMS_LOAD_SUCCESS: {
            return Object.assign({}, state, {
                googlePhotoAlbumsLoaded: true,
                googlePhotoAlbums: action.payload
            })
        }
        case types.GOOGLE_OAUTH_ENDPOINT_LOAD_SUCCESS: {
            return Object.assign({}, state, {
                googleOAuthEndpointLoaded: true,
                googleOAuthEndpoint: action.payload
            })
        }
        default: {
            return state;
        }
    }

}
