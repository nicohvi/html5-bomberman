var assign = require('object-assign');
var _ = require('lodash');
var util = require('util');
var BOMB_TIMER = 3000;
var BOMB_STRENGTH = 4;
var COOLDOWN_TIME = 1000;
var SPAWNING_TIME = 6000;
var FUSE_TIME = 500;

var Bomb = require('./bomb');
var Flame = require('./flame');

// fix
require('./player');
require('./map');

var PLAYER_GIRTH = 0.35;
var bombId = 0,
    flameId = 0;

function getTicks() {
  return new Date().getTime();
}

(function() {

    Game = Backbone.Model.extend({

        initialize: function() {
            this.players = {};
            this.bombs = {};
            this.flames = {};
            this.map = new Map();
            this.lastTick = getTicks();
            setInterval(this.update.bind(this), 100);
        },

        // TODO: add flames and bombs 
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
          
          if(!player.get('alive'))
            return;

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
          
          var bombTest = this.hasBomb({x: newX, y: floorY});
          if(bombTest && bombTest.active)
            dx = 0;

          // y-axis
          if(!this.map.canMove(floorX, newY))
            dy = 0;

          bombTest = this.hasBomb({ x: floorX, y: newY})
          if(bombTest && bombTest.active)
            dy = 0;
            
          if(dx != 0 || dy != 0) {
            player.deltaMove(dx, dy);
            return true;
          } else {
            return false;
          }
        },

        placeBomb: function (socketId) {
          var player  = this.players[socketId];

          if(player.get('cooldown')) {
            console.log('player is cooling down');
            return null;
          }
            
          var bomb = new Bomb(bombId++, player, this.lastTick);
        
          player.set('cooldown', true); 
          console.log('placing bomb at: ' +bomb.x+ ", " +bomb.y); 

          this.bombs[bomb.id] = bomb;
          setTimeout(function () {this.clearCooldown(player)}.bind(this), COOLDOWN_TIME);
          return bomb;
        },

        update: function () {
          var now = getTicks();
          // TODO: test for input, move accordingly.
          _.forEach(this.players, function (player) {
            var flame = player.collision(this.flames);
            if(flame) {
              var killer = this.players[flame.playerId];
              var suicide = killer.get('id') == player.get('id'); 
              console.log(player.get('name')+ ' died, by suicide? ' +suicide);
              player.die();
              this.trigger('player-die', player, suicide);
              suicide ? this.scoreUpdate(player, -1) : this.scoreUpdate(killer, 1);
              setTimeout(this.spawnPlayer.bind(this, player), SPAWNING_TIME);
            }
          }.bind(this));

          _.forEach(this.bombs, function (bomb) {
            if(now - bomb.placedAt > BOMB_TIMER) 
              this.bombExplode(bomb);
            if(bomb.exploded)
              delete this.bombs[bomb.id]
            if(now - bomb.placedAt > FUSE_TIME)
              bomb.active = true;
          }.bind(this));
        
          this.lastTick = now;
        },

        scoreUpdate: function (player, score) {
          player.updateScore(score);
          this.trigger('player-score', player);
        },

        bombExplode: function (bomb) {
          // Bomb has already been exploded through the magic
          // of chaining.
          if(typeof(bomb) == 'undefined' || bomb.exploded)
            return;

          var tiles = [],
                  x = Math.floor(bomb.x),
                  y = Math.floor(bomb.y);

          console.log('bomb ' +bomb.id+ ' exploding at: ' +bomb.x+ ", " +bomb.y);
          bomb.exploded = true;
          this.map.removeBomb(bomb);
          
          tiles = this.getBombTiles(x, y);

          tiles = _.filter(tiles, function (tile) {
            return typeof(tile) != "undefined";
          });

          this.spawnFlames(tiles, bomb.playerId);

          dirtyTiles = _.filter(tiles, function (tile) {
            return tile.value == TILE_BRICK; 
          });

          this.map.updateMap(dirtyTiles);
 
          this.trigger(
            'bomb-explode', 
            { bomb: bomb, dirtyTiles: dirtyTiles }
          );
          
          this.chainBombs(tiles, bomb.id);
        },

        getBombTiles: function (x,y) {
          var result = [];
          // TODO: takeWhile
          result = result.concat(this.map.getXBombTiles(x, x-BOMB_STRENGTH, y));
          result = result.concat(this.map.getXBombTiles(x, x +BOMB_STRENGTH, y));
          result = result.concat(this.map.getYBombTiles(y, y-BOMB_STRENGTH, x));
          result = result.concat(this.map.getYBombTiles(y, y+BOMB_STRENGTH, x));
          return result;
        },

        spawnFlames: function (tiles, playerId) {
          var newFlames = [];
          _.forEach(tiles, function (tile) {
            var flame = new Flame(tile.x, tile.y, flameId++, playerId); 
            this.flames[flame.id] = flame;
            newFlames.push(flame);
          }.bind(this));
          this.trigger('flame-spawn', newFlames);
          setTimeout(this.killFlames.bind(this, newFlames), 1000);
        },

        killFlames: function (flames) {
          _.forEach(flames, function (flame) {
            delete this.flames[flame.id];
          }.bind(this));
          this.trigger('flame-die', flames);
        },

        chainBombs: function (tiles, bombId) {
          var bombs = [];
          _.forEach(this.bombs, function (bomb) {
            console.log('bombId: ' +bomb.id);
            _.forEach(tiles, function (tile) {
              if(this.collision(bomb, tile))
                console.log('collision: ' +bombId+ ' bomb.id: ' +bomb.id);
              if(this.collision(bomb, tile) && bomb.id != bombId) {
                console.log('chain');
                bombs.push(bomb);
              }
            }.bind(this));
          }.bind(this)); 

          _.forEach(bombs, function(bomb) { 
              console.log('should be chained: ' +util.inspect(bomb));
              this.bombExplode(bomb);
          }.bind(this));
        },
        
        hasBomb: function (tile) {
          var result = null;
          _.forEach(this.bombs, function (bomb) {
            console.log(Math.floor(tile.x)+ ', ' +Math.floor(tile.y));
            console.log(Math.floor(bomb.x)+ ', ' +Math.floor(bomb.y));
            if(  Math.floor(tile.x) == Math.floor(bomb.x) && 
                  Math.floor(tile.y) == Math.floor(bomb.y)) {
              result = bomb;
            }
          });
          return result;
        },

        collision: function (tile1, tile2) {
          return  (Math.floor(tile1.x) == Math.floor(tile2.x) && 
                  Math.floor(tile1.y) == Math.floor(tile2.y));
        },

        clearCooldown: function (player) {
          player.set('cooldown', false);
        }

    });


})();
