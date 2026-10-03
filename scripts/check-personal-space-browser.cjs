'use strict';
// 可重跑的真实 Edge 验收；使用新浏览器上下文，不读取用户日常浏览器数据。
// $env:NODE_PATH='C:/Users/ASUS/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'; node scripts/check-personal-space-browser.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require('playwright');
const base = (process.argv[2] || 'http://127.0.0.1:4178/site/').replace(/\/?$/, '/');
const output = path.resolve(process.argv[3] || path.join(__dirname, '..', '..', 'qa', 'browser'));
const executablePath = process.env.EGG_QA_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const KEY = 'eggcode-academy.space-preview.v1';
const PROGRESS_KEY = 'eggcode-academy.learning-progress';
const original = JSON.stringify({version: 1, completed: [22, 70, 144], lastLesson: 70});
const report = {startedAt: new Date().toISOString(), base, browser: executablePath, checks: [], pageErrors: [], resourceFailures: [], blockedSubmissions: [], keyboardFocus: [], responsive: [], designChecks: [], screenshots: []};
let browser, page, lesson;
let assertions = 0;
const equal = (actual, expected, message) => { assert.deepEqual(actual, expected, message); assertions++; };
const ok = (condition, message) => { assert.ok(condition, message); assertions++; };
const state = target => target.evaluate(() => window.EGG_SPACE.getState());
const action = (target, name, prefix = '#space-view') => target.locator(`${prefix} [data-space-action="${name}"]`).first();
async function screenshot(target, filename) {
  await target.screenshot({path: path.join(output, filename), fullPage: false, animations: 'disabled'});
  report.screenshots.push(filename);
}
async function test(name, callback) {
  try { await callback(); report.checks.push({name, status: 'passed'}); console.log('通过：' + name); }
  catch (error) {
    report.checks.push({name, status: 'failed', error: error.message, stack: error.stack});
    console.error('失败：' + name + '\n' + error.message);
    if (page && !page.isClosed()) await screenshot(page, `failure-${report.checks.length}.png`).catch(() => {});
  }
}
async function visit(target, url) {
  const response = await target.goto(url, {waitUntil: 'load'});
  equal(response.status(), 200, '页面应返回 200');
  await target.waitForFunction(() => Boolean(window.EGG_SPACE));
}
async function section(name) {
  await page.locator(`[data-space-section="${name}"]`).click();
  await page.waitForFunction(value => location.hash === '#' + value && document.querySelector(`[data-space-section="${value}"]`)?.getAttribute('aria-current') === 'page', name);
}
async function closeDialogs(target = page) {
  await target.evaluate(() => document.querySelectorAll('dialog[open]').forEach(dialog => dialog.close()));
}
function observe(target) {
  target.on('pageerror', error => report.pageErrors.push({url: target.url(), message: error.message}));
  target.on('requestfailed', request => report.resourceFailures.push({url: request.url(), error: request.failure()?.errorText}));
  target.on('response', response => { if (response.status() >= 400) report.resourceFailures.push({url: response.url(), status: response.status()}); });
}

