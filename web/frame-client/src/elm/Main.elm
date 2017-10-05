-- Read more about this program in the official Elm guide:
-- https://guide.elm-lang.org/architecture/effects/http.html
module Main exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)
import RemoteData exposing (WebData)
import Time exposing (Time)

import Msgs exposing (..)
import Commands exposing (getFrameStreams)
import Models exposing (Model, FrameStream, FramePhoto, GetFrameResponse, FrameIdentification, DisplayPhoto)
import Update exposing (update)

main : Program FrameIdentification Model Msg
main =
  Html.programWithFlags
    { init = init
    , view = view
    , update = update
    , subscriptions = subscriptions
    }


init : FrameIdentification -> (Model, Cmd Msg)
init frameIdentification =
  ( Model frameIdentification RemoteData.NotAsked [] Nothing []
  , getFrameStreams frameIdentification
  )


-- VIEW


view : Model -> Html Msg
view model =
  div []
    [ maybePhoto model.currentPhoto
    ]


maybePhoto : Maybe DisplayPhoto -> Html Msg
maybePhoto maybePhoto =
  case maybePhoto of
    Nothing ->
      text "Loading..."

    Just photo ->
      div []
      [ img [ src ("/public/api/frames/" ++ photo.frame ++ "/streams/" ++ (toString photo.stream.id) ++ "/photos/" ++ (toString photo.photo.id) ++ "?access_key=" ++ photo.accessKey)
            , class "main-image"
            , height 300
            , width 300] []
      ]

-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
  if List.isEmpty model.photos then
    Sub.none
  else
    Time.every (2 * Time.second) TimerTick
