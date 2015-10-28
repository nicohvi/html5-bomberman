"use strict";

const _     = require('lodash'),
      Bomb  = require('./bomb'),
      C     = require('./constants'),
      lib   = require('./lib'),
      Emitter = require('./emitter'),
      FlameManager = require('./flameManager');

let _bombs = {},
    _bombId = 0,
    _emitter = new Emitter();

function emit (payload) {
  _emitter.emit('bomb', payload);
}

function add (bomb) {
  _bombs[bomb.id] = bomb;
}

function remove (bomb) {
  delete _bombs[bomb.id];  
}

function getTiles (bomb) {
  let xRange = lib.bombRange(bomb.x, bomb.strength);
  let yRange = lib.bombRange(bomb.y, bomb.strength);

  let xTiles = map.getXTiles(xRange, bomb.y)
  let yTiles = map.getYTiles(yRange, bomb.x); 

  return 
    filterTiles(xTiles, bomb.strength)
    .concat(filterTiles(yTiles, bomb.strength));
}

function filterTiles (tiles, bombStrength) {
  let paths = _.chunk(tiles, bombStrength+1),
      result = [];

  // reverse so that we start from the blast zone.
  _(paths[0]).reverse().value();
  
  _.times(paths.length, i => {
    let brick = false;
    B.fromArray(paths[i])
      .takeWhile(tile => !brick && tile.value !== C.TILE_SOLID) 
      .doAction(tile => brick = tile.value === C.TILE_BRICK)
      .onValue(tile => result.push(tile));
  });

  return result;
}

function boom (bomb) {
  if(bomb.exploded) return;

  console.log('Bomb ' +bomb.id+ ' exploding at: ' +bomb.x+ ', ' +
  bomb.y);
  
  let tiles = getTiles(bomb.explode());

  Map.setDirtyTiles(tiles);
  FlameManager.spawn(tiles, bomb.id);

  emit({ action: 'explode', bomb: bomb });
  chainBombs(bomb.id, tiles);
}

function chainBombs (bombId, tiles) {
  lib.stream(_bombs)
  .filter(bmb => bmb.id != bombId)
  .filter(CollisionDetector.collision(bmb, tiles))
  .onValue(boom);
}

// Public
module.exports = {

  update (tick) {
    let bombStream  = lib.stream(_bombs);
    let bombsToBlow = bombStream
    .filter(bmb => !bmb.exploded && bmb.active) 
    .filter(bmb => tick - bmb.placedAt > C.BOMB_TIMER);
    let newBombs  = bombStream
    .filter(bmb => !bmb.exploded && !bmb.active)
    .filter(bmb => tick - bmb.placedAt > C.FUSE_TIME);
    let oldBombs  = bombStream.filter(bmb => bmb.exploded);
    
    oldBombs.onValue(remove)
    newBombs.onValue(bmb => bmb.activate);
    bombsToBlow.onValue(boom);
  },
  
  placeBomb (data, time) {
    let opts = {
      id: _bombId++,
      playerId: data.id,
      strength: C.BOMB_STRENGTH,
      time: time
    };

    let bomb = new Bomb(opts);

    console.log('placing bomb at: ' +bomb.x+ ", " +bomb.y); 

    add(bomb);
    emit({ action: 'place', bomb: bomb });
  },
   
  clear () {
    _bombs = {};
    emit({ action: 'clear' });
  },

  hasBomb (x, y) {
    return !_.isEmpty(
      _.filter(bombs, bomb => bomb.x === x && bomb.y === y && bomb.active));
  },

  onAny (fn) {
    _emitter.onAny(fn);
  }

};
