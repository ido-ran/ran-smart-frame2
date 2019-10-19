import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import {bindActionCreators} from 'redux';
import Fab from '@material-ui/core/Fab';
import { List, ListItem, ListItemText, ListItemIcon } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { withStyles } from '@material-ui/core/styles';
import { CameraRoll } from '@material-ui/icons';

import { loadStreams } from './actions'

const styles = theme => ({
  root: {
    flexGrow: 1,
    margin: 30,
  },
  fab: {
    margin: theme.spacing(1),
  },
  extendedIcon: {
    marginRight: theme.spacing(1),
  },
});

class Streams extends Component {

  constructor() {
    super()
    this.state = {
      newStreamName: '',
      addMenuEl: null
    };

  }

  componentDidMount() {
    this.props.loadStreams()
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <h1>Stream</h1>
        <List>
          {this.props.streams.items.map(stream => (
            <ListItem button key={`stream${stream.id}`}
                      component={Link} to={`/streams/${stream.id}`}>
              <ListItemIcon>
                <CameraRoll />
              </ListItemIcon>
              <ListItemText primary={stream.name} />
            </ListItem>
          ))}
        </List>

        <Fab variant="extended" color="primary" aria-label="add" className={classes.fab} 
                onClick={this.handleAddButtonClicked}
                component={Link} to='/streams/add-google-photo-album'>
          <AddIcon />
          Create New Stream
        </Fab>
        
      </div>
    );
  }

  handleAddButtonClicked = (event) => {
    this.setState({ addMenuEl: event.currentTarget });
  }

}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({loadStreams}, dispatch);
}

function mapStateToProps(state) {
    return {
        streams: state.streams
    };
}

export default withStyles(styles)(connect(
  mapStateToProps,
  mapDispatchToProps
)(Streams))
