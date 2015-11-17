"use strict";

const _ = require('lodash'),
      spriteNames= ['john', 'joe', 'betty', 'mary'],
      Sprite = require('./sprite');

let _sprites = {
  characters: {},
  flame: null,
  bomb: null,
  tiles: null,
  },
  _spritesLoaded = false;

function spriteLoading (sprite) {
  if(sprite instanceof Sprite) return !sprite.loaded;
  return !_.isEmpty(_.filter(sprite, spriteLoading));
}

function spriteCheck () {
  _spritesLoaded = _.isEmpty(_.filter(_sprites, spriteLoading));
  return _spritesLoaded;
}

function loadSprites (fn) {
  spriteNames.forEach(name => {
    _sprites.characters[name] = new Sprite('char-'+name+'.png', true);
  });

  _sprites.flame = new Sprite('flames.png');
  _sprites.bomb  = new Sprite('bombs.png');
  _sprites.tiles = new Sprite('tiles.png');

  let interval = setInterval(() => {
    console.log('check');
    if(spriteCheck()) {
      fn.call();
      clearInterval(interval);
    }
  }, 500);
}

module.exports = {

  init () {
    return new Promise((resolve, reject) => {
      loadSprites(resolve);
    });
  },

  player (name) {
    return _sprites.characters[name];    
  },

  sprite (type) {
    return _sprites[type];
  }

};
