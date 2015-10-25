"use strict";

const _   = require('lodash'),
      Map = require('./map'),
      Sprites = require('./spriteManager'),
      // TODO: Move to constants
      SQUARE_SIZE = 16,
      CHAR_WIDTH = 22,
      CHAR_HEIGHT = 22,
      CHAR_X = 11,
      CHAR_Y = 17,
      MOVE_ANIM_SPEED = 0.1,
      BOMB_ANIM_SPEED = 0.1,
      FLAME_ANIM_SPEED = 0.15;

let _width = null,
    _height = null,
    _dirtyTiles = [],
    _repaint = false,
    _initialized = false,
    _mapCanvas = null,
    _charCanvas = null;

function canvasGenerator (width, height) {
    let canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.class = 'game-canvas';

    document.getElementById('canvas-container').appendChild(canvas);

    return canvas;
}

let Canvas = {

  init (width, height) {
    _width = width * SQUARE_SIZE;
    _height = height * SQUARE_SIZE;

    _mapCanvas =  canvasGenerator(width, height).getContext('2d');
    _charCanvas =  canvasGenerator(width, height).getContext('2d');
    Sprites.init(this.initialize.bind(this));
  },

  initialize () {
    _initialized = true;
    this.drawMap();
  },

  clear () {
    _charCanvas.clearRect(0, 0, _width, _height);
  },

  update (players, bombs, flames) {
    if(!_initialized) return;

    this.clear();

    _.forEach(players, this.drawPlayer);
    _.forEach(bombs, this.drawBomb);
    _.forEach(flames, this.drawFlame);
  },

  drawPlayer (player) {
    let frame = Math.floor(player.frame / MOVE_ANIM_SPEED),
        frameX, frameY, x, y, sprite;

    // Tile coordinates
    if(player.alive) {
      frameX = frame % 3;
      if(!player.moving) { frameX = 1; }
      frameY = player.getDirectionFrame();
    } else {
      frameY = Math.floor(frame/3) + 4;
      frameX = frame % 3;
    }
    
    x = Math.round(player.x * SQUARE_SIZE) - CHAR_X;
    y = Math.round(player.y * SQUARE_SIZE) - CHAR_Y;

    sprite = Sprites.player(player.sprite);
   
    // 8 is the last row in the spreadsheet.
    if(frameY < 8) { _charCanvas.drawImage(
        sprite, frameX * CHAR_WIDTH, frameY * CHAR_HEIGHT,
        CHAR_WIDTH, CHAR_HEIGHT, x, y,
        CHAR_WIDTH, CHAR_HEIGHT);
    }
  },

  drawBomb (bomb) {
    const frame = Math.floor(bomb.frame / BOMB_ANIM_SPEED) % 3,
            x = Math.floor(bomb.x) * SQUARE_SIZE,
            y = Math.floor(bomb.y) * SQUARE_SIZE;
  
    _charCanvas.drawImage(Sprites.bomb(), 
      frame*SQUARE_SIZE, 0,
      SQUARE_SIZE, SQUARE_SIZE, x, y,
      SQUARE_SIZE, SQUARE_SIZE);
  },

  drawFlame (flame) {
    let frame = Math.floor(flame.frame / FLAME_ANIM_SPEED),
            x = Math.floor(flame.x) * SQUARE_SIZE,
            y = Math.floor(flame.y) * SQUARE_SIZE;
    
    if (frame > 3 ) { frame = 6 - frame; }

    _charCanvas.drawImage(Sprites.flame(),
      flameSprite, frame*SQUARE_SIZE, 0,
      SQUARE_SIZE, SQUARE_SIZE, x, y,
      SQUARE_SIZE, SQUARE_SIZE);
  },

  drawMap () {
    if(!_initialized) return; 
    if(_repaint) return this.redrawMap();
    
    // Draw dirty zones
    _.forEach(_dirtyTiles, dirtyTile => {
      const newTile = Map.getTile(dirtyTile.x, dirtyTile.y);
      this.drawTile(dirtyTile.x, dirtyTile.y, newTile);
    });

    _dirtyTiles = [];
  },

  
  // full repaint
  redrawMap () {
    const bounds = Map.getBounds();

    _.times(bounds.height, y => {
      _.times(bounds.width, x => {
        const tile = Map.getTile(x, y);
        this.drawTile(x, y, tile);
      })});
    
    _repaint = false;
  },

  drawTile (xCoord, yCoord, tile) {
    _mapCanvas.drawImage(Sprites.tile(), tile * SQUARE_SIZE, 0, 
      SQUARE_SIZE, SQUARE_SIZE,
      xCoord*SQUARE_SIZE, yCoord*SQUARE_SIZE,
      SQUARE_SIZE, SQUARE_SIZE);
  },

  addDirtyTiles (tiles) {
    _.forEach(tiles, tile => {
      const x = Math.floor(tile.x),
            y = Math.floor(tile.y);
      
      this.addDirtyZone(x, y);
    });
  },

  addDirtyZone (x, y) {
   _dirtyTiles.push({x: Math.floor(x), y: Math.floor(y) });
  },

};

module.exports = Canvas;
