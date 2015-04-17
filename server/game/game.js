/*jslint node: true */
"use strict";

var _ = require('lodash');
var $ = require('./lib/lib');
var util = require('util');

// Constants
var BOMB_TIMER = 3000,
  BOMB_STRENGTH = 4,
  COOLDOWN_TIME = 1000,
  SPAWNING_TIME = 6000,
  FUSE_TIME = 500,
  PLAYER_GIRTH = 0.35,
  WINNING_SCORE = 5,
  MAP_WIDTH = 50,
  MAP_HEIGHT = 40;

// Components
var Player  = require('./player');
var Bomb    = require('./bomb');
var Flame   = require('./flame');
var Map     = require('./map');
var CollisionDetector = require('./lib/CollisionDetector');
var BombManager       = require('./lib/BombManager');

var bombId = 0,
    flameId = 0;

function getTicks() {
  return new Date().getTime();
}

var Game = function () {
  this.players = {};
  this.bombs = {};
  this.flames = {};
  this.map = new Map({ width: MAP_WIDTH, height: MAP_HEIGHT });
  this.done = false;            
  BombManager.init(this.map);

  this.lastTick = getTicks();
  // 60 Hz: 1/60 = 0.167 ~ 17
  setInterval(this.update.bind(this), 17);
};

// TODO: add flames and bombs 
Game.prototype.getState = function () {
  return { players: this.players, map: this.map.getMap() };
};

Game.prototype.addPlayer = function (data) {
  this.log('adding player with id: ' +data.socketId);
  var player = new Player(data);
  this.players[data.socketId] = player;
  return player;
};

Game.prototype.spawnPlayer = function (player) {
  var loc = this.map.getValidSpawnLocation();
  this.log('{'+loc.x+','+loc.y+'}: Spawning player: ' +player.name);
  player.spawn(loc);
  this.trigger('player-spawn', player);
};

Game.prototype.removePlayer = function (socketId) {
  this.log('Removing player with id: ' +socketId);
  delete this.players[socketId];
};

Game.prototype.playerStop = function (socketId) {
  var player = this.players[socketId];

  if(typeof(player) === 'undefined') {
      this.log('player not found');
      return;
    }

  return player.stop();
};

Game.prototype.playerMove = function (socketId, data) {
  var player = this.players[socketId];

  if(typeof(player) === 'undefined') {
    this.log('player not found');
    return;
  }
  
  if(!player.alive) {
    return;
  }

  return player.move(data.dir);
};

Game.prototype.attemptMove = function (player, delta) {
  var pCoords = $.coordinates(player),
      dx          = delta.dx,
      dy          = delta.dy,
      newX = Math.floor(player.x + dx + this._direction(dx)*PLAYER_GIRTH),
      newY = Math.floor(player.y + dy + this._direction(dy)*PLAYER_GIRTH);
  // x-axis
  if(!this.map.canMove(newX, pCoords.y)) {
    dx = 0;
  }

  var bombTest = this.hasBomb({x: newX, y: pCoords.y});
  if(bombTest && bombTest.active) {
    dx = 0;
  }

  // y-axis
  if(!this.map.canMove(pCoords.x, newY)) {
    dy = 0;
  }

  bombTest = this.hasBomb({ x: pCoords.x, y: newY});
  if(bombTest && bombTest.active) {
    dy = 0;
  }

  if(dx !== 0 || dy !== 0) {
    player.deltaMove(dx, dy);
    return true;
  } else {
    return false;
  }
};

