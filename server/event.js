"use strict";

const _ = require('lodash');

module.exports = function extend (EventEmitter) {
  EventEmitter.prototype.onMany = function (events, handler) {
    if (!events)  return; 

    if (!(events instanceof Array)) events = [events];
    
    let generateCallback = event => {
      let callback = () => {
        handler.apply(this, _.flatten([event, arguments])); 
      };
      return callback;
    };          
    
    _.forEach(events, (event) => {
      this.addListener(event, generateCallback(event));
    });
  };

  return EventEmitter;
};
