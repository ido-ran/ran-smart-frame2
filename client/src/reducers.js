import {combineReducers} from "redux";

import streams from './streams/reducer'
import stream from './streams/steramReducer'

const rootReducer = combineReducers({
    streams,
    stream
})

export default rootReducer
