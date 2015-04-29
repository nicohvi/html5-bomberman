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
    let newPlayer = Player(plr);
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
    let player = this.players[plr.id];
    player.update(plr);
  },
  
  playerUpdate: function (plr) {
    let player = this.players[plr.id];
    if(!plr) {
      console.log('Unkown update: ' +player.id);
      return;
    }  
    player.update(plr); 
  },

  playerDie: function (plr, killer, suicide) {
    const player = this.players[plr.id];
    console.log(player.name+ ' killed by ' +killer.name);
  
    player.die();
    
    if(suicide) {
      this._playSound('suicide');
    } else {
      this._playSound('die');
    }
  },

  playerScore: function (plr) {
    this.players[plr.id].updateScore(plr.score);
    Leaderboard.load(this.players);
  },

  bombPlace: function (bomb) {
    console.log('place bomb');
    this.bombs[bomb.id] = new Bomb(bomb);
  },

  bombExplode: function (bomb) {
    console.log('bomb explode');
    delete this.bombs[bomb.id];
  },

  mapUpdate: function (tiles) {
    GameMap.update(tiles);
    Canvas.addDirtyTiles(tiles);
  },

  flamesSpawn: function (flames) {
    console.log('flames spawn');
    _.forEach(flames, function (flame) {
      this.flames[flame.id] = new Flame(flame);
    }.bind(this));
  },

  flamesDie: function (flames) {
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
    let now   = getTicks(),
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

    Canvas.update(this.players, this.bombs, this.flames);
    Canvas.drawMap();

    this.lastTick = now;
    window.requestAnimationFrame(this.update.bind(this));
  },

  _getplayers: function (players) {
    if(_.isEmpty(players)) { return players; }
    let hash = {};
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
    let audio = new Audio('../../sounds/'+clip+'.wav');
    audio.play();
  }
};

module.exports = Game;
