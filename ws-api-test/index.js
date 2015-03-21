var io = require('socket.io-client')
var express = require('express');
var _ = require('lodash');

//var bomberman = io.connect('ws://mac-nicolayhvidtsten:8080/'); 
var bomberman = io.connect('ws://localhost:8080/'); 
var game = bomberman.of('/game1');
var lobby = bomberman.of('/lobby');

lobby.on('connect', function () {
  console.log('Connected to lobby');
});

lobby.on('list-games', function (listGames) {
  console.log('games: ' + JSON.stringify(listGames));
});

game.on('connect', function () {
  console.log('Connected to bomberman websocket server')
});

function mapFromStr(strMap, w) {
  var noRows = strMap.length / w;
  var map = [];
  var row, startAt = 0;
  for (var i = 0; i < noRows; i++) {
    row = strMap.substring(startAt, startAt + w);
    startAt = startAt + w;
    map.push(row.split(''));
  }
  return map;
}

var map;
game.on('map', function(d) {
  var w = d.w;
  var h = d.h;
  var mapStr = d.map;
  map = mapFromStr(mapStr, w);
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
    map[y][x] = 0;
  });
});

/* Tried to tell the server that people have died
game.on('bomb-boomed', function(d) {
  var pow = (d.strength);
  var x = Math.floor(d.x);
  var y = Math.floor(d.y);
  var dirX1 = _.range(x - pow, x).reverse();
  var dirX2 = _.range(x, x + pow);
  var dirY1 = _.range(y - pow, y).reverse();
  var dirY2 = _.range(y, y + pow);
 
  var ix1 = dirX1[0];
  for (var i = 0; i < dirX1.length; i++) {
    var tileType = map[y][dirX1[i]];
    if (tileType != 0) {
      console.log(tileType);
      break;  
    }
    ix1 = dirX1[i]
  }
  
  console.log(ix1)
  
});
*/

game.on('disconnect', function () {
  console.log('you were disconnected');
});

lobby.emit('list-games');
game.emit('join', { name: 'CustomWSAPI', id: 1337, character: 'mary' });
var update = _.extend(cord, { o: 3, m: false});
game.emit('update', update);

var nextStep = 0.0;
setInterval(function() {
  nextStep = nextStep;
  //cord.x = cord.x + nextStep;
  cord.y = cord.y + nextStep
  var update = _.extend(cord, { o: 2, m: true});
  game.emit('update', update);
}, 5000);

setTimeout(function() {
  game.emit('dead', { id: gameId, flameOwner: gameId})
}, 5000);

var app = express();

/*
app.listen(8000, function() {
  console.log('server is running');
});
*/
