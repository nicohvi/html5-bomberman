/*jshint browserify: true */
"use strict";

const React   = require('react'),
          _   = require('lodash'),
      Player  = require('./Player.react');

let Leaderboard = React.createClass({

  render () {
    let key = 0,
    players = 
      _.sortBy(this.props.players, plr => plr.score)
      .reverse()
      .map(plr => <Player player={plr} key={key++} />);

    return <ul className="leaderboard">{players}</ul>;
    
  }  

});

let LeaderboardComponent = {

  reload (players) {
    React.render(<Leaderboard players={players} />,
      document.getElementById('js-leaderboard'));
  }

};

module.exports = LeaderboardComponent;
