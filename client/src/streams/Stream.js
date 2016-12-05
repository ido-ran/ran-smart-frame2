import React, { Component } from 'react';
import { Link  } from 'react-router'
import { connect } from 'react-redux'
import {bindActionCreators} from 'redux';

import { loadStream } from './actions'

class Stream extends Component {

  constructor() {
    super()
    this.state = {newStreamName: ''}

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillMount() {
    this.props.loadStream(this.props.params.streamId)
  }

  render() {
    return (
      <div>
        <h1>{this.props.stream.name}</h1>
        <form onSubmit={this.handleSubmit}>
          <div>Create New Stream</div>
          <input type="text" value={this.state.newStreamName} onChange={this.handleChange} />
          <input type="submit" value="Submit" />
        </form>
      </div>)
  }


  handleChange(event) {
    this.setState({newStreamName: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();

    const {newStreamName} = this.state;
    var form = new FormData();
    form.append('name', newStreamName)

    fetch("/api/streams", {
      method: "POST",
      body: form,
      credentials: 'include'
    }).then(() => {
      setTimeout(this.props.loadStreams, 500)
    });

    this.setState({newStreamName: ''})
  }

}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({loadStream}, dispatch);
}

function mapStateToProps(state) {
    return {
        stream: state.stream.item,
        isLoaded: state.stream.isLoaded
    };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Stream)
