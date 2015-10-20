"use strict";

const Client = require('../../index');

let client = Client('Nico');

client.connect(controller => {

  function onKeyDown (event) {
    switch(event.which) {
 
      // up
      case 38:
        controller.move('up');
        break;     

      // down
      case 40:
        controller.move('down');
        break;
      
      // left
      case 37:
        controller.move('left');
        break;

      // right
      case 39:
        controller.move('right');
        break;

      // space
      case 32:
        controller.bomb();
        break;
    }
  };

  function onKeyUp () {
    controller.stop(); 
  };

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

});
