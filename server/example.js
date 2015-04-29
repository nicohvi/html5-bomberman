var Bacon = require('baconjs').Bacon;
var stream = Bacon.fromArray([1, 2, 3]);

stream.onValue(function (n) {
      console.log(n);
});

stream.onValue(function(n) {
      console.log("second " +n);
});
