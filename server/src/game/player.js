"use strict";

const C = require('./constants');

class Player {

  constructor (opts) {
    this.id = opts.id;
    this.name = opts.name;
    this.character = opts.character;
    this.defaults();
  }

  spawn (loc) {
    this.x = loc.x;
    this.y = loc.y;
    this.alive = true;

    return this;
  }

  stop () {
    this.moving = false;
    return this;
  }

  defaults () {
    this.alive = false;
    this.score = 0;
    this.cooldown = false;
    this.moving = false;
    this.direction = 'down';
    this.diadAt = null;
    this.lastBomb = null;
    this.powerUp = false;
  }

  move (dir) {
    this.moving = true;
    this.direction = dir;
    return this;
  }

  getDeltaMove () {
    // TODO: acceleration
    let dx = 0,
        dy = 0;

    switch(this.direction) {
      case 'left':
        dx -= C.MOVE_AMOUNT;
        break;
      case 'right':
        dx += C.MOVE_AMOUNT;
        break;
      case 'up':
        dy -= C.MOVE_AMOUNT;
        break;
      case 'down':
        dy += C.MOVE_AMOUNT;
        break;
    }

    return { dx: dx, dy: dy };
  }

  deltaMove (dx, dy) {
    this.x += dx;
    this.y += dy;

    return this;
  }

  die (time) {
    this.alive = false;
    this.diedAt = time;

    return this;
  }

  updateScore (diff) {
    this.score += diff;
  }

  placeBomb (time) {
    this.lastBomb = time;
    this.cooldown = true;
  }

  ready () {
    this.lastBomb = null;
    this.cooldown = false;
  }

};

module.exports = Player;
