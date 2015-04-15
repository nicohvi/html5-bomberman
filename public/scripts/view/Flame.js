class Flame {
  constructor(options) {
    this.x = options.x;
    this.y = options.y;
    this.id = options.id;
    this.frame = 0;
  }

  animationUpdate (delta) {
    this.frame += delta;
  }

}

module.exports = Flame;
