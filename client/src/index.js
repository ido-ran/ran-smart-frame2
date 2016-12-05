import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import { Router, Route, IndexRoute, browserHistory  } from 'react-router'
import configStore from './store'
import { getUserInfo } from './loginActions'
import App from './App';
import Home from './Home';
import Streams from './streams/Streams'
import './index.css';

let store = configStore();
store.dispatch(getUserInfo())

ReactDOM.render(
    <Provider store={store}>
      <Router history={browserHistory}>
        <Route path="/" component={App}>
          <IndexRoute component={Home}/>
          <Route path="/streams" component={Streams} />
        </Route>
      </Router>
    </Provider>,
  document.getElementById('root')
);
