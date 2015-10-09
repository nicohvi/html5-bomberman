/*jshint browserify: true */
"use strict";

const io  = require('socket.io-client'),
  Game    = require('./Game'),
  $       = require('jquery');

let GameManager = {

  init: function () {
    this.socket = io.connect('/view'); 
    this.setupListeners.call(this);
  },

  setupListeners: function() {
    this.socket.on('game-info', this.onGameInfo.bind(this));
    this.socket.on('player-join', this.onPlayerJoin.bind(this));
    this.socket.on('player-leave', this.onPlayerLeave.bind(this));
    this.socket.on('player-spawn', this.onPlayerSpawn.bind(this));
    this.socket.on('player-update', this.onPlayerUpdate.bind(this));
    this.socket.on('player-die', this.onPlayerDie.bind(this));
    this.socket.on('player-score', this.onPlayerScore.bind(this));
    this.socket.on('bomb-place', this.onBombPlace.bind(this));
    this.socket.on('bomb-explode', this.onBombExplode.bind(this));
    this.socket.on('map-update', this.onMapUpdate.bind(this));
    this.socket.on('flames-spawn', this.onFlamesSpawn.bind(this));
    this.socket.on('flames-die', this.onFlamesDie.bind(this));
    this.socket.on('game-done', this.onGameDone.bind(this));
    this.socket.on('pong', this.onPong.bind(this));

    $('#js-start-round').click( e => {
      this.socket.emit('start-round');
    });

    $('#js-end-round').click( e => {
      this.socket.emit('end-round');
    });
  },

  onGameInfo: function (data) {
    Game.init(data.game);
  },

  onPlayerJoin: function (data) {
    Game.playerJoin(data.player);
  },

  onPlayerLeave: function (data) {
    Game.playerLeave(data.id);
  },

  onPlayerSpawn: function (data) {
    Game.playerSpawn(data.player);
  },
  
  onPlayerUpdate: function (data) {
    Game.playerUpdate(data.player);
  },

  onPlayerDie: function (data) {
    Game.playerDie(data.player, data.killer, data.suicide);
  },

  onPlayerScore: function (data) {
    Game.playerScore(data.player);
  },

  onSuicide: function (data) {
    Game.suicide(data.player);
  },

  onBombPlace: function (data) {
    Game.bombPlace(data.bomb);
  },

  onBombExplode: function (data) {
    Game.bombExplode(data.bomb);
  },

  onMapUpdate: function (data) {
    Game.mapUpdate(data.tiles);
  },

  onFlamesSpawn: function (data) {
    Game.flamesSpawn(data.flames);
  },

  onFlamesDie: function (data) {
    Game.flamesDie(data.flames);
  },

  onGameDone: function (data) {
    Game.gameDone(data.player);
  },

  onPong: function () {
    console.log('pong');
  },

};

module.exports = GameManager;
