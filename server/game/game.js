/*jslint node: true */
"use strict";

let _ = require('lodash');
let B = require('baconjs').Bacon;
//let util = require('util');
let EventEmitter = require('events').EventEmitter;

let lib = require('./lib/lib');

lib.extend(EventEmitter);

// Constants
const BOMB_TIMER = 3000,
      BOMB_STRENGTH = 4,
      COOLDOWN_TIME = 1000,
      SPAWNING_TIME = 6000,
      FUSE_TIME = 500,
      PLAYER_GIRTH = 0.35,
      WINNING_SCORE = 5,
      MAP_WIDTH = 50,
      MAP_HEIGHT = 40;

// Components
let Player  = require('./player');
let Bomb    = require('./bomb');
let Flame   = require('./flame');
let GameMap = require('./map');
let CollisionDetector = require('./lib/CollisionDetector');
let BombManager       = require('./lib/BombManager');

let bombId = 0,
    flameId = 0;

let Game = {

  init () {
    this.players = {};
    this.map = new GameMap({ width: MAP_WIDTH, height: MAP_HEIGHT });
    this.bombManager = BombManager(this.map);
    this.collisionDetector = CollisionDetector({ map: this.map, bombManager: this.bombManager});

    this.done = false;            

    this.update.call(this);
    // 60 Hz: 1/60 = 0.167 ~ 17
    setInterval(this.update.bind(this), 17);
  },

  state () { 
    return { players: this.players, map: this.map };
  },

  addPlayer (data) {
    let player = new Player(data);
    this.players[data.id] = player;

    this.emit('player-join', { player: player });
    this.spawnPlayer(player);
  },

  spawnPlayer (player) {
    let loc = this.map.getValidSpawnLocation();
    this.log('{'+loc.x+','+loc.y+'}: Spawning player: ' +player.name);
    player.spawn(loc);
    this.emit('player-spawn', { player: player });
  },

  removePlayer (id) {
    this.log('Removing player with id: ' +id);
    delete this.players[id];
    this.emit('player-leave', { id: id });
  },

  stopPlayer (id) {
    let player = this.players[id];

    if(typeof(player) === 'undefined' || !player.alive) {
        return;
    }
    
    this.emit('player-update', { player: player.stop() });
  },

  movePlayer (data) {
    let player = this.players[data.id];
    if(typeof(player) === 'undefined' || !player.alive) { return; }
    this.emit('player-update', { player: player.move(data.dir) });
  },

  attemptMove (player, delta) {
    let playerX     = player.x,
        playerY     = player.y,
        dx          = delta.dx,
        dy          = delta.dy,
        newX = Math.floor(playerX + dx + this.direction(dx)*PLAYER_GIRTH),
        newY = Math.floor(playerY + dy + this.direction(dy)*PLAYER_GIRTH);

    // x-axis
    if(!this.collisionDetector.canMove(newX, playerY)) {
      dx = 0;
    }
    
    // y-axis
    if(!this.collisionDetector.canMove(playerX, newY)) {
      dy = 0;
    }

    return player.deltaMove(dx, dy);
  },

  placeBomb (playerId) {
    let player  = this.players[playerId];

    if(player.cooldown || !player.alive || this.done) {
      return;
    }

    let bomb = Bomb(bombId++, player, BOMB_STRENGTH, this.lastTick);

    player.setCooldown(this.lastTick);
    this.log('placing bomb at: ' +bomb.x+ ", " +bomb.y); 

    this.bombManager.addBomb(bomb);
    this.emit('place-bomb', bomb);
  },

  gameOver (winner) {  
    this.done = true;
    this.winner = winner;
    this.emit('game-done', winner);
  },

  scoreUpdate (player, score) {
    player.updateScore(score);
    this.emit('player-score', { player: player});
  },

  explodeBomb (bomb) {  
    // Bomb has already been exploded through the magic
    // of chaining.
    if(typeof(bomb) === 'undefined' || bomb.exploded) {
      return;
    }

    // returns dirty tiles from explosion
    let dirtyTiles = this.bombManager.explodeBomb(bomb);

    this.log('bomb ' +bomb.id+ ' exploding at: ' +bomb.x+ ", " +bomb.y);

    bomb.exploded = true;
    this.map.updateMap(dirtyTiles);
    this.emit(
      'bomb-explode', 
      { bomb: bomb, dirtyTiles: dirtyTiles }
    );
    
    //this.chainBombs(tiles, bomb.id);
  },

  update () {
    let tick = this.tick();

    if(this.done) {
      return;
    }

    this.updatePlayers(tick);
    //this.updateBombs();
    this.lasTick = tick;
  },

  updatePlayers (tick) {
    let winner = this.checkWinners();
    
    if(winner) { 
      return this.gameOver(winner);
    }

    this.updatePlayerMovement(tick);
  },

  checkWinners () {
    return _.find(this.players,function (plr) {
      return plr.score >= WINNING_SCORE;
    });
  },

  updatePlayerMovement (tick) {
    B.fromBinder(function (sink) {
      _.forEach(this.players, function (plr) {
        return sink(plr);
      }.bind(this));
    }.bind(this))
    .filter(plr => plr.alive && plr.moving)
    .map(function (plr) {
      let delta = plr.getAttemptedMove();
      return this.attemptMove(plr, delta);
    }.bind(this))
    .onValue(function (plr) { 
      this.emit('player-update', { player: plr });
    }.bind(this));
  },

  //updateBombs (tick) {
    //this.explodeBombs(tick);
    //R.pipe(
    //R.filter(function (bomb) { return bomb.exploded; }),
    //R.forEach(function (bomb) { this.bombManager.removeBomb(bomb); }.bind(this))
    //)(this.players);
  //}, 

  //explodeBombs (tick) {
    //let liveBombs = R.filter(function (bomb) { return !bomb.exploded; })(this.bombManager.bombs);

      //R.pipe(
      //R.filter(function (bomb) {
        //return !bomb.active && (tick - bomb.placedAt > FUSE_TIME);
      //}),
      //R.forEach(function (bomb) {
        //this.bombManager.activateBomb(bomb);
      //}.bind(this))
      //)(liveBombs);

      //R.pipe(
      //R.filter(function (bomb) {
        //return bomb.active && (tick - bomb.placedAt > BOMB_TIMER);
      //}),
      //R.forEach(function (bomb) {
        //this.bombExplode(bomb);
      //}.bind(this))
      //)(liveBombs);
  //},

  log (message) {
    let prefix = "Logged from game.js: ";
    console.log(prefix + message);
  },

//Game.prototype.spawnFlames = function (tiles, playerId) {
  //let newFlames = [];
  //_.forEach(tiles, function (tile) {
    //let flame = new Flame(tile.x, tile.y, flameId++, playerId); 
    //this.flames[flame.id] = flame;
    //newFlames.push(flame);
  //}.bind(this));
  //this.emit('flame-spawn', newFlames);
  ////setTimeout(this.killFlames.bind(this, newFlames), 1000);
//};

//Game.prototype.killFlames = function (flames) {
  //_.forEach(flames, function (flame) {
    //delete this.flames[flame.id];
  //}.bind(this));
  //this.emit('flame-die', flames);
//};

//Game.prototype.chainBombs = function (tiles, bombId) {
  //let bombs = [];
  //_.forEach(this.bombs, function (bomb) {
    //_.forEach(tiles, function (tile) {
      //if(CollisionDetector.collision(bomb, tile) && bomb.id !== bombId) {
        //bombs.push(bomb);
      //}
    //}.bind(this));
  //}.bind(this)); 

  //_.forEach(bombs, function(bomb) { 
      //this.log('should be chained: ' +util.inspect(bomb));
      //this.bombExplode(bomb);
  //}.bind(this));
//};

//;

// utility

  direction (x) {
    // x > 0  -> 1
    // x == 0 -> 0
    // x < 0  -> -1
    return x > 0 ? 1 : x < 0 ? -1 : 0;
  },

  tick () {
    return new Date().getTime();
  }
};

let gameFactory = function () {
  let game = Object.create(_.assign({}, EventEmitter.prototype, Game));
  // extend the game with the eventemitter prototype
  game.init();

  return game;
};

module.exports = gameFactory;
