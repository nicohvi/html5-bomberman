var io = require('socket.io-client');
var Game = require('./Game');

var GameManager = {

  init: function () {
    this.game = Game.init();
    this.socket = io.connect('/view');
    this.setupListeners.call(this);
  },

  setupListeners: function() {
    this.socket.on('connect', this.connected.bind(this));
    this.socket.on('disconnect', this.disconnected.bind(this));
    this.socket.on('score-updates', this.scoreUpdate.bind(this));
    this.socket.on('player-update', this.update.bind(this));
    this.socket.on('player-joined', this.playerJoined.bind(this));
  },

  connected: function () {
    console.log('connected to server');
  },

  disconnected: function () {
  },

  scoreUpdate: function (data) {
    // TODO
  },

  update: function (data) {
    this.game.update(data);
  },

  playerJoined: function (player) {
    console.log('player joined');
    this.game.addPlayer(player);
  }

};

module.exports = GameManager;
