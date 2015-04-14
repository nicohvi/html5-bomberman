var io  = require('socket.io-client');
var $   = require('jquery');
var _   = require('lodash');

var _names = ['Frank', 'Timmy', 'Peter', 'Bent', 'Ben'];
var _moves = ['up', 'down', 'left', 'right'];

var Player = {

  init: function (opts) {
    this.socket = io.connect('/game');
    this.name = _.sample(_names);
    this.setupListeners.call(this);
  },

  moveRandomly: function () {
    setInterval(function () {
      var move = _.sample(_moves);
      _.times(10, function () {
        this.doMove(move)
      }.bind(this));
      this.socket.emit('stop-move');
    }.bind(this), 500)
  },

  setupListeners: function () {
    this.socket.on('connect', this.onConnect.bind(this));
    this.socket.on('joined-game', this.joinGame.bind(this));
 },

  onConnect: function () {
    this.socket.emit('join-game', { name: this.name });
    this.moveRandomly();
  },

  onKeyDown: function (event) {
    switch(event.which) {
      // down
      case 40: 
        this.doMove('down');
        //this.doMove({ x: 0, y: 1 });
        break;
      // right
      case 39:
        this.doMove('right');
        //this.doMove({ x: 1, y: 0 });
        break;
      // up
      case 38:
        this.doMove('up');
        //this.doMove({ x: 0, y: -1 });
        break;
      // left
      case 37:
        this.doMove('left')
        break;
    }
  },

  onKeyUp: function (event) {
    console.log('stop')
    this.socket.emit('stop-move');
  },

  doMove: function (dir) {
    console.log('moving in dir: ' +dir);
    this.socket.emit('request-move', { dir: dir });
  },

  joinGame: function (data) {
    $(document).on('keydown', this.onKeyDown.bind(this)); 
    $(document).on('keyup', this.onKeyUp.bind(this));
    console.log('joined game');
  }

};

module.exports = Player;
