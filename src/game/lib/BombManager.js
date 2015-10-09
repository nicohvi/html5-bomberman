/*jslint node: true */
"use strict";

let lib   = require('./lib');
let _ = require('lodash');
let B = require('baconjs').Bacon;

const Constants = require('./../constants');

let BombManager = {

  init (opts) {
    this.map = opts.map;
    this.bombs = {};
    return this;
  },
   
  addBomb (bomb) {
    this.bombs[bomb.id] = bomb;
  },

  removeBomb (bomb) {
    delete this.bombs[bomb.id];
  },
  
  removeAllBombs () {
    this.bombs = {};
  },

  getBomb (id) {
    return this.bombs[id];
  },

  hasBomb (x, y) {
    return !_.isEmpty(_.filter(this.bombs, function (bomb) {
      return bomb.x === x && bomb.y === y && bomb.active;
    }));
  },

  activateBomb (bomb) {
    this.bombs[bomb.id].active = true;
  },

  explodeBomb (bomb) {
    if (typeof(bomb) === 'undefined' || bomb.exploded) { 
      return; 
    }
    bomb.exploded = true;
    return this.getTiles(bomb);
  },

  getTiles (bomb) {
    let horizontalTiles = this.map.getRowTiles(lib.range(bomb.x - bomb.strength, bomb.x + bomb.strength), bomb.y),
    verticalTiles = this.map.getColumnTiles(lib.range(bomb.y - bomb.strength, bomb.y + bomb.strength), bomb.x);

    let tiles = this.filterTiles(horizontalTiles).concat(this.filterTiles(verticalTiles));
    return tiles; 
  },

  getDirtyTiles (tiles) {
    return _.filter(tiles, function (tile) {
      return tile.value === Constants.TILE_BRICK;
    });
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
  return bombManager.init(opts);
};

module.exports = bombManagerFactory;

