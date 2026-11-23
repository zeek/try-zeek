const { test, expect, mockApi } = require('./fixtures');

// These check that what's in the editor reaches the /run request, not just the
// screen. Ace keeps showing typed text even if the app's state never sees it,
// so checking the editor alone can't catch broken state wiring.

// Types into whichever file's editor is on screen.
async function typeInEditor(page, text) {
  await page.getByTestId('editor').locator('.ace_content:visible').click();
  await page.keyboard.press('ControlOrMeta+End');
  await page.keyboard.type(text);
}

async function runAndGetSources(page, api) {
  await page.getByTestId('run-btn').click();
  await expect(page.getByTestId('output')).toBeVisible();
  const runs = api.requests.filter((r) => r.name === 'run');
  expect(runs).toHaveLength(1);
  return JSON.parse(runs[0].body).sources;
}

test('typed edits are sent in the /run request', async ({ page }) => {
  const api = await mockApi(page);
  await page.goto('/');
  await expect(page.getByTestId('editor')).toContainText('print "hello"');
  await typeInEditor(page, '\n# zeekmarker');

  const sources = await runAndGetSources(page, api);
  expect(sources).toHaveLength(1);
  expect(sources[0].name).toBe('main.zeek');
  expect(sources[0].content).toContain('print "hello"');
  expect(sources[0].content).toContain('# zeekmarker');
});

test('added files and their edits are sent in the /run request', async ({ page }) => {
  const api = await mockApi(page);
  await page.goto('/');
  await page.getByRole('tab', { name: /Add File/ }).click();
  await expect(page.getByRole('tab', { name: 'new-1.zeek' })).toHaveAttribute('aria-selected', 'true');
  await typeInEditor(page, ' newfilemarker');

  const sources = await runAndGetSources(page, api);
  expect(sources.map((s) => s.name)).toEqual(['main.zeek', 'new-1.zeek']);
  expect(sources[0].content).toContain('print "hello"');
  expect(sources[1].content).toBe('# newfilemarker');
});

test('a renamed file is sent under its new name', async ({ page }) => {
  const api = await mockApi(page);
  page.on('dialog', (d) => d.accept('renamed.zeek'));
  await page.goto('/');
  await page.getByRole('tab', { name: /Add File/ }).click();
  await page.getByRole('tab', { name: 'new-1.zeek' }).click(); // rename prompt
  await expect(page.getByRole('tab', { name: 'renamed.zeek' })).toBeVisible();

  const sources = await runAndGetSources(page, api);
  expect(sources.map((s) => s.name)).toEqual(['main.zeek', 'renamed.zeek']);
  expect(sources[1].content).toBe('#');
});

test('a changed version is sent in the /run request', async ({ page }) => {
  const api = await mockApi(page);
  await page.goto('/');
  await page.getByTestId('version-select').selectOption('7.0');
  await page.getByTestId('run-btn').click();
  await expect(page.getByTestId('output')).toBeVisible();
  const run = api.requests.find((r) => r.name === 'run');
  expect(JSON.parse(run.body).version).toBe('7.0');
});
