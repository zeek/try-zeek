// Playwright config for the try-zeek web UI end-to-end safety net.
//
// These specs drive the app through a real browser with the backend API fully
// mocked (see e2e/fixtures.js). They are intentionally framework-agnostic --
// they select by data-testid and user-visible text -- so the SAME suite must
// pass unchanged against the React app today and the Svelte rewrite later.
const { defineConfig, devices } = require('@playwright/test');

const PORT = 'http://localhost:3000';
const COMMAND = 'npm start';

module.exports = defineConfig({
  testDir: './e2e',
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
    url: PORT,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: { BROWSER: 'none', PORT: String(new URL(PORT).port || 3000) },
  },
});
