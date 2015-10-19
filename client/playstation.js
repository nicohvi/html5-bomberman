const io = require('socket.io-client'),
      url = 'http://localhost:5000/ps';

let _socket = null;

let PlaystationCtrl = {

  connect (onConnect) {
    _socket = io.connect(url);
    _socket.on('connect', 
    () => {
      console.log('Connected to PS-controller');
      onConnect(_socket);
    });
  }

  
}

function ControllerFactory () {
  return Object.create(PlaystationCtrl);
}

module.exports = ControllerFactory;
