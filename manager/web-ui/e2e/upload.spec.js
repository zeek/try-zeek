const crypto = require('crypto');
const { test, expect, mockApi } = require('./fixtures');

// A small "pcap" that includes bytes >= 0x80, so the checksum is only right if
// the app hashes the raw bytes rather than some text encoding of them.
const PCAP = Buffer.from([0xd4, 0xc3, 0xb2, 0xa1, 0x02, 0x00, 0x04, 0x00, 0xff, 0x80]);
const CHECKSUM = crypto.createHash('md5').update(PCAP).digest('hex');

async function chooseFile(page) {
  await page.getByTestId('pcap-file').setInputFiles({
    name: 'local.pcap',
    mimeType: 'application/vnd.tcpdump.pcap',
    buffer: PCAP,
  });
}

test('a new local pcap is checked, uploaded, then run by checksum', async ({ page }) => {
  const api = await mockApi(page);
  await page.goto('/');
  await chooseFile(page);
  await page.getByTestId('run-btn').click();
  await expect(page.getByTestId('output')).toContainText('hello world output');

  const names = api.requests.map((r) => r.name);
  expect(names).toEqual(['pcap-check', 'upload', 'run']);
  expect(api.requests[0].url).toMatch(new RegExp(`/pcap/${CHECKSUM}$`));
  expect(api.requests[1].url).toMatch(new RegExp(`/pcap/upload/${CHECKSUM}$`));
  expect(JSON.parse(api.requests[2].body).pcap).toBe(CHECKSUM);
});

test('a local pcap already on the server is run without uploading', async ({ page }) => {
  const api = await mockApi(page, { pcapExists: true });
  await page.goto('/');
  await chooseFile(page);
  await page.getByTestId('run-btn').click();
  await expect(page.getByTestId('output')).toContainText('hello world output');

  expect(api.requests.map((r) => r.name)).toEqual(['pcap-check', 'run']);
  expect(JSON.parse(api.requests[1].body).pcap).toBe(CHECKSUM);
});
