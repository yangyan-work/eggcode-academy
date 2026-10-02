#!/usr/bin/env node
'use strict';

// No installation or build step is required for these content/static checks.
// Run: node scripts/check.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const pages = ['index.html', 'courses.html', 'practice.html', 'lesson.html', 'manual.html', 'block.html', 'editor-guide.html', 'learning-path.html', 'big-number-lab.html', 'verification.html'];
const legacy = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/legacy-lessons.json'), 'utf8'));
const expectedSeries = {
  '积木练习': 6, '消消乐': 6, '玩法拓展': 4, '数值图': 18,
  '背包与物品管理': 3, '装备穿戴与属性计算': 3, '宠物养成系统': 3, '随机掉落与保底': 3,
  '主动技能与冷却': 3, '增益与异常状态': 3, '多阶段Boss': 3, '任务与成就': 3,
  '离线收益': 3, '签到与每日刷新': 3, '多人数据与奖励归属': 3, '存档升级与故障处理': 3,
  '餐厅经营': 4, '农场种植': 4, '钓鱼与图鉴': 4, '工厂流水线': 4,
  '密室逃脱': 4, '双人合作解谜': 4, '推箱子关卡': 4, '分支剧情冒险': 4,
  '躲猫猫': 4, '灾难生存': 4, '团队夺旗': 4, '烫手山芋': 4,
  '回合制卡牌': 4, '节奏点击': 4, '棋盘掷骰冒险': 4,
  '塔防': 3, '肉鸽闯关': 3, '消消乐进阶': 3
};
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const digest = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const localPath = value => decodeURIComponent(new URL(value, 'https://qa.invalid/').pathname).replace(/^\//, '');
const scriptFiles = page => [...read(page).matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/g)].map(match => localPath(match[1]));
const lessonScripts = () => scriptFiles('lesson.html').filter(file => file !== 'app.js');
function loadContent() {
  const context = vm.createContext({ window: {} });
  for (const file of lessonScripts()) new vm.Script(read(file), { filename: file }).runInContext(context);
  const w = context.window;
  const tutorials = [...(w.EGG_TUTORIALS || []), ...(w.EGG_EXPANSION_LESSONS || [])];
  return { w, lessons: w.EGG_LESSONS, tutorials, all: [...w.EGG_LESSONS, ...tutorials], guides: w.EGG_BUILD_GUIDES, manual: w.EGG_MANUAL };
}
function nonempty(value, label) {
  assert.equal(typeof value, 'string', `${label} must be a string`);
  assert(value.trim().length, `${label} must not be empty`);
  assert(!/(?:\bundefined\b|\bNaN\b)/.test(value), `${label} contains an invalid placeholder`);
}
function stringList(value, min, label) {
  assert(Array.isArray(value) && value.length >= min, `${label} needs at least ${min} items`);
  value.forEach((item, index) => nonempty(item, `${label}[${index}]`));
}
function checkLocalLink(reference, from, count) {
  if (!reference || /^(?:#|[a-z][a-z\d+.-]*:|\/\/)/i.test(reference)) return;
  const url = new URL(reference, `https://qa.invalid/${from}`);
  const file = decodeURIComponent(url.pathname).replace(/^\//, '');
  assert(file && !file.startsWith('../'), `${from}: unsafe local reference ${reference}`);
  assert(fs.existsSync(path.join(root, file)), `${from}: missing local reference ${reference}`);
  if (file === 'lesson.html' && url.searchParams.has('id')) {
    const id = url.searchParams.get('id');
    assert(/^\d+$/.test(id) && Number(id) < count, `${from}: invalid lesson URL ${reference}`);
  }
}
function checkContent() {
  const content = loadContent();
  const { w, lessons, tutorials, all, guides, manual } = content;
  assert.equal(lessons.length, 6, 'foundation route count');
  assert.equal(w.EGG_TUTORIALS.length, 34, 'legacy tutorials remain a separate, unchanged list');
  assert(Array.isArray(w.EGG_EXPANSION_LESSONS), 'lesson page does not load added lesson data');
  assert.equal(w.EGG_EXPANSION_LESSONS.length, 105, 'requested added lesson count');
  assert.equal(tutorials.length, 139, 'practice lesson count');
  assert.equal(all.length, 145, 'total lesson count');
  assert.equal(new Set(all.map(item => item.title)).size, all.length, 'duplicate lesson titles');
  assert.equal(Object.keys(guides).length, all.length, 'one guide for each route');
  assert.equal(Object.keys(expectedSeries).length, 34);
  const series = Object.fromEntries(Object.keys(expectedSeries).map(name => [name, tutorials.filter(t => (t.series || '积木练习') === name).length]));
  assert.deepEqual(series, expectedSeries, 'every old and requested series must have the exact lesson count');
  assert.equal(new Set(tutorials.map(t => t.series || '积木练习')).size, 34, 'unexpected series name');

  const curriculum = w.EGG_CURRICULUM;
  assert(curriculum, 'missing curriculum metadata');
  assert.equal(curriculum.foundationCount, 6);
  assert.equal(curriculum.originalCount, 40);
  assert.equal(curriculum.addedCount, 105);
  assert.equal(curriculum.totalCount, 145);
  assert.equal(curriculum.series.length, 34);
  assert.equal(new Set(curriculum.series.map(item => item.id)).size, 34, 'duplicate series hash IDs');
  const families = new Set(curriculum.families.map(item => item.id));
  const listed = [];
  for (const series of curriculum.series) {
    assert(families.has(series.family), `series ${series.name}: invalid family`);
    assert.equal(series.lessonIds.length, expectedSeries[series.name], `series ${series.name}: invalid metadata count`);
    for (const id of series.lessonIds) {
      assert(Number.isInteger(id) && id >= 6 && id < 145, `series ${series.name}: invalid route ${id}`);
      assert.equal(all[id].series || '积木练习', series.name, `series ${series.name}: wrong lesson ${id}`);
      listed.push(id);
    }
  }
  assert.equal(new Set(listed).size, 139, 'series metadata must cover every practice route exactly once');
  assert.equal(listed.length, 139);

  for (const original of legacy.lessons) {
    assert.equal(all[original.id].title, original.title, `legacy route ${original.id} changed title`);
    assert.equal(digest(all[original.id]), original.record, `legacy route ${original.id} content changed`);
    assert.equal(digest(guides[original.id]), original.guide, `legacy guide ${original.id} changed`);
  }
  assert.equal(digest(manual), legacy.manual, 'manual source data changed');
  assert.equal(manual.entries.length, 3871);
  assert.equal(manual.sources.length, 11);
  assert.equal(manual.sources.reduce((sum, source) => sum + source.count, 0), manual.entries.length);
  const byId = new Map(manual.entries.map(entry => [entry.id, entry]));
  assert.equal(byId.size, manual.entries.length, 'manual IDs must be unique');
  const sourceIds = new Set(manual.sources.map(source => source.id));
  for (const entry of manual.entries) {
    ['id', 'title', 'platform', 'category', 'group', 'body'].forEach(key => nonempty(entry[key], `${entry.id}.${key}`));
    assert(sourceIds.has(entry.source), `${entry.id}: missing source`);
  }
  let sections = 0, references = 0;
  for (const [id, lesson] of all.entries()) {
    ['title', 'category'].forEach(key => nonempty(lesson[key], `lesson ${id}.${key}`));
    if (id < lessons.length) nonempty(lesson.content, `foundation ${id}.content`);
    else {
      ['summary', 'goal', 'prepare', 'flow', 'expected'].forEach(key => nonempty(lesson[key], `tutorial ${id}.${key}`));
      stringList(lesson.steps, 4, `tutorial ${id}.steps`);
      stringList(lesson.pitfalls, 3, `tutorial ${id}.pitfalls`);
      stringList(lesson.blocks, 1, `tutorial ${id}.blocks`);
      for (const name of lesson.blocks) {
        if (name.startsWith('【自建】')) {
          assert(JSON.stringify(guides[id]).includes(name), `lesson ${id}: missing custom definition ${name}`);
          continue;
        }
        assert(manual.entries.some(entry => entry.platform === '移动端' && entry.title === name && (!lesson.blockGroups?.[name] || entry.group === lesson.blockGroups[name])), `lesson ${id}: invalid native block ${name}`);
      }
    }
    const guide = guides[id];
    assert(guide, `lesson ${id}: missing guide`);
    stringList(guide.setup, 1, `guide ${id}.setup`);
    stringList(guide.tests, id >= 40 ? 3 : 2, `guide ${id}.tests`);
    stringList(guide.refs, 1, `guide ${id}.refs`);
    assert(Array.isArray(guide.variables), `guide ${id}: variables must be an array`);
    if (id >= 40) assert(guide.variables.length, `new lesson ${id}: missing variable table`);
    const names = new Set();
    guide.variables.forEach((row, i) => {
      stringList(row, 3, `guide ${id}.variables[${i}]`);
      assert.equal(row.length, 3, `guide ${id}: variable table column count`);
      assert(!names.has(row[0]), `guide ${id}: duplicate variable ${row[0]}`);
      names.add(row[0]);
    });
    assert(Array.isArray(guide.sections) && guide.sections.length >= (id >= 40 ? 3 : 2), `guide ${id}: missing detailed steps`);
    for (const [i, section] of guide.sections.entries()) {
      ['title', 'tree', 'verify'].forEach(key => nonempty(section[key], `guide ${id}.sections[${i}].${key}`));
      stringList(section.steps, 2, `guide ${id}.sections[${i}].steps`);
      const roots = w.EGG_BLOCKS.fromTree(section.tree, { definition: /自定义动作|封装成自定义/.test(section.title), variables:guide.variables, sections:guide.sections });
      assert(roots.length, `guide ${id} section ${i}: empty block tree`);
      const markup = w.EGG_BLOCKS.svg(roots, section.title);
      assert(markup.startsWith('<svg '), `guide ${id} section ${i}: missing SVG`);
      assert(!/(?:\bundefined\b|\bNaN\b|\bInfinity\b)/.test(markup), `guide ${id} section ${i}: invalid SVG numeric output`);
      sections++;
      if (section.editorPhoto) checkLocalLink(section.editorPhoto.src, 'lesson.html', all.length);
    }
    if (guide.samples?.length) {
      const columns = guide.samples[0].length;
      assert(columns > 0, `guide ${id}: empty samples table`);
      guide.samples.forEach(row => assert.equal(row.length, columns, `guide ${id}: inconsistent samples columns`));
    }
    if (guide.pitfalls) stringList(guide.pitfalls, 1, `guide ${id}.pitfalls`);
    for (const ref of guide.refs) {
      assert(byId.has(ref), `guide ${id}: broken manual reference ${ref}`);
      assert.equal(byId.get(ref).platform, '移动端', `guide ${id}: wrong-platform native reference ${ref}`);
      references++;
    }
  }
  for (const file of fs.readdirSync(root).filter(file => file.endsWith('.js'))) new vm.Script(read(file), { filename: file });
  for (const page of pages) {
    const html = read(page);
    assert(html.includes('data-foundation-count="6"'), `${page}: wrong foundation metadata`);
    assert(html.includes('data-lesson-count="145"'), `${page}: stale total metadata`);
    for (const match of html.matchAll(/\b(?:src|href)\s*=\s*(["'])(.*?)\1/g)) checkLocalLink(match[2], page, all.length);
    assert(!/(?:40\s*(?:篇教程|课)|34\s*篇)/.test(html), `${page}: stale visible course count`);
    const scripts = scriptFiles(page);
    assert.equal(new Set(scripts).size, scripts.length, `${page}: duplicate script load`);
    if(!['editor-guide.html','verification.html'].includes(page)) assert.equal(scripts.at(-1), 'app.js', `${page}: app must load after its data`); else assert.equal(scripts.length,0,'Primer remains readable without JS');
  }
  const scripts = scriptFiles('lesson.html');
  for (const file of ['lessons-data.js', 'tutorials.js', 'manual-data.js', 'build-guides.js', 'progression-guides.js', 'curriculum-expansion.js', 'block-diagram-data.js', 'block-diagrams.js']) assert(scripts.includes(file), `lesson page does not load ${file}`);
  const guideChunks = fs.readdirSync(root).filter(file => /^curriculum-guides(?:-\d+)?\.js$/.test(file));
  const lessonChunks = fs.readdirSync(root).filter(file => /^curriculum-lessons(?:-\d+)?\.js$/.test(file));
  assert(guideChunks.length && lessonChunks.length, 'missing generated curriculum chunks');
  for (const file of [...guideChunks, ...lessonChunks]) {
    assert(scripts.includes(file), `lesson page does not load ${file}`);
    assert(scripts.indexOf('curriculum-expansion.js') < scripts.indexOf(file), `metadata must initialize before ${file}`);
    assert(scripts.indexOf(file) < scripts.indexOf('block-diagrams.js'), `renderer must snapshot symbols after ${file}`);
  }
  for (const match of read('styles.css').matchAll(/url\(["']?([^)'"\s]+)["']?\)/g)) checkLocalLink(match[1], 'styles.css', all.length);
  console.log(`PASS content: ${all.length} routes, ${tutorials.length} tutorials, 34 series, ${sections} SVG sections, ${references} native references`);
  console.log(`PASS preservation: original 40 records/guides and 3,871 manual entries match git ${legacy.sourceCommit.slice(0, 7)}`);
  console.log(`PASS static: ${pages.length} HTML pages, script ordering, local assets, metadata, all JavaScript syntax`);
  return { ...content, sections, references };
}
module.exports = { root, pages, read, scriptFiles, loadContent, checkContent, checkLocalLink, expectedSeries };
if (require.main === module) {
  try { checkContent(); } catch (error) { console.error(`FAIL: ${error.message}`); process.exitCode = 1; }
}
