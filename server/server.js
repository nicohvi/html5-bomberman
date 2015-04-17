/*jslint node: true */
"use strict";

var express = require("express");
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

var Server = require("./game/server");

Server.init(io);
app.use(express.bodyParser());

// game
app.use(express.static(__dirname + "/../public/"));

server.listen(8080);
