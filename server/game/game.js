var assign = require('object-assign');
var _ = require('lodash');
var util = require('util');
var BOMB_TIMER = 5000;
var BOMB_STRENGTH = 4;
var COOLDOWN_TIME = 1000;
var SPAWNING_TIME = 6000;

var Bomb = require('./bomb');
// fix
require('./player');
require('./map');
var PLAYER_GIRTH = 0.35;
var bombId = 0;

(function() {

    Game = Backbone.Model.extend({

        initialize: function(opt) {
            this.players = {};
            this.bombs = {};
            this.redis = opt.redis;
            this.map = new Map();
        },
      
        getState: function () {
          return { players: this.players, map: this.map.getMap() };
        },
        
        addPlayer: function (data) {
          console.log('adding player with socket id: ' +data.socketId);
          var player = new Player(data);
          this.players[data.socketId] = player;
          return player;
        },

        spawnPlayer: function (player) {
          var loc = this.map.getValidSpawnLocation();
          console.log(  "Spawning " +player.get('name')+ " at "
                        +loc.x+ ", " +loc.y);
          player.spawn(loc);
          this.trigger('player-spawn', player);
        },

        removePlayer: function (socketId) {
          delete this.players[socketId];
        },
      
        playerStop: function (socketId) {
          var player = this.players[socketId];

          if(typeof(player) == 'undefined') {
              console.log('player not found')
              return;
            }

          player.stop();
          return player;
        },

        playerMove: function (socketId, data) {
          var player = this.players[socketId];

          if(typeof(player) == 'undefined') {
            console.log('player not found')
            return;
          }

          // TODO: use delta and input throttling
          var delta = player.getMove(data.dir);

          if(this.requestMove(player, delta))
            return player;
          else
            return null;
        },

        _generatePlayerId: function () {
          return this.playerId++;
        },
      
        _direction: function (x) {
          // x > 0  -> 1
          // x == 0 -> 0
          // x < 0  -> -1
          return x > 0 ? 1 : x < 0 ? -1 : 0;
        },

        requestMove: function (player, delta) {
          var x = player.get('x'),
              y = player.get('y'),
              dx = delta.dx,
              dy = delta.dy,
              floorX = Math.floor(x),
              floorY = Math.floor(y),
              newX = Math.floor(x + dx + this._direction(dx)*PLAYER_GIRTH),
              newY = Math.floor(y + dy + this._direction(dy)*PLAYER_GIRTH);
          // x-axis
          if(!this.map.canMove(newX, floorY))
            dx = 0;

          // y-axis
          if(!this.map.canMove(floorX, newY))
            dy = 0;
          
          if(dx != 0 || dy != 0) {
            player.deltaMove(dx, dy);
            return true;
          } else {
            return false;
          }
        },

        placeBomb: function (socketId) {
          var player  = this.players[socketId],
              bomb    = new Bomb(bombId++, player);

          if(player.get('cooldown')) {
            console.log('player is cooling down');
            return null;
          }
        
          player.set('cooldown', true); 
          console.log('placing bomb at: ' +bomb.x+ ", " +bomb.y); 

          this.bombs[bomb.id] = bomb;
          setTimeout(function () {this.bombExplode(bomb)}.bind(this),
  BOMB_TIMER);
          setTimeout(function () {this.clearCooldown(player)}.bind(this), COOLDOWN_TIME);
          return bomb;
        },

        bombExplode: function (bomb) {
          var tiles = [],
                  x = Math.floor(bomb.x),
                  y = Math.floor(bomb.y);

          console.log('bomb exploding at: ' +bomb.x+ ", " +bomb.y);
          
          tiles = this.getBombTiles(x, y);

          tiles = _.filter(tiles, function (tile) {
            return typeof(tile) != "undefined";
          });

          dirtyTiles = _.filter(tiles, function (tile) {
            return tile.value == TILE_BRICK; 
          });

          this.map.updateMap(dirtyTiles);
          
          this.trigger(
            'bomb-explode', 
            { bomb: bomb, tiles: tiles, dirtyTiles: dirtyTiles }
          );
          
          _.each(this.players, function (player) {
            var alive = player.watchOut(tiles);
            if(!alive) {
              setTimeout(function () { this.spawnPlayer(player); }.bind(this), SPAWNING_TIME);
              this.trigger('player-die', player); 
            }
          }.bind(this));
        },

        getBombTiles: function (x,y) {
          var result = [];
          result = result.concat(this.map.getXBombTiles(x, x-BOMB_STRENGTH, y));
          result = result.concat(this.map.getXBombTiles(x, x +BOMB_STRENGTH, y));
          result = result.concat(this.map.getYBombTiles(y, y-BOMB_STRENGTH, x));
          result = result.concat(this.map.getYBombTiles(y, y+BOMB_STRENGTH, x));
          console.log(util.inspect(result));
          return result;
        },

        clearCooldown: function (player) {
          player.set('cooldown', false);
        }

    });


})();


        //_chainBombs: function(b) {
            //this.bombs.remove(b);
            //this.chained.push(b);

            //// build chained bombs
            //this.each4Ways(b.get('x'), b.get('y'), b.get('strength'),
                //_.bind(function(x,y) {
                    //var cb;
                    //if (cb = this.getBomb(x, y)) {
                        //this._chainBombs(cb);
                    //}
                //}, this),
                //_.bind(function(x, y, t) {
                    //if (t == TILE_BRICK)
                        //this.blocks.push( {x: x, y: y} );
                //}, this)
            //);
        //},

        //explodeBomb: function(b) {
            //this.chained = [];
            //this.blocks = [];

            //this._chainBombs(b);

            //_.each(this.blocks, function(b) {
                //this.map.setAbsMap(b.x, b.y, TILE_EMPTY, false);
            //}, this);

            //this.endpoint.emit('break-tiles', this.blocks);
        //},

        /**
         * Iterates valid flame points
         * @param x
         * @param y
         * @param len
         * @param f1 = function(x, y) - free space
         * @param f2 = function(x, y, type) - collision
         */
        //each4Ways: function(x, y, len, f1, f2) {
            //_.each(DIRECTIONS, _.bind(function(dir) {
                //for(var i=0; i<=len; i++) {
                    //if (i==0 && dir.zero === undefined) continue; // allow only one zero
                    //var xx = x + dir.x*i;
                    //var yy = y + dir.y*i;
                    //var tt = this.map.getAbsTile( xx, yy );
                    //if (tt != TILE_EMPTY) {
                        //if (f2!==undefined) f2(xx, yy, tt);
                        //return;
                    //}
                    //f1(xx,yy);
                //}
            //}, this));
        //},

        //getBomb: function(x,y) {
            //return this.bombs.find(function(b) { return b.get('x') == x && b.get('y') == y; });
        //},

        //scoreKill: function(whoId, byWhoId) {
            //var who = this.playersById[whoId];
            //if (!who) return;

            //if (this.redis)
                //this.redis.incr("counters.kills");

            //if (whoId == byWhoId) { // suicide
                //console.log(who.get('name') + " suicided");
                //who.set('score', who.get('score') - 1);

                //if (this.redis) {
                    //this.redis.incr("counters.kills.suicides");
                    //this.redis.incr("suicides-by:" + whoId);
                //}

            //} else {
                //var byWho = this.playersById[byWhoId];
                //if (!byWho) return;

                //console.log(who.get('name') + " was killed by " + byWho.get('name'));
                //byWho.set('score', byWho.get('score') + 1);

                //if (this.redis) {
                    //this.redis.incr("counters.kills.kills");
                    //this.redis.incr("kills-by:" + byWhoId);

                    //if (who.get('fbuid')>0 && byWho.get('fbuid') > 0)
                        //this.redis.incr("kill:" + who.get('fbuid') + ":by:" + byWho.get('fbuid'));
                //}

                //this.ctrlsById[whoId].notifyFriendBattles();
                //this.ctrlsById[byWhoId].notifyFriendBattles();
            //}
            //this.trigger('score-changes');
        //}


