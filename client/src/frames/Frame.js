import React, { Component } from 'react';
import { connect } from 'react-redux'
import {bindActionCreators} from 'redux';

import { loadFrame } from './actions'

class Frame extends Component {

  componentWillMount() {
    this.props.loadFrame(this.props.params.frameId)
  }

  render() {
    return (
      <div>
        <h1>{this.props.frame.name}</h1>
      </div>)
  }

}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({loadFrame}, dispatch);
}

function mapStateToProps(state) {
    return {
        frame: state.frame.item,
        isLoaded: state.frame.isLoaded
    };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Frame)
