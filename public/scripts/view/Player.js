
class Player {
  constructor(options) {
    this.x = options.x;
    this.y = options.y;
    this.orient = options.orient;
    this.id = options.id;
    this.name = options.name;
    this.score = options.score; 
    this.movement = options.movement;
    this.alive = options.alive;
    this.moving = options.moving;
    this.frame = 0;
    this.character = 'betty';
  }

  update (options) {
    this.x = options.x,
    this.y = options.y,
    this.orient = options.orient;
    this.moving = options.moving;
    this.alive = options.alive;
  }

  animationUpdate (delta) {
    this.frame += delta;
  }

}

module.exports = Player;