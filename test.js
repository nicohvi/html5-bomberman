"use strict";

let Test = {
  test: 'hullo'
};

let testFact = function () {
  let test = Object.create(Test);
  console.log(test);
  return test;
};

var obj = testFact();

console.log(obj);
