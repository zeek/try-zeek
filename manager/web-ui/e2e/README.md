# End-to-end tests

These Playwright specs drive the web UI in a real browser, with every backend
endpoint mocked by `fixtures.js`, so no Zeek backend is needed. They select
elements only by `data-testid`, ARIA role and visible text, so the same specs
can run against the React app and its Svelte replacement (see `../MIGRATION.md`).

```sh
npm run test:e2e              # starts the dev server itself (see playwright.config.js)
npx playwright test e2e/logs.spec.js
```

## Fixture options

`mockApi(page, overrides)` installs the mocked routes and returns
`{ requests, release, ...fixtureData }`. `requests` records `run`, `format`,
`pcap-check` and `upload` calls in order, so specs can check the API contract.

| Override | Effect |
|---|---|
| `versions`, `pcaps`, `examples`, `run`, `files`, `format`, `saved` | Replace that endpoint's response body |
| `pcapExists: true` | `GET /pcap/<md5>` reports the pcap as already on the server |
| `hold: ['run', 'files']` | Hold those responses until `release('run')` / `release('files')` |

The fixture data (`EXAMPLES`, `FILES`, etc.) is also exported, so specs can
build variants of it.

## Known bugs recorded as expected failures

Some specs use `test.fail()` to record existing bugs that are kept during the
port (Phase 4 of `../MIGRATION.md` lists them). When a bug is fixed, its spec
starts failing; remove the `test.fail()` line.

## Baselines

`measure.js` measures a production build: the shipped file sizes, plus page
load times with the API mocked. Run it against each build so the numbers are
comparable:

```sh
npm run build
node e2e/measure.js build 10
```

### React (before the migration)

Measured on 2026-11-09 at commit `be916f7`: Apple M4 Pro, Node 26.12.0,
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
