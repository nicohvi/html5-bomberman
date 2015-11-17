/*jshint browserify: true */
"use strict";

let _width = null,
    _height = null,
    _tiles = null;

let Map = {
  init (opts) {
    _width  = opts.width;
    _height = opts.height;
    _tiles  = opts.tiles;
  },

  getTile (x, y) {
    return _tiles[y * _width + x]; 
  },

  getBounds () {
    return { width: _width, height: _height };
  },

  setTile (xCoord, yCoord, value) {
    _tiles[yCoord * _width + xCoord] = value;
  },

  update (tiles) {
    tiles.forEach(tile => this.setTile(tile.x, tile.y, 0));
  }

};

module.exports = Map;
