'use strict';
(() => {
  const api=window.EGG_COMMUNITY, account=window.EGG_SPACE, $=id=>document.getElementById(id);
  const admin=document.body.dataset.page==='admin';
  const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const states={pending:'待审核',published:'已在本机展示',rejected:'需修改',withdrawn:'已撤回 / 下架'};
  const date=value=>{const d=new Date(value);return Number.isNaN(d.getTime())?'时间未知':new Intl.DateTimeFormat('zh-CN',{month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(d);};
  let data={submissions:[],publications:[],reports:[],messages:[]},selected=null,busy=false,loadSequence=0;
  function notice(text,error=false){const node=$('manage-status');node.textContent=text;node.dataset.error=String(error);node.setAttribute('role',error?'alert':'status');if(error)node.focus();}
  function safeLink(value){try{const link=new URL(value,location.href),allowed=['contribute.html','community.html','community-tutorial.html','works.html','messages.html','admin.html','personal-space.html','lesson.html'];return link.origin===location.origin&&allowed.some(file=>link.pathname===new URL(file,location.href).pathname)?link.href:null;}catch{return null;}}
  function imageHTML(image,title){return image&&typeof image.dataUrl==='string'&&/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(image.dataUrl)&&image.dataUrl.length<3*1024*1024?`<figure><img src="${image.dataUrl}" alt="${escape(image.alt||title)}" loading="lazy"><figcaption>${escape(image.alt||title)}</figcaption></figure>`:'';}
  function gate(){const active=Boolean(account?.getState().active);$('manage-gate').hidden=active;$('manage-workspace').hidden=!active;return active;}
  function empty(title,body,link='community.html',label='浏览教程广场'){return `<div class="manage-empty"><h2>${escape(title)}</h2><p>${escape(body)}</p><a class="space-button" href="${link}">${label}</a></div>`;}
  function renderAdmin(){
    const reports=location.hash==='#reports';$('manage-tutorials').hidden=reports;$('manage-reports').hidden=!reports;
    ['tutorial','report'].forEach((kind,i)=>{const node=$(`manage-${kind}-tab`);if(reports===Boolean(i))node.setAttribute('aria-current','page');else node.removeAttribute('aria-current');});
    $('manage-pending-count').textContent=data.submissions.filter(s=>s.status==='pending').length;
    $('manage-report-count').textContent=data.reports.filter(r=>r.status!=='resolved').length;
    const query=$('manage-search').value.trim().toLocaleLowerCase(),filter=$('manage-filter').value;
    const list=data.submissions.filter(s=>(filter==='all'||s.status===filter)&&`${s.title} ${s.author}`.toLocaleLowerCase().includes(query)).sort((a,b)=>Date.parse(b.updatedAt)-Date.parse(a.updatedAt));
    if(!list.some(s=>s.id===selected))selected=list[0]?.id||null;
    $('manage-list').innerHTML=list.length?list.map(s=>`<button class="manage-review-select" type="button" data-select="${escape(s.id)}" aria-pressed="${s.id===selected}"><span class="manage-badge" data-state="${escape(s.status)}">${escape(states[s.status]||s.status)}</span>${s.sample?' <span class="manage-badge">示例</span>':''}<strong>${escape(s.title)}</strong><small>${escape(s.author)} · ${date(s.updatedAt)}</small><small>${s.record?.steps?.length||0} 个步骤 · 稿件版本 ${s.sourceRevision}</small></button>`).join(''):empty('这一栏很安静','换个筛选条件，或先写一份教程体验审核流程。','contribute.html','写一份教程');
    renderDetail();renderReports();
  }
  function renderDetail(){
    const s=data.submissions.find(s=>s.id===selected);if(!s){$('manage-detail').innerHTML=empty('准备好，迎接下一份分享','选择左侧投稿，完整阅读步骤、参数和试玩说明。');return;}
    const r=s.record||{},pending=s.status==='pending',published=s.status==='published';
    $('manage-detail').innerHTML=`<span class="manage-badge" data-state="${escape(s.status)}">${escape(states[s.status])}</span><h2>${escape(s.title)}</h2><p class="manage-meta">作者：${escape(s.author)} · ${date(s.createdAt)}${s.sample?' · 演示样例':''}</p><p>${escape(r.summary)}</p><p class="manage-notice">${r.testStatus==='author-tested'?'作者自述已试玩；内容审核不代表已在编辑器独立验证。':'作者尚未在蛋仔编辑器试玩。批准展示也不会改变此验证标记。'}</p><h3>搭建前准备</h3><p>${escape(r.preparation)}</p>${(r.steps||[]).map((step,i)=>`<section><h3>${i+1}. ${escape(step.title)}</h3><p>${escape(step.body)}</p>${imageHTML(step.image,step.title)}</section>`).join('')}<h3>试玩与验证</h3><p>${escape(r.validation)}</p>${r.tips?`<h3>容易踩的坑</h3><p>${escape(r.tips)}</p>`:''}${s.reason?`<h3>处理说明</h3><p>${escape(s.reason)}</p>`:''}<div class="manage-review-actions">${pending||published?`<label for="review-reason">${pending?'审核建议':'下架原因'}</label><textarea id="review-reason" rows="3" maxlength="1000" placeholder="指出具体步骤、参数和建议修改的内容。"></textarea><small>${pending?'退回时必须填写原因，通过时可选填建议。':'下架时必须填写原因，内容将从本机广场隐藏。'}操作仅针对当前审核快照。</small><div class="manage-buttons">${pending?'<button class="space-button space-button-primary" type="button" data-review="published">通过并在本机展示</button><button class="space-button" type="button" data-review="rejected">退回修改</button>':'<button class="space-button space-button-danger" type="button" data-review="withdrawn">从本机广场下架</button>'}</div>`:`<p class="manage-meta">${s.status==='rejected'?'作者可继续修改原稿，再提交新版本。':'这份审核记录已保留。新版本需要重新提交审核。'}</p>`}${published?`<a class="manage-back" href="community-tutorial.html?id=${encodeURIComponent(s.id)}">查看本机展示效果</a>`:''}</div>`;
  }
  function renderReports(){
    $('manage-report-list').innerHTML=data.reports.length?[...data.reports].sort((a,b)=>(a.status==='resolved')-(b.status==='resolved')||Date.parse(b.updatedAt)-Date.parse(a.updatedAt)).map(r=>{const p=data.publications.find(p=>p.id===r.tutorialId);return `<article class="manage-report-card"><span class="manage-badge">${r.status==='resolved'?'已回复':'待处理'}</span><h2>${escape(p?.title||'教程内容反馈')}</h2><p class="manage-meta">${escape(r.author)} · ${date(r.createdAt)}</p><p>${escape(r.body)}</p>${r.status==='resolved'?`<h3>处理回复</h3><p>${escape(r.reply)}</p>`:`<form data-report="${escape(r.id)}"><label for="report-${escape(r.id)}">告诉读者处理结果</label><textarea id="report-${escape(r.id)}" name="reply" rows="3" maxlength="1000" required placeholder="例如：已核对第2步，将参数由3改为4；谢谢你的提醒。"></textarea><button class="space-button space-button-primary" type="submit">回复并标记已处理</button></form>`}</article>`;}).join(''):empty('还没有纠错反馈','读者在社区教程详情提交的纠错，会出现在这里。');
  }
  function renderMessages(){
    const filter=$('message-filter').value,all=[...data.messages].sort((a,b)=>Date.parse(b.createdAt)-Date.parse(a.createdAt)),unread=all.filter(m=>!m.read).length;
    $('message-total').textContent=`${all.length} 条消息，${unread} 条未读`;$('message-read-all').disabled=busy||!unread;
    const list=all.filter(m=>filter==='all'||(filter==='read')===Boolean(m.read));
    $('message-list').innerHTML=list.length?list.map(m=>{const link=safeLink(m.targetUrl);return `<article class="manage-message" data-unread="${!m.read}"><header><h2>${escape(m.title)}</h2><span class="manage-badge">${m.read?'已读':'未读'}</span></header><p>${escape(m.body)}</p><footer><small>${date(m.createdAt)}${m.sample?' · 演示样例':''}</small>${link?`<a href="${escape(link)}">查看相关内容</a>`:''}${m.read?'':`<button class="space-plain" type="button" data-read="${escape(m.id)}">标为已读</button>`}</footer></article>`;}).join(''):empty(filter==='unread'?'未读消息已看完':'这里还没有消息','投稿审核、问答回复和纠错处理后，会在这里收到本机消息。');
  }
  function preserveInputs(){return [...document.querySelectorAll('#manage-workspace textarea')].map(node=>({id:node.id,owner:selected,value:node.value,focused:node===document.activeElement,start:node.selectionStart,end:node.selectionEnd}));}
  async function refresh(){const seq=++loadSequence;try{const next=await api.getState();if(seq!==loadSequence)return;const inputs=preserveInputs();data=next;gate();admin?renderAdmin():renderMessages();for(const old of inputs){if(old.id==='review-reason'&&old.owner!==selected)continue;const node=$(old.id);if(node){node.value=old.value;if(old.focused){node.focus({preventScroll:true});node.setSelectionRange(old.start,old.end);}}}}catch(error){notice(error.message||'记录读取失败，请稍后重试。',true);}}
  async function mutate(action,success){if(busy||!gate())return;busy=true;document.querySelectorAll('#manage-workspace button,#manage-workspace input,#manage-workspace select,#manage-workspace textarea').forEach(b=>b.disabled=true);try{await action();await refresh();notice(success);}catch(error){notice(error.message||'操作没有完成，填写内容仍会保留。',true);}finally{busy=false;document.querySelectorAll('#manage-workspace button,#manage-workspace input,#manage-workspace select,#manage-workspace textarea').forEach(b=>b.disabled=false);if(!admin)$('message-read-all').disabled=!data.messages.some(m=>!m.read);}}
  if(!api){notice('社区功能没有加载成功，请刷新页面。',true);return;}
  const capability=api.getCapabilities();
  if(capability.mode!=='local'){
    $('manage-workspace').hidden=true;document.querySelectorAll('#manage-workspace button,#manage-workspace input,#manage-workspace select,#manage-workspace textarea').forEach(node=>{node.disabled=true;});
    $('manage-gate').hidden=false;$('manage-gate').innerHTML=`<h2>${admin?'云端审核工作台暂未开放':'消息中心暂未开放'}</h2><p>${escape(capability.message)}</p><a class="space-button" href="courses.html">继续学习课程</a>`;
    document.querySelector('.manage-mode').textContent='尚未开放';document.querySelector('.manage-notice').textContent=capability.message;
    document.querySelector('.manage-heading p').textContent=admin?'正式审核服务与管理员权限配置完成后开放。':'社区通知服务完成后开放。';
    document.querySelector('.manage-footer').hidden=true;return;
  }
  if(admin){
    $('manage-search').addEventListener('input',renderAdmin);$('manage-filter').addEventListener('change',renderAdmin);$('manage-refresh').addEventListener('click',refresh);
    $('manage-list').addEventListener('click',event=>{const b=event.target.closest('[data-select]');if(!b||busy)return;selected=b.dataset.select;renderAdmin();if(matchMedia('(max-width:800px)').matches)$('manage-detail').scrollIntoView({behavior:'instant',block:'start'});});
    $('manage-detail').addEventListener('click',event=>{const button=event.target.closest('[data-review]');if(!button||busy)return;const s=data.submissions.find(s=>s.id===selected),reason=$('review-reason').value.trim();if(!s)return;if(button.dataset.review!=='published'&&!reason){notice('请先写下具体原因，方便作者修改或了解处理结果。',true);$('review-reason').focus();return;}const decision=button.dataset.review;mutate(()=>api.review(s.id,decision,reason,s.revision),decision==='published'?'已通过审核，并在本机教程广场展示。':decision==='rejected'?'已退回修改，原因已放入消息中心。':'已从本机广场下架，作者消息与审核记录已保留。');});
    $('manage-report-list').addEventListener('submit',event=>{const form=event.target.closest('[data-report]');if(!form)return;event.preventDefault();const r=data.reports.find(r=>r.id===form.dataset.report),reply=form.elements.reply.value.trim();if(!r||!reply){notice('请填写处理回复。',true);return;}mutate(()=>api.resolveReport(r.id,reply,r.revision),'回复已保存，读者可以在本机消息中心查看。');});
    addEventListener('hashchange',()=>{if(!busy)renderAdmin();});
  }else{
    $('message-filter').addEventListener('change',renderMessages);$('message-read-all').addEventListener('click',()=>mutate(()=>api.markAllRead(),'全部消息已标为已读。'));
    $('message-list').addEventListener('click',event=>{const b=event.target.closest('[data-read]');if(b)mutate(()=>api.markRead(b.dataset.read),'消息已标为已读。');});
  }
  account?.subscribe(()=>{gate();});addEventListener('egg-community-change',()=>{if(!busy)refresh();});refresh();
})();
