import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import { Router, Route, IndexRoute, browserHistory  } from 'react-router'
import configStore from './store'
import { getUserInfo } from './loginActions'
import App from './App';
import Home from './Home';
import Streams from './streams/Streams'
import Stream from './streams/Stream'
import Photo from './streams/Photo'
import Frames from './frames/Frames'
import Frame from './frames/Frame'
import './index.css';

let store = configStore();
store.dispatch(getUserInfo())

ReactDOM.render(
    <Provider store={store}>
      <Router history={browserHistory}>
        <Route path="/" component={App}>
          <IndexRoute component={Home}/>
          <Route path="/streams" component={Streams} />
          <Route path="/streams/:streamId" component={Stream} />
          <Route path="/streams/:streamId/photos/:photoId" component={Photo} />

          <Route path="/frames" component={Frames} />
          <Route path="/frames/:frameId" component={Frame} />
        </Route>
      </Router>
    </Provider>,
  document.getElementById('root')
);
