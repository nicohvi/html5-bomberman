var _ = require('lodash');
var Renderer = require('./Renderer.js');

class MapRenderer extends Renderer {
  constructor (options) {
    super(options);
    this.map = options.map;
    this.tileSet = options.tileSet;
    this.tileSpec = this.tileSet.getTileSpec();
    this.draw();
  }
  
  draw() {
    // clear entire map
    this.context.clearRect(0, 0, this.width, this.height); 
    _.each(this.map, function (row, i) {
      _.each(row, function (tileId, j) {
        if(tileId)
          this.drawTile(this.tileSet.sprite, tileId, j, i);
      }.bind(this));
    }.bind(this));
  }
}

module.exports = MapRenderer;
