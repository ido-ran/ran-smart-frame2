import 'core-js/es6/map';
import 'core-js/es6/set';

import React, { Component } from 'react';
import { BrowserRouter, Link, Switch, Route } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Typography, Button, IconButton, Drawer } from '@material-ui/core'
import { List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { Menu, Home, CameraRoll, CropOriginal } from '@material-ui/icons';

import Streams from './streams/Streams'
import Stream from './streams/Stream'
import AddGooglePhotoAlbum from './streams/AddGooglePhotoAlbum'
import SelectGooglePhotoAlbum from './streams/SelectGooglePhotoAlbum'
import Photo from './streams/Photo'
import Frames from './frames/Frames'
import Frame from './frames/Frame'
import FrameStreams from './frames/FrameStreams'
import SelectFrame from './select-frame/SelectFrame'
import DeviceLink from './frames/DeviceLink'

import './App.css';

class App extends Component {

  constructor() {
    super()
    this.state = { content: '' }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.toggleDrawer = this.toggleDrawer.bind(this);
  }

  componentWillMount() {
  }

  handleChange(event) {
    this.setState({ content: event.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();

    this.setState({ content: '' })
  }

  toggleDrawer(open) {
    return () => {
      this.setState({
        'drawer': open,
      });
    };
  };

  render() {
    const { classes } = this.props;

    return (
      <BrowserRouter>
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
          <Switch>
            <Route path="/streams/:streamId" component={Stream} />
            <Route path="/streams/:streamId/photos/:photoId" component={Photo} />
            <Route path="/streams/add-google-photo-album" component={AddGooglePhotoAlbum} />
            <Route path="/streams/add-google-photo-album/:externalUserId" component={SelectGooglePhotoAlbum} />
            <Route path="/streams" component={Streams} />

            <Route path="/frames" component={Frames} />
            <Route path="/frames/:frameId" component={Frame} />
            <Route path="/frames/:frameId/streams" component={FrameStreams} />
            <Route path="/frames/:frameId/device-link" component={DeviceLink} />

            <Route path="/select-frame" component={SelectFrame} />
          </Switch>
        </div>
      </BrowserRouter>
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
