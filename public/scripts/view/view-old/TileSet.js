class TileSet{

  constructor(options) {
    this.sprite = new Image();
    this.sprite.onload = this.onSpriteLoad.bind(this);
    this.sprite.src = options.src;
    this.tileSpec = options.tileSpec;
    this.callback = options.callback;
  }

  getTileSpec() {
    return this.tileSpec; 
  }

  onSpriteLoad() {
    this.callback.call(); 
  }

}

module.exports = TileSet;
