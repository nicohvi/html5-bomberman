var express = require('express');
var app = express();
var server = require('http').Server(app);
var socketio = require('socket.io').listen(server);


var Server = require("../server/game/server");

new Server({io: socketio});


app.use(express.bodyParser());

// game
app.use('/controller', express.static(__dirname + "/public/"));
app.use(express.static(__dirname + '/../public/'))

server.listen(8080);

module.exports = app;
