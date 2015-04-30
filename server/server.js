/*jslint node: true */
"use strict";

const express = require("express");
const app = express();
const server = require('http').Server(app);
const io = require('socket.io').listen(server);
const lib = require('./game/lib/lib');
const EventEmitter = require('events').EventEmitter;

// Monkey patching/extensions 
lib.extend(EventEmitter);
const Server = require("./game/server");

Server.init(io);
app.use(express.bodyParser());

// Game
app.use(express.static(__dirname + "/../public/"));

server.listen(8080);
