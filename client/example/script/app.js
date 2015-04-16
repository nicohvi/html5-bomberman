var Socketman = require('../../index');
var $ = require('jquery');

var client = new Socketman('me.local:8080', 'Ove');

client.connect((controller) => {

  var onKeyDown = function (event) {
    switch(event.which) {
      // down
      case 40:
        controller.moveDown();
        break;
      // right
      case 39:
        controller.moveRight();
        //this.doMove({ x: 1, y: 0 });
        break;
      // up
      case 38:
        controller.moveUp();
        //this.doMove({ x: 0, y: -1 });
        break;
      // left
      case 37:
        controller.moveLeft();
        break;
      // space
      case 32:
        controller.placeBomb();
        break;
    }
  }

  $(document).on('keydown', onKeyDown.bind(this));

});
