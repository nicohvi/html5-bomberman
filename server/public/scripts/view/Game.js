/*jshint browserify: true */
"use strict";

const _ = require('lodash'),
  Player  = require('./player'),
  Bomb    = require('./Bomb'),
  Flame   = require('./Flame');

let Map         = require('./Map'),
    Canvas      = require('./Canvas'), 
    Leaderboard = require('../components/leaderboard.react'),
    Timer       = require('../components/Timer.react'),
    _running    = false,
    _lastTick   = null,
    _players    = {},
    _bombs      = {},
    _flames     = {};

function getTicks() {
  return new Date().getTime();
};

function playSound (clip) {
  let audio = new Audio('../../sounds/'+clip+'.wav');
  audio.play();
};

function getPlayers (plrs) {
  if(_.isEmpty(plrs)) return {};
  _.each(plrs, plr => _players[plr.id] = new Player(plr));
};

function error (player) {
  console.log('error: ' +player);
};

let Game = {

  init: function (data) {
    _running = false;
    _bombs = {};
    _flames = {};
    Timer.stop();

    let state = data.game;
    _lastTick = getTicks();
    getPlayers(state.players);
    Map.init(state.map);
    Canvas.init(state.map.width, state.map.height);
    Leaderboard.reload(_players);

    this.update();
  },

  update () {
    let now   = getTicks(),
        delta = (now - _lastTick) / 1000;

    _.each(_players, plr => plr.animationUpdate.call(plr, delta));
    _.each(_bombs, bomb => bomb.animationUpdate.call(bomb, delta));
    _.each(_flames, flame => flame.animationUpdate.call(flame, delta));
    
    Canvas.update(_players, _bombs, _flames);
    Canvas.drawMap();
    Leaderboard.reload(_players);

    _lastTick = now;
    window.requestAnimationFrame(this.update.bind(this));
  },

  event (data) {
    switch(data.action) {
      case 'begin':
        this.begin();
        break;
      case 'end':
        this.end(data.winner);
        Timer.stop();
        break;
      case 'countdown':
        Timer.start();
        break;
    };
  },

  begin () {
    console.log('begin round');
    _running = true;
  },

  end (winner) {
    _running = false;
    _bombs = {};
    _flames = {};
    _.each(_players, plr => plr.stop());
    console.log(_players);

    if(!winner) return alert("No winners, you guys suck");
    _players[winner.id].winner = true;
    Leaderboard.reload(_players);
    playSound('win');
  },

  pong () {
    console.log('pong');
  },

  playerUpdate (data) {
    let plr = data.player,
        message = null;

    if(data.action !== 'join' && !_players[plr.id]) return error(plr);

    switch(data.action) {
      case 'join':
        message = 'Player ' +plr.name+ ' joined';
        _players[plr.id] = new Player(plr);
        break;
      case 'leave':
        message = 'Player ' +plr.name+ ' left';
        delete _players[plr.id];
        break;
      case 'spawn':
        message = 'Player '+ plr.name+ ' spawned';
        _players[plr.id].spawn(plr.x, plr.y);
        playSound('spawn');
        break;
      case 'update':
        _players[plr.id].update(plr);
        break;
      case 'die':
        message = 'Player ' +plr.name+ ' was killed by ' +data.killer.name;
        _players[plr.id].die();

        data.suicide ? playSound('suicide') : playSound('die');
        break;
      case 'score':
        _players[plr.id].updateScore(plr.score); 
        break;
    };

    if(message) console.log(message);
  },

  bombUpdate (data) {
    let bomb = data.bomb,
      message = null;
    
    switch(data.action) {
      case 'place':
        message = 'Place bomb';
        _bombs[bomb.id] = new Bomb(bomb);
        break;
      case 'explode':
        message = 'Boom!';
        delete _bombs[bomb.id];
        playSound('explode');
        break;
    };

    if(message) console.log(message);
  },

  flameUpdate (data) {
    let flames = data.flames,
      message = null;

    switch(data.action) {
      case 'spawn':
        message = 'Flames spawned';
        _.each(flames, flame => _flames[flame.id] = new Flame(flame));
        break;
      case 'die':
        message = 'Flames die off';
        _.each(flames, flame => delete _flames[flame.id]);
    };

    if(message) console.log(message);
  },

  mapUpdate: function (data) {
    Map.update(data.tiles);
    Canvas.addDirtyTiles(data.tiles);
  },
  
};

module.exports = Game;
