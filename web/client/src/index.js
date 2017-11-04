import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import { browserHistory  } from 'react-router'
import configStore from './store'
import { getUserInfo } from './loginActions'
import Routes from './routes'
import './index.css';

let store = configStore();
store.dispatch(getUserInfo())

ReactDOM.render(
    <Provider store={store}>
      <Routes history={browserHistory} />
    </Provider>,
  document.getElementById('root')
);
