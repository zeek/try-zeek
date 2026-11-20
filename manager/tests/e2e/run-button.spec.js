const { test, expect, mockApi } = require('./fixtures');

test('the Run button shows progress and is disabled while running', async ({ page }) => {
  const held = await mockApi(page, { hold: ['run', 'files'] });
  await page.goto('/');
  const run = page.getByTestId('run-btn');
  await expect(run).toHaveText('Run');
  await expect(run).toBeEnabled();

  await run.click();
  await expect(run).toHaveText('Running...');
  await expect(run).toBeDisabled();

  held.release('run');
  await expect(run).toHaveText('Fetching files...');
  await expect(run).toBeDisabled();

  held.release('files');
  await expect(page.getByTestId('output-logs')).toBeVisible();
  await expect(run).toHaveText('Run');
  await expect(run).toBeEnabled();
});
