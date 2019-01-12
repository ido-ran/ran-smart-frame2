import React, { Component } from 'react';
import { connect } from 'react-redux'
import {bindActionCreators} from 'redux';
import { List, ListItem, ListItemText } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import { withStyles } from '@material-ui/core/styles';
import { CameraRoll } from '@material-ui/icons';

import { loadGoogleAlbums } from './actions'

const styles = () => ({
  root: {
    flexGrow: 1,
    margin: 30,
  },
});

class SelectGooglePhotoAlbum extends Component {

  constructor() {
    super()
    this.state = {
    }
  }

  componentWillMount() {
    this.props.loadGoogleAlbums(this.props.params.externalUserId)
  }

  createStreamFromGoogleAlbum = googleAlbum => (event) => {
    event.preventDefault();

    const googleAuth = this.props.params.externalUserId;

    const form = new FormData();
    form.append('googleAlbumId', googleAlbum.id)
    form.append('name', googleAlbum.title)

    fetch(`/api/google-albums/${googleAuth}`, {
      method: "POST",
      body: form,
      credentials: 'include'
    }).then((r) => {
      console.log('album created', r)
    });
  };

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <h1>Select Google Photos Album</h1>

        <List>
        {this.props.googlePhotoAlbums.map(googleAlbum => (
            <ListItem button key={`googleAlbum${googleAlbum.id}`}
                      onClick={this.createStreamFromGoogleAlbum(googleAlbum)}>
              <Avatar>
                <CameraRoll />
              </Avatar>
              <ListItemText primary={googleAlbum.title} />
            </ListItem>
          ))}
        </List>
      </div>)
  }

}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
      loadGoogleAlbums
    }, dispatch);
}

function mapStateToProps(state) {
  return {
    googlePhotoAlbums: state.streams.googlePhotoAlbums,
    googlePhotoAlbumsLoaded: state.streams.googleAuthLoaded
  };
}

export default withStyles(styles)(connect(
  mapStateToProps,
  mapDispatchToProps
)(SelectGooglePhotoAlbum))
