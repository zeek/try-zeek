# web-ui migration plan: React → Svelte + Vite

## Goal

Replace the React / Create React App frontend with **Svelte 5 + Vite**. The main
motivation is dependency maintenance: today's stack couples many npm packages
through peer dependencies, so updating any one of them is difficult. A smaller
bundle is a secondary benefit.

## Why the current stack is hard to update

Most of the coupling comes from React-specific wrappers around libraries that
work fine on their own. Each one peer-depends on React's version:

- `react-bootstrap` wraps Bootstrap.
- `react-ace` wraps Ace.
- `@fortawesome/react-fontawesome` wraps FontAwesome and has its own peer
  dependency on `fontawesome-svg-core`. This caused the blank-page crash when
  that package was pruned.
- `react-redux` wraps Redux. The dependabot bump to `redux@5` conflicts with
  `react-redux@8`, which is why `--legacy-peer-deps` is needed.
- `react-scripts` (Create React App) is deprecated and pins webpack, Babel, Jest
  and ESLint all at once. Most of the lockfile's **1,473 packages** come from it.

## Target stack

| Role | Package | Coupling |
|---|---|---|
| UI | `svelte` (dev) | compiled away; no runtime package to keep in sync |
| Build | `vite`, `@sveltejs/vite-plugin-svelte` (dev) | the plugin peer-depends on both `vite` and `svelte` |
| Editor | `ace-builds` | no dependencies; used directly, with no wrapper |
| Styles | `bootstrap` (CSS only) | no framework coupling |
| Hashing | `md5` (or `spark-md5`) | none |
| Unit tests | `node:test` (built into Node) | none |
| E2E tests | `@playwright/test` | none |

A scratch install of this stack (including Vitest and jsdom) came to **119
packages**. Without Vitest and jsdom it's **74**, compared with 1,473 today.

### Coupling that remains

- `@sveltejs/vite-plugin-svelte` requires matching Vite and Svelte majors (the
  current release requires `vite ^8` and `svelte ^5.46`). A Vite major bump
  means bumping Vite and the plugin together. The Svelte and Vite teams
  coordinate these releases closely.
- Svelte's own major versions can be disruptive (4→5 introduced "runes";
  Svelte 5 still compiles the old syntax).

### Dependabot

`.github/dependabot.yml` only bumps **production** dependencies. `svelte`,
`vite` and the plugin are dev dependencies, so they'd be updated by hand. The
runtime dependencies (`ace-builds`, `bootstrap`, `md5`) are independent of each
other, so dependabot PRs for them should never conflict. If dev dependencies are
added to dependabot later, put `svelte`, `vite` and
`@sveltejs/vite-plugin-svelte` in one `groups:` entry so they arrive as one PR.

### Alternatives considered

- **Plain JS (no framework).** This removes the Svelte/plugin pair, leaving only
  Vite or esbuild, or even native ES modules with vendored Ace and Bootstrap.
  The cost is hand-written DOM updates for the file tabs, the log table, the
  modal, and keeping Ace instances alive across re-renders. The framework-free
  core from Phase 1 supports either choice, so this can be decided at the start
  of Phase 2.
- **Vitest instead of `node:test`.** Vitest would be a smaller change from Jest,
  but it peer-depends on Vite and needs jsdom. After Phase 1 the logic under test
  is plain JS, so `node:test` is enough.

## Bundle size

The current main bundle is 221 kB gzipped:

