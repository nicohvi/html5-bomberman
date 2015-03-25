var bomberman = require('./lib/game')('ws://localhost:8080/');
var Characters = require('./lib/chars')();

bomberman.join('Seal', Characters.Mary);

setInterval(function() { bomberman.moveUp() }, 5000)

setTimeout(function() {
  setInterval(function() { bomberman.moveDown() }, 5000)
}, 2500);


setInterval(function() {
  bomberman.placeBomb();
}, 2500);

