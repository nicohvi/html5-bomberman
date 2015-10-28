"use strict";

const Game  = require('./game'),
      lib   = require('./lib'),
      _     = require('lodash'),
      Emitter = require('./emitter'),
      C       = require('./constants'),
      Player  = require('./player'),
      Map     = require('./map'),
      _actions = {
        'ADD':  add,
        'DEL':  remove,
        'STP':  stop,
        'MOV':  setMoving,
        'BMB':  bomb
        };

let _players = {},
    _winner = null,
    _emitter = new Emitter();

function emit (payload) {
  _emitter.emit('player', payload); 
}

function add (data) {
  let plr = new Player(data);
  _players[plr.id] = plr;

  setTimeout(() => spawn(plr), C.SPAWN_TIME);
  
  return plr;
}

function score (player, killer, suicide) {
  let plrToUpdate = player;

  if(suicide) {
    player.updateScore(-1);
  } else {
    killer.updateScore(1);
    plrToUpdate = killer;
  }
  
  emit({ action: 'score', player: plrToUpdate });
}

function checkWinner () {
  _winner = _.first(_.filter(_players, plr => plr.score >= C.WINNING_SCORE));
}

function remove (data) {
  console.log('Removing player with id: ' +data.id);
  delete _players[data.id];
  emit({ action: 'leave', id: data.id });
}

// TODO: Decorate with Active and NOT NULL

function setMoving (data) {
  let plr = _players[data.id];

  if(!plr || !plr.alive) 
    return plr;

  let dir = data.dir;
  return { action: 'update', player: plr.move(dir) };
}

function stop (data) {
  let plr = _players[data.id];
  
  if(!plr || !plr.alive) 
    return plr;

  emit({action: 'update', player: plr.stop()});

  return plr;
}

function bomb (data) {
  let plr = _players[data.id];

  if(!plr || !plr.alive || plr.cooldown)
    return plr;

  plr.setCooldown(Game.lastTick);
}

function spawn (plr) {
  let loc = Map.getValidSpawnLocation();
  
  console.log('Spawning player at: '+loc.x+ ', '+loc.y);
  plr.spawn(loc);
  
  emit({action: 'spawn', player: plr });
}

function move (plr, delta) {
  let dx = Math.floor(plr.x + delta.dx + direction(dx) * C.GIRTH);
  let dy = Math.floor(plr.y + delta.dy + direction(dy) * C.GIRTH);

  dx = CollisionDetector.canMove(dx, plr.y) ? dx : 0;
  dy = CollisionDetector.canMove(plr.x, dy) ? dy : 0;
  
  return (dx === 0 && dy === 0) ? null : plr.deltaMove(dx, dy);
}

module.exports = {

  players () {
    return _players;
  },

  perform (action, data) {
    if(!_actions[action]) 
      return console.log('Invalid player action called');
    let plr = _actions[action].call(this, data);
    return new Promise(resolve => resolve(plr));
  },

  update (tick) {
    const plrs = lib.stream(_players),
          alive = plrs.filter(plr => plr.alive),
          dead  = plrs.filter(plr => !plr.alive);

    checkWinner();

    // Spawn players
    dead
    .filter(plr => (tick - plr.diedAt) > C.SPAWN_TIME)
    .onValue(spawn);

    // Stop cooldown
    alive
    .filter(plr => plr.cooldown)
    .filter(plr => (tick - plr.lastBomb) > C.COOLDOWN)
    .onValue(plr => plr.stopCooldown);

    // Move players
    alive
    .filter(plr => plr.moving)
    .map(plr => {
      let delta = plr.getDeltaMove();
      return move(plr, delta)
    })
    .onValue(plr => emit({ action: 'update', player: plr }));
  },

  kill (player, flame) {
    const killer = _players[flame.playerId],
          suicide = killer === player;

    updateScore(player, killer, suicide);
    player.die(Game.lastTick());

    emit({ action: die, player: player, killer: killer, suicide: suicide });
  },

  //winner () {
    //return _winner || checkWinner();
  //},

  reset () {
    _.each(_players, plr => {
      plr.reset();
      spawnPlayer(plr);
    });
  },

  onAny (fn) {
    _emitter.onAny(fn);
  }

};
  
