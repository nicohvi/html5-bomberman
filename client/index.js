var io  = require('socket.io-client');

class Controller {
  constructor(socket) {
    this.socket = socket;
  }

  moveLeft () {
    this.doMove('left');
  }

  moveRight () {
    this.doMove('right');
  }

  moveUp () {
    this.doMove('up');
  }

  moveDown () {
    this.doMove('down');
  }

  doMove (dir) {
    console.log('moving ' +this.name+ ' in dir: ' +dir);
    this.socket.emit('request-move', { dir: dir });
  }

  stop () {
    this.socket.emit('stop-move');
  }

  placeBomb () {
    this.socket.emit('place-bomb');
  }

}

class Client {
  constructor(url, name) {
    this.url = url;
    this.name = name;
    this.callbacks = {};
  }

  connect(onConnect) {
    this.callbacks.onConnect = onConnect;


    // this.socket = io.connect('/game');
    this.socket = io.connect(this.url + '/game');
    this.setupListeners.call(this);

  }

  setupListeners () {
    this.socket.on('connect', this.onConnect.bind(this));
    this.socket.on('joined-game', this.onJoined.bind(this));
  }

  onConnect () {
    this.socket.emit('join-game', { name: this.name });
  }

  onJoined (data) {
    console.log('joined game');
    this.callbacks.onConnect(new Controller(this.socket));
  }
}

module.exports = Client;
