'use strict';
// 可重跑的真实 Edge 验收；只使用新上下文中的本机演示状态。
// $env:NODE_PATH='C:/Users/ASUS/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'; node scripts/check-login-browser.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require('playwright');
const base = (process.argv[2] || 'http://127.0.0.1:4178/site/').replace(/\/?$/, '/');
const output = path.resolve(process.argv[3] || path.join(__dirname, '..', '..', 'qa', 'login'));
const origin = new URL(base).origin;
const executablePath = process.env.EGG_QA_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const KEY = 'eggcode-academy.space-preview.v1';
const PROGRESS_KEY = 'eggcode-academy.learning-progress';
const original = JSON.stringify({version: 1, completed: [22, 70, 144], lastLesson: 70});
const stored = {version: 1, active: false, nickname: '林间创作者', completed: [0, 70, 144], favorites: [22, 40], notes: [{lessonId: 40, content: '原笔记：物品类型修改后，核对初始化长度与索引。', updatedAt: '2026-10-02T08:00:00.000Z'}], feedback: [{id: 'qa-feedback', lessonId: 40, type: 'content', content: '原反馈记录保留，用于确认登录没有清空资料。', createdAt: '2026-10-02T08:00:00.000Z'}], lastLesson: 70};
const report = {startedAt: new Date().toISOString(), base, browser: executablePath, checks: [], pageErrors: [], resourceFailures: [], blockedSubmissions: [], externalRequests: [], responsive: [], screenshots: [], databaseValidated: false};
let browser, assertions = 0;
const equal = (actual, expected, message) => { assert.deepEqual(actual, expected, message); assertions++; };
const ok = (condition, message) => { assert.ok(condition, message); assertions++; };
const state = page => page.evaluate(() => window.EGG_SPACE.getState());
async function test(name, callback) {
  try { await callback(); report.checks.push({name, status: 'passed'}); console.log('通过：' + name); }
  catch (error) { report.checks.push({name, status: 'failed', error: error.message, stack: error.stack}); console.error('失败：' + name + '\n' + error.message); }
}
async function withPage(options, callback) {
  const context = await browser.newContext({viewport: options.viewport || {width:1440, height:1000}, reducedMotion: 'reduce'});
  let closing = false;
  await context.addInitScript(({key, progressKey, progress, record, storage}) => {
    const native = window.localStorage;
    if (!native.getItem('login-browser-check.initialized')) {
      native.setItem(progressKey, progress);
      native.setItem('login-browser-check.unrelated', '保留');
      if (record !== undefined) native.setItem(key, record);
      native.setItem('login-browser-check.initialized', '1');
    }
    window.__qaReadStorage = name => native.getItem(name);
    if (storage === 'blocked') Object.defineProperty(window, 'localStorage', {configurable: true, get() { throw new DOMException('验收模拟存储访问受阻', 'SecurityError'); }});
    if (storage === 'quota') Storage.prototype.setItem = function () { throw new DOMException('验收模拟存储写入失败', 'QuotaExceededError'); };
  }, {key: KEY, progressKey: PROGRESS_KEY, progress: original, record: options.record, storage: options.storage});
  // 登录验收不允许提交网络请求或加载外部依赖。
  await context.route('**/*', route => {
    const request = route.request();
    if (!['GET', 'HEAD'].includes(request.method())) { report.blockedSubmissions.push({url:request.url(), method:request.method()}); return route.abort('blockedbyclient'); }
    if (/^https?:/.test(request.url()) && new URL(request.url()).origin !== origin) { report.externalRequests.push(request.url()); return route.abort('blockedbyclient'); }
    return route.continue();
  });
  const page = await context.newPage(); page.setDefaultTimeout(8000);
  page.on('pageerror', error => { if (!closing) report.pageErrors.push({url:page.url(), message:error.message}); });
  page.on('requestfailed', request => { if (!closing) report.resourceFailures.push({url:request.url(), error:request.failure()?.errorText}); });
  page.on('response', response => { if (!closing && response.status() >= 400) report.resourceFailures.push({url:response.url(), status:response.status()}); });
  try { await callback(page); } finally { closing = true; await context.close(); }
}
async function visit(page, file = 'login.html') {
  const response = await page.goto(base + file, {waitUntil:'load'});
  equal(response.status(), 200, '页面返回 200');
  await page.waitForFunction(() => Boolean(window.EGG_SPACE));
}
async function submit(page, nickname = '林间创作者', destination = 'personal-space.html') {
  await page.locator('#login-nickname').fill(nickname);
  await page.locator('#login-demo-form button[type="submit"]').click();
  await page.waitForURL(base + destination, {waitUntil:'load'});
  await page.waitForFunction(() => Boolean(window.EGG_SPACE));
}
function retained(actual) {
  for (const key of ['completed', 'favorites', 'notes', 'feedback']) equal(actual[key], stored[key], '登录保留已有 ' + key);
}
async function screenshot(page, filename) {
  equal((await state(page)).nickname, '林间创作者', '设计截图使用默认昵称');
  equal(await page.locator('#login-nickname').inputValue(), '林间创作者', '设计截图使用干净表单');
  equal(await page.locator('#login-error').innerText(), '', '设计截图不含校验错误或安全测试字符串');
  await page.screenshot({path:path.join(output, filename), fullPage:false, animations:'disabled'}); report.screenshots.push(filename);
}

