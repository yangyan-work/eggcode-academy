'use strict';
// Run with the existing QA jsdom directory in NODE_PATH; no install is needed.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom');
const {root,read,renderingScripts}=require('./check.cjs');
function open(id,hash=''){
  const d=new JSDOM(read('lesson.html'),{url:'https://reading.invalid/lesson.html?id='+id+hash,runScripts:'outside-only'}),w=d.window;
  w.matchMedia=()=>({matches:false,addEventListener(){}});w.IntersectionObserver=class{observe(){}};
  w.requestAnimationFrame=fn=>{fn();return 1};w.HTMLElement.prototype.scrollIntoView=()=>{};
  for(const source of renderingScripts('lesson.html','?id='+id))w.eval(fs.readFileSync(path.join(root,source),'utf8'));
  return d;
}
function visibleText(node){
  if(node.nodeType===3)return node.nodeValue;
  if(node.tagName==='DETAILS'&&!node.open)return visibleText(node.querySelector('summary'));
  return [...node.childNodes].map(visibleText).join('');
}
function assertRevealed(target){
  assert(target,'Anchor target exists');
  for(let node=target;node;node=node.parentElement)if(node.tagName==='DETAILS')assert(node.open,'Deep link opens every enclosing disclosure');
}
const counts=[];
for(const id of [0,12,34,40,144]){
  const d=open(id),w=d.window,doc=w.document,body=doc.querySelector('#lesson-body'),guide=w.EGG_BUILD_GUIDES[id],detail=w.EGG_DETAILED_GUIDES[id];
  assert.equal(doc.querySelectorAll('#lesson-toc a').length,145,'All course routes remain available');
  assert.equal(body.firstElementChild.className,'lesson-reading-start','Goal and preparation come first');
  assert.equal(body.querySelector('.lesson-reading-status').textContent,'教学步骤已整理，编辑器实机尚未验证。','Compact status remains honest');
  assert(visibleText(body.querySelector('.lesson-ready-list')).includes(detail.scene[0].steps[0]),'Concrete first preparation stays visible');
  assert(!doc.querySelector('.lesson-prep-details').open,'Long trigger and creation instructions start folded');
  assert(!doc.querySelector('#preparation').open,'Complete variable table starts folded');
  assert.deepEqual([...doc.querySelectorAll('#start-here > ol > li')].map(li=>li.textContent),Array.from(detail.variableSteps),'Every creation instruction remains intact');
  const steps=[...doc.querySelectorAll('.recipe-step[id^="step-"]')];
  assert.equal(steps.length,guide.sections.length);
  steps.forEach((step,index)=>{
    const figure=step.querySelector('.block-figure'),microsteps=step.querySelector('.microsteps');
    assert(figure?.querySelector('svg'),'Each core step keeps a colored connection diagram');
    assert(!figure.closest('details:not([open])')&&!microsteps.closest('details:not([open])'),'Core diagrams and operations stay visible');
    assert(figure.compareDocumentPosition(microsteps)&w.Node.DOCUMENT_POSITION_FOLLOWING,'Diagram appears before long operation list');
    assert.deepEqual([...microsteps.querySelectorAll('li')].map(li=>li.textContent),Array.from(detail.sections[index].steps),'Specific operations and parameters remain intact');
  });
  const table=doc.querySelector('.detailed-variable-table');
  if(table){
    assert.equal(table.querySelectorAll('thead th').length,5);
    assert.deepEqual([...table.querySelectorAll('tbody tr')].map(row=>[...row.children].slice(0,3).map(cell=>cell.textContent)),Array.from(guide.variables,row=>Array.from(row)),'Original variable names, types and values remain intact');
  }
  assert.equal(doc.querySelectorAll('#acceptance > details.logic-summary > ol > li').length,guide.tests.length);
  steps.forEach(step=>assert.equal(step.querySelectorAll(':scope > .recipe-check').length,1,'One visible result per step'));
  assert.equal(doc.querySelectorAll('.verification-grid article').length,4,'Verification evidence remains available');
  assert(!doc.querySelector('.course-verification').closest('details').open,'Verification cards do not occupy the first screen');
  if(id===34)assert(visibleText(body).includes('近似强度不用于精确金额或直接替代原生伤害'),'Numeric safety boundary stays visible');
  const first=steps[0];let before='';
  for(const node of body.childNodes){if(node===first||node.contains?.(first)){if(node!==first)for(const child of node.childNodes){if(child===first)break;before+=visibleText(child);}break;}before+=visibleText(node);}
  assert(before.replace(/\s/g,'').length<1000,'Preparation overview does not bury the first core step');
  counts.push(id+': '+visibleText(body).replace(/\s/g,'').length+'/'+body.textContent.replace(/\s/g,'').length);
  doc.querySelector('.lesson-ready-list a').click();assertRevealed(doc.querySelector('#variable-creation'));
  doc.querySelector('.lesson-prep-details').open=false;
  w.location.hash='#variable-step-1';w.dispatchEvent(new w.HashChangeEvent('hashchange'));assertRevealed(doc.querySelector('#variable-step-1'));
  d.window.close();
}
for(const hash of ['#variables','#variable-step-1']){
  const d=open(40,hash);assertRevealed(d.window.document.querySelector(hash));d.window.close();
}
console.log('PASS reading hierarchy: 5 representative lessons; visible goals/preparation/core diagrams and operations; full variables/content retained; click, hashchange and initial deep links. Visible/full characters: '+counts.join(', '));
