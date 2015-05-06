/*jslint node: true */
"use strict";
const assert      = require('assert'),
      _           = require('lodash'),
      port        = 1337,
      http        = require('http'),
      server      = require('../../server'),
      gameServer  = require('../game/server'),
      io          = require('socket.io-client'),
      name        = 'Frank',
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

  it("serves the game state upon client connection", (done) => {
    let view = io.connect(socketURL+'/view', options);
      
    view.on('game-info', (data) => {
      assert.equal(typeof(data.game), 'object');
      done();
    });
  });

  it("receives updates from the server whenever a new player joins", (done) => {
    let view    = io.connect(socketURL+'/view', options),
        player  = io.connect(socketURL+'/game', options);

    view.on('game-info', (data) => {
      assert.equal(_.size(data.game.players), 0);
    });

    player.on('connect', () => { 
      player.emit('join-game', { name: name});
    });

    it("receives the player-join event", (done) => {
      view.on('player-join', (data) =>  {
        assert.equal(data.player.name, name);
        done();
      });
    });

    it("receives the player-spawn event", (done) => {
      view.on('player-spawn', (data) =>  {
        assert.equal(data.player.name, name);
        done();
      });
    });

    done();

  });

});
