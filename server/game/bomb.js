var Bomb = function (id, player) {
  this.id = id;
  this.x = player.get('x');
  this.y = player.get('y');
  this.playerId = player.get('id');
}

Bomb.prototype.getX = function () {
  return this.x;
}

Bomb.prototype.getY = function () {
  return this.y;
}

module.exports = Bomb;
