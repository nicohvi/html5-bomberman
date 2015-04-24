/*jslint node: true */
"use strict";

let util = require('util');

// Constants
let TILE_BRICK = 1,
    TILE_SOLID = 2;

let _ = require('lodash');

let BombManager = {
   
  addBomb (bomb) {
    this.bombs[bomb.id] = bomb;
  },

  removeBomb (bomb) {
    delete this.bombs[bomb.id];
  },

  activateBomb (bomb) {
    this.bombs[bomb.id].active = true;
  },
 
  hasBomb (x, y) {
    return !_.isEmpty(_.filter(this.bombs, function (bomb) {
      return bomb.x === x && bomb.y === y;
    }));
  },
  
  getBomb (id) {
    return this.bombs[id];
  },

   explodeBomb (id) {
    let bomb = this.bombs[id];
    if (typeof(bomb) === 'undefined' || bomb.exploded) { 
      return; 
    }
    
    let tiles = this.getTiles(bomb);
    this.dangerTiles = _.flatten(this.dangerTiles.push(tiles));
    return this.getDirtyTiles(tiles);
  },
  
  getTiles (bomb) {
    let horizontalTiles = this.map.getRowTiles(_.range(bomb.x - bomb.strength, bomb.x + bomb.strength), bomb.y),
    verticalTiles = this.map.getColumnTiles(_.range(bomb.y - bomb.strength, bomb.y + bomb.strength), bomb.x);

    horizontalTiles = this._filterTiles(horizontalTiles, bomb);
    verticalTiles   = this._filterTiles(verticalTiles, bomb);

    return horizontalTiles.concat(verticalTiles);
  },

  getDirtyTiles (tiles) {
    return _.filter(tiles, function (tile) {
      return tile.value === TILE_BRICK;
    });
  },

  filterTiles (tiles, bomb) {
    let paths = _.chunck(tiles, bomb.strength+1);
    _(paths[0]).reverse();
   
    let test = _.times(2, function (i) {
      return _.takeWhile(paths[i], function (tile, j) {
        return  tile.value !== TILE_SOLID ||
                ( typeof(paths[i][j-1]) !== 'undefined' &&
                paths[i][j-1].value !== TILE_BRICK );
      });
    });
    // TODO
    console.log(util.inspect(test));
    return test;
  }

};

let bombManagerFactory = function (opts) {
  return _.assign(Object.create(BombManager), {
    map: opts.map,
    bombs: {},
    flames: {},
    dangerTiles: []
  });
};

module.exports = bombManagerFactory;

