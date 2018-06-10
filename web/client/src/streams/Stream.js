import React, { Component } from 'react';
import { connect } from 'react-redux'
import {bindActionCreators} from 'redux';
import { Link  } from 'react-router'

import { withStyles } from '@material-ui/core/styles';
import { GridList, GridListTile } from '@material-ui/core';
import Subheader from '@material-ui/core/ListSubheader';

import { loadStream, loadStreamPhotos } from './actions'
import ImageUplaod from './ImageUpload'

const styles = theme => ({
  root: {
    flexGrow: 1,
    margin: 30,
  },
  gridList: {
    width: 1050,
  }
});

class Stream extends Component {

  constructor() {
    super()
    this.state = {
      newStreamName: '',
      uploading: false,
      file: null,
      imagePreviewUrl: null
    }

    this._loadStreamPhotos = this._loadStreamPhotos.bind(this)
  }

  componentWillMount() {
    this.props.loadStream(this.props.params.streamId)
    this._loadStreamPhotos();
  }

  _loadStreamPhotos() {
    this.props.loadStreamPhotos(this.props.params.streamId)
  }

  handleFileSelected(file) {
    let reader = new FileReader();

    reader.onloadend = () => {
      this.setState({
        file: file,
        imagePreviewUrl: reader.result
      });
    }

    reader.readAsDataURL(file)
  }

  handleUpload() {
    const { file } = this.state;

    this.setState({ uploading: true })
    var form = new FormData();
    form.append('image', file, 'filename.txt');

    fetch(`/api/streams/${this.props.params.streamId}/photos`, {
      method: "POST",
      body: form,
      credentials: 'include'
    }).then(() => {
      setTimeout(this._loadStreamPhotos, 500)
      this.setState({
        uploading: false,
        imagePreviewUrl: null,
        file: null
      })
    });

    this.setState({newStreamName: ''})
  }

  uploadingElementRender() {
    const { uploading } = this.state;
    if (!uploading) return null;

    return <div>Uploading...</div>;
  }

  render() {
    const { classes, photos, photosLoaded } = this.props;

    return (
      <div className={classes.root}>
        <h1>{this.props.stream.name}</h1>
        <ImageUplaod
          onUpload={(file) => this.handleUpload(file)}
          onFileSelected={(file) => this.handleFileSelected(file)}
          imagePreviewUrl={this.state.imagePreviewUrl} />

        { this.uploadingElementRender() }

        <GridList cellHeight={160} className={classes.gridList} cols={5}>
          <GridListTile key="Subheader" cols={5} style={{ height: 'auto' }}>
            <Subheader>{photosLoaded ? `${photos.length} Photos` : 'Loading...'}</Subheader>
          </GridListTile>
          {photos.map(photo => (
            <GridListTile key={photo.id}>
              <Link to={`/streams/${this.props.params.streamId}/photos/${photo.id}`}>
                <img alt="thumbnail" src={`/api/streams/${this.props.params.streamId}/photos/${photo.id}/thumbnail`} />
              </Link>
            </GridListTile>
          ))}
        </GridList>
      </div>)
  }

}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({loadStream, loadStreamPhotos}, dispatch);
}

function mapStateToProps(state) {
    return {
        stream: state.stream.item,
        loaded: state.stream.loaded,
        photos: state.stream.photos,
        photosLoaded: state.stream.photosLoaded
    };
}

export default withStyles(styles)(connect(
  mapStateToProps,
  mapDispatchToProps
)(Stream))
