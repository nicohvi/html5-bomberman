"use strict";
const _spriteDir  = '../../sprites/',
      C           = require('./constants');

function loadSprite (path, sprite) {
  let img = new Image();
  img.src = _spriteDir + path;
  img.onload = function () {
    sprite.loaded = true; 
  };
  return img;
}

class Sprite {
  constructor (src, charFlag) {
    this.loaded = false;
    this.image = loadSprite(src, this);
    this.width = charFlag ? C.CHAR_WIDTH : C.SQUARE_SIZE;
    this.height = charFlag ? C.CHAR_HEIGHT : C.SQUARE_SIZE;
  }
}

module.exports = Sprite;
