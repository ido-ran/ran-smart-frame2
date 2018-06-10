import React, { Component } from 'react';
import { Link  } from 'react-router'
import { connect } from 'react-redux'
import {bindActionCreators} from 'redux';
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import { List, ListItem, ListItemText } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import { withStyles } from '@material-ui/core/styles';
import { CameraRoll } from '@material-ui/icons';

import { loadStreams } from './actions'

const styles = theme => ({
  root: {
    flexGrow: 1,
    margin: 30,
  },
});

class Streams extends Component {

  constructor() {
    super()
    this.state = {newStreamName: ''}

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillMount() {
    this.props.loadStreams()
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <h1>Stream</h1>
        <List>
          {this.props.streams.items.map(stream => (
            <ListItem button key={`stream${stream.name}`}
                      component={Link} to={`/streams/${stream.id}`}>
              <Avatar>
                <CameraRoll />
              </Avatar>
              <ListItemText primary={stream.name} />
            </ListItem>
          ))}
        </List>

        <form onSubmit={this.handleSubmit}>
          <TextField label="Create New Stream" value={this.state.newStreamName} onChange={this.handleChange} />
          <Button color="primary" type="submit">Add</Button>
        </form>
      </div>
    );
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
