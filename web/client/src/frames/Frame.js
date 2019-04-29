import React, { Component } from 'react';
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import { withStyles } from '@material-ui/core/styles';

import { loadFrame } from './actions'

const styles = () => ({
  root: {
    flexGrow: 1,
    margin: 30,
  },
});

class Frame extends Component {

  componentWillMount() {
    this.props.loadFrame(this.props.params.frameId)
  }

  render() {
    const { classes } = this.props;

    if (!this.props.loaded) return null;

    return (
      <div className={classes.root}>
        <h1>{this.props.frame.frame.name}</h1>

        <div>
          <Link to={`/frames/${this.props.frame.frame.id}/streams`}>Streams</Link>
        </div>
        <div>
          <Link to={`/frames/${this.props.frame.frame.id}/device-link`}>Device Link</Link>
        </div>
      </div>)
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    loadFrame,
  }, dispatch);
}

function mapStateToProps(state) {
  return {
    frame: state.frame.item,
    loaded: state.frame.loaded,
  };
}

export default withStyles(styles)(connect(
  mapStateToProps,
  mapDispatchToProps
)(Frame))
