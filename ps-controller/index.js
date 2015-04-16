var express = require('express');

var app = express();
var server = require('http').Server(app);
var socketio = require('socket.io').listen(server);

var psController = require('./controller');

app.use(express.bodyParser());

var socket = socketio.of('/ps');

socket.on('connection', function (socket) {
  console.log('client connected');     

  psController.on('left:move', function (data) {
    console.log('moving left');
    socket.emit('left', { left: data });
  });

  psController.on('right:move', function (data) {
    console.log('moving right');
    socket.emit('right', { right: data });
  });
  
});;

server.listen(5000);


