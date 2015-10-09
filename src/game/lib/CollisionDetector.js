/*jslint node: true */
"use strict";

let lib = require('./lib');
const Constants = require('./../constants');

let CollisionDetector = {

  collision: function (actor, tile) {
    let actorX = Math.floor(actor.x),
        actorY = Math.floor(actor.y),
        tileX = Math.floor(tile.x),
        tileY = Math.floor(tile.y);

    if(actorX === tileX && actorY === tileY) {
        console.log('collision at: ' +actorX+ ', ' +actorY);
      return tile;
    }
    return null;
  },

  mapCollision: function (x, y) {
    return this.map.getTile(x, y) !== Constants.TILE_EMPTY;
  }, 

  bombCollision: function (x, y) {
    return this.bombManager.hasBomb(x, y);
  }, 

  canMove: function (x, y) {
    let xCoord = lib.floor(x), 
        yCoord = lib.floor(y);

    return !this.mapCollision(xCoord, yCoord) && 
           !this.bombCollision(xCoord, yCoord);
  }
 
};

let collisionDetectorFactory = function (opts) {
  let cd = Object.create(CollisionDetector);
  cd.map = opts.map;
  cd.bombManager = opts.bombManager;
  return cd;
};

module.exports = collisionDetectorFactory;
