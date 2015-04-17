/*jslint node: true */
"use strict";
// var util = require('util');

// Constants
var MOVE_AMOUNT   = 0.15;

var Player = function (data) {
  this.id = data.socketId;
  this.alive = false;
  this.score = 0;
  this.orient = 'down';
  this.cooldown = false;
  this.moving = false;
  this.direction = null; 
  this.diedAt = null;
  this.lastBomb = null;
};

Player.prototype.spawn = function (loc) {
  this.x = loc.x;
  this.y = loc.y;
  this.alive = true;
};

Player.prototype.stop = function () {
  this.moving = false;
  this.direction = null;
  return this;
};

Player.prototype.move = function (dir) {
  this.moving = true;
  this.direction = dir;
  return this;
};

Player.prototype.getAttemptedMove = function () {
  var dx = 0,
      dy = 0;

  switch(this.direction) {
    case 'left':
      dx -= MOVE_AMOUNT;
      break;
    case 'right':
      dx += MOVE_AMOUNT;
      break;
    case 'up':
      dy -= MOVE_AMOUNT;
      break;
    case 'down':
      dy += MOVE_AMOUNT;
      break;
  }

  return { dx: dx, dy: dy };
};

Player.prototype.deltaMove = function (dx, dy) {
  var orient = this.orient;

  this.x += dx;
  this.y += dy;
  
  if(dx > 0 && dy > 0) {
    console.log('both axis');
  }

  if(dx !== 0) {
    orient = dx > 0 ? 'left' : 'right';   
  }
  else if (dy !== 0) {
    orient = dy > 0 ? 'down' : 'up'; 
  }
  
  this.moving = true;
  this.orient = orient;
  return this;
};

Player.prototype.die = function (timeOfDeath) {
  this.alive = false;
  this.dieadAt = timeOfDeath;
};

Player.prototype.update = function (data) {
  var opts = data || {};

  this.score = opts.score;  
  return this;
};

Player.prototype.coolDown = function (time) {
  this.lastBomb = time;
  this.cooldown = true;
};

Player.prototype.stopCooldown = function () {
  this.cooldown = false;
  this.lastBomb = null;
};

