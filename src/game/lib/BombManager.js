/*jslint node: true */
"use strict";

const lib   = require('./lib'),
      _ = require('lodash'),
      B = require('baconjs').Bacon,
      Constants = require('./../constants');

let bombs = null,
    map = null;

let BombManager = {

  init (opts) {
    map = opts.map;
    bombs = {};
  },

  getBombs () {
    return bombs;
  },
   
  addBomb (bomb) {
    bombs[bomb.id] = bomb;
  },

  removeBomb (bomb) {
    delete bombs[bomb.id];
  },
  
  removeAllBombs () {
    bombs = {};
  },

  getBomb (id) {
    return bombs[id];
  },

  hasBomb (x, y) {
    return !_.isEmpty(_.filter(bombs, bomb => bomb.x === x && bomb.y === y && bomb.active));
  },

  activateBomb (bomb) {
    bombs[bomb.id].active = true;
  },

  explodeBomb (bomb) {
    if (typeof(bomb) === 'undefined' || bomb.exploded) { 
      return; 
    }
    bomb.exploded = true;
    return this.getTiles(bomb);
  },

  getTiles (bomb) {
    let horizontalTiles = map.getRowTiles(lib.range(bomb.x - bomb.strength, bomb.x + bomb.strength), bomb.y),
    verticalTiles = map.getColumnTiles(lib.range(bomb.y - bomb.strength, bomb.y + bomb.strength), bomb.x);

    let tiles = this.filterTiles(horizontalTiles).concat(this.filterTiles(verticalTiles));
    return tiles; 
  },

  getDirtyTiles (tiles) {
    return _.filter(tiles, tile => tile.value === Constants.TILE_BRICK);
  },

  filterTiles (tiles) {
    let paths = _.chunk(tiles, Constants.BOMB_STRENGTH+1),
        result = [];

    // reverse so that we start from the blast zone.
    _(paths[0]).reverse().value();
    
    _.times(paths.length, function (i) {
      let brick = false;
      B.fromArray(paths[i])
        .takeWhile(tile => !brick && tile.value !== Constants.TILE_SOLID) 
        .doAction(tile => brick = tile.value === Constants.TILE_BRICK)
        .onValue(tile => result.push(tile));
    });

    return result;
  }

};

let bombManagerFactory = function (opts) {
  let bombManager = Object.create(BombManager);
  bombManager.init(opts);
  return bombManager;
};

module.exports = bombManagerFactory;

