class Bomb {
  constructor(options) {
    this.x = options.x;
    this.y = options.y;
    this.id = options.id;
    this.playerId = options.playerId;
    this.frame = 0;
  }

  animationUpdate (delta) {
    this.frame += delta;
  }

}

module.exports = Bomb;