(async () => {
  fs.mkdirSync(output, {recursive: true});
  browser = await chromium.launch({headless: true, executablePath});
  const context = await browser.newContext({viewport: {width: 1440, height: 1000}, reducedMotion: 'reduce', acceptDownloads: true});
  await context.addInitScript(({key, value}) => {
    if (localStorage.getItem(key) === null) localStorage.setItem(key, value);
    if (localStorage.getItem('personal-space-browser-check.unrelated') === null) localStorage.setItem('personal-space-browser-check.unrelated', '保留');
  }, {key: PROGRESS_KEY, value: original});
  // 验收只允许读取预览页面和静态资源；任何提交请求均阻止，避免意外真实发送。
  await context.route('**/*', route => {
    const request = route.request();
    if (!['GET', 'HEAD'].includes(request.method())) {
      report.blockedSubmissions.push({url: request.url(), method: request.method()});
      return route.abort('blockedbyclient');
    }
    return route.continue();
  });
  page = await context.newPage(); observe(page); page.setDefaultTimeout(8000);
  await visit(page, base + 'personal-space.html');

  await test('默认账号和概览：12 学完、3 收藏、1 笔记', async () => {
    const value = await state(page);
    equal(value.active, true, '默认活动账号'); equal(value.nickname, '林间创作者', '默认昵称');
    equal(value.completed.length, 12, '12 课已学完'); equal(value.favorites.length, 3, '3 课收藏'); equal(value.notes.length, 1, '1 份笔记');
    equal(await page.locator('[data-space-count="completed"]').innerText(), '12', '完成数显示');
    equal(await page.locator('[data-space-count="favorites"]').innerText(), '3', '收藏数显示');
    equal(await page.locator('[data-space-count="notes"]').innerText(), '1', '笔记数显示');
    ok((await page.locator('.space-preview-note').innerText()).includes('尚未连接云端'), '数据库预览边界可见');
    equal(await page.evaluate(key => localStorage.getItem(key), KEY), null, '打开概览不会自动写演示键');
    equal(value.completed.includes(70), false, '没有自动导入原进度');
    await screenshot(page, 'space-overview-desktop.png');
  });
  await test('课程搜索背包与学习状态筛选', async () => {
    await section('progress');
    equal(await page.locator('#space-progress-list [data-course-id]').count(), 145, '课程列表完整 145 课');
    await page.locator('#space-course-query').fill('背包');
    const titles = await page.locator('#space-progress-list h3').allTextContents();
    ok(titles.length > 0 && titles.every(title => title.includes('背包')), '背包搜索准确过滤');
    await page.locator('#space-progress-filter').selectOption('completed');
    equal(await page.locator('#space-progress-list [data-course-id]').count(), 0, '默认尚未完成背包课');
    await page.locator('#space-progress-filter').selectOption('pending');
    equal(await page.locator('#space-progress-list [data-course-id]').count(), titles.length, '未完成过滤正确');
    await page.locator('#space-course-query').fill(''); await page.locator('#space-progress-filter').selectOption('all');
    await screenshot(page, 'space-progress-desktop.png');
  });
  await test('标记课程 144 并刷新持久恢复', async () => {
    await section('progress'); await page.locator('#space-course-query').fill(''); await page.locator('#space-progress-filter').selectOption('all');
    await page.locator('[data-course-id="144"] [data-space-action="complete"]').click();
    equal((await state(page)).completed.includes(144), true, '144 课标记保存');
    await page.reload({waitUntil: 'load'});
    await page.waitForFunction(() => window.EGG_SPACE?.getState().completed.includes(144));
    equal(await page.locator('[data-course-id="144"] [data-space-action="complete"]').getAttribute('aria-pressed'), 'true', '刷新后按钮保留完成状态');
    equal(await page.evaluate(key => localStorage.getItem(key), PROGRESS_KEY), original, '新完成状态不写原键');
  });
  await test('收藏按钮切换与收藏列表联动', async () => {
    await section('favorites');
    equal(await page.locator('#space-view [data-course-id]').count(), 3, '初始收藏列表');
    await page.locator('[data-course-id="12"] [data-space-action="favorite"]').click();
    equal((await state(page)).favorites.includes(12), false, '取消收藏');
    equal(await page.locator('#space-view [data-course-id="12"]').count(), 0, '取消后列表移除');
    await section('progress'); await page.locator('#space-course-query').fill(''); await page.locator('#space-progress-filter').selectOption('all');
    await page.locator('[data-course-id="12"] [data-space-action="favorite"]').click();
    equal((await state(page)).favorites.includes(12), true, '重新收藏');
    await section('favorites'); equal(await page.locator('#space-view [data-course-id="12"]').count(), 1, '收藏列表恢复');
  });
  await test('笔记新建、编辑与 XSS 纯文本', async () => {
    await section('notes'); await action(page, 'note').click();
    await page.locator('#space-note-lesson').selectOption('12');
    const text = '<img src=x onerror="window.__spaceXss=1"><script>window.__spaceXss=2</script>背包笔记';
    await page.locator('#space-note-content').fill(text); await page.locator('#space-note-form button[type="submit"]').click();
    equal(await page.locator('#space-note-dialog').evaluate(node => node.open), false, '笔记保存关闭弹窗');
    equal(await page.locator('[data-note-id="12"] > p').innerText(), text, '笔记原样显示为文本');
    equal(await page.locator('[data-note-id="12"] img, [data-note-id="12"] script').count(), 0, '文本未生成 HTML 节点');
    equal(await page.evaluate(() => window.__spaceXss ?? null), null, '注入没有执行');
    await page.locator('[data-note-id="12"] [data-space-action="note"]').click();
    equal(await page.locator('#space-note-content').inputValue(), text, '编辑带回原内容');
    await page.locator('#space-note-content').fill(text + ' · 已修改'); await page.locator('#space-note-form button[type="submit"]').click();
    equal((await state(page)).notes.filter(note => note.lessonId === 12).length, 1, '每课只留一份笔记');
    ok((await page.locator('[data-note-id="12"] > p').innerText()).endsWith('已修改'), '修改内容显示');
    equal(await page.evaluate(() => window.__spaceXss ?? null), null, '修改后注入也未执行');
    await screenshot(page, 'space-notes-desktop.png');
  });
  await test('弹窗键盘 Tab、ESC 与关闭后焦点恢复', async () => {
    await closeDialogs();
    const opener = page.locator('.space-account-control');
    await opener.focus(); await page.keyboard.press('Enter');
    ok(await page.locator('#space-account-dialog').evaluate(node => node.open && node.contains(document.activeElement)), '打开后焦点在账号弹窗内');
    for (const key of [...Array(8).fill('Tab'), ...Array(4).fill('Shift+Tab')]) {
      await page.keyboard.press(key);
      const focus = await page.evaluate(() => ({key: document.activeElement.id, tag: document.activeElement.tagName, withinDialog: document.getElementById('space-account-dialog').contains(document.activeElement), documentHasFocus: document.hasFocus()}));
      report.keyboardFocus.push({pressed: key, ...focus});
      // Edge 原生 dialog 允许 Tab 进入浏览器界面，此时页面失焦且 activeElement 为 BODY。
      ok(focus.withinDialog || (focus.tag === 'BODY' && !focus.documentHasFocus), 'Tab 不得进入真实背景导航或控件：' + JSON.stringify(focus));
    }
    await page.keyboard.press('Escape');
    equal(await page.locator('#space-account-dialog').evaluate(node => node.open), false, 'ESC 关闭账号弹窗');
    equal(await opener.evaluate(node => document.activeElement === node), true, 'ESC 后焦点回到账号入口');
    await section('notes'); const noteOpener = action(page, 'note'); await noteOpener.focus(); await page.keyboard.press('Enter');
    await page.keyboard.press('Escape');
    equal(await noteOpener.evaluate(node => document.activeElement === node), true, '笔记 ESC 后焦点恢复');
  });
  await test('反馈 10..1000 字边界、本机记录与未发送标识', async () => {
    await closeDialogs(); await section('feedback'); await action(page, 'feedback').click();
    equal(await page.locator('#space-feedback-content').getAttribute('minlength'), '10', '最短 10 字');
    equal(await page.locator('#space-feedback-content').getAttribute('maxlength'), '1000', '最多 1000 字');
    await page.locator('#space-feedback-lesson').selectOption('40');
    const before = (await state(page)).feedback.length;
    await page.locator('#space-feedback-content').fill('字'.repeat(9)); await page.locator('#space-feedback-form button[type="submit"]').click();
    equal((await state(page)).feedback.length, before, '9 字不保存');
    equal(await page.locator('#space-feedback-dialog').evaluate(node => node.open), true, '无效内容弹窗保留');
    await page.locator('#space-feedback-content').fill('字'.repeat(10)); await page.locator('#space-feedback-form button[type="submit"]').click();
    equal((await state(page)).feedback.length, before + 1, '10 字反馈保存');
    await action(page, 'feedback').click(); await page.locator('#space-feedback-lesson').selectOption('40'); await page.locator('#space-feedback-type').selectOption('diagram');
    await page.locator('#space-feedback-content').fill('字'.repeat(1000)); await page.locator('#space-feedback-form button[type="submit"]').click();
    equal((await state(page)).feedback.length, before + 2, '1000 字反馈保存');
    equal(await page.locator('.space-status-pill').allTextContents(), ['本机演示 · 未发送', '本机演示 · 未发送'], '所有反馈标识未发送');
    const feedback = (await state(page)).feedback;
    ok(feedback.every(item => item.id && Number.isFinite(Date.parse(item.createdAt))), '反馈保存唯一标识和时间');
    equal(report.blockedSubmissions.length, 0, '没有尝试提交网络请求');
    await screenshot(page, 'space-feedback-desktop.png');
  });
  await test('退出隐藏个人内容，游客可公开阅读，再进入改昵称', async () => {
    await closeDialogs(); await page.locator('.space-sidebar [data-space-action="logout"]').click();
    equal((await state(page)).active, false, '退出活动账号'); equal(await page.locator('#space-nickname').innerText(), '游客', '显示游客');
    for (const name of ['overview', 'progress', 'favorites', 'notes', 'feedback']) {
      await section(name); ok((await page.locator('#space-view').innerText()).includes('先进入体验账号'), '游客个人栏目隐藏');
      equal(await page.locator('#space-view .space-note, #space-view .space-feedback, #space-view [data-course-id]').count(), 0, '游客看不到个人数据卡片');
    }
    lesson = await context.newPage(); observe(lesson); lesson.setDefaultTimeout(8000);
    await visit(lesson, base + 'lesson.html?id=40');
    await lesson.waitForFunction(() => document.querySelector('.lesson-article')?.getAttribute('aria-busy') === 'false');
    await lesson.waitForSelector('#space-lesson-tools');
    ok((await lesson.locator('#lesson-title').innerText()).includes('背包'), '游客能读完整背包课程');
    ok(await lesson.locator('#lesson-body').innerText().then(text => text.length > 1000), '公开正文不依赖账号');
    equal(await lesson.locator('#space-lesson-tools [data-space-action="complete"]').count(), 0, '游客没有可保存完成按钮');
    await lesson.locator('#space-lesson-tools [data-space-action="favorite"]').click();
    await lesson.waitForURL(url => url.pathname.endsWith('/login.html'));
    equal(new URL(lesson.url()).searchParams.get('next'), 'lesson.html?id=40', '游客收藏进入登录页并保留原课程');
    await page.locator('.space-account-control').click(); await page.waitForURL(url => url.pathname.endsWith('/login.html'));
    equal(new URL(page.url()).searchParams.get('next'), 'personal-space.html#feedback', '个人空间登录保留原栏目');
    await page.locator('#login-nickname').fill('自动验收创作者'); await page.locator('#login-demo-form button[type="submit"]').click();
    await page.waitForURL(url => url.pathname.endsWith('/personal-space.html') && url.hash === '#feedback');
    equal((await state(page)).nickname, '自动验收创作者', '修改体验昵称'); equal((await state(page)).active, true, '重新进入账号');
    await lesson.locator('#login-nickname').fill('自动验收创作者'); await lesson.locator('#login-demo-form button[type="submit"]').click();
    await lesson.waitForURL(url => url.pathname.endsWith('/lesson.html') && url.searchParams.get('id') === '40');
    await lesson.waitForSelector('#space-lesson-tools');
    equal((await state(lesson)).favorites.includes(40), true, '登录回原课程没有自动切换收藏');
    equal((await state(page)).notes.length, 2, '重进后保留笔记');
  });
  await test('课程 40 动态工具保存完成、收藏和笔记，并跨标签同步', async () => {
    if (!lesson || lesson.isClosed()) { lesson = await context.newPage(); observe(lesson); await visit(lesson, base + 'lesson.html?id=40'); }
    await lesson.waitForSelector('#space-lesson-tools [data-space-action="complete"]');
    const canonical = await lesson.evaluate(() => [...window.EGG_LESSONS, ...window.EGG_TUTORIALS, ...window.EGG_EXPANSION_LESSONS].map(item => item.title));
    equal(canonical.length, 145, '实际课程页加载 145 条元数据');
    await section('progress'); await page.locator('#space-course-query').fill(''); await page.locator('#space-progress-filter').selectOption('all');
    const catalog = await page.locator('#space-progress-list [data-course-id]').evaluateAll(rows => rows.map(row => ({id: Number(row.dataset.courseId), title: row.querySelector('h3 a').textContent, linkId: Number(new URL(row.querySelector('h3 a').href).searchParams.get('id'))})));
    equal(catalog.length, 145, '空间实际显示 145 条课程链接');
    equal(catalog.map(item => item.id), Array.from({length:145}, (_, id) => id), '空间完整覆盖稳定 ID 0..144');
    for (const item of catalog) { equal(item.linkId, item.id, '链接与课程 ID 一致'); equal(item.title, canonical[item.id], `空间课程 ${item.id} 的标题与课程页一致`); }
    equal(await lesson.locator('#lesson-title').innerText(), canonical[40], '实际打开 40 课标题完全一致');
    report.catalogTitlesVerified = catalog.length;
    equal(await lesson.locator('#space-lesson-tools').count(), 1, '动态工具只挂一次');
    equal((await state(lesson)).completed.includes(40), false, '40 课开始未学完');
    await lesson.locator('#space-lesson-tools [data-space-action="complete"]').click();
    await page.waitForFunction(() => window.EGG_SPACE.getState().completed.includes(40));
    equal((await state(page)).completed.includes(40), true, '课程完成同步到个人空间');
    await lesson.locator('#space-lesson-tools [data-space-action="favorite"]').click();
    await page.waitForFunction(() => !window.EGG_SPACE.getState().favorites.includes(40));
    equal((await state(page)).favorites.includes(40), false, '课程取消收藏同步');
    await lesson.locator('#space-lesson-tools [data-space-action="favorite"]').click();
    await page.waitForFunction(() => window.EGG_SPACE.getState().favorites.includes(40));
    await lesson.locator('#space-lesson-tools [data-space-action="note"]').click();
    equal(await lesson.locator('#space-note-lesson').inputValue(), '40', '笔记自动选当前课');
    const text = '课程页保存：新增物品后核对玩家跨度、初始化长度与索引公式。';
    await lesson.locator('#space-note-content').fill(text); await lesson.locator('#space-note-form button[type="submit"]').click();
    await page.waitForFunction(expected => window.EGG_SPACE.getState().notes.some(note => note.lessonId === 40 && note.content === expected), text);
    await section('notes'); equal(await page.locator('[data-note-id="40"] > p').innerText(), text, '笔记 UI 通过 storage 事件更新');
    await section('overview');
    const notes = (await state(page)).notes;
    const latest = [...notes].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))[0];
    equal(latest.lessonId, 40, '课程页刚保存的笔记应比数组后面的旧笔记更新');
    equal(await page.locator('.space-latest-note-content').innerText(), latest.content, '概览提示读取真实 notes 中最新 updatedAt 的内容');
    equal(await page.locator('.space-latest-note [data-space-action="note"]').getAttribute('data-lesson-id'), String(latest.lessonId), '继续编辑打开真实最新笔记的课程');
    equal(await page.locator('.space-latest-note-footer small').innerText(), new Intl.DateTimeFormat('zh-CN', {month: 'long', day: 'numeric'}).format(new Date(latest.updatedAt)) + ' 更新', '最近笔记显示真实更新时间');
    report.designChecks.push({check: 'latest-note', lessonId: latest.lessonId, updatedAt: latest.updatedAt, source: 'window.EGG_SPACE.getState().notes'});
    await lesson.reload({waitUntil: 'load'}); await lesson.waitForSelector('#space-lesson-tools');
    equal(await lesson.locator('#space-lesson-tools [data-space-action="complete"]').getAttribute('aria-pressed'), 'true', '课程刷新保留完成状态');
    equal((await state(lesson)).lastLesson, 40, '课程记录最近阅读');
  });
  await test('导出演示 JSON 下载与数据完整性', async () => {
    await section('settings');
    const downloaded = page.waitForEvent('download'); await action(page, 'export').click(); const download = await downloaded;
    equal(download.suggestedFilename(), '自由树梦想空间-演示记录.json', '导出文件名');
    const filename = path.join(output, 'personal-space-export.json'); await download.saveAs(filename);
    const value = JSON.parse(fs.readFileSync(filename, 'utf8'));
    equal(value.nickname, '自动验收创作者', '导出昵称'); ok(value.completed.includes(40) && value.completed.includes(144), '导出完成标记');
    equal(value.notes.length, 2, '导出笔记完整'); equal(value.feedback.length, 2, '导出反馈完整');
    ok(value.description.includes('本机演示') && value.description.includes('不是云端备份'), '导出明确标注演示记录');
  });
  await test('确认重置只作用演示键，取消和 ESC 保留数据', async () => {
    await closeDialogs(); await section('settings'); const before = await page.evaluate(key => localStorage.getItem(key), KEY);
    const opener = action(page, 'reset'); await opener.focus(); await page.keyboard.press('Enter');
    equal(await page.locator('#space-reset-dialog').evaluate(node => node.open), true, '重置需打开确认弹窗');
    await page.keyboard.press('Escape'); equal(await page.evaluate(key => localStorage.getItem(key), KEY), before, 'ESC 不重置');
    equal(await opener.evaluate(node => document.activeElement === node), true, '重置 ESC 焦点恢复');
    await opener.click(); await page.locator('#space-reset-dialog [data-space-close]').last().click();
    equal(await page.evaluate(key => localStorage.getItem(key), KEY), before, '取消保留当前数据');
    await opener.click(); await page.locator('[data-space-action="confirm-reset"]').click();
    const value = await state(page); equal(value.completed.length, 12, '重置回 12 课'); equal(value.favorites.length, 3, '重置回 3 收藏'); equal(value.notes.length, 1, '重置回 1 笔记'); equal(value.feedback.length, 0, '反馈恢复为空');
    equal(value.nickname, '林间创作者', '重置恢复默认昵称');
    equal(await page.evaluate(key => localStorage.getItem(key), PROGRESS_KEY), original, '原版学习键完全不变');
    equal(await page.evaluate(() => localStorage.getItem('personal-space-browser-check.unrelated')), '保留', '无关键不变');
  });
  await test('375 / 390 / 768 / 1280 / 1440 / 横屏 844×390 与设计回归', async () => {
    await closeDialogs(); if (lesson) await closeDialogs(lesson);
    for (const viewport of [{width:375,height:812},{width:390,height:844},{width:768,height:1024},{width:1280,height:900},{width:1440,height:1000},{width:844,height:390}]) {
      await page.setViewportSize(viewport);
      for (const name of ['overview','progress','favorites','notes','feedback','settings']) {
        await section(name);
        const dimensions = await page.evaluate(() => ({scrollWidth: document.documentElement.scrollWidth, bodyWidth: document.body.scrollWidth, viewport: innerWidth}));
        report.responsive.push({page:'personal-space', section:name, ...viewport, ...dimensions});
        ok(dimensions.scrollWidth <= dimensions.viewport + 1 && dimensions.bodyWidth <= dimensions.viewport + 1, `${viewport.width}×${viewport.height} ${name} 出现横向滚动：${JSON.stringify(dimensions)}`);
        const navigation = await page.locator('.space-menu').evaluate(menu => {
          const links = [...menu.querySelectorAll('[data-space-section]')];
          const active = links.filter(node => node.getAttribute('aria-current') === 'page');
          const node = active[0], style = node && getComputedStyle(node), line = node && getComputedStyle(node, '::after');
          return {count: links.length, activeCount: active.length, section: node?.dataset.spaceSection, fontWeight: style?.fontWeight, color: style?.color, inactiveColor: getComputedStyle(links.find(link => link !== node)).color, underlineHeight: parseFloat(line?.height), underlineBackground: line?.backgroundColor};
        });
        ok(navigation.count === 6 && navigation.activeCount === 1 && navigation.section === name && Number(navigation.fontWeight) >= 600 && navigation.color !== navigation.inactiveColor && navigation.underlineHeight >= 2 && navigation.underlineBackground !== 'rgba(0, 0, 0, 0)', `${viewport.width}×${viewport.height} ${name} 导航选中应明确：${JSON.stringify(navigation)}`);
      }
      await section('overview'); await page.evaluate(() => scrollTo({top: 0, behavior: 'instant'}));
      if (viewport.width === 375 || viewport.width === 390) {
        const cta = await page.locator('.space-resume .space-button-primary').evaluate(node => {
          const box = node.getBoundingClientRect();
          return {top: box.top, bottom: box.bottom, left: box.left, right: box.right, height: box.height, viewportWidth: innerWidth, viewportHeight: innerHeight, obscured: !node.contains(document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2))};
        });
        ok(cta.top >= 0 && cta.bottom <= cta.viewportHeight && cta.left >= 0 && cta.right <= cta.viewportWidth && cta.height >= 44 && !cta.obscured, `${viewport.width} 首屏继续学习 CTA 应完整可见且可点：${JSON.stringify(cta)}`);
        report.designChecks.push({check: 'first-screen-cta', ...viewport, ...cta});
      }
      if (viewport.width === 1280 || viewport.width === 1440) {
        const layout = await page.evaluate(() => {
          const sidebar = document.querySelector('.space-sidebar').getBoundingClientRect(), main = document.querySelector('.space-main').getBoundingClientRect();
          return {sidebar: {left: sidebar.left, width: sidebar.width, bottom: sidebar.bottom}, main: {left: main.left, width: main.width, top: main.top}};
        });
        ok(Math.abs(layout.main.left - layout.sidebar.left) <= 1 && Math.abs(layout.main.width - layout.sidebar.width) <= 1 && layout.main.top >= layout.sidebar.bottom - 1, `${viewport.width} 宽屏主内容应与顶部导航同宽，不留空侧栏：${JSON.stringify(layout)}`);
        report.designChecks.push({check: 'wide-content-without-empty-sidebar', ...viewport, ...layout});
      }
      equal((await state(page)).nickname, '林间创作者', '响应式截图恢复默认演示账号');
      await screenshot(page, `space-overview-${viewport.width}x${viewport.height}.png`);
      if (lesson) {
        await lesson.setViewportSize(viewport); await lesson.locator('#space-lesson-tools').scrollIntoViewIfNeeded();
        const dimensions = await lesson.evaluate(() => ({scrollWidth: document.documentElement.scrollWidth, bodyWidth: document.body.scrollWidth, viewport: innerWidth}));
        report.responsive.push({page:'lesson-40', ...viewport, ...dimensions});
        ok(dimensions.scrollWidth <= dimensions.viewport + 1 && dimensions.bodyWidth <= dimensions.viewport + 1, `${viewport.width}×${viewport.height} 课程页出现横向滚动：${JSON.stringify(dimensions)}`);
        if (viewport.width === 390) await screenshot(lesson, 'lesson-40-space-tools-mobile.png');
        if (viewport.width === 1440) await screenshot(lesson, 'lesson-40-space-tools-desktop.png');
      }
      console.log(`通过响应式：${viewport.width}×${viewport.height}，6 个空间栏目和课程页`);
    }
  });
  await test('页面错误、资源失败及真实提交请求为零', async () => {
    equal(report.pageErrors, [], '浏览器 pageerror 为零'); equal(report.resourceFailures, [], '资源请求失败为零'); equal(report.blockedSubmissions, [], '没有真实提交网络请求');
  });
  report.assertions = assertions; report.finishedAt = new Date().toISOString();
  report.passed = report.checks.filter(item => item.status === 'passed').length;
  report.failed = report.checks.filter(item => item.status === 'failed').length;
  fs.writeFileSync(path.join(output, 'personal-space-browser-results.json'), JSON.stringify(report, null, 2));
  console.log(`${report.failed ? 'FAIL' : 'PASS'} 真实 Edge 个人空间：${report.passed}/${report.checks.length} 场景，${assertions} 项断言；${report.responsive.length} 个响应式页面组合，${report.pageErrors.length} 页面错误，${report.resourceFailures.length} 资源失败。`);
  if (report.failed) process.exitCode = 1;
})().catch(error => {
  report.fatalError = error.stack; report.finishedAt = new Date().toISOString();
  fs.mkdirSync(output, {recursive: true}); fs.writeFileSync(path.join(output, 'personal-space-browser-results.json'), JSON.stringify(report, null, 2));
  console.error(error.stack); process.exitCode = 1;
}).finally(async () => { if (browser) await browser.close(); });
