/*jshint browserify: true */
"use strict";

let $ = require('jquery');
let _ = require('lodash');

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

let canvas = {
  init (width, height) {
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
    let frame = Math.floor(bomb.frame / BOMB_ANIM_SPEED) % 3,
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
      var newTile = Map.getTile(dirtyTile.x, dirtyTile.y);
      this.drawTile(dirtyTile.x, dirtyTile.y, newTile);
    }.bind(this));
      //for(var j = 0; j < zone.width; j++) {
        //for(var k = 0; k < zone.height; k++) {
          //var cx    = j + zone.x,
              //cy    = k + zone.y,
              
          //drawnTiles++;
        //} // k
      //} // j
    //} // i

    this.dirtyTiles = [];
  },

  
  // full repaint
  redrawMap () {
    _.times(Map.height, function (y) {
      _.times(Map.width, function (x) {
        let tile = Map.getTile(x, y);
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
      console.log('dirty tile: ' +tile.x+ ', ' +tile.y);
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
    let $canvas =   $('<canvas width="' +width+
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
    let sprite = new Image();
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

module.exports = canvas;

//let canvasFactory = function canvasFactory (map) {
  //let newCanvas = Object.create(canvas, {
    //dirtyTiles: [],
    //mapCanvas:  this._canvasGenerator(map.width*SQUARE_SIZE,
                //map.height*SQUARE_SIZE),
    //mapCtx: this.mapCanvas.get(0).getContext('2d'),
    //charCanvas: this._canvasGenerator(map.width*SQUARE_SIZE,
                //map.height*SQUARE_SIZE),
    //charCtx: this.mapCanvas.get(0).getContext('2d'),
    //repaint: true,
    //map: map,
    //initialized: false 
  //});

  //newCanvas._loadSprites(this._onSpriteLoaded.bind(this));
  //return newCanvas;
//};

//module.exports = canvasFactory;

    // map 
    //this.canvases[0] = this._canvas( 
      //(VIEW_WIDTH*SQUARE_SIZE), 
      //(VIEW_HEIGHT*SQUARE_SIZE),
      //0); 

    // sprites
    //this.canvases[1] = this._canvas( 
      //(VIEW_WIDTH*SQUARE_SIZE), 
      //(VIEW_HEIGHT*SQUARE_SIZE),
      //1); 

    // TODO: Move
    //_.each(this.canvases, function ($el) {
      //$('body').append($el);
    //});

    //_.each(['john', 'joe', 'betty', 'mary'], function (name) {
      //this.charSprites[name] = this._loadSprite('../../sprites/char-'+name+'.png');
    //}.bind(this));

    //this.flameSprite  = this._loadSprite('../../sprites/flames.png');
    //this.bombSprite   = this._loadSprite('../../sprites/bombs.png');
    //this.tileSprite   = this._loadSprite('../../sprites/tiles.png');
  //}

  // init

  //dirtyTiles (tiles) {
    //_.each(tiles, function (tile) {
      //console.log('dirty tile: ' +tile.x+ ', ' +tile.y);
      //var x = Math.floor(tile.x),
          //y = Math.floor(tile.y);
      
      //this.map.updateTile(x, y, "0");
      //this.addDirtyZone(x, y, 1, 1);
    //}.bind(this));
    //this.drawMap();
  //}

  //addDirtyZone (x, y, width, height) {

    //if(typeof(x) == 'undefined')
      //this.repaint = true
    //else if (typeof(width) == 'undefined') {
      //width = 1;
      //height = 1;
    //}
      
    //this.dirtyZones.push({
      //x: Math.floor(x), y: Math.floor(y),
      //width: Math.ceil(width), height: Math.ceil(height)
    //});
  //}

  //_canvas (width, height, i) {
     //var $canvas = $('<canvas width="' +width+
              //'" height="' +height+
              //'" data-index="' +i+ '" class=" game-canvas ' +
              //'canvas-' +i+ '"/>');
    //return $canvas;
  //}

  //_loadSprite (path) {
    //// TODO: Image
    //return $('<img src="'+path+'" />').get(0);
  //}


  //drawMap () {
    //var mapCanvas   = this.canvases[0].get(0),
        //ctx         = mapCanvas.getContext('2d'),
        //tileSprite  = this.tileSprite,
        //drawnTiles  = 0;
    
    //if(this.repaint)
      //this.addDirtyZone(0, 0, this.map.width, this.map.height)         
    
    //// Draw dirty zones
    //for(var i = 0; i < this.dirtyZones.length; i++) {
      //var zone = this.dirtyZones[i];
      //for(var j = 0; j < zone.width; j++) {
        //for(var k = 0; k < zone.height; k++) {
          //var cx    = j + zone.x,
              //cy    = k + zone.y,
              //tile  = this.map.getTile(cx, cy);
          //ctx.drawImage(tileSprite,
            //tile * SQUARE_SIZE, 0, 
            //SQUARE_SIZE, SQUARE_SIZE,
            //cx*SQUARE_SIZE, cy*SQUARE_SIZE,
            //SQUARE_SIZE, SQUARE_SIZE);
          //drawnTiles++;
        //} // k
      //} // j
    //} // i

    //this.dirtyZones = [];
    //this.repaint = false;
  //}

  //clear () {
    //var charCanvas = this.canvases[1],
        //ctx = charCanvas.get(0).getContext('2d');

    //ctx.clearRect(0,0, charCanvas.width(), charCanvas.height());
  //}

  //drawPlayers (players) {
    //var charCanvas = this.canvases[1],
        //ctx = charCanvas.get(0).getContext('2d');

    //_.each(players, function (player) {
      //this._drawPlayer(player, ctx);
    //}.bind(this)); 
  //}

  //_drawPlayer (player, ctx) {
    //var frame = Math.floor(player.frame / MOVE_ANIM_SPEED),
        //frameX, frameY, x, y, sprite;
    
    //// Tile coordinates
    //if(player.alive) {
      //frameX = frame % 3;
      //if(!player.moving) frameX = 1;
      //frameY = player.orient;      
    //} else {
      //frameY = Math.floor(frame/3) + 4;
      //frameX = frame % 3;
    //}
    
    //x = Math.round(player.x * SQUARE_SIZE) - CHAR_X;
    //y = Math.round(player.y * SQUARE_SIZE) - CHAR_Y;
    
    //sprite = this.charSprites[player.character];
    
    //// 8 is the last row in the spreadsheet.
    //if(frameY < 8) {
      //ctx.drawImage(sprite, 
        //frameX * CHAR_WIDTH,  
        //frameY * CHAR_HEIGHT,
        //CHAR_WIDTH, CHAR_HEIGHT,
        //x, y,
        //CHAR_WIDTH, CHAR_HEIGHT);
    //}
  //}

  //drawBombs (bombs) {
    //var ctx = this.canvases[1].get(0).getContext('2d');
    //_.each(bombs, function (bomb) { this._drawBomb(bomb, ctx) }.bind(this));
  //}

  //_drawBomb (bomb, ctx) {
    //var frame = Math.floor(bomb.frame / BOMB_ANIM_SPEED) % 3,
            //x = Math.floor(bomb.x) * SQUARE_SIZE,
            //y = Math.floor(bomb.y) * SQUARE_SIZE;

    //ctx.drawImage(  this.bombSprite, frame*SQUARE_SIZE, 0,
                    //SQUARE_SIZE, SQUARE_SIZE, x, y,
                    //SQUARE_SIZE, SQUARE_SIZE);
  //}

  //drawFlames (flames) {
    //var ctx = this.canvases[1].get(0).getContext('2d');
    //_.each(flames, function (flame) { this._drawFlame(flame, ctx) }.bind(this));
  //}

  //_drawFlame (flame, ctx) {
    //var frame = Math.floor(flame.frame / FLAME_ANIM_SPEED),
            //x = Math.floor(flame.x) * SQUARE_SIZE,
            //y = Math.floor(flame.y) * SQUARE_SIZE;
    
    //if (frame > 3 ) frame = 6 - frame;

    //ctx.drawImage(  this.flameSprite, frame*SQUARE_SIZE, 0,
                    //SQUARE_SIZE, SQUARE_SIZE, x, y,
                    //SQUARE_SIZE, SQUARE_SIZE);
  //}

//}

//module.exports = Canvas;
