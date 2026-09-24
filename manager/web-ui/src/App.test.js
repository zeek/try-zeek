import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import App from './App';
import tryBroApp from './reducers';

// App dispatches API fetches on mount; stub fetch so they resolve without a server.
global.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) });

it('renders without crashing', () => {
  const store = createStore(tryBroApp, applyMiddleware(thunk));
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(
    <Provider store={store}>
      <App />
    </Provider>
  );
});
