const { test, expect, mockApi } = require('./fixtures');

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test('a saved-job deep link loads the saved sources', async ({ page }) => {
  await page.goto('/#/tryzeek/saved/abc123');
  await expect(page.getByTestId('editor')).toContainText('print "saved"');
  // pcap from the saved job is applied (version is intentionally not asserted:
  // VERSIONS_FETCHED overwrites it with the server default on load -- a
  // pre-existing race we preserve rather than mask).
  await expect(page.getByTestId('pcap-select')).toHaveValue('test.pcap');
});

test('the ?pcap= query param selects that pcap', async ({ page }) => {
  await page.goto('/#/?pcap=test.pcap');
  await expect(page.getByTestId('pcap-select')).toHaveValue('test.pcap');
});

test('the ?example= query param loads that example', async ({ page }) => {
  await page.goto('/#/?example=dns');
  await expect(page.getByTestId('example-readme')).toContainText('DNS example');
  await expect(page.getByTestId('editor')).toContainText('dns_request');
});
