import React, { Component } from 'react';
import Streams from './streams/Streams'
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
      <Streams />
    );
  }
}

export default App;
