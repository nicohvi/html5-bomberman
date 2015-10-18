"use strict";

const React = require('react');

let Buttons = React.createClass({

  getInitialState () {
    return { canStart: true };
  },

  start () {
    this.props.start.call();
    this.setState({ canStart: false });
  },

  reset () {
    this.props.reset.call();
    this.setState({ canStart: true });
  },

  render () {
    return (
    <div>
      <button onClick={this.start} disabled={!this.state.canStart}>Start round</button>
      <button onClick={this.reset}>Reset</button>
    </div>
    );
  }
});


let ButtonsComponent = {

  init (start, reset) {
    React.render(<Buttons start={start} reset={reset} />, 
    document.getElementById('js-buttons'));
  }

};

module.exports = ButtonsComponent;

