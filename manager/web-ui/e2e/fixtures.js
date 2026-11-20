// Shared mock backend for the E2E suite. Every network endpoint the app talks
// to (see manager/app.py) is intercepted here and answered with deterministic
// fixture data, so the tests never touch a real Zeek backend.
//
// Usage: `const api = await mockApi(page)` at the top of each test, before
// page.goto. `api.requests` records POST payloads for contract assertions.
const { test, expect } = require('@playwright/test');

// --- fixture data -----------------------------------------------------------

const VERSIONS = { versions: ['6.0', '7.0'], default: '6.0' };
const PCAPS = { available: ['test.pcap'] };

const EXAMPLES = [
  {
    path: 'hello',
    title: 'Hello World',
    parent: 'Basics',
    html: '<h3>Hello example</h3><p>Prints a greeting.</p>',
    sources: [{ name: 'main.zeek', content: 'event zeek_init() { print "hello"; }' }],
    pcaps: [],
    next: { path: 'dns' },
  },
  {
    path: 'dns',
    title: 'DNS',
    parent: 'Protocols',
    html: '<h3>DNS example</h3><p>Looks at DNS traffic.</p>',
    sources: [{ name: 'main.zeek', content: 'event dns_request() {}' }],
    pcaps: ['test.pcap'],
    prev: { path: 'hello' },
  },
];

// A run that returns one tabular log, one text log, and a parseable stderr error.
const FILES = {
  files: {
    'conn.log': {
      header: ['ts', 'id.orig_h', 'proto'],
      types: ['time', 'addr', 'string'],
      rows: [
        ['1.0', '10.0.0.1', 'tcp'],
        ['2.0', '10.0.0.2', 'udp'],
      ],
    },
    'weird.log': 'this is a plain-text log line\nsecond line',
    'stdout.log': 'hello world output',
    'stderr.log': 'error in ./try.zeek, line 1: something went wrong',
  },
};

const SAVED = {
  sources: [{ name: 'main.zeek', content: 'event zeek_init() { print "saved"; }' }],
  version: '7.0',
  pcap: 'test.pcap',
};

// --- routing ----------------------------------------------------------------

async function json(route, body) {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

// Installs all API routes on the page. Returns a small recorder so specs can
// assert on request payloads (the API contract) when needed.
//
// `overrides.hold` lists route names ('run', 'files') whose responses wait
// until the spec calls `api.release(name)`, so in-progress UI can be checked.
async function mockApi(page, overrides = {}) {
  const requests = [];
  const gates = {};
  for (const name of overrides.hold || []) {
    let open;
    gates[name] = { promise: new Promise((resolve) => { open = resolve; }), open };
  }
  const gate = (name) => gates[name] && gates[name].promise;
  const release = (name) => gates[name].open();

  // Static JSON GETs.
  await page.route(/versions\.json/, (r) => json(r, overrides.versions || VERSIONS));
  await page.route(/pcaps\.json/, (r) => json(r, overrides.pcaps || PCAPS));
  await page.route(/examples\/examples\.json/, (r) => json(r, overrides.examples || EXAMPLES));

  // POST /run  -> a job id, then GET /files/<job>.json for the logs.
  await page.route(/\/run(\?|$)/, async (route) => {
    requests.push({ name: 'run', body: route.request().postData() });
    await gate('run');
    await json(route, overrides.run || { job: 'job1', stdout: 'hello world output' });
  });
  await page.route(/\/files\/[^/]+\.json/, async (route) => {
    await gate('files');
    await json(route, overrides.files || FILES);
  });

  // Formatting.
  await page.route(/\/format(\?|$)/, async (route) => {
    requests.push({ name: 'format', body: route.request().postData() });
    await json(route, overrides.format || {
      sources: [{ name: 'main.zeek', content: 'formatted!' }],
      errors: {},
    });
  });

  // Saved jobs.
  await page.route(/\/saved\/[0-9a-f]+/, (r) => json(r, overrides.saved || SAVED));

  // Pcap existence check + upload. `overrides.pcapExists` makes the check
  // report the pcap as already present on the server, so no upload happens.
  await page.route(/\/pcap\/[0-9a-f]+$/, async (route) => {
    requests.push({ name: 'pcap-check', url: route.request().url() });
    await json(route, { status: !!overrides.pcapExists });
  });
  await page.route(/\/pcap\/upload\//, async (route) => {
    requests.push({ name: 'upload', url: route.request().url(), body: '<multipart>' });
    await json(route, { status: true, checksum: 'deadbeef' });
  });

  return { requests, release, EXAMPLES, VERSIONS, PCAPS, FILES, SAVED };
}

module.exports = { test, expect, mockApi, EXAMPLES, VERSIONS, PCAPS, FILES, SAVED };
