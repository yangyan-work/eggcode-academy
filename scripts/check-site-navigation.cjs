'use strict';
// 本机 VM / DOM 导航契约；不登录、不启动浏览器、不连接云端。
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..'),script=fs.readFileSync(path.join(root,'site-navigation.js'),'utf8');
let checks=0;
function ok(value,label){assert.ok(value,label);checks++;}
function page(file,mode='cloud',suffix=''){
 const dom=new JSDOM(fs.readFileSync(path.join(root,file),'utf8'),{url:'http://localhost:4192/'+file+suffix,runScripts:'outside-only'}),w=dom.window;
 // JSDOM 没有原生 dialog 生命周期；打开时模拟浏览器对首个控件的聚焦。
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;this.querySelector('[autofocus],button,a[href],select,input')?.focus();};
 w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};
 w.EGG_CLOUD={status:()=>({mode,provider:mode==='local'?undefined:'cloudbase'})};w.eval(script);return dom;
}
const main=['index.html','courses.html','practice.html','manual.html','personal-space.html'];
const extra=['community.html','works.html','contribute.html','contribute.html#drafts','messages.html'];
for(const file of fs.readdirSync(root).filter(file=>file.endsWith('.html')&&file!=='login.html'))for(const mode of ['cloud','local']){
 const dom=page(file,mode),doc=dom.window.document;
 try{
  const nav=doc.querySelector('.hub-primary');if(!nav)continue;
  assert.deepEqual([...nav.querySelectorAll(':scope > a')].map(node=>node.getAttribute('href')),main,file+' 五个常用栏目');checks++;
  const more=nav.querySelector(':scope > details.hub-more');
  ok(more&&more.querySelector(':scope > summary'),file+' 通过原生更多菜单访问次要栏目');
  assert.deepEqual([...more.querySelectorAll('a')].map(node=>node.getAttribute('href')),extra,file+' 旧入口与草稿定位保留');checks++;
  ok(!doc.querySelector('header .hub-actions'),file+' 没有重复投稿与账号操作区');
  ok(doc.querySelector('.hub-brand img').getAttribute('src').includes('free-tree-logo.png'),file+' 保留透明品牌标志');
  ok([...nav.querySelectorAll(':scope > a')].every(node=>node.querySelector('svg[aria-hidden="true"]')&&node.getAttribute('aria-label')),file+' 线性图标与完整栏目名称可访问');
  ok(!more.open,file+' 初始菜单收起');
  ok([...more.querySelectorAll('a')].every(node=>/未开放/.test(node.textContent)===(mode==='cloud')),file+' 未开放文案与模式一致');
  ok(nav.querySelectorAll('[aria-current]').length<=1,file+' 最多一个当前栏目');
  more.open=true;more.dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  ok(!more.open&&doc.activeElement===more.querySelector('summary'),file+' Escape 关闭菜单并返回焦点');
 }finally{dom.window.close();}
}
for(const [file,suffix,href,current] of [
 ['index.html','','index.html','page'],['personal-space.html','','personal-space.html','page'],
 ['lesson.html','?id=0','courses.html','location'],['lesson.html','?id=5','courses.html','location'],
 ['lesson.html','?id=6','practice.html','location'],['lesson.html','?id=40','practice.html','location'],
 ['block.html','?id=sample','manual.html','location'],['community-tutorial.html','?id=sample','community.html','location'],
 ['contribute.html','#drafts','contribute.html#drafts','page']
]){
 const dom=page(file,'local',suffix),doc=dom.window.document;
 try{const chosen=doc.querySelector('.hub-primary [aria-current]');ok(chosen?.getAttribute('href')===href&&chosen.getAttribute('aria-current')===current,file+suffix+' 对应正确栏目');}finally{dom.window.close();}
}
const draft=page('contribute.html','local','#drafts');
try{
 const w=draft.window;w.history.replaceState(null,'','#editor');w.dispatchEvent(new w.Event('hashchange'));
 ok(w.document.querySelector('.hub-publish').getAttribute('aria-current')==='page','切换编辑高亮投稿');
 ok(!w.document.querySelector('.hub-primary a[href="contribute.html#drafts"]').hasAttribute('aria-current'),'离开草稿取消旧高亮');
 w.history.replaceState(null,'','#drafts');w.dispatchEvent(new w.Event('hashchange'));
 ok(w.document.querySelector('.hub-primary a[href="contribute.html#drafts"]').getAttribute('aria-current')==='page','返回草稿同步高亮');
}finally{draft.window.close();}
const home=page('index.html');
try{
 const w=home.window,doc=w.document,form=doc.querySelector('form[role="search"]');
 ok(form.getAttribute('action')==='practice.html'&&form.querySelector('input[name="q"]'),'首页使用真实玩法查询入口');
 ok(doc.querySelector('a[href="lesson.html?id=0"]')?.textContent.includes('新手第一课'),'首页直达第一课');
 ok([...doc.querySelectorAll('main a[href="practice.html"]')].some(node=>node.textContent.includes('玩法教程')),'首页直达玩法目录');
 ok(!doc.querySelector('.hero-community-link,#home-demo,#curriculum-paths,.hub-mobile'),'首页移除旧营销演示、长专题与重复底栏');
 ok([...doc.querySelectorAll('head link[rel="stylesheet"]')].at(-1).getAttribute('href').startsWith('light-theme.css'),'保留统一浅色样式最后加载');
 ok(!doc.querySelector('script[src^="app.js"]'),'去掉依赖旧演示节点的首页脚本');
 assert.deepEqual([...doc.querySelectorAll('.home-entry')].map(node=>node.getAttribute('href')),['lesson.html?id=0','practice.html','manual.html','personal-space.html'],'四个工作区入口均有真实链接');checks++;
 const header=doc.querySelector('.hub-header'),drawer=doc.querySelector('.hub-drawer'),toggle=doc.querySelector('.hub-menu-toggle'),close=doc.querySelector('.hub-drawer-close');
 ok(drawer?.tagName==='DIALOG'&&toggle?.tagName==='BUTTON'&&close?.tagName==='BUTTON','移动导航使用原生对话框与两个真实按钮');
 ok(toggle.getAttribute('aria-controls')===drawer.id&&toggle.getAttribute('aria-expanded')==='false','菜单按钮指向侧栏且初始收起');
 header.getBoundingClientRect=()=>({height:64});
 w.dispatchEvent(new w.Event('resize'));ok(doc.documentElement.style.getPropertyValue('--site-header-height')==='0px','桌面左栏高度不占用正文顶部锚点偏移');
 w.innerWidth=390;w.dispatchEvent(new w.Event('resize'));ok(doc.documentElement.style.getPropertyValue('--site-header-height')==='64px','手机仅测量顶部栏高度，不把抽屉高度加入正文偏移');
 toggle.focus();toggle.click();
 ok(drawer.open&&toggle.getAttribute('aria-expanded')==='true','手机点击菜单打开侧栏');
 ok(drawer.contains(doc.querySelector('.hub-inner'))&&doc.querySelectorAll('.hub-primary').length===1,'打开后侧栏使用唯一的导航');
 ok(drawer.contains(doc.activeElement),'打开侧栏后键盘焦点进入对话框');
 close.click();
 ok(!drawer.open&&toggle.getAttribute('aria-expanded')==='false'&&doc.activeElement===toggle,'关闭侧栏返回打开按钮焦点');
 toggle.click();w.innerWidth=701;w.dispatchEvent(new w.Event('resize'));
 ok(!drawer.open&&toggle.getAttribute('aria-expanded')==='false','切回桌面时复位打开的抽屉');
 ok(header.contains(doc.querySelector('.hub-inner'))&&!drawer.contains(doc.querySelector('.hub-inner'))&&doc.querySelectorAll('.hub-primary').length===1,'切回桌面复用唯一导航到固定侧栏');
 ok(doc.documentElement.style.getPropertyValue('--site-header-height')==='0px','超过 700px 的侧栏不占用正文顶部');
 w.innerWidth=700;w.dispatchEvent(new w.Event('resize'));
 ok(doc.documentElement.style.getPropertyValue('--site-header-height')==='64px','700px 临界宽度仍使用移动顶部栏');
}finally{home.window.close();}
// 沿用玩法页真实数据与 app.js，检查教程卡片仅在有效搜索或筛选后显示。
function practicePage(suffix=''){
 const dom=page('practice.html','local',suffix),w=dom.window;
 for(const node of w.document.querySelectorAll('script[src]')){
  const file=node.getAttribute('src').split('?')[0];
  if(/^(?:tutorials|build-guides|progression-guides|curriculum-[\w-]+|app)\.js$/.test(file))w.eval(fs.readFileSync(path.join(root,file),'utf8'));
 }
 return dom;
}
const tick=ms=>new Promise(resolve=>setTimeout(resolve,ms));
(async()=>{
 const search=practicePage();
 try{
  const w=search.window,doc=w.document,catalog=w.EGG_CURRICULUM.series;
  const removed='.practice-banner,.practice-group,.learning-lesson-list,#series-status';
  const familyIds=value=>Array.from(catalog).filter(item=>item.family===value).flatMap(item=>Array.from(item.lessonIds));
  function results(ids,label,active=true,document=doc){
   const grid=document.querySelector('#practice-grid'),empty=document.querySelector('#practice-empty');
   ok(grid?.classList.contains('course-grid')&&empty,label+' 保留单一卡片网格与空结果提示');
   ok(grid.hidden===!ids.length&&empty.hidden===(!active||!!ids.length),label+' 显示状态正确');
   const cards=[...document.querySelectorAll('.course-card')];
   assert.deepEqual(cards.map(card=>Number(card.dataset.lessonId)),ids,label+' 卡片 ID 与顺序');checks++;
   ok(cards.every(card=>grid.contains(card)&&Number(card.dataset.lessonId)>=6&&Number(card.dataset.lessonId)<145&&card.getAttribute('href')==='lesson.html?id='+card.dataset.lessonId),label+' 使用原课程 ID 和教程链接');
   ok(!document.querySelector(removed)&&!/找到\s*\d+\s*(?:篇|课|个?专题)/.test(document.querySelector('main').textContent),label+' 没有横幅、专题分组、文字列表或找到数量统计');
  }
  const query=doc.querySelector('#practice-query'),family=doc.querySelector('#practice-family'),series=doc.querySelector('#practice-series');
  const change=(node,value,type='input')=>{node.value=value;node.dispatchEvent(new w.Event(type,{bubbles:true}));};
  results([],'未填写默认状态',false);
  ok(doc.querySelectorAll('[data-series]').length===34&&doc.querySelectorAll('[data-family]').length===7,'34 个专题和全部加 6 个方向的导航保留');
  ok(w.EGG_TUTORIALS.length===34&&w.EGG_EXPANSION_LESSONS.length===105&&w.EGG_CURRICULUM.totalCount===145,'保留全部 139 篇玩法教程和 145 个课程 ID');
  for(const whitespace of ['   ','\t\n','\u3000',' \u3000\u00a0 ']){
   change(query,whitespace);results([],'空白与 NFKC 空白搜索',false);
   ok(!new URLSearchParams(w.location.search).has('q'),'空白查询不保存 q 参数');
  }
  change(query,'NO_MATCH_qa_991700');
  ok(new URLSearchParams(w.location.search).get('q')===query.value,'搜索输入保存查询参数');
  results([],'无匹配搜索');
  const lessons=[...w.EGG_TUTORIALS,...w.EGG_EXPANSION_LESSONS],last=lessons.at(-1),lastSeries=catalog.find(item=>item.lessonIds.includes(144));
  change(query,last.title);results([144],'精确标题搜索');
  change(query,last.title+' NO_MATCH_qa_991700');results([],'多个关键词全部命中');
  change(query,'');results([],'清空关键词',false);
  const chosen=catalog[0];
  change(family,chosen.family,'change');
  ok(series.value==='all'&&w.location.hash==='#family-'+chosen.family,'方向筛选同步 URL 并重置专题');
  results(familyIds(chosen.family),'方向筛选');
  change(series,chosen.id,'change');
  ok(w.location.hash==='#'+chosen.id&&doc.querySelector('[data-series][aria-current]')?.dataset.series===chosen.id,'专题筛选同步 URL 与导航高亮');
  results(Array.from(chosen.lessonIds),'专题筛选');
  change(query,lessons[chosen.lessonIds[0]-6].title);results([chosen.lessonIds[0]],'搜索与两级筛选联合命中');
  change(query,last.title);results([],'关键词与筛选必须同时命中');
  ok(new URLSearchParams(w.location.search).get('q')===query.value&&new URLSearchParams(w.location.search).get('family')===chosen.family,'更改筛选保留搜索并保存方向参数');
  doc.querySelector('#practice-reset').click();
  ok(query.value===''&&family.value==='all'&&series.value==='all'&&w.location.search===''&&w.location.hash==='#all','重置恢复搜索、两级筛选及 URL');
  ok(doc.activeElement===query,'重置后搜索框恢复焦点');results([],'重置后',false);
  change(family,lastSeries.family,'change');change(series,lastSeries.id,'change');
  change(series,'all','change');results(familyIds(lastSeries.family),'清空专题保留方向');
  change(family,'all','change');results([],'清空所有条件',false);
  w.location.hash=chosen.id;await tick(10);
  w.location.hash=catalog[1].id;await tick(10);
  w.history.back();await tick(50);
  ok(series.value===chosen.id&&family.value===chosen.family,'Back 恢复原专题筛选');results(Array.from(chosen.lessonIds),'Back 卡片');
  w.history.forward();await tick(50);
  ok(series.value===catalog[1].id&&family.value===catalog[1].family,'Forward 恢复后一专题筛选');results(Array.from(catalog[1].lessonIds),'Forward 卡片');
  const normalizedTitle=last.title.replace(/[0-9A-Z]/g,char=>String.fromCharCode(char.charCodeAt(0)+0xfee0));
  const deep=practicePage('?'+new URLSearchParams({q:normalizedTitle,family:lastSeries.family})+'#'+lastSeries.id);
  try{
   const document=deep.window.document;
   ok(document.querySelector('#practice-query').value===normalizedTitle&&document.querySelector('#practice-family').value===lastSeries.family&&document.querySelector('#practice-series').value===lastSeries.id,'URL 深链接恢复关键词和两级筛选');
   results([144],'NFKC 深链接查询',true,document);
   document.querySelector('#practice-reset').click();results([],'深链接重置',false,document);
  }finally{deep.window.close();}
  for(const suffix of ['?q='+encodeURIComponent('\u3000'),'#all']){
   const blank=practicePage(suffix);
   try{results([],'默认或空白深链接',false,blank.window.document);}finally{blank.window.close();}
  }
  const fromHome=practicePage('?q='+encodeURIComponent('计时器'));
  try{
   const document=fromHome.window.document,cards=[...document.querySelectorAll('.course-card')];
   ok(document.querySelector('#practice-query').value==='计时器'&&cards.length>0,'首页查询参数被玩法页读取并显示匹配教程卡片');
   ok(cards.every(card=>card.getAttribute('href')==='lesson.html?id='+card.dataset.lessonId),'首页查询的卡片链接使用原课程 ID');
  }finally{fromHome.window.close();}
 }finally{search.window.close();}
 console.log('通过 '+checks+' 项导航与首页 DOM 契约。未验证真实登录、云端、浏览器布局或触摸尺寸。');
})().catch(error=>{console.error(error.stack);process.exitCode=1;});
