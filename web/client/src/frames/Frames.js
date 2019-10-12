import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import {bindActionCreators} from 'redux';

import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import { List, ListItem, ListItemText } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import { withStyles } from '@material-ui/core/styles';
import { CropOriginal } from '@material-ui/icons';

import { loadFrames } from './actions'

const styles = theme => ({
  root: {
    flexGrow: 1,
    margin: 30,
  },
});

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
    const { classes, frames } = this.props;

    return (
      <div className={classes.root}>
        <h1>Frames</h1>
        <List>
          {frames.items.map(frame => (
            <ListItem button key={`stream${frame.name}`}
                      component={Link} to={`/frames/${frame.id}`}>
              <Avatar>
                <CropOriginal />
              </Avatar>
              <ListItemText primary={frame.name} />
            </ListItem>
          ))}
        </List>

        <form onSubmit={this.handleSubmit}>
          <TextField label="Create New Frame" value={this.state.newFrameName} onChange={this.handleChange} />
          <Button color="primary" type="submit">Add</Button>
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

export default withStyles(styles)(connect(
  mapStateToProps,
  mapDispatchToProps
)(Frames))
