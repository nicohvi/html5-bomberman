var _ = require('lodash');

var Map = require('./Map');
var Player = require('./Player');

function getTicks() {
  return new Date().getTime();
} 

var Game = {
  init: function (data) {
    this.lastTick = getTicks();
    this.players = this._getPlayers(data.players);
    this.map = new Map(data.map);
    this.canvas = this.map.canvas;
    setTimeout(function () { this.map.draw() }.bind(this), 500);
    // TODO: onLoadedSprite
    this.update();
  },

  playerJoin: function (player) {
    console.log('player join')
    var plr = new Player(player);
    this.players[player.id] = plr;
  },

  playerLeave: function (id) {
    console.log('player leave')
    if(_.isEmpty(this.players)) return;
    delete this.players[id];
  },

  playerSpawn: function (player) {
    console.log('player spawn')
    var plr = this.players[player.id];
    plr.update(player); 
  },
  
  playerUpdate: function (player) {
    var plr = this.players[player.id]

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
  },

  _getPlayers: function (players) {
    if(_.isEmpty(players)) return players;
    var hash = {};
    _.each(players, function (player) {
      hash[player.id] = new Player(player);
    }.bind(this));
    return hash;
  }
}

module.exports = Game;
