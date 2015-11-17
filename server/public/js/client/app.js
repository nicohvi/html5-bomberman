"use strict";

const Client = require('./client');

Client
.init('Testman')
.connect().then(client => {
  console.log('client connected');
  console.log(client.state());  
});

