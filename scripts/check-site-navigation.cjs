'use strict';
// 导航验收仅使用隔离浏览器和本机昵称登录，不接触用户浏览器或真实云端。
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const base = (process.argv[2] || 'http://127.0.0.1:4178/site/').replace(/\/?$/, '/');
const origin = new URL(base).origin;
const output = path.resolve(__dirname, '../../qa/top-tabs');
const site = path.resolve(__dirname, '..');
const pages = fs.readdirSync(site).filter(file => file.endsWith('.html') && file !== 'login.html');
const report = { realCloudValidated: false, startedAt: new Date().toISOString(), checks: [], assertions: 0, layouts: [], screenshots: [], pageErrors: [], consoleErrors: [], httpErrors: [], externalRequests: [] };
// 修复后只重跑上次失败项，保存首轮证据；常规运行仍覆盖全部页面。
const previousPath = path.join(output, 'results.json');
const previous = (process.env.NAVIGATION_RECHECK === '1' || process.env.TOP_TABS_FLOW_RECHECK === '1') && fs.existsSync(previousPath) ? JSON.parse(fs.readFileSync(previousPath, 'utf8')) : null;
const retryNames = previous ? new Set(previous.checks.filter(check => !check.passed || process.env.TOP_TABS_FLOW_RECHECK === '1' && check.name.includes('首页至社区与学习的真实导航链')).map(check => check.name).concat('脚本资源与云端隔离')) : null;
if (previous) {
  fs.writeFileSync(path.join(output, 'previous-results.json'), JSON.stringify(previous, null, 2));
  report.checks = previous.checks.filter(check => !retryNames.has(check.name));
  report.layouts = previous.layouts;
  report.screenshots = previous.screenshots;
  report.previousAttemptAssertions = previous.assertions;
  report.previousPassedChecks = report.checks.length;
}
let browser, currentPage;
function ok(value, message) { assert.ok(value, message); report.assertions++; }
async function test(name, run) {
  if (retryNames && !retryNames.has(name)) return;
  try { await run(); report.checks.push({ name, passed: true }); console.log('通过：' + name); }
  catch (error) {
    report.checks.push({ name, passed: false, error: error.message }); console.error('失败：' + name + '\n' + error.stack);
    if (currentPage && !currentPage.isClosed()) await currentPage.screenshot({ path: path.join(output, 'failure-' + report.checks.length + '.png'), animations: 'disabled' }).catch(() => {});
  }
}
async function session(width = 1440) {
  const context = await browser.newContext({ viewport: { width, height: width < 500 ? 844 : 1000 }, reducedMotion: 'reduce' });
  await context.route('**/*', route => {
    const request = route.request(), url = new URL(request.url());
    if (['http:', 'https:'].includes(url.protocol) && (url.origin !== origin || !['GET', 'HEAD'].includes(request.method()))) {
      report.externalRequests.push(request.method() + ' ' + url.href); return route.abort();
    }
    return route.continue();
  });
  context.on('page', page => {
    page.setDefaultTimeout(10000);
    page.on('pageerror', error => report.pageErrors.push({ url: page.url(), error: error.message }));
    page.on('console', message => { if (message.type() === 'error') report.consoleErrors.push({ url: page.url(), error: message.text() }); });
    page.on('response', response => { if (response.status() >= 400) report.httpErrors.push({ url: response.url(), status: response.status() }); });
    page.on('dialog', dialog => dialog.accept());
  });
  const page = await context.newPage(); currentPage = page;
  return { context, page, close: () => context.close() };
}
async function ready(page) {
  await page.waitForFunction(() => !document.documentElement.hasAttribute('data-access-pending'));
  await page.waitForFunction(() => !document.querySelector('[aria-busy="true"]'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(100);
}
async function visit(page, file) { await page.goto(base + file, { waitUntil: 'load' }); await ready(page); ok(!page.url().includes('/login.html'), '已登录业务页可访问'); }
async function login(page) {
  await page.goto(base + 'login.html?next=index.html');
  await page.locator('#login-nickname').fill('导航验收创作者');
  await page.locator('#login-demo-form button[type="submit"]').click();
  await page.waitForURL(base + 'index.html'); await ready(page);
  ok(true, '通过真实昵称表单进入本机体验');
}
async function seed(page) {
  await visit(page, 'community.html');
  await page.locator('[data-seed-examples]').click();
  await page.locator('.common-tutorial-row').first().waitFor();
  return page.locator('.common-tutorial-row h2 a').first().getAttribute('href');
}
async function capture(page, name) {
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await page.screenshot({ path: path.join(output, name), animations: 'disabled' }); if (!report.screenshots.includes(name)) report.screenshots.push(name);
}
// 从 DOM 语义和实际定位识别导航，不依赖按钮配色或特定 DOM 层数。
async function metrics(page) {
  return page.evaluate(() => {
    const rect = el => { const r = el.getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height }; };
    const visible = el => !!el && !!el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden' && getComputedStyle(el).display !== 'none' && +getComputedStyle(el).opacity !== 0;
    const link = el => {
      const r = rect(el), center = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return { text: el.textContent.trim(), href: el.getAttribute('href'), current: el.getAttribute('aria-current'), rect: r, hit: !!center && (center === el || el.contains(center)) };
    };
    const header = document.querySelector('header.site-header, header.common-header');
    const navs = [...document.querySelectorAll('nav')].filter(visible);
    const bottom = navs.find(el => getComputedStyle(el).position === 'fixed' && rect(el).top > innerHeight / 2);
    return {
      width: innerWidth, height: innerHeight, documentWidth: document.documentElement.scrollWidth, bodyWidth: document.body.scrollWidth,
      header: header ? { rect: rect(header), links: [...header.querySelectorAll('a')].filter(visible).map(link) } : null,
      mainNavs: navs.filter(el => header?.contains(el)).map(el => ({ label: el.getAttribute('aria-label'), links: [...el.querySelectorAll('a')].filter(visible).map(link) })),
      bottom: bottom ? { rect: rect(bottom), scrollWidth: bottom.scrollWidth, clientWidth: bottom.clientWidth, links: [...bottom.querySelectorAll('a')].filter(visible).map(link) } : null,
      heading: document.querySelector('main h1')?.textContent.trim() || ''
    };
  });
}
function available(links, file) { return links.find(link => link.href?.split(/[?#]/)[0] === file && link.hit && link.rect.width >= 40 && link.rect.height >= 40); }
async function inspect(page, file, width) {
  const m = await metrics(page); report.layouts = report.layouts.filter(row => row.file !== file || row.width !== width); report.layouts.push({ file, ...m });
  ok(m.documentWidth <= width + 1 && m.bodyWidth <= width + 1, file + ' 无横向溢出');
  ok(m.heading.length > 0, file + ' 有清晰主标题');
  ok(!!m.header, file + ' 有统一头部');
  const top = m.mainNavs.find(nav => nav.label === '主导航');
  ok(top?.links.length === 7, file + ' 顶部统一展示七个栏目');
  ok(top.links.every(link => link.hit && link.rect.height >= 44 && link.rect.left >= 0 && link.rect.right <= width + 1), file + ' 顶部七项完整显示且均可点击');
  ok(['courses.html','practice.html','manual.html','community.html','works.html','contribute.html','messages.html'].every(route => available(top.links, route)), file + ' 学习与社区入口在顶部一击可达');
  ok(available(m.header.links, 'contribute.html'), file + ' 顶部投稿入口直接可见且可点击');
  if (width <= 900) {
    ok(!!m.bottom, file + ' 手机/平板有固定底部导航');
    ok(m.bottom.links.length === 5, file + ' 底部固定五项');
    ok(m.bottom.scrollWidth <= m.bottom.clientWidth + 1, file + ' 底部导航不横向滚动');
    ok(m.bottom.links.every(link => link.hit && link.rect.height >= 44 && link.rect.left >= 0 && link.rect.right <= width + 1), file + ' 五项都完整显示且触摸区域足够');
    ok(available(m.bottom.links, 'community.html'), file + ' 教程广场在底栏一击可达');
    ok(m.bottom.links.filter(link => link.current).length === (file === 'service-info.html' ? 0 : 1), file + ' 底部仅标记已列出的当前栏目');
  } else {
    const links = m.mainNavs.flatMap(nav => nav.links);
    ok(available(links, 'community.html'), file + ' 桌面主导航直接展示教程广场');
    ok((file === 'service-info.html' || m.header.links.some(link => link.current)) && links.filter(link => link.current).length <= 1, file + ' 桌面已列出的当前栏目高亮，独立说明页不误标栏目');
    ok(!m.bottom, file + ' 桌面不重复显示底部导航');
  }
  await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await page.waitForTimeout(30);
  const scrolled = await metrics(page);
  ok(available(scrolled.header.links, 'contribute.html'), file + ' 滚动后投稿入口仍可点击');
  const links = width <= 900 ? scrolled.bottom?.links : scrolled.mainNavs.flatMap(nav => nav.links);
  ok(available(links || [], 'community.html'), file + ' 滚动后教程广场仍可点击');
  if (scrolled.bottom) {
    const end = await page.locator('main').evaluate(el => el.getBoundingClientRect().bottom);
    ok(end <= scrolled.bottom.rect.top + 1, file + ' 正文末尾可滚至底栏上方');
  }
}
async function clickVisible(page, selector, expected) {
  const candidates = page.locator(selector);
  let clicked = false;
  for (let i = 0; i < await candidates.count(); i++) if (await candidates.nth(i).isVisible()) { await candidates.nth(i).click(); clicked = true; break; }
  ok(clicked, '存在可见入口 ' + selector);
  await page.waitForURL(url => url.pathname.endsWith('/' + expected)); await ready(page);
  ok(true, '真实点击到达 ' + expected);
}
(async () => {
  fs.mkdirSync(output, { recursive: true });
  browser = await chromium.launch({ executablePath: process.env.EGG_QA_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  try {
    for (const width of [320, 390, 768, 1024, 1440]) {
      const s = await session(width);
      try {
        await login(s.page); const detail = await seed(s.page);
        await visit(s.page, 'manual.html'); const block = await s.page.locator('#manual-results a[href*="block.html"]').first().getAttribute('href');
        for (const file of pages) await test(width + 'px · ' + file, async () => {
          currentPage = s.page;
          await visit(s.page, file === 'lesson.html' ? 'lesson.html?id=40' : file === 'community-tutorial.html' ? detail : file === 'block.html' ? block : file);
          await inspect(s.page, file, width);
          if ([390, 1440].includes(width) && ['index.html', 'community.html', 'works.html'].includes(file)) await capture(s.page, file.replace('.html', '') + '-' + width + '.png');
        });
      } finally { await s.close(); }
    }
    for (const width of [390, 1440]) await test(width + 'px · 首页至社区与学习的真实导航链', async () => {
      const s = await session(width); currentPage = s.page;
      try {
        await login(s.page);
        await clickVisible(s.page, 'main a[href="community.html"]', 'community.html');
        ok((await s.page.locator('main h1').innerText()).includes('教程广场'), '教程广场标题直接说明位置');
        await clickVisible(s.page, 'header a[href="works.html"]', 'works.html');
        ok((await s.page.locator('main h1').innerText()).includes('作品'), '作品页标题直接说明位置');
        await clickVisible(s.page, 'header a[href="contribute.html"]', 'contribute.html');
        await clickVisible(s.page, 'a[href="messages.html"]', 'messages.html');
        ok((await s.page.locator('main h1').innerText()).includes('消息'), '消息页标题直接说明位置');
        await clickVisible(s.page, 'a[href="courses.html"]', 'courses.html');
        await clickVisible(s.page, 'header a[href="contribute.html#drafts"]', 'contribute.html');
        ok(new URL(s.page.url()).hash === '#drafts', '我的投稿进入草稿区');
        ok(await s.page.locator('.hub-primary a[href="contribute.html#drafts"]').getAttribute('aria-current') === 'page', '草稿区高亮我的投稿');
        await s.page.locator('[data-post-action="new-post"]').click();
        await s.page.waitForURL(url => url.hash === '#editor');
        ok(await s.page.locator('#contribute-editor-panel').isVisible(), '新建后展示编辑面板');
        ok(await s.page.locator('.hub-publish').getAttribute('aria-current') === 'page', '草稿列表新建后同步高亮投稿按钮');
        ok(await s.page.locator('.hub-primary a[href="contribute.html#drafts"]').getAttribute('aria-current') === null, '新建后取消我的投稿高亮');
        await s.page.locator('#post-title').fill('顶部标签回归草稿');
        await s.page.locator('#contribute-save').click();
        await s.page.waitForFunction(() => document.querySelector('#contribute-save-status').textContent.includes('草稿已保存'));
        await clickVisible(s.page, 'header a[href="contribute.html#drafts"]', 'contribute.html');
        await s.page.locator('[data-post-action="edit-post"]').click();
        await s.page.waitForURL(url => url.hash === '#editor');
        ok(await s.page.locator('.hub-publish').getAttribute('aria-current') === 'page', '继续编辑后同步高亮投稿按钮');
        ok(await s.page.locator('.hub-primary a[href="contribute.html#drafts"]').getAttribute('aria-current') === null, '继续编辑后取消我的投稿高亮');
        await clickVisible(s.page, 'header a[href="contribute.html#drafts"]', 'contribute.html');
        await clickVisible(s.page, 'header .hub-publish', 'contribute.html');
        ok(await s.page.locator('.hub-publish').getAttribute('aria-current') === 'page', '写教程高亮投稿按钮');
        ok(await s.page.locator('.hub-primary a[href="contribute.html#drafts"]').getAttribute('aria-current') === null, '离开草稿区清除标签高亮');
      } finally { await s.close(); }
    });
    await test('手机文本编辑与缩小视窗时底栏让出空间', async () => {
      const s = await session(390); currentPage = s.page;
      try {
        await login(s.page); await visit(s.page, 'contribute.html');
        await s.page.locator('#post-title').focus(); await s.page.setViewportSize({ width: 390, height: 430 }); await s.page.waitForTimeout(200);
        const small = await metrics(s.page);
        ok(!small.bottom, '编辑框聚焦且视窗缩小时底栏隐藏');
        const field = await s.page.locator('#post-title').evaluate(el => ({ top: el.getBoundingClientRect().top, bottom: el.getBoundingClientRect().bottom, active: document.activeElement === el }));
        ok(field.active, '文本框保持焦点');
        await s.page.locator('#post-title').fill('导航验收输入');
        ok(await s.page.locator('#post-title').inputValue() === '导航验收输入', '隐藏导航后可正常输入');
        await s.page.evaluate(() => document.activeElement.blur()); await s.page.setViewportSize({ width: 390, height: 844 }); await s.page.waitForTimeout(200);
        ok(!!(await metrics(s.page)).bottom, '退出输入并恢复视窗后底栏恢复');
      } finally { await s.close(); }
    });
    await test('跳过导航与主导航键盘焦点', async () => {
      const s = await session(1440); currentPage = s.page;
      try {
        await login(s.page); await visit(s.page, 'index.html'); await s.page.keyboard.press('Tab');
        ok(await s.page.locator('.skip-link').evaluate(el => document.activeElement === el), '首个键盘焦点是跳到正文');
        await s.page.keyboard.press('Enter');
        ok(await s.page.evaluate(() => document.activeElement?.tagName === 'MAIN'), '跳到正文链接移动焦点至 main');
        await visit(s.page, 'community.html');
        const target = s.page.locator('header nav a[href="community.html"]'); await target.focus(); await s.page.keyboard.press('Tab');
        const focus = await s.page.evaluate(() => { const el = document.activeElement, style = getComputedStyle(el), r = el.getBoundingClientRect(); const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { visible: el.matches(':focus-visible'), outline: style.outlineWidth, hit: !!hit && (el === hit || el.contains(hit)) }; });
        ok(focus.visible && parseFloat(focus.outline) > 0 && focus.hit, '主导航键盘焦点有轮廓且未遮挡');
      } finally { await s.close(); }
    });
    for (const width of [390, 1440]) await test(width + 'px · 课程与社区目录锚点不被固定头部遮挡', async () => {
      const s = await session(width); currentPage = s.page;
      try {
        await login(s.page); const detail = await seed(s.page);
        for (const [file, selector] of [['lesson.html?id=40', '#lesson-steps a[href^="#"]'], [detail, '.common-toc a[href^="#"]']]) {
          await visit(s.page, file);
          const anchor = s.page.locator(selector).nth(1);
          if (!await anchor.isVisible() && file.startsWith('lesson.html')) await s.page.locator('.lesson-outline > summary').click();
          const href = await anchor.getAttribute('href'); await anchor.click();
          await s.page.waitForTimeout(150);
          const bounds = await s.page.evaluate(hash => { const target = document.getElementById(decodeURIComponent(hash.slice(1))); const header = document.querySelector('header.site-header,header.common-header'); return { targetTop: target.getBoundingClientRect().top, headerBottom: header.getBoundingClientRect().bottom }; }, href);
          ok(bounds.targetTop >= bounds.headerBottom - 1, file + ' 目录目标停在固定头部下方 ' + JSON.stringify(bounds));
        }
      } finally { await s.close(); }
    });
    await test('脚本资源与云端隔离', async () => {
      ok(report.pageErrors.length === 0, JSON.stringify(report.pageErrors));
      ok(report.consoleErrors.length === 0, JSON.stringify(report.consoleErrors));
      ok(report.httpErrors.length === 0, JSON.stringify(report.httpErrors));
      ok(report.externalRequests.length === 0, JSON.stringify(report.externalRequests));
    });
  } finally {
    await browser.close(); report.passed = report.checks.every(check => check.passed); report.finishedAt = new Date().toISOString();
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ passed: report.passed, checks: report.checks.length, assertions: report.assertions, layouts: report.layouts.length, screenshots: report.screenshots.length, realCloudValidated: false }));
    if (!report.passed) process.exitCode = 1;
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
