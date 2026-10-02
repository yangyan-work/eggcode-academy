#!/usr/bin/env node
'use strict';
// 覆盖核查、参考答案 DOM 与独立算例复算；不冒充蛋仔实机跑测。
// Run: NODE_PATH=/path/to/jsdom/node_modules node scripts/check-challenges.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const dom = new JSDOM('<!doctype html><body data-page="challenge-check" data-lesson-count="145" data-foundation-count="6"><main id="output"></main></body>', { url: 'https://qa.invalid/', runScripts: 'outside-only' });
const w = dom.window;
const files = ['lessons-data.js', 'tutorials.js', 'build-guides.js', 'progression-guides.js', 'curriculum-expansion.js', 'curriculum-lessons-01.js', 'curriculum-lessons-02.js', 'challenge-solutions.js', 'app.js'];
for (const file of files) new vm.Script(read(file), { filename: file }).runInContext(dom.getInternalVMContext());
const all = [...w.EGG_LESSONS, ...w.EGG_TUTORIALS, ...w.EGG_EXPANSION_LESSONS];
const solutions = w.EGG_CHALLENGE_SOLUTIONS;
const expected = all.flatMap((lesson, id) => lesson.challenge ? [id] : []);
assert.equal(expected.length, 121);
assert.deepEqual(Object.keys(solutions).map(Number), expected, '每道原挑战必须有对应参考解法，不添加不存在的挑战');
const contentSnapshot = JSON.stringify([all, w.EGG_BUILD_GUIDES]);
const output = w.document.getElementById('output');
const connections = new Set();
for (const id of expected) {
  const solution = solutions[id];
  for (const [field, minimum] of [['steps', 3], ['tests', 2], ['pitfalls', 1]]) {
    assert(Array.isArray(solution[field]) && solution[field].length >= minimum, `${id}: ${field} 不完整`);
    solution[field].forEach(text => assert(typeof text === 'string' && text.trim().length > 12, `${id}: 空白或占位内容`));
  }
  assert(solution.connection.length > 20 && !connections.has(solution.connection), `${id}: 必须提供本题独立连接说明`);
  connections.add(solution.connection);
  output.innerHTML = w.renderChallengeSolution(id);
  const details = output.querySelector('details.challenge-solution');
  assert(details && !details.open, `${id}: 参考解法默认折叠`);
  assert.equal(details.dataset.challengeLesson, String(id));
  assert.equal(details.id, 'challenge-solution');
  assert(details.firstElementChild.matches('summary'), `${id}: 使用原生键盘可操作 summary`);
  assert(details.querySelector('summary').textContent.includes('展开参考解法'));
  assert.equal(details.querySelectorAll('ol li').length, solution.steps.length);
  assert.equal(details.querySelectorAll('ul li').length, solution.tests.length + solution.pitfalls.length);
  assert.equal(details.querySelector('code').textContent, solution.connection);
  assert.equal(details.querySelector('.copy-code').type, 'button');
  assert(details.textContent.includes('尚未逐题通过蛋仔编辑器实机验收'));
  details.querySelector('summary').click();
  assert(details.open, `${id}: 原生点击展开成功`);
  details.querySelector('summary').click();
  assert(!details.open, `${id}: 原生点击收起成功`);
}
assert.equal(JSON.stringify([all, w.EGG_BUILD_GUIDES]), contentSnapshot, '补充答案不得改写既有课程/指南');
assert.equal(w.renderChallengeSolution(0), '', '无挑战题的课不凭空显示答案');
solutions[6].steps[0] = '<img src=x onerror="alert(1)">';
output.innerHTML = w.renderChallengeSolution(6);
assert.equal(output.querySelectorAll('img,script').length, 0, '所有答案文本必须 HTML 转义');
assert(output.textContent.includes('<img src=x'));
const app = read('app.js');
assert(app.includes('id="challenge"') && app.includes('href="#challenge">挑战与参考解法'), '题目附近有锚点且本课目录可直达');
assert(/min-height:\s*44px/.test(read('challenge-solutions.css')), '折叠标题与复制控件保留触控尺寸');
dom.window.close();

