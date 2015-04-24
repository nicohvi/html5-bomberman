/*jslint node: true */
"use strict";

var _ = require ('lodash');

var lib = {

  coordinates: function (obj) {
    return { x: lib.floor(obj.x), y: lib.floor(obj.y) };
  },

  floor: function (x) { return Math.floor(x); },

  extend: function (EventEmitter) {
    EventEmitter.prototype.onMany = function (events, handler) {
      if (!events) { return; }

      if (!(events instanceof Array)) {
        events = [events];
      }
      
      let generateCallback = function (event) {
        let callback = function () {
          handler.apply(this, _.flatten([event, arguments])); 
        }.bind(this);
        return callback;
      }.bind(this);          
      
      _.forEach(events, function (event) {
        this.addListener(event, generateCallback(event));
      }.bind(this));
    };
  }

};

module.exports = lib;
