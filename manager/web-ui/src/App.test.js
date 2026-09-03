import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import App from './App';
import tryBroApp from './reducers';

// App dispatches API fetches on mount; stub fetch so they resolve without a server.
jest.mock('isomorphic-fetch', () => () =>
  Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
);

it('renders without crashing', () => {
  const store = createStore(tryBroApp, applyMiddleware(thunk));
  const div = document.createElement('div');
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    div,
  );
});
