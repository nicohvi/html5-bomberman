const GameManager = require('./GameManager'),
      Buttons = require('../components/buttons.react'),
      container = document.getElementById('js-buttons');

GameManager.init();
Buttons.init(GameManager.start, GameManager.reset);
