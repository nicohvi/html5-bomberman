/*jslint node: true */
"use strict";

var lib = {

  // Returns map-coordinates based on position.
  // 
  // ex: obj.x = 16.43, obj.y = 13.2
  // lib.coordinates(obj) -> { x: 16, y: 13 }
  coordinates: function (obj) {
    var x = 0,
        y = 0;
    
    if(typeof(obj) !== 'undefined') {
      x = Math.floor(obj.x) || 0;
      y = Math.floor(obj.y) || 0;
    }
    return { x: x, y: y };
  }
};

module.exports = lib;
