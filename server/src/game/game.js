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

let _bombId = 0,
    _flameId = _bombId,
    _players = {},
    _flames = {},
    _map = null,
    _bombManager = null,
    _collisionDetector = null,
    _done = false,
    _go = false,
    _countdown = false,
    _lastTick = null,
    _winner = null,
    _timer = null;

let Game = {

  init () {
    _map = new GameMap({ width: Constants.MAP_WIDTH, height: Constants.MAP_HEIGHT });
    _bombManager = BombManager({ map: _map});
    _collisionDetector = CollisionDetector({ map: _map, bombManager: _bombManager});

    this.update();

    // 60 Hz: 1/60 = 0.167 ~ 17 ms
    setInterval(this.update.bind(this), 17);
  },

  startRound () {
    _go = true;
    _timer = 200 * 60;
    this.emit('game', { action: 'begin' });
  },

  endRound () {
    _go = false;
    this.emit('game', { action: 'end', winner: _winner });
  },

  reset () {
    _go = false;
    _done = false;
    _countdown = false;
    _flames = {};
    _.each(_players, plr => {
      plr.reset();
      this.spawnPlayer(plr);
    });

    this.log('game reset');

    // TODO: cleanup
    _map = new GameMap({ width: Constants.MAP_WIDTH, height: Constants.MAP_HEIGHT });
    _bombManager = BombManager({ map: _map});
    _collisionDetector = CollisionDetector({ map: _map, bombManager: _bombManager});
  },

  state () { 
    return { players: _players, map: _map };
  },

  addPlayer (data) {
    let player = new Player(data);
    _players[data.id] = player;

    this.emit('player', { action: 'join', player: player });
    this.spawnPlayer(player);
  },

  spawnPlayer (player) {
    let loc = _map.getValidSpawnLocation();
    this.log('{'+loc.x+','+loc.y+'}: Spawning player: ' +player.name);
    
    player.spawn(loc);
    this.emit('player', { action: 'spawn', player: player });
  },

  removePlayer (id) {
    let plr = _players[id];

    this.log('Removing player with id: ' +id);
    
    delete _players[id];
    this.emit('player', { action: 'leave', player: plr });
  },

  stopPlayer (id) {
    let player = _players[id];

    if(typeof(player) === 'undefined' || !player.alive) return;
    
    this.emit('player', { action: 'update', player: player.stop() });
  },

  movePlayer (data) {
    let player = _players[data.id];

    if(typeof(player) === 'undefined' || !player.alive) return; 

    this.emit('player', { action: 'update', player: player.move(data.dir) });
  },

  killPlayer (player, flame) {
    const killer = _players[flame.playerId],
          suicide = killer === player;

    this.updateScore(player, killer, suicide);
    player.die(_lastTick);

    this.emit('player', { action: 'die', 
      player: player, killer: killer, suicide: suicide });
  },

  attemptMove (player, delta) {
    let playerX     = player.x,
        playerY     = player.y,
        dx          = delta.dx,
        dy          = delta.dy,
        newX = Math.floor(playerX + dx + this.direction(dx)*Constants.PLAYER_GIRTH),
        newY = Math.floor(playerY + dy + this.direction(dy)*Constants.PLAYER_GIRTH);

    // x-axis
    if(!_collisionDetector.canMove(newX, playerY)) {
      dx = 0;
    }
    
    // y-axis
    if(!_collisionDetector.canMove(playerX, newY)) {
      dy = 0;
    }

    return player.deltaMove(dx, dy);
  },

  powerUp (playerId, data) {
    let player = _players[playerId];

    if(player.cooldown || !player.alive || _done || !_go ) return;

    if(data.message === "BEKK") player.supercharge(); 
  },

  placeBomb (playerId) {
    let player = _players[playerId];

    if(player.cooldown || !player.alive || _done || !_go ) return;

    let multiplier = player.poweredUp() ? 2 : 1;
    let opts = {
      id: _bombId++,
      player: player,
      strength: Constants.BOMB_STRENGTH * multiplier,
      time: _lastTick
    };

    let bomb = Bomb(opts);

    player.setCooldown(_lastTick);
    this.log('placing bomb at: ' +bomb.x+ ", " +bomb.y); 

    _bombManager.addBomb(bomb);
    this.emit('bomb', { action: 'place', bomb: bomb });
  },

  gameOver (winner) {  
    winner = winner || this.getWinner(),
      _done = true,
      _winner = winner,
      _go = false;

    this.log("round over");
    this.emit('game', { action: 'end', winner: winner } );
  },

  update () {
    let tick = this.tick();

    if(_done || !_go) return;

    this.updatePlayers(tick);
    this.updateBombs(tick);
    this.updateFlames(tick);

    _timer -= 17; 
    if(_timer <= 0)
      this.gameOver.call(this);
    else if(_timer <= 10000 && !_countdown) {
      _countdown = true;
      this.emit('game', { action: 'countdown' });
    }

    _lastTick = tick;
  },

  updateScore (player, killer, suicide) {
    let update = player;
    if(suicide) {
      player.updateScore(-1);
    } else {
      killer.updateScore(1);
      update = killer;
    }
    
    this.emit('player', { action: 'score', player: update });
  },

  updatePlayers (tick) {
    let winner = this.checkWinners();
    
    if(winner) { 
      return this.gameOver.call(this, winner);
    }

    this.updatePlayerMovement(tick);
  },

  checkWinners () {
    return _.find(_players, plr => plr.score >= Constants.WINNING_SCORE);
  },

  getWinner () {
    return _.max(_players, plr => plr.score);
  },

  updatePlayerMovement (tick) {
    let plrs  = lib.stream(_players),
        alive = plrs.filter(plr => plr.alive);

    plrs 
    .filter(plr => !plr.alive && (tick - plr.diedAt) > Constants.SPAWNING_TIME)
    .onValue(this.spawnPlayer.bind(this));

    alive 
    .filter(plr => plr.cooldown && (tick - plr.lastBomb) > Constants.COOLDOWN_TIME)
    .onValue(plr => plr.stopCooldown());

    alive 
    .onValue(plr => {
      lib.syncStream(_flames)
      .filter(flame => _collisionDetector.collision(plr, flame))
      .first()
      .onValue(killingFlame => this.killPlayer(plr, killingFlame))
    });

   alive 
    .filter(plr => plr.moving)
    .map(plr => {
      let delta = plr.getAttemptedMove();
      return this.attemptMove(plr, delta);
    })
    .onValue(plr => this.emit('player', { action: 'update', player: plr }));

  },

  updateBombs (tick) {
    let bombStream  = lib.stream(_bombManager.getBombs()),
      bombsToBlow = bombStream.filter(bomb => !bomb.exploded && bomb.active &&
        (tick - bomb.placedAt > Constants.BOMB_TIMER)),
      oldBombs = bombStream.filter(bomb => bomb.exploded),
      newBombs = bombStream.filter(bomb => !bomb.exploded && !bomb.active && 
        (tick - bomb.placedAt > Constants.FUSE_TIME));
    
    oldBombs.onValue(_bombManager.removeBomb.bind(_bombManager));
    newBombs.onValue(_bombManager.activateBomb.bind(_bombManager));
    bombsToBlow.onValue(this.explodeBomb.bind(this));
  },

  chainBombs (tiles, bombId) {
    const bombStream = lib.syncStream(_bombManager.getBombs());
    
    bombStream
    .filter(bomb => bomb.id !== bombId &&
    this.tileCollision(bomb, tiles))
    .onValue(this.explodeBomb.bind(this));
  },

  tileCollision (bomb, tiles) {
    return !_.isEmpty(_.filter(tiles, tile => _collisionDetector.collision(bomb, tile) !== null));
  },

  updateFlames (tick) {
    let oldFlames = [];
    
    lib.syncStream(_flames)
    .filter(flame => (tick - flame.spawnTime) > Constants.FLAME_TIME)
    .doAction(flame => delete _flames[flame.id])
    .onValue(flame => oldFlames.push(flame));

    if(!_.isEmpty(oldFlames)) 
      this.emit('flame', { action: 'die', flames: oldFlames });
  },

  explodeBomb (bomb) {
    if(bomb.exploded) return;

    this.log('bomb ' +bomb.id+ ' exploding at: ' +bomb.x+ ", " +bomb.y);
    
    let tiles = _bombManager.explodeBomb(bomb),
        dirtyTiles = _.filter(tiles, tile => tile.value === Constants.TILE_BRICK);
    
    this.emit('bomb', { action: 'explode', bomb: bomb });
   
    this.spawnFlames(tiles, bomb.playerId);
    this.updateMap(dirtyTiles);
    this.chainBombs(tiles, bomb.id);
  },

  spawnFlames (tiles, playerId) {
    let newFlames = [],
        now = _lastTick;

    B.fromArray(tiles)
      .map(tile => Flame({
        x:  tile.x, 
        y:  tile.y, 
        id: _flameId++, 
        playerId: playerId,   
        time: now}))
      .doAction(flame => _flames[flame.id] = flame)
      .onValue(flame => { newFlames.push(flame); });
    this.emit('flame', { action: 'spawn', flames: newFlames });    
  },

  updateMap (tiles) {
    _map.updateMap(tiles);
    this.emit('map', { action: 'update', tiles: tiles });
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
