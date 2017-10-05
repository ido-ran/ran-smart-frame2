module Update exposing ( update )

import RemoteData exposing (WebData)

import Msgs exposing (..)
import Models exposing (Model, DisplayPhoto, GetFrameResponse, FrameIdentification)
import Commands exposing (getFrameStreams)

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    MorePlease ->
      (model, getFrameStreams model.frameIdentification)


    OnFetchFrame response ->
      ( { model | streams = response, photos = collectPhotos model.frameIdentification response } , Cmd.none)


    TimerTick t ->
      let
        _ = Debug.log "timer" model.currentPhoto
        photos = if 0 == List.length model.nextPhotos then model.photos else model.nextPhotos
        head = List.head photos
        tail = List.tail photos
      in
        ( { model | currentPhoto = head, nextPhotos = getNextPhotos tail }, Cmd.none )

getNextPhotos : Maybe (List DisplayPhoto) -> List DisplayPhoto
getNextPhotos maybePhotos =
  case maybePhotos of
    Nothing ->
      []

    Just photos ->
      photos

collectPhotos : FrameIdentification -> WebData GetFrameResponse -> List DisplayPhoto
collectPhotos frameIdentification response =
    case response of
        RemoteData.NotAsked ->
            []

        RemoteData.Loading ->
            []

        RemoteData.Success frameResponse ->
            --list players
            frameResponse.streams
            |> List.foldl (\stream acc -> acc ++
              List.map (\photo -> {
                stream = stream
                , photo = photo
                , frame = frameIdentification.frameId
                , accessKey = frameIdentification.accessKey }) stream.photos) []

        RemoteData.Failure error ->
            []
