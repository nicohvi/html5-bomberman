var io = require('socket.io-client');
var Game = require('./Game');

var GameManager = {

  init: function (socket, username) {
    this.game = Game.init(username);
    this.socket = socket;
    this.setupListeners.call(this);
    this.socket.emit('join-game', { username: username }); 
  },

  setupListeners: function() {
    this.socket.on('game-info', this.onGameInfo.bind(this));
    //this.socket.on('disconnect', this.disconnected.bind(this));
    //this.socket.on('score-updates', this.scoreUpdate.bind(this));
    //this.socket.on('player-update', this.update.bind(this));
    //this.socket.on('player-joined', this.playerJoined.bind(this));
  },

  //connected: function () {
    //console.log('connected to server');
  //},

  onGameInfo: function (data) {
    debugger    
  },

  //disconnected: function () {
  //},

  //scoreUpdate: function (data) {
    //// TODO
  //},

  //update: function (data) {
    //this.game.update(data);
  //},

  //playerJoined: function (player) {
    //console.log('player joined');
    //this.game.addPlayer(player);
  //}

};

module.exports = GameManager;
