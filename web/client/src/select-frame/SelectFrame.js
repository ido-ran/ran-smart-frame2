/*global AndroidApp*/

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
          <li key={`frame${frame.name}`}  className="select-frame-item"><button onClick={() => this.selectFrame(frame)}>{frame.name}</button></li>
        ))}
        </ul>
      </div>)

  }

  selectFrame(frame) {
    const { name, id, access_key } = frame;

    if (typeof AndroidApp !== 'undefined') {

      // We run inside Android WebView with AndroidApp refere to object
      // injected by the Android application.
      AndroidApp.selectFrame(name, id.toString(), access_key)

    } else {

      localStorage.setItem('frameId', id);
      localStorage.setItem('accessKey', access_key);

      // location.pathname = '/frame-client';
    }
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
