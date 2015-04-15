var React = require('react');

var Player = React.createClass({

  render: function () {
    return <li>{this.props.name}: {this.props.score}</li>;
  }

});

module.exports = Player;
