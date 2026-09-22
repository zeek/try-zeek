const { test, expect, mockApi } = require('./fixtures');

test.beforeEach(async ({ page }) => {
  await mockApi(page);
  await page.goto('/');
});

test('loads the hello example by default', async ({ page }) => {
  await expect(page.getByTestId('example-readme')).toContainText('Hello example');
  await expect(page.getByTestId('editor')).toContainText('print "hello"');
  await expect(page.getByTestId('example-select')).toHaveValue('hello');
});

test('selecting an example loads its sources and readme', async ({ page }) => {
  await page.getByTestId('example-select').selectOption('dns');
  await expect(page.getByTestId('example-readme')).toContainText('DNS example');
  await expect(page.getByTestId('editor')).toContainText('dns_request');
});

test('prev/next paginate between examples', async ({ page }) => {
  // hello has a Next -> dns
  await page.getByTestId('example-next').click();
  await expect(page.getByTestId('example-readme')).toContainText('DNS example');
  // dns has a Prev -> hello
  await page.getByTestId('example-prev').click();
  await expect(page.getByTestId('example-readme')).toContainText('Hello example');
});

test('hide/show toggles the example text', async ({ page }) => {
  await expect(page.getByTestId('example-readme')).toBeVisible();
  await page.getByTestId('toggle-text').click(); // Hide Text
  await expect(page.getByTestId('example-readme')).toHaveCount(0);
  await page.getByTestId('toggle-text').click(); // Show Text
  await expect(page.getByTestId('example-readme')).toBeVisible();
});
