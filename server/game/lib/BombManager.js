/*jslint node: true */
"use strict";

var util = require('util');

// Constants
var TILE_BRICK = 1,
    TILE_SOLID = 2;

var _ = require('lodash');

var BombManager = {
  init: function (map) {
    map = this.map;
  },

  getTiles: function (bomb) {
    var horizontalTiles = this.map.getRowTiles(_.range(bomb.x - bomb.strength, bomb.x + bomb.strength), bomb.y),
    verticalTiles = this.map.getColumnTiles(_.range(bomb.y - bomb.strength, bomb.y + bomb.strength), bomb.x);

    horizontalTiles = this._filterTiles(horizontalTiles, bomb);
    verticalTiles   = this._filterTiles(verticalTiles, bomb);

    return horizontalTiles.concat(verticalTiles);
  },

  getDirtyTiles: function (tiles) {
    return _.filter(tiles, function (tile) {
      return tile.value === TILE_BRICK;
    });
  },

  _filterTiles: function (tiles, bomb) {
    var paths = _.chunck(tiles, bomb.strength+1);
    _(paths[0]).reverse();
   
    var test = _.times(2, function (i) {
      return _.takeWhile(paths[i], function (tile, j) {
        return  tile.value !== TILE_SOLID ||
                ( typeof(paths[i][j-1]) !== 'undefined' &&
                paths[i][j-1].value !== TILE_BRICK );
      });
    });

    console.log(util.inspect(test));

    return test;
  }
};

module.exports = BombManager;

