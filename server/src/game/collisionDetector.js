"use strict";

const C   = require('./constants'),
      Map = require('./map');

function collision (actor, tile) {
  if( Math.floor(actor.x) === Math.floor(tile.x) && 
        Math.floor(actor.y) === Math.floor(tile.y)) {
      console.log('collision at: ' +actor.x+ ', ' +actor.y);
      return tile;
    }
    return null; 
};

module.exports = {

  canMove (x, y) {
    let tile = Map.getTile(x, y);
    return tile.value === C.TILE_EMPTY;
  },

  collision (actor, tiles) {
    if(typeof(tiles) !== 'Array') return collision(actor, tiles);
    return tiles.some(tile => collision(actor, tile));
  }
};

