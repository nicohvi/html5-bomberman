/*jslint node: true */
"use strict";

var lib = require('./lib/lib');

var Bomb = function (id, player, strength, time) {
  this.id = id;
  this.x = lib.coordinates(player.x);
  this.y = lib.coordinates(player.y);
  this.strength = strength;
  this.playerId = player.id;
  this.exploded = false;
  this.placedAt = time;
  this.active = false;
};

module.exports = Bomb;
