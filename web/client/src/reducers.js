import {combineReducers} from "redux";

import streams from './streams/reducer'
import stream from './streams/steramReducer'
import frames from './frames/framesReducer'
import frame from './frames/frameReducer'

const rootReducer = combineReducers({
    streams,
    stream,
    frames,
    frame 
})

export default rootReducer
