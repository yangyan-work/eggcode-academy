#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const c=vm.createContext({window:{},URLSearchParams});
const chunks=pattern=>fs.readdirSync(root).filter(f=>pattern.test(f)).sort();
for(const f of ['manual-data.js','lessons-data.js','tutorials.js','build-guides.js','progression-guides.js','curriculum-expansion.js',...chunks(/^curriculum-lessons-.*js$/),...chunks(/^curriculum-guides-.*js$/),...chunks(/^detailed-guides-.*js$/),'block-curated.js','block-examples.js','block-diagram-data.js','block-diagrams.js','learning-detail.js'])new vm.Script(read(f),{filename:f}).runInContext(c);
const w=c.window,details=w.EGG_DETAILED_GUIDES||{};assert.equal(Object.keys(details).length,145);
let steps=0,customs=0,scenarios=0;
for(let id=0;id<145;id++){
 const d=details[id],g=w.EGG_BUILD_GUIDES[id];assert(d,'Missing details '+id);assert.equal(d.sections.length,g.sections.length,'Section count '+id);
 for(const [i,s]of d.sections.entries()){assert.equal(s.title,g.sections[i].title,'Section alignment '+id+'/'+i);assert(s.steps.length>=8);steps+=s.steps.length;for(const x of s.steps)assert(typeof x==='string'&&x.trim().length>0,'Empty step '+id);}
 for(const obj of d.scene)assert(obj.name&&obj.type&&obj.steps.length,'Scene '+id);
 assert(d.variableSteps.length,'Variable guide '+id);
 for(const action of d.customActions){assert(action.name&&Array.isArray(action.parameters)&&action.steps.length>=3,'Incomplete definition '+id);customs++;}
 for(const t of d.tests){assert(t.action&&t.expected&&t.ifNot,'Incomplete scenario '+id);scenarios++;}
 assert(d.triggerPlacement.length,'No trigger placement '+id);for(const p of d.triggerPlacement)for(const f of ['area','entry','owner','objectSource','notes'])assert(p[f],'No '+f+' for '+id);
 const txt=JSON.stringify(d);assert(!/triggerPlacement|guide-3|TODO|待补充|按上述伪代码自行/.test(txt.replace('"triggerPlacement":','"placement":')),'Internal label or placeholder '+id);
 assert(w.EGG_DETAIL_UI.preparation(d).includes('trigger-placement'));
 assert(w.EGG_DETAIL_UI.tests(d).includes('应该看到'));
}
let blocks=0,slots=0;
for(const e of w.EGG_MANUAL.entries){
 const ex=w.EGG_EXAMPLE_FOR(e),location=w.EGG_DETAIL_UI.location(e),slot=w.EGG_DETAIL_UI.slots(e,ex),wire=w.EGG_DETAIL_UI.wiring(e,ex);
 assert(location.includes(e.title.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))));
 assert(location.includes('手册定位'));assert(wire.includes('wiring-walkthrough'));if(ex.parameters.length)assert(slot.includes('slot-workbench'));
 for(const p of ex.parameters)assert(Number.isInteger(p.index)&&p.type&&p.help);
 slots+=ex.parameters.length;blocks++;
}
const primer=read('editor-guide.html');for(const name of ['主触发器区域','角色触发器区域','组件触发器区域','关卡触发器区域','生物触发器区域','道具触发器区域','技能触发器区域','触发区域触发器区域','商城触发器区域'])assert(primer.includes(name),'Missing domain '+name);
console.log(`PASS details: 145 lessons, ${steps} detailed steps, ${customs} custom definitions, ${scenarios} test scenarios`);
console.log(`PASS blocks: ${blocks} location/wiring pages, ${slots} parameter slots, nine trigger domains`);
