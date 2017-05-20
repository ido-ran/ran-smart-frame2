-- Read more about this program in the official Elm guide:
-- https://guide.elm-lang.org/architecture/effects/http.html
module Main exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import RemoteData exposing (WebData)

import Msgs exposing (..)
import Commands exposing (getFrameStreams)
import Models exposing (Model, FrameStream, FramePhoto, GetFrameResponse, FrameIdentification)
import Update exposing (update)

main : Program Never Model Msg
main =
  Html.program
    { init = init { frameId = "4974396762488832", accessKey = "m7lzHcgdB9BVZyKg4PuDFkStP8QVfvzSDIfZpEfb" }
    , view = view
    , update = update
    , subscriptions = subscriptions
    }


init : FrameIdentification -> (Model, Cmd Msg)
init frameIdentification =
  ( Model frameIdentification RemoteData.NotAsked []
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
--    , maybeResponse model.streams
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
  Sub.none
