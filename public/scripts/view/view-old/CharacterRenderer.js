var _ = require('lodash');
var Renderer = require('./Renderer');

class CharacterRenderer extends Renderer {
  constructor (options) {
    super(options);
    this.charSize = options.charSize;
  }

  draw(players) {
    this.context.clearRect(0, 0, this.width, this.height);
    _.each(players, function (character) {
      this.drawTile(character.getSprite(), character.getTileId(),
        character.position.x, character.position.y, character.getTileSpec());
    }.bind(this))
  }
}

module.exports = CharacterRenderer;
