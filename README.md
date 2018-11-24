# The Stranded 2 [![Build Status](https://travis-ci.org/jonathanballs/thestranded2.svg?branch=master)](https://travis-ci.org/jonathanballs/thestranded2.ts)

## Getting started
* `yarn install`: to install dependencies
* `yarn build`: to compile the client and server to javascript
* `yarn start`: to start the server

## All commands
All of the run-scripts have a "watch mode" which reruns the command when files change.

* `yarn run build`: Compiles the frontend and backend
* `yarn run build:watch`: in watch mode
* `yarn run start`: Starts the server
* `yarn run start:watch`: in watch mode
* `yarn run test`: Runs the jest test suite
* `yarn run test:watch`: in watch mode

## Environment variables

* `PORT`: The port on which the project is served. Default is 8081

## Setting up dokku
The repo can be deployed immediately to a dokku container however extra steps must be taken to implement continuous integration.