Game.prototype.placeBomb = function (socketId) {
  var player  = this.players[socketId];

  if(player.cooldown) {
    this.log('payer is cooling down');
    return null;
  }

  if(!player.get('alive') || this.done) {
    return null;
  }

  var bomb = new Bomb(bombId++, player, BOMB_STRENGTH, this.lastTick);

  player.coolDown();
  this.log('placing bomb at: ' +bomb.x+ ", " +bomb.y); 

  this.bombs[bomb.id] = bomb;
  return bomb;
};


        
Game.prototype.update = function () {
  var now = getTicks();

  if(this.done) {
    return;
  }

  _.forEach(this.players, function (player) {
    if(!player.alive) {
      if(now - player.diedAt > SPAWNING_TIME) {
        this.spawnPlayer(player);
      }
      return;
    }

    if(player.moving) {
      var delta = player.getAttemptedMove();
      
      if(this.attemptMove(player, delta)) {
        this.trigger('player-update', player);
      }
    }

    if(player.get('score') >= WINNING_SCORE) {
      this.endGame(player);
      return;
    }

    if(player.cooldown && (now - player.lastBomb > COOLDOWN_TIME)) {
      player.stopCooldown();
    }

    var flame = CollisionDetector.firstCollision(player, this.flames);
    if(flame) {
      var killer = this.players[flame.playerId];
      var suicide = killer.id === player.id; 
      this.log(player.name+ ' died, by suicide? ' +suicide);
      player.die(now);
      this.trigger('player-die', player, suicide);
      if(suicide) {
        this.scoreUpdate(player, -1);
      } else {
        this.scoreUpdate(killer, 1);
      }
    }
  }.bind(this));

  _.forEach(this.bombs, function (bomb) {
    if(now - bomb.placedAt > BOMB_TIMER) {
      this.bombExplode(bomb);
    }
    else if(bomb.exploded) {
      delete this.bombs[bomb.id];
    }
    else if(now - bomb.placedAt > FUSE_TIME) {
      bomb.active = true;
    }
  }.bind(this));

  this.lastTick = now;
};

Game.prototype.endGame = function (winner) {
  this.done = true;
  this.winner = winner;
  this.trigger('game-done', winner);
};

Game.prototype.scoreUpdate = function (player, score) {
  player.updateScore(score);
  this.trigger('player-score', player);
};

Game.prototype.bombExplode = function (bomb) {
  // Bomb has already been exploded through the magic
  // of chaining.
  if(typeof(bomb) === 'undefined' || bomb.exploded) {
    return;
  }

  var tiles = [];

  this.log('bomb ' +bomb.id+ ' exploding at: ' +bomb.x+ ", " +bomb.y);

  bomb.exploded = true;
  
  tiles = BombManager.getTiles(bomb);

  //tiles = _.filter(tiles, function (tile) {
    //return typeof(tile) !== "undefined";
  //});

  this.spawnFlames(tiles, bomb.playerId);

  var dirtyTiles = _.filter(tiles, function (tile) {
    return tile.value === TILE_BRICK; 
  });

  this.map.updateMap(dirtyTiles);

  this.trigger(
    'bomb-explode', 
    { bomb: bomb, dirtyTiles: dirtyTiles }
  );
  
  this.chainBombs(tiles, bomb.id);
};

Game.prototype.getBombTiles = function (x,y) {
  var result = [];
  // TODO: takeWhile
  result = result.concat(this.map.getXBombTiles(x, x-BOMB_STRENGTH, y));
  result = result.concat(this.map.getXBombTiles(x, x +BOMB_STRENGTH, y));
  result = result.concat(this.map.getYBombTiles(y, y-BOMB_STRENGTH, x));
  result = result.concat(this.map.getYBombTiles(y, y+BOMB_STRENGTH, x));
  return result;
};

Game.prototype.spawnFlames = function (tiles, playerId) {
  var newFlames = [];
  _.forEach(tiles, function (tile) {
    var flame = new Flame(tile.x, tile.y, flameId++, playerId); 
    this.flames[flame.id] = flame;
    newFlames.push(flame);
  }.bind(this));
  this.trigger('flame-spawn', newFlames);
  //setTimeout(this.killFlames.bind(this, newFlames), 1000);
};

Game.prototype.killFlames = function (flames) {
  _.forEach(flames, function (flame) {
    delete this.flames[flame.id];
  }.bind(this));
  this.trigger('flame-die', flames);
};

Game.prototype.chainBombs = function (tiles, bombId) {
  var bombs = [];
  _.forEach(this.bombs, function (bomb) {
    _.forEach(tiles, function (tile) {
      if(CollisionDetector.collision(bomb, tile) && bomb.id !== bombId) {
        bombs.push(bomb);
      }
    }.bind(this));
  }.bind(this)); 

  _.forEach(bombs, function(bomb) { 
      this.log('should be chained: ' +util.inspect(bomb));
      this.bombExplode(bomb);
  }.bind(this));
};

// utility

Game.prototype.log = function (message) {
  console.log(message);
};

Game.prototype._direction = function (x) {
  // x > 0  -> 1
  // x == 0 -> 0
  // x < 0  -> -1
  return x > 0 ? 1 : x < 0 ? -1 : 0;
};
