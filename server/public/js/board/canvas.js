"use strict";

const _   = require('lodash'),
      Map = require('./map'),
      Sprites = require('./spriteManager'),
      C = require('./constants');

let _width = null,
    _height = null,
    _dirtyTiles = [],
    _repaint = true,
    _initialized = false,
    _mapCanvas = null,
    _charCanvas = null;

function generate(width, height) {
    let canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    document.getElementById('canvas-container').appendChild(canvas);

    return canvas;
}

function initialize () {
  _initialized = true;
  drawMap();
}

function clear () {
  _charCanvas.clearRect(0, 0, _width, _height);
}

function drawMap () {
  if(!_initialized) return; 
  if(_repaint) return redrawMap();
  
  // Draw dirty zones
  _dirtyTiles.forEach(tile => {
    const newTile = Map.getTile(dirtyTile.x, dirtyTile.y);
    drawTile(dirtyTile.x, dirtyTile.y, newTile);
  });

  _dirtyTiles = [];
}

function drawSprite(sprite, dx, dy, x, y) {
  _charCanvas.drawImage(sprite.image, dx, dy, 
  sprite.width, sprite.height, x*sprite.width, y*sprite.height,
  sprite.width, sprite.height);
}

function drawPlayer (plr) {
  const sprite  = Sprites.player(plr.character),
            x   = Math.round(plr.x * C.SQUARE_SIZE) - C.CHAR_X,
            y   = Math.round(plr.y * C.SQUARE_SIZE) - C.CHAR_Y;
  debugger
  let frame = Math.floor(plr.frame / C.MOVE_ANIM_SPEED),
      frameX, frameY;

  // Tile coordinates
  if(plr.alive) {
    frameX = frame % 3;
    if(!plr.moving) { frameX = 1; }
    frameY = plr.getDirectionFrame();
  } else {
    frameY = Math.floor(frame/3) + 4;
    frameX = frame % 3;
  }
  
  // 8 is the last row in the spreadsheet.
  if(frameY < 8) 
    drawSprite(sprite, { x: frameX, y: frameY }, { x: x, y: y });
}

function drawBomb (bomb) {
  const sprite  = Sprites.sprite('bomb')
        x       = Math.floor(flame.x) * sprite.width,
        y       = Math.floor(flame.y) * sprite.height,
        frame   = Math.floor(bomb.frame / C.BOMB_ANIM_SPEED) % 3;
  
  drawSprite(sprite, { x: frame, y: 0 }, { x: x, y: y });
}

function drawFlame (flame) {
  const sprite  = Sprites.sprite('flame'),
        x       = Math.floor(flame.x) * sprite.width,
        y       = Math.floor(flame.y) * sprite.height;
  
  let frame = Math.floor(flame.frame / C.FLAME_ANIM_SPEED);
  
  if (frame > 3 ) { frame = 6 - frame; }
  
  drawSprite(sprite, { x: frame, y: 0 }, { x: x, y: y });
}

function drawTile (x, y, tile) {
  const sprite  = Sprites.sprite('tiles');
  drawSprite(sprite, tile.value * sprite.width, 0, x, y); 

        //x       = xCoord * sprite.width,
        //y       = xCoord * sprite.height,
        //frame   = Map.getTile(xCoord, yCoord).value;

  //drawSprite(sprite, { x: frame * sprite.width, y: 0 }, { x: x, y: y });
}

function  redrawMap () {
  const bounds = Map.getBounds();

  _.times(bounds.height, y => {
    _.times(bounds.width, x => {
      const tile = Map.getTile(x, y);
      drawTile(x, y, tile);
    })});
  
  _repaint = false;
}

function addDirtyZone (x, y) {
 _dirtyTiles.push({x: Math.floor(x), y: Math.floor(y) });
}

module.exports = {

  init (map) {
    _width = map.width * C.SQUARE_SIZE;
    _height = map.height * C.SQUARE_SIZE;
    _mapCanvas  = generate(_width, _height).getContext('2d');
    _charCanvas = generate(_width, _height).getContext('2d');
    Sprites.init().then(() => initialize());
  },

  update (players, bombs, flames) {
    if(!_initialized) return;

    //clear();

    _.forEach(players, drawPlayer);
    _.forEach(bombs, drawBomb);
    _.forEach(flames, drawFlame);
    drawMap();
  },
   
  addDirtyTiles (tiles) {
    _.each(tiles, tile => {
      const x = Math.floor(tile.x),
            y = Math.floor(tile.y);
      
      addDirtyZone(x, y);
    });
  },

};
