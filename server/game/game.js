var assign = require('object-assign');
var _ = require('lodash');
var util = require('util');
var BOMB_TIMER = 5000;
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
          if(!this.map.canMove(newX, floorY))// && this.canMove(newX, floorY))
            dx = 0;

          // y-axis
          if(!this.map.canMove(floorX, newY)) //&& this.canMove(floorX, newY))
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
          setTimeout(function () {this.map.placeBomb(bomb)}.bind(this), FUSE_TIME);
          setTimeout(function () {this.bombExplode(bomb)}.bind(this),
  BOMB_TIMER);
          setTimeout(function () {this.clearCooldown(player)}.bind(this), COOLDOWN_TIME);
          return bomb;
        },

        update: function () {
          var now = getTicks();
          // TODO: test for input, move accordingly.
          _.forEach(this.players, function (player) {
            var flame = player.collision(this.flames);
            if(flame) {
              var killer = this.players[this.bombs[flame.bombId].playerId];
              var suicide = killer.get('id') == player.get('id'); 
              console.log(player.get('name')+ ' died, by suicide? ' +suicide);
              player.die();
              this.trigger('player-die', player, suicide);
              suicide ? this.scoreUpdate(player, -1) : this.scoreUpdate(killer, 1);
              setTimeout(this.spawnPlayer.bind(this, player), SPAWNING_TIME);
            }
          }.bind(this));
        },

        scoreUpdate: function (player, score) {
          player.updateScore(score);
          this.trigger('player-score', player);
        },

        bombExplode: function (bomb) {
          var tiles = [],
                  x = Math.floor(bomb.x),
                  y = Math.floor(bomb.y);

          console.log('bomb exploding at: ' +bomb.x+ ", " +bomb.y);
          this.map.removeBomb(bomb);
          
          tiles = this.getBombTiles(x, y);

          tiles = _.filter(tiles, function (tile) {
            return typeof(tile) != "undefined";
          });

          this.spawnFlames(tiles, bomb.id);

          dirtyTiles = _.filter(tiles, function (tile) {
            return tile.value == TILE_BRICK; 
          });

          this.map.updateMap(dirtyTiles);
 
          this.trigger(
            'bomb-explode', 
            { bomb: bomb, dirtyTiles: dirtyTiles }
          );
          
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

        spawnFlames: function (tiles, bombId) {
          var newFlames = [];
          _.forEach(tiles, function (tile) {
            var flame = new Flame(tile.x, tile.y, flameId++, bombId); 
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

        clearCooldown: function (player) {
          player.set('cooldown', false);
        }

    });


})();
