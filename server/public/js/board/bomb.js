"use strict";

class Bomb {
  constructor(opts) {
    this.x = opts.x;
    this.y = opts.y;
    this.id = opts.id;
    this.playerId = opts.playerId;
    this.frame = 0;
  }

  animationUpdate (delta) {
    this.frame += delta;
  }

}

module.exports = Bomb;
