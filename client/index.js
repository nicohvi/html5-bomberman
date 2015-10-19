"use strict";

const io  = require('socket.io-client'),
      url = 'http://localhost:3000/game';

let _socket = null,
    _name = null;

let Controller = {

  init (socket) {
    _socket = socket;
    return this;
  },

  move (dir) {
    console.log('moving ' +_name+ ' in direction: ' +dir);
    _socket.emit('request-move', { dir: dir });
  },

  stop () {
    _socket.emit('stop-move');
  },

  bomb () {
    _socket.emit('place-bomb');
  },

  // todo: PO
  powerup () {
    _socket.emit('power-up');
  }
};

function ControllerFactory (socket) {
  let ctrl = Object.create(Controller);
  return ctrl.init(socket);
};

let Client = {

  init (name) {
    _name = name;
    return this;
  },

  connect (onConnect) {
    _socket = io.connect(url);
    _socket.on('connect', 
      () => _socket.emit('join-game', { name: _name })
    );
    _socket.on('joined-game', 
      () => {
        let ctrl = ControllerFactory(_socket);
        onConnect(ctrl);
    });
  }
};

function ClientFactory (name) {
  let client = Object.create(Client);
  return client.init(name);
};

module.exports = ClientFactory;

