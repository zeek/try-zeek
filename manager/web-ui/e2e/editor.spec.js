const { test, expect, mockApi } = require('./fixtures');

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
  await expect(visibleErrorCells(page)).toHaveCount(0); // new-1.zeek is active
});

// Known bug, kept as-is during the port (see MIGRATION.md, Phase 4): an editor
// whose tab is hidden when annotations arrive doesn't redraw its gutter when
// the tab is shown again. Once fixed, this will fail; remove the test.fail().
test('stderr errors appear after switching back to the file', async ({ page }) => {
  test.fail();
  test.setTimeout(10000);
  await mockApi(page);
  await page.goto('/');
  await page.getByRole('tab', { name: /Add File/ }).click();
  await page.getByTestId('run-btn').click();
  await expect(page.getByTestId('errors')).toBeVisible();
  await page.getByRole('tab', { name: 'main.zeek' }).click();
  await expect(visibleErrorCells(page)).toHaveCount(1, { timeout: 3000 });
});
