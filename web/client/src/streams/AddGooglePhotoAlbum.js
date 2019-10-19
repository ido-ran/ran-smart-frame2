import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import {bindActionCreators} from 'redux';
import Button from '@material-ui/core/Button'
import { List, ListItem, ListItemText, ListItemIcon } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { CameraRoll } from '@material-ui/icons';

import { loadGoogleAuth, loadGoogleOAuthEndpoint } from './actions'

const styles = () => ({
  root: {
    flexGrow: 1,
    margin: 30,
  },
});

class AddGooglePhotoAlbum extends Component {

  constructor() {
    super()
    this.state = {
    }
  }

  componentWillMount() {
    this.props.loadGoogleAuth()
    this.props.loadGoogleOAuthEndpoint()
  }

  render() {
    const { classes, 
      googleOAuthEndpointLoaded, 
      googleOAuthEndpoint,
    } = this.props;

    return (
      <div className={classes.root}>
        <h1>Add Google Photos Album</h1>

        <List>
          {this.props.googleAuth.map(googleAuth => (
            <ListItem button key={`googleAuth${googleAuth.id}`}
                      component={Link} to={`/streams/add-google-photo-album/${googleAuth.external_user_id}`}>
              <ListItemIcon>
                <CameraRoll />
              </ListItemIcon>
              <ListItemText primary={googleAuth.last_email} />
            </ListItem>
          ))}
        </List>

        <Button color="primary" variant="contained"
                component='a' href={googleOAuthEndpointLoaded ? googleOAuthEndpoint.oauth_endpoint : ''}>Connect to Google Photos</Button>
      </div>)
  }

}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
      loadGoogleAuth,
      loadGoogleOAuthEndpoint,
    }, dispatch);
}

function mapStateToProps(state) {
  return {
    googleAuth: state.streams.googleAuth,
    googleAuthLoaded: state.streams.googleAuthLoaded,
    googleOAuthEndpointLoaded: state.streams.googleOAuthEndpointLoaded,
    googleOAuthEndpoint: state.streams.googleOAuthEndpoint,
  };
}

export default withStyles(styles)(connect(
  mapStateToProps,
  mapDispatchToProps
)(AddGooglePhotoAlbum))
