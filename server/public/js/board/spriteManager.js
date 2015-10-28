"use strict";

const _ = require('lodash'),
      spriteNames= ['john', 'joe', 'betty', 'mary'],
      Sprite = require('./sprite');

let _sprites = {
  characters: {},
  flame: null,
  bomb: null,
  tile: null
},
  _onDoneCallback = null,
  _spritesToLoad = 7,
  _spritesLoaded = false;

function spriteLoading (sprite) {
  if(sprite instanceof Sprite) return !sprite.loaded;

  return _.filter(sprite, spriteLoading);
}

function spriteCheck () {
  _spritesLoaded = _.isEmpty(_.filter(_sprites, spriteLoading));
}

function loadSprites () {
  spriteNames.forEach(name => {
    _sprites.characters[name] = new Sprite('char-'+name+'.png', true);
  });
  _sprites.flame = new Sprite('flames.png');
  _sprites.bomb  = new Sprite('flames.png');
  _sprites.tile  = new Sprite('flames.png');

  return new Promise((resolve, reject) => {
    setInterval(spriteCheck, 500);

    // TODO: Reject on timeout
    if(_spritesLoaded) resolve();
  });
}

module.exports = {

  init () {
    return loadSprites().then( () => {
      return new Promise((resolve, reject) => resolve());
    });
  },

  player (name) {
    return _sprites.characters[name];    
  },

  sprite (type) {
    _sprites[type];
  }

};