- The Ace core is about 127 kB.
- `mode-java` is about 11 kB and is unused (`mode-zeek.js` doesn't depend on it).
- React, react-bootstrap, FontAwesome and Redux together are about 70–80 kB.

Replacing those with Svelte (about 15 kB) should give **about 150 kB, roughly
30% smaller**. Going much smaller would mean replacing Ace (see Phase 5).

## Guiding rules

- **The Playwright suite in `e2e/` is the oracle.** It selects only by
  `data-testid`, ARIA role and visible text, and must pass *unchanged* against
  the new app.
- **Port behavior as it is, then fix bugs.** Known bugs (Phase 4) are kept
  during the port, so a failing e2e test always means the port is wrong. Each
  fix goes in its own commit with a test.
- **One branch, one commit (or a few) per phase,** with all tests passing after
  each.

---

## Phase 0: Strengthen the safety net (against React, before porting)

Add e2e specs for behavior that isn't covered yet:

- [x] **Pcap upload:** file → `GET /pcap/<md5>` → `POST /pcap/upload/<md5>` →
      `/run` carrying the checksum. Add a fixture variant where the pcap already
      exists on the server, so no upload happens.
- [x] **Autorun:** a saved-job deep link and `?example=dns&run=1` each trigger a
      `/run` POST.
- [ ] **Error annotations:** a stderr error appears in Ace's gutter (`.ace_error`).
- [ ] **Log tabs:** `conn.log` is the default tab, clicking the `weird` tab shows a
      `<pre>`, and the detail modal closes.
- [ ] **Run button:** shows "Running..." and is disabled during a run (delay the
      mocked `/run`).
- [ ] **Old links:** `#/trybro?example=…` still loads the example. `pack.py`
      rewrites tutorial links into this form.
- [ ] Record the baselines (bundle size, load timing) in `e2e/README.md`.

## Phase 1: Framework-free core

- [ ] Replace `redux`, `redux-thunk` and `react-redux` with a small `src/store.js`
      (about 20 lines):
  - one combined reducer and a `subscribe` method;
  - a `dispatch` that runs functions as thunks with `(dispatch, getState)`;
  - it matches the Svelte store contract, so components can use `$store`
    directly.
- [ ] Leave `reducers.js`, `actions.js`, `broutil.js` and `tbhistory.js` mostly
      unchanged. That keeps the existing unit tests valid.
- [ ] Move the network calls into `src/api.js`. Replace
      `process.env.REACT_APP_TRY_BRO_API_HOST` with
      `import.meta.env.VITE_TRY_BRO_API_HOST`, or drop it in favor of a Vite dev
      proxy.
- [ ] Port the unit tests from Jest (`react-scripts test`) to `node:test` and
      `node:assert`:
  - `npm test` becomes `node --test src/`;
  - the source files need to be valid ESM for Node (add `"type": "module"` or
    use `.mjs`);
  - stub `fetch`, `window.location` and `FileReader` where the tests need them.
      Node has a built-in `fetch`, and `tbhistory` tests can use a minimal
      `window` stub.

## Phase 2: Svelte components (replace `App.js`)

| Component | Replaces | Notes |
|---|---|---|
| `App.svelte` | `App` | Layout and the initial fetches in `onMount` |
| `ExampleBar.svelte` | `ExampleDropDown` and the show/hide button | |
| `ExampleReadme.svelte` | `BroExampleReadme` | `{@html}` plus Bootstrap pagination markup |
| `CodeEditor.svelte` | `BroEditor` | Hand-written `nav-tabs` with `role="tab"` (the e2e tests rely on it); keeps the rename-by-clicking-the-active-tab behavior |
| `AceEditor.svelte` | `react-ace` | About 50 lines: create the editor on mount, `setValue` only when content changes from outside (format, example load), and annotations through `session.setAnnotations` |
| `RunControls.svelte` | version/pcap selects, file input, Format, `RunButton` | `bind:this` replaces the deprecated string refs |
| `LogViewer.svelte`, `LogTable.svelte`, `RecordModal.svelte` | `BroFileViewer*` | Use `$state.raw` for rows so large logs aren't made deeply reactive; build the modal on `<dialog>` with Bootstrap classes |
| `icons.js` | FontAwesome | Inline SVG for the 4 icons used (plus, play, xmark, eye) |

- [ ] Keep Bootstrap's CSS and drop react-bootstrap. Write the Bootstrap markup
      by hand.
- [ ] Move `public/index.html` to the Vite root (`index.html`) and fix its
      malformed `<div>` nesting.
- [ ] Ace:
  - import `ace-builds` directly (today it's only a transitive dependency of
    `react-ace`);
  - import `mode-zeek.js` into the bundle after Ace, instead of letting Ace fetch
    `/mode-zeek.js` at runtime (keep the Flask route for now);
  - drop the unused `mode-java` import;
  - consider one editor with one `EditSession` per file. That's lighter and keeps
    undo history per file. Today each tab mounts its own Ace instance.

## Phase 3: Build, CI and deploy

- [ ] Add `vite.config.js` with `build.outDir: 'build'` and
      `build.assetsDir: 'static'`. The output then has the layout the Dockerfile
      already copies and rsyncs (`build/*.*` → `static/`,
      `build/static/` → `static/`), so **the Dockerfile shouldn't need changes**.
- [ ] Update `package.json`:
  - remove `react`, `react-dom`, `react-ace`, `react-bootstrap`,
    `@fortawesome/*`, `redux`, `redux-thunk`, `react-redux`, `redux-logger` and
    `react-scripts`;
  - add the stack listed above.

  This also removes the need for `--legacy-peer-deps` and for the explicit
  `fontawesome-svg-core` dependency.
- [ ] `playwright.config.js`: change the web server command to
      `vite --port 3000 --strictPort`, or switch it to `vite build && vite preview`
      to test the production build.
- [ ] Update the `Makefile` `dev` target (use the `VITE_` env var).
- [ ] Update `.github/workflows/web-ui.yml`: remove the stale
      `--legacy-peer-deps` comment and point the unit-test step at `node:test`.
- [ ] Switch over only when the full e2e suite passes **unchanged** in CI. Then
      check manually against the real Docker stack: an actual Zeek run, a pcap
      upload, and stepping through the tutorial pages.

## Phase 4: Fix existing bugs (separate commits, each with a test)

1. [ ] The upload label is a literal string, so it shows
       `"Uploading pcap: {pcap.upload_progress}%"` instead of the percentage.
2. [ ] `bsStyle`, `bsSize` and `condensed` are Bootstrap 3 props that
       react-bootstrap 2 ignores. The red "too large" button, the large modal, the
       pill-style log tabs and the compact tables never actually render. Decide
       whether to apply these styles or drop them.
3. [ ] `VERSIONS_FETCHED` overwrites the version from a saved job. This race is
       noted in `e2e/routing.spec.js`.
4. [ ] The `EXEC_FETCHED_FILES` reducer `delete`s keys from `action.files` in
       place, mutating the action.
5. [ ] `?run=0` still triggers autorun because the string `"0"` is truthy.
6. [ ] md5 is computed with `readAsBinaryString` on files up to 10 MB. Use an
       ArrayBuffer with `spark-md5` instead (WebCrypto has no MD5).

## Phase 5 (optional): Shrink further

- [ ] Replace Ace with CodeMirror 6: roughly 60–90 kB gzipped smaller. This
      means porting the zeek highlighter to a `StreamLanguage` and updating the
      one e2e selector that uses `.ace_content`. CodeMirror 6 is split into
      several `@codemirror/*` packages that are versioned together, so this
      brings back a little of the coupling.
- [ ] Trim Bootstrap's CSS (currently 28 kB gzipped) by importing only the Sass
      partials that are used. This adds `sass` as a dev dependency.

## Unchanged

- The Flask backend and API contract: `/run`, `/files/<job>.json`, `/format`,
  `/saved/<job>`, `/pcap/<checksum>`, `/pcap/upload/<checksum>`,
  `/versions.json`, `/pcaps.json`, `/static/examples/examples.json`.
- Hash URLs: `#/tryzeek/saved/<job>`, `#/?example=…&pcap=…&version=…&run=…`.
- The examples and tutorial pipeline (`static/examples/pack.py`).
- The jQuery embed in `client/`, which only calls `/run_simple`.

## Effort

Probably 2–4 focused days for Phases 0–3, with Phase 2 as the bulk. Phases 4
and 5 are independent and can be scheduled separately.
