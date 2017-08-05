-- Read more about this program in the official Elm guide:
-- https://guide.elm-lang.org/architecture/effects/http.html
module Main exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import RemoteData exposing (WebData)
import Time exposing (Time)

import Msgs exposing (..)
import Commands exposing (getFrameStreams)
import Models exposing (Model, FrameStream, FramePhoto, GetFrameResponse, FrameIdentification, DisplayPhoto)
import Update exposing (update)

main : Program Never Model Msg
main =
  Html.program
    { init = init { frameId = "5634472569470976", accessKey = "BtZifleqeqAetokvKS7Nimjp61Vf9doDZgNnkRvJ" }
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
    [ button [ onClick MorePlease ] [ text "More Please!" ]
    , br [] []
    , img [src "to-be-or-not"] []
    , text (toString (List.map (\x -> { s = x.stream.name, p = x.photo.id }) model.photos))
    , div []
      [ maybePhoto model.currentPhoto ]
--    , maybeResponse model.streams
    ]


maybePhoto : Maybe DisplayPhoto -> Html Msg
maybePhoto maybePhoto =
  case maybePhoto of
    Nothing ->
      text "No picture yet..."

    Just photo ->
      -- URL: '/public/api/frames/' + frameId + '/streams/' + stream.id + '/photos/' + photo.id + '?access_key=' + accessKey,
      div []
      [ text ("/public/api/frames/" ++ photo.frame ++ "/streams/" ++ (toString photo.stream.id) ++ "/photos/" ++ (toString photo.photo.id) ++ "?access_key=" ++ photo.accessKey)
        , img [ src ("/public/api/frames/" ++ photo.frame ++ "/streams/" ++ (toString photo.stream.id) ++ "/photos/" ++ (toString photo.photo.id) ++ "?access_key=" ++ photo.accessKey)
                , height 300
                , width 300] []
      ]

maybeResponse : WebData GetFrameResponse -> Html Msg
maybeResponse response =
    case response of
        RemoteData.NotAsked ->
            text ""

        RemoteData.Loading ->
            text "Loading..."

        RemoteData.Success players ->
            --list players
            text (toString response)

        RemoteData.Failure error ->
            text ("ERROR - " ++ (toString error))

-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
  if List.isEmpty model.photos then
    Sub.none
  else
    Time.every (2 * Time.second) TimerTick
