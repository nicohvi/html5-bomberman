/*jslint node: true*/
"use strict";


const tools       = require('./spec_helper'),
      assert      = tools.assert,
      map         = tools.createMap(),
      BombManager = tools.BombManager,
      _           = tools._,
      bombManager = BombManager({ map: map });

describe("Bomb Manager", () => {

  it("adds bombs", (done) => {
    bombManager.addBomb(tools.createBomb());
    assert.equal(1, _.size(bombManager.bombs));
    done(); 
  });

});
