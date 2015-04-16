var dualshock = require('dualshock-controller');
var controller = dualshock({ config: 'dualshock4-generic-driver' });

module.exports = controller;
