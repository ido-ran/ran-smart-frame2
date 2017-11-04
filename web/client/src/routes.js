import React from 'react';
import { Router, Route, IndexRoute  } from 'react-router'
import App from './App';
import Home from './Home';
import Streams from './streams/Streams'
import Stream from './streams/Stream'
import Photo from './streams/Photo'
import Frames from './frames/Frames'
import Frame from './frames/Frame'
import SelectFrame from './select-frame/SelectFrame'

const Routes = (props) => (
  <Router {...props}>
    <Route path="/" component={App}>
      <IndexRoute component={Home}/>
      <Route path="/streams" component={Streams} />
      <Route path="/streams/:streamId" component={Stream} />
      <Route path="/streams/:streamId/photos/:photoId" component={Photo} />

      <Route path="/frames" component={Frames} />
      <Route path="/frames/:frameId" component={Frame} />

      <Route path="/select-frame" component={SelectFrame} />
    </Route>
  </Router>
);

export default Routes
