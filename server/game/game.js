var assign = require('object-assign');
var lo = require('lodash');
var util = require('util');

var PLAYER_GIRTH = 0.35;

(function() {

    const DIRECTIONS = [
        {x: 1, y: 0, zero: true},
        {x:-1, y: 0},
        {x: 0, y: 1},
        {x: 0, y:-1}
    ];

    function getTicks() {
        return new Date().getTime();
    }

    Game = Backbone.Model.extend({

        bombs: null,
        powerups: null,

        initialize: function(opt) {
            this.players = {};
            this.redis = opt.redis;
            this.map = new Map();

            //this.bombs = new BombCollection();
            //this.bombs.on('add', this.onBombAdded, this);

            //this.powerups = new PowerupCollection();
            //this.powerups.on('add', this.onPowerupAdded, this);
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
          console.log('player move called')
          console.log("socketId: "+socketId)
          var player = this.players[socketId];

          if(typeof(player) == 'undefined') {
            console.log('player not found')
            return;
          }
          
          player.input(data);
          var delta = player.update();
          this.requestMove(player, delta);
          return player;
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
              girthX = Math.floor(x + dx + this._direction(dx)*PLAYER_GIRTH),
              girthY = Math.floor(y + dy + this._direction(dy)*PLAYER_GIRTH);
          
          
          if(!this.map.canMove(floorX, floorY, girthX, girthY))
            dx = 0;
          else 
            girthX = Math.floor(x + dx);

          if(!this.map.canMove(floorX, floorY, floorX, girthY))
            dy = 0;

          player.deltaMove(dx, dy);
        }

        //update: function() {
          //var now = getTicks();
          //var delta = (now - this.lastTick) / 1000;

            //console.log('updating ' +_.size(this.players)+ ' players');
          //_.each(this.players, function (player) {
            //console.log('player ' +player.get('id')+ ' moving: ' +player.get('moving'))
            //var update = player.update(delta);
            //console.log('player ' +player.get('id')+ ' moving: ' +player.get('moving'))
            //if(player.get('moving')) {
              //this.requestMove(player, update); 
            //}
            //this.trigger('player-update', player);
          //}.bind(this));     

            // check bombs
            //this.bombs.each(function(b) {
                //if (b.get('timeTrigger')<=now) {
                    //this.explodeBomb(b);
                //}
            //}, this);

            // check player spawning
            //_.each(this.players, function(p) {
                //if (!p.get('alive') && p.get('spawnAt')<=now)
                    //this.spawnPlayer(p);
            //}, this);

            //this.lastTick = now;
            
            //this.trigger('update', this.getState());
        //}
    });


})();


        //spawnPlayer: function(p) {
            //p.spawn();
        //},

        //onBombAdded: function(b) {
            //b.set({
                //timePlaced: this.lastTick,
                //timeTrigger: this.lastTick + b.get('fuseTime')
            //});
        //},

        //onPowerupAdded: function (p) {
          //console.log('powerup added event'); 
        //},

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


