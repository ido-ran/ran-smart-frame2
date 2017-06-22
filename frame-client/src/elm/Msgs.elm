module Msgs exposing (..)


import Time exposing (Time)
import RemoteData exposing (WebData)

import Models exposing (FrameStream, GetFrameResponse)


type Msg
  = MorePlease
  | OnFetchFrame (WebData GetFrameResponse)
  | TimerTick Time
