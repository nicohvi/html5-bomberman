"use strict";

const _ = require('lodash'),
  B = require('baconjs').Bacon,
  Emitter = require('./emitter'),
  lib = require('./lib'),
  Player  = require('./player'),
  Bomb    = require('./bomb'),
  Flame   = require('./flame'),
  Map     = require('./map'),
  C       = require('./constants'),
  CollisionDetector = require('./collisionDetector'),
  BombManager       = require('./bombManager'),
  PlayerManager     = require('./playerManager'),
  FlameManager      = require('./flameManager');

let _go = false,
    _countdown = false,
    _lastTick = null,
    _timer = null,
    _emitter = new Emitter();

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
    emit('game', { action: 'countdown' });
  }
}

function gameOver() {
  let winner = PlayerManager.winner();
  _go = false;

  console.log('Game over');
  
  FlameManager.clear();
  BombManager.clear();

  emit('game', { action: 'end', winner: winner });
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

function emit (msg, payload) {
  _emitter.emit(msg, payload);
}

module.exports = {

  setup () {
    Map.generate();

    PlayerManager.onAny(emit);
    BombManager.onAny(emit);
    FlameManager.onAny(emit);

    update();
    // 60 Hz: 1/60 = 0.167 ~ 17 ms
    setInterval(update, 17);
    emit('game', { action: 'lol' });
  },

  start () {
    _go = true;

    // 5 minutes
    _timer = 300000;
    emit('game', { action: 'begin' });
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
    return { players: PlayerManager.players(), map: Map.get() };
  },

  player (data, action) {
    return new Promise((resolve, reject) => {
    PlayerManager.perform(action, data).then(plr => {
      if(action === 'BMB') 
        BombManager.placeBomb.bind(null, data, _lastTick);
      resolve(plr);
    });
    });
  },

  lastTick () {
    return _lastTick;
  },
  
  onMany (events, fn) {
    _emitter.onMany(events, fn);
  },

  on (event, fn) {
    _emitter.on(event, fn);
  }

};

