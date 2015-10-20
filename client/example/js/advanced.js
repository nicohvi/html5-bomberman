"use strict";

const Client = require('../../index'),
      PsController = require('../../playstation');

let client = Client('Navn'),
    psCtrl = PsController();

client.connect(controller => {

  psCtrl.connect(psSocket => {
    psSocket.on('left', data => controller.move('left'));
    psSocket.on('right', data => controller.move('right'));
    psSocket.on('up', data => controller.move('up'));
    psSocket.on('down', data => controller.move('down'));
    psSocket.on('square', data => controller.bomb());
  });

});
