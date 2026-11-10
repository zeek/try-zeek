const { test, expect, mockApi } = require('./fixtures');

const runs = (api) => api.requests.filter((r) => r.name === 'run');

test('a saved-job deep link runs the saved sources once', async ({ page }) => {
  const api = await mockApi(page);
  await page.goto('/#/tryzeek/saved/abc123');
  await expect(page.getByTestId('output')).toContainText('hello world output');

  // The run pushes #/tryzeek/saved/job1, which reloads that job without
  // re-running it, so there should be exactly one run.
  expect(runs(api)).toHaveLength(1);
  const body = JSON.parse(runs(api)[0].body);
  expect(body.sources[0].content).toContain('print "saved"');
  expect(body.pcap).toBe('test.pcap');
});

test('?example=...&run=1 loads the example and runs it', async ({ page }) => {
  const api = await mockApi(page);
  await page.goto('/#/?example=dns&run=1');
  await expect(page.getByTestId('output')).toContainText('hello world output');

  expect(runs(api)).toHaveLength(1);
  const body = JSON.parse(runs(api)[0].body);
  expect(body.sources[0].content).toContain('dns_request');
  expect(body.pcap).toBe('test.pcap'); // the example's first pcap
});

test('?example=... without run does not run', async ({ page }) => {
  const api = await mockApi(page);
  await page.goto('/#/?example=dns');
  await expect(page.getByTestId('example-readme')).toContainText('DNS example');
  await expect(page.getByTestId('run-btn')).toBeEnabled();
  expect(runs(api)).toHaveLength(0);
});
