"use strict";
(() => {
  const api = window.EGG_SPACE, form = document.getElementById('contribute-form');
  const $ = id => document.getElementById(id);
  const DB = 'eggcode-academy.tutorial-posts-preview.v1', STORE = 'tutorials';
  const MAX_IMAGE = 2 * 1024 * 1024, MAX_IMAGES = 8 * 1024 * 1024, MAX_PACKAGE = 12 * 1024 * 1024;
  const categories = {match3:'消消乐',progression:'数值成长',inventory:'背包与物品',parkour:'跑酷闯关',racing:'竞速玩法',survival:'生存战斗',puzzle:'解谜机关',simulation:'模拟经营',other:'其他玩法'};
  const difficulties = {beginner:'入门',intermediate:'进阶',advanced:'高阶'};
  const textFields = ['title','category','difficulty','summary','preparation','validation','tips','testStatus'];
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const count = value => Array.from(value).length;
  const uuid = value => typeof value === 'string' && /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value);
  const now = () => new Date().toISOString();
  const step = () => ({id:crypto.randomUUID(),title:'',body:'',image:null});
  const fresh = () => ({schemaVersion:1,id:crypto.randomUUID(),revision:0,author:api?.getState().nickname || '创作者',title:'',category:'match3',difficulty:'beginner',summary:'',preparation:'',steps:[step(),step()],validation:'',tips:'',testStatus:'not-tested',status:'draft',createdAt:now(),updatedAt:now()});
  let editor = fresh(), records = [], submissions = [], dirty = false, pendingImages = 0, saving = false, dbPromise, previewRecord, communityRefresh=0;
  const community=window.EGG_COMMUNITY, submissionLabels={pending:'待审核 · 本机',published:'已发布 · 本机',rejected:'需修改',withdrawn:'已撤回 / 下架'};
  const latestSubmission=id=>submissions.filter(item=>item.sourceId===id).sort((a,b)=>b.sourceRevision-a.sourceRevision)[0];
  function renderReviewState() {const item=latestSubmission(editor.id),node=$('contribute-review-state');node.replaceChildren();if(item){const status=document.createElement('strong');status.textContent=submissionLabels[item.status] || '未知状态';node.append(status);const reason=document.createElement('p');reason.textContent=item.reason || '审核快照已保存，继续编辑不会改变正在审核或广场中的内容。';node.append(reason);if(editor.revision>item.sourceRevision || dirty){const draft=document.createElement('p');draft.textContent='当前草稿有更新，需再次提交并审核才会替换已发布版本。';node.append(draft);}}const link=document.createElement('a');link.href=item?.status==='published'?'community-tutorial.html?id='+item.id:'admin.html';link.className='space-plain';link.textContent=item?.status==='published'?'查看本机已发布教程 ↗':'体验本机审核流程 ↗';node.append(link);}
  async function refreshCommunity() {if(!community)return;const sequence=++communityRefresh;const state=await community.getState();if(sequence!==communityRefresh)return;submissions=state.submissions;renderList();renderReviewState();}
  function message(text, kind = 'info') { const node=$('contribute-message');node.hidden=!text;node.setAttribute('role',kind==='error'?'alert':'status');node.textContent=text;node.dataset.kind=kind;if(text && kind==='error')node.focus(); }
  function failure(error) {
    if (error.name === 'QuotaExceededError') return '浏览器存储空间不足，草稿没有保存。当前编辑仍保留，请先导出教程包，再整理旧草稿。';
    if (error.name === 'SecurityError' || error.name === 'InvalidStateError' || error.name === 'VersionError') return '浏览器暂不能访问本机草稿，原记录没有被替换。可以继续编辑并导出教程包备份。';
    return error.message || '操作未完成，当前编辑仍保留。请先导出教程包备份。';
  }
  function openDB() {
    if (!dbPromise) dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB, 1);
      request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE,{keyPath:'id'}); };
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('其他页面正在使用另一版投稿数据，请关闭旧页面后重试。原草稿会保留。'));
      request.onsuccess = () => { const db = request.result; db.onversionchange = () => { db.close(); dbPromise = null; }; resolve(db); };
    }).catch(error => { dbPromise = null; throw error; });
    return dbPromise;
  }
  async function readAll() {
    const db = await openDB();
    return new Promise((resolve, reject) => { const tx = db.transaction(STORE,'readonly'), request = tx.objectStore(STORE).getAll(); let result; request.onsuccess = () => { result = request.result; }; tx.oncomplete = () => resolve(result); tx.onabort = () => reject(tx.error || new Error('草稿读取被中断，原数据会保留。')); });
  }
  async function writeRecord(record, remove = false) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE,'readwrite'), store = tx.objectStore(STORE), request = store.get(record.id); let issue, saved;
      request.onsuccess = () => {
        const previous = request.result;
        if ((previous ? previous.revision : 0) !== record.revision || (previous && draftError(previous)) || (remove && !previous)) {
          issue = Object.assign(new Error('另一页已修改或删除这篇草稿，当前编辑没有覆盖它。请先导出当前内容，再重新载入已保存版本。'),{code:'conflict'}); tx.abort(); return;
        }
        if (remove) store.delete(record.id);
        else { saved = {...record,revision:record.revision + 1,updatedAt:now()}; store.put(saved); }
      };
      tx.oncomplete = () => resolve(saved);
      tx.onabort = () => reject(issue || tx.error || new Error('草稿没有保存，当前编辑仍保留。'));
    });
  }
  function sniff(bytes) {
    if ([137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v)) return 'image/png';
    if (bytes[0]===255 && bytes[1]===216 && bytes[2]===255) return 'image/jpeg';
    if (String.fromCharCode(...bytes.slice(0,4))==='RIFF' && String.fromCharCode(...bytes.slice(8,12))==='WEBP') return 'image/webp';
    return null;
  }
  function safeImage(image) {
    if (!image || !['image/png','image/jpeg','image/webp'].includes(image.mime) || typeof image.dataUrl !== 'string' || image.dataUrl.length > Math.ceil(MAX_IMAGE / 3) * 4 + 40 || typeof image.name !== 'string' || count(image.name)>120 || typeof image.alt !== 'string' || count(image.alt)>160 || !Number.isInteger(image.size) || image.size<1 || image.size>MAX_IMAGE || !Number.isInteger(image.width) || !Number.isInteger(image.height) || image.width<1 || image.height<1 || image.width>8000 || image.height>8000 || image.width*image.height>16000000) return false;
    const prefix = `data:${image.mime};base64,`; if (!image.dataUrl.startsWith(prefix)) return false;
    const encoded = image.dataUrl.slice(prefix.length);
    if (encoded.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) return false;
    const size = encoded.length * 3 / 4 - (encoded.endsWith('==') ? 2 : encoded.endsWith('=') ? 1 : 0);
    try { return size === image.size && sniff(Uint8Array.from(atob(encoded.slice(0,48)),c=>c.charCodeAt(0)))===image.mime; } catch { return false; }
  }
  async function imageFromFile(file, alt = '') {
    if (!file.size || file.size>MAX_IMAGE) throw new Error('图片需小于或等于 2 MB，不能是空文件。');
    const bytes = new Uint8Array(await file.slice(0,32).arrayBuffer()), mime = sniff(bytes);
    if (!mime || (file.type && file.type !== mime && file.type !== 'application/octet-stream')) throw new Error('只支持真实 PNG、JPG、WebP 图片，文件内容与格式必须一致。');
    let bitmap;
    try { bitmap = await createImageBitmap(file); if (bitmap.width>8000 || bitmap.height>8000 || bitmap.width*bitmap.height>16000000) throw new Error('图片尺寸过大，请缩小到 1600 万像素以内、最长边不超过 8000 像素。'); }
    catch (error) { bitmap?.close(); if (error.message.includes('图片尺寸')) throw error; throw new Error('图片无法解码，请选择完整有效的 PNG、JPG 或 WebP。'); }
    const width = bitmap.width, height = bitmap.height; bitmap.close();
    const dataUrl = await new Promise((resolve, reject)=>{const reader = new FileReader(); reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('图片读取失败，请重新选择。')); reader.readAsDataURL(new Blob([file],{type:mime}));});
    return {dataUrl,mime,size:file.size,name:Array.from(file.name || '配图').slice(0,120).join(''),width,height,alt:Array.from(alt).slice(0,160).join('')};
  }
  function draftError(record) {
    if (!record || record.schemaVersion!==1 || !uuid(record.id) || !Number.isSafeInteger(record.revision) || record.revision<0 || record.revision>=Number.MAX_SAFE_INTEGER || !['draft','submitted-demo'].includes(record.status) || typeof record.author!=='string' || count(record.author)>20 || !Number.isFinite(Date.parse(record.createdAt)) || !Number.isFinite(Date.parse(record.updatedAt))) return '教程包格式或版本不支持，原草稿不会被覆盖。';
    for (const [field, max] of [['title',60],['summary',300],['preparation',1000],['validation',1500],['tips',1000]]) if (typeof record[field]!=='string' || count(record[field])>max) return `教程的${{title:'标题',summary:'简介',preparation:'准备说明',validation:'验证方法',tips:'注意事项'}[field]}过长或格式不正确。`;
    if (!Object.hasOwn(categories,record.category) || !Object.hasOwn(difficulties,record.difficulty) || !['not-tested','author-tested'].includes(record.testStatus) || !Array.isArray(record.steps) || record.steps.length<1 || record.steps.length>12 || new Set(record.steps.map(item=>item?.id)).size!==record.steps.length) return '教程分类、难度或步骤格式不正确。';
    let total = 0;
    for (const item of record.steps) { if (!item || !uuid(item.id) || typeof item.title!=='string' || count(item.title)>80 || typeof item.body!=='string' || count(item.body)>3000 || (item.image!==null && !safeImage(item.image))) return '步骤标题、说明或图片不符合教程包格式。'; if (item.image) total+=item.image.size; }
    return total>MAX_IMAGES ? '整篇教程的图片合计不能超过 8 MB。' : null;
  }
  function completion(record) {
    const incomplete=record.steps.findIndex(item=>count(item.title.trim())<2 || count(item.body.trim())<20);
    return [
      {label:'标题、分类和简介完整',ready:count(record.title.trim())>=5 && count(record.summary.trim())>=20,field:count(record.title.trim())<5?'post-title':'post-summary'},
      {label:'场景、触发器和变量已交代',ready:count(record.preparation.trim())>=10,field:'post-preparation'},
      {label:'至少两步，连接与参数写清楚',ready:record.steps.length>=2 && incomplete<0,field:record.steps.length<2?'contribute-add-step':`step-${incomplete>=0 && count(record.steps[incomplete].title.trim())>=2?'body':'title'}-${Math.max(0,incomplete)}`},
      {label:'写明试玩操作与预期结果',ready:count(record.validation.trim())>=20,field:'post-validation'},
      {label:'明确说明实际试玩状态',ready:['not-tested','author-tested'].includes(record.testStatus),field:'post-test-status'}
    ];
  }
  function readSteps() { return [...$('contribute-steps').children].map(node=>{const source=editor.steps.find(item=>item.id===node.dataset.stepId);const image=source.image ? {...source.image,alt:node.querySelector('[data-step-field="alt"]')?.value || ''} : null;return {id:source.id,title:node.querySelector('[data-step-field="title"]').value,body:node.querySelector('[data-step-field="body"]').value,image};}); }
  function collect() { return {...editor,...Object.fromEntries(textFields.map(field=>[field,form.elements.namedItem(field).value])),steps:readSteps()}; }
  function updateChecks() {
    const record=collect(), checks=completion(record), ready=checks.filter(item=>item.ready).length;
    $('contribute-checklist').innerHTML=checks.map(item=>`<li data-ready="${item.ready}"><span aria-hidden="true">${item.ready?'✓':''}</span>${item.label}</li>`).join('');
    $('contribute-ready-count').textContent=`${ready} / 5`;
    $('contribute-step-count').textContent=`${record.steps.length} 个步骤`;
    const images=record.steps.flatMap(item=>item.image?[item.image]:[]);
    $('contribute-image-size').textContent=`${images.length} 张配图${images.length ? ' · '+(images.reduce((sum,image)=>sum+image.size,0)/1024/1024).toFixed(1)+' MB' : ''}`;
    $('contribute-add-step').disabled=record.steps.length>=12;
    const saveLabel=saving ? '正在保存更改…' : pendingImages ? '正在读取配图…' : dirty ? '有修改 · 尚未保存' : editor.revision ? `草稿已保存 · ${new Intl.DateTimeFormat('zh-CN',{hour:'2-digit',minute:'2-digit'}).format(new Date(editor.updatedAt))}` : '新草稿 · 尚未保存';
    if($('contribute-save-status').textContent!==saveLabel)$('contribute-save-status').textContent=saveLabel;
    $('contribute-save-feedback').textContent=saveLabel;
    $('contribute-save').disabled=saving || pendingImages>0; $('contribute-submit').disabled=saving || pendingImages>0;
    ['contribute-preview','contribute-export','contribute-new','contribute-import-button','contribute-reload'].forEach(id=>{$(id).disabled=saving || pendingImages>0;});
    renderReviewState();
  }
  function markDirty() { dirty=true; updateChecks(); }
  function renderSteps() {
    const focused=document.activeElement?.closest('#contribute-steps') ? document.activeElement : null;
    const focusId=focused?.id, start=focused?.selectionStart, end=focused?.selectionEnd;
    $('contribute-steps').innerHTML=editor.steps.map((item,i)=>`<article class="contribute-step" data-step-id="${item.id}"><header class="contribute-step-header"><h3>步骤 ${i+1}</h3><div class="contribute-step-controls"><button type="button" data-post-action="move-up" ${i===0?'disabled':''} aria-label="上移步骤 ${i+1}">↑</button><button type="button" data-post-action="move-down" ${i===editor.steps.length-1?'disabled':''} aria-label="下移步骤 ${i+1}">↓</button><button type="button" data-post-action="remove-step" ${editor.steps.length===1?'disabled':''} aria-label="删除步骤 ${i+1}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7"/></svg></button></div></header><label for="step-title-${i}">这一步做什么？</label><input id="step-title-${i}" data-step-field="title" maxlength="160" value="${escape(item.title)}" placeholder="例如：创建玩家分数变量"><label for="step-body-${i}">积木、连接与参数</label><textarea id="step-body-${i}" data-step-field="body" rows="4" maxlength="6000" placeholder="从哪个分类找到积木？接到什么事件下面？参数填写什么？">${escape(item.body)}</textarea><small>投稿时标题 2–80 字，说明 20–3000 字。</small><div class="contribute-upload"><input type="file" id="step-file-${i}" data-step-file accept="image/png,image/jpeg,image/webp"><label for="step-file-${i}">${item.image?'更换配图':'＋ 添加配图'}</label><small>真实积木图或编辑器截图</small></div>${item.image && safeImage(item.image)?`<figure class="contribute-step-image"><img src="${item.image.dataUrl}" alt="${escape(item.image.alt || item.title || '步骤配图')}" loading="lazy"><footer><small>${escape(item.image.name)} · ${(item.image.size/1024).toFixed(0)} KB</small><button class="space-plain" type="button" data-post-action="remove-image">移除图片</button></footer></figure><label for="step-alt-${i}">配图说明 <span class="contribute-optional">选填</span></label><input id="step-alt-${i}" data-step-field="alt" maxlength="320" value="${escape(item.image.alt)}" placeholder="描述图中重要的积木连接，最多160字">`:''}</article>`).join('');
    updateChecks();
    const target=focusId ? $(focusId) : null;if(target){target.focus({preventScroll:true});if(typeof start==='number' && typeof end==='number')target.setSelectionRange(start,end);}
  }
  function fillEditor(record) { editor=structuredClone(record); textFields.forEach(field=>{form.elements.namedItem(field).value=editor[field];}); dirty=false;$('contribute-reload').hidden=true;renderSteps(); }
  function confirmReplace() { return !dirty && !pendingImages || window.confirm('当前编辑尚未保存，继续会替换它。建议先保存或导出教程包。确定继续吗？'); }
  function setTab() {
    const drafts=location.hash==='#drafts'; $('contribute-editor-panel').hidden=drafts;$('contribute-drafts-panel').hidden=!drafts;
    for (const [id, selected] of [['contribute-editor-tab',!drafts],['contribute-drafts-tab',drafts]]) selected?$(id).setAttribute('aria-current','page'):$(id).removeAttribute('aria-current');
  }
  function setEditorURL() { const url=new URL(location.href);url.searchParams.set('draft',editor.id);url.hash='editor';history.replaceState(null,'',url);window.dispatchEvent(new Event('hashchange')); }
  function auth() {
    const active=Boolean(api?.getState().active); $('contribute-workspace').hidden=!active;$('contribute-login-gate').hidden=active;
    $('contribute-author').textContent=active ? `${api.getState().nickname} · 本机投稿体验` : '未进入体验账号';
    $('contribute-login-link').href='login.html?next='+encodeURIComponent('contribute.html'+location.search+location.hash);
    return active;
  }
  function articleHTML(record) {
    return `<h1>${escape(record.title || '还没写标题')}</h1><p class="contribute-article-meta">${escape(record.author)} · ${escape(categories[record.category])} · ${escape(difficulties[record.difficulty])}</p><p class="contribute-article-status">本机投稿预览，尚未公开。${record.testStatus==='author-tested'?'作者自述已在编辑器试玩，网站尚未独立验证。':'尚未在蛋仔编辑器试玩，效果需要实际验证。'}</p><p>${escape(record.summary || '还没写简介')}</p><h2>搭建前准备</h2><p>${escape(record.preparation || '还没写准备说明')}</p><h2>逐步搭建</h2>${record.steps.map((item,i)=>`<section><h3>${i+1}. ${escape(item.title || '还没写步骤标题')}</h3><p>${escape(item.body || '还没写步骤说明')}</p>${item.image && safeImage(item.image)?`<figure><img src="${item.image.dataUrl}" alt="${escape(item.image.alt || item.title || '步骤配图')}"><figcaption>${escape(item.image.alt || item.title || '步骤配图')}</figcaption></figure>`:''}</section>`).join('')}<h2>试玩与验证</h2><p>${escape(record.validation || '还没写验证方法')}</p>${record.tips?`<h2>容易踩的坑</h2><p>${escape(record.tips)}</p>`:''}`;
  }
  function preview(record) { previewRecord=structuredClone(record);$('contribute-preview-content').innerHTML=articleHTML(previewRecord);if(!$('contribute-preview-dialog').open)$('contribute-preview-dialog').showModal(); }
  function download(content, mime, filename) { const url=URL.createObjectURL(new Blob([content],{type:mime})), link=document.createElement('a');link.href=url;link.download=filename;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000); }
  function exportPackage(record=collect()) { const issue=draftError(record);if(issue){message(issue,'error');return;}download(JSON.stringify({format:'free-tree-tutorial',version:1,tutorial:record},null,2),'application/json;charset=utf-8','自由树-教程备份.json');message('已导出当前教程包，包含填写内容和配图。请妥善保存备份。'); }
  async function refresh() {
    try {
      // ponytail: 本机预览一次读取含配图的草稿；稿件规模增大时改为元数据列表与按需读取配图。
      const raw=await readAll();records=raw.filter(record=>!draftError(record)).sort((a,b)=>Date.parse(b.updatedAt)-Date.parse(a.updatedAt));
      if(raw.length!==records.length) message('部分草稿格式或版本无法读取，原记录会保留，不会被覆盖。','error');
      $('contribute-count').textContent=records.length;renderList();return true;
    } catch(error) { message(failure(error),'error');return false; }
  }
  function renderList() {
    $('contribute-draft-list').innerHTML=records.length ? `<div class="contribute-post-list">${records.map(record=>{const submission=latestSubmission(record.id);return `<article class="contribute-post-card" data-post-id="${record.id}"><div class="contribute-post-meta"><span>${escape(categories[record.category])} · ${record.steps.length} 步</span><span class="space-status-pill">${submission?escape(submissionLabels[submission.status] || '未知状态'):'草稿'}</span></div><h3>${escape(record.title || '未命名教程')}</h3><p>${escape(record.summary || '还没写简介，继续完善你的玩法说明。')}</p>${submission?.reason?`<p class="contribute-review-reason">审核说明：${escape(submission.reason)}</p>`:''}${submission && record.revision>submission.sourceRevision?'<small>草稿有更新，尚未提交此版本。</small>':''}<small>${new Intl.DateTimeFormat('zh-CN',{month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(record.updatedAt))} 保存</small><footer><button class="space-button" type="button" data-post-action="edit-post">继续编辑</button><button class="space-plain" type="button" data-post-action="preview-post">预览</button><button class="space-plain" type="button" data-post-action="export-post">导出</button>${submission?.status==='published'?`<a class="space-plain" href="community-tutorial.html?id=${submission.id}">查看已发布版</a>`:''}<button class="space-plain" type="button" data-post-action="delete-post">删除草稿</button></footer></article>`;}).join('')}</div>` : '<div class="contribute-empty"><h3>你的第一篇教程，从这里开始</h3><p>把成功搭出的一个小效果写下来，配图和参数都会一起保存在草稿里。</p><button type="button" class="space-button space-button-primary" data-post-action="new-post">写第一篇教程</button></div>';
  }
  async function save(submitted=false) {
    if (!auth()) { message('请先进入体验账号，当前编辑内容仍会保留。','error');return; }
    if (pendingImages || saving) return;
    const record=collect(), issue=draftError(record);
    if(issue){message(issue,'error');return;}
    if (submitted) {
      const missing=completion(record).find(item=>!item.ready);
      if(missing){message('请先补齐：'+missing.label+'。','error');const link=document.createElement('a');link.href='#'+missing.field;link.textContent=' 查看需要补齐的内容';$('contribute-message').append(link);const target=$(missing.field);target?.setAttribute('aria-invalid','true');const descriptions=target?.getAttribute('aria-describedby')?.split(' ') || [];if(!descriptions.includes('contribute-message'))descriptions.push('contribute-message');target?.setAttribute('aria-describedby',descriptions.join(' '));target?.focus();return;}
    }
    saving=true;$('contribute-fields').disabled=true;updateChecks();
    try {
      const saved=submitted && !dirty && editor.revision>0 && editor.status==='submitted-demo' ? structuredClone(editor) : await writeRecord({...record,author:api.getState().nickname,status:submitted?'submitted-demo':'draft'});
      editor=saved;dirty=false;setEditorURL();await refresh();
      if(submitted){if(!community)throw new Error('草稿已保存，但审核模块未能加载。刷新页面后可以重试，内容不会丢失。');const item=await community.submit(saved);await refreshCommunity();message(item.status==='pending'?'投稿已进入本机审核队列。可在“本机审核”中通过或退回，再到教程广场查看效果。':`这个版本已经提交过，目前状态：${submissionLabels[item.status]}。修改草稿并保存后可提交新版本。`);}
      else message('草稿已保存，填写内容与配图会一起保留。');
      $('contribute-reload').hidden=true;
    }
    catch(error){message(failure(error),'error');$('contribute-reload').hidden=error.code!=='conflict';}
    finally { saving=false;$('contribute-fields').disabled=false;updateChecks(); }
  }
  async function importPackage(file) {
    if (!file || !auth()) return;
    if (file.size>MAX_PACKAGE){message('教程包不能超过 12 MB，请选择本站导出的 JSON 教程包。','error');return;}
    try {
      const pack=JSON.parse(await file.text());
      if(pack?.format!=='free-tree-tutorial' || pack.version!==1 || !pack.tutorial) throw new Error('只支持本站导出的 JSON 教程包。原草稿没有改变。');
      if(!['draft','submitted-demo'].includes(pack.tutorial.status)) throw new Error('教程包包含不支持的投稿状态，原草稿没有改变。');
      const source=structuredClone(pack.tutorial);source.id=crypto.randomUUID();source.revision=0;source.status='draft';source.author=api.getState().nickname;source.createdAt=now();source.updatedAt=now();
      const issue=draftError(source);if(issue)throw new Error(issue);
      for(const item of source.steps) {item.id=crypto.randomUUID();if(item.image){const encoded=item.image.dataUrl.split(',')[1],bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));item.image=await imageFromFile(new File([bytes],item.image.name,{type:item.image.mime}),item.image.alt);}}
      if(!confirmReplace())return;
      fillEditor(source);dirty=true;setEditorURL();updateChecks();message('教程包已载入为新草稿，尚未保存。导入不会覆盖已有教程，也不会沿用提交状态。');
    } catch(error){message(error instanceof SyntaxError?'JSON 格式无法读取，原草稿没有改变。':failure(error),'error');}
  }
  form.addEventListener('submit',event=>{event.preventDefault();save();});
  form.addEventListener('input',event=>{if(event.target.matches('input:not([type="file"]),textarea,select')){event.target.removeAttribute('aria-invalid');const descriptions=event.target.getAttribute('aria-describedby')?.split(' ').filter(id=>id!=='contribute-message');if(descriptions?.length)event.target.setAttribute('aria-describedby',descriptions.join(' '));else event.target.removeAttribute('aria-describedby');markDirty();}});
  form.addEventListener('change',event=>{if(event.target.matches('select'))markDirty();});
  $('contribute-submit').addEventListener('click',()=>save(true));
  $('contribute-preview').addEventListener('click',()=>preview(collect()));
  $('contribute-preview-close').addEventListener('click',()=>$('contribute-preview-dialog').close());
  $('contribute-export').addEventListener('click',()=>exportPackage());
  $('contribute-export-html').addEventListener('click',()=>{
    const style='html{color-scheme:dark;background:#070710}body{box-sizing:border-box;max-width:820px;margin:35px auto;padding:28px 32px;background:linear-gradient(135deg,#1c263b,#191527);color:#f3f1fa;border:1px solid #c9caef26;border-radius:22px;font:16px/1.95 "Microsoft YaHei",system-ui,sans-serif}h1{font-size:30px}h2{font-size:22px;margin-top:30px}h3{font-size:19px}p{white-space:pre-wrap;overflow-wrap:anywhere}img{max-width:100%;height:auto}figure{margin:20px 0}figcaption,.contribute-article-meta{font-size:13px;color:#b5b2c5}.contribute-article-status{padding:15px;background:#7097bd1f;color:#a8d9ee;border:1px solid #c9caef26;border-radius:9px}@media(max-width:600px){body{margin:16px;padding:22px 20px}h1{font-size:25px}}';
    download(`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><title>${escape(previewRecord.title || '自由树教程预览')}</title><style>${style}</style></head><body><article>${articleHTML(previewRecord)}</article></body></html>`,'text/html;charset=utf-8','自由树-教程阅读版.html');
  });
  function newPost(){if(!confirmReplace())return;fillEditor(fresh());setEditorURL();message('已新建空白教程，保存前原投稿不会改变。');}
  $('contribute-new').addEventListener('click',newPost);
  $('contribute-add-step').addEventListener('click',()=>{if(editor.steps.length>=12)return;editor.steps=readSteps();editor.steps.push(step());renderSteps();markDirty();$(`step-title-${editor.steps.length-1}`).focus();});
  $('contribute-steps').addEventListener('click',event=>{
    const button=event.target.closest('[data-post-action]');if(!button)return;
    const node=button.closest('[data-step-id]');editor.steps=readSteps();const index=editor.steps.findIndex(item=>item.id===node.dataset.stepId), action=button.dataset.postAction;
    if(action==='remove-image')editor.steps[index].image=null;
    else if(action==='remove-step'){if(editor.steps.length===1 || !window.confirm('删除这一步会同时移除它的说明和配图，确定删除吗？'))return;editor.steps.splice(index,1);}
    else if(action==='move-up' && index>0)[editor.steps[index-1],editor.steps[index]]=[editor.steps[index],editor.steps[index-1]];
    else if(action==='move-down' && index<editor.steps.length-1)[editor.steps[index+1],editor.steps[index]]=[editor.steps[index],editor.steps[index+1]];
    renderSteps();markDirty();
    const focusIndex=action==='move-up'?Math.max(0,index-1):action==='move-down'?Math.min(editor.steps.length-1,index+1):Math.min(index,editor.steps.length-1);$(`step-title-${focusIndex}`).focus();
  });
  $('contribute-steps').addEventListener('change',async event=>{
    if(!event.target.matches('[data-step-file]'))return;
    const file=event.target.files[0], stepId=event.target.closest('[data-step-id]').dataset.stepId, editorId=editor.id;event.target.value='';if(!file)return;
    pendingImages++;updateChecks();
    try {
      const image=await imageFromFile(file);
      if(editor.id!==editorId)return;
      editor.steps=readSteps();const item=editor.steps.find(item=>item.id===stepId);if(!item)return;
      const total=editor.steps.reduce((sum,item)=>sum+(item.id!==stepId && item.image?item.image.size:0),0)+image.size;if(total>MAX_IMAGES)throw new Error('整篇教程的图片合计不能超过 8 MB，请减少图片或缩小文件。');
      item.image=image;renderSteps();markDirty();message('配图已添加到当前步骤，保存草稿后才会写入本机。');
    } catch(error){message(failure(error),'error');}
    finally {pendingImages--;updateChecks();}
  });
  $('contribute-import-button').addEventListener('click',()=>{message('请选择本站导出的 JSON 教程包，不超过 12 MB。');$('contribute-import-file').click();});
  $('contribute-import-file').addEventListener('change',event=>{const file=event.target.files[0];event.target.value='';importPackage(file);});
  $('contribute-refresh').addEventListener('click',async()=>{await refresh();try{await refreshCommunity();}catch(error){message(failure(error),'error');}});
  $('contribute-reload').addEventListener('click',async()=>{const id=editor.id;if(!await refresh())return;const record=records.find(item=>item.id===id);if(record && editor.id===id){if(!confirmReplace())return;fillEditor(record);message('已载入本机保存的版本。');}else message('原稿已经删除或当前编辑已切换，当前内容仍保留。可以导出教程包备份。','error');});
  $('contribute-draft-list').addEventListener('click',async event=>{
    const button=event.target.closest('[data-post-action]');if(!button || saving || !auth())return;
    if(button.dataset.postAction==='new-post'){newPost();return;}
    const id=button.closest('[data-post-id]')?.dataset.postId, record=records.find(item=>item.id===id);if(!record)return;
    if(button.dataset.postAction==='preview-post')preview(record);
    else if(button.dataset.postAction==='export-post')exportPackage(record);
    else if(button.dataset.postAction==='edit-post'){if(record.id!==editor.id){if(!confirmReplace())return;fillEditor(record);}setEditorURL();}
    else if(button.dataset.postAction==='delete-post'){
      if(!window.confirm('删除这篇本机草稿及其配图？已提交的审核快照与已发布版仍会保留。无法撤销，建议先导出备份。'))return;
      if(record.id===editor.id && !confirmReplace())return;
      saving=true;$('contribute-fields').disabled=true;updateChecks();
      try{await writeRecord(record,true);if(editor.id===record.id){fillEditor(fresh());const url=new URL(location.href);url.searchParams.delete('draft');history.replaceState(null,'',url);}await refresh();message('已删除这篇本机草稿与配图，审核快照与已发布版不受影响。');}catch(error){message(failure(error),'error');}
      finally{saving=false;$('contribute-fields').disabled=false;updateChecks();}
    }
  });
  window.addEventListener('beforeunload',event=>{if(dirty || pendingImages){event.preventDefault();event.returnValue='';}});
  window.addEventListener('hashchange',setTab);
  window.EGG_CONTRIBUTE=Object.freeze({getCloudRecord(){
    if(dirty || pendingImages || saving || !editor.revision)throw new Error('请先保存草稿，等待配图读取和保存完成后再上传。');
    const record=collect(),issue=draftError(record),missing=completion(record).find(item=>!item.ready);
    if(issue)throw new Error(issue);
    if(missing)throw new Error('请先补齐：'+missing.label+'。');
    return structuredClone(record);
  }});
  window.addEventListener('egg-community-change',()=>{refreshCommunity().catch(error=>message(failure(error),'error'));});
  api?.subscribe(auth);fillEditor(editor);auth();setTab();
  refreshCommunity().catch(error=>message(failure(error),'error'));
  (async()=>{const id=new URLSearchParams(location.search).get('draft'),initialId=editor.id;if(!await refresh())return;if(id){if(dirty || pendingImages || editor.id!==initialId || editor.revision>0){message('为保留当前编辑，原草稿尚未载入。需要打开它时，请从“我的投稿”选择。');return;}const record=records.find(item=>item.id===id);if(record)fillEditor(record);else message('没有找到这篇本机草稿，当前显示空白教程。原记录没有改变。','error');}})();
})();
