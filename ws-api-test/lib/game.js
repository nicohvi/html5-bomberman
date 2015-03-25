var io = require('socket.io-client');
var _ = require('lodash');

module.exports = function(url) {
  var bomberman = io.connect(url); 
  var game = bomberman.of('/game1');


  game.on('connect', function () {
    console.log('Connected to bomberman websocket server')
  });


  var gameId;
  game.on('game-info', function (gameInfo) {
    gameId = gameInfo.your_id;
    console.log('game info: ' + JSON.stringify(gameInfo));
  });

  game.on('player-update', function (playerUpdate) {
    //console.log('player update: ' + JSON.stringify(playerUpdate));
  });

  game.on('player-joined', function(playerJoined) {
    console.log('player joined: ' + JSON.stringify(playerJoined));
  });

  game.on('laginfo', function(info) {
    //iconsole.log(info);
    game.emit('pong', { t: (new Date()).getTime() });
  });

  var cord = { id: gameId || 0, x: 0, y: 0 };
  game.on('player-spawned', function(spawn) {
    if (spawn.id === gameId) {
      cord = spawn;
      console.log('you have spawned: ' + JSON.stringify(spawn));
    }
  });

  game.on('player-dying', function(d) {
    console.log(d)
  });

  game.on('break-tiles', function(d) {
    d.forEach(function(tile) {
      var x = tile.x;
      var y = tile.y;
    });
  });

  game.on('disconnect', function () {
    console.log('you were disconnected');
  });

  var moveCord = function(dir) {
    if      (dir === 'u')  cord.y = cord.y - 1;
    else if (dir === 'd')  cord.y = cord.y + 1;
    else if (dir === 'l')  cord.x = cord.x - 1;
    else if (dir === 'r')  cord.x = cord.x + 1;
    return cord;
 }

 var faceDirection = function(dir) {
    if      (dir === 'u')  return 1;
    else if (dir === 'd')  return 0;
    else if (dir === 'l')  return 3;
    else if (dir === 'r')  return 2;
 }
 
  var move = function(dir) {
    var cord = moveCord(dir);
    var o = faceDirection(dir);
    var update = _.extend(cord, { o: o, m: false});
    game.emit('update', update); 
  }

  this.join = function(name, character) { 
    game.emit('join', { name: name, character: character });
  };

  this.moveUp = function() {
    move('u');
  }
  
  this.moveDown = function() {
    move('d');
  }

  this.moveLeft = function() {
    move('l');
  }

  this.moveRight = function() {
    move('r');
  }

  this.placeBomb = function() {
    var place = { x: Math.floor(cord.x), y: Math.floor(cord.y) };
    game.emit('put-bomb', place);
  }
  
  return this;
}
