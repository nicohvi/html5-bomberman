var React = require('react');
var _ = require('lodash');
var Player = require('./Player.react');

var Leaderboard = React.createClass({

  render: function () {
    var key = 0;
    var players = _.sortBy(this.props.players, function (player) {
      return player.score;
    }).reverse().map(function (player) {
      return <Player name={player.name} score={player.score} winner={player.winner} key={key++} />;
    });

    return <ul className="leaderboard">{players}</ul>;
    
  }  

});

module.exports = Leaderboard;
