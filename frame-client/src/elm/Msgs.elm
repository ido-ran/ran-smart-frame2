module Msgs exposing (..)


import RemoteData exposing (WebData)

import Models exposing (FrameStream, GetFrameResponse)


type Msg
  = MorePlease
  | OnFetchFrame (WebData GetFrameResponse)
