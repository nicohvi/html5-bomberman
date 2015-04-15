var _ = require('lodash');

var Tile = require('./tile');

var TILE_EMPTY = 0,
    TILE_SOLID = 2,
    TILE_BRICK = 1,
    TILE_BOMB  = 3;

(function() {
    // TODO: CLEAN THIS SHIT UP

    MapGenerator = Backbone.Model.extend({
        initialize: function(opt) {
            this.w = opt.w;
            this.h = opt.h;

            this.map = new Array(this.w * this.h);
            for(var i=0; i<this.w * this.h; i++)
                this.map[i] = 0;

            this.classicMapGenerator();
            this.borderedMapGenerator();
        },

        borderedMapGenerator: function() {
            for(var i=0; i<this.w; i++) {
                for(var j=0; j<this.h; j++) {
                    if (i==0 || i==this.w-1 || j==0 || j==this.h-1)
                        this.setMap(i,j, TILE_SOLID);
                }
            }
        },

        classicMapGenerator: function() {
            this.borderedMapGenerator();

            for(var i=0; i<this.w; i++) {
                for(var j=0; j<this.h; j++) {
                  if (i%2==0 && j%2==0)
                        this.setMap(i,j, TILE_SOLID);
                    else if ( Math.floor(Math.random()*9)==0)
                        this.setMap(i,j, TILE_BRICK);
                }
            }
        },

        setMap: function(x,y,c) {
            this.map[y * this.w + x] = c;
        },

        getMap: function() {
            return {
                width: this.w,
                height: this.h,
                map: this.map.join("")
            };
        },

    });


    Map = Backbone.Model.extend({
        defaults: {
            width: 50,
            height: 40
        },

        initialize: function() {
            var mapGenerator = new MapGenerator({
                w: this.get('width'),
                h: this.get('height')
            });
            var map = mapGenerator.getMap();
            this.set(map);
        },

        placeBomb: function (bomb) {
          this.setTile(bomb.x, bomb.y, TILE_BOMB); 
        },     

        removeBomb: function (bomb) {
          this.setTile(bomb.x, bomb.y, TILE_EMPTY);
        },   

        getAbsTile: function(x, y) {
            return this.getTile(x, y);
        },

        canMove: function(x,y) {
          return this.getTile(x,y) == TILE_EMPTY;
        },

        getTile: function(x, y) {
          if(this.get('width')  <= x < 0) return -1;
          if(this.get('height') <= y < 0) return -1;
          return this.get('map')[y * this.get('width') + x];
        },

        setTile: function (x, y, value) {
          x = Math.floor(x),
          y = Math.floor(y);
          if(this.get('width')  <= x < 0) return;
          if(this.get('height') <= y < 0) return;

          var index = y * this.get('width') + x;
          var map = this.get('map'); 
  
          console.log('Setting tile ' +x+ ', ' +y+ ' to ' +value);
          map = map.substr(0, index) + value + map.substr(index+1);
          this.set('map', map);
        },

        getXBombTiles: function (xStart, xEnd, y) {
          var result = [],
              stop = false;

          if(xStart > xEnd) {
            for( var i = xStart; i >= xEnd; i--) {
              var tile = this.getTile(i, y);
              if(stop) 
                break;
              switch (tile) {
                case "0":
                  result.push(new Tile(i, y, tile));
                  break;
                case "1":
                  stop = true;
                  result.push(new Tile(i, y, tile));
                  break;
                case "2":
                  stop = true;
                  break;
              }
            }
          } else {
            for(var i = xStart; i <= xEnd; i++) {
              var tile = this.getTile(i, y);
              if(stop) 
                break;
              switch (tile) {
                case "0":
                  result.push(new Tile(i, y, tile));
                  break;
                case "1":
                  stop = true;
                  result.push(new Tile(i, y, tile));
                  break;
                case "2":
                  stop = true;
                  break;
                default: 
                  break;
              }
            }  
          }
          return result;
        },

        getYBombTiles: function (yStart, yEnd, x) {
          var result = [],
              stop = false;
          if(yStart > yEnd) {
            for( var i = yStart; i >= yEnd; i--) {
              var tile = this.getTile(x, i);
              if(stop)
                break;
              switch (tile) {
                case "0":
                  result.push(new Tile(x, i, tile));
                  break;
                case "1":
                  stop = true;
                  result.push(new Tile(x, i, tile));
                  break;
                case "2":
                  stop = true;
                  break;
              }
            }
          } else {
            for(var i = yStart; i <= yEnd; i++) {
              if(stop)
                break;
              var tile = this.getTile(x, i);
              switch (tile) {
                case "0":
                  result.push(new Tile(x, i, tile));
                  break;
                case "1":
                  stop = true;
                  result.push(new Tile(x, i, tile));
                  break;
                case "2":
                  stop = true;
                  break;
              }
            }  
          }
          return result;
        },

        updateMap: function (tiles) {
          var map = this.get('map');
          _.each(tiles, function (tile) {
            this.setTile(tile.x, tile.y, TILE_EMPTY);
          }.bind(this));
        },

        getMap: function() {
            return {
                width: this.get('width'),
                height: this.get('height'),
                map: this.get('map')
            }
        },

        getValidSpawnLocation: function() {
            var valid = false;
            do {
                var x = Math.floor(Math.random()*this.get('width')),
                    y = Math.floor(Math.random()*this.get('height'));

                console.log("trying to spawn at " + x + "," + y);

                if(this.getTile(x,y) == TILE_EMPTY)
                  valid = true;

            } while(!valid);


            return {
                x: x + .5,
                y: y + .5
            };
        },
    });

})();

