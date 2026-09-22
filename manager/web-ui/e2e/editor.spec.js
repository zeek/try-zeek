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
