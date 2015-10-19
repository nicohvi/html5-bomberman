/*jshint browserify: true */
"use strict";

const io    = require('socket.io-client'),
  Game      = require('./Game'),
  B         = require('baconjs'),
  events    = [ 'init', 'game', 'player', 'bomb', 'flame', 'map', 'pong' ],
  handlers  = [ Game.init, Game.event, Game.playerUpdate, Game.bombUpdate,
                Game.flameUpdate, Game.mapUpdate, Game.pong ];

let _socket = null;

let GameManager = {

  init () {
    _socket = io.connect('/view'); 

    B.fromArray(events)
      .zip(B.fromArray(handlers), function (e, func) { return { event: e, func: func };})
      .onValue( function (map) { _socket.on(map.event, map.func.bind(Game));});
  },

  start () {
    _socket.emit('start-round');
  },

  reset () {
    _socket.emit('reset');
  }

};

module.exports = GameManager;
