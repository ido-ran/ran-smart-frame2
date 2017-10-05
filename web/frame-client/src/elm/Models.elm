module Models exposing (..)

import RemoteData exposing (WebData)

type alias Model =
  { frameIdentification : FrameIdentification
  , streams : WebData GetFrameResponse
  , photos : List DisplayPhoto
  , currentPhoto : Maybe DisplayPhoto
  , nextPhotos : List DisplayPhoto
  }


type alias FrameId = String


type alias FrameIdentification =
  { frameId : FrameId
  , accessKey : String
  }

type alias FrameStream =
  { id : Int
  , name : String
  , photos : (List FramePhoto)
  }

type alias FramePhoto =
  { id : Int
  }


type alias GetFrameResponse =
  { streams : (List FrameStream)
  }

-- Represent a photo for display at runtime
type alias DisplayPhoto =
  { frame : FrameId
  , stream : FrameStream
  , photo : FramePhoto
  , accessKey : String
  }
