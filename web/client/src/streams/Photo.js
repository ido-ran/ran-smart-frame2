import React, { Component } from 'react';

class Photo extends Component {

  render() {
    return (
      <div>
        <img alt="the-thing" src={`/api/streams/${this.props.match.params.streamId}/photos/${this.props.match.params.photoId}`} />
      </div>)
  }
}

export default Photo
