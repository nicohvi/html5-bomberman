var io = require('socket.io-client');

var lobby = {

  init: function () {
    this.lobby = io.connect('/lobby');
    this.setupListeners.call(this);
  },

  setupListeners: function() {
    this.lobby.on('connect', this.connect.bind(this));
    this.lobby.on('disconnect', this.disconnect.bind(this));
  },

  connect: function () {
    console.log('connected to lobby');
  },

  disconnect: function () {

  }

};

module.exports = lobby;
