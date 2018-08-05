import React, { Component } from 'react';
import { Link  } from 'react-router'
import { connect } from 'react-redux'
import {bindActionCreators} from 'redux';
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import { List, ListItem, ListItemText } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import AddIcon from '@material-ui/icons/Add';
import { withStyles } from '@material-ui/core/styles';
import { CameraRoll } from '@material-ui/icons';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import { loadStreams } from './actions'

const styles = theme => ({
  root: {
    flexGrow: 1,
    margin: 30,
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing.unit * 2,
    right: theme.spacing.unit * 2,
  },
});

class Streams extends Component {

  constructor() {
    super()
    this.state = {
      newStreamName: '',
      addMenuEl: null
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillMount() {
    this.props.loadStreams()
  }

  render() {
    const { classes } = this.props;
    const { addMenuEl } = this.state;

    return (
      <div className={classes.root}>
        <h1>Stream</h1>
        <List>
          {this.props.streams.items.map(stream => (
            <ListItem button key={`stream${stream.id}`}
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

        <Button variant="fab" color="primary" aria-label="add" className={classes.fab} 
                onClick={this.handleAddButtonClicked}
                aria-owns={addMenuEl ? 'simple-menu' : null}>
          <AddIcon />
        </Button>

        <Menu
          id="simple-menu"
          anchorEl={addMenuEl}
          open={Boolean(addMenuEl)}
          onClose={this.hanndleAddMenuClosed}
        >
          <MenuItem onClick={this.hanndleAddMenuClosed}>Photo Files Album</MenuItem>
          <MenuItem onClick={this.hanndleAddMenuClosed}
                    component={Link} to='/streams/add-google-photo-album'>Google Photos Album</MenuItem>
        </Menu>
        
      </div>
    );
  }

  handleAddButtonClicked = (event) => {
    this.setState({ addMenuEl: event.currentTarget });
  }

  hanndleAddMenuClosed = () => {
    this.setState({ addMenuEl: null });
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
