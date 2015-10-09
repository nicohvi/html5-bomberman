/*jslint node: true */
"use strict";

let Tile = {};

let tileFactory = function (x, y, value) {
  let tile = Object.create(Tile);
  tile.x = x;
  tile.y = y;
  tile.value = value;
  
  return tile;
};

module.exports = tileFactory;
