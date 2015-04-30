/*jshint browserify: true */
"use strict";

const React = require('react');
const _ = require('lodash');
const Player = require('./Player.react');

const Leaderboard = React.createClass({

  render: function () {
    const key = 0;
    const players = _.sortBy(this.props.players, function (player) {
      return player.score;
    }).reverse().map(function (player) {
      return <Player name={player.name} score={player.score} winner={player.winner} key={key++} />;
    });

    return <ul className="leaderboard">{players}</ul>;
    
  }  

});

module.exports = Leaderboard;
