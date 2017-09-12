import React, { Component } from 'react';
import { connect } from 'react-redux'
import {bindActionCreators} from 'redux';

import { loadFrames } from '../frames/actions'

class Frames extends Component {

  constructor() {
    super()
    this.state = {newFrameName: ''}
    this.selectFrame = this.selectFrame.bind(this);
  }

  componentWillMount() {
    this.props.loadFrames()
  }

  render() {
    return (
      <div>
        <h1>Select a Frame</h1>
        <ul>
        {this.props.frames.items.map(frame => (
          <li key={`frame${frame.name}`}  className="select-frame-item"><button onClick={() => this.selectFrame(frame.id, frame.access_key)}>{frame.name}</button></li>
        ))}
        </ul>
      </div>)

  }

  selectFrame(frameId, frameAccessKey) {
    localStorage.setItem('frameId', frameId);
    localStorage.setItem('accessKey', frameAccessKey);

    location.pathname = '/public';
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
