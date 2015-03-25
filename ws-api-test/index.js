var bomberman = require('./lib/game')('ws://localhost:8080/');
var Characters = require('./lib/chars')();

bomberman.join('Seal', Characters.Mary);

//var update = _.extend(cord, { o: 3, m: false});
//game.emit('update', update);



