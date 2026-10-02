#!/usr/bin/env node
'use strict';
// BigInt is an independent test oracle only. The shipped browser implementation never uses it.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const api = require(path.join(root, 'big-number-lab.js'));
let assertions = 0;
const equal = (a,b,msg) => { assert.deepEqual(a,b,msg); assertions++; };
const ok = (v,msg) => { assert.ok(v,msg); assertions++; };
const throws = (f,pattern) => { assert.throws(f,pattern); assertions++; };
const cases = [
  ['0','0'], ['000','0001'], ['1','1'], ['9','10'], ['99','99'], ['1000','1'],
  ['12','34'], ['12345','67'], ['1005','5'], ['7','9'], ['0','5'], ['987654321','123456789'],
  ['9'.repeat(60),'9'.repeat(60)], ['1'+'0'.repeat(59),'1'], ['0'.repeat(59)+'9','2'],
  ['12345678901234567890','98765432109876543210']
];
let state = 0x6e756d62;
function rand() { state = (Math.imul(state,1664525)+1013904223) >>> 0; return state; }
function randomDecimal() { const length=1+rand()%60; let s=''; for(let i=0;i<length;i++)s += String(rand()%10);return s; }
for(let i=0;i<800;i++)cases.push([randomDecimal(),randomDecimal()]);
for(const [a,b] of cases) {
  const A=BigInt(a),B=BigInt(b);
  equal(api.compare(a,b), A<B ? -1:A>B ? 1:0, `compare ${a},${b}`);
  equal(api.add(a,b),String(A+B),`add ${a},${b}`);
  equal(api.multiply(a,b),String(A*B),`multiply ${a},${b}`);
  if(A>=B)equal(api.subtract(a,b),String(A-B),`subtract ${a},${b}`);
  else throws(()=>api.subtract(a,b),/A 小于 B/);
  if(B===0n)throws(()=>api.divide(a,b),/除数不能为 0/);
  else {
    const {quotient:q,remainder:r}=api.divide(a,b);
    equal(q,String(A/B),`quotient ${a},${b}`);equal(r,String(A%B),`remainder ${a},${b}`);
    equal(B*BigInt(q)+BigInt(r),A,'division identity');ok(BigInt(r)<B && BigInt(r)>=0n,'remainder bounds');
  }
}
for(const bad of ['', ' ', ' 1', '1 ', '-1', '+1', '1.5', '1e20', '１２', '١٢', '1,000', '0x10', 'Infinity', 'NaN', '1\n', '1'.repeat(61), '0'.repeat(61), 12, null, undefined]) {
  for(const op of ['compare','add','subtract','multiply','divide']) {
    throws(()=>api[op](bad,'1'),/只接受|最多/);throws(()=>api[op]('1',bad),/只接受|最多/);
  }
}
equal(api.validate('00000'),'0');equal(api.validate('000120'),'120');
equal(api.units('123456789'),'约 1.23亿（截断显示）');equal(api.units('123000000'),'1.23亿');
equal(api.units('99999999'),'约 9999.99万（截断显示）');equal(api.units('0001'),'1');
ok(api.units('9'.repeat(120)).includes('10^116'),'120-digit display fallback');
equal(api.multiply('9'.repeat(60),'9'.repeat(60)), '9'.repeat(59)+'8'+'0'.repeat(59)+'1');
equal(api.calculate('damage','5','9').value,'0');equal(api.calculate('damage','9','5').value,'4');
equal(api.calculate('damage','5','5').defeated,true);
throws(()=>api.calculate('unknown','1','1'),/未知/);
const longProduct=api.calculate('multiply','9'.repeat(60),'9'.repeat(60));
equal(longProduct.value.length,120);equal(longProduct.trace.length,3662);
for(const step of longProduct.trace) {
  const match=step.note.match(/ = (\d+)；写/);if(match)ok(+match[1]<=99,'multiplication temporary stays <=99');
}
const longDivision=api.calculate('divide','9'.repeat(60),'1');
equal(longDivision.trace.length,61);equal(longDivision.value,'9'.repeat(60));
for(const step of longDivision.trace.slice(1))ok((step.note.match(/ − /g)||[]).length<=9,'at most nine subtractions per prefix');
const source=fs.readFileSync(path.join(root,'big-number-lab.js'),'utf8');
ok(!/\b(?:BigInt|parseInt|parseFloat|Number)\s*\(/.test(source),'browser arithmetic has no whole-number coercion shortcuts');
const html=fs.readFileSync(path.join(root,'big-number-lab.html'),'utf8');
ok(!/maxlength\s*=/i.test(html),'oversize input must report an error, never silently truncate');
for(const match of html.matchAll(/(?:src|href)="([^"#?]+)(?:[?#][^"]*)?"/g)) {
  const ref=match[1];if(/^[a-z]+:/.test(ref))continue;
  ok(fs.existsSync(path.join(root,ref)),`local link ${ref}`);
}
const {JSDOM}=require('jsdom');
const dom=new JSDOM(html,{url:'https://example.test/big-number-lab.html',runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window,d=w.document;
w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
w.HTMLElement.prototype.scrollIntoView=function(){};
w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
w.HTMLDialogElement.prototype.close=function(){this.open=false;};
for(const script of [...d.querySelectorAll('script[src]')])w.eval(fs.readFileSync(path.join(root,script.getAttribute('src').split('?')[0]),'utf8'));
d.dispatchEvent(new w.Event('DOMContentLoaded'));
const $=id=>d.getElementById(id);
function run(op,a,b) { $('bn-operation').value=op;$('bn-a').value=a;$('bn-b').value=b;$('bn-form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true})); }
equal($('bn-output').textContent,'184');equal($('bn-remainder').textContent,'17');
equal(d.querySelectorAll('#bn-examples button').length,7);
for(let i=0;i<4;i++) { run('multiply','12','34');equal($('bn-output').textContent,'408');$('bn-last').click();ok($('bn-next').disabled);$('bn-first').click();ok($('bn-prev').disabled); }
run('divide','12345','67');$('bn-next').click();ok($('bn-step-title').textContent.includes('A[0]'));$('bn-last').click();ok($('bn-step-state').textContent.includes('余数 17'));
for(const [op,a,b] of [['divide','8','000'],['multiply','1e20','2'],['add','1'.repeat(61),'2'],['subtract','1','2']]) {
  run(op,a,b);ok(!$('bn-error').hidden,'error shown');ok($('bn-result').hidden,'result hidden after error');equal($('bn-output').textContent,'');equal($('bn-step-note').textContent,'');
  run('add','0001','2');equal($('bn-output').textContent,'3');ok($('bn-error').hidden,'error reset');
}
run('damage','10','11');equal($('bn-output').textContent,'0');ok($('bn-output-note').textContent.includes('原生'));
run('compare','000123','123');equal($('bn-output').textContent,'123 = 123');ok($('bn-remainder-wrap').hidden);
run('subtract','12','3');$('bn-swap').click();ok(!$('bn-error').hidden);$('bn-swap').click();equal($('bn-output').textContent,'9');
for(const button of [...d.querySelectorAll('#bn-examples button')]) {button.click();if(button.textContent==='除零保护')ok(!$('bn-error').hidden);else ok(!$('bn-result').hidden);}
equal($('bn-output').textContent.length,120);
$('bn-step-range').value='20';$('bn-step-range').dispatchEvent(new w.Event('input'));ok($('bn-step-count').textContent.startsWith('第 20 /'));
for(const id of ['bn-multiply-diagram','bn-divide-diagram','bn-entry-diagram']) {
  const svg=$(id).querySelector('svg');ok(svg,`${id} rendered`);ok(+svg.getAttribute('width')>0 && +svg.getAttribute('height')>0);
  const parsed=new w.DOMParser().parseFromString(svg.outerHTML,'image/svg+xml');equal(parsed.querySelector('parsererror'),null,'valid SVG');
  ok(!/undefined|NaN|Infinity/.test(svg.outerHTML),'finite diagram');
}
ok($('bn-multiply-diagram').querySelectorAll('[data-block-kind="control"]').length>=4,'nested multiplication loops visible');
ok($('bn-multiply-diagram').textContent.includes('列表取值：整数'),'typed digit-slot access');
ok($('bn-divide-diagram').textContent.includes('调用自定义动作'),'division helper calls visible');
ok($('bn-divide-diagram').textContent.includes('定义内部'),'division definition body visible');
const before=+$('bn-multiply-diagram').querySelector('svg').getAttribute('width');
$('bn-multiply-diagram').querySelector('[data-diagram="zoom-in"]').click();
equal($('bn-multiply-diagram').querySelector('svg').style.width,(before*1.25)+'px');
$('bn-multiply-diagram').querySelector('[data-diagram="expand"]').click();ok($('diagram-dialog').open);$('diagram-dialog').querySelector('[data-close-diagram]').click();ok(!$('diagram-dialog').open);
const manualIds=new Set(w.EGG_MANUAL.entries.map(e=>e.id));
for(const link of d.querySelectorAll('a[href^="block.html?id="]'))ok(manualIds.has(new URL(link.href).searchParams.get('id')),'manual block ID exists');
dom.window.close();
console.log(`Big-number lab passed: ${assertions} assertions; ${cases.length} deterministic arithmetic pairs; validation, full string multiplication/division, traces, DOM recovery, SVG and links. Native Eggcode runtime not tested.`);
