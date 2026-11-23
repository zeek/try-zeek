// Playwright config for the try-zeek web UI end-to-end safety net.
//
// These specs drive the app through a real browser with the backend API fully
// mocked (see fixtures.js). They are intentionally framework-agnostic --
// they select by data-testid and user-visible text -- so the SAME suite must
// pass unchanged against the React app today and the Svelte rewrite later.
//
// The suite has its own package.json, separate from the web UI's, so
// replacing the web UI's dependencies doesn't change the tests.
const path = require('path');
const { defineConfig, devices } = require('@playwright/test');

const WEB_UI_DIR = path.join(__dirname, '..', '..', 'web-ui');

const PORT = 'http://localhost:3000';
const COMMAND = 'npm start';

module.exports = defineConfig({
  testDir: '.',
  timeout: 30000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  workers: 1,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : 'list',
  use: {
    baseURL: PORT,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: COMMAND,
    cwd: WEB_UI_DIR,
    url: PORT,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: { BROWSER: 'none', PORT: String(new URL(PORT).port || 3000) },
  },
});
