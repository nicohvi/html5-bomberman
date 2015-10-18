const $ = require('jquery'),
  GameManager = require('./GameManager'),
  Buttons = require('../components/buttons.react'),
  container = document.getElementById('js-buttons');

$(document).ready(function () { 
  GameManager.init(); 

  Buttons.init(GameManager.start, GameManager.reset);
});
