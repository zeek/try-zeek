const { test, expect, mockApi, FILES } = require('./fixtures');

async function runWith(page, overrides = {}) {
  const api = await mockApi(page, overrides);
  await page.goto('/');
  await page.getByTestId('run-btn').click();
  await expect(page.getByTestId('output-logs')).toBeVisible();
  return api;
}

test('conn.log is the default log tab even when it is not first', async ({ page }) => {
  const { 'conn.log': conn, ...rest } = FILES.files;
  await runWith(page, { files: { files: { ...rest, 'conn.log': conn } } });

  const logs = page.getByTestId('output-logs');
  await expect(logs.getByRole('tab', { name: 'conn' })).toHaveAttribute('aria-selected', 'true');
  await expect(logs.getByRole('tab', { name: 'weird' })).toHaveAttribute('aria-selected', 'false');
  await expect(page.getByTestId('log-row').first()).toBeVisible();
});

test('without conn.log, the first log is the default tab', async ({ page }) => {
  const { 'conn.log': _conn, ...rest } = FILES.files;
  await runWith(page, { files: { files: rest } });

  const logs = page.getByTestId('output-logs');
  await expect(logs.getByRole('tab', { name: 'weird' })).toHaveAttribute('aria-selected', 'true');
  await expect(logs.locator('pre', { hasText: 'plain-text log line' })).toBeVisible();
});

test.describe('with the default fixture', () => {
  test.beforeEach(async ({ page }) => {
    await runWith(page);
  });

  test('stdout.log and stderr.log are not shown as log tabs', async ({ page }) => {
    const logs = page.getByTestId('output-logs');
    await expect(logs.getByRole('tab')).toHaveCount(2);
    await expect(logs.getByRole('tab', { name: /stdout|stderr/ })).toHaveCount(0);
  });

  test('a plain-text log is shown as preformatted text', async ({ page }) => {
    const logs = page.getByTestId('output-logs');
    const text = logs.locator('pre', { hasText: 'this is a plain-text log line' });
    await expect(text).toBeHidden();
    await logs.getByRole('tab', { name: 'weird' }).click();
    await expect(text).toBeVisible();
    await expect(text).toContainText('second line');
    await expect(page.getByTestId('log-row').first()).toBeHidden();
  });

  test('the detail modal shows field, type and value', async ({ page }) => {
    await page.getByTestId('log-row').first().click();
    const modal = page.getByTestId('detail-modal');
    await expect(modal.getByRole('row', { name: 'id.orig_h addr 10.0.0.1' })).toBeVisible();
    await expect(modal.getByRole('row', { name: 'proto string tcp' })).toBeVisible();
  });

  test('the detail modal has working prev/next at the last record', async ({ page }) => {
    await page.getByTestId('log-row').last().click();
    await expect(page.getByTestId('detail-modal')).toContainText('10.0.0.2');
    await expect(page.getByTestId('modal-next')).toBeDisabled();
    await page.getByTestId('modal-prev').click();
    await expect(page.getByTestId('detail-modal')).toContainText('10.0.0.1');
    await expect(page.getByTestId('modal-prev')).toBeDisabled();
  });

  test('the detail modal closes with its Close button', async ({ page }) => {
    await page.getByTestId('log-row').first().click();
    await expect(page.getByTestId('detail-modal')).toBeVisible();
    await page.getByTestId('modal-close').click();
    await expect(page.getByTestId('detail-modal')).toBeHidden();
  });

  test('the detail modal closes with Escape', async ({ page }) => {
    await page.getByTestId('log-row').first().click();
    await expect(page.getByTestId('detail-modal')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('detail-modal')).toBeHidden();
  });
});
