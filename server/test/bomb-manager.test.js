/*jslint node: true*/
"use strict";

const tools       = require('./spec_helper'),
      assert      = tools.assert,
      map         = tools.createMap(),
      BombManager = tools.BombManager,
      _           = tools._,
      bombManager = BombManager({ map: map });

let bomb = null;

describe("Bomb Manager", () => {
  
  beforeEach( () => { 
    bombManager.addBomb(tools.createBomb(1, 50, 50)); 
    bomb = bombManager.getBomb(1);
  });

  afterEach( () => { 
    bombManager.removeAllBombs();
    bomb = null;
  });

  it("retrieves bombs", done => {
    assert.equal(50, bomb.x);
    assert.equal(50, bomb.y);
    done();
  });

  it("activates bombs", done => {
    assert.equal(false, bomb.active);

    bombManager.activateBomb(bomb);
    assert.equal(true, bomb.active);
    done();
  });

  it("blows shit up", done => {
    bombManager.explodeBomb(bomb);
    assert.equal(true, bomb.exploded);
    done();
  });

  it("adds bombs", done => {
    bombManager.addBomb(tools.createBomb(2, 50, 51));
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
      assert.equal(false, bombManager.hasBomb(50, 49));
      done();
    });


    it("returns true when a bomb is present", done => {
      bombManager.activateBomb(bomb);
      assert.equal(true, bombManager.hasBomb(50, 50));
      done();
    });    

  });

});
