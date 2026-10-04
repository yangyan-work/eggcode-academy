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
    assert.equal(doc.querySelector('#acceptance > details.logic-summary > ol').children.length, guide.tests.length);
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
  const removed = '.practice-banner, .practice-group, .learning-lesson-list, #series-status';
  const query = doc.querySelector('#practice-query'), reset = doc.querySelector('#practice-reset');
  const familySelect = doc.querySelector('#practice-family'), seriesSelect = doc.querySelector('#practice-series');
  assert(query && reset && familySelect && seriesSelect, '玩法页搜索、重置和两级筛选必须保留');
  const catalog = data.w.EGG_CURRICULUM.series;
  const familyIds = family => Array.from(catalog).filter(item => item.family === family).flatMap(item => Array.from(item.lessonIds));
  function verifyResults(expected, label, active = true, document = doc) {
    const grid = document.querySelector('#practice-grid'), empty = document.querySelector('#practice-empty');
    assert(grid?.classList.contains('course-grid') && empty, `${label}: 保留卡片网格和无结果提示`);
    assert.equal(grid.hidden, !expected.length, `${label}: 卡片网格显示状态`);
    assert.equal(empty.hidden, !active || !!expected.length, `${label}: 无结果提示显示状态`);
    const cards = [...document.querySelectorAll('.course-card')];
    assert.deepEqual(cards.map(card => Number(card.dataset.lessonId)), expected, `${label}: 匹配课程 ID 和顺序`);
    cards.forEach(card => {
      const id = Number(card.dataset.lessonId);
      assert(grid.contains(card), `${label}: 卡片位于单一网格中`);
      assert(id >= 6 && id < data.all.length, `${label}: 保留原课程 ID`);
      assert.equal(card.getAttribute('href'), `lesson.html?id=${id}`, `${label}: 卡片课程链接`);
    });
    assert.equal(document.querySelectorAll(removed).length, 0, `${label}: 不恢复介绍横幅、专题分组、文字列表或结果统计`);
    assert(!/找到\s*\d+\s*(?:篇|课|个?专题)/.test(document.querySelector('main').textContent), `${label}: 不显示找到数量统计`);
  }
  verifyResults([], '默认未填写', false);
  for (const whitespace of ['   ', '\t\n', '\u3000', ' \u3000\u00a0 ']) {
    input(dom, query, whitespace);
    verifyResults([], '空白搜索', false);
    assert.equal(new URLSearchParams(dom.window.location.search).has('q'), false, '空白搜索不写入查询参数');
  }
  input(dom, query, '');
  assert.equal(data.w.EGG_CURRICULUM.series.length, 34);
  assert.equal(data.w.EGG_CURRICULUM.families.length, 6);
  const links = [...doc.querySelectorAll('[data-series]')];
  assert.deepEqual(links.map(link => link.dataset.series), Array.from(data.w.EGG_CURRICULUM.series, series => series.id));
  const familyLinks = [...doc.querySelectorAll('[data-family]')];
  assert.deepEqual(familyLinks.map(link => link.dataset.family), ['all', ...Array.from(data.w.EGG_CURRICULUM.families, family => family.id)]);
  assert.equal(familySelect.options.length, 7);
  assert.equal(seriesSelect.options.length, 35);
  for (const link of links) {
    const series = data.w.EGG_CURRICULUM.series.find(item => item.id === link.dataset.series);
    assert.equal(link.getAttribute('href'), '#' + series.id);
    assert(link.textContent.includes(series.name), `专题 ${series.id} 名称`);
    dom.window.location.hash = link.dataset.series; await tick(10);
    const active = doc.querySelectorAll('[data-series][aria-current]');
    assert.equal(active.length, 1, `hash ${link.dataset.series}: one selected tab`);
    assert.equal(active[0].dataset.series, link.dataset.series);
    assert.equal(seriesSelect.value, series.id);
    assert.equal(familySelect.value, series.family);
    assert.equal(doc.querySelector('[data-family][aria-current]').dataset.family, series.family);
    assert.equal(seriesSelect.options.length, data.w.EGG_CURRICULUM.series.filter(item => item.family === series.family).length + 1);
    verifyResults(Array.from(series.lessonIds), `切换 ${series.id}`);
    totals.series++;
  }
  for (const hash of ['progression', 'match3', 'gameplay', 'basics']) assert(links.some(link => link.dataset.series === hash), `legacy hash ${hash} missing`);
  for (const link of familyLinks) {
    const family = link.dataset.family;
    assert.equal(link.getAttribute('href'), family === 'all' ? '#all' : '#family-' + family);
    dom.window.location.hash = link.hash; await tick(10);
    assert.equal(familySelect.value, family, '方向锚点应同步筛选');
    assert.equal(seriesSelect.value, 'all');
    assert.equal(doc.querySelectorAll('[data-series][aria-current]').length, 0);
    assert.equal(doc.querySelectorAll('[data-family][aria-current]').length, 1);
    assert.equal(doc.querySelector('[data-family][aria-current]').dataset.family, family);
    verifyResults(family === 'all' ? [] : familyIds(family), `方向锚点 ${family}`, family !== 'all');
  }
  dom.window.location.hash = 'unknown-series'; await tick(10);
  assert.equal(familySelect.value, 'all', 'unknown hash should fall back to all');
  assert.equal(seriesSelect.value, 'all');
  assert.equal(doc.querySelectorAll('[data-series][aria-current]').length, 0);
  verifyResults([], '未知专题回退默认', false);
  dom.window.location.hash = 'all'; await tick(10);
  input(dom, query, 'NO_MATCH_qa_991700');
  assert.equal(new URLSearchParams(dom.window.location.search).get('q'), 'NO_MATCH_qa_991700', '搜索输入应保存查询参数');
  verifyResults([], '无匹配搜索');
  reset.click(); await tick(10);
  assert.equal(query.value, '', 'reset must clear search');
  assert.equal(dom.window.location.search, '');
  assert.equal(dom.window.location.hash, '#all');
  assert.equal(doc.activeElement, query, '重置后返回搜索框焦点');
  verifyResults([], '重置无匹配搜索', false);
  input(dom, query, data.all[144].title);
  assert.equal(new URLSearchParams(dom.window.location.search).get('q'), data.all[144].title);
  verifyResults([144], '精确课程标题搜索');
  input(dom, query, data.all[144].title + ' NO_MATCH_qa_991700');
  verifyResults([], '多个关键词必须全部命中');
  input(dom, query, '');
  verifyResults([], '清空关键词', false);
  for (const family of data.w.EGG_CURRICULUM.families) {
    input(dom, familySelect, family.id, 'change');
    const expected = data.w.EGG_CURRICULUM.series.filter(s => s.family === family.id);
    assert.equal(seriesSelect.value, 'all', '方向 change 应重置具体专题');
    assert.equal(seriesSelect.options.length, expected.length + 1, 'series options must follow family');
    assert.equal(new URLSearchParams(dom.window.location.search).get('family'), family.id);
    assert.equal(dom.window.location.hash, '#family-' + family.id);
    verifyResults(familyIds(family.id), `选择方向 ${family.id}`);
    input(dom, seriesSelect, expected[0].id, 'change');
    assert.equal(dom.window.location.hash, '#' + expected[0].id);
    assert.equal(doc.querySelector('[data-series][aria-current]').dataset.series, expected[0].id);
    verifyResults(Array.from(expected[0].lessonIds), `选择专题 ${expected[0].id}`);
  }
  reset.click(); await tick(10);
  assert.equal(familySelect.value, 'all'); assert.equal(seriesSelect.value, 'all');
  verifyResults([], '重置两级筛选', false);
  const lastSeries = catalog.find(item => item.lessonIds.includes(144));
  input(dom, familySelect, lastSeries.family, 'change');
  input(dom, seriesSelect, lastSeries.id, 'change');
  input(dom, query, data.all[144].title);
  verifyResults([144], '关键词、方向和专题联合筛选');
  input(dom, query, '');
  verifyResults(Array.from(lastSeries.lessonIds), '清空关键词仍保留专题筛选');
  input(dom, seriesSelect, 'all', 'change');
  verifyResults(familyIds(lastSeries.family), '清空专题仍保留方向筛选');
  input(dom, familySelect, 'all', 'change');
  verifyResults([], '清空所有筛选', false);
  input(dom, query, data.all[144].title);
  input(dom, familySelect, catalog.find(item => item.family !== lastSeries.family).family, 'change');
  verifyResults([], '方向与关键词必须同时命中');
  reset.click(); await tick(10);
  const firstSeries = data.w.EGG_CURRICULUM.series[0], secondSeries = data.w.EGG_CURRICULUM.series[1];
  dom.window.location.hash = firstSeries.id; await tick(10);
  dom.window.location.hash = secondSeries.id; await tick(10);
  dom.window.history.back(); await tick(50);
  assert.equal(seriesSelect.value, firstSeries.id, 'Back must restore prior series');
  assert.equal(familySelect.value, firstSeries.family);
  assert.equal(doc.querySelector('[data-series][aria-current]').dataset.series, firstSeries.id);
  verifyResults(Array.from(firstSeries.lessonIds), 'Back 恢复专题卡片');
  dom.window.history.forward(); await tick(50);
  assert.equal(seriesSelect.value, secondSeries.id, 'Forward must restore next series');
  assert.equal(familySelect.value, secondSeries.family);
  assert.equal(doc.querySelector('[data-series][aria-current]').dataset.series, secondSeries.id);
  verifyResults(Array.from(secondSeries.lessonIds), 'Forward 恢复专题卡片');
  reset.click(); await tick(10);
  verifyDocument(dom, 'practice.html');
  close(dom);
  const normalizedQuery = data.all[144].title.replace(/[0-9A-Z]/g, char => String.fromCharCode(char.charCodeAt(0) + 0xfee0));
  const deep = open('practice.html', '?' + new URLSearchParams({ q: normalizedQuery, family: lastSeries.family }) + '#' + lastSeries.id);
  assert.equal(deep.window.document.querySelector('#practice-query').value, normalizedQuery);
  assert.equal(deep.window.document.querySelector('#practice-family').value, lastSeries.family);
  assert.equal(deep.window.document.querySelector('#practice-series').value, lastSeries.id);
  assert.equal(deep.window.document.querySelector('[data-series][aria-current]').dataset.series, lastSeries.id);
  verifyResults([144], 'NFKC 查询与两级筛选深链接', true, deep.window.document);
  const submittedQuery = '  计时器 Ａ１  ';
  deep.window.document.querySelector('#practice-query').value = submittedQuery;
  const submit = new deep.window.Event('submit', { bubbles: true, cancelable: true });
  deep.window.document.querySelector('#practice-filters').dispatchEvent(submit);
  assert.equal(submit.defaultPrevented, true, '提交搜索应保存当前页状态');
  assert.equal(new URLSearchParams(deep.window.location.search).get('q'), submittedQuery.trim());
  assert.equal(new URLSearchParams(deep.window.location.search).get('family'), lastSeries.family);
  assert.equal(deep.window.location.hash, '#' + lastSeries.id);
  deep.window.document.querySelector('#practice-reset').click(); await tick(10);
  assert.equal(deep.window.location.search, '', 'reset must remove persisted filter query');
  assert.equal(deep.window.location.hash, '#all');
  verifyResults([], '深链接重置', false, deep.window.document);
  close(deep);
  for (const suffix of ['?q=' + encodeURIComponent('\u3000'), '#all']) {
    const blank = open('practice.html', suffix);
    verifyResults([], '空白或全部筛选深链接', false, blank.window.document);
    close(blank);
  }
  console.log(`PASS practice: cards only after nonblank query or selected filters, ${totals.series} series, 6 families, AND search, empty/reset, legacy/unknown hashes, Back/Forward and deep URLs`);
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
  assert.deepEqual([...doc.querySelectorAll('.home-entry')].map(link=>link.getAttribute('href')),['lesson.html?id=0','practice.html','manual.html','personal-space.html']);
  const search=doc.querySelector('.home-find');
  assert.equal(search.getAttribute('action'),'practice.html');
  assert.equal(search.querySelector('input').name,'q');
  assert.equal(doc.querySelector('#home-demo'),null,'简化首页只展示真实课程入口');
  verifyDocument(dom, 'index.html'); close(dom);
  console.log('PASS home/foundations: original course IDs; four direct learning links and native GET search');
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
