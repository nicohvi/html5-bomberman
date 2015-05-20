/*jslint node: true*/
"use strict";


const tools       = require('./spec_helper'),
      assert      = tools.assert,
      map         = tools.createMap(),
      BombManager = tools.BombManager,
      _           = tools._,
      bombManager = BombManager({ map: map });

describe("Bomb Manager", () => {
  
  beforeEach( () => { 
    bombManager.addBomb(tools.createBomb(1)); 
  });
  afterEach( () => { 
    bombManager.removeAllBombs();
  });

  it("adds bombs", done => {
    bombManager.addBomb(tools.createBomb(2));
    assert.equal(2, _.size(bombManager.bombs));
    done(); 
  });

  it("removes bombs", done => {
    bombManager.removeBomb({ id: 1 });
    assert.equal(0, _.size(bombManager.bombs));
    done();
  });

  describe("Bomb coordinates", () => {

    it("returns false when no bomb is present", done => {
      done();
    });

  });

});
