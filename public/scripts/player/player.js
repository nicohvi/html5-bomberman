var io = require('socket.io-client');

var Player = {

  init: function (opts) {
    var opts = opts || {};

    this.name = opts.name || 'Frank';
    this.character = opts.character || 'Pikachu';
    this.id = -1;
    this.socket = io.connect('/game');
    this.setupListeners.call(this);
  },

  setupListeners: function () {
    this.socket.on('game-info', this.joinGame.bind(this));
  },

  joinGame: function (data) {
    this.id = data.your_id;

    this.socket.emit('join', {
      id: this.id,
      name: this.name,
      character: this.character
    });
  }

};

module.exports = Player;
