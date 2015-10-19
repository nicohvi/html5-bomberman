/*jslint node: true */
"use strict";

const tools             = require('./spec_helper'),
      assert            = tools.assert,
      CollisionDetector = tools.CollisionDetector,
      BombManager       = tools.BombManager,
      Constants         = tools.Constants,
      player            = tools.createPlayer();

let map = null,
    bombManager = null,
    colDet = null;

describe('CollisionDetector', () => {

  before( () => {
    map = tools.createMap();
    bombManager = BombManager({ map: map });
    colDet = CollisionDetector({  map: map, 
                                  bombManager: bombManager });
    let validLocation = map.getValidSpawnLocation();
    player.spawn(validLocation);
  });

  it("should return null when there is no collision", done => {
    let newTile = { x: player.x + 1, y: player.y +1 };
    map.setTile(newTile.x, newTile.y, Constants.TILE_EMPTY);

    assert.equal(null, colDet.collision(player, newTile));
    done();
  });

  it("should return the tile when there's a collision", done => {
    let newTile = { x: player.x + 1, y: player.y +1 };
    map.setTile(newTile.x, newTile.y, Constants.TILE_SOLID);

    player.deltaMove(1,1);
    assert.equal(newTile, colDet.collision(player, newTile));
    done();
  });

  describe("map collision", () => {
    const brickTile = { x: 50, y: 50 },
          solidTile = { x: 51, y: 50 },
          emptyTile = { x: 52, y: 50 };

    beforeEach( () => {
      map.setTile(brickTile.x, brickTile.y, Constants.TILE_BRICK);
      map.setTile(solidTile.x, solidTile.y, Constants.TILE_SOLID);
      map.setTile(emptyTile.x, emptyTile.y, Constants.TILE_EMPTY);
    });

    it("should return false for empty tiles", done => {
      console.log(map.getTile(emptyTile.x, emptyTile.y));
      assert.equal(false, colDet.mapCollision(emptyTile.x, 
                                              emptyTile.y));
      done();
    });    

    it("should return true for solid and brick tiles", done => {
      assert.equal(true, colDet.mapCollision( brickTile.x,
                                              brickTile.y));
      assert.equal(true, colDet.mapCollision( solidTile.x,
                                              solidTile.y));
      done();
    });    
  });

  describe("bomb collision", () => {
    const bombTile = { x: 50, y: 50 },
          emptyTile = { x: 52, y: 50 };

    beforeEach( () => {
      map.setTile(bombTile.x, bombTile.y, Constants.TILE_EMPTY);
      map.setTile(emptyTile.x, emptyTile.y, Constants.TILE_EMPTY);
      let bomb = tools.createBomb(1, 50, 50);
      bomb.active = true;
      bombManager.addBomb(bomb);
    });

    afterEach( () => {
      bombManager.removeBomb({ id: 1 });
    }); 

    it("should return false for tiles with no bombs", done => {
      assert.equal(false, colDet.bombCollision( emptyTile.x,
                                                emptyTile.y));
      done();
    });

    it("should return true for tiles with a bomb", done => {
      assert.equal(true, colDet.bombCollision( bombTile.x,
                                                bombTile.y));
      done();
    });
  });

  describe("can move", () => {
    const bombTile = { x: 50, y: 50 },
          brickTile = { x: 51, y: 50 },
          solidTile = { x: 52, y: 50 },
          emptyTile = { x: 53, y: 50 };

    beforeEach( () => {
      map.setTile(bombTile.x, bombTile.y, Constants.TILE_EMPTY);
      map.setTile(brickTile.x, brickTile.y, Constants.TILE_BRICK);
      map.setTile(solidTile.x, solidTile.y, Constants.TILE_SOLID);
      map.setTile(emptyTile.x, emptyTile.y, Constants.TILE_EMPTY);
      let bomb = tools.createBomb(1, bombTile.x, bombTile.y); 
      bomb.active = true;
      bombManager.addBomb(bomb);
    });

    afterEach( () => {
      bombManager.removeBomb({ id: 1 });
    }); 

    it("returns false when the move is not allowed", done => {
      assert.equal(false, colDet.canMove(bombTile.x, bombTile.y)); 
      assert.equal(false, colDet.canMove(brickTile.x, brickTile.y)); 
      assert.equal(false, colDet.canMove(solidTile.x, solidTile.y)); 
      done();
    });

    it("returns true when the move is allowed", done => {
      assert.equal(true, colDet.canMove(emptyTile.x, emptyTile.y));
      done();
    });

  });

});
