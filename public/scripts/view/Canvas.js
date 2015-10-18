/*jshint browserify: true */
"use strict";

const $ = require('jquery');
const _ = require('lodash');

let Map = require('./Map');

let SpritesToLoad = 7;

const SQUARE_SIZE = 16,
      CHAR_WIDTH = 22,
      CHAR_HEIGHT = 22,
      CHAR_X = 11,
      CHAR_Y = 17,
      MOVE_ANIM_SPEED = 0.1,
      BOMB_ANIM_SPEED = 0.1,
      FLAME_ANIM_SPEED = 0.15;

let Canvas = {
  init (width, height) {
    // Delete all old canvases.
    $('canvas').remove();

    this.dirtyTiles = [];
    this.charSprites = {};

    this.width = width * SQUARE_SIZE;
    this.height = height * SQUARE_SIZE;
    this.mapCanvas =  this.canvasGenerator(
      this.width, this.height).get(0).getContext('2d');
    this.charCanvas =  this.canvasGenerator(
      this.width, this.height).get(0).getContext('2d');
    this.repaint = true;
    this.initialized = false;

    this.loadSprites();
  },

  clear () {
    this.charCanvas.clearRect(0, 0, this.width, this.height);
  },

  update (players, bombs, flames) {
    if(!this.initialized) { return; }

    this.clear();
    _.forEach(players,  this.drawPlayer.bind(this));
    _.forEach(bombs,    this.drawBomb.bind(this));
    _.forEach(flames,   this.drawFlame.bind(this));
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
   
    sprite = this.charSprites[player.character];
    
    // 8 is the last row in the spreadsheet.
    if(frameY < 8) {
      this.charCanvas.drawImage(
        sprite, frameX * CHAR_WIDTH, frameY * CHAR_HEIGHT,
        CHAR_WIDTH, CHAR_HEIGHT, x, y,
        CHAR_WIDTH, CHAR_HEIGHT);
    }
  },

  drawBomb (bomb) {
    const frame = Math.floor(bomb.frame / BOMB_ANIM_SPEED) % 3,
            x = Math.floor(bomb.x) * SQUARE_SIZE,
            y = Math.floor(bomb.y) * SQUARE_SIZE;
  
    this.charCanvas.drawImage(  
      this.bombSprite, frame*SQUARE_SIZE, 0,
      SQUARE_SIZE, SQUARE_SIZE, x, y,
      SQUARE_SIZE, SQUARE_SIZE);
  },

  drawFlame (flame) {
    let frame = Math.floor(flame.frame / FLAME_ANIM_SPEED),
            x = Math.floor(flame.x) * SQUARE_SIZE,
            y = Math.floor(flame.y) * SQUARE_SIZE;
    
    if (frame > 3 ) { frame = 6 - frame; }

    this.charCanvas.drawImage(  
      this.flameSprite, frame*SQUARE_SIZE, 0,
      SQUARE_SIZE, SQUARE_SIZE, x, y,
      SQUARE_SIZE, SQUARE_SIZE);
  },

  drawMap () {
    if(!this.initialized) { return; }
    if(this.repaint) { return this.redrawMap(); }
    
    // Draw dirty zones
    _.forEach(this.dirtyTiles, function (dirtyTile) {
      const newTile = Map.getTile(dirtyTile.x, dirtyTile.y);
      this.drawTile(dirtyTile.x, dirtyTile.y, newTile);
    }.bind(this));

    this.dirtyTiles = [];
  },

  
  // full repaint
  redrawMap () {
    const bounds = Map.getBounds();

    _.times(bounds.height, function (y) {
      _.times(bounds.width, function (x) {
        const tile = Map.getTile(x, y);
        this.drawTile(x, y, tile);
      }.bind(this));
    }.bind(this));
  
    this.repaint = false;
  },

  drawTile (xCoord, yCoord, tile) {
    this.mapCanvas.drawImage(
      this.tileSprite, tile * SQUARE_SIZE, 0, 
      SQUARE_SIZE, SQUARE_SIZE,
      xCoord*SQUARE_SIZE, yCoord*SQUARE_SIZE,
      SQUARE_SIZE, SQUARE_SIZE);
  },

  addDirtyTiles (tiles) {
    _.forEach(tiles, function (tile) {
      var x = Math.floor(tile.x),
          y = Math.floor(tile.y);
      
      this.addDirtyZone(x, y);
    }.bind(this));
  },

  addDirtyZone (x, y) {
    //if(typeof(x) == 'undefined')
      //this.repaint = true
    //else if (typeof(width) == 'undefined') {
      //width = 1;
      //height = 1;
    //}
      
    this.dirtyTiles.push({x: Math.floor(x), y: Math.floor(y) });
      //width: Math.ceil(width), height: Math.ceil(height)
  },

  canvasGenerator (width, height) {
    const $canvas =   $('<canvas width="' +width+
                    '" height="' +height+ '"class="game-canvas" />');
    $('body').append($canvas);
    return $canvas;
  },

  loadSprites () {
    _.each(['john', 'joe', 'betty', 'mary'], function (name) {
      this.charSprites[name] = this.loadSprite('../../sprites/char-'+name+'.png');
    }.bind(this));

    this.flameSprite  = this.loadSprite('../../sprites/flames.png');
    this.bombSprite   = this.loadSprite('../../sprites/bombs.png');
    this.tileSprite   = this.loadSprite('../../sprites/tiles.png');
  },

  loadSprite (path) {
    const sprite = new Image();
    sprite.src = path;
    sprite.onload = this.onSpriteLoaded.bind(this);
    return sprite;
  },

  onSpriteLoaded () { 
    SpritesToLoad -= 1;
    if(SpritesToLoad <= 0) { 
      this.initialized = true; 
      this.drawMap();
    }
  }
};

module.exports = Canvas;
