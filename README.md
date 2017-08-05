# Ran-Frame
Digital Picture Frame Platform

## Components

This project is made up of 3 components:
1. Backend written in Python and runs on Google AppEngine
1. Admin interface written in React
1. Frame interface written in Elm

## Development

Run `npm start` to start all the development components require to run this app.

## Build

Gradle is used to build and deploy the project.
Using `gradle deploy` will do everything and deploy the project to Google AppEngine.
`gradle.properties` has the AppEngine project and version to which the project will be deployed to.
