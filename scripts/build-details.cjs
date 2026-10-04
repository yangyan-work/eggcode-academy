#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8').replace(/\r\n/g,'\n');
const check=process.argv.includes('--check');
const inputs=fs.readdirSync(path.join(root,'detail-source')).filter(f=>f.endsWith('.json')).sort();
const all={};
for(const name of inputs){const records=JSON.parse(read('detail-source/'+name));for(const [id,record] of Object.entries(records)){assert(!(id in all),'Duplicate detailed ID '+id);all[id]=record;}}
assert.equal(Object.keys(all).length,145,'Expected detailed guides for every lesson');
for(let id=0;id<145;id++){
 const d=all[id];assert(d,'Missing '+id);
 for(const field of ['scene','variableSteps','customActions','sections','tests','pitfalls','triggerPlacement'])assert(Array.isArray(d[field]),id+' missing '+field);
 assert(d.scopeNote&&d.scene.length&&d.sections.length&&d.tests.length>=3&&d.triggerPlacement.length,id+' incomplete detail');
 for(const s of d.sections)assert(s.title&&s.steps.length>=3&&s.steps.every(step=>typeof step==='string'&&step.trim())&&s.check,id+' needs concrete section instructions');
}
const output=new Map(),manifest={};let group={},number=1;
function emit(){if(!Object.keys(group).length)return;const name='detailed-guides-'+String(number++).padStart(2,'0')+'.js';const content='"use strict";\nwindow.EGG_DETAILED_GUIDES ||= {};\nObject.assign(window.EGG_DETAILED_GUIDES, '+JSON.stringify(group,null,2)+');\n';output.set(name,content);const version=require('node:crypto').createHash('sha256').update(content).digest('hex').slice(0,12);for(const id of Object.keys(group))manifest[id]={file:name,version};group={};}
for(let id=0;id<145;id++){if(Object.keys(group).length&&Buffer.byteLength(JSON.stringify({...group,[id]:all[id]},null,2))>190000)emit();group[id]=all[id];}emit();
for(const [name,content]of output){if(check)assert.equal(read(name),content,name+' stale');else fs.writeFileSync(path.join(root,name),content);}
const manifestText=JSON.stringify(manifest,null,2)+'\n';
if(check)assert.equal(read('detail-chunks.json'),manifestText,'Detailed chunk manifest stale');else fs.writeFileSync(path.join(root,'detail-chunks.json'),manifestText);
const updated=read('lesson.html').replace(/<script src="detailed-guides-\d+\.js[^>]*><\/script>/g,'').replace(/<script src="app\.js[^>]*><\/script>/,'<script src="lesson-loader.js?v=20261002-learning" defer></script>');
if(check)assert.equal(read('lesson.html'),updated,'Lesson script list stale');else fs.writeFileSync(path.join(root,'lesson.html'),updated);
const old=fs.readdirSync(root).filter(f=>/^detailed-guides-\d+\.js$/.test(f)&&!output.has(f));
if(check)assert(!old.length,'Obsolete detail chunks');else for(const f of old)fs.unlinkSync(path.join(root,f));
console.log((check?'Verified':'Built')+' 145 detailed lessons in '+output.size+' chunks.');
