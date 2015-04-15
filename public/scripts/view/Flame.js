class Flame {
  constructor(options) {
    this.x = options.x;
    this.y = options.y;
    this.done = false;
    this.frame = 0;
  }

  animationUpdate (delta) {
    this.frame += delta;
  }

}

module.exports = Flame;
