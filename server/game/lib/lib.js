/*jslint node: true */
"use strict";

var _ = require ('lodash');
let B = require('baconjs').Bacon;

var lib = {

  stream: function (collection) {
    return B.fromBinder(function (sink) {
      _.forEach(collection, function (item) {
        return sink(new B.Next(function() {
            return item; 
          }));
      });

      return function () { };
    // Delay makes the stream source async, which will be 
    // default in bacon 0.8
    }).delay(0);
  },  

  syncStream: function (collection) {
    return B.fromBinder(function (sink) {
      _.forEach(collection, function (item) {
        return sink(new B.Next(function() {
            return item; 
          }));
      });

      return function () { };
    // Delay makes the stream source async, which will be 
    // default in bacon 0.8
    });
  },  

  range: function (start, end) {
    // +1 to include the end;
    let length = Math.max(Math.ceil(end-start)) +1;
    let range = Array(length);

    for(var i = 0; i < length; i++, start++) {
      range[i] = start;
    }

    return range;
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
