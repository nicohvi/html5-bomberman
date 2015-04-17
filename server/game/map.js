/*jslint node: true */
"use strict";

var _ = require('lodash');
var Tile = require('./tile');

// Constants
var TILE_EMPTY = 0,
    TILE_SOLID = 2,
    TILE_BRICK = 1,
    DEFAULT_WIDTH = 50,
    DEFAULT_HEIGHT = 40;

var MapGenerator = function (opts) {
  opts = opts || {};
  this.width = opts.width;
  this.height = opts.height;
  this.map = new Array(this.width * this.height).fill(0);
};

MapGenerator.prototype.generateMap = function () {
  this.generateTerrain();
  this.generateWalls();
};

MapGenerator.prototype.generateTerrain = function () {
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
      else if (_.floor(_.random(9) === 0)) {
        this.setTile(xCoord, yCoord, TILE_BRICK);
      }
    });
  }.bind(this));
};

MapGenerator.prototype.setTile = function (xCoord, yCoord, value) {
  this.map[yCoord * this.width + xCoord] = value;
};

var Map = function (opts) {
  opts = opts || {};

  this.width = opts.width || DEFAULT_WIDTH;
  this.height = opts.height || DEFAULT_HEIGHT;

  this.generator = new MapGenerator(this.width, this.height);
  this.tiles = this.generator.generateMap();
};

Map.prototype.getTile = function (xCoord, yCoord) {
  if(!this._testBounds(xCoord, yCoord)) { return -1; }
  return this.tiles[yCoord * this.width + xCoord];
};

Map.prototype.getRowTiles = function (range, column) {
  return _.forEach(range, function (xCoord) { 
    return new Tile(xCoord, column, this.getTile(column * this.width + xCoord));
  }.bind(this));
};

Map.prototype.getColumnTiles = function (range, row) {
  return _.forEach(range, function (yCoord) { 
    return new Tile(row, yCoord, this.getTile(yCoord* this.width + row));
  }.bind(this));
};

Map.prototype.setTile = function (xCoord, yCoord, value) {
  if(!this._testBounds(xCoord, yCoord)) { return -1; }
  this.tiles[yCoord * this.width + xCoord] = value;
};

Map.prototype.getValidSpawnLocation = function() {
  var valid = false,
          x = 0,
          y = 0;
 
  while(!valid) {
    x = _.floor(_.random() * this.width);
    y = _.floor(_.random() * this.height);

    valid = this.getTile(x, y) === TILE_EMPTY;
  } 
  return { x: x, y: y }; 
};

Map.prototype._testBounds = function (x, y) {
  return (this.width <= x < 0) || (this.height <= y < 0);
};



        //canMove: function(x,y) {
          //return this.getTile(x,y) == TILE_EMPTY;
        //},

        //getTile: function(x, y) {
          //if(this.get('width')  <= x < 0) return -1;
          //if(this.get('height') <= y < 0) return -1;
          //return this.get('map')[y * this.get('width') + x];
        //},

        //setTile: function (x, y, value) {
          //x = Math.floor(x),
          //y = Math.floor(y);
          //if(this.get('width')  <= x < 0) return;
          //if(this.get('height') <= y < 0) return;

          //var index = y * this.get('width') + x;
          //var map = this.get('map'); 
  
          //console.log('Setting tile ' +x+ ', ' +y+ ' to ' +value);
          //map = map.substr(0, index) + value + map.substr(index+1);
          //this.set('map', map);
        //},

        //getXBombTiles: function (xStart, xEnd, y) {
          //var result = [],
              //stop = false;

          //if(xStart > xEnd) {
            //for( var i = xStart; i >= xEnd; i--) {
              //var tile = this.getTile(i, y);
              //if(stop) 
                //break;
              //switch (tile) {
                //case "0":
                  //result.push(new Tile(i, y, tile));
                  //break;
                //case "1":
                  //stop = true;
                  //result.push(new Tile(i, y, tile));
                  //break;
                //case "2":
                  //stop = true;
                  //break;
              //}
            //}
          //} else {
            //for(var i = xStart; i <= xEnd; i++) {
              //var tile = this.getTile(i, y);
              //if(stop) 
                //break;
              //switch (tile) {
                //case "0":
                  //result.push(new Tile(i, y, tile));
                  //break;
                //case "1":
                  //stop = true;
                  //result.push(new Tile(i, y, tile));
                  //break;
                //case "2":
                  //stop = true;
                  //break;
                //default: 
                  //break;
              //}
            //}  
          //}
          //return result;
        //},

        //getYBombTiles: function (yStart, yEnd, x) {
          //var result = [],
              //stop = false;
          //if(yStart > yEnd) {
            //for( var i = yStart; i >= yEnd; i--) {
              //var tile = this.getTile(x, i);
              //if(stop)
                //break;
              //switch (tile) {
                //case "0":
                  //result.push(new Tile(x, i, tile));
                  //break;
                //case "1":
                  //stop = true;
                  //result.push(new Tile(x, i, tile));
                  //break;
                //case "2":
                  //stop = true;
                  //break;
              //}
            //}
          //} else {
            //for(var i = yStart; i <= yEnd; i++) {
              //if(stop)
                //break;
              //var tile = this.getTile(x, i);
              //switch (tile) {
                //case "0":
                  //result.push(new Tile(x, i, tile));
                  //break;
                //case "1":
                  //stop = true;
                  //result.push(new Tile(x, i, tile));
                  //break;
                //case "2":
                  //stop = true;
                  //break;
              //}
            //}  
          //}
          //return result;
        //},

        //updateMap: function (tiles) {
          //var map = this.get('map');
          //_.each(tiles, function (tile) {
            //this.setTile(tile.x, tile.y, TILE_EMPTY);
          //}.bind(this));
        //},

        //getMap: function() {
            //return {
                //width: this.get('width'),
                //height: this.get('height'),
                //map: this.get('map')
            //}
        //},

