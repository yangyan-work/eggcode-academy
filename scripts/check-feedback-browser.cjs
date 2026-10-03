#!/usr/bin/env node
'use strict';
// 复用现有 jsdom / Playwright；新浏览器上下文隔离日常资料。
// node --expose-gc scripts/check-feedback-browser.cjs [baseURL] [--live | --responsive]
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { chromium } = require('playwright');
const { root, read, renderingScripts, loadContent } = require('./check.cjs');
const args = process.argv.slice(2), live = args.includes('--live'), responsiveOnly = args.includes('--responsive');
const base = (args.find(arg => !arg.startsWith('--')) || 'http://127.0.0.1:4178/site/').replace(/\/?$/, '/');
const output = path.resolve(root, '../qa/feedback-release');
const origin = new URL(base).origin;
const executablePath = process.env.EGG_QA_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const KEY = 'eggcode-academy.space-preview.v1', PROGRESS_KEY = 'eggcode-academy.learning-progress';
const legacyProgress = JSON.stringify({ version: 1, completed: [22, 70, 144], lastLesson: 70 });
const learning = { version: 1, active: false, nickname: '纠错检查创作者', completed: [0, 70], favorites: [22, 40], notes: [{ lessonId: 40, content: '保留原学习笔记', updatedAt: '2026-10-04T00:00:00.000Z' }], feedback: [], lastLesson: 70 };
const report = { startedAt: new Date().toISOString(), base, live, responsiveOnly, browser: executablePath, checks: [], dom: { lessons: 0, diagrams: 0, microsteps: 0, sceneSteps: 0, variableSteps: 0, customSteps: 0, testCases: 0, buttons: 0 }, browserCases: [], pageErrors: [], resourceFailures: [], expectedResourceFailures: [], submissions: [], externalRequests: [], interactionRequests: [], screenshots: [], downloads: [], assertions: 0 };
const equal = (actual, expected, label) => { assert.deepEqual(actual, expected, label); report.assertions++; };
const ok = (value, label) => { assert.ok(value, label); report.assertions++; };
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const originalVerification = sha(read('verification-report.json'));
let browser;
async function test(name, run) {
  try { await run(); report.checks.push({ name, passed: true }); console.log('通过：' + name); }
  catch (error) { report.checks.push({ name, passed: false, error: error.message, stack: error.stack }); console.error('失败：' + name + '\n' + error.stack); }
}
function expectedTargets(doc) {
  return {
    microsteps: [...doc.querySelectorAll('.recipe-step .microsteps > ol > li')],
    sceneSteps: [...doc.querySelectorAll('.setup-object > ol > li')],
    variableSteps: [...doc.querySelectorAll('#start-here > ol > li')],
    customSteps: [...doc.querySelectorAll('.custom-catalog section > ol > li')],
    testCases: [...doc.querySelectorAll('.scenario-tests .test-case')]
  };
}
async function checkAllLessons() {
  const { JSDOM, VirtualConsole } = require('jsdom');
  const content = loadContent(), compiled = new Map();
  const execute = (dom, file) => { if (!compiled.has(file)) compiled.set(file, new vm.Script(read(file), { filename: file })); compiled.get(file).runInContext(dom.getInternalVMContext()); };
  equal(content.all.length, 145, '全量检查覆盖 145 课');
  for (let id = 0; id < content.all.length; id++) {
    const errors = [], console = new VirtualConsole();
    console.on('jsdomError', error => errors.push(error.message));
    const dom = new JSDOM(read('lesson.html'), { url: 'https://qa.invalid/lesson.html?id=' + id, runScripts: 'outside-only', virtualConsole: console });
    try {
      const w = dom.window, doc = w.document;
      w.matchMedia = condition => ({ media: condition, matches: condition.includes('reduced-motion'), addEventListener() {}, removeEventListener() {} });
      w.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
      w.requestAnimationFrame = callback => { callback(0); return 1; };
      w.cancelAnimationFrame = () => {};
      w.HTMLElement.prototype.scrollIntoView = function () {};
      w.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
      w.HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new w.Event('close')); };
      w.fetch = async value => { const file = path.basename(new URL(value, w.location.href).pathname); return { ok: true, text: async () => read(file), json: async () => JSON.parse(read(file)) }; };
      w.navigator.clipboard = { writeText: async () => {} };
      w.localStorage.setItem(KEY, JSON.stringify({ ...learning, active: true }));
      w.localStorage.setItem(PROGRESS_KEY, legacyProgress);
      w.sessionStorage.setItem('eggcode-academy.login-gate.v1', 'demo');
      w.addEventListener('error', event => errors.push(event.error?.message || event.message));
      for (const file of renderingScripts('lesson.html', '?id=' + id).filter(file => file !== 'lesson-feedback.js')) execute(dom, file);
      await new Promise(resolve => setTimeout(resolve, 0));
      const beforeSVG = [...doc.querySelectorAll('#lesson-body .block-figure svg')].map(node => node.outerHTML);
      const targets = expectedTargets(doc), detail = w.EGG_DETAILED_GUIDES[id];
      equal(targets.microsteps.length, detail.sections.reduce((sum, section) => sum + section.steps.length, 0), id + ' 微步渲染数');
      equal(targets.sceneSteps.length, detail.scene.reduce((sum, item) => sum + item.steps.length, 0), id + ' 场景准备渲染数');
      equal(targets.variableSteps.length, detail.variableSteps.length, id + ' 变量准备渲染数');
      equal(targets.customSteps.length, detail.customActions.reduce((sum, item) => sum + item.steps.length, 0), id + ' 自定义动作渲染数');
      equal(targets.testCases.length, detail.tests.length, id + ' 真实验收用例数');
      execute(dom, 'lesson-feedback.js');
      for (const [kind, nodes] of Object.entries(targets)) {
        for (const node of nodes) {
          ok(node.id, id + ' ' + kind + ' 有定位锚点');
          equal([...node.children].filter(child => child.matches('.feedback-step-button')).length, 1, id + ' ' + kind + ' 恰有一个独立纠错入口');
        }
        report.dom[kind] += nodes.length;
      }
      for (const section of doc.querySelectorAll('.recipe-step')) equal([...section.children].filter(child => child.matches('.feedback-step-button')).length, 1, id + ' 每段/积木图入口');
      const ids = [...doc.querySelectorAll('[id]')].map(node => node.id);
      equal(new Set(ids).size, ids.length, id + ' 页面 ID 唯一');
      equal([...doc.querySelectorAll('#lesson-body .block-figure svg')].map(node => node.outerHTML), beforeSVG, id + ' 纠错不修改积木图');
      equal(doc.querySelectorAll('.feedback-dialog').length, 1, id + ' 仅创建一个纠错窗口');
      for (const nodes of Object.values(targets)) {
        if (!nodes.length) continue;
        const node = nodes.at(-1), button = [...node.children].find(child => child.matches('.feedback-step-button'));
        button.click();
        ok(doc.querySelector('.feedback-dialog').open, id + ' 每类条目可以打开纠错窗口');
        ok(doc.querySelector('#feedback-position').textContent.includes(content.all[id].title), id + ' 弹窗带正确课程');
        doc.querySelector('.feedback-close').click();
      }
      equal(errors, [], id + ' DOM 运行无错误');
      report.dom.lessons++; report.dom.diagrams += beforeSVG.length; report.dom.buttons += doc.querySelectorAll('.feedback-step-button').length;
    } finally { dom.window.close(); }
    if (id % 20 === 19) { process.stdout.write('已核对全量课程 ' + (id + 1) + '/145\n'); if (global.gc) global.gc(); }
  }
  equal(report.dom.diagrams, 454, '454 个原积木图完整保留');
}
async function withPage(width, run) {
  const context = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 1000 }, reducedMotion: 'reduce', acceptDownloads: true, permissions: ['clipboard-read', 'clipboard-write'] });
  let closing = false, expectedFailure = false, interaction = false;
  await context.addInitScript(({ key, progressKey, record, progress, expectedOrigin }) => {
    if (location.origin !== expectedOrigin || localStorage.getItem('feedback-qa.initialized')) return;
    localStorage.setItem(key, JSON.stringify(record)); localStorage.setItem(progressKey, progress);
    localStorage.setItem('feedback-qa.unrelated', '保留'); localStorage.setItem('feedback-qa.initialized', '1');
  }, { key: KEY, progressKey: PROGRESS_KEY, record: learning, progress: legacyProgress, expectedOrigin: origin });
  await context.route('**/*', route => {
    const request = route.request(), url = request.url();
    if (!['GET', 'HEAD'].includes(request.method())) { report.submissions.push({ url, method: request.method() }); return route.abort('blockedbyclient'); }
    if (/^https?:/.test(url) && new URL(url).origin !== origin) { report.externalRequests.push(url); return route.abort('blockedbyclient'); }
    return route.continue();
  });
  const page = await context.newPage(); page.setDefaultTimeout(12000);
  page.on('pageerror', error => { if (!closing) report.pageErrors.push({ url: page.url(), message: error.message }); });
  page.on('request', request => { if (interaction && /^https?:/.test(request.url())) report.interactionRequests.push({ url: request.url(), method: request.method() }); });
  page.on('requestfailed', request => { if (!closing) (expectedFailure ? report.expectedResourceFailures : report.resourceFailures).push({ url: request.url(), error: request.failure()?.errorText }); });
  page.on('response', response => { if (!closing && response.status() >= 400) (expectedFailure ? report.expectedResourceFailures : report.resourceFailures).push({ url: response.url(), status: response.status() }); });
  try {
    await page.goto(base + 'login.html?next=' + encodeURIComponent('lesson.html?id=0'), { waitUntil: 'load' });
    await page.locator('#login-demo-tab').click(); await page.locator('#login-nickname').fill(learning.nickname);
    await page.locator('#login-demo-form button[type="submit"]').click();
    await page.waitForURL(url => url.pathname.endsWith('/lesson.html'));
    await ready(page);
    equal((await page.evaluate(() => EGG_SPACE.getState())).nickname, learning.nickname, '实际昵称登录隔离上下文');
    await run(page, context, { interaction: value => { interaction = value; }, expectedFailure: value => { expectedFailure = value; } });
    equal(await page.evaluate(key => localStorage.getItem(key), PROGRESS_KEY), legacyProgress, '原版学习记录保持');
    equal(await page.evaluate(() => localStorage.getItem('feedback-qa.unrelated')), '保留', '无关本机记录保持');
  } finally { closing = true; await context.close(); }
}
async function ready(page, expectFeedback = true) {
  await page.waitForFunction(() => document.querySelector('.lesson-article')?.getAttribute('aria-busy') === 'false');
  await page.waitForFunction(() => Boolean(document.querySelector('#space-lesson-tools')));
  if (expectFeedback) await page.waitForSelector('.recipe-step .microsteps .feedback-step-button');
}
async function visit(page, id, suffix = '', expectFeedback = true) {
  const response = await page.goto(base + 'lesson.html?id=' + id + suffix, { waitUntil: 'load' });
  if (response) equal(response.status(), 200, id + ' 页面返回 200');
  else equal(page.url(), base + 'lesson.html?id=' + id + suffix, id + ' 同页锚点跳转完成');
  await ready(page, expectFeedback);
}
async function snapshot(page) {
  return page.evaluate(() => ({ learning: EGG_SPACE.getState(), editor: [...document.querySelectorAll('.verification-grid article')].map(node => ({ status: node.dataset.checkStatus, text: node.textContent })), verification: document.querySelector('.course-verification').textContent, originalProgress: localStorage.getItem('eggcode-academy.learning-progress') }));
}
async function dimensions(page, name) {
  const value = await page.evaluate(() => { const d = document.querySelector('.feedback-dialog'); return { viewport: innerWidth, html: document.documentElement.scrollWidth, body: document.body.scrollWidth, dialog: d.open ? { client: d.clientWidth, scroll: d.scrollWidth, left: d.getBoundingClientRect().left, right: d.getBoundingClientRect().right, actions: [...d.querySelectorAll('.feedback-actions button')].map(button => ({ text: button.textContent, client: button.clientWidth, scroll: button.scrollWidth })) } : null }; });
  ok(value.html <= value.viewport + 1 && value.body <= value.viewport + 1, name + ' 页面无横向溢出 ' + JSON.stringify(value));
  if (value.dialog) ok(value.dialog.scroll <= value.dialog.client + 1 && value.dialog.left >= -1 && value.dialog.right <= value.viewport + 1, name + ' 报告窗口无横向溢出 ' + JSON.stringify(value));
  for (const button of value.dialog?.actions || []) ok(button.scroll <= button.client + 1, name + ' 报告按钮文字不越出边框 ' + JSON.stringify(button));
  return value;
}
async function browserCase(id, width) {
  await withPage(width, async (page, context, controls) => {
    await visit(page, id, '&from=feedback-qa&secret=应移除');
    const title = await page.locator('#lesson-title').innerText(), before = await snapshot(page);
    const trigger = page.locator('.recipe-step .microsteps > ol > li').first().locator(':scope > .feedback-step-button');
    const target = await trigger.evaluate(button => { const node = button.parentElement, copy = node.cloneNode(true); copy.querySelectorAll('button,figure,.logic-summary,.diagram-text').forEach(item => item.remove()); return { anchor: node.id, section: node.closest('.recipe-step').querySelector('h3').textContent.trim(), excerpt: copy.textContent.replace(/\s+/g, ' ').trim().slice(0, 1500) }; });
    controls.interaction(true);
    await trigger.click(); equal(await page.locator('#feedback-description').evaluate(node => document.activeElement === node), true, '打开窗口聚焦问题说明');
    equal(await page.locator('.feedback-dialog').evaluate(node => node.open), true, '真实原生 dialog 打开');
    const issue = { description: '<img src=x onerror="window.__feedbackXSS=1"> & "引号"\n实际输入 a < b 后连接顺序异常。', expected: '预期：分支执行一次 & 得分不重复。', actual: '实际：重复触发 <两次>。', editor: '移动端原点版 QA <2026.10.04>' };
    for (const [field, value] of Object.entries(issue)) await page.locator('#feedback-' + field).fill(value);
    await page.locator('#feedback-kind').selectOption({ label: '连接顺序' });
    await page.locator('#feedback-form button[type="submit"]').click();
    await page.waitForFunction(() => !document.querySelector('.feedback-output').hidden);
    equal(await page.evaluate(() => window.__feedbackXSS ?? null), null, 'HTML 特殊字符未执行');
    equal(await page.locator('.feedback-dialog img').count(), 0, '输入未产生 HTML 图片节点');
    const text = await page.locator('#feedback-text').inputValue(); ok(text.includes(issue.description), '文字报告保持完整特殊字符与换行');
    const downloadPromise = page.waitForEvent('download'); await page.locator('[data-feedback-download="json"]').click(); const download = await downloadPromise;
    const filename = 'lesson-' + id + '-' + width + '-report.json'; await download.saveAs(path.join(output, filename)); report.downloads.push(filename);
    const record = JSON.parse(fs.readFileSync(path.join(output, filename), 'utf8'));
    equal(record.status, 'not-submitted', '导出仍为尚未提交'); equal(record.lesson, { id, title }, '导出课程正确');
    equal(record.position.anchor, target.anchor, '导出微步锚点正确'); equal(record.position.section, target.section, '导出微步所属章节正确'); equal(record.position.excerpt, target.excerpt, '导出原文摘录正确');
    ok(Number.isInteger(record.position.item) && record.position.item > 0 && record.position.section.length > 0, '导出定位序号与章节完整');
    const url = new URL(record.position.url); equal(url.origin, origin, '报告链接同源'); equal(url.pathname, new URL('lesson.html', base).pathname, '链接课程页路径正确');
    equal([...url.searchParams.entries()], [['id', String(id)]], '报告 URL 仅保留课程 id'); equal(url.hash, '#' + target.anchor, '报告 URL 保留准确锚点');
    equal(record.issue, { kind: '连接顺序', ...issue }, 'JSON 文本原样保留');
    const txtPromise = page.waitForEvent('download'); await page.locator('[data-feedback-download="txt"]').click(); const txtDownload = await txtPromise;
    const txtFilename = 'lesson-' + id + '-' + width + '-report.txt'; await txtDownload.saveAs(path.join(output, txtFilename)); report.downloads.push(txtFilename);
    equal(fs.readFileSync(path.join(output, txtFilename), 'utf8'), text, 'TXT 下载与展示内容一致');
    await page.locator('[data-feedback-copy]').click();
    equal((await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, '\n'), text, '复制报告与展示内容一致（Windows 剪贴板换行归一化）');
    const responsive = await dimensions(page, id + '/' + width + ' 已生成报告');
    await page.locator('.feedback-output').scrollIntoViewIfNeeded();
    const screenshot = 'lesson-' + id + '-' + width + '-feedback.png'; await page.screenshot({ path: path.join(output, screenshot), animations: 'disabled' }); report.screenshots.push(screenshot);
    await page.locator('#feedback-description').fill('修改后的报告必须重新生成。');
    equal(await page.locator('.feedback-output').evaluate(node => node.hidden), true, '修改输入使旧报告失效'); equal(await page.locator('#feedback-text').inputValue(), '', '旧报告文本清空');
    await page.locator('.feedback-close').click(); await page.waitForFunction(() => !document.querySelector('.feedback-dialog').open);
    equal(await trigger.evaluate(node => document.activeElement === node), true, '关闭后焦点恢复原入口');
    await trigger.click();
    for (const field of Object.keys(issue)) equal(await page.locator('#feedback-' + field).inputValue(), '', '重新打开不带上一报告输入 ' + field);
    equal(await page.locator('#feedback-text').inputValue(), '', '重新打开不带上一报告输出');
    await page.keyboard.press('Escape'); await page.waitForFunction(() => !document.querySelector('.feedback-dialog').open);
    equal(await trigger.evaluate(node => document.activeElement === node), true, 'Esc 关闭也恢复原入口焦点');
    equal(await snapshot(page), before, '记录、导出、复制纠错不改变完成/收藏/笔记/editorStatus');
    controls.interaction(false);
    await page.goto(record.position.url, { waitUntil: 'load' }); await ready(page);
    await page.waitForFunction(anchor => { const node = document.getElementById(anchor), header = document.querySelector('.site-header').getBoundingClientRect(); const rect = node?.getBoundingClientRect(); return rect && rect.top >= header.bottom - 1 && rect.top < innerHeight - 50; }, target.anchor);
    const anchorPosition = await page.locator('#' + target.anchor).evaluate(node => ({ top: node.getBoundingClientRect().top, headerBottom: document.querySelector('.site-header').getBoundingClientRect().bottom }));
    ok(anchorPosition.top >= anchorPosition.headerBottom - 1, '直达微步锚点不被固定导航遮挡');
    // 验证报告可直达折叠的场景准备条目。
    const collapsedAnchor = await page.locator('.setup-object').last().locator('ol > li').last().getAttribute('id');
    await visit(page, id, '#' + collapsedAnchor);
    await page.waitForFunction(anchor => { const node = document.getElementById(anchor); return node?.closest('details').open && node.getBoundingClientRect().top >= document.querySelector('.site-header').getBoundingClientRect().bottom - 1; }, collapsedAnchor);
    const cleanResponsive = await dimensions(page, id + '/' + width + ' 直达准备步骤');
    report.browserCases.push({ id, width, title, anchor: target.anchor, collapsedAnchor, responsive, cleanResponsive, anchorPosition, passed: true });
  });
}
async function loaderRecovery() {
  await withPage(390, async (page, context, controls) => {
    const pattern = '**/lesson-feedback.js*', handler = route => route.abort('failed');
    controls.expectedFailure(true); await page.route(pattern, handler); await visit(page, 40, '', false);
    equal(await page.locator('#retry-lesson').count(), 0, '纠错脚本失败不误报课程失败'); ok(await page.locator('.microsteps').count() > 0, '纠错脚本失败仍能阅读完整课程');
    ok((await page.locator('#lesson-body').innerText()).includes('纠错工具暂时未加载'), '纠错资源失败有明确降级提示');
    await page.unroute(pattern, handler); controls.expectedFailure(false); await page.reload({ waitUntil: 'load' }); await ready(page);
    equal(await page.locator('.feedback-dialog').count(), 1, '纠错资源恢复后正常挂载一次');
  });
}
(async () => {
  fs.mkdirSync(output, { recursive: true });
  if (!live && !responsiveOnly) await test('145 课真实步骤入口、定位 ID 与 454 个积木图', checkAllLessons);
  browser = await chromium.launch({ headless: true, executablePath, ...(process.env.EGG_QA_PROXY ? { proxy: { server: process.env.EGG_QA_PROXY } } : {}) });
  for (const width of responsiveOnly ? [390] : [390, 1440]) for (const id of [0, 40, 144]) await test('真实浏览器课程 ' + id + ' / ' + width, () => browserCase(id, width));
  if (!live) await test('320px 代表课程的报告与深链', () => browserCase(40, 320));
  if (!live && !responsiveOnly) await test('纠错资源加载失败降级与恢复', loaderRecovery);
  await test('无网络提交、资源错误与验证状态变更', async () => {
    equal(report.pageErrors, [], '页面执行无错误'); equal(report.resourceFailures, [], '正常资源无加载错误'); equal(report.submissions, [], '没有后台写入请求'); equal(report.externalRequests, [], '没有外部请求'); equal(report.interactionRequests, [], '记录与导出过程无后台请求'); equal(sha(read('verification-report.json')), originalVerification, '验证文件与全部 editorStatus 保持原样');
  });
})().catch(error => { report.checks.push({ name: '检查脚本执行', passed: false, error: error.message, stack: error.stack }); console.error(error.stack); }).finally(async () => {
  if (browser) await browser.close(); report.finishedAt = new Date().toISOString(); report.passed = report.checks.every(check => check.passed);
  fs.mkdirSync(output, { recursive: true }); fs.writeFileSync(path.join(output, responsiveOnly ? 'responsive-results.json' : live ? 'live-results.json' : 'results.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ passed: report.passed, checks: report.checks.length, assertions: report.assertions, dom: report.dom, browserCases: report.browserCases.length, output }, null, 2));
  if (!report.passed) process.exitCode = 1;
});
