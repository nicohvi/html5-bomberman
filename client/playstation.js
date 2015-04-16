var io = require('socket.io-client');

class PlaystationController {
  constructor() {
    this.callbacks = {};
  }

  connect (onConnect) {
    this.callbacks.onConnect = onConnect;

    this.socket = io.connect('http://localhost:5000/ps');
    this.setupListeners.call(this);       
  }

  setupListeners () {
    this.socket.on('connect', this.onConnect.bind(this));
  }

  onConnect () {
    this.callbacks.onConnect(this.socket);
    console.log('connected to PS-server');
  }
  
}

module.exports = PlaystationController;
