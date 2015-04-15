var _ = require('lodash');

var Map     = require('./Map');
var Player  = require('./Player');
var Bomb    = require('./Bomb');
var Flame   = require('./Flame');

var Leaderboard = require('../components/leaderboard');

function getTicks() {
  return new Date().getTime();
} 

var Game = {
  init: function (data) {
    this.lastTick = getTicks();
    this.players = this._getPlayers(data.players);
    this.bombs = {};
    this.flames = {};
    this.map = new Map(data.map);
    this.canvas = this.map.canvas;
    setTimeout(function () { this.map.draw() }.bind(this), 500);
    // TODO: onLoadedSprite
    Leaderboard.load(this.players);
    this.update();
  },

  playerJoin: function (player) {
    console.log('player join')
    var plr = new Player(player);
    this.players[player.id] = plr;
    Leaderboard.load(this.players);
  },

  playerLeave: function (id) {
    console.log('player leave')
    if(_.isEmpty(this.players)) return;
    delete this.players[id];
    Leaderboard.load(this.players);
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

  playerDie: function (player, suicide) {
    console.log('player died');
    var plr = this.players[player.id];
    if(!plr) return;
    plr.die();
    
    if(suicide)
      this._playSound('suicide');
    else {
      this._playSound('die');
    }
  },

  playerScore: function (player) {
    this.players[player.id].updateScore(player.score);
    Leaderboard.load(this.players);
  },

  bombPlace: function (bomb) {
    this.bombs[bomb.id] = new Bomb(bomb);
  },

  bombExplode: function (data) {
    console.log('bomb explode');
    delete this.bombs[data.bomb.id];
    
    this.canvas.dirtyTiles(data.dirtyTiles);
  },

  flameSpawn: function (flames) {
    console.log('flames biatch');
    _.forEach(flames, function (flame) {
      this.flames[flame.id] = new Flame(flame);
    }.bind(this));
  },

  flameDie: function (flames) {
    console.log('flames done');
    _.forEach(flames, function (flame) {
      delete this.flames[flame.id];
    }.bind(this));
  },

  update: function () {
    var now   = getTicks(),
        delta = (now - this.lastTick) / 1000;

    _.each(this.players, function (player) {
      player.animationUpdate(delta);
    });

    _.each(this.bombs, function (bomb) {
      bomb.animationUpdate(delta);
    });
   
    _.each(this.flames, function (flame) {
      flame.animationUpdate(delta);
    });

    this.canvas.clear();
    this.canvas.drawFlames(this.flames);
    this.canvas.drawPlayers(this.players);
    this.canvas.drawBombs(this.bombs);
    
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
  },

  _addFlames: function (tiles) {
    return _.map(tiles, function(tile) {
      return new Flame(tile);
    });
  },

  _playSound: function (clip) {
    var audio = new Audio('../../sounds/'+clip+'.wav');
    audio.play();
  }
}

module.exports = Game;
