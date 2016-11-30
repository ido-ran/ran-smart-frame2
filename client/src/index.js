import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import App from './App';
import configStore from './store'
import { getUserInfo } from './loginActions'
import './index.css';

let store = configStore();
store.dispatch(getUserInfo())

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
