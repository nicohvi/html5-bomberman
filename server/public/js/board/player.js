"use strict";

let Player = {
  
  alive: true,
  winner: false,
  frame: 0,

  init (opts) {
    this.id = opts.id;
    this.character = opts.character;
    this.name = opts.name;
    this.score = opts.score;

    this.update(opts);
    return this;
  },

  update (options) {
    this.x = options.x;
    this.y = options.y;
    this.direction = options.direction;
    this.moving = options.moving;
    this.alive = options.alive;
  },

  spawn (x, y) {
    this.x = x;
    this.y = y;
    this.alive = true;
  },

  updateScore (score) {
    this.score = score;
  },

  animationUpdate (delta) {
    this.frame += delta;
  },

  getDirectionFrame () {
    // down (0)
    let frame = 0;

    switch(this.direction) {
      case "up":
        frame = 1;
        break;
      case "right":
        frame = 2;
        break;
      case "left":
        frame = 3;
        break;
    }

    return frame;
  },

  die () {
    this.alive = false;
    this.frame = 0;
  },

  stop () {
    this.moving = false;
  }
};

let playerFactory = function (opts) {
  var player = Object.create(Player);
  return player.init(opts);
};

module.exports = playerFactory;
