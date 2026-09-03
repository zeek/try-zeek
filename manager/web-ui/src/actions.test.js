import { handleLocationChange } from './actions';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import tryBroApp from './reducers';

global.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) });

function makeStore() {
  return createStore(tryBroApp, applyMiddleware(thunk));
}

function location({ pathname = '/', search = '', hash = '' } = {}) {
  return { pathname, search, hash };
}

it('dispatches pcapSelected for ?pcap= query param', () => {
  const store = makeStore();
  handleLocationChange(store.dispatch, location({ search: '?pcap=test.pcap' }));
  expect(store.getState().pcap.pcap).toBe('test.pcap');
});

it('dispatches setVersion for ?version= query param', () => {
  const store = makeStore();
  handleLocationChange(store.dispatch, location({ search: '?version=6.0' }));
  expect(store.getState().versions.version).toBe('6.0');
});

it('defaults to the hello example on empty root path', () => {
  const { tbhistory } = require('./tbhistory');
  const pushSpy = jest.spyOn(tbhistory, 'push');
  const store = makeStore();
  handleLocationChange(store.dispatch, location());
  expect(pushSpy).toHaveBeenCalledWith({ pathname: '/', search: 'example=hello' });
  pushSpy.mockRestore();
});
