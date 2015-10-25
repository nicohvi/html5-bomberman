"use strict";

const _ = require('lodash'),
  B = require('baconjs').Bacon,
  ext = require('../../event'),
  EventEmitter = ext(require('events').EventEmitter),
  emitter = new EventEmitter(),
  lib = require('./lib'),
  Player  = require('./player'),
  Bomb    = require('./bomb'),
  Flame   = require('./flame'),
  Map     = require('./map'),
  C       = require('./constants'),
  CollisionDetector = require('./collisionDetector'),
  BombManager       = require('./bombManager'),
  PlayerManager     = require('./playerManager');

let _go = false,
    _countdown = false,
    _lastTick = null,
    _timer = null;

function update () {
  let now = tick();

  if(!_go) return;

  PlayerManager.update(now);

  if(PlayerManager.winner()) return gameOver();

  BombManager.update(now);
  FlameManager.update(now);
  Map.update();

  updateTimer();

  _lastTick = now;
};

function updateTimer () {
  _timer -= 17; 
  if(_timer <= 0)
    gameOver();
  else if(_timer <= C.ROUND_TIME && !_countdown) {
    _countdown = true;
    Game.emit('game', { action: 'countdown' });
  }
}

function gameOver() {
  let winner = PlayerManager.winner();
  _go = false;

  console.log('Game over');
  
  FlameManager.clear();
  BombManager.clear();

  Game.emit('game', { action: 'end', winner: winner });
}

function direction (x) {
  /* 
  *   x > 0  -> 1
  *   x == 0 -> 0
  *   x < 0  -> -1
  *   Used to determine the player girth so that the collisions
  *   seem authentic. 
  */
  return x > 0 ? 1 : x < 0 ? -1 : 0;
}

function tick () {
  return new Date().getTime();
}

module.exports = {

  setup () {
    Map.generate();
    
    update();
    // 60 Hz: 1/60 = 0.167 ~ 17 ms
    setInterval(update, 17);
  },

  start () {
    _go = true;

    // 5 minutes
    _timer = 300000;
    this.emit('game', { action: 'begin' });
  },

  reset () {
    _go = false;
    _done = false;
    _countdown = false;
    _flames = {};

    PlayerManager.reset();
    Map.generate();

    console.log('Game reset');
  },

  state () { 
    return { players: _players, map: Map.get() };
  },

  player (data, action) {
    if(action === 'BMB') 
      data.callback = BombManager.placeBomb.bind(null, data, _lastTick);

    PlayerManager.perform(action, data);
  },

  lastTick () {
    return _lastTick;
  },
  
  on (event, fn) {
    emitter.on(event, fn);
  },

  onMany (events, fn) {
    emitter.onMany(events, fn);
  },

  emit(msg, payload) {
    emitter.emit(msg, payload);
  }
};

