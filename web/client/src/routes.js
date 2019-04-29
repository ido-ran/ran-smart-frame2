import React from 'react';
import { Router, Route, IndexRoute  } from 'react-router'
import App from './App';
import Home from './Home';
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

const Routes = (props) => (
  <Router {...props}>
    <Route path="/" component={App}>
      <IndexRoute component={Home}/>
      <Route path="/streams" component={Streams} />
      <Route path="/streams/add-google-photo-album" component={AddGooglePhotoAlbum} />
      <Route path="/streams/add-google-photo-album/:externalUserId" component={SelectGooglePhotoAlbum} />
      <Route path="/streams/:streamId" component={Stream} />
      <Route path="/streams/:streamId/photos/:photoId" component={Photo} />

      <Route path="/frames" component={Frames} />
      <Route path="/frames/:frameId" component={Frame} />
      <Route path="/frames/:frameId/streams" component={FrameStreams} />
      <Route path="/frames/:frameId/device-link" component={DeviceLink} />

      <Route path="/select-frame" component={SelectFrame} />
    </Route>
  </Router>
);

export default Routes
