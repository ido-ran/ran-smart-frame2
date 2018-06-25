import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Typography, Button, IconButton, Drawer  } from '@material-ui/core'
import { List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { Menu, Home, CameraRoll, CropOriginal } from '@material-ui/icons';

import { Link  } from 'react-router'
import './App.css';

class App extends Component {

  constructor() {
    super()
    this.state = {content: ''}

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.toggleDrawer = this.toggleDrawer.bind(this);
  }

  componentWillMount() {
  }

  handleChange(event) {
    this.setState({content: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();

    this.setState({content: ''})
  }

  toggleDrawer(open) {
    return () => {
      this.setState({
        'drawer': open,
      });
    };
};

  render() {
    if ('/select-frame' === this.props.location.pathname) {
      // select-frame is standalone app and should not have the
      // applciation chrome.
      return (
        <div>
          {this.props.children}
        </div>
      );
    }

    const { classes } = this.props;

    return (
      <div>
        <AppBar position="static" color="primary">
          <Toolbar>
            <IconButton onClick={this.toggleDrawer(true)} className={classes.menuButton} color="inherit" aria-label="Menu">
              <Menu />
            </IconButton>
            <Typography type="title" color="inherit" className={classes.flex}>
              OomkiK
            </Typography>
            <Button color="inherit">Logout</Button>
          </Toolbar>
        </AppBar>
        <Drawer open={this.state.drawer}>
          <div
            tabIndex={0}
            role="button"
            onClick={this.toggleDrawer(false)}
            onKeyDown={this.toggleDrawer(false)}
          >
          <div className={classes.list}>
            <List>
              <ListItem>
                <Typography type="title" className={classes.flex}>
                  OomkiK
                </Typography>
              </ListItem>
              <ListItem button component={Link} to='/'>
                <ListItemIcon>
                  <Home />
                </ListItemIcon>
                <ListItemText primary="Home" />
              </ListItem>
              <ListItem button component={Link} to='/streams'>
                <ListItemIcon>
                  <CameraRoll />
                </ListItemIcon>
                <ListItemText primary="Streams" />
              </ListItem>
              <ListItem button component={Link} to='/frames'>
                <ListItemIcon>
                  <CropOriginal />
                </ListItemIcon>
                <ListItemText primary="Frames" />
              </ListItem>
            </List>
            </div>
          </div>
        </Drawer>
          {this.props.children}
      </div>
    );
  }
}

const styles = theme => ({
  root: {
    marginTop: theme.spacing.unit * 3,
    width: '100%',
  },
  flex: {
    flex: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  list: {
   width: 250,
  },
  listFull: {
   width: 'auto',
  },
});

export default withStyles(styles)(App);
