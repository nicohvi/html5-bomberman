var io  = require('socket.io-client');
var $   = require('jquery');
var GameManager = require('./GameManager');

var Lobby = {

  init: function () {
    this.el = $('#lobby');
    this.el.find('form').submit( function (event) { return false;  } );
    this.socket = io.connect('/lobby');
    this.setupListeners.call(this);
  },

  setupListeners: function() {
    this.socket.on('connect', this.connect.bind(this));
    this.socket.on('disconnect', this.disconnect.bind(this));
    this.el.find('#start-game').on('click', this.startGame.bind(this));
  },

  connect: function () {
    console.log('connected to lobby');
  },

  disconnect: function () {
    console.log('disconnected from game');
  },

  startGame: function () {
    var username = this.el.find('#username').val().trim();
    if(username.length == 0) {
      alert('Choose a name, idiot')
      return;
    }
    GameManager.init(this.socket, username);
  }

};

module.exports = Lobby;
