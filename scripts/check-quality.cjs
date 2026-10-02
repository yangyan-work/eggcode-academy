'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
function open(id){const d=new JSDOM(fs.readFileSync(path.join(root,'lesson.html'),'utf8'),{url:'https://quality.invalid/lesson.html?id='+id,runScripts:'outside-only'}),w=d.window;w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});w.IntersectionObserver=class{observe(){}disconnect(){}};w.requestAnimationFrame=fn=>{fn();return 1};w.cancelAnimationFrame=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};for(const s of w.document.querySelectorAll('script[src]'))w.eval(fs.readFileSync(path.join(root,s.getAttribute('src').split('?')[0]),'utf8'));return d;}
for(const id of [0,13,24,35,36,37,38,39,40,70,75,128,142]){
 const d=open(id),doc=d.window.document;
 assert.equal(doc.querySelectorAll('.verification-grid article').length,4);
 assert(doc.querySelector('.course-verification').textContent.includes('尚未验证'));
 const before=doc.querySelector('.course-verification').textContent;
 doc.querySelector('[data-progress-toggle]')?.click();assert.equal(doc.querySelector('.course-verification').textContent,before);
 const table=doc.querySelector('.detailed-variable-table');if(table){assert.equal(table.querySelectorAll('thead th').length,5);assert(table.textContent.includes('作用范围'));for(const a of table.querySelectorAll('a[href^="#"]'))assert(doc.querySelector(a.getAttribute('href')),'Variable explanation anchor');}
 if([36,37,39].includes(id))assert(!doc.querySelector('.course-prerequisites'),'Independent big-number alternatives must not accumulate earlier branches');
 if(id===35)assert.deepEqual([...doc.querySelectorAll('.course-prerequisites a')].map(a=>a.getAttribute('href')),['lesson.html?id=34']);
 if(id===38)assert.deepEqual([...doc.querySelectorAll('.course-prerequisites a')].map(a=>a.getAttribute('href')),['lesson.html?id=37']);
 doc.querySelector('[data-diagram="expand"]').click();const dialog=doc.querySelector('#diagram-dialog');assert(dialog.open);
 dialog.querySelector('[data-diagram="zoom-in"]').click();assert.equal(dialog.querySelector('[data-zoom-label]').textContent,'125%');
 dialog.querySelector('[data-diagram="zoom-reset"]').click();assert.equal(dialog.querySelector('[data-zoom-label]').textContent,'100%');
 dialog.querySelector('[data-close-diagram]').click();assert(!dialog.open);d.window.close();global.gc?.();
}
const report=JSON.parse(fs.readFileSync(path.join(root,'verification-report.json'),'utf8'));assert.equal(report.engineStatus,'not_tested');assert.equal(report.lessons.length,145);assert(report.lessons.every(l=>l.editorStatus==='not_tested'));assert.equal(report.lessons.reduce((n,l)=>n+l.testScenarios,0),479);
console.log('PASS quality integration: 13 representative lessons; honest validation vs personal progress, 5-column variable evidence, independent numeric branches, dialog zoom/reset, evidence manifest');
