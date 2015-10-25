"use strict";

const _ = require('lodash'),
      spriteNames= ['john', 'joe', 'betty', 'mary'],
      spriteDir = '../../sprites/';

let _sprites = {
  characters: {},
  flame: null,
  bomb: null,
  tile: null
},
  _onDoneCallback = null,
  _spritesToLoad = 7;

let SpriteManager = {

  init (callback) {
    _onDoneCallback = callback;
    this.loadSprites();
  },

  player (name) {
    return _sprites.characters[name];    
  },

  bomb () {
    return _sprites.bomb;
  },

  flame () {
    return _sprites.flame;
  },

  tile () {
    return _sprites.tile;
  },

  loadSprites () {
    spriteNames.forEach(name => {
      _sprites.characters[name] = this.loadSprite(spriteDir + 'char-'+name+'.png');
    });
    _sprites.flame = this.loadSprite(spriteDir + 'flames.png');
    _sprites.bomb = this.loadSprite(spriteDir +'bombs.png');
    _sprites.tile = this.loadSprite(spriteDir + 'tiles.png');
  },

  loadSprite (path) {
    const sprite = new Image();
    sprite.src = path;
    sprite.onload = this.onSpriteLoaded.call();
    return sprite;
  },

  onSpriteLoaded () { 
    _spritesToLoad -= 1;
    if(_spritesToLoad <= 0) {
      _onDoneCallback.call();
    }
  }
};

module.exports = SpriteManager;