(async () => {
  fs.mkdirSync(output, {recursive:true});
  browser = await chromium.launch({headless:true, executablePath});
  await test('默认活动体验账号仍可查看登录页，不自动跳转或写入', () => withPage({}, async page => {
    await visit(page);
    equal(new URL(page.url()).pathname, new URL(base + 'login.html').pathname, '默认账号不自动离开登录页');
    equal((await state(page)).active, true, '默认体验账号活动');
    equal(await page.locator('#login-nickname').inputValue(), '林间创作者', '表单显示默认昵称');
    equal(await page.locator('#login-demo-panel').isVisible(), true, '默认展示体验登录');
    equal(await page.evaluate(key => localStorage.getItem(key), KEY), null, '只查看不会写演示记录');
    equal(await page.locator('#login-demo-tab').getAttribute('aria-selected'), 'true', '体验 tab 选中');
  }));
  await test('昵称空白及 21 字拒绝，错误关联输入并恢复焦点', () => withPage({}, async page => {
    await visit(page);
    for (const nickname of ['', '   ', '字'.repeat(21)]) {
      await page.locator('#login-nickname').fill(nickname); await page.locator('#login-demo-form button[type="submit"]').click();
      equal(new URL(page.url()).pathname, new URL(base + 'login.html').pathname, '无效昵称保留登录页');
      ok((await page.locator('#login-error').innerText()).includes('1 至 20'), '显示明确的昵称边界');
      equal(await page.locator('#login-nickname').getAttribute('aria-invalid'), 'true', '输入标记错误');
      equal(await page.locator('#login-nickname').evaluate(node => document.activeElement === node), true, '无效输入恢复焦点');
      equal(await page.evaluate(key => localStorage.getItem(key), KEY), null, '校验失败不写记录');
    }
    await page.locator('#login-nickname').fill('林间创作者');
    equal(await page.locator('#login-error').innerText(), '', '重新输入清除错误');
    equal(await page.locator('#login-nickname').getAttribute('aria-invalid'), null, '重新输入清除错误标记');
  }));
  await test('20 个 Unicode 字符可登录，首尾空白去除', () => withPage({}, async page => {
    await visit(page); const nickname = '😀'.repeat(20);
    await submit(page, nickname); equal((await state(page)).nickname, nickname, '20 个 emoji 按字符计数');
    await visit(page); await submit(page, '  林间创作者  '); equal((await state(page)).nickname, '林间创作者', '昵称去除首尾空白');
  }));
  await test('昵称按纯文本显示，不生成 HTML 或执行事件', () => withPage({}, async page => {
    await visit(page); const nickname = '<svg/onload=x=1>';
    await submit(page, nickname); equal(await page.locator('#space-nickname').innerText(), nickname, '昵称原样作为纯文本');
    equal(await page.locator('#space-nickname svg').count(), 0, '昵称未生成 SVG 节点');
    equal(await page.evaluate(() => window.x ?? null), null, '昵称没有执行事件');
  }));
  await test('登录回指定个人栏目，保存昵称并保留既有资料和原版键', () => withPage({record:JSON.stringify(stored)}, async page => {
    await visit(page, 'login.html?next=' + encodeURIComponent('personal-space.html#notes'));
    await submit(page, '林间创作者', 'personal-space.html#notes');
    const value = await state(page); retained(value); equal(value.active, true, '登录激活体验账号'); equal(value.lastLesson, 70, '个人栏目登录不改最近阅读');
    equal(await page.locator('[data-space-section="notes"]').getAttribute('aria-current'), 'page', '回跳原笔记栏目');
    await page.reload({waitUntil:'load'}); retained(await state(page));
    equal(await page.evaluate(key => localStorage.getItem(key), PROGRESS_KEY), original, '原版学习进度键未改变');
    equal(await page.evaluate(() => localStorage.getItem('login-browser-check.unrelated')), '保留', '无关记录未改变');
  }));
  await test('退出后游客入口到登录页，再回原收藏分区', () => withPage({record:JSON.stringify({...stored, active:true})}, async page => {
    await visit(page, 'personal-space.html#favorites');
    await page.locator('.space-sidebar [data-space-action="logout"]').click(); equal((await state(page)).active, false, '退出成功');
    equal(await page.locator('#space-view [data-course-id]').count(), 0, '退出后隐藏个人收藏');
    await page.locator('#space-view .space-list-empty a').click(); await page.waitForURL(url => url.pathname.endsWith('/login.html'));
    equal(new URL(page.url()).searchParams.get('next'), 'personal-space.html#favorites', '游客入口带原收藏分区');
    await submit(page, '林间创作者', 'personal-space.html#favorites'); retained(await state(page));
    equal(await page.locator('[data-space-section="favorites"]').getAttribute('aria-current'), 'page', '登录回收藏栏目');
  }));
  await test('课程游客收藏到登录，再回原课，收藏状态不自动切换', () => withPage({record:JSON.stringify(stored)}, async page => {
    await visit(page, 'lesson.html?id=40'); await page.waitForSelector('#space-lesson-tools');
    await page.waitForFunction(() => document.querySelector('.lesson-article')?.getAttribute('aria-busy') === 'false');
    const before = await state(page);
    await page.locator('#space-lesson-tools [data-space-action="favorite"]').click(); await page.waitForURL(url => url.pathname.endsWith('/login.html'));
    equal(new URL(page.url()).searchParams.get('next'), 'lesson.html?id=40', '收藏入口带原课程');
    equal((await state(page)).favorites, before.favorites, '进入登录页前未改变收藏');
    await submit(page, '林间创作者', 'lesson.html?id=40'); await page.waitForSelector('#space-lesson-tools'); retained(await state(page));
    equal(await page.locator('#space-lesson-tools [data-space-action="favorite"]').getAttribute('aria-pressed'), 'true', '回原课仍保留原收藏状态');
    equal((await state(page)).lastLesson, 40, '正常回课记录阅读位置');
  }));
  await test('无课程编号的游客入口补全 id=0，登录后回第 0 课', () => withPage({record:JSON.stringify(stored)}, async page => {
    await visit(page, 'lesson.html'); await page.waitForSelector('#space-lesson-tools');
    await page.locator('#space-lesson-tools a[href^="login.html"]').click(); await page.waitForURL(url => url.pathname.endsWith('/login.html'));
    equal(new URL(page.url()).searchParams.get('next'), 'lesson.html?id=0', '默认课程入口显式补全零号课');
    await submit(page, '林间创作者', 'lesson.html?id=0'); await page.waitForSelector('#space-lesson-tools');
    equal((await state(page)).lastLesson, 0, '登录成功回零号课程'); retained(await state(page));
  }));
  await test('邮箱 tab 可通过键盘切换，字段和提交按钮禁用', () => withPage({}, async page => {
    await visit(page); await page.locator('#login-demo-tab').focus(); await page.keyboard.press('ArrowRight');
    equal(await page.locator('#login-email-tab').getAttribute('aria-selected'), 'true', '向右选择邮箱');
    equal(await page.locator('#login-email-tab').evaluate(node => document.activeElement === node), true, '焦点移到邮箱 tab');
    equal(await page.locator('#login-email-panel').isVisible(), true, '邮箱说明可见');
    equal(await page.locator('#login-demo-panel').isVisible(), false, '体验面板隐藏');
    for (const selector of ['#login-email', '#login-password', '.login-email-fields button']) equal(await page.locator(selector).isDisabled(), true, '邮箱预览控件禁用');
    await page.keyboard.press('Tab'); equal(await page.evaluate(() => document.activeElement.id), 'login-email-panel', '键盘可读取邮箱说明');
    await page.keyboard.press('Tab'); ok(!['login-email', 'login-password'].includes(await page.evaluate(() => document.activeElement.id)), 'Tab 跳过禁用凭据字段');
    for (const [key, selected] of [['Home','login-demo-tab'], ['End','login-email-tab'], ['ArrowRight','login-demo-tab'], ['ArrowLeft','login-email-tab']]) {
      await page.locator('[role="tab"][aria-selected="true"]').focus(); await page.keyboard.press(key);
      equal(await page.locator('#' + selected).getAttribute('aria-selected'), 'true', key + ' 切换正确');
    }
    await page.locator('#login-demo-tab').focus(); await page.keyboard.press('Enter'); equal(await page.locator('#login-demo-panel').isVisible(), true, 'Enter 可激活体验 tab');
    equal(await page.evaluate(key => localStorage.getItem(key), KEY), null, '切换邮箱不保存数据');
  }));
  await test('同源绝对回跳与课程边界 0、144 正常接受', async () => {
    for (const destination of ['personal-space.html#settings', 'lesson.html?id=0', 'lesson.html?id=144']) await withPage({}, async page => {
      await visit(page, 'login.html?next=' + encodeURIComponent(base + destination)); await submit(page, '林间创作者', destination);
      equal(new URL(page.url()).origin, origin, '有效回跳保留当前来源');
      if (destination.startsWith('lesson')) await page.waitForSelector('#space-lesson-tools');
    });
  });
  await test('外部地址、其他协议、目录和非法课程回跳默认空间', async () => {
    for (const next of ['https://example.com/lesson.html?id=40', '//example.com/personal-space.html', 'javascript:alert(1)', 'data:text/html,login', '../personal-space.html', 'login.html', 'courses.html', 'lesson.html', 'lesson.html?id=-1', 'lesson.html?id=145', 'lesson.html?id=1.5', 'lesson.html?id=abc', 'http://[bad']) await withPage({}, async page => {
      await visit(page, 'login.html?next=' + encodeURIComponent(next)); await submit(page);
      equal(page.url(), base + 'personal-space.html', '非法 next 回默认空间：' + next);
    });
  });
  await test('存储访问受阻和写入失败时不跳走，原记录保留', async () => {
    const record = JSON.stringify(stored);
    for (const storage of ['blocked', 'quota']) await withPage({record, storage}, async page => {
      await visit(page); const url = page.url();
      await page.locator('#login-demo-form button[type="submit"]').click();
      equal(page.url(), url, storage + ' 保留登录页'); equal((await state(page)).storageMode, 'temporary', storage + ' 标记临时存储');
      equal(await page.locator('#login-storage-warning').isVisible(), true, '存储提示可见');
      ok((await page.locator('#login-error').innerText()).includes('暂时无法继续登录'), '不能持久保存时解释无法继续');
      equal(await page.evaluate(key => window.__qaReadStorage(key), KEY), record, '受阻或写入失败不破坏原记录');
      equal(await page.evaluate(key => window.__qaReadStorage(key), PROGRESS_KEY), original, '原版学习键保留');
    });
  });
  await test('未知版本和损坏记录保护：临时登录不跳且原值不覆盖', async () => {
    for (const record of [JSON.stringify({...stored, version:99}), '{broken']) await withPage({record}, async page => {
      await visit(page); const url = page.url(); equal((await state(page)).storageMode, 'temporary', '初始记录保护开启');
      await page.locator('#login-demo-form button[type="submit"]').click();
      equal(page.url(), url, '保护模式不跳走'); equal(await page.locator('#login-storage-warning').isVisible(), true, '保护说明可见');
      equal(await page.evaluate(key => localStorage.getItem(key), KEY), record, '未知/损坏原记录保留');
      ok((await page.locator('#login-error').innerText()).includes('暂时无法继续登录'), '保护模式解释登录结果');
    });
  });
  await test('320 / 375 / 390 / 768 / 1280 / 1440 两 tab 响应式及干净设计截图', () => withPage({}, async page => {
    await visit(page);
    for (const viewport of [{width:320,height:812}, {width:375,height:812}, {width:390,height:844}, {width:768,height:1024}, {width:1280,height:900}, {width:1440,height:1000}]) {
      await page.setViewportSize(viewport);
      for (const tab of ['demo', 'email']) {
        await page.locator('#login-' + tab + '-tab').click(); await page.evaluate(() => scrollTo({top:0, behavior:'instant'}));
        const measurements = await page.evaluate(tab => {
          const panel = document.getElementById('login-' + tab + '-panel'), input = panel.querySelector('input'), button = panel.querySelector('button');
          const box = button.getBoundingClientRect();
          return {scrollWidth:document.documentElement.scrollWidth, bodyWidth:document.body.scrollWidth, viewportWidth:innerWidth, viewportHeight:innerHeight, inputFontSize:parseFloat(getComputedStyle(input).fontSize), cta:{top:box.top, bottom:box.bottom, left:box.left, right:box.right, height:box.height}, obscured:tab === 'demo' && !button.contains(document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2))};
        }, tab);
        report.responsive.push({tab, ...viewport, ...measurements});
        ok(measurements.scrollWidth <= viewport.width + 1 && measurements.bodyWidth <= viewport.width + 1, `${viewport.width} ${tab} 无横向滚动：${JSON.stringify(measurements)}`);
        ok(measurements.inputFontSize >= 16, `${viewport.width} ${tab} 输入字号至少 16px`);
        ok(measurements.cta.height >= 44 && measurements.cta.left >= 0 && measurements.cta.right <= viewport.width, `${viewport.width} ${tab} CTA 触控高度至少 44px 且完整显示`);
        if (tab === 'demo' && [375,390].includes(viewport.width)) ok(measurements.cta.top >= 0 && measurements.cta.bottom <= viewport.height && !measurements.obscured, `${viewport.width} 体验 CTA 首屏可见且未遮挡`);
        await screenshot(page, `login-${tab}-${viewport.width}x${viewport.height}.png`);
      }
    }
  }));
  await test('登录无真实网络提交、外部依赖、页面错误或资源失败', async () => {
    const source = fs.readFileSync(path.join(__dirname, '..', 'login.js'), 'utf8');
    equal(/\b(?:fetch|XMLHttpRequest|sendBeacon|WebSocket)\s*\(/.test(source), false, '登录脚本没有网络调用');
    equal(report.blockedSubmissions, [], '没有尝试真实网络提交'); equal(report.externalRequests, [], '没有外部依赖或外部跳转请求');
    equal(report.pageErrors, [], '页面错误为零'); equal(report.resourceFailures, [], '资源失败为零');
  });
  report.assertions = assertions; report.finishedAt = new Date().toISOString();
  report.passed = report.checks.filter(item => item.status === 'passed').length; report.failed = report.checks.filter(item => item.status === 'failed').length;
  fs.writeFileSync(path.join(output, 'login-browser-results.json'), JSON.stringify(report, null, 2));
  console.log(`${report.failed ? 'FAIL' : 'PASS'} 真实 Edge 登录页：${report.passed}/${report.checks.length} 场景，${assertions} 项断言；${report.responsive.length} 个响应式组合，${report.pageErrors.length} 页面错误，${report.resourceFailures.length} 资源失败。`);
  if (report.failed) process.exitCode = 1;
})().catch(error => {
  report.fatalError = error.stack; report.finishedAt = new Date().toISOString(); fs.mkdirSync(output, {recursive:true});
  fs.writeFileSync(path.join(output, 'login-browser-results.json'), JSON.stringify(report, null, 2)); console.error(error.stack); process.exitCode = 1;
}).finally(async () => { if (browser) await browser.close(); });
