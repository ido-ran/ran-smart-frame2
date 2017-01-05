import * as types from './actions';


const initStat = {
  loaded: false,
  item: {}
}

export default function (state = initStat, action) {
    switch (action.type) {
        case types.FRAME_LOAD_SUCCESS: {
            return Object.assign({}, state, {item: action.payload, loaded: true});
        }
        default: {
            return state;
        }
    }

}
