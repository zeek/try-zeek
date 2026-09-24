const { test, expect, mockApi } = require('./fixtures');

let api = null;

test.beforeEach(async ({ page }) => {
  api = await mockApi(page);
  await page.goto('/');
});

test('changing the version dropdown updates the selection', async ({ page }) => {
  await page.getByTestId('version-select').selectOption('7.0');
  await expect(page.getByTestId('version-select')).toHaveValue('7.0');
});

test('selecting a pcap from the dropdown updates the selection', async ({ page }) => {
  await page.getByTestId('pcap-select').selectOption('test.pcap');
  await expect(page.getByTestId('pcap-select')).toHaveValue('test.pcap');
});

test('running posts {sources,version,pcap} and shows output + logs', async ({ page }) => {
  await page.getByTestId('pcap-select').selectOption('test.pcap');
  await page.getByTestId('run-btn').click();

  // Output (stdout) and Errors (stderr) blocks render.
  await expect(page.getByTestId('output')).toContainText('hello world output');
  await expect(page.getByTestId('errors')).toContainText('something went wrong');

  // Output logs: a table tab (conn.log) with rows, plus a text log tab (weird).
  await expect(page.getByTestId('output-logs')).toBeVisible();
  await expect(page.getByTestId('log-row')).toHaveCount(2);

  // Contract: the /run request carried the expected JSON body.
  const run = api.requests.find((r) => r.name === 'run');
  expect(run).toBeTruthy();
  expect(JSON.parse(run.body)).toMatchObject({ version: '6.0', pcap: 'test.pcap' });
  expect(JSON.parse(run.body).sources[0].name).toBe('main.zeek');
});

test('clicking a log row opens the detail modal with working prev/next', async ({ page }) => {
  await page.getByTestId('run-btn').click();
  await expect(page.getByTestId('log-row')).toHaveCount(2);

  await page.getByTestId('log-row').first().click();
  await expect(page.getByTestId('detail-modal')).toBeVisible();
  // field/type/value for the first row
  await expect(page.getByTestId('detail-modal')).toContainText('10.0.0.1');
  await expect(page.getByTestId('modal-prev')).toBeDisabled(); // first record
  await page.getByTestId('modal-next').click();
  await expect(page.getByTestId('detail-modal')).toContainText('10.0.0.2');
});

test('format posts sources and applies the formatted result', async ({ page }) => {
  await page.getByTestId('format-btn').click();
  await expect(page.getByTestId('editor')).toContainText('formatted!');
  const fmt = api.requests.find((r) => r.name === 'format');
  expect(fmt).toBeTruthy();
  expect(JSON.parse(fmt.body).sources[0].name).toBe('main.zeek');
});

test('an oversized pcap disables the Run button', async ({ page }) => {
  await page.getByTestId('pcap-file').setInputFiles({
    name: 'big.pcap',
    mimeType: 'application/vnd.tcpdump.pcap',
    buffer: Buffer.alloc(10 * 1024 * 1024 + 1),
  });
  await expect(page.getByTestId('run-btn')).toContainText('too large');
  await expect(page.getByTestId('run-btn')).toBeDisabled();
});
