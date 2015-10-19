"use strict";

let Round = {
  init (opts) {
    this.duration = opts.duration;
    this.winner = null;
    this.loser = null;
    this.start = opts.start

    return this;
  }
};

let roundFactory = (opts) {
  let round = Object.create(Round);
  return round.init(opts);
};

module.exports = roundFactory;
