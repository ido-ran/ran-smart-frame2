import React, { Component } from 'react';

class Photo extends Component {

  render() {
    return (
      <div>
        <img alt="the-thing" src={`/api/streams/${this.props.params.streamId}/photos/${this.props.params.photoId}`} />
      </div>)
  }
}

export default Photo
