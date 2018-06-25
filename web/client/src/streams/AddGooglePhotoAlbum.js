import React, { Component } from 'react';
import { connect } from 'react-redux'
import {bindActionCreators} from 'redux';
import Button from '@material-ui/core/Button'
import { Link  } from 'react-router'

import { withStyles } from '@material-ui/core/styles';

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

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <h1>Add Google Photos Album</h1>

        <Button color="primary" variant="contained"
                component='a' href='https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=226657794555-jp7ph38s8rcpqbu4pjepsg24aphp03qd.apps.googleusercontent.com&redirect_uri=http://localhost:8080/auth/google-auth-callback&scope=email%20profile%20https://www.googleapis.com/auth/photoslibrary.readonly&access_type=offline&state=add-google-photo-library-album&include_granted_scopes=true&prompt=consent'>Connect to Google Photos</Button>
      </div>)
  }

}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({}, dispatch);
}

function mapStateToProps() {
    return {
    };
}

export default withStyles(styles)(connect(
  mapStateToProps,
  mapDispatchToProps
)(AddGooglePhotoAlbum))
