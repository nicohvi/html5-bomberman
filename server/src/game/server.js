"use strict";

const _ = require('lodash'),
      Game = require('./game');

let views = {},
    players = {},
    viewId = 0;

function setupListeners () {
  Game.on('player', update);
  Game.on('game', update);
}

function update (type, payload) {
  _.values(views).concat(_.values(players))
  .map(socket => socket.emit(type, payload));
}

function viewJoined (socket) {
  console.log('view connected');
  
  let id = viewId++;
  views[id] = socket;

  socket.emit('init', { game: Game.state() });

  socket.on('disconnect', () => {
    console.log('view disconnected'); 
    delete views[id];
  }); 
}

function playerJoined (socket) {
  console.log('player connected');

  socket.on('join-game', data => {
    Game.player(data, 'ADD').then(plr => {
      players[plr.id] = socket;
      update('player', { action: 'join', id: plr.id });
  })});
}

let Server = {
  init (io) {

    io.set('log level', 1);

    io.of('/view').on('connection', viewJoined);
    io.of('/game').on('connection', playerJoined);
   
    setupListeners();
    Game.setup();
  },

    //socket.on('join-game', data => Game.player(data, 'ADD'));
    
    //socket.on('request-move', data => {
      //Game.player(_.assign({ id: id }, data), 'MOV');
    //});

    //socket.on('stop-move', () => {
      //Game.player({ id: id }, 'STP');
    //});

    //socket.on('place-bomb', () => {
      //Game.player({ id: id }, 'BMB');
    //});

    //socket.on('disconnect', () => {
      //Game.player({ id: id }, 'DEL');
    //});
  //},

  //viewUpdate: function (event, payload) {
    //if(payload.action !== 'update')
      //console.log('called event: ' +event);
    //_.forEach(views, function (view) {
      //view.emit(event, payload);
   //});
  //},

};

module.exports = Server;
