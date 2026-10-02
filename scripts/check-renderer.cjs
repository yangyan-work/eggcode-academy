#!/usr/bin/env node
'use strict';

// Focused, dependency-free teaching diagram regressions. Run: node scripts/check-renderer.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const context = vm.createContext({ window: {} });
for (const file of ['lessons-data.js', 'tutorials.js', 'manual-data.js', 'build-guides.js', 'progression-guides.js']) {
  new vm.Script(read(file), { filename: file }).runInContext(context);
}
const w = context.window;
const legacyGuides = Object.values(w.EGG_BUILD_GUIDES);
const newGuides = fs.readdirSync(path.join(root, 'curriculum-source')).filter(file => file.endsWith('.json')).sort()
  .flatMap(file => JSON.parse(read('curriculum-source/' + file)).map(item => item.guide));
assert.equal(legacyGuides.length, 40);
assert.equal(newGuides.length, 105);
// Match the app's requirement to expose every guide's symbols before loading the renderer.
newGuides.forEach((guide, index) => { w.EGG_BUILD_GUIDES[40 + index] = guide; });
new vm.Script(read('block-diagrams.js'), { filename: 'block-diagrams.js' }).runInContext(context);
const blocks = w.EGG_BLOCKS;
const plain = value => JSON.parse(JSON.stringify(value));
const tree = source => plain(blocks.fromTree(source));
const exp = source => tree('如果 ' + source)[0].parts[1];
const shape = node => typeof node === 'string' ? node : node.parts ? node.parts.map(shape) : node.text;
const expr = source => shape(exp(source));
const compare = (left, operator, right) => ['比较', left, operator, right];
const arithmetic = (left, operator, right) => ['整数运算', left, operator, right];
let regressions = 0;
function check(name, run) { try { run(); regressions++; } catch (error) { error.message = name + ': ' + error.message; throw error; } }

