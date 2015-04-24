/*jslint node: true */
"use strict";

let Player = {
  alive: true,
  winner: false,
  frame: 0,

  update (options) {
    this.x = options.x;
    this.y = options.y;
    this.direction = options.direction;
    this.moving = options.moving;
    this.alive = options.alive;
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
};

let playerFactory = function (opts) {
  var player = Object.create(Player);
  player.id = opts.id;
  player.character = opts.character;
  player.name = opts.name;
  player.update(opts);
  player.score = opts.score;

  return player;
};

module.exports = playerFactory;
