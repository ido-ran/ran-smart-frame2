import React, { Component } from 'react';
import { connect } from 'react-redux'
import {bindActionCreators} from 'redux';

import { loadFrame, linkStreamToFrame, unlinkStreamToFrame } from './actions'
import { loadStreams } from '../streams/actions'

class Frame extends Component {

  componentWillMount() {
    this.props.loadFrame(this.props.params.frameId)
    this.props.loadStreams()
  }

  render() {
    if (!this.props.loaded) return null;
    return (
      <div>
        <h1>{this.props.frame.frame.name}</h1>

        <h2>Streams</h2>
        <ul>
          {this.props.frame.streams.map(stream => (
            <li key={`stream_${stream.id}`}><button onClick={() => this.unlinkStream(stream)}>{stream.name}</button></li>
          ))}
        </ul>

        <h2>Add stream</h2>
        <ul>
          {this.props.streams.map(stream => (
            <li key={`link_stream_${stream.id}`}><button onClick={() => this.linkStream(stream)}>{stream.name}</button></li>
          ))}
        </ul>
      </div>)
  }

  linkStream(stream) {
    this.props.linkStreamToFrame(stream.id, this.props.frame.frame.id)
  }

  unlinkStream(stream) {
    this.props.unlinkStreamToFrame(stream.id, this.props.frame.frame.id)
  }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
      loadFrame,
      loadStreams,
      linkStreamToFrame,
      unlinkStreamToFrame }, dispatch);
}

function mapStateToProps(state) {
    return {
        frame: state.frame.item,
        loaded: state.frame.loaded,
        streams: state.streams.items
    };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Frame)
