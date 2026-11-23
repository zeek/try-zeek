const { test, expect, mockApi, JOB } = require('./fixtures');

// The app keeps its view in the URL hash and listens for hash changes, so the
// browser's back and forward buttons move between examples and saved jobs.

async function expectExample(page, path, readme, source) {
  await expect(page).toHaveURL(new RegExp(`#/\\?example=${path}$`));
  await expect(page.getByTestId('example-select')).toHaveValue(path);
  await expect(page.getByTestId('example-readme')).toContainText(readme);
  await expect(page.getByTestId('editor')).toContainText(source);
}

test.beforeEach(async ({ page }) => {
  await mockApi(page);
  await page.goto('/');
  await expectExample(page, 'hello', 'Hello example', 'print "hello"');
});

test('back and forward move between examples chosen from the dropdown', async ({ page }) => {
  await page.getByTestId('example-select').selectOption('dns');
  await expectExample(page, 'dns', 'DNS example', 'dns_request');

  await page.goBack();
  await expectExample(page, 'hello', 'Hello example', 'print "hello"');
  await page.goForward();
  await expectExample(page, 'dns', 'DNS example', 'dns_request');
});

test('back and forward move between examples chosen with Next', async ({ page }) => {
  await page.getByTestId('example-next').click();
  await expectExample(page, 'dns', 'DNS example', 'dns_request');

  await page.goBack();
  await expectExample(page, 'hello', 'Hello example', 'print "hello"');
});

test('back from a run returns to the example', async ({ page }) => {
  await page.getByTestId('example-select').selectOption('dns');
  await page.getByTestId('run-btn').click();
  await expect(page).toHaveURL(new RegExp(`#/tryzeek/saved/${JOB}$`));
  // Wait for the post-run reload, so it can't land after going back.
  await expect(page.getByTestId('output-logs')).toBeVisible();

  await page.goBack();
  await expectExample(page, 'dns', 'DNS example', 'dns_request');
  await page.goForward();
  await expect(page).toHaveURL(new RegExp(`#/tryzeek/saved/${JOB}$`));
  await expect(page.getByTestId('editor')).toContainText('dns_request');
});
