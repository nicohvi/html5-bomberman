"use strict";

class Flame {
  constructor (opts) {
    this.x = opts.x;
    this.y = opts.y;
    this.id = opts.id;
    this.playerId = opts.playerId;
    this.spawnTime = opts.time;
  }
}

module.exports = Flame;
