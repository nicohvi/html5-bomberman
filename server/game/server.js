TILE_EMPTY = 0;
TILE_BRICK = 1;
TILE_SOLID = 2;

SPAWNING_TIME = 5000;
_ = require('underscore')._;
Backbone = require('backbone');
var util = require('util');
var assign = require('object-assign');


require('./game.js');

var Server = Backbone.Model.extend({

    initialize: function(opt) {
        var io = opt.io;
        this.socketId = 1;
        this.views = [];

        io.set('log level', 1);
        
        this.game = new Game();

        // TODO: Conflate endpoints
        this.game.on('player-spawn', this.playerSpawned.bind(this));
        this.game.on('player-update', this.playerUpdate.bind(this));
        this.game.on('player-die', this.playerDie.bind(this));
        this.game.on('player-score', this.playerScore.bind(this));
        this.game.on('bomb-explode', this.bombExplode.bind(this));
        this.game.on('flame-spawn', this.flameSpawn.bind(this));
        this.game.on('flame-die', this.flameDie.bind(this));
        this.game.on('game-done', this.gameDone.bind(this));

        this.view = io.of('/view');
        this.view.on('connection', this.onViewConnection.bind(this));

        this.playerSocket = io.of('/game');
        this.playerSocket.on('connection', this.onPlayerConnection.bind(this));
  
    },

    // View connects the socket, receives inital game information
    // and is subscribed for future updates.
    onViewConnection: function (socket) {
      this.views.push(socket);
      console.log('view connected');
      
      socket.emit('game-info', { game: this.game.getState() } );

      socket.on('ping', function () { 
        socket.emit('pong') 
      }.bind(this) );

      socket.on('disconnect', function () { 
        console.log('disconnect');
        this.views.splice(this.views.indexOf(socket)); 
      }.bind(this) );
      
    }, 

    onPlayerConnection: function (socket) {
      console.log('player connected');
      var socketId = -1;
      
      socket.on('join-game', function (data) {
        socketId = this._generateSocketId();
        console.log('player ' +data.name+ ' joining the game.');
        var player = this.game.addPlayer(assign({ socketId: socketId }, data));
        socket.emit('joined-game', { player: player });
        this.playerJoined(player);
        this.game.spawnPlayer(player);
      }.bind(this));
      
      socket.on('request-move', function (data) {
        this.game.playerMove(socketId, data);
      }.bind(this));

      socket.on('stop-move', function () {
        var player = this.game.playerStop(socketId);
        this.playerUpdate(player);
      }.bind(this))

      socket.on('place-bomb', function () {
        var bomb = this.game.placeBomb(socketId);
        if(bomb)
          this.bombPlaced(bomb);
      }.bind(this));

      socket.on('disconnect', function () {
        console.log('socketId: ' +socketId+ ' disconnected');
        this.game.removePlayer(socketId); 
        this.playerLeft(socketId);
      }.bind(this));
    },

    _viewUpdate: function (event, payload) {
      var payload = payload || {};
      _.each(this.views, function (view) {
        view.emit(event, payload);
        if(!event == 'player-update')
          console.log("Emitting " +event);
     });
    },

    playerJoined: function (player) {
      this._viewUpdate('player-join', { player: player});
    },

    playerLeft: function (id) {
      this._viewUpdate('player-leave', { id: id });
    },
    
    playerSpawned: function (data) {
      this._viewUpdate('player-spawn', { player: data });
    },

    playerUpdate: function (player) {
      if(player == null) return;
      this._viewUpdate('player-update', { player: player });
    },

    playerDie: function (player, suicide) {
      if(player == null) return;
      this._viewUpdate('player-die', { player: player, suicide: suicide });
    },

    playerScore: function (player) {
      if(player == null) return;
      this._viewUpdate('player-score', { player: player });
    },

    bombPlaced: function (bomb) {
      if(bomb == null) return;
      this._viewUpdate('bomb-place', { bomb: bomb });
    },

    bombExplode: function (data) {
      this._viewUpdate('bomb-explode',{ state: data });
    },

    flameSpawn: function (flames) {
      this._viewUpdate('flame-spawn', { flames: flames });
    },

    flameDie: function (flames) {
      this._viewUpdate('flame-die', { flames: flames });
    },

    gameDone: function (player) {
      console.log('game done');
      this._viewUpdate('game-done', { player: player });
    },

    _generateSocketId: function () {
      return this.socketId++;
    }

});

module.exports = Server;
