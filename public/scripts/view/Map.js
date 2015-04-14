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
  
  getTile (x, y) {
    var index = (y * this.width) + x;
    return this.map[index]; 
  }

  updateTile (x, y, value) {
    var index = (y * this.width) + x;
    this.map = this.map.substr(0, index) + value + this.map.substr(index+1);
  }
  
}

module.exports = Map;
