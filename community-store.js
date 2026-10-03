"use strict";
// 本机单体验账号的社区流程；没有远程请求，也不提供真实管理员权限。
(() => {
  if (window.EGG_COMMUNITY) return;
  const DB='eggcode-academy.community-preview.v1', STORE='state', KEY='community';
  const groups=['submissions','publications','messages','works','questions','reports'];
  const categories=['match3','progression','inventory','parkour','racing','survival','puzzle','simulation','other'];
  const MAX_IMAGE=2*1024*1024, MAX_IMAGES=8*1024*1024;
  let dbPromise, channel;
  const now=()=>new Date().toISOString(), copy=value=>structuredClone(value), count=value=>Array.from(value).length;
  const uuid=value=>typeof value==='string' && /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value);
  const fail=message=>{throw new Error(message);};
  const conflict=()=>{throw Object.assign(new Error('内容已被另一页修改，请刷新后再操作。当前操作没有覆盖新版本。'),{code:'conflict'});};
  function text(value,label,min,max) { if(typeof value!=='string' || count(value.trim())<min || count(value.trim())>max)fail(`${label}需为 ${min}–${max} 个字符。`);return value.trim(); }
  function author() { const state=window.EGG_SPACE?.getState();if(!state?.active)fail('请先进入体验账号。');return text(state.nickname,'体验昵称',1,20); }
  function base(title,name=author()) {const time=now();return {id:crypto.randomUUID(),title,author:name,createdAt:time,updatedAt:time,revision:1};}
  function touch(item) {if(!Number.isSafeInteger(item.revision) || item.revision<1 || item.revision>=Number.MAX_SAFE_INTEGER)fail('记录版本无效，原数据会保留。');item.revision++;item.updatedAt=now();}
  const empty=()=>({id:KEY,version:1,revision:0,...Object.fromEntries(groups.map(key=>[key,[]]))});
  function stateShape(value) {
    if(!value || value.id!==KEY || value.version!==1 || !Number.isSafeInteger(value.revision) || value.revision<0 || value.revision>=Number.MAX_SAFE_INTEGER)fail('社区数据格式无法读取，原记录会保留。');
    for(const group of groups) {
      if(!Array.isArray(value[group]) || new Set(value[group].map(item=>item?.id)).size!==value[group].length)fail('社区记录格式异常，原记录会保留。');
      for(const item of value[group])if(!item || !uuid(item.id) || !Number.isSafeInteger(item.revision) || item.revision<1 || typeof item.title!=='string' || typeof item.author!=='string' || !Number.isFinite(Date.parse(item.createdAt)) || !Number.isFinite(Date.parse(item.updatedAt)))fail('社区记录无法读取，原数据会保留。');
    }
    return value;
  }
  function openDB() {
    if(!dbPromise)dbPromise=new Promise((resolve,reject)=>{
      const request=indexedDB.open(DB,1);
      request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains(STORE))request.result.createObjectStore(STORE,{keyPath:'id'});};
      request.onerror=()=>reject(request.error);
      request.onblocked=()=>reject(new Error('旧页面阻止打开社区数据，请关闭旧页面后重试。'));
      request.onsuccess=()=>{const db=request.result;db.onversionchange=()=>{db.close();dbPromise=null;};resolve(db);};
    }).catch(error=>{dbPromise=null;throw error;});
    return dbPromise;
  }
  function notify(remote=false) {window.dispatchEvent(new CustomEvent('egg-community-change'));if(!remote)channel?.postMessage('changed');}
  try {if(typeof BroadcastChannel==='function'){channel=new BroadcastChannel(DB);channel.onmessage=event=>{if(event.data==='changed')notify(true);};}}catch {/* 同页事件仍可用；跨页可手动刷新。 */}
  async function transaction(change) {
    const mode=window.EGG_CLOUD?.status().mode;
    if(mode&&mode!=='local')fail('教程社区正在接入云端，目前开放课程与个人学习记录。');
    const db=await openDB();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction(STORE,change?'readwrite':'readonly'),store=tx.objectStore(STORE),request=store.get(KEY);let result,issue;
      request.onsuccess=()=>{
        try {
          const state=stateShape(request.result || empty());
          if(change){result=change(state);state.revision++;store.put(state);}else result=Object.fromEntries(groups.map(key=>[key,state[key]]));
        } catch(error){issue=error;tx.abort();}
      };
      tx.oncomplete=()=>{if(change)notify();resolve(copy(result));};
      tx.onabort=()=>reject(issue || tx.error || new Error('社区保存被中断，原记录会保留。'));
    });
  }
  // ponytail: 本机体验一次读写全部社区数据（包含小图）；规模增长后拆分元数据与按需加载图片，并交给真实服务端事务。
  const getState=()=>transaction();
  function message(state,title,body,targetUrl,sample=false) {const item={...base(title,'自由树社区'),body,targetUrl,read:false,...(sample?{sample:true}:{})};state.messages.unshift(item);return item;}
  function entity(items,id) {if(!uuid(id))fail('记录编号无效。');const item=items.find(item=>item.id===id);if(!item)fail('记录不存在，请刷新列表。');return item;}
  function published(state,id) {const item=entity(state.publications,id);if(item.status!=='published')fail('这篇教程尚未发布或已经下架。');return item;}
  function revision(item,expected) {if(!Number.isSafeInteger(expected) || expected<1 || item.revision!==expected)conflict();}
  function sniff(bytes) {
    if([137,80,78,71,13,10,26,10].every((value,i)=>bytes[i]===value))return 'image/png';
    if(bytes[0]===255 && bytes[1]===216 && bytes[2]===255)return 'image/jpeg';
    if(String.fromCharCode(...bytes.slice(0,4))==='RIFF' && String.fromCharCode(...bytes.slice(8,12))==='WEBP')return 'image/webp';
    return null;
  }
  async function imageValue(source) {
    if(source==null)return null;
    if(!source || typeof source!=='object' || !['image/png','image/jpeg','image/webp'].includes(source.mime) || typeof source.dataUrl!=='string' || source.dataUrl.length>Math.ceil(MAX_IMAGE/3)*4+40)fail('配图需为有效 PNG、JPG 或 WebP，单张不超过 2 MB。');
    const prefix=`data:${source.mime};base64,`;if(!source.dataUrl.startsWith(prefix))fail('配图格式与内容不一致。');
    const encoded=source.dataUrl.slice(prefix.length);if(encoded.length%4!==0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded))fail('配图编码不完整。');
    let bytes;try {bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));}catch {fail('配图编码无法读取。');}
    if(bytes.length<1 || bytes.length>MAX_IMAGE || source.size!==bytes.length || sniff(bytes)!==source.mime)fail('配图大小或文件格式不正确。');
    let bitmap;try {bitmap=await createImageBitmap(new Blob([bytes],{type:source.mime}));}catch {fail('配图无法解码，请换一张有效图片。');}
    const width=bitmap.width,height=bitmap.height;bitmap.close();
    if(width>8000 || height>8000 || width*height>16000000 || source.width!==width || source.height!==height)fail('配图尺寸不正确或超过 1600 万像素。');
    return {dataUrl:source.dataUrl,mime:source.mime,size:bytes.length,width,height,name:text(source.name || '配图','图片名称',1,120),alt:text(source.alt || '','配图说明',0,160)};
  }
  async function tutorialRecord(input) {
    if(!input || input.schemaVersion!==1 || !uuid(input.id) || !Number.isSafeInteger(input.revision) || input.revision<1 || input.revision>=Number.MAX_SAFE_INTEGER || !['draft','submitted-demo'].includes(input.status) || !Number.isFinite(Date.parse(input.createdAt)) || !Number.isFinite(Date.parse(input.updatedAt)))fail('请先保存有效草稿，再提交审核。');
    if(!categories.includes(input.category) || !['beginner','intermediate','advanced'].includes(input.difficulty) || !['not-tested','author-tested'].includes(input.testStatus) || !Array.isArray(input.steps) || input.steps.length<2 || input.steps.length>12 || new Set(input.steps.map(item=>item?.id)).size!==input.steps.length)fail('教程分类、难度、验证状态或步骤数量不正确。');
    const record={schemaVersion:1,id:input.id,revision:input.revision,author:author(),title:text(input.title,'教程标题',5,60),category:input.category,difficulty:input.difficulty,summary:text(input.summary,'教程简介',20,300),preparation:text(input.preparation,'准备说明',10,1000),validation:text(input.validation,'验证方法',20,1500),tips:text(input.tips,'注意事项',0,1000),testStatus:input.testStatus,status:input.status,createdAt:input.createdAt,updatedAt:input.updatedAt,steps:[]};
    for(const item of input.steps){if(!item || !uuid(item.id))fail('教程步骤编号无效。');record.steps.push({id:item.id,title:text(item.title,'步骤标题',2,80),body:text(item.body,'步骤说明',20,3000),image:await imageValue(item.image)});}
    if(record.steps.reduce((sum,item)=>sum+(item.image?.size || 0),0)>MAX_IMAGES)fail('整篇教程配图合计不能超过 8 MB。');
    return record;
  }
  async function submit(input) {
    const record=await tutorialRecord(copy(input));
    return transaction(state=>{
      author();
      const related=state.submissions.filter(item=>item.sourceId===record.id),same=related.find(item=>item.sourceRevision===record.revision);
      if(same)return same;
      if(related.some(item=>item.sourceRevision>record.revision))conflict();
      for(const old of related.filter(item=>item.status==='pending')){old.status='withdrawn';old.reason='作者提交了更新版本，旧版本自动退出审核。';touch(old);}
      const item={...base(record.title,record.author),sourceId:record.id,sourceRevision:record.revision,record:copy(record),status:'pending',reason:''};
      state.submissions.unshift(item);message(state,'教程已进入本机审核队列',`《${item.title}》已保存审核快照。修改草稿不会改变这份快照。`,'contribute.html?draft='+record.id+'#drafts');return item;
    });
  }
  async function review(id,decision,reason='',expectedRevision) {
    author();if(!['published','rejected','withdrawn'].includes(decision))fail('审核操作无效。');
    const note=text(reason,'审核说明',decision==='published'?0:1,1000);
    return transaction(state=>{
      author();const item=entity(state.submissions,id);revision(item,expectedRevision);
      if(!((item.status==='pending' && ['published','rejected'].includes(decision)) || (item.status==='published' && decision==='withdrawn')))fail('当前稿件状态不支持这项操作，请刷新列表。');
      item.status=decision;item.reason=note;touch(item);
      if(decision==='published'){
        for(const old of state.submissions.filter(old=>old.sourceId===item.sourceId && old.id!==item.id && old.status==='published')){old.status='withdrawn';old.reason='新版本审核通过，旧版本已替换。';touch(old);const previous=state.publications.find(pub=>pub.id===old.id);if(previous){previous.status='withdrawn';touch(previous);}}
        state.publications.unshift({...copy(item),revision:1,createdAt:now(),updatedAt:now()});
      } else if(decision==='withdrawn'){const publication=entity(state.publications,id);publication.status='withdrawn';touch(publication);}
      const labels={published:'教程审核通过',rejected:'教程需要修改',withdrawn:'教程已下架'};
      message(state,labels[decision],`《${item.title}》${note?'：'+note:'已显示在本机教程广场。'}`,decision==='published'?'community-tutorial.html?id='+item.id:'contribute.html?draft='+item.sourceId+'#drafts',Boolean(item.sample));return item;
    });
  }
  async function markRead(id) {author();return transaction(state=>{const item=entity(state.messages,id);if(!item.read){item.read=true;touch(item);}return item;});}
  async function markAllRead() {author();return transaction(state=>{let changed=0;for(const item of state.messages)if(!item.read){item.read=true;touch(item);changed++;}return changed;});}
  async function saveWork(input) {
    const name=author();if(!input || typeof input!=='object')fail('作品内容无效。');
    const title=text(input.title,'作品标题',2,60),description=text(input.description,'作品介绍',10,1000),mapCode=text(input.mapCode || '','地图编号',0,60),videoUrl=text(input.videoUrl || '','视频链接',0,2000),image=await imageValue(input.image);
    if(videoUrl){let url;try{url=new URL(videoUrl);}catch{fail('请输入完整的视频网址。');}if(url.protocol!=='https:' || url.username || url.password)fail('视频仅支持无账号信息的 https 链接。');}
    const tutorialId=input.tutorialId || null;
    return transaction(state=>{author();if(tutorialId)published(state,tutorialId);const item={...base(title,name),description,mapCode,videoUrl,image,tutorialId};state.works.unshift(item);message(state,'作品已保存',`《${title}》已经加入本机作品展示。`,'works.html');return item;});
  }
  async function ask(input) {const name=author();if(!input || typeof input!=='object')fail('问题内容无效。');const body=text(input.body,'问题',5,1000);return transaction(state=>{author();const tutorial=published(state,input.tutorialId);if(!Number.isInteger(input.step) || input.step<0 || input.step>tutorial.record.steps.length)fail('提问步骤无效。');const item={...base(tutorial.title,name),tutorialId:tutorial.id,step:input.step,body,answers:[]};state.questions.unshift(item);message(state,'收到新的教程提问',`${name}：${body}`,'community-tutorial.html?id='+tutorial.id+'#questions');return item;});}
  async function answer(questionId,body) {const name=author(),content=text(body,'回复',2,1500);return transaction(state=>{author();const item=entity(state.questions,questionId);published(state,item.tutorialId);const reply={...base(item.title,name),body:content};item.answers.push(reply);touch(item);message(state,'教程问题收到回复',`${name}：${content}`,'community-tutorial.html?id='+item.tutorialId+'#questions');return reply;});}
  async function report(input) {const name=author();if(!input || typeof input!=='object')fail('反馈内容无效。');const body=text(input.body,'反馈说明',5,1000);return transaction(state=>{author();const tutorial=published(state,input.tutorialId),item={...base(tutorial.title,name),tutorialId:tutorial.id,body,status:'pending',reply:''};state.reports.unshift(item);message(state,'反馈已保存',`关于《${tutorial.title}》的反馈已进入本机管理列表。`,'messages.html');return item;});}
  async function resolveReport(id,reply,expectedRevision) {author();const content=text(reply,'处理回复',1,1000);return transaction(state=>{author();const item=entity(state.reports,id);revision(item,expectedRevision);if(item.status!=='pending')fail('这条反馈已经处理，请刷新列表。');item.status='resolved';item.reply=content;touch(item);message(state,'反馈已有处理回复',`《${item.title}》：${content}`,'messages.html',Boolean(item.sample));return item;});}
  async function seedExamples() {
    author();return transaction(state=>{
      if(state.submissions.some(item=>item.sample))return {added:0};
      const time=now(),record={schemaVersion:1,id:crypto.randomUUID(),revision:1,author:'示例创作者',title:'示例教程 · 规划一张新手跑酷地图',category:'parkour',difficulty:'beginner',summary:'这是一篇流程展示用的示例教程，说明如何先规划起点、练习区和终点，再进入编辑器制作。',preparation:'准备一张空白地图，在纸上列出起点、两个练习区和终点，确认每个区域的预期目标。',steps:[{id:crypto.randomUUID(),title:'先写清楚每段目标',body:'把整张地图分成起点、基础跳跃区、连续跳跃区和终点。为每一段写下一句玩家需要完成的目标，先避免混合太多机制。',image:null},{id:crypto.randomUUID(),title:'用试玩记录调整路线',body:'搭好场景后从起点完整试玩，记录每个跳跃的失败位置。逐一调整间距并再次测试，直到新手可以理解接下来的方向。',image:null}],validation:'邀请第一次接触地图的人从起点试玩，观察是否理解前进方向，并记录每个区段的失败次数，再回到编辑器调整。',tips:'此内容只用于展示投稿、审核和问答流程，不代表已完成编辑器验证。',testStatus:'not-tested',status:'submitted-demo',createdAt:time,updatedAt:time};
      const item={...base(record.title,record.author),sourceId:record.id,sourceRevision:1,record,status:'published',reason:'主动载入的流程示例。',sample:true};
      state.submissions.unshift(item);state.publications.unshift(copy(item));
      const pending={...base('示例投稿 · 规划新手跳跃练习','示例创作者'),sourceId:crypto.randomUUID(),sourceRevision:1,record:{...copy(record),id:crypto.randomUUID(),title:'示例投稿 · 规划新手跳跃练习'},status:'pending',reason:'',sample:true};pending.record.id=pending.sourceId;state.submissions.unshift(pending);
      const rejected={...base('示例退回 · 把试玩步骤写得更具体','示例创作者'),sourceId:crypto.randomUUID(),sourceRevision:1,record:{...copy(record),id:crypto.randomUUID(),title:'示例退回 · 把试玩步骤写得更具体'},status:'rejected',reason:'请补充每个区段的试玩操作和预期结果，再提交新版本。',sample:true};rejected.record.id=rejected.sourceId;state.submissions.unshift(rejected);
      const question={...base(item.title,'示例读者'),tutorialId:item.id,step:2,body:'试玩时如何记录最需要调整的位置？',answers:[{...base(item.title,'示例创作者'),body:'先记录发生在哪一段，再注明跳跃起点、落点和失败次数；每次只改一个因素。',sample:true}],sample:true};state.questions.unshift(question);
      state.works.unshift({...base('示例作品 · 林间跳跃练习','示例创作者'),description:'这是作品展示区的示例卡片，用于体验地图编号、关联教程和截图的位置。尚未提供实际可游玩的地图。',mapCode:'',videoUrl:'',image:null,tutorialId:item.id,sample:true});
      state.reports.unshift({...base(item.title,'示例读者'),tutorialId:item.id,body:'希望在第二步增加一份试玩记录表，方便照着填写。',status:'pending',reply:'',sample:true});
      message(state,'示例社区已准备好','可以在本机体验审核、教程广场、作品、提问与消息。示例内容均有明确标记。','community.html',true);return {added:8};
    });
  }
  window.EGG_COMMUNITY=Object.freeze({getState,submit,review,markRead,markAllRead,saveWork,ask,answer,report,resolveReport,seedExamples});
})();
