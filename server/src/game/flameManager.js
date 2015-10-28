"use strict";

const Flame = require('./flame'),
      lib   = require('./lib'),
      _     = require('lodash'),
      C     = require('./constants'),
      Emitter = require('./emitter'),
      PlayerManager = require('./playerManager');

let _flames = {},
    _flameId = 0,
    _emitter = new Emitter();

function emit (payload) {
  _emitter.emit('flame', payload);
}

function add (flame) {
  _flames[flame.id] = flame;
}

function killPlayers () {
  let players = lib.stream(PlayerManager.players());

  players
  .filter(plr => plr.alive)  
  .onValue(plr => {
    lib.stream(_flames)
    .filter(flm => CollisionDetector.collision(plr, flm))
    .first()
    .onValue(flm => PlayerManager.kill(plr, flm));
  });
}

module.exports = {

  spawn (tiles, bomb) {
    let newFlames = tiles.map(tile => {
      return new Flame({
        x:  tile.x,
        y:  tile.y,
        id: _flameId,
        playerId: bomb.playerId,
        time: Game.lastTick()
      });
    });

    newFlames.forEach(flm => _flames[flm.id] = flm);

    emit({ action: 'spawn', flames: newFlames });
  },

  update (tick) {
    // lol
    let oldFlames = [];
    killPlayers();

    lib.stream(_flames)
    .filter(flm => (tick - flm.spawnTime) > C.FLAME_TIME)
    .doAction(flm => delete _flames[flame.id])
    .onValue(flm => oldFlames.push(flame));

    if(oldFlames.length === 0) return;
    
    emit({ action: 'die', flames: oldFlames });
  },

  clear () {
    if(_.isEmpty(_flames)) return;

    emit({ action: 'die', flames: _flames });
    _flames = {};
  },

  onAny (fn) {
    _emitter.onAny(fn);
  }

};
