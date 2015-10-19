const express = require('express'),
  app = express(),
  server = require('http').Server(app),
  socketio = require('socket.io').listen(server),
  dualshock = require('dualshock-controller'),
  ctrl = dualshock({ config: 'dualshock4-generic-driver' }),
  socket = socketio.of('/ps');

app.use(express.bodyParser());

socket.on('connection', socket => {
  console.log('client connected');     

  ctrl.on('dpadLeft:press', data => socket.emit('left'));

  // And so forth
  
});;

server.listen(5000);


