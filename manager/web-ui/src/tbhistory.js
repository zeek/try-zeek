import queryString from 'query-string'

// Hash-based URL state for try-zeek. The URL hash encodes the current view
// as `#/<pathname>?<search>`, e.g. `#/?example=hello` or
// `#/tryzeek/saved/abc123`. index.js listens for changes and dispatches
// the corresponding Redux actions via handleLocationChange.

function parseHash() {
    const hash = window.location.hash.replace(/^#/, '') || '/';
    const qIndex = hash.indexOf('?');
    if (qIndex === -1) return { pathname: hash, search: '', hash: '' };
    return { pathname: hash.slice(0, qIndex), search: hash.slice(qIndex), hash: '' };
}

export const tbhistory = {
    get location() { return parseHash(); },
    push({ pathname = '/', search = '' }) {
        const fragment = search ? `${pathname}?${search}` : pathname;
        window.location.hash = fragment;
    },
    listen(callback) {
        const handler = () => callback({ action: 'PUSH', location: parseHash() });
        window.addEventListener('hashchange', handler);
        return () => window.removeEventListener('hashchange', handler);
    },
};

export function setHistoryToExample(example) {
    var q = queryString.stringify({example: example});
    tbhistory.push({pathname: '/', search: q});
}
