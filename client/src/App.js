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
    return (
      <div>
        <div>Welcome to RanFrame</div>
        <Link to="/">Home</Link>
        <Link to="/streams">Streams</Link>
        <Link to="/frames">Frames</Link>
        {this.props.children}
      </div>
    );
  }
}

export default App;
