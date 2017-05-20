module Update exposing ( update )

import RemoteData exposing (WebData)

import Msgs exposing (..)
import Models exposing (Model, DisplayPhoto, GetFrameResponse)
import Commands exposing (getFrameStreams)

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    MorePlease ->
      (model, getFrameStreams model.frameIdentification)

    -- NewGif (Ok newUrl) ->
    --   (Model model.topic newUrl, Cmd.none)
    --
    -- NewGif (Err _) ->
    --   (model, Cmd.none)

    OnFetchFrame response ->
      ( { model | streams = response, photos = collectPhotos response } , Cmd.none)


collectPhotos : WebData GetFrameResponse -> List DisplayPhoto
collectPhotos response =
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
                , frame = 72
                , accessKey = "lets find where" }) stream.photos) []

        RemoteData.Failure error ->
            []
