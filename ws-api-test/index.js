var bomberman = require('./lib/game')('ws://localhost:8080/');
var Characters = require('./lib/chars')();

bomberman.join('Seal', Characters.Mary);


var dir = 'u';


setInterval(function() { 
  if (dir === 'd') {
    bomberman.moveDown();
  } else {
    bomberman.moveUp();
  }
}, 17)


setInterval(function() {
}, 5000);

