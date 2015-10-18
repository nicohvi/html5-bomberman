"use strict";

const React = require('react');

let _interval = null;

let Timer = React.createClass({

  getInitialState () {
    return { time: 10 };
  },

  componentDidMount () {
    _interval = setInterval(this.updateTimer, 1000);
  },

  updateTimer () {
    this.setState({ time: --this.state.time });
  },

  reset () {
    this.setState({ time: 10, hide: true });
  },

  render () {
    let style = this.state.time <= 3 ? "red" : "";
    return <h2 className={style} >{this.state.time > 0 ? this.state.time : 0}</h2>
  }

});

let Clock = {

  start (time) {
    React.render(<Timer />, document.getElementById('js-timer'));
  },

  stop () {
    clearInterval(_interval);
    React.unmountComponentAtNode(document.getElementById('js-timer'));
  }

};

module.exports = Clock;
