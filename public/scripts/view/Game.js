var _ = require('lodash');

var Map = require('./Map');
var Player = require('./Player');

function getTicks() {
  return new Date().getTime();
} 

var Game = {
  init: function (data) {
    this.lastTick = getTicks();
    this.players = [];
    this.map = new Map(data.map);
    this.canvas = this.map.canvas;
    setTimeout(function () { this.map.draw() }.bind(this), 500);
    // TODO: onLoadedSprite
    this.update();
  },

  playerJoin: function (player) {
    var plr = new Player(player);
    this.players.push(plr);
  },

  playerLeave: function (id) {
    if(_.isEmpty(this.players))
      return;
    this.players = _.filter(this.players, function (player) {
          return player.id != id;
        });
  },

  playerSpawn: function (player) {
    var plr = _.find(this.players, function (item) {
      return item.id == player.id;
    });
    plr.update(player); 
  },
  
  playerUpdate: function (player) {
    var plr = _.find(this.players, function (item) {
      return item.id == player.id;
    });
    if(!plr) {
      console.log('Unkown update: ' +player.id);
      return;
    }
    
    plr.update(player); 
  },

  update: function () {
    var now   = getTicks(),
        delta = (now - this.lastTick) / 1000;

    _.each(this.players, function (player) {
      player.animationUpdate(delta);
    });
    
    this.canvas.drawPlayers(this.players);
    this.lastTick = now;
    window.requestAnimationFrame(this.update.bind(this));
  }
}

module.exports = Game;
