/*jslint node: true */
"use strict";

const express = require("express"),
      app = express(),
      _server = require('http').Server(app),
      lib = require('./src/lib/lib'),
      EventEmitter = require('events').EventEmitter;

let server = {
  listen (customPort) {
    let port = customPort || 8080;
    _server.listen(port);
  },

  close () {
    _server.close();
  },

  httpServer: _server
};

server.get = (route, view) => {
  app.get(route, (req, res) => {
    res.render(view); 
  });
};


// Monkey patching/extensions 
lib.extend(EventEmitter);

app.use(express.bodyParser());
app.use(express.static(__dirname + "/public/"));

app.set('view engine', 'jade');
module.exports = server;
