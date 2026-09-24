import { tbhistory, setHistoryToExample } from './tbhistory';

beforeEach(() => {
  window.location.hash = '';
});

describe('tbhistory.location (parseHash)', () => {
  it('defaults to root when the hash is empty', () => {
    expect(tbhistory.location).toEqual({ pathname: '/', search: '', hash: '' });
  });

  it('parses a bare pathname', () => {
    window.location.hash = '#/tryzeek/saved/abc123';
    expect(tbhistory.location).toEqual({
      pathname: '/tryzeek/saved/abc123', search: '', hash: '',
    });
  });

  it('splits pathname and search on the first ?', () => {
    window.location.hash = '#/?example=hello';
    expect(tbhistory.location).toEqual({
      pathname: '/', search: '?example=hello', hash: '',
    });
  });
});

describe('tbhistory.push', () => {
  it('writes pathname only when there is no search', () => {
    tbhistory.push({ pathname: '/tryzeek/saved/xyz' });
    expect(window.location.hash).toBe('#/tryzeek/saved/xyz');
  });

  it('joins pathname and search with ?', () => {
    tbhistory.push({ pathname: '/', search: 'example=dns' });
    expect(window.location.hash).toBe('#/?example=dns');
  });

  it('defaults pathname to /', () => {
    tbhistory.push({ search: 'version=6.0' });
    expect(window.location.hash).toBe('#/?version=6.0');
  });
});

describe('tbhistory.listen', () => {
  it('invokes the callback on hashchange and can be unsubscribed', () => {
    const cb = jest.fn();
    const unlisten = tbhistory.listen(cb);
    window.dispatchEvent(new Event('hashchange'));
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb.mock.calls[0][0]).toEqual({ action: 'PUSH', location: { pathname: '/', search: '', hash: '' } });
    unlisten();
    window.dispatchEvent(new Event('hashchange'));
    expect(cb).toHaveBeenCalledTimes(1);
  });
});

describe('setHistoryToExample', () => {
  it('pushes the example as a query param on the root path', () => {
    setHistoryToExample('hello');
    expect(window.location.hash).toBe('#/?example=hello');
  });
});
