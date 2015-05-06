/*jslint node: true */
"use strict";
const assert      = require('assert'),
      _           = require('lodash'),
      port        = 1337,
      http        = require('http'),
      server      = require('../../server'),
      io          = require('socket.io-client'),
      playerName        = 'Frank',
      socketURL   = 'http://0.0.0.0:'+port,
      options     = {
        transports: ['websocket'],
        'force new connection': true
      };

describe('/view', () => {

  before( () => server.listen(port));
  after( () => server.close()); 

  it("should get 200", (done) => {
    http.get('http://localhost:1337/view.html', (res) => {
      assert.equal(200, res.statusCode);
      done();
    });
  });

  describe("game state", () => {
    let view;
    afterEach( () => view.disconnect());

    it("serves the game state upon client connection", (done) => {
      view = io.connect(socketURL+'/view', options);
      
      view.on('game-info', (data) => {
        assert.equal(typeof(data.game), 'object');
        assert.equal(_.size(data.game.players), 0);
        done();
      });
    });

    it("updates game state when it is not default", (done) => {
      let client = io.connect(socketURL+'/game', options);
      client.once('connect', () => client.emit('join-game', { name: playerName }));

      view = io.connect(socketURL+'/view', options);
      view.once('game-info', (data) => {
        assert.equal(_.size(data.game.players), 0);
        done();
      });
    });
  });

  describe("player joining and leaving", () => {
    let view, player;
   
    beforeEach( () => {
      view    = io.connect(socketURL+'/view', options);
      player  = io.connect(socketURL+'/game', options);
      player.on('connect', () => { 
        player.emit('join-game', { name: playerName});
      });
    });

    afterEach( () => {
      view.disconnect();
      player.disconnect();
    });

    it("receives the player-join event", (done) => {
      view.once('player-join', (data) =>  {
        assert.equal(data.player.name, playerName);
        done();
      });
    });

    it("receives the player-spawn event", (done) => {
      view.once('player-spawn', (data) =>  {
        assert.equal(data.player.name, playerName);
        done();
      });
    });

    it("receives the player-leave event", (done) => {
      let playerId;
      player.on('connect', () => {
        player.on('joined-game', (data) => { 
          playerId = data.id;
          player.disconnect();
        });
      });
      view.once('player-leave', (data) => {
        assert.equal(data.id, playerId);
        done();
      });
    });
  });

});
