(() => {
  'use strict';
  const categories = {match3:'消消乐',progression:'数值成长',inventory:'背包与物品',parkour:'跑酷闯关',racing:'竞速玩法',survival:'生存战斗',puzzle:'解谜机关',simulation:'模拟经营',other:'其他玩法'};
  const difficulties = {beginner:'入门',intermediate:'进阶',advanced:'高阶'};
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const date = value => {const parsed=new Date(value);return Number.isNaN(parsed.getTime())?'日期未知':parsed.toLocaleDateString('zh-CN');};
  const active = () => window.EGG_COMMUNITY.getCapabilities().mode==='local' && Boolean(window.EGG_SPACE?.getState().active);
  const loginLink = () => 'login.html?next='+encodeURIComponent(location.pathname.split('/').pop()+location.search+location.hash);
  const tutorialLink = id => 'community-tutorial.html?id='+encodeURIComponent(id);
  const sample = item => item?.sample?'<span class="common-tag common-tag-sample">演示示例</span>':'';
  function imageSource(image) {
    if(!image || !['image/png','image/jpeg','image/webp'].includes(image.mime) || typeof image.dataUrl!=='string' || image.dataUrl.length>2800000)return '';
    const prefix='data:'+image.mime+';base64,';
    if(!image.dataUrl.startsWith(prefix) || !/^[A-Za-z0-9+/]+={0,2}$/.test(image.dataUrl.slice(prefix.length)))return '';
    return image.dataUrl;
  }
  function videoLink(value) {
    try {const url=new URL(value);return url.protocol==='https:' && !url.username && !url.password ? url.href : '';} catch {return '';}
  }
  function message(text,kind='success') {
    const box=document.querySelector('#community-message');if(!box)return;
    box.hidden=false;box.dataset.kind=kind;box.setAttribute('role',kind==='error'?'alert':'status');box.textContent=text;
    if(kind==='error')box.focus();
  }
  function requireLogin() {
    const capability=window.EGG_COMMUNITY.getCapabilities();if(capability.mode!=='local'){message(capability.message);return false;}
    if(active())return true;
    message('请先进入体验账号，页面中填写的内容会暂时保留。','error');
    const box=document.querySelector('#community-message'),link=document.createElement('a');link.href=loginLink();link.textContent=' 登录 / 体验';box.append(link);return false;
  }
  function loginGate() {return `<p class="common-muted">进入体验账号后可以参与互动。<a class="space-button" href="${esc(loginLink())}">登录 / 体验</a></p>`;}
  function unavailable(content,title) {
    const capability=window.EGG_COMMUNITY.getCapabilities();if(capability.mode==='local')return false;
    document.querySelectorAll('.common-tools,#community-filter,#work-editor,#works-create,.common-hero > a[href="contribute.html"]').forEach(node=>{node.hidden=true;});
    document.querySelectorAll('#community-main button,#community-main input,#community-main select,#community-main textarea').forEach(node=>{node.disabled=true;});
    const note=document.querySelector('.common-preview-note');if(note)note.textContent=capability.message;
    const intro=document.querySelector('.common-hero p');if(intro)intro.textContent=title+'将在云端发布与权限服务完成后开放。';
    const count=document.querySelector('#community-count,#works-count');if(count)count.textContent='尚未开放';
    content.innerHTML=`<section class="common-empty"><h2>${esc(title)}暂未开放</h2><p>${esc(capability.message)}</p><div class="common-tool-actions"><a class="space-button space-button-primary" href="courses.html">继续学习课程</a><a class="space-button" href="personal-space.html">查看我的学习记录</a></div></section>`;
    content.setAttribute('aria-busy','false');return true;
  }
  async function seed(button) {
    if(!requireLogin())return;
    button.disabled=true;
    try {const result=await window.EGG_COMMUNITY.seedExamples();message(result.added?'已载入演示示例。所有示例都标有“演示示例”。':'示例已经载入，没有重复添加。');}
    catch(error){message(error.message || '示例无法保存，请稍后重试。','error');}
    finally{button.disabled=false;}
  }
  document.querySelector('#community-seed')?.addEventListener('click',event=>seed(event.currentTarget));
  window.EGG_COMMUNITY_UI=Object.freeze({categories,difficulties,esc,date,active,loginLink,tutorialLink,sample,imageSource,videoLink,message,requireLogin,loginGate,seed,unavailable});
  if(document.body.dataset.community!=='browse')return;
  const form=document.querySelector('#community-filter'),list=document.querySelector('#community-list'),count=document.querySelector('#community-count');
  if(unavailable(list,'教程广场'))return;
  let publications=[],request=0;
  function render() {
    const query=document.querySelector('#community-search').value.trim().toLocaleLowerCase(),category=document.querySelector('#community-category').value,difficulty=document.querySelector('#community-difficulty').value,sort=document.querySelector('#community-sort').value;
    const results=publications.filter(item=>{const record=item.record;return (!category || record.category===category) && (!difficulty || record.difficulty===difficulty) && (!query || [item.title,item.author,record.summary,...record.steps.map(step=>step.title+' '+step.body)].join(' ').toLocaleLowerCase().includes(query));}).sort((a,b)=>sort==='title'?a.title.localeCompare(b.title,'zh-CN'):new Date(sort==='created'?b.createdAt:b.updatedAt)-new Date(sort==='created'?a.createdAt:a.updatedAt));
    count.textContent=`${results.length} 篇教程${results.length!==publications.length?' / 共 '+publications.length+' 篇':''}`;
    if(!results.length){list.innerHTML=publications.length?'<section class="common-empty"><h2>这次没有找到匹配的教程</h2><p>试试更短的关键词，或放宽玩法与难度筛选。</p><button class="space-button" type="button" data-reset-filter>清除筛选</button></section>':'<section class="common-empty"><h2>这里正在等第一篇教程</h2><p>自己投稿后到审核页体验发布，或者先载入示例，看看完整的阅读与问答效果。</p><div class="common-tool-actions"><a class="space-button space-button-primary" href="contribute.html">开始写教程</a><button class="space-button" type="button" data-seed-examples>载入演示示例</button></div></section>';return;}
    list.innerHTML=results.map(item=>{const record=item.record,image=record.steps.map(step=>step.image).find(image=>imageSource(image)),src=imageSource(image),url=tutorialLink(item.id);return `<article class="common-tutorial-row"><a class="common-thumbnail" href="${esc(url)}" tabindex="-1" aria-hidden="true">${src?`<img src="${esc(src)}" alt="" loading="lazy">`:`<span class="common-category-art">${esc(categories[record.category] || '其他玩法')}<br>${record.steps.length} 个搭建步骤</span>`}</a><div><div class="common-meta"><span class="common-tag">${esc(categories[record.category] || '其他玩法')}</span><span>${esc(difficulties[record.difficulty] || '入门')}</span>${sample(item)}</div><h2><a href="${esc(url)}">${esc(item.title)}</a></h2><p>${esc(record.summary)}</p><div class="common-meta" style="margin-top:13px"><span>${esc(item.author)}</span><span>${record.steps.length} 个步骤</span><span>更新于 ${esc(date(item.updatedAt))}</span></div></div><a class="common-row-action" href="${esc(url)}">开始阅读 <span aria-hidden="true"> ↗</span></a></article>`;}).join('');
  }
  function reset(){form.reset();render();document.querySelector('#community-search').focus();}
  async function load(){const ticket=++request;list.setAttribute('aria-busy','true');try {const state=await window.EGG_COMMUNITY.getState();if(ticket!==request)return;publications=state.publications.filter(item=>item.status==='published');render();}catch(error){message(error.message || '无法读取教程，请刷新后重试。','error');count.textContent='读取失败';}finally{if(ticket===request)list.setAttribute('aria-busy','false');}}
  form.addEventListener('submit',event=>event.preventDefault());form.addEventListener('input',render);
  document.querySelector('#community-reset').addEventListener('click',reset);
  list.addEventListener('click',event=>{const button=event.target.closest('button');if(button?.hasAttribute('data-reset-filter'))reset();if(button?.hasAttribute('data-seed-examples'))seed(button);});
  window.addEventListener('egg-community-change',load);load();
})();
