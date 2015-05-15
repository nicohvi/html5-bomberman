/* jslint node: true */
"use strict";

const assert              = require('assert'),
      CollisionDetector   = require('../game/lib/CollisionDetector'),
  Map                     = require('../game/map'),
  BombManager             = require('../game/lib/BombManager'),
  Constants               = require('../game/constants'),
  Player                  = require('../game/player'),
  Bomb                    = require('../game/bomb'),
  playerOpts              = {
    id: 1,
    name: 'Frank',
  };

let map = null,
    bombManager = null,
    colDet = null,
    player  = new Player(playerOpts);

describe('CollisionDetector', () => {

  before( () => {
    map = new Map({ width: Constants.MAP_WIDTH,
                    height: Constants.MAP_HEIGHT });
    bombManager = BombManager({ map: map });
    colDet = CollisionDetector({  map: map, 
                                  bombManager: bombManager });
    let validLocation = map.getValidSpawnLocation();
    player.spawn(validLocation);
  });

  it("should return null when there is no collision", done => {
    let newTile = { x: player.x + 1, y: player.y +1 }
    map.setTile(newTile.x, newTile.y, Constants.TILE_EMPTY);

    assert.equal(null, colDet.collision(player, newTile));
    done();
  });

  it("should return the tile when there's a collision", done => {
    let newTile = { x: player.x + 1, y: player.y +1 }
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
          playerTile = { x: 51, y: 50 },
          emptyTile = { x: 52, y: 50 },
          bombId = 1;

    beforeEach( () => {
      map.setTile(bombTile.x, bombTile.y, Constants.TILE_EMPTY);
      map.setTile(playerTile.x, playerTile.y, Constants.TILE_EMPTY);
      map.setTile(emptyTile.x, emptyTile.y, Constants.TILE_EMPTY);
      let bomb = new Bomb({ id: bombId, 
      player: { x: bombTile.x, y: bombTile.y } });
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

});

