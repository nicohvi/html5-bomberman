"use strict";

const io  = require('socket.io-client');
const url = 'http://localhost:3000/game';

let _name = null;
let _id = null;
let _socket = null;

function setupListeners () {
  _socket.on('connect', 
    () => _socket.emit('join-game', { name: _name }));

  return new Promise((resolve, reject) => {
    _socket.on('player', data => {
      debugger
      console.log('promise is not resolved');
      _id = data.id;
      resolve();
    });
  });
}

module.exports = {

  init (name) {
    _name = name;
    return this;
  },

  connect () {
    _socket = io.connect(url);
    return new Promise((resolve, reject) => {
      setupListeners()
      .then( () => resolve(this));
    });
  },

  state () {
    return { id: _id, name: _name }; 
  }
  
};

