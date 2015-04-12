//var $ = require('jquery');
//var _ = require('lodash');
//var assign = require('object-assign');

//var Renderer = require('./Renderer');
//var MapRenderer = require('./MapRenderer');
//var CharacterRenderer = require('./CharacterRenderer');
//var TileSet = require('./TileSet');
//var Player = require('./Player');

//// TODO: Move to constants
//var tileSize = 16;
//var charSize = 22;
//var spritesToLoad = 1;
//var $window = $(window);

//var Game = {
  
  //init: function (data) {
    //var $body = $('body');
    //this.canvases = [];
    //this.players = [];
    //this.characters = ['joe'];
    //this.data = data;
    
    //// build layers
    //// 1: background (green)
    //// 2: map (solid/empty)
    //// 3: characters (players, bricks, bombs, flames)
    //_.times(4, function (i) {
      //var $canvas = $('<canvas width="'+ (data.map.rows * tileSize) +
                  //'" height="' + (data.map.columns * tileSize) +
                  //'" data-index="' +i+ '" class=" game-canvas ' +
                  //'canvas-' +i+ '"/>');
      //$body.append($canvas);
      //this.canvases.push($canvas);
    //}.bind(this));

    //this.mapTileSet = new TileSet({ 
      //src: '../../sprites/tiles.png' ,
      //tileSpec: { 
        //0: { x: 0, y: 0 },
        //2: { x: 32, y: 0 }
      //},
      //callback: this.spritesLoaded.bind(this)
    //});
    
    //this.charTileSet =  new TileSet({
        //src: '../../sprites/char-betty.png' ,
        //tileSpec: {
          //standing: { x: 22, y: 0 }
        //},
        //callback: this.spritesLoaded.bind(this)
      //});

  //},

  //spritesLoaded: function () {
    //spritesToLoad--;
    //if(spritesToLoad == 0)
      //this.run();
  //},

  //run: function () {
    //var data = this.data;
  
    //this.mapRenderer = new MapRenderer({
      //$el: this.canvases[1],
      //map: data.map.tileMap,
      //tileSet: this.mapTileSet,
      //tileSize: tileSize
    //});

    //this.characterRenderer = new CharacterRenderer({
      //$el: this.canvases[2],
      //tileSize: tileSize,
      //charSize: charSize
    //}); 

    //this.gameLoop.call(this);
  //},

  //gameLoop: function () {
    //this.characterRenderer.draw(this.players);
    //window.requestAnimationFrame(this.gameLoop.bind(this));
  //},

  //playerJoined: function (player) {
    //this.players.push(new Player(assign({ 
      //tileSet: this.charTileSet }, player)));
  //},

  //playerMove: function (data) {
    //var plr = _.find(this.players, function (player) {
      //return player.socketId == data.socketId;
    //});
    //plr.doMove(data);
  //},
  
  //update: function (data) {
  //}

//};
