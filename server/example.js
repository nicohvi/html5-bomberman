"use strict";
let Bacon = require('baconjs').Bacon;
let stream = Bacon.fromArray([1, 2, 3]);

function Closure () {
      this.message = 'lol';
      this.log = () => {
        () => console.log(this.message)();
        //stream.map( () => console.log(this.message) ).onValue();
        stream.map(function () { console.log(this.message); }.bind(this)).onValue();
      };
}

let obj = new Closure();
obj.log();
