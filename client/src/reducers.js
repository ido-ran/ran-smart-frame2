import {combineReducers} from "redux";

import streams from './streams/reducer'

const rootReducer = combineReducers({
    streams
})

export default rootReducer
