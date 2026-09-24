import { handleLocationChange, execSubmit, formatSubmit, setCode, setVersion, pcapSelected } from './actions';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import tryBroApp from './reducers';

function makeStore() {
  return createStore(tryBroApp, applyMiddleware(thunk));
}

function location({ pathname = '/', search = '', hash = '' } = {}) {
  return { pathname, search, hash };
}

// Route a mocked fetch by URL substring; record every call for payload assertions.
function mockFetch(routes = {}) {
  const calls = [];
  const fn = jest.fn((url, opts) => {
    calls.push({ url, opts });
    const key = Object.keys(routes).find((k) => url.includes(k));
    const body = key ? routes[key] : {};
    return Promise.resolve({ ok: true, json: () => Promise.resolve(body) });
  });
  fn.calls = calls;
  return fn;
}

beforeEach(() => {
  global.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
});

describe('handleLocationChange routing', () => {
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

  it('loads a saved job from /tryzeek/saved/<job>', async () => {
    global.fetch = mockFetch({
      '/saved/abc123': {
        sources: [{ name: 'main.zeek', content: 'saved!' }],
        version: '7.0',
        pcap: 'saved.pcap',
      },
    });
    const store = makeStore();
    await handleLocationChange(store.dispatch, location({ pathname: '/tryzeek/saved/abc123' }));
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/saved/abc123'));
    expect(store.getState().code.sources).toEqual([{ name: 'main.zeek', content: 'saved!' }]);
    expect(store.getState().versions.version).toBe('7.0');
    expect(store.getState().pcap.pcap).toBe('saved.pcap');
  });
});

describe('execSubmit request payload (API contract)', () => {
  it('POSTs {sources, version, pcap} as JSON to /run', async () => {
    global.fetch = mockFetch({
      '/run': { job: 'job1', stdout: 'hi' },
      '/files/job1.json': { files: {} },
    });
    const store = makeStore();
    store.dispatch(setCode([{ name: 'main.zeek', content: 'event zeek_init(){}' }]));
    store.dispatch(setVersion('6.0'));
    store.dispatch(pcapSelected('demo.pcap'));

    await store.dispatch(execSubmit());

    const runCall = global.fetch.calls.find((c) => c.url.includes('/run'));
    expect(runCall).toBeDefined();
    expect(runCall.opts.method).toBe('post');
    expect(runCall.opts.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(runCall.opts.body)).toEqual({
      sources: [{ name: 'main.zeek', content: 'event zeek_init(){}' }],
      version: '6.0',
      pcap: 'demo.pcap',
    });
  });
});

describe('formatSubmit request payload (API contract)', () => {
  it('POSTs {sources} to /format and applies the response', async () => {
    global.fetch = mockFetch({
      '/format': {
        sources: [{ name: 'main.zeek', content: 'formatted' }],
        errors: { 'main.zeek': [{ row: 0, column: 0, type: 'warning', text: 'w' }] },
      },
    });
    const store = makeStore();
    store.dispatch(setCode([{ name: 'main.zeek', content: 'messy' }]));

    await store.dispatch(formatSubmit());

    const call = global.fetch.calls.find((c) => c.url.includes('/format'));
    expect(call.opts.method).toBe('post');
    expect(JSON.parse(call.opts.body)).toEqual({
      sources: [{ name: 'main.zeek', content: 'messy' }],
    });
    expect(store.getState().code.sources).toEqual([{ name: 'main.zeek', content: 'formatted' }]);
    expect(store.getState().exec.errors['main.zeek'][0]).toMatchObject({ type: 'warning', text: 'w' });
  });
});
