// Measures a production build of the web UI, so the React and Svelte versions
// can be compared the same way. Not part of the test suite.
//
// Usage: node e2e/measure.js [build-dir] [runs]
//
// Prints a markdown table with:
// - the size of each shipped .js/.css file, raw and gzipped (level 9);
// - the median of `runs` cold page loads (a fresh browser context each time)
//   for DOMContentLoaded, the load event, and the time until the editor shows
//   the default example's source. These run once at full speed and once with
//   4x CPU throttling, which makes JS parse/run costs easier to see. The
//   backend is mocked with e2e/fixtures.js, so these numbers measure the
//   frontend only.
const fs = require('fs');
const http = require('http');
const path = require('path');
const zlib = require('zlib');
const { chromium } = require('@playwright/test');
const { mockApi } = require('./fixtures');

const buildDir = path.resolve(process.argv[2] || 'build');
const runs = Number(process.argv[3] || 10);

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.ico': 'image/x-icon' };

function listAssets(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return listAssets(full);
    return /\.(js|css)$/.test(e.name) ? [full] : [];
  });
}

// Serves the build directory, like Flask does in production.
function serve(dir) {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const file = path.join(dir, urlPath === '/' ? 'index.html' : urlPath);
    if (!file.startsWith(dir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const kB = (n) => (n / 1000).toFixed(1);

async function main() {
  console.log('| File | Raw (kB) | Gzip (kB) |\n|---|---:|---:|');
  let raw = 0;
  let gz = 0;
  for (const file of listAssets(buildDir)) {
    const data = fs.readFileSync(file);
    const zipped = zlib.gzipSync(data, { level: 9 }).length;
    raw += data.length;
    gz += zipped;
    console.log(`| \`${path.relative(buildDir, file)}\` | ${kB(data.length)} | ${kB(zipped)} |`);
  }
  console.log(`| **Total** | **${kB(raw)}** | **${kB(gz)}** |\n`);

  const server = await serve(buildDir);
  const url = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch();
  const results = {};
  for (const cpu of [1, 4]) {
    const samples = { dcl: [], load: [], editor: [] };
    for (let i = 0; i < runs; i++) {
      const context = await browser.newContext();
      const page = await context.newPage();
      const cdp = await context.newCDPSession(page);
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
      await mockApi(page);
      await page.goto(url);
      const editor = await page.waitForFunction(() => {
        const el = document.querySelector('.ace_content');
        return el && el.textContent.includes('print "hello"') && performance.now();
      });
      await page.waitForLoadState('load');
      const nav = await page.evaluate(() => performance.getEntriesByType('navigation')[0].toJSON());
      samples.dcl.push(nav.domContentLoadedEventEnd);
      samples.load.push(nav.loadEventEnd);
      samples.editor.push(await editor.jsonValue());
      await context.close();
    }
    results[cpu] = samples;
  }
  await browser.close();
  server.close();

  const ms = (xs) => median(xs).toFixed(0);
  console.log(`| Median of ${runs} cold loads | Full speed (ms) | 4x CPU throttle (ms) |\n|---|---:|---:|`);
  console.log(`| DOMContentLoaded | ${ms(results[1].dcl)} | ${ms(results[4].dcl)} |`);
  console.log(`| Load event | ${ms(results[1].load)} | ${ms(results[4].load)} |`);
  console.log(`| Editor shows the example | ${ms(results[1].editor)} | ${ms(results[4].editor)} |`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
