import React from 'react';
import ReactDOM from 'react-dom';
import {App} from './App';

import tryBroApp from './reducers';

it('renders without crashing', () => {
  const div = document.createElement('div');
  var props = tryBroApp(undefined, {type:null})
  ReactDOM.render(<App {...props}/>, div);
});
