var Bomb = function (id, player, time) {
  this.id = id;
  this.x = player.get('x');
  this.y = player.get('y');
  this.playerId = player.get('id');
  this.exploded = false;
  this.placedAt = time;
  this.active = false;
}

module.exports = Bomb;
