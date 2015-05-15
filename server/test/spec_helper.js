/*jslint node: true*/
"use strict";

const GameMap = require('../game/map'),
      Constants = require('../game/constants'),
      Player = require('../game/player'),
      Bomb   = require('../game/bomb'),
      BombManager = require('../game/lib/BombManager'),
      CollisionDetector = require('../game/lib/CollisionDetector'),
      _ = require('lodash'),
      assert = require('assert');

module.exports = {
  _: _,
  assert: assert,
  Map: GameMap,
  Constants: Constants,
  Player: Player,
  Bomb: Bomb,
  CollisionDetector: CollisionDetector,
  BombManager: BombManager,
  createPlayer: () => {
    return new Player({ id: 1, name: 'Frank' });
  },
  createMap : () => {
    return new GameMap({ width: Constants.MAP_WIDTH,
                  height: Constants.MAP_HEIGHT });
  },
  createBomb: (id) => { 
    id = id || 1;
    return new Bomb({ id: id, player: { x: 50, y: 50 } });
  }
};
