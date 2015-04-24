/*jslint node: true */
"use strict";

let _ = require('lodash');

const TILE_EMPTY = 0;

let Player = require('../player');

let collisionDetector = {

  collision: function (actor, tile) {
    let actorX = Math.floor(actor.x),
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
    return _.find(tiles, function (tile) {
      return this.collision(player, tile);
    }.bind(this));
  },

  mapCollision: function (x, y) {
    return this.map.getTile(x, y) !== TILE_EMPTY;
  }, 

  bombCollision: function (x, y) {
    return this.bombManager.hasBomb(x, y);
  }, 

  canMove: function (x, y) {
    return !this.mapCollision(x, y) && 
           !this.bombCollision(x, y);
  }
 
};

let collisionDetectorFactory = function (opts) {
  let cd = Object.create(collisionDetector);
  cd.map = opts.map;
  cd.bombManager = opts.bombManager;
  return cd;
};

module.exports = collisionDetectorFactory;
