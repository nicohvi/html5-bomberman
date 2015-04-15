
var express = require("express");
var app = express();

var server = require('http').Server(app);
var socketio = require('socket.io').listen(server);


var redis = null;
//if (!process.env.SHORTFUSE_LIGHT)
     //redis = require("redis").createClient();

/////////////


global.counters = {};

var Server = require("./game/server");

new Server({io: socketio});


app.use(express.bodyParser());

// game
app.use(express.static(__dirname + "/../public/"));

server.listen(8080);

module.exports = app;
