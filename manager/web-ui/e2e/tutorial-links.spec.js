const { test, expect, mockApi, EXAMPLES } = require('./fixtures');

// pack.py rewrites tutorial links (http://try.zeek.org/example/<name>) into
// #/trybro?example=<name>, so clicking one inside a readme must load it.
test('a tutorial link inside an example readme loads the linked example', async ({ page }) => {
  const [hello, ...rest] = EXAMPLES;
  const linked = { ...hello, html: '<p>Next, see <a href="#/trybro?example=dns">the DNS example</a>.</p>' };
  await mockApi(page, { examples: [linked, ...rest] });
  await page.goto('/');
  await page.getByTestId('example-readme').getByRole('link', { name: 'the DNS example' }).click();
  await expect(page.getByTestId('example-readme')).toContainText('DNS example');
  await expect(page.getByTestId('editor')).toContainText('dns_request');
  await expect(page.getByTestId('example-select')).toHaveValue('dns');
});
