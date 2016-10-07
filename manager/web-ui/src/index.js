import React from 'react';
import { render } from 'react-dom';
import App from './App';

import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';

import { tbhistory } from './tbhistory';
import { handleLocationChange } from './actions';

import tryBroApp from './reducers';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';


const loggerMiddleware = createLogger();
const createStoreWithMiddleware = applyMiddleware(
  thunkMiddleware, // lets us dispatch() functions
  loggerMiddleware // neat middleware that logs actions
)(createStore);

const store = createStoreWithMiddleware(tryBroApp);

tbhistory.listen(function (location, action) {
    console.log(action, location);
    if(action !== 'REPLACE')
        handleLocationChange(store.dispatch, location, false)
})
handleLocationChange(store.dispatch, tbhistory.location, true)

let rootElement = document.getElementById('root');
render(
  <Provider store={store}>
    <App />
  </Provider>,
  rootElement
);

