/*jslint node: true */
"use strict";

const express = require("express");
const app = express();
const server = require('http').Server(app);
const io = require('socket.io').listen(server);
const lib = require('./server/game/lib/lib');
const EventEmitter = require('events').EventEmitter;
const GameServer = require("./server/game/server");
const port = process.env.PORT || 8080;

let socketman = {
  listen (customPort) {
    if(typeof(customPort) === 'undefined') {
      server.listen(port);
    } else {
      server.listen(customPort);
    }
  },

  close () {
    server.close();
  }
};

// Monkey patching/extensions 
lib.extend(EventEmitter);

app.use(express.bodyParser());
app.use(express.static(__dirname + "/public/"));

let gameServer = GameServer.init(io);

module.exports = socketman;
