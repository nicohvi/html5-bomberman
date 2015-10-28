"use strict";
const _spriteDir  = '../../sprites/',
      C           = require('./constants');

function loadSprite (path, callback) {
  let sprite = new Image();
  sprite.src = _spriteDir + path;
  sprite.onload = callback;
  return sprite;
}

class Sprite {
  constructor (src, charFlag) {
    this.image = loadSprite(src, () => this.loaded = true);
    this.width = charFlag ? C.CHAR_WIDTH : C.SQUARE_SIZE;
    this.height = charFlag ? C.CHAR_HEIGHT : C.SQUARE_SIZE;
    this.loaded = false;
  }
}

module.exports = Sprite;
