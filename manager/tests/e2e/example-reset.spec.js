const { test, expect, mockApi } = require('./fixtures');

// Choosing another example clears the previous run's output, so it can't be
// mistaken for the new example's.

const OUTPUT_IDS = ['output', 'errors', 'output-logs'];

async function runAndExpectOutput(page) {
  await page.getByTestId('run-btn').click();
  for (const id of OUTPUT_IDS) await expect(page.getByTestId(id)).toBeVisible();
}

async function expectNoOutput(page) {
  for (const id of OUTPUT_IDS) await expect(page.getByTestId(id)).toHaveCount(0);
}

test.beforeEach(async ({ page }) => {
  await mockApi(page);
  await page.goto('/');
  await expect(page.getByTestId('example-readme')).toContainText('Hello example');
});

test('choosing an example from the dropdown clears the output', async ({ page }) => {
  await runAndExpectOutput(page);
  await page.getByTestId('example-select').selectOption('dns');
  await expect(page.getByTestId('example-readme')).toContainText('DNS example');
  await expectNoOutput(page);
});

test('choosing an example with Next or Previous clears the output', async ({ page }) => {
  await runAndExpectOutput(page);
  await page.getByTestId('example-next').click();
  await expect(page.getByTestId('example-readme')).toContainText('DNS example');
  await expectNoOutput(page);

  await runAndExpectOutput(page);
  await page.getByTestId('example-prev').click();
  await expect(page.getByTestId('example-readme')).toContainText('Hello example');
  await expectNoOutput(page);
});

// Known bug, kept as-is during the port: going back to a different example
// loads it through the hash change listener, which doesn't clear the output
// the way choosing it in the page does, so the previous example's output stays
// on screen. Once fixed, this will fail; remove the test.fail().
test('going back to a different example clears the output', async ({ page }) => {
  test.fail();
  await page.getByTestId('example-select').selectOption('dns');
  await runAndExpectOutput(page);
  await page.goBack(); // to #/?example=dns
  await page.goBack(); // to #/?example=hello
  await expect(page.getByTestId('example-readme')).toContainText('Hello example');
  await expect(page.getByTestId('output')).toHaveCount(0, { timeout: 3000 });
});
