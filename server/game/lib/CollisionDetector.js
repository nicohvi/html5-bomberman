/*jslint node: true */
"use strict";

var _ = require('lodash');

var Player = require('../player');

var CollisionDetector = {

  collision: function (actor, tile) {
    var actorX = Math.floor(actor.x),
        actorY = Math.floor(actor.y),
        tileX = Math.floor(tile.x),
        tileY = Math.floor(tile.y);

    if(actorX === tileX && actorY === tileY) {
      if(actor instanceof Player) {
        console.log(
          'player ' +actor.name+ ' collides at '+actorX+ ', ' +actorY
        );
      } else {
        console.log('collision at ' +actorX+ ', ' +actorY);
      }
      return tile;
    }
    return null;
  },

  playerCollides: function (player, tiles) {
    return _.map(tiles, function (tile) {
      return this.collision(player, tile);
    }.bind(this));
  },

  firstCollision: function (player, tiles) {
    return _.firstWhere(tiles, function (tile) {
      return this.collision(player, tile);
    }.bind(this));
  }

};

module.exports = CollisionDetector;
