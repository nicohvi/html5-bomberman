var io  = require('socket.io-client');
var $   = require('jquery');
var _   = require('lodash');

var _names = ['Frank', 'Timmy', 'Peter', 'Bent', 'Ben'];
var _moves = ['up', 'down', 'left', 'right'];

function getTick() {
  return new Date().getTime();
}

class Player {
  constructor () {
    this.socket = io.connect('/game');
    this.name = _.sample(_names);
    this.setupListeners.call(this);
  }

  moveRandomly () {
    setInterval(function () {
       var move = _.sample(_moves);
       var doMove = this.doMove.bind(this, move)
       var interval = setInterval(doMove, 10);
      setTimeout( function () { clearInterval(interval); }, 1000);
    }.bind(this), 2000);
  }

  setupListeners () {
    this.socket.on('connect', this.onConnect.bind(this));
    this.socket.on('joined-game', this.joinGame.bind(this));
  }

  onConnect () {
    this.socket.emit('join-game', { name: this.name });
    //this.moveRandomly();
  }

  onKeyDown (event) {
    switch(event.which) {
      // down
      case 40: 
        this.doMove('down');
        break;
      // right
      case 39:
        this.doMove('right');
        break;
      // up
      case 38:
        this.doMove('up');
        break;
      // left
      case 37:
        this.doMove('left')
        break;
      // space
      case 32:
        this.placeBomb();
        break;
    }
  }

  onKeyUp (event) {
    console.log('stop')
    this.socket.emit('stop-move');
  }

  doMove (dir) {
    console.log('moving ' +this.name+ ' in dir: ' +dir);
    this.socket.emit('request-move', { dir: dir });
  }

  placeBomb () {
    console.log('placing bomb!');
    this.socket.emit('place-bomb');
  }

  joinGame (data) {
    $(document).on('keydown', this.onKeyDown.bind(this)); 
    $(document).on('keyup', this.onKeyUp.bind(this));
    console.log('joined game');
  }

};

module.exports = Player;
