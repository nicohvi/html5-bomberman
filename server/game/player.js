var LEFT = 37;
var UP = 38;
var RIGHT = 39;
var DOWN = 40;
var SPACE = 32;
var PLAYER_MOVE_SPEED = 0.125;
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
          spawnAt: 0, // time until spawn
          score: 0,
          movement: {},
          orient: ORIENT_DOWN
        },

        initialize: function(data) {
            this.set('id', data.socketId);
        },

        spawn: function (loc) {
          this.set('x', loc.x);
          this.set('y', loc.y);
          this.set('alive', true);
        },

        update: function () {
          var dx = 0,
              dy = 0,
              movement = this.get('movement');

          if (!this.get('alive')) return;
          
          var speed = PLAYER_MOVE_SPEED;

          if (movement[LEFT])   dx-=speed;
          if (movement[RIGHT])  dx+=speed;
          if (movement[UP])     dy-=speed;
          if (movement[DOWN])   dy+=speed;
          
          var moving = movement[LEFT] || movement[RIGHT] || movement[UP] || movement[DOWN];

          this.set('moving', moving===true);
          return { dx: dx, dy: dy };
        },

        stop: function () {
          //console.log('stopping player ' +this.get('id'))
          //var movement = this.get('movement')          
          //movement[LEFT] = false;
          //movement[RIGHT] = false;
          //movement[UP] = false;
          //movement[DOWN] = false;
          //this.set('movement', movement)
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
  
        input: function (data) {
          var movement = this.get('movement');

          switch(data.dir) {
            case "left":
              movement[LEFT] = true;
              break;
            case "right":
              movement[RIGHT] = true;
              break;
            case "up":
              movement[UP] = true;
              break;
            case "down":
              movement[DOWN] = true;
              break;
          }
        
          console.log('input for player '+this.get('id'))
          
          this.set('movement', movement);
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

        die: function() {
            this.set('alive', false);
        },

        coolingDown: function() {
          return this.get('coolDown').state;
        },

        coolDown: function() {
          this.set('coolDown', { state: true, last: new Date() });
        },

        updateCooldown: function() {
          // TODO: Move to constant
          var now = new Date();
          if( (now - this.get('coolDown').last) > 1000 && this.coolingDown()) {
            this.set('coolDown', { state: false, last: now });
          }
        }

    });
})();


    //PlayerController = Backbone.Model.extend({

        //initialize: function(opt) {
            //this.id = opt.id;
            //this.me = opt.player;
            //this.game = opt.game;
            //this.endpoint = opt.endpoint;
            //this.socket = opt.socket;

            //this.socket.on('update', _.bind(this.onUpdate, this));
            //this.socket.on('dead', _.bind(this.onDead, this));
            //this.socket.on('disconnect', _.bind(this.onDisconnect, this));
            //this.socket.on('put-bomb', _.bind(this.onPlaceBomb, this));
            //this.socket.on('spawn-powerup', _.bind(this.onPowerup, this));
            //this.socket.on('chat', _.bind(this.onChat, this));
            //this.socket.on('pong', _.bind(this.onPong, this));

            //// check for map changes
            //this.game.map.on('notify', function() {
                //this.socket.emit('map', this.game.map.getMap());
            //}, this);

            //this.pingTimer = setInterval(_.bind(this.ping, this), 2000);

            //this.notifyFriendBattles();
        //},

        //ping: function() {
            //var info = { now: (new Date()).getTime(), lags: {} };
            //_.each(this.game.playersById, function(p,k) {
                //info.lags[k] = p.lag;
            //});

            //this.socket.emit("laginfo", info );
        //},

        //onPong: function(d) {
            //this.me.lag = ((new Date()).getTime() - d.t) / 2;
        //},

        //onUpdate: function(d) {
            //this.me.setUpdate(d);
            //// update everyone else about my update
            //this.socket.broadcast.volatile.emit('player-update', this.me.getUpdate());
            //this.view.emit('player-update', this.me.getUpdate());
        //},

        //onDead: function(d) {
            //this.me.die();

            //this.game.scoreKill(d.id, d.flameOwner);

            //this.me.set('spawnAt', this.game.lastTick + SPAWNING_TIME);
            //// notify everyone else
            //this.endpoint.emit('player-dying', d);
        //},

        //onDisconnect: function() {
            //clearInterval(this.pingTimer);
            //console.log("- " + this.me.get('name') + " disconnected");
            //this.socket.broadcast.emit('player-disconnected', {id: this.id} );

            //this.trigger("disconnect");
        //},

        //onPlaceBomb: function(d) {
////            console.log('Placing bomb at ' + d.x + ", " + d.y);

            //// can place bomb there?
            //if (!this.game.bombs.any(function(b) { return b.get('x') == d.x && b.get('y') == d.y; }) && !this.me.coolingDown())
            //{
                //// no bomb here
                //this.game.bombs.add(new Bomb({x: d.x, y: d.y, owner: this.id}));
                //// notify everyone
                //this.endpoint.emit('bomb-placed', {x: d.x, y: d.y, owner: this.id});
                //this.me.coolDown();
            //} else {
                //console.log('A bomb at ' + d.x + ", " + d.y + " already exists!");
            //}
        //},

        //onPowerup: function(p) {
          //console.log('spawning powerup on server');
          //this.game.powerups.add(new Powerup({x: p.x, y: p.y, type: p.type}));
          //this.endpoint.emit('powerup', {x: p.x, y: p.y, type: p.type});
        //},

        //onChat: function(d) {
            //console.log('> ' + this.me.get('name') + ": " + d.chat, 'chat');
            //this.endpoint.emit('chat', d);
        //},

        //spawnPlayer: function() {
            //this.me.set('alive', true);
            //var loc = this.game.map.getValidSpawnLocation();
            //console.log("  . Spawn " + this.me.get('name') + " at " + loc.x+","+loc.y);
            //this.endpoint.emit('player-spawned', {
                //id: this.id,
                //x: loc.x,
                //y: loc.y
            //});
        //},

        //notifyGameState: function(d) {
            //// send map
            //this.socket.emit('map', this.game.map.getMap());

            //// joined players
            //_.each(this.game.playersById, function(p) {
                //if (p == this.me) return;
                //this.socket.emit('player-joined', p.getInitialInfo());

                //if (p.get('alive')) {
                    //this.socket.emit('player-spawned', {id: p.get('id'), x: p.get('x'), y: p.get('y')});
                //}
            //}, this);

            //// placed bombs
            //// TODO
        //},

        //notifyFriendBattles: function() {
            //var myfbuid = this.me.get('fbuid');
            ////FIXME is it null or -1?
            //if (!myfbuid) return;

            //var pids = [];

            //if (this.game.redis)
                //var m = this.game.redis.multi();

            //_.each(this.game.playersById, function(p, k) {
                //// FIXME same as above
                //var pfbuid = p.get('fbuid');
                //if (!pfbuid) return;
                //if (pfbuid == myfbuid) return;

                //pids.push(k);

                //if (m) {
                    //m.get("kill:" + pfbuid + ":by:" + myfbuid);
                    //m.get("kill:" + myfbuid + ":by:" + pfbuid);
                //}
            //});

            //var self = this;

            //if (m) {
                //m.exec(function(err, res) {
                    //self.socket.emit('friend-scores', {ids: pids, scores: res});
                //});
            //}
        //}

    //});


//})();
