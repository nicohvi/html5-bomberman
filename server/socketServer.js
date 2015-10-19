"use strict";

const io = require('socket.io');

let _socketServer = null;

let server = {
  listen (port) {
    return io.listen(port);
  }
};

module.exports = server;
