var Client = require('../../client');
var PlaystationController = require('../../client/playstation');
// Write code here
console.log('nothing is implmented');


var psController = new PlaystationController();

psController.connect( (socket) => {

  socket.on('left', function (data) {
    console.log('left');
  });

  socket.on('right', function (data) {
    console.log('right');
  });

});

