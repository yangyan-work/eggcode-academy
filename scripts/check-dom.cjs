#!/usr/bin/env node
'use strict';

// Install jsdom in a separate QA environment or make it available through NODE_PATH.
// Run: NODE_PATH=/path/to/node_modules node --expose-gc scripts/check-dom.cjs
const assert = require('node:assert/strict');
const vm = require('node:vm');
let JSDOM, VirtualConsole;
try { ({ JSDOM, VirtualConsole } = require('jsdom')); }
catch { console.error('DOM QA requires jsdom. Install it in a QA environment and set NODE_PATH to its node_modules directory.'); process.exit(2); }
const { root, pages, read, renderingScripts, loadContent, checkLocalLink, expectedSeries } = require('./check.cjs');
const data = loadContent();
const compiled = new Map();
const tick = ms => new Promise(resolve => setTimeout(resolve, ms));
const live = new Set();
const totals = { routes: 0, svg: 0, refs: 0, series: 0, interaction: 0 };
function open(file, query = '', options = {}) {
  const errors = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', error => errors.push(error));
  const dom = new JSDOM(read(file), { url: 'https://qa.invalid/' + file + query, runScripts: 'outside-only', virtualConsole: vc });
  live.add(dom);
  const w = dom.window;
  const media = new Map();
  w.matchMedia = condition => {
    if (!media.has(condition)) {
      const listeners = new Set();
      const result = { media: condition, matches: condition.includes('reduced-motion') ? options.reduce !== false : !!options.mobile, addEventListener: (_, fn) => listeners.add(fn), removeEventListener: (_, fn) => listeners.delete(fn), set(value) { result.matches = value; listeners.forEach(fn => fn(result)); } };
      media.set(condition, result);
    }
    return media.get(condition);
  };
  w.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
  w.requestAnimationFrame = fn => { fn(0); return 1; };
  w.cancelAnimationFrame = () => {};
  w.HTMLElement.prototype.scrollIntoView = function () { this.dataset.qaScrolled = 'true'; };
  w.HTMLElement.prototype.animate = () => options.animationFailure ? (() => { throw new Error('simulated animation cancellation'); })() : { finished: Promise.resolve() };
  if (w.HTMLDialogElement) {
    w.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
    w.HTMLDialogElement.prototype.close = function () { this.open = false; };
  }
  Object.defineProperty(w.navigator, 'clipboard', { configurable: true, value: { writeText: async text => { if (options.clipboardFailure) throw new Error('simulated clipboard failure'); w.__copied = text; } } });
  w.addEventListener('error', event => errors.push(event.error || new Error(event.message)));
  w.addEventListener('unhandledrejection', event => errors.push(event.reason));
  for (const source of renderingScripts(file, query)) {
    if (!compiled.has(source)) compiled.set(source, new vm.Script(read(source), { filename: source }));
    compiled.get(source).runInContext(dom.getInternalVMContext());
  }
  dom.assertClean = () => assert.equal(errors.length, 0, `${file}${query}: browser errors: ${errors.map(e => e.message).join('; ')}`);
  dom.media = media;
  dom.assertClean();
  return dom;
}
function close(dom) { dom.assertClean(); dom.window.close(); live.delete(dom); }
function visible(element) { return !element.closest('[hidden]'); }
function verifySVG(svg, w, label) {
  const width = Number(svg.getAttribute('width')), height = Number(svg.getAttribute('height'));
  assert(Number.isFinite(width) && width > 0 && Number.isFinite(height) && height > 0, `${label}: invalid dimensions`);
  assert.equal(svg.getAttribute('viewBox'), `0 0 ${width} ${height}`, `${label}: inconsistent viewBox`);
  assert.equal(svg.getAttribute('role'), 'img', `${label}: missing image semantics`);
  assert(svg.querySelector('title')?.textContent && svg.querySelector('desc')?.textContent, `${label}: missing SVG description`);
  const xml = new w.XMLSerializer().serializeToString(svg);
  assert(!/(?:\bundefined\b|\bNaN\b|\bInfinity\b)/.test(xml), `${label}: invalid SVG output`);
  const parsed = new w.DOMParser().parseFromString(xml, 'image/svg+xml');
  assert.equal(parsed.querySelectorAll('parsererror').length, 0, `${label}: malformed XML`);
  assert(svg.querySelectorAll('text').length > 0, `${label}: empty drawing`);
  totals.svg++;
}
function verifyDocument(dom, filename) {
  const doc = dom.window.document;
  const ids = [...doc.querySelectorAll('[id]')].map(element => element.id);
  assert.equal(new Set(ids).size, ids.length, `${filename}: duplicate IDs`);
  for (const element of doc.querySelectorAll('[src],a[href],link[href]')) {
    const value = element.getAttribute('src') || element.getAttribute('href');
    checkLocalLink(value, filename, data.all.length);
    if (value.startsWith('#') && value.length > 1 && !element.hasAttribute('data-series') && !element.hasAttribute('data-family')) assert(doc.getElementById(decodeURIComponent(value.slice(1))), `${filename}: broken local anchor ${value}`);
  }
  assert(!/\b(?:undefined|NaN)\b/.test(doc.querySelector('main').innerHTML), `${filename}: unresolved placeholders`);
}
function input(dom, element, value, type = 'input') {
  element.value = value;
  element.dispatchEvent(new dom.window.Event(type, { bubbles: true }));
}
async function checkLessonRoutes() {
  assert.equal(data.all.length, 145, 'DOM QA must cover all requested 145 routes');
  for (const [id, lesson] of data.all.entries()) {
    const dom = open('lesson.html', '?id=' + id), w = dom.window, doc = w.document, guide = data.guides[id];
    assert.equal(doc.querySelector('#lesson-title').textContent, lesson.title, `route ${id} title`);
    assert.equal(doc.title, lesson.title + ' · 自由树梦想空间');
    assert.equal(doc.querySelector('#lesson-breadcrumb').textContent, lesson.title);
    const series = id < 6 ? null : data.w.EGG_CURRICULUM.series.find(item => item.name === (lesson.series || '积木练习'));
    const parentURL = series ? `practice.html#${series.id}` : 'courses.html';
    assert.equal(doc.querySelector('#lesson-parent').getAttribute('href'), parentURL);
    assert.equal(doc.querySelectorAll('#lesson-toc a').length, data.all.length, `route ${id} TOC count`);
    assert.equal(doc.querySelectorAll('#lesson-toc a[aria-current="page"]').length, 1);
    assert.equal(doc.querySelector('#lesson-toc a[aria-current="page"]').getAttribute('href'), `lesson.html?id=${id}`);
    assert.equal(doc.querySelectorAll('#lesson-steps a').length, guide.sections.length + 3 + Number(Boolean(lesson.challenge)));
    assert.equal(doc.querySelectorAll('.challenge-solution').length, Number(Boolean(lesson.challenge)), `route ${id}: challenge solution coverage`);
    if (lesson.challenge) {
      assert(doc.querySelector('#challenge').textContent.includes(lesson.challenge), `route ${id}: original challenge preserved`);
      assert.equal(doc.querySelector('.challenge-solution').open, false, `route ${id}: solution starts collapsed`);
    }
    assert.equal(doc.querySelector('#lesson-position').textContent, `${id + 1} / 145`);
    const sequence = series ? [...series.lessonIds] : [0, 1, 2, 3, 4, 5], position = sequence.indexOf(id);
    const previousURL = position === 0 ? parentURL : `lesson.html?id=${sequence[position - 1]}`;
    const nextURL = position === sequence.length - 1 ? (series ? parentURL : 'practice.html') : `lesson.html?id=${sequence[position + 1]}`;
    assert.equal(doc.querySelector('#previous-lesson').href, new URL(previousURL, 'https://qa.invalid/').href);
    assert.equal(doc.querySelector('#next-lesson').href, new URL(nextURL, 'https://qa.invalid/').href);
    assert.equal(doc.querySelector('#lesson-count').textContent, '145 课');
    assert.equal(doc.querySelectorAll('.toc-series').length, 35);
    assert.equal(doc.querySelectorAll('.toc-series[open]').length, 1);
    const diagrams = doc.querySelectorAll('#lesson-body .block-figure svg');
    assert.equal(diagrams.length, guide.sections.length, `route ${id}: diagram per section`);
    diagrams.forEach((svg, i) => verifySVG(svg, w, `route ${id} section ${i}`));
    assert.equal(doc.querySelectorAll('.block-reference').length, guide.refs.length, `route ${id}: missing reference links`);
    for (const [index, link] of [...doc.querySelectorAll('.block-reference')].entries()) {
      const url = new URL(link.href);
      assert.equal(url.searchParams.get('id'), guide.refs[index]);
      assert.equal(url.searchParams.get('lesson'), String(id));
      totals.refs++;
    }
    assert.equal(doc.querySelector('#acceptance > ol').children.length, guide.tests.length);
    assert.equal(doc.querySelectorAll('.concept-review').length, id < 6 ? 1 : 0);
    verifyDocument(dom, 'lesson.html');
    close(dom);
    totals.routes++;
    if (id % 10 === 9 && global.gc) global.gc();
  }
  for (const value of ['-1', '145', '99999', 'abc', '1.5', 'NaN', '%3Cscript%3E']) {
    const dom = open('lesson.html', '?id=' + value), doc = dom.window.document;
    assert.equal(doc.querySelector('#lesson-title').textContent, '这堂课暂时不存在');
    assert.equal(doc.querySelector('.lesson-navigation').hidden, true);
    assert.equal(doc.querySelectorAll('#lesson-body svg').length, 0);
    close(dom);
  }
  for (const [query, id] of [['', 0], ['?id=006', 6]]) {
    const dom = open('lesson.html', query);
    assert.equal(dom.window.document.querySelector('#lesson-title').textContent, data.all[id].title);
    close(dom);
  }
  console.log(`PASS DOM lessons: ${totals.routes} routes, ${totals.svg} valid SVG drawings, ${totals.refs} rendered native references, invalid/default IDs`);
}
async function checkLessonInteractions() {
  for (const id of [0, 39, 40, 144]) {
    const dom = open('lesson.html', '?id=' + id), doc = dom.window.document;
    const svg = doc.querySelector('.block-figure svg'), figure = svg.closest('.block-figure');
    for (let i = 0; i < 8; i++) figure.querySelector('[data-diagram="zoom-in"]').click();
    assert.equal(svg.dataset.scale, '2');
    for (let i = 0; i < 10; i++) figure.querySelector('[data-diagram="zoom-out"]').click();
    assert.equal(svg.dataset.scale, '0.5');
    for (let i = 0; i < 2; i++) {
      figure.querySelector('[data-diagram="expand"]').click();
      assert.equal(doc.querySelector('#diagram-dialog').open, true);
      assert.equal(doc.querySelectorAll('#diagram-dialog').length, 1);
      doc.querySelector('[data-close-diagram]').click();
      assert.equal(doc.querySelector('#diagram-dialog').open, false);
    }
    const copy = doc.querySelector('.copy-code');
    copy.click(); await tick(1);
    assert.equal(dom.window.__copied, copy.parentElement.querySelector('code').textContent);
    assert(doc.querySelector('#toast').classList.contains('visible'));
    if (doc.querySelector('#variables')) {
      dom.window.location.hash = 'variables'; await tick(10);
      assert(doc.querySelector('.lesson-preparation').open, `route ${id}: direct variable anchor stays collapsed`);
      assert.equal(doc.querySelector('#variables').dataset.qaScrolled, 'true');
    }
    close(dom); totals.interaction++;
  }
  let dom = open('lesson.html', '?id=40#variables', { mobile: true, clipboardFailure: true }), doc = dom.window.document;
  assert.equal(doc.querySelector('.lesson-outline').open, false);
  assert.equal(doc.querySelector('.course-outline').open, false);
  assert.equal(doc.querySelector('.lesson-preparation').open, true);
  dom.media.get('(max-width: 768px)').set(false);
  assert.equal(doc.querySelector('.lesson-outline').open, true);
  doc.querySelector('.copy-code').click(); await tick(1);
  assert.equal(doc.querySelector('.copy-code').textContent, '已选中，请手动复制');
  assert(dom.window.getSelection().toString().length > 0);
  const tocQuery = doc.querySelector('#lesson-query');
  input(dom, tocQuery, 'NO_MATCH_qa_991700');
  assert.equal([...doc.querySelectorAll('#lesson-toc a')].filter(visible).length, 0);
  assert(doc.querySelector('#lesson-search-status').textContent.includes('0'));
  input(dom, tocQuery, data.all[144].title);
  assert.equal([...doc.querySelectorAll('#lesson-toc a')].filter(visible).length, 1);
  assert.equal([...doc.querySelectorAll('#lesson-toc a')].filter(visible)[0].getAttribute('href'), 'lesson.html?id=144');
  input(dom, tocQuery, '');
  assert.equal([...doc.querySelectorAll('#lesson-toc a')].filter(visible).length, 145);
  assert.equal(doc.querySelectorAll('.toc-series[open]').length, 1);
  close(dom);
  dom = open('lesson.html', '?id=40#%E0%A4%A'); close(dom);
  console.log('PASS lesson interactions: copy/fallback, repeat expand/close, zoom bounds, deep anchors, mobile disclosure changes');
}
async function checkPractice() {
  const dom = open('practice.html'), doc = dom.window.document;
  const cards = [...doc.querySelectorAll('.course-card')];
  assert.equal(cards.length, 139);
  const ids = cards.map(card => Number(new URL(card.href).searchParams.get('id'))).sort((a, b) => a - b);
  assert.deepEqual(ids, Array.from({ length: 139 }, (_, i) => i + 6), 'all practice routes appear exactly once');
  for (const card of cards) {
    const id = Number(new URL(card.href).searchParams.get('id'));
    assert(card.textContent.includes(data.all[id].summary), `practice card ${id} summary`);
    assert(!/undefined|NaN/.test(card.textContent));
  }
  const links = [...doc.querySelectorAll('[data-series]')];
  for (const link of links) {
    dom.window.location.hash = link.dataset.series; await tick(10);
    const active = doc.querySelectorAll('[data-series][aria-current]');
    assert.equal(active.length, 1, `hash ${link.dataset.series}: one selected tab`);
    assert.equal(active[0].dataset.series, link.dataset.series);
    const shown = [...doc.querySelectorAll('.course-card')].filter(visible);
    if (link.dataset.series === 'all') assert.equal(shown.length, 139);
    else {
      assert(shown.length > 0, `hash ${link.dataset.series}: empty series`);
      const series = data.all[Number(new URL(shown[0].href).searchParams.get('id'))].series || '积木练习';
      assert.equal(shown.length, expectedSeries[series], `hash ${link.dataset.series}: wrong count`);
      assert(shown.every(card => (data.all[Number(new URL(card.href).searchParams.get('id'))].series || '积木练习') === series));
      totals.series++;
    }
  }
  for (const hash of ['progression', 'match3', 'gameplay', 'basics']) assert(links.some(link => link.dataset.series === hash), `legacy hash ${hash} missing`);
  dom.window.location.hash = 'unknown-series'; await tick(10);
  assert.equal([...doc.querySelectorAll('.course-card')].filter(visible).length, 139, 'unknown hash should fall back to all');
  dom.window.location.hash = 'all'; await tick(10);
  const query = doc.querySelector('#course-query, #practice-query, main input[type="search"]');
  assert(query, 'expanded practice directory needs search');
  input(dom, query, 'NO_MATCH_qa_991700');
  assert.equal([...doc.querySelectorAll('.course-card')].filter(visible).length, 0, 'search empty state');
  const reset = doc.querySelector('#course-clear, #practice-clear, #practice-reset, main button[type="reset"], #clear-filters');
  assert(reset, 'search reset control missing');
  reset.click(); await tick(10);
  assert.equal(query.value, '', 'reset must clear search');
  assert.equal([...doc.querySelectorAll('.course-card')].filter(visible).length, 139, 'reset should restore directory');
  input(dom, query, data.all[144].title);
  assert.equal([...doc.querySelectorAll('.course-card')].filter(visible).length, 1, 'exact new title search');
  assert.equal(new URL([...doc.querySelectorAll('.course-card')].filter(visible)[0].href).searchParams.get('id'), '144');
  input(dom, query, '');
  const familySelect = doc.querySelector('#practice-family');
  const seriesSelect = doc.querySelector('#practice-series');
  assert(familySelect && seriesSelect, 'directory family and series filters must exist');
  for (const family of data.w.EGG_CURRICULUM.families) {
    input(dom, familySelect, family.id, 'change');
    const expected = data.w.EGG_CURRICULUM.series.filter(s => s.family === family.id);
    assert.equal(doc.querySelectorAll('.course-card').length, expected.reduce((n, s) => n + s.lessonIds.length, 0));
    assert.equal(seriesSelect.options.length, expected.length + 1, 'series options must follow family');
    input(dom, seriesSelect, expected[0].id, 'change');
    assert.equal(doc.querySelectorAll('.course-card').length, expected[0].lessonIds.length);
    assert.equal(dom.window.location.hash, '#' + expected[0].id);
  }
  reset.click(); await tick(10);
  assert.equal(familySelect.value, 'all'); assert.equal(seriesSelect.value, 'all');
  const firstSeries = data.w.EGG_CURRICULUM.series[0], secondSeries = data.w.EGG_CURRICULUM.series[1];
  dom.window.location.hash = firstSeries.id; await tick(10);
  dom.window.location.hash = secondSeries.id; await tick(10);
  dom.window.history.back(); await tick(50);
  assert.equal(seriesSelect.value, firstSeries.id, 'Back must restore prior series');
  assert.equal(doc.querySelectorAll('.course-card').length, firstSeries.lessonIds.length);
  dom.window.history.forward(); await tick(50);
  assert.equal(seriesSelect.value, secondSeries.id, 'Forward must restore next series');
  reset.click(); await tick(10);
  verifyDocument(dom, 'practice.html');
  close(dom);
  const lastSeries = data.w.EGG_CURRICULUM.series.find(item => item.lessonIds.includes(144));
  const normalizedQuery = data.all[144].title.replace(/[0-9A-Z]/g, char => String.fromCharCode(char.charCodeAt(0) + 0xfee0));
  const deep = open('practice.html', '?' + new URLSearchParams({ q: normalizedQuery, family: lastSeries.family }) + '#' + lastSeries.id);
  assert.equal(deep.window.document.querySelector('#practice-query').value, normalizedQuery);
  assert.equal(deep.window.document.querySelector('#practice-family').value, lastSeries.family);
  assert.equal(deep.window.document.querySelector('#practice-series').value, lastSeries.id);
  assert.equal(deep.window.document.querySelectorAll('.course-card').length, 1, 'URL reload/NFKC search must restore a matching new lesson');
  assert.equal(deep.window.document.querySelector('.course-card').dataset.lessonId, '144');
  deep.window.document.querySelector('#practice-reset').click(); await tick(10);
  assert.equal(deep.window.location.search, '', 'reset must remove persisted filter query');
  assert.equal(deep.window.location.hash, '#all');
  close(deep);
  console.log(`PASS practice: all 139 card IDs, ${totals.series} series tabs, family+series filters, legacy/unknown hashes, Back/Forward, search empty/reset, deep URLs and NFKC lookup`);
}
async function checkManual() {
  let dom = open('manual.html'), doc = dom.window.document;
  const query = doc.querySelector('#manual-query'), platform = doc.querySelector('#manual-platform'), category = doc.querySelector('#manual-category'), group = doc.querySelector('#manual-group');
  assert.equal(doc.querySelectorAll('.manual-result').length, 16);
  doc.querySelector('#manual-next').click();
  assert.equal(new URL(dom.window.location.href).searchParams.get('page'), '2');
  assert.equal(doc.querySelector('#manual-prev').disabled, false);
  doc.querySelector('#manual-prev').click();
  assert.equal(new URL(dom.window.location.href).searchParams.get('page'), '1');
  for (const editor of ['移动端', '电脑端']) {
    input(dom, platform, editor, 'change');
    for (const kind of ['', '事件', '动作', '条件', '控制', '取值', '基础']) {
      input(dom, category, kind, 'change');
      const expected = data.manual.entries.filter(entry => (entry.platform === editor || entry.platform === '通用') && (!kind || entry.category === kind));
      assert.equal(doc.querySelectorAll('.manual-result').length, Math.min(16, expected.length));
      const text = doc.querySelector('#manual-result-count').textContent.replaceAll(',', '');
      assert(text.includes(String(expected.length)), `${editor}/${kind}: wrong result count`);
    }
  }
  input(dom, platform, '移动端', 'change'); input(dom, category, '动作', 'change'); input(dom, group, '变量', 'change');
  // Use an actual available group rather than assuming the UI taxonomies match a block category.
  input(dom, group, data.manual.entries.find(e => e.id === 'mobile-1-2').group, 'change');
  input(dom, query, '设置变量');
  assert(doc.querySelectorAll('.manual-result').length > 0);
  const resultURL = new URL(doc.querySelector('.manual-result').href), from = resultURL.searchParams.get('from');
  assert.equal(new URLSearchParams(from).get('q'), '设置变量');
  input(dom, query, 'NO_MATCH_qa_991700');
  assert.equal(doc.querySelectorAll('.manual-result').length, 0);
  assert.equal(doc.querySelector('#manual-empty').hidden, false);
  assert.equal(doc.querySelector('#manual-next').disabled, true);
  doc.querySelector('#manual-clear-empty').click(); await tick(10);
  assert.equal(query.value, ''); assert.equal(platform.value, '移动端'); assert.equal(category.value, ''); assert.equal(group.value, '');
  assert.equal(doc.querySelectorAll('.manual-result').length, 16);
  close(dom);
  dom = open('block.html', resultURL.search); doc = dom.window.document;
  assert.equal(doc.querySelector('#block-back').getAttribute('href'), 'manual.html?' + new URLSearchParams(from));
  verifySVG(doc.querySelector('.block-figure svg'), dom.window, 'manual result block');
  verifyDocument(dom, 'block.html'); close(dom);
  dom = open('manual.html', '?' + from); doc = dom.window.document;
  assert.equal(doc.querySelector('#manual-query').value, '设置变量');
  assert(doc.querySelectorAll('.manual-result').length > 0); close(dom);
  for (const id of [0, 39, 40, 144]) {
    dom = open('block.html', '?id=' + data.guides[id].refs[0] + '&lesson=' + id); doc = dom.window.document;
    assert(doc.querySelector(`a[href="lesson.html?id=${id}"]`), `manual block cannot return to lesson ${id}`); close(dom);
  }
  for (const id of ['-1', '145', 'abc']) {
    dom = open('block.html', '?id=mobile-0-3&lesson=' + id);
    assert(!dom.window.document.querySelector('.block-article header a[href^="lesson.html"]')); close(dom);
  }
  dom = open('block.html', '?id=bad-id');
  assert.equal(dom.window.document.querySelector('#block-content h1').textContent, '这条积木链接不存在'); close(dom);
  const unsafe = new URLSearchParams({ q: '提示', page: '2', redirect: 'https://example.invalid', script: '<script>1</script>' });
  dom = open('block.html', '?id=mobile-0-3&from=' + encodeURIComponent(unsafe));
  assert.equal(dom.window.document.querySelector('#block-back').getAttribute('href'), 'manual.html?' + new URLSearchParams({ q: '提示', page: '2' })); close(dom);
  console.log('PASS manual: both platforms/all categories, group+query, pagination, empty/reset, filtered return URLs and new-lesson backlinks');
}
async function checkHomeAndCourses() {
  let dom = open('courses.html'), doc = dom.window.document;
  const layout = doc.querySelector('.course-map-layout');
  const summary = doc.querySelector('[data-learning-progress-summary]');
  assert.equal(summary.parentElement, layout.parentElement, '学习记录应独立于课程的两列布局');
  assert.equal(layout.previousElementSibling, summary, '学习记录应显示在课程列表上方');
  assert.equal(layout.children.length, 2, '课程布局只应包含主列表和辅助提示');
  assert.equal(layout.firstElementChild.id, 'courses-grid', '课程列表应占据左侧主栏');
  assert(layout.lastElementChild.classList.contains('journey-guide'), '辅助提示应位于右侧');
  assert.equal(doc.querySelectorAll('.course-card').length, 6);
  [...doc.querySelectorAll('.course-card')].forEach((card, id) => assert.equal(card.getAttribute('href'), `lesson.html?id=${id}`));
  verifyDocument(dom, 'courses.html'); close(dom);
  dom = open('index.html'); doc = dom.window.document;
  const button = doc.querySelector('#home-demo'), cells = [...doc.querySelectorAll('[data-cell]')], initial = cells.map(cell => cell.className);
  for (let i = 0; i < 3; i++) {
    button.click(); await tick(1);
    assert.equal(doc.querySelectorAll('.is-cleared').length, 3);
    assert.equal(button.disabled, false);
    button.click(); await tick(1);
    assert.deepEqual(cells.map(cell => cell.className), initial);
  }
  verifyDocument(dom, 'index.html'); close(dom);
  dom = open('index.html', '', { reduce: false, animationFailure: true });
  dom.window.document.querySelector('#home-demo').click(); await tick(1);
  assert.equal(dom.window.document.querySelector('#home-demo').disabled, false);
  assert.equal(dom.window.document.querySelectorAll('.is-cleared').length, 0);
  assert(dom.window.document.querySelector('#demo-status').textContent.includes('重置'));
  close(dom);
  console.log('PASS home/foundations: original card IDs, repeated play/reset and interrupted animation recovery');
}
(async () => {
  try {
    await checkLessonRoutes();
    await checkLessonInteractions();
    await checkPractice();
    await checkManual();
    await checkHomeAndCourses();
    console.log('PASS all DOM QA (layout, downloads and live editor execution require real-browser/editor verification)');
  } catch (error) {
    console.error(error.stack); process.exitCode = 1;
  } finally {
    for (const dom of live) dom.window.close();
  }
})();
