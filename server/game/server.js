/*jslint node: true */
"use strict";

//var util = require('util');
var _ = require('lodash');

var Game = require('./game');

var viewId    = 0,
    playerId  = 1,
    gameId    = 0;

var Server = {
  init: function (io) {
    this.views = {};
    this.games = {};

    this.viewSocket = io.of('/view');
    this.viewSocket.on('connection', this.onViewConnection.bind(this));

    this.playerSocket = io.of('/game');
    this.playerSocket.on('connection', this.onPlayerConnection.bind(this));

    this.addGame();
  },

  addGame: function (opts) {
    opts = opts || {};
    var game = new Game();

    this.game[gameId++] = game;
    this.setupGameListeners(game).call(this);
  },

  setupGameListeners: function (game) {
    game.on('player-spawn', this.playerSpawned.bind(this));
    game.on('player-update', this.playerUpdate.bind(this));
    game.on('player-die', this.playerDie.bind(this));
    game.on('player-score', this.playerScore.bind(this));
    game.on('bomb-explode', this.bombExplode.bind(this));
    game.on('flame-spawn', this.flameSpawn.bind(this));
    game.on('flame-die', this.flameDie.bind(this));
    game.on('game-done', this.gameDone.bind(this));
  },
  
    // View connects the socket, receives inital game information
    // and is subscribed for future updates.
  onViewConnection: function (socket) {
    console.log('view connected');
    this.views[viewId++] = socket;
    
    socket.emit('game-info', { game: this.game.getState() } );

    socket.on('ping', function () { 
      socket.emit('pong');
    }.bind(this) );

    socket.on('disconnect', function () { 
      console.log('disconnect');
      this.views.splice(this.views.indexOf(socket)); 
    }.bind(this) );
    
  },

  onPlayerConnection: function (socket) {
    console.log('player connected');
    var id = -1;
    
    socket.on('join-game', function (data) {
      id = playerId++; 
      console.log('player ' +data.name+ ' joining the game.');
      var player = this.game.addPlayer(_.assign({ id: id }, data));
      socket.emit('joined-game', { player: player });
      this.playerJoined(player);
      this.game.spawnPlayer(player);
    }.bind(this));
    
    socket.on('request-move', function (data) {
      this.game.playerMove(id, data);
    }.bind(this));

    socket.on('stop-move', function () {
      var player = this.game.playerStop(id);
      this.playerUpdate(player);
    }.bind(this));

    socket.on('place-bomb', function () {
      var bomb = this.game.placeBomb(id);
      if(bomb) { this.bombPlaced(bomb); }
    }.bind(this));

    socket.on('disconnect', function () {
      console.log('socket: ' +id+ ' disconnected');
      this.game.removePlayer(id); 
      this.playerLeft(id);
    }.bind(this));
  },

  _viewUpdate: function (event, payload) {
    payload = payload || {};
    _.each(this.views, function (view) {
      view.emit(event, payload);
      if(event !== 'player-update') { console.log("Emitting " +event); }
   });
  },

  playerJoined: function (player) {
    this._viewUpdate('player-join', { player: player});
  },

  playerLeft: function (id) {
    this._viewUpdate('player-leave', { id: id });
  },

  playerSpawned: function (data) {
    this._viewUpdate('player-spawn', { player: data });
  },

  playerUpdate: function (player) {
    this._viewUpdate('player-update', { player: player });
  },

  playerDie: function (player, suicide) {
    this._viewUpdate('player-die', { player: player, suicide: suicide });
  },

  playerScore: function (player) {
    this._viewUpdate('player-score', { player: player });
  },

  bombPlaced: function (bomb) {
    this._viewUpdate('bomb-place', { bomb: bomb });
  },

  bombExplode: function (data) {
    this._viewUpdate('bomb-explode',{ state: data });
  },

  flameSpawn: function (flames) {
    this._viewUpdate('flame-spawn', { flames: flames });
  },

  flameDie: function (flames) {
    this._viewUpdate('flame-die', { flames: flames });
  },

  gameDone: function (player) {
    console.log('game done');
    this._viewUpdate('game-done', { player: player });
  }

};

module.exports = Server;
