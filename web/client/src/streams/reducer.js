import * as types from './actions';


const initStat = {
    loaded: false, items: [],
    googleAuthLoaded: false, googleAuth: []
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
        default: {
            return state;
        }
    }

}
