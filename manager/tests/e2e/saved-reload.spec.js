const { test, expect, mockApi, JOB } = require('./fixtures');

// After every run, the app pushes #/tryzeek/saved/<job>, and the hash change
// reloads that job from /saved/<job>: the editor gets the backend's copy of
// the sources and switches to the first file, and the saved version and pcap
// are applied.

test('a run links to its saved job and reloads it', async ({ page }) => {
  const api = await mockApi(page);
  await page.goto('/');
  await page.getByRole('tab', { name: /Add File/ }).click();
  await expect(page.getByRole('tab', { name: 'new-1.zeek' })).toHaveAttribute('aria-selected', 'true');
  await page.getByTestId('pcap-select').selectOption('test.pcap');
  await page.getByTestId('run-btn').click();

  await expect(page).toHaveURL(new RegExp(`#/tryzeek/saved/${JOB}$`));
  await expect.poll(() => api.savedFetches).toEqual([JOB]);
  // The reload shows the first file again...
  await expect(page.getByRole('tab', { name: 'main.zeek' })).toHaveAttribute('aria-selected', 'true');
  // ...with the backend's copy of it, which ends in a newline the original
  // didn't have, so it gains a second line.
  await expect(page.getByTestId('editor').locator('.ace_gutter-cell:visible')).toHaveCount(2);
  await expect(page.getByRole('tab', { name: 'new-1.zeek' })).toBeVisible();
  await expect(page.getByTestId('pcap-select')).toHaveValue('test.pcap');
  await expect(page.getByTestId('version-select')).toHaveValue('6.0');
  // Reloading a saved job doesn't run it again.
  expect(api.requests.filter((r) => r.name === 'run')).toHaveLength(1);
});

test('the reload applies the version the backend saved', async ({ page }) => {
  // The backend saves the version it ran with, which is the default when the
  // requested one is unknown (here, because the versions list changed).
  const versions = { versions: ['6.0', '7.0', '8.0'], default: '6.0' };
  const api = await mockApi(page, { versions });
  await page.goto('/');
  await page.getByTestId('version-select').selectOption('8.0');
  // Remove 8.0 from the mock backend's versions, as the version updater
  // might; the page already has its list, so it still sends 8.0.
  versions.versions.pop();
  await page.getByTestId('run-btn').click();
  await expect.poll(() => api.savedFetches).toEqual([JOB]);
  await expect(page.getByTestId('version-select')).toHaveValue('6.0');
  expect(JSON.parse(api.requests.find((r) => r.name === 'run').body).version).toBe('8.0');
});
