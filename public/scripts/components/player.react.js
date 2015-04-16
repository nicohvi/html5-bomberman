var React = require('react');

var Player = React.createClass({

  render: function () {
    var cx = this.props.winner ? 'winner' : '';
    return <li className={cx}>{this.props.name}: {this.props.score}</li>;
  }

});

module.exports = Player;
