var Bomb = function (id, player) {
  this.id = id;
  this.x = player.get('x');
  this.y = player.get('y');
  this.playerId = player.get('id');
}

module.exports = Bomb;
