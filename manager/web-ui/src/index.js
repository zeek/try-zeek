import React from 'react';
import { render } from 'react-dom';
import App from './App';

import thunk from 'redux-thunk';
import { compose, createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';

import { tbhistory } from './tbhistory';
import { handleLocationChange } from './actions';

import tryBroApp from './reducers';

import 'bootstrap/dist/css/bootstrap.css';


const middlewares = [thunk];
if (process.env.NODE_ENV === `development`) {
  const createLogger = require(`redux-logger`);
  const logger = createLogger();
  middlewares.push(logger);
}

const store = compose(applyMiddleware(...middlewares))(createStore)(tryBroApp);

tbhistory.listen(function (location) {
    console.log('tbhistory event handler:', location.action, location.location);
    if(location.action !== 'REPLACE')
        handleLocationChange(store.dispatch, location.location, false)
})
handleLocationChange(store.dispatch, tbhistory.location, true)

let rootElement = document.getElementById('root');
render(
  <Provider store={store}>
    <App />
  </Provider>,
  rootElement
);

