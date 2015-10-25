"use strict";

const server = require('./server'),
      socketServer = require('./socketServer'),
      game = require('./src/game/server'),
      port = 3000;

server.get('/board', 'board');

server.listen(port);
let io = socketServer.listen(server.httpServer);

game.init(io);
