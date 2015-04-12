var $ = require('jquery');
var _ = require('lodash');

var SQUARE_SIZE = 16,
    VIEW_WIDTH  = 50,
    VIEW_HEIGHT = 40,
    CHAR_WIDTH = 22,
    CHAR_HEIGHT = 22,
    CHAR_X = 11,
    CHAR_Y = 17,
    MOVE_ANIM_SPEED = 0.1;

class Canvas {
  constructor (map) {
    this.dirtyZones = [];
    this.canvases = [];
    this.charSprites = {};
    this.repaint = true;
    this.map = map;
    this.initialized = false;

    // map TODO: why 2? 
    this.canvases[0] = this._canvas( 
      (VIEW_WIDTH*SQUARE_SIZE), 
      (VIEW_HEIGHT*SQUARE_SIZE),
      0); 

    // sprites
    this.canvases[1] = this._canvas( 
      (VIEW_WIDTH*SQUARE_SIZE), 
      (VIEW_HEIGHT*SQUARE_SIZE),
      1); 

    // TODO: Move
    _.each(this.canvases, function ($el) {
      $('body').append($el);
    });

    _.each(['john', 'joe', 'betty', 'mary'], function (name) {
      this.charSprites[name] = this._loadSprite('../../sprites/char-'+name+'.png');
    }.bind(this));

    this.flameSprite  = this._loadSprite('../../sprites/flames.png');
    this.bombSprite   = this._loadSprite('../../sprites/bombs.png');
    this.tileSprite   = this._loadSprite('../../sprites/tiles.png');
  }

  draw () {
    this.drawMap();
    this.drawPlayers();
    //this._drawFlames();
    //this._drawBombs();
    //this._drawPlayers();
    //this._drawBreakings();
  }

  addDirtyZone (x, y, width, height) {
    //if(this.repaint) return;

    if(typeof(x) == 'undefined')
      this.repaint = true
    else if (typeof(width) == 'undefined') {
      width = 1;
      height = 1;
    }
      
    this.dirtyZones.push({
      x: Math.floor(x), y: Math.floor(y),
      width: Math.ceil(width), height: Math.ceil(height)
    });
  }

  _canvas (width, height, i) {
     var $canvas = $('<canvas width="' +width+
              '" height="' +height+
              '" data-index="' +i+ '" class=" game-canvas ' +
              'canvas-' +i+ '"/>');
    return $canvas;
  }

  _loadSprite (path) {
    // TODO: Image
    return $('<img src="'+path+'" />').get(0);
  }

  drawMap () {
    var mapCanvas   = this.canvases[0].get(0),
        ctx         = mapCanvas.getContext('2d'),
        tileSprite  = this.tileSprite,
        drawnTiles  = 0;
        //x           = Math.floor(this.viewport.x),
        //y           = Math.floor(this.viewport.y),
    
    if(this.repaint)
      this.addDirtyZone(0, 0, this.map.width, this.map.height)         
    
    // Draw dirty zones
    for(var i = 0; i < this.dirtyZones.length; i++) {
      var zone = this.dirtyZones[i];
      for(var j = 0; j < zone.width; j++) {
        for(var k = 0; k < zone.height; k++) {
          var cx    = j + zone.x,
              cy    = k + zone.y,
              tile  = this.map.getTile(cx, cy);
          
          ctx.drawImage(tileSprite,
            tile * SQUARE_SIZE, 0, 
            SQUARE_SIZE, SQUARE_SIZE,
            cx*SQUARE_SIZE, cy*SQUARE_SIZE,
            SQUARE_SIZE, SQUARE_SIZE);
          drawnTiles++;
        } // k
      } // j
    } // i

    this.dirtyZones = [];
    this.repaint = false;
  }

  drawPlayers (players) {
    _.each(players, function (player) {
      this._drawPlayer(player);
    }.bind(this)); 
  }

  _drawPlayer (player) {
    var frame = Math.floor(player.frame / MOVE_ANIM_SPEED),
        charCanvas = this.canvases[1],
        ctx = charCanvas.get(0).getContext('2d'),
        frameX, frameY, x, y, sprite;
    
    // Tile coordinates
    if(player.alive) {
      frameX = frame % 3;
      if(!player.moving) frameX = 1;
      frameY = player.orient;      
    } else {
      frameY = Math.floor(frame/3) + 4;
      frameX = frame % 3;
    }
    
    x = Math.round(player.x * SQUARE_SIZE) - CHAR_X;
    y = Math.round(player.y * SQUARE_SIZE) - CHAR_Y;
    
    sprite = this.charSprites[player.character];
    ctx.clearRect(0,0, charCanvas.width(), charCanvas.height());
    // TODO
    if(frameY < 8) {
      ctx.drawImage(sprite, 
        frameX * CHAR_WIDTH,  
        frameY * CHAR_HEIGHT,
        CHAR_WIDTH, CHAR_HEIGHT,
        x, y,
        CHAR_WIDTH, CHAR_HEIGHT);
    }
  }

}

module.exports = Canvas;
