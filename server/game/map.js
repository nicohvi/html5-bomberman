/*jslint node: true */
"use strict";

let _ = require('lodash');
//let util = require('util');

let Tile  = require('./tile');
let lib   = require('./lib/lib');

// Constants
const TILE_EMPTY = 0,
      TILE_SOLID = 2,
      TILE_BRICK = 1,
      DEFAULT_WIDTH = 50,
      DEFAULT_HEIGHT = 40;

let MapGenerator = {
  init (width, height) {
    this.width = width;
    this.height = height;
    this.map = _.fill(new Array(this.width * this.height), 0);
    return this;
  },

  generateMap () {
    _.times(this.height, function (yCoord) {
      _.times(this.width, function (xCoord) {
        // Wall test
        if(xCoord === 0 || xCoord === this.width - 1 || yCoord === 0 || yCoord === this.height - 1 ) {
          this.setTile(xCoord, yCoord, TILE_SOLID);
        }
        // All even tiles are solid
        else if (xCoord % 2 === 0 && yCoord % 2 === 0){
          this.setTile(xCoord, yCoord, TILE_SOLID);
        }
        // Randomize the bricks
        else if (lib.floor(_.random(9) === 0)) {
          this.setTile(xCoord, yCoord, TILE_BRICK);
        }
      }.bind(this));
    }.bind(this));

  return this.map;
  },

  setTile (xCoord, yCoord, value) {
    this.map[yCoord * this.width + xCoord] = value;
  },

};

let mapGeneratorFactory = function (widht, height) {
  let mapGenerator = Object.create(MapGenerator);
  return mapGenerator.init(widht, height);
};

let GameMap = {
  init (opts) {
    opts = opts || {};

    this.width = opts.width || DEFAULT_WIDTH;
    this.height = opts.height || DEFAULT_HEIGHT;

    this.generator = mapGeneratorFactory(this.width, this.height);
    this.tiles = this.generator.generateMap();

    return this;
  },

  getTile (xCoord, yCoord) {
    if(this.invalidValues(xCoord, yCoord)) { return -1; }
    
    let x = lib.floor(xCoord),
        y = lib.floor(yCoord);

    return this.tiles[y * this.width + x];
  },

  getRowTiles (xRange, yCoord) {
    return _.map(xRange, function (xCoord) { 
      return Tile(xCoord, yCoord, this.getTile(xCoord, yCoord));
    }.bind(this));
  },

  getColumnTiles (yRange, xCoord) {
    return _.map(yRange, function (yCoord) { 
      return Tile(xCoord, yCoord, this.getTile(xCoord, yCoord));
    }.bind(this));
  },

  updateMap (tiles) {
    _.forEach(tiles, function (tile) {
      this.setTile(tile.x, tile.y, TILE_EMPTY);
    }.bind(this));
  },

  setTile (xCoord, yCoord, value) {
    if(this.invalidValues(xCoord, yCoord)) { return -1; }
    this.tiles[yCoord * this.width + xCoord] = value;
  },

  getValidSpawnLocation () {
    let valid = false,
            x = 0,
            y = 0;
   
    while(!valid) {
      x = lib.floor(_.random(0, this.width));
      y = lib.floor(_.random(0, this.height));
      valid = this.getTile(x, y) === TILE_EMPTY;
    } 
    return { x: x, y: y }; 
  },

  invalidValues (x, y) {
    return (this.width <= x && x <= 0) || (this.height <= y && y <= 0);
  }
};

let mapFactory = function (opts) {
  let map = Object.create(GameMap);
  return map.init(opts);
};

module.exports = mapFactory;
