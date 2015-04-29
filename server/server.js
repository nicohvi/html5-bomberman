/*jslint node: true */
"use strict";

let express = require("express");
let app = express();
let server = require('http').Server(app);
let io = require('socket.io').listen(server);
let lib = require('./game/lib/lib');
let EventEmitter = require('events').EventEmitter;
lib.extend(EventEmitter);

let Server = require("./game/server");

Server.init(io);
app.use(express.bodyParser());

// game
app.use(express.static(__dirname + "/../public/"));

server.listen(8080);
