/*jslint node: true */
"use strict";

const Constants = require('./constants');

let Player = {

  init (opts) {
    this.id = opts.id;
    this.name = opts.name;
    this.character = 'joe';
    this.alive = false;
    this.score = 0;
    this.cooldown = false;
    this.moving = false;
    this.direction = 'down';
    this.diedAt = null;
    this.lastBomb = null;
    return this;
  },

  spawn (loc) {
    this.x = loc.x;
    this.y = loc.y;
    this.alive = true;
  },

  stop () {
    this.moving = false;
    return this;
  },

  reset () {
    this.alive = false;
    this.score = 0;
    this.cooldown = false;
    this.moving = false;
    this.direction = 'down';
    this.diadAt = null;
    this.lastBomb = null;
  },

  move (dir) {
    this.moving = true;
    this.direction = dir;
    return this;
  },

  // TODO: acceleration
  getAttemptedMove () {
    var dx = 0,
        dy = 0;

    switch(this.direction) {
      case 'left':
        dx -= Constants.MOVE_AMOUNT;
        break;
      case 'right':
        dx += Constants.MOVE_AMOUNT;
        break;
      case 'up':
        dy -= Constants.MOVE_AMOUNT;
        break;
      case 'down':
        dy += Constants.MOVE_AMOUNT;
        break;
    }

    return { dx: dx, dy: dy };
  },

  deltaMove (dx, dy) {
    if(dx === 0 && dy === 0) { this.moving = false; }
    this.x += dx;
    this.y += dy;
    return this;
  },

  die (time) {
    this.alive = false;
    this.diedAt = time;
  },

  updateScore (diff) {
    this.score += diff;
  },

  setCooldown (time) {
    this.lastBomb = time;
    this.cooldown = true;
  },

  stopCooldown () {
    this.lastBomb = null;
    this.cooldown = false;
  }
};

let playerFactory = function playerFactory (data) {
  var player = Object.create(Player);
  return player.init(data);
};

module.exports = playerFactory;