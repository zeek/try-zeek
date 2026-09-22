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
async function mockApi(page, overrides = {}) {
  const requests = [];

  // Static JSON GETs.
  await page.route(/versions\.json/, (r) => json(r, overrides.versions || VERSIONS));
  await page.route(/pcaps\.json/, (r) => json(r, overrides.pcaps || PCAPS));
  await page.route(/examples\/examples\.json/, (r) => json(r, overrides.examples || EXAMPLES));

  // POST /run  -> a job id, then GET /files/<job>.json for the logs.
  await page.route(/\/run(\?|$)/, async (route) => {
    requests.push({ name: 'run', body: route.request().postData() });
    await json(route, overrides.run || { job: 'job1', stdout: 'hello world output' });
  });
  await page.route(/\/files\/[^/]+\.json/, (r) => json(r, overrides.files || FILES));

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

  // Pcap existence check + upload.
  await page.route(/\/pcap\/[0-9a-f]+$/, (r) => json(r, { status: false }));
  await page.route(/\/pcap\/upload\//, async (route) => {
    requests.push({ name: 'upload', body: '<multipart>' });
    await json(route, { status: true, checksum: 'deadbeef' });
  });

  return { requests, EXAMPLES, VERSIONS, PCAPS, FILES, SAVED };
}

module.exports = { test, expect, mockApi };
