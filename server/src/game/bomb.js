"use strict";

class Bomb {
  constructor (opts) {
    this.id  = opts.id;
    this.x   = lib.floor(opts.player.x);
    this.y   = lib.floor(opts.player.y);
    this.strength = opts.strength;
    this.playerId = opts.player.id;
    this.placedAt = opts.time;
    this.active = false;
    this.exploded = false;
  } 

  activate () {
    bomb.active = true;
  }

  explode () {
    bomb.exploded = true;
    return this;
  }
};

module.exports = Bomb;
