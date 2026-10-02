'use strict';
// npm dependency: jsdom (use NODE_PATH=/path/to/qa/node_modules).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {JSDOM} = require('jsdom');
const root = path.resolve(__dirname, '..');
const scripts = ['lessons-data.js', 'tutorials.js', 'build-guides.js', 'progression-guides.js', 'curriculum-expansion.js', 'curriculum-lessons-01.js', 'curriculum-lessons-02.js', 'learning-progress.js'];
const source = new Map(scripts.map(file => [file, fs.readFileSync(path.join(root, file), 'utf8')]));
const KEY = 'eggcode-academy.learning-progress';
let assertions = 0;
function check(condition, message) { assert.ok(condition, message); assertions++; }
function equal(actual, expected, message) { assert.equal(actual, expected, message); assertions++; }
function create({page = 'learning-path', id = '', raw, blocked = false, quota = false, foundationOnly = false} = {}) {
  const html = page === 'learning-path' ? fs.readFileSync(path.join(root, 'learning-path.html'), 'utf8') : `<!doctype html><html><body data-page="${page}"><main><div data-learning-progress-summary></div><article class="lesson-article"><header class="article-header"><h1>课程</h1></header></article><div id="courses-grid"><a class="course-card" data-lesson-id="0" href="lesson.html?id=0"><div class="course-info">课程零</div></a></div><div id="practice-grid"></div></main></body></html>`;
  const dom = new JSDOM(html, {url: `https://learning.example/${page}.html${id !== '' ? '?id=' + id : ''}`, runScripts: 'outside-only'});
  const w = dom.window;
  w.confirm = () => false;
  if (raw !== undefined) w.localStorage.setItem(KEY, typeof raw === 'string' ? raw : JSON.stringify(raw));
  if (blocked) Object.defineProperty(w, 'localStorage', {get() { throw new Error('SecurityError'); }});
  if (quota) w.Storage.prototype.setItem = () => { throw new Error('QuotaExceededError'); };
  for (const file of scripts) {
    if (foundationOnly && !['lessons-data.js', 'curriculum-expansion.js', 'learning-progress.js'].includes(file)) continue;
    w.eval(source.get(file));
  }
  w.EGG_PROGRESS.init();
  return {dom, w, document: w.document, api: w.EGG_PROGRESS};
}
function close(item) { item.dom.window.close(); }
async function main() {
  const page = create();
  const {document: d, api, w} = page;
  equal(d.querySelectorAll('.learning-route-card').length, 8, 'eight curated routes');
  equal(d.querySelectorAll('.learning-family .learning-series').length, 34, 'all 34 practical series');
  const total = d.querySelector('.learning-dashboard progress');
  equal(total.max, 145, '145 lessons total');
  check(d.querySelector('#learning-foundation').textContent.includes('ID 0–5'), 'foundations 0–5');
  for (let id = 0; id < 145; id++) check(d.querySelector(`.learning-series-body a[href="lesson.html?id=${id}"]`), 'course coverage ' + id);
  check(!d.body.textContent.includes('课程 ID'), 'all titles available with stable indices');
  for (const a of d.querySelectorAll('a[href^="lesson.html?id="]')) {
    const id = Number(new URL(a.href).searchParams.get('id'));
    check(Number.isInteger(id) && id >= 0 && id <= 144, 'valid course link');
  }
  check(d.querySelector('#route-big-numbers').textContent.includes('不是把六课接进同一套程序'), 'big-number branches are independent');
  check(d.querySelector('#route-big-numbers a[href="big-number-lab.html"]'), 'separate algorithm lab');
  check(d.querySelector('#route-big-numbers').textContent.includes('不计入 145 课'), 'lab excluded from lesson count');
  check(d.querySelector('#route-reliable-save a[href="lesson.html?id=70"]'), 'multiplayer curriculum present');
  check(d.querySelector('#route-reliable-save a[href="lesson.html?id=75"]'), 'save curriculum present');
  equal(d.querySelectorAll('.site-header nav a').length, 4, 'original header navigation');
  const initialRoutes = d.querySelectorAll('.learning-route-card').length;
  api.init(); api.init();
  equal(d.querySelectorAll('.learning-route-card').length, initialRoutes, 'idempotent routes');
  check(api.setCompleted(0, true), 'valid completion accepted');
  api.setCompleted(0, true);
  equal(api.getState().completed.length, 1, 'repeated completion never duplicates');
  equal(total.value, 1, 'overall completion updates');
  equal(w.localStorage.length, 1, 'only namespaced progress key used');
  const raw = w.localStorage.getItem(KEY);
  const reloaded = create({raw});
  equal(reloaded.api.getState().completed.join(','), '0', 'reload persists'); close(reloaded);
  for (const id of [-1, 145, 1.5, '0', NaN, null, undefined]) check(!api.setCompleted(id, true), 'reject unknown or malformed lesson ID');
  check(!api.setCompleted(1, 'true'), 'reject nonboolean completion');
  api.setCompleted(0, false);
  equal(api.getState().completed.length, 0, 'remove completion');
  for (let id = 0; id < 145; id++) api.setCompleted(id, true);
  equal(total.value, 145, 'all lessons complete');
  equal(d.querySelectorAll('.learning-next').length, 8, 'routes preserved');
  check([...d.querySelectorAll('.learning-next')].every(node => node.textContent.includes('已全部标记')), 'complete route links remain useful');
  w.localStorage.setItem('unrelated', 'keep');
  equal(api.clearProgress(), false, 'clear cancel');
  equal(api.getState().completed.length, 145, 'cancel preserves data');
  w.confirm = text => { check(text.includes('无法撤销') && text.includes('本浏览器'), 'explicit clear scope and consequence'); return true; };
  equal(api.clearProgress(), true, 'clear confirmed');
  equal(api.getState().completed.length, 0, 'clear resets progress');
  equal(w.localStorage.getItem(KEY), null, 'own storage entry removed');
  equal(w.localStorage.getItem('unrelated'), 'keep', 'unrelated storage retained');
  api.init(); equal(w.localStorage.getItem(KEY), null, 'route init does not recreate cleared record');
  w.localStorage.setItem(KEY, JSON.stringify({version: 1, completed: [70, 75], lastLesson: 75}));
  w.dispatchEvent(new w.StorageEvent('storage', {key: 'unrelated', storageArea: w.localStorage}));
  equal(api.getState().completed.length, 0, 'unrelated storage events ignored');
  w.dispatchEvent(new w.StorageEvent('storage', {key: KEY, storageArea: w.localStorage}));
  equal(api.getState().completed.join(','), '70,75', 'other-tab completion event sync');
  equal(total.value, 2, 'other-tab UI sync');
  check(d.querySelector('[data-progress-resume]').textContent.includes('存档升级与故障处理'), 'resume lesson title uses correct ID');
  w.localStorage.removeItem(KEY);
  w.dispatchEvent(new w.StorageEvent('storage', {key: KEY, storageArea: w.localStorage}));
  equal(api.getState().completed.length, 0, 'other-tab clear sync');
  w.localStorage.setItem(KEY, JSON.stringify({version: 1, completed: [71], lastLesson: null}));
  api.setCompleted(72, true);
  equal(api.getState().completed.join(','), '71,72', 'read before mutation preserves intervening other-tab write');
  close(page);

  const lesson = create({page: 'lesson', id: 0});
  const button = lesson.document.querySelector('[data-progress-toggle]');
  check(button, 'lesson completion panel mounted');
  equal(lesson.api.getState().lastLesson, 0, 'zero ID remembered');
  equal(lesson.api.getState().completed.length, 0, 'reading alone never completes');
  lesson.api.init(); lesson.api.init();
  equal(lesson.document.querySelectorAll('[data-learning-lesson-panel]').length, 1, 'one lesson panel');
  equal(lesson.document.querySelectorAll('[data-progress-card-badge]').length, 1, 'one card badge');
  equal(lesson.document.querySelectorAll('.learning-summary').length, 1, 'one compact summary');
  button.click(); equal(lesson.api.getState().completed.join(','), '0', 'single click after repeated init');
  equal(button.getAttribute('aria-pressed'), 'true', 'button pressed state');
  button.click(); equal(lesson.api.getState().completed.length, 0, 'second click removes');
  button.click(); button.click(); button.click();
  equal(lesson.api.getState().completed.join(','), '0', 'rapid toggles deterministic');
  const grid = lesson.document.querySelector('#courses-grid');
  grid.innerHTML = '<a class="course-card" data-lesson-id="0"><div class="course-info">filtered card</div></a><a class="course-card" data-lesson-id="144"><div class="course-info">last course</div></a>';
  await new Promise(resolve => setTimeout(resolve, 10));
  equal(grid.querySelectorAll('[data-progress-card-badge]').length, 2, 'filtered card rerender gets badges');
  check(grid.querySelector('[data-lesson-id="0"]').textContent.includes('已标记学完'), 'filtered completed card shows current state');
  equal(grid.querySelectorAll('[data-progress-card-badge].is-complete').length, 1, 'pending course does not show completed');
  lesson.api.init(); await new Promise(resolve => setTimeout(resolve, 10));
  equal(grid.querySelectorAll('[data-progress-card-badge]').length, 2, 'mutation observer does not duplicate badges');
  check(lesson.document.querySelector('[data-learning-lesson-panel]').textContent.includes('不代表编辑器验收通过'), 'self-report caveat');
  close(lesson);

  for (const id of [34, 39, 70, 75, 144]) {
    const test = create({page: 'lesson', id});
    equal(test.api.getState().lastLesson, id, 'stable last visited ' + id);
    check(test.document.querySelector(`[data-progress-toggle="${id}"]`), 'stable lesson toggle ' + id);
    close(test);
  }
  for (const id of ['-1', '145', '1.2', 'bad']) {
    const test = create({page: 'lesson', id});
    equal(test.document.querySelectorAll('[data-learning-lesson-panel]').length, 0, 'invalid lesson no control');
    equal(test.api.getState().lastLesson, null, 'invalid lesson not remembered'); close(test);
  }
  const limited = create({page: 'courses', foundationOnly: true, raw: {version: 1, completed: [0, 70, 144], lastLesson: 144}});
  equal(limited.api.getState().completed.join(','), '0,70,144', 'partial page datasets do not erase valid IDs');
  limited.api.setCompleted(1, true);
  equal(limited.api.getState().completed.join(','), '0,1,70,144', 'all IDs preserved by foundation-only page'); close(limited);

  const sanitized = create({raw: {version: 1, completed: [1, 1, '2', null, -1, 145, 144, 3.5], lastLesson: 999}});
  equal(sanitized.api.getState().completed.join(','), '1,144', 'duplicates and unknown IDs sanitized');
  equal(sanitized.api.getState().lastLesson, null, 'unknown last lesson removed'); close(sanitized);
  for (const raw of ['{invalid', JSON.stringify({version: 99, completed: [1], lastLesson: 1}), JSON.stringify({version: 1, completed: 'invalid'}), 'null', '[1]']) {
    const test = create({page: 'lesson', id: 70, raw});
    equal(test.w.localStorage.getItem(KEY), raw, 'visit does not overwrite corrupt/future schema');
    test.api.setCompleted(70, true); test.api.setCompleted(71, true);
    equal(test.api.getState().completed.join(','), '70,71', 'protected records allow temporary progress');
    equal(test.w.localStorage.getItem(KEY), raw, 'manual progress preserves corrupt/future schema until explicit clear');
    check(test.document.querySelector('[data-progress-storage]').textContent.includes('临时'), 'protected schema warning');
    test.w.confirm = () => true; test.api.clearProgress(); test.api.setCompleted(70, true);
    equal(JSON.parse(test.w.localStorage.getItem(KEY)).version, 1, 'explicit reset enables current schema'); close(test);
  }
  for (const failure of [{blocked: true}, {quota: true}]) {
    const test = create({page: 'lesson', id: 39, ...failure});
    test.api.setCompleted(39, true); test.api.setCompleted(70, true);
    equal(test.api.getState().completed.join(','), '39,70', 'unavailable storage remains usable');
    equal(test.api.getState().storageMode, 'unavailable', 'storage failure exposed');
    check(test.document.querySelector('[data-progress-storage]').textContent.includes('临时'), 'storage fallback visibly explained');
    test.api.setCompleted(39, false);
    equal(test.api.getState().completed.join(','), '70', 'session fallback removal');
    test.w.confirm = () => true; test.api.clearProgress();
    equal(test.api.getState().completed.length, 0, 'session fallback clear'); close(test);
  }
  check(!/\b(?:fetch|XMLHttpRequest|sendBeacon|WebSocket)\s*\(/.test(source.get('learning-progress.js')), 'progress module has no network calls');
  console.log(`PASS learning progress: ${assertions} assertions; 145 stable IDs, 34 series, 8 routes, branch prerequisites, self-report controls, persistence, idempotence, corrupted/future/blocked storage, repeated actions, filtered cards and multi-tab events.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
