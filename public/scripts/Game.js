var $ = require('jquery');
var Time = require('./utils/time');
var _ = require('lodash');

var Game = {

  init: function (username) {
    // setup state
    this.players = [];
    this.lastTime = Time.GetTicks();
    this.view = $('#view');

    // layout
    _.defer(this.layout.bind(this)); 
      
    this.setupListeners.call(this);

    // initial update
    _.defer(this.update.bind(this));
  },

  setupListeners: function () {
    $(window).resize(this.layout.bind(this));
  },

  addPlayer: function (player) {
    this.players.push(player);
  },

  layout: function () {
    var $doc = $(document);

    this.view.css({
      left: 220 + ($doc.width() - 220 - this.view.width())/2 + 'px',
      top: '20px'
    });  
  },

  // TODO: move to game manager
  update: function () {
    var now   = Time.GetTicks(),
        delta = (now - this.lastTime) / 1000;
    
    this.updatePlayers(delta).bind(this)

    this.lastTime = now;
    window.requestAnimationFrame(this.update.bind(this));   
  },

  updatePlayers: function (delta) {
    this.players.map( function (player) {
      // TODO
      console.log('update player ' +player.name+ ' at delta: ' +delta);
    });
  }

};

module.exports = Game;
