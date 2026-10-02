'use strict';
// NODE_PATH=/path/to/qa/node_modules node scripts/check-loading-browser.cjs [public-url] [evidence-dir]
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const { root, read, loadContent } = require('./check.cjs');
const manifest = JSON.parse(read('detail-chunks.json'));
const content = loadContent();
const live = process.argv[2]?.startsWith('https://');
const output = (process.argv[3] || process.env.EGG_QA_EVIDENCE_DIR) && path.resolve(process.argv[3] || process.env.EGG_QA_EVIDENCE_DIR);
const server = http.createServer((req, res) => {
  const file = path.resolve(root, '.' + new URL(req.url, 'http://localhost').pathname);
  if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
  fs.readFile(file, (error, bytes) => {
    if (error) return res.writeHead(404).end();
    const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png' };
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' }).end(bytes);
  });
});
let browser;
(async () => {
  if (output) fs.mkdirSync(output, { recursive: true });
  if (!live) await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = live ? process.argv[2] : 'http://127.0.0.1:' + server.address().port + '/';
  browser = await chromium.launch({ headless: true, ...(process.env.EGG_QA_BROWSER ? { executablePath: process.env.EGG_QA_BROWSER } : {}), ...(live && process.env.EGG_QA_PROXY ? { proxy: { server: process.env.EGG_QA_PROXY } } : {}) });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const errors = [], checks = [];
  let requested = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (new URL(request.url()).pathname.endsWith('.js')) requested.push(path.basename(new URL(request.url()).pathname)); });
  async function visit(query) {
    requested = [];
    assert.equal((await page.goto(base + 'lesson.html?' + query + '&v=learning-check', { waitUntil: 'load' })).status(), 200);
    await page.waitForFunction(() => document.querySelector('.lesson-article').getAttribute('aria-busy') === 'false');
  }
  const representatives = [...new Set(Object.keys(manifest).filter(id => Object.keys(manifest).find(other => manifest[other].file === manifest[id].file) === id).map(Number).concat([6,37,40,75,92,144]))];
  for (const id of representatives) {
    await visit('id=' + id);
    assert.equal(await page.locator('#lesson-title').innerText(), content.all[id].title);
    assert(await page.locator('.microsteps li').count() >= 8);
    assert(await page.locator('#lesson-toc a').count() === 145);
    assert.equal(await page.locator('.verification-grid article').count(), 4);
    if (content.all[id].challenge) {
      assert.equal(await page.locator('.challenge-solution').count(), 1, id + ': 挑战缺少参考解法');
      assert((await page.locator('#challenge').innerText()).includes(content.all[id].challenge), id + ': 原题未保留');
      assert.equal(await page.locator('#lesson-steps a[href="#challenge"]').count(), 1, id + ': 参考解法缺少导航入口');
    }
    assert.deepEqual(requested.filter(file => /^detailed-guides-/.test(file)), [manifest[id].file]);
    assert.equal(requested.filter(file => file === 'app.js').length, 1);
    assert(!requested.includes('block-diagram-data.js'), '教程不应下载只用于手册实例的图示数据');
    const bytes = [...new Set(requested)].reduce((sum, file) => sum + fs.statSync(path.join(root, file)).size, 0);
    assert(bytes < 7867380 * 0.65, '单课脚本体积应至少减少35%');
    checks.push({ id, chunk: manifest[id].file, javascriptBytes: bytes, previousJavascriptBytes: 7867380 });
    if (checks.length % 7 === 0) console.log('已核对 ' + checks.length + ' 个课程加载与页面');
  }
  await visit('id=40');
  await page.locator('.course-outline > summary').click();
  await page.locator('#lesson-query').fill('宠物');
  assert.match(await page.locator('#lesson-search-status').innerText(), /找到 3 课/);
  assert.equal(await page.locator('#next-lesson').getAttribute('href'), 'lesson.html?id=41');
  await page.setViewportSize({ width: 390, height: 844 });
  await visit('id=40');
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  if (await page.locator('.challenge-solution').count()) {
    await page.locator('.challenge-solution > summary').click();
    assert(await page.locator('.challenge-solution').evaluate(node => node.open));
    await page.locator('.challenge-solution').scrollIntoViewIfNeeded();
  }
  if (output) await page.screenshot({ path: path.join(output, 'lesson-40-mobile.png'), animations: 'disabled' });
  for (const query of ['id=999','id=oops']) {
    await visit(query);
    assert.equal(await page.locator('#lesson-title').innerText(), '这堂课暂时不存在');
    assert.equal(requested.filter(file => /^detailed-guides-/.test(file)).length, 0);
  }
  const failures = [
    ['**/detail-chunks.json*', route => route.fulfill({ status: 503, body: 'unavailable' })],
    ['**/' + manifest[40].file + '*', route => route.abort()],
    ['**/' + manifest[40].file + '*', route => route.fulfill({ status: 200, contentType: 'text/javascript', body: 'window.EGG_DETAILED_GUIDES = {};' })],
    ['**/app.js*', route => route.fulfill({ status: 200, contentType: 'text/javascript', body: 'document.getElementById("lesson-title").textContent="片段已加载";' })]
  ];
  for (const [pattern, handler] of failures) {
    await page.route(pattern, handler);
    await visit('id=40');
    assert.equal(await page.locator('#retry-lesson').count(), 1);
    assert.equal(requested.filter(file => file === 'app.js').length, pattern.includes('/app.js') ? 1 : 0, '缺详解时不能执行页面渲染');
    if (output) await page.screenshot({ path: path.join(output, 'load-error-mobile.png'), animations: 'disabled' });
    await page.unroute(pattern, handler);
    requested = [];
    await page.locator('#retry-lesson').click();
    await page.waitForFunction(() => document.querySelector('.lesson-article').getAttribute('aria-busy') === 'false');
    assert.equal(await page.locator('#retry-lesson').count(), 0);
    assert(await page.locator('.microsteps li').count() >= 8);
    assert.equal(requested.filter(file => file === 'app.js').length, 1);
  }
  assert.deepEqual(errors, []);
  if (output) fs.writeFileSync(path.join(output, 'loading-results.json'), JSON.stringify({ checks, failureAndRetryCases: failures.length, errors }, null, 2));
  console.log(`PASS real browser loading: ${checks.length} lessons / 24 chunks, single renderer, TOC and navigation, mobile layout, ${failures.length} failures and successful retries`);
})().catch(error => { console.error(error.stack); process.exitCode = 1; }).finally(async () => {
  if (browser) await browser.close();
  if (server.listening) await new Promise(resolve => server.close(resolve));
});
