import * as types from './actions';


const initStat = {loaded: false, items: []}

export default function (state = initStat, action) {
    switch (action.type) {
        case types.FRAMES_LOAD_SUCCESS: {
            return Object.assign({}, state, {items: action.payload, loaded: true});
        }
        default: {
            return state;
        }
    }

}
