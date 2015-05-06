/*jslint node: true */
"use strict";

let _ = require('lodash');
let Game  = require('./game');
let viewId    = 0,
    playerId  = 1;

let Server = {
  init: function (io) {
    this.views = {};

    io.set('log level', 1);

    this.viewSocket = io.of('/view');
    this.viewSocket.on('connection', this.onViewConnection.bind(this));

    this.playerSocket = io.of('/game');
    this.playerSocket.on('connection', this.onPlayerConnection.bind(this));
    
    this.game = Game();
    this.setupGameListeners.call(this);

    return this;
  },

  setupGameListeners: function () {
    this.game.onMany( 
      [ 'player-join', 'player-spawn', 'player-update', 
        'player-die', 'bomb-place', 'bomb-explode', 
        'flames-spawn', 'map-update', 'player-score',
        'flames-die', 'game-over', 'player-leave'],
      this.viewUpdate.bind(this));
  },
  
  onViewConnection: function (socket) {
    console.log('view connected');
    let id = viewId++;
    this.views[id] = socket;
    
    socket.emit('game-info', { game: this.game.state() } );

    socket.on('disconnect', function () { 
      console.log('disconnect');
      delete this.views[id];
    }.bind(this) );
    
  },

  onPlayerConnection: function (socket) {
    console.log('player connected');
    let id = -1;
    
    socket.on('join-game', function (data) {
      id = playerId++; 
      console.log('player ' +data.name+ ' joining the game with id: '+ id);
      this.game.addPlayer(_.assign({ id: id }, data));
      socket.emit('joined-game', { id: id });
    }.bind(this));
    
    socket.on('request-move', function (data) {
      this.game.movePlayer(_.assign({ id: id }, data));
    }.bind(this));

    socket.on('stop-move', function () {
      this.game.stopPlayer(id);
    }.bind(this));

    socket.on('place-bomb', function () {
      this.game.placeBomb(id);
    }.bind(this));

    socket.on('disconnect', function () {
      console.log('socket: ' +id+ ' disconnected');
      this.game.removePlayer(id); 
    }.bind(this));
  },

  viewUpdate: function (event, payload) {
    if(event !== 'player-update') {
      console.log('called event: ' +event);
    }
    _.forEach(this.views, function (view) {
      view.emit(event, payload);
   });
  },

};

module.exports = Server;
