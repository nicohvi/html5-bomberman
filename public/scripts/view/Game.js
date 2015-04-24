/*jshint browserify: true */
"use strict";

const _ = require('lodash');

let Canvas  = require('./Canvas');
let GameMap = require('./Map');
let Player  = require('./player');
let Bomb    = require('./Bomb');
let Flame   = require('./Flame');
let Leaderboard = require('../components/leaderboard');

function getTicks() {
  return new Date().getTime();
} 

let Game = {
  init: function (data) {
    this.lastTick = getTicks();
    this.players = this._getplayers(data.players);
    this.bombs = {};
    this.flames = {};

    GameMap.init(data.map);
    Canvas.init(data.map.width, data.map.height);
    Leaderboard.load(this.players);

    this.update();
  },

  playerJoin: function (plr) {
    console.log('player join');
    var newPlayer = Player(plr);
    this.players[plr.id] = newPlayer;
    Leaderboard.load(this.players);
  },

  playerLeave: function (id) {
    console.log('player leave');
    if(_.isEmpty(this.players)) { return; }
    delete this.players[id];
    Leaderboard.load(this.players);
  },

  playerSpawn: function (plr) {
    console.log('player spawn');
    var player = this.players[plr.id];
    player.update(plr);
  },
  
  playerUpdate: function (plr) {
    var player = this.players[plr.id];
    if(!plr) {
      console.log('Unkown update: ' +player.id);
      return;
    }  
    console.log(player.x + ' ' +player.y);
    player.update(plr); 
  },

  playerDie: function (plr, suicide) {
    console.log('player died');
    var player = this.players[plr.id];
    if(!player) { return; }
    player.die();
    
    if(suicide) {
      this._playSound('suicide');
    } else {
      this._playSound('die');
    }
  },

  playerScore: function (plr) {
    // TODO: CONFLATE
    this.players[plr.id].updateScore(plr.score);
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

  gameDone: function (plr) {
    console.log('game over');
    this._playSound('win');
    this.players[plr.id].winner = true;
    Leaderboard.load(this.players);
  },

  update: function () {
    var now   = getTicks(),
        delta = (now - this.lastTick) / 1000;

    _.each(this.players, function (plr) {
      plr.animationUpdate(delta);
    });

    _.each(this.bombs, function (bomb) {
      bomb.animationUpdate(delta);
    });
   
    _.each(this.flames, function (flame) {
      flame.animationUpdate(delta);
    });

    Canvas.update(this.players, this.flames, this.bombs);

    this.lastTick = now;
    window.requestAnimationFrame(this.update.bind(this));
  },

  _getplayers: function (players) {
    if(_.isEmpty(players)) { return players; }
    var hash = {};
    _.each(players, function (plr) {
      hash[plr.id] = Player(plr);
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
};

module.exports = Game;
