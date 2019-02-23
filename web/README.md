# Oomkik Android App

This part of the repository contains several web apps of Oomkik.

## Dev Setup

1. [Python 2.7](https://cloud.google.com/python/setup#windows) - Follow the instructions for installing Python for Google Cloud SDK. I've installed only 2.7 version without 3.
1. [Google Cloud SDK](https://cloud.google.com/sdk/)
1. [NodeJS](https://nodejs.org/en/) - LTS version
1. Gradle will download itself when used so no setup is required
1. [VS Code](https://code.visualstudio.com/) is recommended IDE
1. Run `npm install` once in `web` to install development dependencies
1. Run `graldew build` to see everything is building successfully. First run will take long time because it will download all depndencies of all projects.

### dangare_secrets.py

There are some credentials required for the app to operate, such as Google Photos OAuth credentials.  
We do not store them as part of the source control, and we put them in a file that is intentionally ignored by git.  
You'll need to manually create the file `server\dangare_secrets.py` and populate it with values obtained from [Google API & Servcies > Credentials page](https://console.cloud.google.com/apis/credentials).

```
OAUTH_CLIENT_ID="client-id"
OAUTH_CLIENT_SECRET="some-secret"
````

This file can be any Python code you want, it just needs to set those two variables.

# Development

## Run
Use the following commands for development:

> npm start

will run both `server` and `client` projects.

> gradlew build

will build all the projects

> gradlew deploy

Deploy everything to AppEngine

## Important URLs

> http://localhost:8000

App Engine Dev Server admin console.  
This include the Data Store admin which is very useful to see and edit data.

> http://localhost:8080/

App Engine Dev Server.  
This is important to simulate login. The WebPack will not prompt for login so you'll have to manually login once in every development session.

> http://localhost:3000

WebPack Dev Server. 
This is the frontend dev-server which you'll use most of the time (except for login).