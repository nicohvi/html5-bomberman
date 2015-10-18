const React = require('react');

let Player = React.createClass({

  render: function () {
    var cx = this.props.player.winner ? 'winner' : '';
    return <li className={cx}>{this.props.player.name}: {this.props.player.score}</li>;
  }

});

module.exports = Player;
