/*jslint node: true */
"use strict";

let lib = require('./lib/lib');

let Bomb = {
  active: false,
  exploded: false
};

let BombFactory = function (id, player, strength, time) {
  var bomb = Object.create(Bomb);
  bomb.id = id;
  bomb.x = lib.floor(player.x);
  bomb.y = lib.floor(player.y);
  bomb.strength = strength;
  bomb.playerId = player.id;
  bomb.placedAt = time;

  return bomb;
};

module.exports = BombFactory;
