import React from 'react';
import './ImageUpload.css';

export default class ImageUpload extends React.Component {
  constructor(props) {
    super(props);
    this.state = {file: '', imagePreviewUrl: ''};
  }

  _handleSubmit(e) {
    e.preventDefault();
    this.props.onUpload()
  }

  _handleImageChange(e) {
    e.preventDefault();

    const file = e.target.files[0]
    this.props.onFileSelected(file)
  }

  render() {
    const {imagePreviewUrl} = this.props;

    let $imagePreview = null;
    if (imagePreviewUrl) {
      $imagePreview = (<img alt="preview" src={imagePreviewUrl} className="preview-image" />);
    } else {
      $imagePreview = (<div className="previewText">Please select an Image for Preview</div>);
    }

    return (
      <div className="previewComponent">
        <form onSubmit={(e)=>this._handleSubmit(e)}>
          <input className="fileInput" type="file" onChange={(e)=>this._handleImageChange(e)} />
          <button className="submitButton" type="submit" onClick={(e)=>this._handleSubmit(e)}>Upload Image</button>
        </form>
        <div className="imgPreview">
          {$imagePreview}
        </div>
      </div>
    )
  }
}
