var $ = require('jquery');

class Renderer {
  constructor(options) {
    this.$el = options.$el;
    this.width = this.$el.width();
    this.height = this.$el.height();
    this.tileSize = options.tileSize;
    this.context = this.$el.get(0).getContext('2d');
  }
  
  drawTile (sprite, tileId, x, y, tileSpec) {
    var tilePos,
        spriteSize;

    typeof(this.tileSpec) == 'undefined' ? tilePos = tileSpec[tileId] : tilePos = this.tileSpec[tileId];
    typeof(this.charSize) != 'undefined' ? spriteSize = this.charSize : spriteSize = this.tileSize;
              
    // position in sprite sheet
    if(!tilePos) return;
    if(typeof(this.tileSpec) == 'undefined')
      console.log(x, y);
    this.context.drawImage(
      sprite,
      tilePos.x, tilePos.y, spriteSize, spriteSize, //this.tileSize, this.tileSize, // source coords
      Math.floor(x * this.tileSize), Math.floor(y * this.tileSize),
      this.tileSize, this.tileSize // canvas coords
    );
  }

}

module.exports = Renderer;

