const dualshock = require('dualshock-controller');
  controller = dualshock({ config: 'dualshock4-generic-driver' });

module.exports = controller;
