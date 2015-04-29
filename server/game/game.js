/*jslint node: true */
"use strict";

let _ = require('lodash');
let B = require('baconjs').Bacon;
//let util = require('util');
let EventEmitter = require('events').EventEmitter;

let lib = require('./lib/lib');

lib.extend(EventEmitter);

// Constants
const BOMB_STRENGTH = 4,
      BOMB_TIMER = 3000,
      FUSE_TIME = 500,
      FLAME_TIME = 1000,
      COOLDOWN_TIME = 1000,
      SPAWNING_TIME = 6000,
      PLAYER_GIRTH = 0.35,
      WINNING_SCORE = 5,
      MAP_WIDTH = 50,
      MAP_HEIGHT = 40,
      TILE_BRICK = 1;

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
    this.flames = {};
    this.map = new GameMap({ width: MAP_WIDTH, height: MAP_HEIGHT });
    this.bombManager = BombManager({ map: this.map});
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

  killPlayer (player, flame) {
    const killer = this.players[flame.playerId],
          suicide = killer === player;

    this.updateScore(player, killer, suicide);
    player.die(this.lastTick);
    // TODO: Score
    this.emit('player-die', { player: player, killer: killer, suicide: suicide });
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

    let opts = {
      id: bombId++,
      player: player,
      strength: BOMB_STRENGTH,
      time: this.lastTick
    };

    let bomb = Bomb(opts);

    player.setCooldown(this.lastTick);
    this.log('placing bomb at: ' +bomb.x+ ", " +bomb.y); 

    this.bombManager.addBomb(bomb);
    this.emit('bomb-place', { bomb: bomb });
  },

  gameOver (winner) {  
    this.done = true;
    this.winner = winner;
    this.emit('game-done', { player: winner});
  },

  update () {
    let tick = this.tick();

    if(this.done) {
      return;
    }

    this.updatePlayers(tick);
    this.updateBombs(tick);
    this.updateFlames(tick);

    this.lastTick = tick;
  },

  updateScore (player, killer, suicide) {
    let update = player;
    if(suicide) {
      player.updateScore(-1);
    } else {
      killer.updateScore(1);
      update = killer;
    }
    this.emit('player-score', { player: killer });
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
    let playerStream  = lib.stream(this.players),
        activePlayers = playerStream.filter(plr => plr.alive);

    playerStream
    .filter(plr => !plr.alive && (tick - plr.diedAt) > SPAWNING_TIME)
    .onValue(function (plr) { this.spawnPlayer(plr); }.bind(this));

    activePlayers 
    .filter(plr => plr.cooldown && (tick - plr.lastBomb) > COOLDOWN_TIME)
    .onValue(plr => plr.stopCooldown());

    activePlayers
    .onValue(function(plr) {
      lib.syncStream(this.flames)
      .filter(function (flame) {
        return this.collisionDetector.collision(plr, flame);
      }.bind(this))
      .onValue(function (flame) {
        this.killPlayer(plr, flame);
      }.bind(this));
    }.bind(this));


    activePlayers
    .filter(plr => plr.moving)
    .map(function (plr) {
      let delta = plr.getAttemptedMove();
      return this.attemptMove(plr, delta);
    }.bind(this))
    .onValue(function (plr) { 
      this.emit('player-update', { player: plr });
    }.bind(this));

  },

  updateBombs (tick) {
    let bombStream  = lib.stream(this.bombManager.bombs),
       explodedBombs    = bombStream.filter(bomb => bomb.exploded),
       liveBombs        = bombStream.filter(bomb => !bomb.exploded),
       bombsToActivate  = liveBombs.filter(bomb => !bomb.active && (tick - bomb.placedAt > FUSE_TIME)),
       bombsToExplode   = liveBombs.filter(bomb => bomb.active && (tick - bomb.placedAt > BOMB_TIMER));

    explodedBombs.onValue(function (bomb) { this.bombManager.removeBomb(bomb); }.bind(this));
    bombsToActivate.onValue(function (bomb) { this.bombManager.activateBomb(bomb); }.bind(this));
    bombsToExplode.onValue(function (bomb) { this.explodeBomb(bomb); }.bind(this));
  },

  updateFlames (tick) {
    let flames = [];

    lib.syncStream(this.flames)
    .filter(flame => (tick - flame.spawnTime) > FLAME_TIME)
    .doAction(function (flame) { delete this.flames[flame.id]; }.bind(this))
    .onValue(flame => flames.push(flame));

    if(!_.isEmpty(flames)) {
      this.emit('flames-die', { flames: flames });
    }
  },

  explodeBomb (bomb) {
    this.log('bomb ' +bomb.id+ ' exploding at: ' +bomb.x+ ", " +bomb.y);
    
    let tiles = this.bombManager.explodeBomb(bomb),
        dirtyTiles = _.filter(tiles, tile => tile.value === TILE_BRICK);
    
    this.emit('bomb-explode', { bomb: bomb });
    
    this.spawnFlames(tiles, bomb.playerId);
    this.updateMap(dirtyTiles);
  },

  spawnFlames (tiles, playerId) {
    let flames = [],
        now = this.lastTick;

    B.fromArray(tiles)
      .map(tile => Flame({
        x:  tile.x, 
        y:  tile.y, 
        id: flameId++, 
        playerId: playerId,   
        time: now}))
      .doAction(function (flame) { 
        this.flames[flame.id] = flame;
      }.bind(this))
      .onValue(flame => flames.push(flame));

    this.emit('flames-spawn', { flames: flames});    
  },

  updateMap (tiles) {
    this.map.updateMap(tiles);
    this.emit('map-update', { tiles: tiles });
  },

  log (message) {
    let prefix = "Logged from game.js: ";
    console.log(prefix + message);
  },

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
