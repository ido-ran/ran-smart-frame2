import React, { Component } from 'react';
import { Link  } from 'react-router'
import './App.css';

class App extends Component {

  constructor() {
    super()
    this.state = {content: ''}

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillMount() {
  }

  handleChange(event) {
    this.setState({content: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();

    this.setState({content: ''})
  }

  render() {
    if ('/select-frame' === this.props.location.pathname) {
      // select-frame is standalone app and should not have the
      // applciation chrome.
      return (
        <div>
          {this.props.children}
        </div>
      );
    }

    return (
      <div>
        <div>Welcome to RanFrame</div>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/streams">Streams</Link></li>
          <li><Link to="/frames">Frames</Link></li>
        </ul>
        {this.props.children}
      </div>
    );
  }
}

export default App;
