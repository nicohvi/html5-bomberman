"use strict";

const Game  = require('./game'),
      lib   = require('./lib'),
      C = require('./constants'),
      _actions = {
        'ADD':  add,
        'DEL':  remove,
        'STP':  stop,
        'MOV':  setMoving,
        'BMB':  bomb
        };

let _players = {},
    _winner = null;

function add (data) {
  let plr = new Player(data);
  _players[plr.id] = plr;

  setTimeout(() => spawnPlayer(plr), 1000);

  return { action: 'join', player: plr };
}

function score (player, killer, suicide) {
  let plrToUpdate = player;

  if(suicide) {
    player.updateScore(-1);
  } else {
    killer.updateScore(1);
    plrToUpdate = killer;
  }
  
  Game.emit('player', { action: 'score', player: plrToUpdate });
}

function checkWinner () {
  _winner = _.first(_.filter(_players, plr => plr.score >= C.WINNING_SCORE));
}

function remove (data) {
  console.log('Removing player with id: ' +data.id);
  delete _players[data.id];
  return { action: 'leave', id: data.id };
}

// TODO: Decorate with Active and NOT NULL

function setMoving (data) {
  let plr = _players[data.id];
  if(!plr || !plr.alive) 
    return { action: 'error', message: 'Player is dead' };

  let dir = data.dir;
  return { action: 'update', player: plr.move(dir) };
}

function stop (data) {
  let plr = _players[data.id];
  
  if(!plr || !plr.alive) 
    return { action: 'error', message: 'Player is dead' };

  return { action: 'update', player: plr.stop() };
}

function bomb (data) {
  let plr = _players[data.id];

  if(!plr || !plr.alive || plr.cooldown)
    return { action: 'error' };

  plr.setCooldown(Game.lastTick);
}

function spawn (plr) {
  let loc = Map.getValidSpawnLocation();
  
  console.log('Spawning player at: '+plr.x+ ', '+plr.y);
  player.spawn(loc);
  
  Game.emit('player', { action: 'spawn', player: plr });
}

function move (plr, delta) {
  let dx = Math.floor(plr.x + delta.dx + direction(dx) * C.GIRTH);
  let dy = Math.floor(plr.y + delta.dy + direction(dy) * C.GIRTH);

  dx = CollisionDetector.canMove(dx, plr.y) ? dx : 0;
  dy = CollisionDetector.canMove(plr.x, dy) ? dy : 0;
  
  return (dx === 0 && dy === 0) ? null : plr.deltaMove(dx, dy);
}

module.exports = {

  getPlayer (id) {
    return _players[id];
  },

  players () {
    return _players;
  },

  perform (action, data) {
    if(!_actions[action]) 
      return console.log('Invalid player action called');
    let payload = _actions[action].call(this, data);
    if(payload) Game.emit('player', payload);
    if(data.callback) data.callback.call(null, data);
  },

  update (tick) {
    const plrs = lib.stream(_plrs),
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
    .onValue(plr => Game.emit('player', { action: 'update', player: plr }));
  },

  kill (player, flame) {
    const killer = _players[flame.playerId],
          suicide = killer === player;

    updateScore(player, killer, suicide);
    player.die(Game.lastTick());

    Game.emit('player', { action: 'die', 
      player: player, killer: killer, suicide: suicide });
  },

  winner () {
    return _winner || _.max(_players, plr => plr.score);
  },

  reset () {
    _.each(_players, plr => {
      plr.reset();
      spawnPlayer(plr);
    });
  }
};
  
