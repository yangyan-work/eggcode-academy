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
const tree = source => plain(blocks.fromTree(source,{variables:['a','b','c','d'].map(n=>[n,'整数','0'])}));
const exp = source => tree('如果 ' + source)[0].parts[1];
const shape = node => typeof node === 'string' ? node : node.parts ? node.parts.map(shape) : node.text;
const expr = source => shape(exp(source));
const compare = (left, operator, right) => ['比较', left, operator, right];
const arithmetic = (left, operator, right) => ['整数运算(+-×÷)', left, operator, right];
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
check('per-lesson list types and decimal arithmetic are not mislabeled', () => {
  const typed=plain(blocks.fromTree('设置组件坐标〔敌人组件[s]，路点坐标[0]〕',{variables:[['敌人组件','组件列表','空'],['路点坐标','坐标点列表','空'],['s','整数','0']]}));
  assert.equal(typed[0].parts[1].parts[0],'列表取值：组件');
  assert.equal(typed[0].parts[2].parts[0],'列表取值：坐标点');
  const decimal=plain(blocks.fromTree('x←0.1+0.2'));
  assert.equal(decimal[0].parts[3].parts[0],'实数运算(+-×÷)');
  const mixed=plain(blocks.fromTree('x←(时间+1)×2',{variables:[['时间','定点数','0']]}));
  assert.equal(mixed[0].parts[3].parts[0],'实数运算(+-×÷)');
  assert.equal(mixed[0].parts[3].parts[1].parts[0],'实数运算(+-×÷)');
  const unknown=plain(blocks.fromTree('x←未声明表[0]'));
  assert.equal(unknown[0].parts[3].parts[0],'列表取值（按该列表元素类型选择）');
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

check('typed list literals expand into clear and ordered native append actions', () => {
  const variables = [['A/B', '整数列表', '空'], ['文本', '字符串列表', '空']];
  const roots = plain(blocks.fromTree('游戏初始化\n  A←[2,1,0]；B←[]\n  文本←[“a,b”,“x；y”]\n  发送信息〔完成〕', { variables }));
  const actions = roots[0].children;
  assert.deepEqual(actions.slice(0,4).map(n=>n.parts.map(shape)), [
    ['移除列表所有元素','A'], ['列表添加（增加）','A','2'], ['列表添加（增加）','A','1'], ['列表添加（增加）','A','0']
  ]);
  assert.deepEqual(actions[4].parts.map(shape), ['移除列表所有元素','B']);
  assert.deepEqual(actions.slice(5,8).map(n=>n.parts.map(shape)), [
    ['移除列表所有元素','文本'], ['列表添加（增加）','文本','a,b'], ['列表添加（增加）','文本','x；y']
  ]);
  assert.equal(actions[8].parts[0], '发送信息');
  assert(actions.slice(1,4).every((n,i)=>n.annotation.includes('索引 '+i)));
  for(const source of ['未知←[1,2]', 'A←[1,...]', 'A←[[1,2]]', 'A←[1,,2]']) {
    const result = plain(blocks.fromTree(source, { variables }));
    assert.equal(result.length, 1); assert.equal(result[0].kind, 'note');
  }
});
check('indented custom definitions own their bodies without depending on section titles', () => {
  const roots = plain(blocks.fromTree('【自建】查询〔p，t：整数〕\n  结果←-1\n  如果 p≥0\n    结果←p+t\n【自建】总量〔p：整数〕\n  总量←0\n  重复执行〔3〕\n    总量←总量+1'));
  assert.equal(roots.length, 2);
  assert(roots.every(n=>n.kind==='custom' && n.definition && n.children.length===2));
  assert.deepEqual(roots[0].parts.map(shape), ['自定义动作','查询','p','t']);
  assert.deepEqual(roots[0].inputLabels, ['p · 整数','t · 整数']);
  assert.equal(roots[1].children[1].parts[0], '重复执行');
  assert.equal(roots[1].children[1].children.length, 1);
  const explicit = plain(blocks.fromTree('【自建】第一段\n结果←0\n【自建】第二段\n  结果←1\n游戏初始化\n  【自建】第一段', { definition:true }));
  assert.equal(explicit.length,3);
  assert.equal(explicit[0].children.length,1);
  assert.equal(explicit[1].children.length,1);
  assert.equal(explicit[2].kind,'event');
});
check('custom calls expose declared parameter labels and preserve actual arguments', () => {
  const sections = [{ tree:'【自建】提交〔p，q：整数；主人：玩家〕\n  结果←p+q' }];
  const roots = plain(blocks.fromTree('【自建】提交〔0，17，测试玩家〕 → 结果←1', { sections }));
  assert.equal(roots.length,2);
  assert.equal(roots[0].definition,undefined);
  assert(!roots[0].children?.length);
  assert.deepEqual(roots[0].parts.map(shape),['自定义动作','提交','0','17','测试玩家']);
  assert.deepEqual(roots[0].inputLabels,['p · 整数','q · 整数','主人 · 玩家']);
  const svg = blocks.svg(roots);
  assert(svg.includes('调用自定义动作')); assert(svg.includes('p · 整数'));
  assert(!svg.includes('定义结束'));
});
check('nested inline connectors follow control scope and ordinary actions continue as siblings', () => {
  const roots=tree('游戏初始化 → 重复执行〔2〕 → 如果 a=1 → b←2；c←3');
  assert.equal(roots.length,1);
  const loop=roots[0].children[0],branch=loop.children[0];
  assert.equal(loop.parts[0],'重复执行'); assert.equal(branch.parts[0],'如果');
  assert.deepEqual(branch.children.map(n=>n.parts[1].text),['b','c']);
  const chain=tree('a←1 → 如果 b=2 → c←3');
  assert.equal(chain.length,2); assert.equal(chain[0].children,undefined);
  assert.equal(chain[1].children.length,1);
  const separate=tree('游戏初始化\n  重复执行〔2〕\n    a←a+1\n  b←9');
  assert.equal(separate[0].children.length,2);
  assert.equal(separate[0].children[0].children.length,1);
});
check('else attaches only to an adjacent if and else-if chains never overwrite a prior branch', () => {
  const roots=tree('如果 a=1 → b←1\n否则如果 a=2 → b←2\n否则如果 a=3 → b←3\n否则 → b←4');
  assert.equal(roots.length,1);
  let current=roots[0];
  for(let i=1;i<=3;i++){
    assert.equal(current.children[0].parts[3].text,String(i));
    current=current.otherwise[0];
  }
  assert.equal(current.parts[3].text,'4');
  const noAttach=tree('如果 a=1 → b←1\nc←2\n否则 → b←3\n重复执行〔2〕\n  a←1\n否则 → a←0');
  assert.equal(noAttach[0].otherwise,undefined);
  assert.equal(noAttach[2].kind,'note'); assert.equal(noAttach[4].kind,'note');
});
check('nested list reads and grouped variable declarations retain correct element types', () => {
  const result=plain(blocks.fromTree('结果←坐标表[索引表[游标]+1]',{variables:[['坐标表','坐标点列表','空'],['索引表','整数列表','空'],['游标/结果','整数','0']]}));
  const read=result[0].parts[3];
  assert.equal(read.parts[0],'列表取值：坐标点');
  assert.equal(read.parts[2].parts[0],'整数运算(+-×÷)');
  assert.equal(read.parts[2].parts[1].parts[0],'列表取值：整数');
  const unknown=plain(blocks.fromTree('结果←坐标表[0]'));
  assert.equal(unknown[0].parts[3].parts[0],'列表取值（按该列表元素类型选择）');
});
check('unsupported calls and prose never become invented executable blocks', () => {
  assert.equal(exp('自行发明的条件〔a〕').kind,'note');
  const roots=tree('检查通过后：a←1\n全部一致 → b←2\n未知说明；继续说明 → c←3');
  assert.equal(roots.length,3); assert(roots.every(n=>n.kind==='note'));
  const native=tree('a←整数运算〔b，+，1〕');
  assert.equal(native[0].parts[3].parts[0],'整数运算(+-×÷)');
});
check('SVG shows input labels, numbered connectors and distinct flow boundaries', () => {
  const roots=tree('游戏初始化\n  重复执行〔2〕\n    如果 a=1\n      b←b+1\n    否则\n      b←0\n  发送信息〔循环结束〕');
  const svg=blocks.svg(roots);
  for(const label of ['次数','条件','左值','比较符','右值','循环内部','循环结束 · 接下方动作','真 · 条件成立时执行','假 · 否则执行','分支汇合'])assert(svg.includes(label),label);
  assert(svg.includes('data-flow="next"')); assert(svg.includes('data-flow="exit"'));
  const steps=[...svg.matchAll(/data-step="(\d+)"/g)].map(m=>Number(m[1]));
  assert.equal(new Set(steps).size,steps.length); assert.deepEqual(steps,[1,2,3,4,5,6]);
  const timer=blocks.svg(tree('运行计时器〔1秒，-1，false〕\n  a←a+1'));
  assert(timer.includes('到期回调内部')); assert(timer.includes('外层后续 · 不属于上方到期回调'));
});

let sections = 0;
for (const [index, guide] of [...legacyGuides, ...newGuides].entries()) {
  for (const section of guide.sections) {
    const roots = blocks.fromTree(section.tree, { definition: /自定义动作|封装成自定义/.test(section.title), variables: guide.variables, sections: guide.sections });
    const svg = blocks.svg(roots, section.title);
    const size = /width="(\d+)" height="(\d+)" viewBox="0 0 (\d+) (\d+)"/.exec(svg);
    assert(size && +size[1] > 0 && +size[2] > 0, `guide ${index}: invalid SVG dimensions`);
    assert.equal(size[1], size[3]); assert.equal(size[2], size[4]);
    assert(!/\b(?:NaN|undefined|Infinity)\b/.test(svg), `guide ${index}: invalid SVG`);
    sections++;
  }
}
console.log(`PASS renderer: ${regressions} focused regression groups; all 40 legacy + 105 new guides, ${sections} SVG sections`);
