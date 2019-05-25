import React, { Component } from 'react';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import { Link } from 'react-router'
import { List, ListItem, ListItemText } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import { withStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import { CameraRoll } from '@material-ui/icons';

import { loadFrame, linkStreamToFrame, unlinkStreamToFrame } from './actions'
import { loadStreams } from '../streams/actions'

const styles = theme => ({
  root: {
    flexGrow: 1,
    margin: 30,
  },
});

/**
 * Present the list of streams connected to a frame.
 */
class FrameStreams extends Component {

  componentWillMount() {
    this.props.loadFrame(this.props.params.frameId)
    this.props.loadStreams()
  }

  handleToggle = stream => () => {
    const isSelected = this.props.frame.streams.find(selectedStream =>
      selectedStream.id === stream.id);

    if (isSelected) {
      this.unlinkStream(stream)
    } else {
      this.linkStream(stream)
    }
  };


  render() {
    const { classes } = this.props;

    if (!this.props.loaded) return null;

    const selectedStreamIds = this.props.frame.streams.map(stream => stream.id);
    return (
      <div className={classes.root}>
        <Link to={`/frames/${this.props.frame.frame.id}`}>
          <h1>{this.props.frame.frame.name}</h1>
        </Link>

        <h2>Streams</h2>

        <List>
          {this.props.streams.map(stream => (
            <ListItem
              key={stream.id}
              dense
              button
              onClick={this.handleToggle(stream)}
              className={classes.listItem}
            >
              <Avatar>
                <CameraRoll />
              </Avatar>
              <Checkbox
                checked={selectedStreamIds.indexOf(stream.id) !== -1}
                tabIndex={-1}
                disableRipple
              />
              <ListItemText primary={`${stream.name}`} />
            </ListItem>
          ))}
        </List>
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
    unlinkStreamToFrame,
  }, dispatch);
}

function mapStateToProps(state) {
  return {
    frame: state.frame.item,
    loaded: state.frame.loaded,
    streams: state.streams.items
  };
}

export default withStyles(styles)(connect(
  mapStateToProps,
  mapDispatchToProps
)(FrameStreams))
