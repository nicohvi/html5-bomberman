"use strict";

const _ = require('lodash'),
  B = require('baconjs').Bacon,
  EventEmitter = require('events').EventEmitter,
  lib = require('./lib/lib'),

  // Components
  Player  = require('./player'),
  Bomb    = require('./bomb'),
  Flame   = require('./flame'),
  GameMap = require('./map'),

  Constants       = require('./constants'),

  CollisionDetector = require('./lib/CollisionDetector'),
  BombManager       = require('./lib/BombManager');

let bombId = 0,
    flameId = bombId,
    players = {},
    flames = {},
    map = null,
    bombManager = null,
    collisionDetector = null,
    done = false,
    go = true,
    lastTick = null,
    winner = null;

let Game = {

  init () {
    map = new GameMap({ width: Constants.MAP_WIDTH, height: Constants.MAP_HEIGHT });
    bombManager = BombManager({ map: map});
    collisionDetector = CollisionDetector({ map: map, bombManager: bombManager});

    this.update();

    // 60 Hz: 1/60 = 0.167 ~ 17 ms
    setInterval(this.update.bind(this), 17);
  },

  startRound () {
    go = true;
  },

  endRound () {
    go = false;
  },

  state () { 
    return { players: players, map: map };
  },

  addPlayer (data) {
    let player = new Player(data);
    players[data.id] = player;

    this.emit('player-join', { player: player });
    this.spawnPlayer(player);
  },

  spawnPlayer (player) {
    let loc = map.getValidSpawnLocation();
    this.log('{'+loc.x+','+loc.y+'}: Spawning player: ' +player.name);
    player.spawn(loc);
    this.emit('player-spawn', { player: player });
  },

  removePlayer (id) {
    this.log('Removing player with id: ' +id);
    delete players[id];
    this.emit('player-leave', { id: id });
  },

  stopPlayer (id) {
    let player = players[id];

    if(typeof(player) === 'undefined' || !player.alive) {
        return;
    }
    
    this.emit('player-update', { player: player.stop() });
  },

  movePlayer (data) {
    let player = players[data.id];
    if(typeof(player) === 'undefined' || !player.alive) { return; }
    this.emit('player-update', { player: player.move(data.dir) });
  },

  killPlayer (player, flame) {
    const killer = players[flame.playerId],
          suicide = killer === player;

    this.updateScore(player, killer, suicide);
    player.die(lastTick);
    this.emit('player-die', { player: player, killer: killer, suicide: suicide });
  },

  attemptMove (player, delta) {
    let playerX     = player.x,
        playerY     = player.y,
        dx          = delta.dx,
        dy          = delta.dy,
        newX = Math.floor(playerX + dx + this.direction(dx)*Constants.PLAYER_GIRTH),
        newY = Math.floor(playerY + dy + this.direction(dy)*Constants.PLAYER_GIRTH);

    // x-axis
    if(!collisionDetector.canMove(newX, playerY)) {
      dx = 0;
    }
    
    // y-axis
    if(!collisionDetector.canMove(playerX, newY)) {
      dy = 0;
    }

    return player.deltaMove(dx, dy);
  },

  placeBomb (playerId) {
    let player  = players[playerId];

    if(player.cooldown || !player.alive || this.done) {
      return;
    }

    let opts = {
      id: bombId++,
      player: player,
      strength: Constants.BOMB_STRENGTH,
      time: lastTick
    };

    let bomb = Bomb(opts);

    player.setCooldown(lastTick);
    this.log('placing bomb at: ' +bomb.x+ ", " +bomb.y); 

    bombManager.addBomb(bomb);
    this.emit('bomb-place', { bomb: bomb });
  },

  gameOver (winner) {  
    done = true;
    winner = winner;
    this.emit('game-done', { player: winner});
  },

  update () {
    let tick = this.tick();

    if(done || !go) return;

    this.updatePlayers(tick);
    this.updateBombs(tick);
    this.updateFlames(tick);

    lastTick = tick;
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
    return _.find(players,function (plr) {
      return plr.score >= Constants.WINNING_SCORE;
    });
  },

  updatePlayerMovement (tick) {
    let plrs  = lib.stream(players),
        alive = plrs.filter(plr => plr.alive);

    plrs 
    .filter(plr => !plr.alive && (tick - plr.diedAt) > Constants.SPAWNING_TIME)
    .onValue(this.spawnPlayer);

    alive 
    .filter(plr => plr.cooldown && (tick - plr.lastBomb) > Constants.COOLDOWN_TIME)
    .onValue(plr => plr.stopCooldown());

    alive 
    .onValue(plr => {
      lib.syncStream(flames)
      .filter(flame => collisionDetector.collision(plr, flame))
      .first()
      .onValue(killingFlame => this.killPlayer(plr, flame))
    });

   alive 
    .filter(plr => plr.moving)
    .map(plr => {
      let delta = plr.getAttemptedMove();
      return this.attemptMove(plr, delta);
    })
    .onValue(plr => this.emit('player-update', { player: plr }));

  },

  updateBombs (tick) {
    let bombStream  = lib.stream(bombManager.getBombs()),
      bombsToBlow = bombStream.filter(bomb => !bomb.exploded && bomb.active &&
        (tick - bomb.placedAt > Constants.BOMB_TIMER)),
      oldBombs = bombStream.filter(bomb => bomb.exploded),
      newBombs = bombStream.filter(bomb => !bomb.exploded && !bomb.active && 
        (tick - bomb.placedAt > Constants.FUSE_TIME));
    
    oldBombs.onValue(bombManager.removeBomb.bind(bombManager));
    newBombs.onValue(bombManager.activateBomb.bind(bombManager));
    bombsToBlow.onValue(this.explodeBomb.bind(this));
  },

  chainBombs (tiles, bombId) {
    const bombStream = lib.syncStream(bombManager.getBombs());
    
    bombStream
    .filter(bomb => bomb.id !== bombId &&
    this.tileCollision(bomb, tiles))
    .onValue(this.explodeBomb.bind(this));
  },

  tileCollision (bomb, tiles) {
    return !_.isEmpty(_.filter(tiles, tile => collisionDetector.collision(bomb, tile) !== null));
  },

  updateFlames (tick) {
    let oldFlames = [];
    
    lib.syncStream(flames)
    .filter(flame => (tick - flame.spawnTime) > Constants.FLAME_TIME)
    .doAction(flame => delete flames[flame.id])
    .onValue(flame => oldFlames.push(flame));

    if(!_.isEmpty(oldFlames)) 
      this.emit('flames-die', { flames: oldFlames });
  },

  explodeBomb (bomb) {
    if(bomb.exploded) return;

    this.log('bomb ' +bomb.id+ ' exploding at: ' +bomb.x+ ", " +bomb.y);
    
    let tiles = bombManager.explodeBomb(bomb),
        dirtyTiles = _.filter(tiles, tile => tile.value === Constants.TILE_BRICK);
    
    this.emit('bomb-explode', { bomb: bomb });
   
    this.spawnFlames(tiles, bomb.playerId);
    this.updateMap(dirtyTiles);
    this.chainBombs(tiles, bomb.id);
  },

  spawnFlames (tiles, playerId) {
    let newFlames = [],
        now = lastTick;

    B.fromArray(tiles)
      .map(tile => Flame({
        x:  tile.x, 
        y:  tile.y, 
        id: flameId++, 
        playerId: playerId,   
        time: now}))
      .doAction(flame => flames[flame.id] = flame)
      .onValue(flame => { newFlames.push(flame); });
    this.emit('flames-spawn', { flames: newFlames });    
  },

  updateMap (tiles) {
    map.updateMap(tiles);
    this.emit('map-update', { tiles: tiles });
  },

  log (message) {
    let prefix = "Logged from game.js: ";
    console.log(prefix + message);
  },

  direction (x) {
    /* 
    *   x > 0  -> 1
    *   x == 0 -> 0
    *   x < 0  -> -1
    *   Used to determine the player girth so that the collisions
    *   seem authentic. 
    */
    return x > 0 ? 1 : x < 0 ? -1 : 0;
  },

  tick () {
    return new Date().getTime();
  }
};

let gameFactory = function () {
  // Extend the game with the eventemitter prototype
  // so the game object can emit events to server for 
  // communication to the clients.
  let game = Object.create(_.assign({}, EventEmitter.prototype, Game));
  return game;
};

module.exports = gameFactory;
