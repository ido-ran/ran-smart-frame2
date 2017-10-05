import React, { Component } from 'react';
import { Link  } from 'react-router'
import { connect } from 'react-redux'
import {bindActionCreators} from 'redux';

import { loadFrames } from './actions'

class Frames extends Component {

  constructor() {
    super()
    this.state = {newFrameName: ''}

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillMount() {
    this.props.loadFrames()
  }

  render() {
    return (
      <div>
        <h1>Frames</h1>
        <ul>
        {this.props.frames.items.map(frame => (
          <li key={`frame${frame.name}`}><Link to={`/frames/${frame.id}`}>{frame.name}</Link></li>
        ))}
        </ul>

        <form onSubmit={this.handleSubmit}>
          <div>Create New Frame</div>
          <input type="text" value={this.state.newFrameName} onChange={this.handleChange} />
          <input type="submit" value="Submit" />
        </form>
      </div>)
  }


  handleChange(event) {
    this.setState({newFrameName: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();

    const {newFrameName} = this.state;
    var form = new FormData();
    form.append('name', newFrameName)

    fetch("/api/frames", {
      method: "POST",
      body: form,
      credentials: 'include'
    }).then(() => {
      setTimeout(this.props.loadFrames, 500)
    });

    this.setState({newFrameName: ''})
  }

}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({loadFrames}, dispatch);
}

function mapStateToProps(state) {
    return {
        frames: state.frames
    };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Frames)
