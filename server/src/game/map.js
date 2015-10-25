"use strict";

const _ = require('lodash'),
  Tile  = require('./tile'),
  C = require('./constants'),
  MapGenerator = require('./mapGenerator');

let _width = null,
    _height = null,
    _map = null,
    _dirtyTiles = [];

function checkBounds (x, y) {
  return (x <= _width && x >= 0) || (y <= _height && y >= 0);
}

function setTile (tile, newValue) {
  let value = newValue || tile.value;
  _map[tile.y * _width + tile.x] = value;
}

function getTile (x, y) {
  if(!checkBounds(x, y)) return;
  
  x = Math.floor(x);
  y = Math.floor(y);

  return _map[y * _width + x];
};

module.exports = {
  generate (opts) {
    opts = opts || {};

    _width  = opts.width || C.MAP_WIDTH;
    _height = opts.height || C.MAP_HEIGHT;

    _map = MapGenerator.generate(_width, _height);
  },

  getXTiles (xRange, y) {
    return xRange.map(x => getTile(x, y));
  },

  getYTiles (yRange, xCoord) {
    return yRange.map(y => getTile(x, y));
  },

  update () {
    if(_dirtyTiles.length === 0) return; 

    let newTiles = _dirtyTiles
      .filter(tile => checkBounds(tile.x, tile.y))
      .forEach(tile => setTile(tile, C.TILE_EMPTY))
      .map(tile => getTile(tile.x, tile.y));

    Game.emit('map', { action: 'update', tiles: newTiles });
  },

  setDirtyTiles (tiles) {
    _dirtyTiles = tiles
    .filter(tile => tile.value === C.TILE_BRICK);
  },

  getValidSpawnLocation () {
    let valid = false,
            x = 0,
            y = 0,
        cand  = null;
  
    // TODO: Timeout
    while(!valid) {
      x = Math.floor(_.random(0, _width));
      y = Math.floor(_.random(0, _height));
      cand = this.getTile(x, y);
      valid = cand.value === C.TILE_EMPTY;
    } 
    return cand;
  },

  get () {
    return _map;
  }

};
