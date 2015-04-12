var Canvas = require('./Canvas');

class Map {
  constructor(data) {
    this.x = data.x,
    this.y = data.y,
    this.width = data.width;
    this.height = data.height
    this.map = data.map;
    this.canvas = new Canvas(this);
  }

  draw () {
    if(this.canvas)
      this.canvas.draw();
  }
  
  setDirty (x, y, width, height) {
    if(this.canvas)
      this.canvas.addDirtyZone(x, y, width, height)
  }

  getTile (x, y) {
    var index = (y * this.width) + x;
    return this.map[index]; 
  }
  
}

module.exports = Map;
