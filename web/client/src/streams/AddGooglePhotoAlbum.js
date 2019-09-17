import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import {bindActionCreators} from 'redux';
import { List, ListItem, ListItemText, ListItemIcon, Fab } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { withStyles } from '@material-ui/core/styles';
import { AccountBox } from '@material-ui/icons';

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
                <AccountBox />
              </ListItemIcon>
              <ListItemText primary={googleAuth.last_email} />
            </ListItem>
          ))}
        </List>

        <Fab variant="extended" color="primary" aria-label="add" className={classes.fab} 
                href={googleOAuthEndpointLoaded ? googleOAuthEndpoint.oauth_endpoint : ''}>
          <AddIcon />
          Connect to Google Photos
        </Fab>

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
