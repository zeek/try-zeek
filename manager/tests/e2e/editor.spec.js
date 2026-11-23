const { test, expect, mockApi, FILES } = require('./fixtures');

test('adds a new file as a new active tab', async ({ page }) => {
  await mockApi(page);
  await page.goto('/');
  await expect(page.getByRole('tab', { name: 'main.zeek' })).toBeVisible();
  await page.getByRole('tab', { name: /Add File/ }).click();
  await expect(page.getByRole('tab', { name: 'new-1.zeek' })).toBeVisible();
});

test('switches between file tabs', async ({ page }) => {
  await mockApi(page);
  await page.goto('/');
  await page.getByRole('tab', { name: /Add File/ }).click();
  await expect(page.getByTestId('editor')).toContainText('#'); // new file seeded with '#'
  await page.getByRole('tab', { name: 'main.zeek' }).click();
  await expect(page.getByTestId('editor')).toContainText('print "hello"');
});

test('renames the current (non-main) file via prompt', async ({ page }) => {
  await mockApi(page);
  page.on('dialog', (d) => d.accept('renamed.zeek'));
  await page.goto('/');
  await page.getByRole('tab', { name: /Add File/ }).click();
  // clicking the already-active non-main tab triggers the rename prompt
  await page.getByRole('tab', { name: 'new-1.zeek' }).click();
  await expect(page.getByRole('tab', { name: 'renamed.zeek' })).toBeVisible();
});

test('typing in the editor updates its content', async ({ page }) => {
  await mockApi(page);
  await page.goto('/');
  await page.locator('.ace_content').click();
  await page.keyboard.type('zeekmarker');
  await expect(page.getByTestId('editor')).toContainText('zeekmarker');
});

// Only count gutter cells that are on screen, so a hidden tab's editor can't match.
const visibleErrorCells = (page) =>
  page.getByTestId('editor').locator('.ace_gutter-cell.ace_error:visible');

test('stderr errors are shown as gutter annotations', async ({ page }) => {
  await mockApi(page);
  await page.goto('/');
  await expect(visibleErrorCells(page)).toHaveCount(0);
  // The fixture's stderr reports "error in ./try.zeek, line 1", which the app
  // maps to line 1 of main.zeek.
  await page.getByTestId('run-btn').click();
  await expect(visibleErrorCells(page)).toHaveCount(1);
  await expect(visibleErrorCells(page)).toHaveText('1');
});

test('stderr errors for main.zeek are not shown on other files', async ({ page }) => {
  await mockApi(page);
  await page.goto('/');
  await page.getByRole('tab', { name: /Add File/ }).click();
  await page.getByTestId('run-btn').click();
  await expect(page.getByTestId('errors')).toBeVisible();
  // The post-run reload of the saved job switches back to main.zeek; wait for
  // it, so the tab switches below can't race it.
  await expect(page.getByRole('tab', { name: 'main.zeek' })).toHaveAttribute('aria-selected', 'true');
  await expect(visibleErrorCells(page)).toHaveCount(1);

  await page.getByRole('tab', { name: 'new-1.zeek' }).click();
  await expect(visibleErrorCells(page)).toHaveCount(0);
  await page.getByRole('tab', { name: 'main.zeek' }).click();
  await expect(visibleErrorCells(page)).toHaveCount(1);
});

// After a run, the reload of the saved job always shows main.zeek, so errors
// in any other file arrive while its editor is hidden. Its markers must still
// appear once it's shown. (With Ace they can take about a second, until Ace
// redraws after the resize.) The logs and the saved job can arrive in either
// order, so both are checked.
for (const order of [['saved', 'files'], ['files', 'saved']]) {
  test(`errors in a hidden file appear when it is shown (${order.join(' before ')})`, async ({ page }) => {
    const files = { files: { ...FILES.files, 'stderr.log': 'error in ./new-1.zeek, line 1: bad' } };
    const api = await mockApi(page, { files, hold: ['files', 'saved'] });
    await page.goto('/');
    await page.getByRole('tab', { name: /Add File/ }).click();
    await page.getByTestId('run-btn').click();
    await expect.poll(() => api.savedFetches.length).toBe(1);

    for (const name of order) api.release(name);
    await expect(page.getByTestId('errors')).toContainText('bad');
    await expect(page.getByRole('tab', { name: 'main.zeek' })).toHaveAttribute('aria-selected', 'true');
    await expect(visibleErrorCells(page)).toHaveCount(0);

    await page.getByRole('tab', { name: 'new-1.zeek' }).click();
    await expect(visibleErrorCells(page)).toHaveCount(1);
    await expect(visibleErrorCells(page)).toHaveText('1');
  });
}
