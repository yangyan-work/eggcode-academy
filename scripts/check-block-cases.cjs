#!/usr/bin/env node
'use strict';
// 仅核对文档、参数及现有SVG集成，不执行原生蛋码。
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const context = vm.createContext({window: {}});
for (const file of ['manual-data.js', 'block-curated.js', 'block-examples.js', 'block-diagram-data.js', 'block-diagrams.js']) {
  new vm.Script(fs.readFileSync(path.join(root, file), 'utf8'), {filename: file}).runInContext(context);
}
const w = context.window;
const plain = value => JSON.parse(JSON.stringify(value));
const specs = [
  ['mobile-0-26', 'desktop-0-26', '试验球碰撞'],
  ['mobile-0-87', 'desktop-0-87', '地面'],
  ['mobile-0-104', 'desktop-0-104', 'N碰到物体'],
  ['mobile-0-93', 'desktop-0-93', '离开'],
  ['mobile-0-105', 'desktop-0-105', '进入L'],
  ['mobile-0-108', 'desktop-0-108', '不重叠的U'],
  ['mobile-0-30', 'desktop-0-30', 'N已销毁'],
  ['mobile-1-133', 'desktop-1-134', '(3,0,4)'],
  ['mobile-1-247', 'desktop-1-250', 'M不因该动作'],
  ['mobile-1-310', 'desktop-1-313', 'U仍能'],
  ['mobile-1-14', 'desktop-1-14', '提醒到期'],
  ['mobile-1-315', 'desktop-1-318', '(3,0,4)'],
  ['mobile-4-357', 'desktop-4-357', '(6,0,4)'],
  ['mobile-1-127', 'desktop-1-128', 'READY 3'],
  ['mobile-1-335', 'desktop-1-338', 'B2'],
  ['mobile-4-552', 'desktop-4-552', 'A1'],
  ['mobile-2-11', 'desktop-2-11', '物理关'],
  ['mobile-2-13', 'desktop-2-13', '禁止抓举'],
  ['mobile-2-14', 'desktop-2-14', '点击关'],
  ['mobile-2-15', 'desktop-2-15', '拖动关'],
  ['mobile-2-18', 'desktop-2-18', '真、假、真'],
  ['mobile-2-21', 'desktop-2-21', '假、真、假']
];
const byId = new Map(w.EGG_MANUAL.entries.map(entry => [entry.id, entry]));
const covered = w.EGG_CURATED.flatMap(example => example.exactIds);
assert.equal(new Set(covered).size, covered.length, '精修ID重复覆盖');
assert.equal(w.EGG_CURATED.length, 292 + specs.length, '保留原292例并追加22例');
const added = w.EGG_CURATED.slice(292);
assert.deepEqual(plain(added.flatMap(example => example.exactIds)), specs.flatMap(([a, b]) => [a, b]));
let checked = 0;
for (const [index, example] of added.entries()) {
  assert(example.explanation.includes('尚未原生实测'), example.title + ': 保留验证边界');
  assert(example.setup.length >= 2 && example.steps.length >= 3);
  assert(example.expected.includes(specs[index][2]), example.title + ': 具体可观察预期');
  assert(example.pitfalls.some(text => text.startsWith('反例：')), example.title + ': 缺少反例');
  let pairedSVG;
  for (const id of example.exactIds) {
    const entry = byId.get(id);
    assert(entry, id + ': 不存在的手册ID');
    assert.equal(entry.title, example.title, id + ': 名称不匹配');
    assert.equal(entry.group, example.group, id + ': 对象域不匹配');
    const section = entry.body.match(/#### 参数\s*([\s\S]*?)(?=\n#{3,6} |$)/)?.[1] || '';
    const types = [...section.matchAll(/^\d+\.\s*(.+)$/gm)].map(match => match[1].trim());
    assert.deepEqual(plain(example.parameterTypes), types, id + ': 原文参数类型或顺序变化');
    assert.equal(example.diagramInputs.length, types.length, id + ': 图示参数槽数量');
    const ex = w.EGG_EXAMPLE_FOR(entry);
    assert.equal(ex.mode, '搭建示例');
    assert.equal(ex.expected, example.expected, id + ': 实际页面未采用精修预期');
    assert.deepEqual(plain(ex.diagramInputs), plain(example.diagramInputs), id + ': 图示仍用默认参数');
    const diagram = w.EGG_BLOCKS.forEntry(entry, ex);
    const svg = w.EGG_BLOCKS.svg(diagram.roots, example.name);
    assert(!/\b(?:undefined|NaN|Infinity)\b/.test(svg), id + ': SVG无效');
    if (pairedSVG) assert.equal(svg, pairedSVG, id + ': 两端对应图示不一致');
    pairedSVG = svg;
    for (const input of example.diagramInputs) assert(svg.includes(input.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]))), id + ': SVG丢失具体输入');
    checked++;
  }
}
console.log(`PASS curated cases: ${added.length} distinct scenarios, ${checked} native IDs; exact source parameters, object domains, counterexamples and SVG inputs. Native editor not tested.`);
