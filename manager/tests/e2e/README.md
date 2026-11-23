# End-to-end tests

These Playwright specs drive the web UI in a real browser, with every backend
endpoint mocked by `fixtures.js`, so no Zeek backend is needed. They select
elements only by `data-testid`, ARIA role and visible text, so the same specs
can run against the React app and its Svelte replacement (see
`../../web-ui/MIGRATION.md`).

This directory has its own `package.json`, separate from the web UI's, so the
suite doesn't change when the web UI's dependencies do. Playwright starts the
web UI's dev server itself (from `../../web-ui`, see `playwright.config.js`),
so the web UI's dependencies need to be installed too.

```sh
npm ci                        # once, here and in ../../web-ui
npm test                      # installs Chromium if needed, then runs every spec
npx playwright test logs.spec.js
```

## Fixture options

`mockApi(page, overrides)` installs the mocked routes and returns
`{ requests, savedFetches, release, JOB, ...fixtureData }`. `requests` records
`run`, `format`, `pcap-check` and `upload` calls in order, so specs can check
the API contract. `savedFetches` records the job id of every `/saved/<job>`
request.

The mock behaves like the real backend after a run: `/run` returns the hex job
id `JOB` (real ids are `uuid4().hex`), and `/saved/<JOB>` returns what was run,
normalized the way the worker stores it. The app follows every run by loading
`#/tryzeek/saved/<job>`, which reloads that job: it switches to the first file
and applies the saved sources, version and pcap. Any other job id, such as a
deep link, gets `SAVED`.

| Override | Effect |
|---|---|
| `versions`, `pcaps`, `examples`, `run`, `files`, `format`, `saved` | Replace that endpoint's response body (`saved` only for jobs not run on the page) |
| `pcapExists: true` | `GET /pcap/<md5>` reports the pcap as already on the server |
| `hold: ['run', 'files', 'saved']` | Hold those responses until `release(name)`, to check in-progress UI or force the order of responses |

The fixture data (`JOB`, `EXAMPLES`, `FILES`, etc.) is also exported, so specs
can build variants of it.

## Known bugs recorded as expected failures

A spec that records an existing bug, kept as-is during the port (Phase 4 of
`../../web-ui/MIGRATION.md` lists them), uses `test.fail()`. When the bug is
fixed, the spec starts failing; remove the `test.fail()` line. No spec does
this at the moment.

## Baselines

`measure.js` measures a production build: the shipped file sizes, plus page
load times with the API mocked. Run it against each build so the numbers are
comparable:

```sh
(cd ../../web-ui && npm run build)
node measure.js               # defaults to ../../web-ui/build and 10 runs
```

### React (before the migration)

Measured on 2026-11-09 at commit `7a0610b`: Apple M4 Pro, Node 26.12.0,
Playwright's Chromium, 10 cold loads per column. The load times are for comparing
builds on the same machine only; they don't represent real users.

| File | Raw (kB) | Gzip (kB) |
|---|---:|---:|
| `mode-zeek.js` | 12.4 | 2.1 |
| `static/css/main.cdcbe9b9.css` | 194.8 | 27.7 |
| `static/js/main.e7b00c03.js` | 767.3 | 220.3 |
| **Total** | **974.5** | **250.1** |

| Median of 10 cold loads | Full speed (ms) | 4x CPU throttle (ms) |
|---|---:|---:|
| DOMContentLoaded | 54 | 195 |
| Load event | 94 | 218 |
| Editor shows the example | 101 | 269 |

| Other | Value |
|---|---|
| Direct dependencies | 13 runtime, 3 dev |
| Packages in `package-lock.json` | 1,472 |
| `node_modules` size | 482 MB |
| Production build time (`npm run build`) | about 4.7 s, warm or cold cache |
| Unit tests (Jest) | 46 |
| E2E specs (Playwright) | 37, including 1 expected failure; about 25 s |
