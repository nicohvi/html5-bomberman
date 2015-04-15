var LEFT = 37;
var UP = 38;
var RIGHT = 39;
var DOWN = 40;
var SPACE = 32;
var ORIENT_DOWN = 0;
var ORIENT_UP = 1;
var ORIENT_RIGHT = 2;
var ORIENT_LEFT = 3;
var util = require('util');
var moveAmount = 0.125;

(function() { 

    Player = Backbone.Model.extend({

        defaults: {
          alive: false,
          score: 0,
          orient: ORIENT_DOWN,
          cooldown: false
        },

        initialize: function(data) {
            this.set('id', data.socketId);
        },

        spawn: function (loc) {
          this.set('x', loc.x);
          this.set('y', loc.y);
          this.set('alive', true);
        },

        stop: function () {
          this.set('moving', false)
        },

        getMove: function (direction) {
          var dx = 0,
              dy = 0;

          switch(direction) {
            case 'left':
              dx -= moveAmount;
              break;
            case 'right':
              dx += moveAmount;
              break;
            case 'up':
              dy -= moveAmount;
              break;
            case 'down':
              dy += moveAmount;
              break;
          }
      
          return { dx: dx, dy: dy };
        },    

        deltaMove: function (dx, dy) {
          this.set('x', this.get('x') + dx);
          this.set('y', this.get('y') + dy);

          if (dx < 0) 
            this.set('orient', ORIENT_LEFT);
          else if (dx > 0)
            this.set('orient', ORIENT_RIGHT);
          else if(dy < 0)
            this.set('orient', ORIENT_UP);
          else if(dy > 0)
            this.set('orient', ORIENT_DOWN);
          this.set('moving', true);
        },

        watchOut: function (tiles) {
          var xCoord  = Math.floor(this.get('x')),
              yCoord  = Math.floor(this.get('y'));
        
          _.forEach(tiles, function (tile) {
            if(tile.x == xCoord && tile.y == yCoord) {
              console.log(  'player ' +this.get('name')+ ' dies at '
                            +tile.x+ ', ' +tile.y);
              this.die();
              return false;
            }
          }.bind(this));

          return this.get('alive');
        },

        die: function() {
            this.set('alive', false);
        },

    });
})();