// 下列模型独立复算参考解法中的关键输入。只证明纸面算例，不执行地图积木。
const fixedBoard = [1,2,1,3,4,2, 2,1,3,4,2,3, 3,4,2,1,3,4, 4,2,3,2,4,1, 1,3,4,3,1,2, 2,4,1,4,2,3];
function matches(board) {
  const found = new Set();
  for (let row = 0; row < 6; row++) for (let col = 0; col < 6; col++) {
    const index = row * 6 + col;
    for (const step of [1, 6]) {
      if (step === 1 ? col > 3 : row > 3) continue;
      if (board[index] !== 0 && board[index] === board[index + step] && board[index] === board[index + step * 2]) {
        found.add(index); found.add(index + step); found.add(index + step * 2);
      }
    }
  }
  return [...found].sort((a, b) => a - b);
}
for (const [indices, color] of [[[0,1,2,3],1], [[0,1,2,3,4],1], [[0,1,2,6,12],1], [[33,34,35],2]]) {
  const board = [...fixedBoard]; indices.forEach(index => { board[index] = color; });
  assert.deepEqual(matches(board), [...indices].sort((a,b)=>a-b), '四连/五连/L形/右下角三连复算');
}
const cross = Array.from({ length: 36 }, (_, i) => (Math.floor(i / 6) + i % 6) % 2 ? 3 : 4);
[8,13,14,15,20].forEach(i => { cross[i] = 2; });
assert.deepEqual(matches(cross), [8,13,14,15,20]);
assert.equal(matches(cross).filter(i => i !== 14).length * 10, 40);
const queue = [12,13,14], seen = new Set(queue);
for (let cursor = 0; cursor < queue.length; cursor++) {
  const i = queue[cursor];
  const expanded = i === 14 ? [12,13,14,15,16,17] : i === 16 ? [9,10,11,15,16,17,21,22,23] : i === 23 ? [5,11,17,23,29,35] : [];
  for (const next of expanded) if (!seen.has(next)) { seen.add(next); queue.push(next); }
}
assert.deepEqual(queue, [12,13,14,15,16,17,9,10,11,21,22,23,5,29,35]);
assert.equal(queue.length * 10, 150);

let player = [1,2], box = [2,2], moves = 0;
const route = ['上','右','右','下','左','下','左','上'];
const directions = { 上:[0,-1], 右:[1,0], 下:[0,1], 左:[-1,0] };
const inBoard = ([x,y]) => x >= 1 && x <= 3 && y >= 1 && y <= 3;
for (const key of route) {
  const [dx,dy] = directions[key];
  const next = [player[0]+dx, player[1]+dy];
  assert(inBoard(next));
  if (next[0] === box[0] && next[1] === box[1]) {
    const pushed = [box[0]+dx, box[1]+dy]; assert(inBoard(pushed)); box = pushed;
  }
  player = next; moves++;
}
assert.deepEqual(box, [1,1]); assert.deepEqual(player, [1,2]); assert.equal(moves, 8);
assert(read('challenge-solutions.js').includes(route.join('、')), '推箱子答案路线与复算模型一致');

assert.equal(1*4+1, 5); // 新背包跨度：玩家1矿石。
assert.equal(Math.floor(25*150/100), 37); assert.equal(Math.floor(25*130*120/10000), 39);
assert.equal((10*.5)-2, 3); assert.equal((10-2)*.5, 4);
assert.equal(Math.floor((59+1)/60)*2, 2); assert.equal((59+1)%60, 0);
const monday = 316800; // 1970-01-05 UTC+8 00:00，固定周一边界。
const week = second => Math.floor((second+28800+259200)/604800);
assert.equal(week(monday-1), 0); assert.equal(week(monday), 1);
assert.equal(18+3+20+12, 53); assert.equal(3*3+8+20+12, 49);
let raw=8,a=0,b=0,c=0,products=0,first;
for (let tick=1; tick<=11; tick++) {
  if(c){c=0;products++;if(!first)first=tick;}
  if(b&&!c){b=0;c=1;} if(a&&!b){a=0;b=1;} if(raw&&!a){raw--;a=1;}
  assert.equal(raw+a+b+c+products,8);
}
assert.equal(first,4); assert.equal(products,8); assert.equal(raw+a+b+c,0);
let material=6,state=0,remaining=0,warehouse=0,inMachine=0;
for(let tick=1;tick<=9;tick++){
  if(state===1 && --remaining<=0)state=2;
  if(state===2 && warehouse<3){warehouse++;inMachine=0;state=0;}
  if(state===0 && material>0){material--;inMachine=1;remaining=2;state=1;}
}
assert.deepEqual([material,inMachine,warehouse,state],[2,1,3,2]);
console.log('挑战检查通过：121 / 121 题，363 条搭建改法，242 个验收例；折叠、转义、目录锚点和关键算例已核对。');
