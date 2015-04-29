/*jslint node: true */
"use strict";

let lib = require('./lib/lib');

let Bomb = {

  init (opts) {
    this.id  = opts.id;
    this.x   = lib.floor(opts.player.x);
    this.y   = lib.floor(opts.player.y);
    this.strength = opts.strength;
    this.playerId = opts.player.id;
    this.placedAt = opts.time;
    this.active = false;
    this.exploded = false;

    return this;
  } 
};

let BombFactory = function (opts) {
  var bomb = Object.create(Bomb);
  return bomb.init(opts);
};

module.exports = BombFactory;
