"use strict";

const Client = require('../../index');

Client
.init('Testman')
.connect().then(client => {
  console.log('client connected');
  console.log(client.state());  
});

