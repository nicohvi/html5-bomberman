"use strict";

const Client = require('../../index'),
      PsController = require('../../playstation');

let client = Client('Navn'),
    psCtrl = PsController();

client.connect(controller => {

  psCtrl.connect(psSocket => {
    psSocket.on('left', data => controller.move('left'));
  });

  // And so forth.

});
