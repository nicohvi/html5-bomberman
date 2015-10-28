"use strict";

function clone (arr) {
  let i = arr.length;
  let copy = new Array(i);

  while (i--)
    copy[i] = arr[i];

  return copy;
}

function emitNone (handler, isFn, self, type) {
  if(isFn)
    handler.call(self); 
  else 
    clone(handler).forEach(listener => listener.call(self, type));
}

function emitPayload (handler, isFn, self, type, payload) {
  if(isFn)
    handler.call(self, type, payload); 
  else 
    clone(handler).forEach(listener => listener.call(self, type, payload));
}

class Emitter {
  constructor () {  
    this._events = {};
    this._all = null;
  }

  emit (type) {
    let events, len, isFn, all, handler;

    events  = this._events;    
    all     = this._all;
    handler = events[type];

    if (!handler && !all)
      return false;

    if(handler) {
      len = arguments.length;
      isFn = typeof handler === 'function';

      if(len > 1)
        emitPayload(handler, isFn, this, type, arguments[1]);
      else
        emitNone(handler, isFn, this, type);
    }

    if(all) {
      if(typeof all === 'function')
        all.call(this, type, arguments[1]);
      else
        clone(all).forEach(fn => fn.call(this, type, arguments[1]));
    }        
      
    return true;
  }

  on (type, fn) {
    let events, existing;

    if(typeof fn !== 'function')
      throw new TypeError('listener must be function');

    events = this._events;
    existing = events[type];
  
    if(!existing)
      events[type] = fn;
    else {
      if(typeof existing === 'function')
        events[type] = [existing, fn];
      else
        existing.push(fn);
    }

    return this; 
  }

  onMany (types, fn) {
    if(!(test instanceof Array))
      throw new TypeError('types must be an array');
    
    types.forEach(type => this.on(type, fn));
  }

  onAny (fn) {
    let existing;

    existing = this._all;

    if(!existing)
      this._all = fn;
    else {
      if(typeof existing === 'function')
        this._all = [existing, fn];
      else
        existing.push(fn);
    }

    return this;
  }
  
}

module.exports = Emitter;
