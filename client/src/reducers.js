import {combineReducers} from "redux";

import streams from './streams/reducer'
import stream from './streams/steramReducer'
import frames from './frames/framesReducer'

const rootReducer = combineReducers({
    streams,
    stream,
    frames
})

export default rootReducer
