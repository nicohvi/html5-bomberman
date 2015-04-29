/*jshint browserify: true */
"use strict";

//var _ = require('lodash');

let map = {
  init (opts) {
    this.width  = opts.width;
    this.height = opts.height;
    this.tiles  = opts.tiles;
  },

 getTile (xCoord, yCoord) {
    return this.tiles[yCoord * this.width + xCoord]; 
  },

  setTile (xCoord, yCoord, value) {
    this.tiles[yCoord * this.width + xCoord] = value;
  },

  update (tiles) {
    tiles.forEach(tile => this.setTile(tile.x, tile.y, 0));
  }

};

module.exports = map;

//function Map (data) {
    //this.x = data.x,
    //this.y = data.y,
    //this.width = data.width;
    //this.height = data.height;
    //this.map = data.map;
    //this.canvas = new Canvas(this);
  //},

  //getTile: function (x, y) {
    //var index = (y * this.width) + x;
    //return this.map[index]; 
  //},

  //updateTile: function (x, y, value) {
    //var index = (y * this.width) + x;
    //this.map = this.map.substr(0, index) + value + this.map.substr(index+1);
  //}
  
//}
