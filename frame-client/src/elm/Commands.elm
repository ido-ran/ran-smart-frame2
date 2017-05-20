module Commands exposing (..)

import Http
import Json.Decode as Decode
import Json.Decode.Pipeline exposing (decode, required)
import Models exposing (FrameStream, FramePhoto, FrameIdentification)
import RemoteData

import Msgs exposing (Msg)
import Models exposing (GetFrameResponse, FrameStream)

getFrameStreams : FrameIdentification -> Cmd Msg
getFrameStreams frameIdentification =
  Http.get (fetchFrameUrl frameIdentification) frameResponseDecoder
      |> RemoteData.sendRequest
      |> Cmd.map Msgs.OnFetchFrame


fetchFrameUrl : FrameIdentification -> String
fetchFrameUrl frameIdentification =
  let
    url =
      "/public/api/frames/" ++ frameIdentification.frameId ++
        "?access_key=" ++ frameIdentification.accessKey
  in
    url


frameResponseDecoder : Decode.Decoder GetFrameResponse
frameResponseDecoder =
    decode GetFrameResponse
      |> required "streams" frameStreamsDecoder

frameStreamsDecoder : Decode.Decoder (List FrameStream)
frameStreamsDecoder =
    Decode.list sreamDecoder


sreamDecoder : Decode.Decoder FrameStream
sreamDecoder =
  decode FrameStream
      |> required "id" Decode.int
      |> required "name" Decode.string
      |> required "photos" photosDecoder


photosDecoder : Decode.Decoder (List FramePhoto)
photosDecoder =
  Decode.list photoDecoder


photoDecoder : Decode.Decoder FramePhoto
photoDecoder =
  decode FramePhoto
    |> required "id" Decode.int
