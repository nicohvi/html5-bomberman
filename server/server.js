/*jslint node: true */
"use strict";

const express = require("express"),
      app = express(),
      _server = require('http').Server(app);

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

app.use(express.bodyParser());
app.use(express.static(__dirname + "/public/"));

app.set('view engine', 'jade');
module.exports = server;