check('chained inequalities use adjacent comparisons', () => {
  assert.deepEqual(expr('0≤p<2'), ['与', compare('0', '≤', 'p'), compare('p', '<', '2')]);
  assert.deepEqual(expr('1<=q<=99999'), ['与', compare('1', '<=', 'q'), compare('q', '<=', '99999')]);
  assert.deepEqual(expr('0<p<q<10'), ['与', ['与', compare('0', '<', 'p'), compare('p', '<', 'q')], compare('q', '<', '10')]);
});
check('comparison chains preserve boolean precedence and grouping', () => {
  assert.deepEqual(expr('0≤p<2 且 1≤q≤99999 或 p=9'), ['或', ['与', ['与', compare('0', '≤', 'p'), compare('p', '<', '2')], ['与', compare('1', '≤', 'q'), compare('q', '≤', '99999')]], compare('p', '=', '9')]);
  assert.deepEqual(expr('(a=1 或 b=2) 且 c=3'), ['与', ['或', compare('a', '=', '1'), compare('b', '=', '2')], compare('c', '=', '3')]);
  assert.deepEqual(expr('a<(b<c)'), compare('a', '<', compare('b', '<', 'c')));
});
check('all supported comparison spellings and invalid exclamation safety', () => {
  for (const operator of ['!=', '≠', '>=', '<=', '≥', '≤', '=', '>', '<']) assert.deepEqual(expr('a' + operator + 'b'), compare('a', operator, 'b'));
  assert.deepEqual(exp('a!b'), { kind: 'literal', text: 'a!b' });
  assert.deepEqual(exp('a<'), { kind: 'literal', text: 'a<' });
});
check('arithmetic precedence, grouping and associativity', () => {
  assert.deepEqual(expr('a+b×c'), arithmetic('a', '+', arithmetic('b', '×', 'c')));
  assert.deepEqual(expr('(a+b)×(c+d)'), arithmetic(arithmetic('a', '+', 'b'), '×', arithmetic('c', '+', 'd')));
  assert.deepEqual(expr('（a+b）×（c+d）'), arithmetic(arithmetic('a', '+', 'b'), '×', arithmetic('c', '+', 'd')));
  assert.deepEqual(expr('a−b−c'), arithmetic(arithmetic('a', '−', 'b'), '−', 'c'));
  assert.deepEqual(expr('a÷b×c'), arithmetic(arithmetic('a', '÷', 'b'), '×', 'c'));
  assert.deepEqual(expr('2×(3+4)=14'), compare(arithmetic('2', '×', arithmetic('3', '+', '4')), '=', '14'));
});
check('signed numeric operands remain complete literals', () => {
  assert.deepEqual(expr('a×−1'), arithmetic('a', '×', '−1'));
  assert.deepEqual(expr('a*-1'), arithmetic('a', '*', '-1'));
  assert.deepEqual(expr('a−−1'), arithmetic('a', '−', '−1'));
  assert.deepEqual(expr('a+−1'), arithmetic('a', '+', '−1'));
  assert.deepEqual(tree('运行计时器〔1秒,-1次（无限）,false〕')[0].parts.slice(1).map(shape), ['1秒', '-1次（无限）', '假']);
});
check('same-line assignments and bracketed actions stay separate', () => {
  const roots = tree('状态←1；发送信息〔逃脱成功，核对得分〕');
  assert.equal(roots.length, 2);
  assert.deepEqual(roots[0].parts.map(shape), ['设置变量', '状态', '=', '1']);
  assert.deepEqual(roots[1].parts.map(shape), ['发送信息', '逃脱成功，核对得分']);
  const custom = tree('【自建】查宠物〔AUID〕；材料行A←宠物查找');
  assert.equal(custom.length, 2);
  assert.deepEqual(custom[0].parts.map(shape), ['自定义动作', '查宠物', 'AUID']);
  assert.equal(custom[1].parts[0], '设置变量');
});
check('quoted and bracketed text never becomes a statement or expression connector', () => {
  const roots = tree('x←“a；b → c”；发送信息〔第一条；第二条 → 完成〕');
  assert.equal(roots.length, 2);
  assert.equal(roots[0].parts[3].text, 'a；b → c');
  assert.equal(roots[1].parts[1].text, '第一条；第二条 → 完成');
  assert.deepEqual(expr('a=“x且y<z”'), compare('a', '=', 'x且y<z'));
  assert.deepEqual(expr('列表存在元素〔候选，“a,b；c”〕'), ['列表存在元素', '候选', 'a,b；c']);
});
check('native conditions use boolean block shapes', () => {
  assert.equal(exp('列表存在元素〔合宠回执，合宠键〕').kind, 'condition');
  assert.equal(exp('技能是否在冷却中〔训练斩实例〕').kind, 'condition');
  assert.equal(exp('随机整数〔1,100〕').kind, 'value');
});
check('else-if retains the second condition', () => {
  const roots = tree('如果 钓鱼状态=2\n  钓鱼状态←0\n否则如果 钓鱼状态=1 → 钓鱼状态←0；剩余拍←0');
  assert.equal(roots.length, 1);
  assert.equal(roots[0].otherwise.length, 1);
  const nested = roots[0].otherwise[0];
  assert.equal(nested.kind, 'control');
  assert.deepEqual(shape(nested.parts[1]), compare('钓鱼状态', '=', '1'));
  assert.equal(nested.children.length, 2);
});
check('else prose and unsupported statements remain visible notes', () => {
  const roots = tree('如果 状态=1\n  状态←2\n否则状态2 → 剩余拍−1；到0设状态0\n未知教学说明');
  assert.equal(roots.length, 3);
  assert.equal(roots[0].otherwise, undefined);
  assert.equal(roots[1].kind, 'note');
  assert.equal(roots[1].parts[0], '否则状态2 → 剩余拍−1；到0设状态0');
  assert.equal(roots[2].kind, 'note');
});
check('ordinary else, child nesting and custom definitions still work', () => {
  const roots = tree('游戏初始化\n  如果 a=1\n    状态←1；发送信息〔成功；已记录〕\n  否则 → 状态←0；发送信息〔失败〕');
  assert.equal(roots.length, 1);
  const branch = roots[0].children[0];
  assert.equal(branch.children.length, 2);
  assert.equal(branch.otherwise.length, 2);
  assert.equal(branch.children[1].parts[1].text, '成功；已记录');
  const definition = blocks.fromTree('【自建】检查\n状态←0\n如果 状态=0\n  状态←1', { definition: true });
  assert.equal(definition.length, 1);
  assert.equal(definition[0].children.length, 2);
});
check('SVG escapes text and labels safely', () => {
  const svg = blocks.svg(blocks.fromTree('发送信息〔<script>&"〕'), '<测试>');
  assert(svg.includes('aria-label="&lt;测试&gt;"'));
  assert(svg.includes('&lt;script&gt;&amp;&quot;'));
  assert(!svg.includes('<script>'));
});

let sections = 0;
for (const [index, guide] of [...legacyGuides, ...newGuides].entries()) {
  for (const section of guide.sections) {
    const roots = blocks.fromTree(section.tree, { definition: /自定义动作|封装成自定义/.test(section.title) });
    const svg = blocks.svg(roots, section.title);
    const size = /width="(\d+)" height="(\d+)" viewBox="0 0 (\d+) (\d+)"/.exec(svg);
    assert(size && +size[1] > 0 && +size[2] > 0, `guide ${index}: invalid SVG dimensions`);
    assert.equal(size[1], size[3]); assert.equal(size[2], size[4]);
    assert(!/\b(?:NaN|undefined|Infinity)\b/.test(svg), `guide ${index}: invalid SVG`);
    sections++;
  }
}
console.log(`PASS renderer: ${regressions} focused regression groups; all 40 legacy + 105 new guides, ${sections} SVG sections`);
