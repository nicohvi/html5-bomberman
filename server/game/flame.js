/*jslint node: true */
"use strict";

let Flame = {
  init (opts) {
    this.x = opts.x;
    this.y = opts.y;
    this.id = opts.id;
    this.playerId = opts.playerId;
    this.spawnTime = opts.time;
    
    return this;
  }
};

let flameFactory = function (opts) {
  let flame = Object.create(Flame);
  return flame.init(opts); 
};

module.exports = flameFactory;
