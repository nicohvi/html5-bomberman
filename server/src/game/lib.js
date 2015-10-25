"use strict";

const _ = require ('lodash'),
      B = require('baconjs').Bacon;

module.exports = {

  // Stream API turns a collection into a stream through
  // the *sink* function which accepts values to be pushed
  // onto the stream.
  // In the example below the collection passed to *stream*
  // is iterated and its items are passed to *sink*, which
  // pushes them onto the stream. The *delay(0)* call is in order
  // to make the stream asynchronous.
  stream (collection) {
    return B.fromBinder(sink => {
      _.each(collection, item => sink(new B.Next(() => item)))
      return () => { };
    }).delay(0);
  },  

  syncStream (collection) {
    return B.fromBinder(sink => {
      _.each(collection, item => sink(new B.Next(() => item)))
      return () => { };
    });
  },  

  bombRange (groundZero, str) {
    let start = groundZero - str;
    let end   = groundZero + str;

    // +1 to include the last element
    let length = Math.ceil(end - start) + 1;
    let range = Array(length);

    for(let i = 0; i < length; i++, start++) {
      range[i] = start;
    }

    return range;
  }
};
