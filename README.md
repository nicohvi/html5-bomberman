# Socketman

He's out there, all alone.

## Stack
An express app is running on port 8080, and has an open
socket.io connection on that port. Client players can connect
using the `/game` endpoint, while views can connect using the
`/view` endpoint.

The clients are written using ES6-syntax by leveraging babel, and the actual game board is a simple canvas. There's also a React component rendering the leaderboard.

To run the server, `cd` into the `server` directory and run `npm start`. The server also uses ES6-syntax and uses [iojs]() to achieve this. 

The view code uses [browserify]() to manage its dependencies, and to start the [watchify]() process to automatically transpile the view-code you need to `cd` into the `public` directory and run `npm run view`.

There's also a dummy implementation of a player which can be transpiled using `npm run player`.

## Architecture

In order to facilitate differnt kinds of controls the players are given a basic API which they can send to the server (which acts as the single source of truth).

The game state is passed to the views, and the clients (ATOW) only receive verification for whether or not their moves were permitted. Thus no client side
prediction is possible ATOW which means the game will be rather laggy unless you're running it on a local server.

## Development

`npm install --save-dev`

## How do I run it?

`node index.js` fires up the server running on port 3000 (hey, rails is cool - shut up). The server offers endpoints
for players and views. If you want to connect as a player you need to connect to the `/player` endpoint (which setups a 
websockets connection), otherwise connect to the `/board` endpoint to get a lovely view of the current game board.
