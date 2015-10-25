"use strict";

const _ = require('lodash'),
      Game = require('./game');

let views = {},
    viewSocket = null,
    playerSocket = null,
    viewId = 1,
    playerId = viewId;

let Server = {
  init (io) {

    io.set('log level', 1);

    viewSocket = io.of('/view');
    viewSocket.on('connection', this.onViewConnection.bind(this));

    playerSocket = io.of('/game');
    playerSocket.on('connection', this.onPlayerConnection.bind(this));
   
    Game.setup();
    this.setupGameListeners();
  },

  setupGameListeners: function () {
    Game.onMany(['game', 'player', 'bomb', 'flame', 'map', 'pong'],
      this.viewUpdate.bind(this));
  },
  
  onViewConnection: function (socket) {
    console.log('view connected');

    let id = viewId++;
    views[id] = socket;

    socket.emit('init', { game: game.state() } );

    socket.on('disconnect', () => { 
      console.log('disconnect');
      delete views[id];
    });

    socket.on('start-round', game.startRound);
    socket.on('end-round', game.endRound); 
    socket.on('reset', () => {
      game.reset();
      socket.emit('init', { game: game.state() });
    });
  },

  onPlayerConnection: function (socket) {
    console.log('player connected');
    let id = -1;
    
    socket.on('join-game', data => {
      id = playerId++; 
      game.player(_.assign({ id: id }, data), 'ADD');
    });
    
    socket.on('request-move', data => {
      game.player(_.assign({ id: id }, data), 'MOV');
    });

    socket.on('stop-move', () => {
      game.player({ id: id }, 'STP');
    });

    socket.on('place-bomb', () => {
      game.player({ id: id }, 'BMB');
    });

    socket.on('disconnect', () => {
      game.player({ id: id }, 'DEL');
    });
  },

  viewUpdate: function (event, payload) {
    if(payload.action !== 'update')
      console.log('called event: ' +event);
    _.forEach(views, function (view) {
      view.emit(event, payload);
   });
  },

};

module.exports = Server;
