"use strict";

const Client = require('../../index');

let client = Client('Navn');

client.connect(controller => {

  let onKeyDown = function (event) {
      // Gjør noe smart! :-)
    }
  }

  document.addEventListener('keydown', onKeyDown);

});
