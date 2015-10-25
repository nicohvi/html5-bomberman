"use strict";

const _     = require('lodash'),
      C     = require('./constants'),
      Tile  = require('./tile');

let _width  = null,
    _height = null,
    _tiles  = [];

function wallCheck (x, y) {
  return  x === 0 || x === _width - 1 || 
          y === 0 || y === _height - 1;
}

function populateMap () {
  _.times(_height, y => {
    _.times(_width, x => {
      if(wallCheck(x,y))
        setTile(x, y, C.TILE_SOLID);
      // All even tiles are solid
      else if (x % 2 === 0 && y % 2 === 0)
        setTile(x, y, C.TILE_SOLID);
      else if (Math.floor(_.random(9) === 0)) 
        setTile(x, y, C.TILE_BRICK);
  })})
}

function setTile (x, y, val) {
  _tiles[y * _width + x] = new Tile(x, y, val);
}

module.exports = {
  generate (width, height) {
    _width = width;
    _height = height;
    _tiles = _.fill(new Array(_width * _height), null);

    populateMap();
    return _tiles;
  }
}
