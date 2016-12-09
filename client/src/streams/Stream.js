import React, { Component } from 'react';
import { connect } from 'react-redux'
import {bindActionCreators} from 'redux';

import { loadStream, loadStreamPhotos } from './actions'
import ImageUplaod from './ImageUpload'

class Stream extends Component {

  constructor() {
    super()
    this.state = {newStreamName: ''}

    this._loadStreamPhotos = this._loadStreamPhotos.bind(this)
  }

  componentWillMount() {
    this.props.loadStream(this.props.params.streamId)
    this._loadStreamPhotos();
  }

  _loadStreamPhotos() {
    this.props.loadStreamPhotos(this.props.params.streamId)
  }

  render() {
    return (
      <div>
        <h1>{this.props.stream.name}</h1>
        <ImageUplaod onUpload={(file) => this.handleUpload(file)} />

        <ul>
        {
          this.props.photos.map(photo => {
            return (
              <li key={photo.id}><img alt="thumbnail" src={`data:image/png;base64,${photo.thumbnail}`} /></li>
            )
          })
        }
        </ul>
      </div>)
  }


  handleUpload(file) {
    var form = new FormData();
    form.append("image", file, "filename.txt");

    fetch(`/api/streams/${this.props.params.streamId}/photos`, {
      method: "POST",
      body: form,
      credentials: 'include'
    }).then(() => {
      setTimeout(this._loadStreamPhotos, 500)
    });

    this.setState({newStreamName: ''})
  }

}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({loadStream, loadStreamPhotos}, dispatch);
}

function mapStateToProps(state) {
    return {
        stream: state.stream.item,
        isLoaded: state.stream.isLoaded,
        photos: state.stream.photos
    };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Stream)
