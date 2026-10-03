"use strict";
(() => {
  const api = window.EGG_SPACE;
  if (!api) return;
  const isWorkspace = document.body.dataset.page === 'personal-space';
  const icons = {
    home: '<path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-7h6v7"/>',
    book: '<path d="M12 6C9 4 6 4 3 5v15c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1Z"/><path d="M12 6v15"/>',
    bookmark: '<path d="M6 4h12v17l-6-4-6 4Z"/>',
    note: '<path d="M14 3H5v18h14V8Z"/><path d="M14 3v5h5M8 12h8M8 16h6"/>',
    message: '<path d="M21 4H3v14h5l4 3v-3h9Z"/><path d="M7 8h10M7 12h7"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="m9 3-1 3-3 1-2 3 2 2-1 4 3 2 3-1 2 4 3-1 1-3 4-1 1-4-3-2V7l-3-1-2-3Z"/>',
    database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v7c0 4 16 4 16 0V5M4 12v7c0 4 16 4 16 0v-7"/>',
    logout: '<path d="M9 4H4v16h5M13 7l5 5-5 5M9 12h12"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    trash: '<path d="M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>'
  };
  const icon = name => `<svg class="space-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${icons[name] || icons.book}</svg>`;
  const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const lessons = [...(window.EGG_LESSONS || []), ...(window.EGG_TUTORIALS || []), ...(window.EGG_EXPANSION_LESSONS || [])];
  const title = id => lessons[id]?.title || `课程 ${id + 1}`;
  const courseLink = id => 'lesson.html?id=' + id;
  const date = value => { const d = new Date(value); return Number.isNaN(d.getTime()) ? '演示记录' : new Intl.DateTimeFormat('zh-CN',{month:'long',day:'numeric'}).format(d); };
  const names = {overview:'学习概览',progress:'我的课程',favorites:'我的收藏',notes:'学习笔记',feedback:'问题反馈',settings:'账号与数据'};
  const types = {content:'步骤或参数说明',diagram:'积木图示',other:'其他建议'};
  let toastTimer, progressQuery = '', progressFilter = 'all', lessonMounted = false, renderedUser = null;
  const getSection = () => Object.hasOwn(names, location.hash.slice(1)) ? location.hash.slice(1) : 'overview';
  const currentId = () => { const raw = new URLSearchParams(location.search).get('id') ?? '0'; return /^\d+$/.test(raw) && Number(raw) < 145 ? Number(raw) : null; };
  function notify(message) {
    const target = document.getElementById('space-toast');
    if (!target) return;
    target.textContent = message;
    target.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => target.classList.remove('visible'), 4500);
  }
  function hydrateIcons(root = document) { root.querySelectorAll('[data-space-icon]').forEach(node => { node.innerHTML = icon(node.dataset.spaceIcon); }); }
  function empty(heading,text,action) { return `<div class="space-list-empty">${icon('book')}<h3>${escape(heading)}</h3><p>${escape(text)}</p>${action || '<a class="space-button space-button-primary" href="practice.html">找一堂想学的课</a>'}</div>`; }
  function courseRow(id, state, progress = false) {
    const done = state.completed.includes(id), favorite = state.favorites.includes(id);
    return `<article class="space-course-row" data-course-id="${id}"><span class="space-course-symbol ${id >= 40 ? 'purple' : id >= 6 ? 'blue' : ''}">${icon('book')}</span><div><h3><a href="${courseLink(id)}">${escape(title(id))}</a></h3><p>${escape(lessons[id]?.series || (id < 6 ? '入门课程' : '玩法实战'))} · ${done ? '已标记学完' : '待学习'}</p></div><div class="space-row-actions">${progress ? `<button type="button" class="space-button" data-space-action="complete" data-lesson-id="${id}" aria-pressed="${done}">${icon(done ? 'check' : 'plus')}${done ? '取消学完' : '标记学完'}</button>` : `<a class="space-course-open" href="${courseLink(id)}" aria-label="${done ? '回顾' : '学习'}：${escape(title(id))}">${icon('arrow')}</a>`}<button type="button" class="space-icon-button" data-space-action="favorite" data-lesson-id="${id}" aria-pressed="${favorite}" aria-label="${favorite ? '取消收藏' : '收藏'}：${escape(title(id))}">${icon('bookmark')}</button></div></article>`;
  }
  function overview(state) {
    const id = state.lastLesson ?? (state.mode==='cloud'?0:12);
    const latestNote = [...state.notes].sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt))[0];
    const percent = Math.round(state.completed.length / 145 * 100);
    const routes = [
      {name:'从第一块积木开始',ids:[0,1,2,3,4,5],href:'learning-path.html#learning-foundation'},
      {name:'做出第一个消消乐',ids:[12,13,14,15,16,17],href:'practice.html#match3'},
      {name:'做一张数值成长地图',ids:Array.from({length:18},(_,i)=>i+22),href:'practice.html#progression'}
    ];
    return `<div class="space-overview-grid">
      <section class="space-resume" aria-labelledby="space-resume-title">
        <div class="space-resume-copy"><span class="space-course-kicker">${icon('book')}${state.lastLesson === null ? '从第一步开始' : '继续上次的课程'}</span><h2 id="space-resume-title">${escape(title(id))}</h2><p>把一个小效果搭出来，<br>再让自己的地图多一点新意。</p><a class="space-button space-button-primary" href="${courseLink(id)}">继续学习 ${icon('arrow')}</a><span class="space-resume-caption">${escape(lessons[id]?.series || (id < 6 ? '入门课程' : '玩法实战'))} · 含搭建步骤与检查清单</span></div>
        <div class="space-resume-art"><img src="assets/eggy-character.png" alt="背着创作工具飞行的粉色蛋仔" width="427" height="242"><span class="space-art-caption">想法，正在起飞。</span></div>
      </section>
      <section class="space-growth" aria-labelledby="space-growth-title"><div class="space-panel-heading"><h2 id="space-growth-title">一点点，学会更多</h2><span>${icon('check')}</span></div><a class="space-growth-total" href="#progress"><strong>${state.completed.length}</strong><span>/ 145 课<br>已标记学完</span></a><div class="space-growth-meter"><progress max="145" value="${state.completed.length}" aria-label="已标记学完 ${state.completed.length} / 145 课"></progress><span>${percent}%</span></div><p>每次完成一课，都给自己留个标记。</p><nav class="space-growth-links" aria-label="个人记录统计"><a href="#favorites">${icon('bookmark')}<span><strong>${state.favorites.length}</strong> 课收藏</span>${icon('arrow')}</a><a href="#notes">${icon('note')}<span><strong>${state.notes.length}</strong> 份笔记</span>${icon('arrow')}</a></nav></section>
    </div>
      <section class="space-contribute-banner" aria-labelledby="space-contribute-title"><span class="space-contribute-mark">${icon('note')}</span><div><h2 id="space-contribute-title">${state.mode==='cloud'?'投稿与社区正在接入中。':'也把你的经验，写成一篇教程。'}</h2><p>${state.mode==='cloud'?'先整理搭建步骤和试玩结果，功能开放后再分享。':'整理搭建步骤，添加配图，和其他创作者交流。'}</p><nav class="space-community-links" aria-label="社区与创作"><a href="community.html">教程广场</a><a href="works.html">作品展示</a><a href="messages.html">消息中心</a></nav></div><a class="space-button" href="contribute.html">${state.mode==='cloud'?'查看投稿状态':'投稿教程'} ${icon('arrow')}</a></section>
    <div class="space-workspace-grid">
      <section class="space-home-collection"><div class="space-panel-heading"><div><h2>想做的玩法，留在这里</h2><p>从收藏的一课，开始下一次创作。</p></div><a href="#favorites">全部收藏 ${icon('arrow')}</a></div><div class="space-course-list">${state.favorites.length ? state.favorites.slice(0,3).map(value=>courseRow(value,state)).join('') : empty('还没有收藏','在课程页收藏一课，下次就能直接找到。')}</div></section>
      <section class="space-latest-note" aria-labelledby="space-latest-note-title"><div class="space-panel-heading"><h2 id="space-latest-note-title">留给自己的小提示</h2>${icon('note')}</div>${latestNote ? `<p class="space-latest-note-course">${escape(title(latestNote.lessonId))}</p><p class="space-latest-note-content">${escape(latestNote.content || '这份笔记还没有内容。')}</p><div class="space-latest-note-footer"><small>${date(latestNote.updatedAt)} 更新</small><button type="button" class="space-plain" data-space-action="note" data-lesson-id="${latestNote.lessonId}">继续编辑 ${icon('arrow')}</button></div>` : '<p class="space-latest-note-content">记下关键参数、容易漏掉的连接，或试玩时发现的小问题。</p><button type="button" class="space-plain" data-space-action="note">写第一份笔记</button>'}</section>
    </div>
    <section class="space-home-routes"><div class="space-panel-heading"><h2>选一条路线，慢慢搭</h2><a href="learning-path.html">全部路线 ${icon('arrow')}</a></div><div class="space-route-list">${routes.map(route=>{const done=route.ids.filter(value=>state.completed.includes(value)).length;return `<a href="${route.href}"><div><span>${route.name}</span><small>${done} / ${route.ids.length}</small></div><progress value="${done}" max="${route.ids.length}" aria-label="${route.name}：${done} / ${route.ids.length} 课"></progress></a>`;}).join('')}</div></section>`;
  }
  function progress(state) {
    return `<div class="space-section-toolbar"><p>已标记学完 ${state.completed.length} / 145 课。完成标记由你记录，不代表编辑器验证。</p></div><div class="space-progress-controls"><div class="space-search"><label class="space-search-label" for="space-course-query">查找课程</label><input type="search" id="space-course-query" value="${escape(progressQuery)}" placeholder="例如：消消乐、背包、大数"></div><div class="space-search"><label class="space-search-label" for="space-progress-filter">学习状态</label><select id="space-progress-filter"><option value="all">全部课程</option><option value="pending">尚未学完</option><option value="completed">已标记学完</option></select></div></div><section class="space-panel"><div class="space-panel-heading"><h2 id="space-results-count">课程列表</h2><a href="learning-path.html">按路线学习</a></div><div id="space-progress-list" class="space-course-list"></div></section>`;
  }
  function updateProgressList(state) {
    const ids = lessons.map((_,i)=>i).filter(id => title(id).toLocaleLowerCase().includes(progressQuery.toLocaleLowerCase()) && (progressFilter === 'all' || (progressFilter === 'completed') === state.completed.includes(id)));
    document.getElementById('space-results-count').textContent = `找到 ${ids.length} 课`;
    document.getElementById('space-progress-list').innerHTML = ids.length ? ids.map(id=>courseRow(id,state,true)).join('') : empty('没有找到符合条件的课程','试试其他关键词，或切换学习状态。','<button type="button" class="space-button" data-space-action="reset-search">清除筛选</button>');
    const filter = document.getElementById('space-progress-filter'); if (filter) filter.value = progressFilter;
  }
  function favorites(state) { return `<div class="space-section-toolbar"><p>把感兴趣的玩法留下来，下次直接从这里开始。</p><a class="space-button" href="practice.html">浏览更多教程</a></div><section class="space-panel"><div class="space-course-list">${state.favorites.length ? state.favorites.map(id=>courseRow(id,state)).join('') : empty('收藏夹还是空的','在任意课程页收藏一课，就会出现在这里。')}</div></section>`; }
  function notes(state) {
    return `<div class="space-section-toolbar"><p>每课一份笔记，记下你真正用得上的经验。</p><button class="space-button space-button-primary" data-space-action="note" type="button">${icon('plus')}写笔记</button></div>${state.notes.length ? `<div class="space-note-grid">${state.notes.map(note=>`<article class="space-note" data-note-id="${note.lessonId}"><small>${date(note.updatedAt)} · 课程笔记</small><h3><a href="${courseLink(note.lessonId)}">${escape(title(note.lessonId))}</a></h3><p>${escape(note.content || '这份笔记还没有内容。')}</p><footer><button class="space-plain" type="button" data-space-action="note" data-lesson-id="${note.lessonId}">编辑笔记</button><button class="space-icon-button" type="button" data-space-action="delete-note" data-lesson-id="${note.lessonId}" aria-label="删除笔记：${escape(title(note.lessonId))}">${icon('trash')}</button></footer></article>`).join('')}</div>` : empty('给下次的自己留一条提示','比如记录一个关键参数、容易漏掉的作用域，或试玩发现的问题。','<button class="space-button space-button-primary" data-space-action="note" type="button">写第一份笔记</button>')}`;
  }
  function feedback(state) {
    if(state.mode==='cloud')return `<section class="space-panel"><h2>问题反馈</h2><p>问题反馈暂未接入账号服务。学习记录的保存不会自动提交反馈。</p><a class="space-button" href="service-info.html">查看服务说明与反馈方式</a></section>`;
    return `<div class="space-section-toolbar"><p>把遇到的问题说具体，后续更容易一起修好。</p><button class="space-button space-button-primary" type="button" data-space-action="feedback">${icon('plus')}记录问题</button></div><p class="space-warning">这里是反馈流程预览。记录尚未发送给管理员，接入数据库后才能真实提交和查询处理进度。</p>${state.feedback.length ? state.feedback.map(item=>`<article class="space-feedback"><header><h3>${escape(types[item.type] || '其他建议')}</h3><span class="space-status-pill">本机演示 · 未发送</span></header><small>${escape(title(item.lessonId))} · ${date(item.createdAt)}</small><p>${escape(item.content)}</p></article>`).join('') : empty('还没有反馈记录','发现教程步骤不清楚、图示有疑问，或有新玩法建议，都可以先记录下来。','<button type="button" class="space-button" data-space-action="feedback">记录第一个问题</button>')}`;
  }
  function settings(state) {
    if(state.mode==='cloud')return `<div class="space-settings-grid"><section class="space-panel"><h2>账号与资料</h2><p>${escape(state.email || '真实账号')} · ${state.ready?'学习记录已读取':'学习记录尚未就绪'}</p><button class="space-button" type="button" data-space-action="account">修改昵称</button><button class="space-button" type="button" data-space-action="logout">退出账号</button><a class="space-plain" href="login.html">管理登录与密码</a></section><section class="space-panel"><h2>学习记录</h2><p>${escape(state.storageMessage)} 本机演示数据不会自动导入这个账号。</p><button class="space-button" type="button" data-space-action="refresh">重新读取学习记录</button><button class="space-button" type="button" data-space-action="export">${icon('download')}导出当前学习记录</button><a class="space-plain" href="cloud-account.html">账号与云端投稿</a></section><section class="space-panel"><h2>投稿与社区</h2><p>投稿、社区与消息功能仍在接入中，当前未开放。学习记录的保存不会自动提交投稿或反馈。</p><a class="space-button" href="contribute.html">查看投稿状态</a><a class="space-plain" href="service-info.html">服务说明与反馈</a></section></div>`;
    return `<div class="space-settings-grid"><section class="space-panel"><h2>账号体验</h2><a class="space-plain" href="login.html">打开登录页</a><a class="space-plain" href="contribute.html">投稿教程</a><p>当前${state.active ? `体验昵称是“${escape(state.nickname)}”` : '尚未进入体验账号'}。这不是正式登录，不收集密码。真实账号和跨设备同步会在接入数据库后开放。</p><button class="space-button" type="button" data-space-action="account">${state.active ? '修改体验昵称' : '进入体验账号'}</button>${state.active ? '<button class="space-button" type="button" data-space-action="logout">退出体验账号</button>' : ''}</section><section class="space-panel"><h2>保留已有学习记录</h2><p>可以主动把当前浏览器中原版网站的完成标记合并到这份演示记录。只读取有效课程，不清空原版记录。线上站点与本地预览是不同地址，无法直接互读。</p><button class="space-button" type="button" data-space-action="import">导入同地址本机进度</button></section><section class="space-panel"><h2>数据与备份</h2><p>预览记录${state.storageMode === 'persistent' ? '只保存在这个浏览器和当前地址下' : '当前仅在本页临时保留'}。清理浏览器或更换设备后，演示数据不会自动同步。</p><button class="space-button" type="button" data-space-action="export">${icon('download')}导出演示记录</button><button class="space-button space-button-danger" type="button" data-space-action="reset">恢复初始演示数据</button></section><section class="space-panel"><h2>真实账号与云端记录</h2><p>邮箱登录、云端学习记录与图文上传的接入入口已准备好。填写真实项目配置并完成连接检查后，才能跨设备保存。</p><a class="space-button space-button-primary" href="cloud-account.html">打开云端账号页</a><a class="space-plain" href="admin.html">体验投稿审核</a><div class="space-file-links"><a href="../database/README.md">${icon('note')}查看搭建说明</a><a href="../database/schema.sql" download>${icon('database')}下载数据库配置 SQL</a><a href="../database/config.example.js" download>${icon('settings')}下载公开配置模板</a></div></section></div>`;
  }
  function render() {
    const state = api.getState();
    const accountTitle=document.getElementById('space-account-title'),accountDescription=document.querySelector('#space-account-dialog > p'),nicknameLabel=document.querySelector('label[for="space-account-name"]'),noteHelp=document.querySelector('#space-note-form .space-field-help'),feedbackDescription=document.querySelector('#space-feedback-dialog > p'),feedbackSubmit=document.querySelector('#space-feedback-form button[type="submit"]');
    if(accountTitle)accountTitle.textContent=state.mode==='cloud'?'修改昵称':'修改体验昵称';
    if(accountDescription)accountDescription.textContent=state.mode==='cloud'?'昵称保存在当前邮箱账号中，修改后需由账号服务确认。学习记录会保留。':'仅修改当前浏览器的体验昵称，已有学习记录会保留，不会创建新的账号。';
    if(nicknameLabel)nicknameLabel.textContent=state.mode==='cloud'?'昵称':'体验昵称';
    if(noteHelp)noteHelp.textContent='每课保存一份笔记，最多 2000 字。'+(state.mode==='cloud'?state.storageMessage:'预览仅保存在本机。');
    if(feedbackDescription)feedbackDescription.textContent=state.mode==='cloud'?'问题反馈暂未接入账号服务，请使用服务说明页的反馈方式。':'预览会保存一条本机反馈记录，尚不会发送给站点管理员。';
    if(feedbackSubmit){feedbackSubmit.textContent=state.mode==='cloud'?'反馈暂未开放':'保存反馈演示';feedbackSubmit.disabled=state.mode==='cloud';}
    if(state.mode==='cloud'&&renderedUser!==state.userId){
      document.querySelectorAll('#space-note-dialog,#space-account-dialog,#space-feedback-dialog').forEach(dialog=>{if(dialog.open)dialog.close();dialog.querySelector('form')?.reset();});
      renderedUser=state.userId;
    }
    if (!isWorkspace) { updateLessonTools(state); return; }
    const focused = document.activeElement;
    const focusAction = focused?.closest('#space-view') ? focused.dataset.spaceAction : null;
    const focusId = focused?.dataset.lessonId;
    const section = getSection();
    document.getElementById('space-nickname').textContent = state.active ? state.nickname : '游客';
    document.getElementById('space-account-label').textContent = state.active ? (state.mode==='cloud'?'邮箱账号':'体验账号') : '请先登录';
    document.getElementById('space-account-button-label').textContent = state.active ? (state.mode==='cloud'?'修改昵称':'修改体验昵称') : '登录 / 体验';
    const logoutButton=document.querySelector('.space-sidebar-bottom [data-space-action="logout"]');
    logoutButton.hidden=!state.active;
    logoutButton.setAttribute('aria-label',state.mode==='cloud'?'退出邮箱账号':'退出体验账号');
    document.querySelector('.space-preview-note p').textContent=state.mode==='cloud'?'邮箱账号模式：'+state.storageMessage+' 社区与投稿功能仍在接入中。':'浏览器体验模式，数据保存在当前浏览器，尚未连接云端。';
    document.querySelector('.space-footer-note').textContent=state.mode==='cloud'?'当前账号的学习记录由账号服务保存，保存结果以服务端确认为准。社区与投稿功能尚未开放。':'登录后使用本站功能。当前体验记录保存在本浏览器；云端账号记录需接入数据库。';
    document.getElementById('space-page-title').textContent = section === 'overview' && state.active ? `${state.nickname}，欢迎回来。` : names[section];
    document.getElementById('space-page-description').textContent = ({overview:'从上次的课程继续，把想法搭出来。',progress:'找到下一课，再让自己的地图多一点新意。',favorites:'喜欢的玩法，随时回来接着学。',notes:'把搭建中的小发现，留给下一次的自己。',feedback:'记下具体的问题，让教程更容易跟着做。',settings:state.mode==='cloud'?'管理邮箱账号和学习记录。':'管理体验账号，保留自己的学习记录。'})[section];
    document.title = names[section] + ' · 自由树梦想空间';
    document.querySelectorAll('[data-space-section]').forEach(node=>{ if(node.dataset.spaceSection === section) node.setAttribute('aria-current','page'); else node.removeAttribute('aria-current'); });
    document.querySelectorAll('[data-space-count]').forEach(node=>{node.textContent = state.active ? state[node.dataset.spaceCount].length : 0;});
    const warning = document.getElementById('space-storage-warning');
    warning.hidden = state.mode==='cloud'?state.ready:state.storageMode === 'persistent';
    warning.textContent = state.storageMessage || '浏览器未能保存，当前操作仅在本页临时保留。';
    const view = document.getElementById('space-view');
    view.innerHTML = state.mode==='cloud'&&!state.ready&&section!=='settings' ? empty(state.loading?'正在读取学习记录':'学习记录暂时无法读取',state.storageMessage,'<button class="space-button space-button-primary" type="button" data-space-action="refresh">重新读取</button>') : !state.active && section !== 'settings' ? empty('先进入体验账号','登录后才能浏览教程、记录进度、收藏和笔记。','<a class="space-button space-button-primary" href="' + loginLink() + '">登录 / 体验</a>') : ({overview,progress,favorites,notes,feedback,settings}[section])(state);
    if (state.active && (state.mode!=='cloud'||state.ready) && section === 'progress') updateProgressList(state);
    if(state.mode==='cloud')view.querySelectorAll('[data-space-action]').forEach(button=>{if(['complete','favorite','note','delete-note','account','export'].includes(button.dataset.spaceAction))button.disabled=!state.ready||state.saving;});
    if (focusAction) [...view.querySelectorAll('[data-space-action]')].find(node=>node.dataset.spaceAction === focusAction && node.dataset.lessonId === focusId)?.focus({preventScroll:true});
  }
  function ensureAccount() { const state=api.getState();if(state.mode==='cloud'&&!state.ready){notify(state.storageMessage);return false;}if(state.active)return true;openAccount();return false; }
  function fillCourses(select, selected) {
    select.innerHTML = lessons.map((_,id)=>`<option value="${id}">${id < 6 ? '入门' : '实战'} · ${escape(title(id))}</option>`).join('');
    select.value = String(selected ?? 12);
  }
  function openDialog(id) {
    const dialog = document.getElementById(id);
    dialog.querySelectorAll('.space-form-error').forEach(node=>{ node.textContent = ''; });
    if (!dialog.open) dialog.showModal();
  }
  function loginLink() { return 'login.html?next=' + encodeURIComponent(isWorkspace ? 'personal-space.html' + location.hash : courseLink(currentId() ?? 0) + location.hash); }
  function openAccount() { const state=api.getState();if(!state.active){location.assign(loginLink());return;}if(state.mode==='cloud'&&!state.ready){notify(state.storageMessage);return;}document.getElementById('space-account-name').value=state.nickname;openDialog('space-account-dialog'); }
  function openNote(id) {
    if (!ensureAccount()) return;
    const selected = id ?? api.getState().lastLesson ?? (api.getState().mode==='cloud'?0:12);
    const form = document.getElementById('space-note-form');
    fillCourses(form.elements.lessonId, selected);
    form.elements.content.value = api.getState().notes.find(item=>item.lessonId === selected)?.content || '';
    form.dataset.lessonId=String(selected);form.dataset.initialContent=form.elements.content.value;
    openDialog('space-note-dialog');
  }
  function openFeedback(id) {
    if (!ensureAccount()) return;
    const form = document.getElementById('space-feedback-form'); form.reset();
    fillCourses(form.elements.lessonId, id ?? api.getState().lastLesson ?? 12);
    openDialog('space-feedback-dialog');
  }
  function handleResult(result) { notify(result.message); return result.ok; }
  document.addEventListener('click', async event=>{
    const close = event.target.closest('[data-space-close]'); if(close) { close.closest('dialog').close(); return; }
    const target = event.target.closest('[data-space-action]'); if(!target) return;
    const action = target.dataset.spaceAction, id = target.dataset.lessonId === undefined ? undefined : Number(target.dataset.lessonId);
    if(target.disabled)return;
    target.disabled=true;
    try{
    if(action === 'account') openAccount();
    else if(action === 'logout') handleResult(await (window.EGG_ACCESS?window.EGG_ACCESS.logout():api.logout()));
    else if(action === 'note') openNote(id);
    else if(action === 'feedback') openFeedback(id);
    else if(action === 'favorite' && ensureAccount()) handleResult(await api.toggleFavorite(id));
    else if(action === 'complete' && ensureAccount()) handleResult(await api.setCompleted(id,!api.getState().completed.includes(id)));
    else if(action === 'delete-note' && ensureAccount()) handleResult(await api.deleteNote(id));
    else if(action === 'import' && ensureAccount()) handleResult(await api.importLocalProgress());
    else if(action === 'refresh'){const user=await window.EGG_CLOUD.requireUser();handleResult(await api.loadCloudUser(user,{refresh:true}));}
    else if(action === 'reset') openDialog('space-reset-dialog');
    else if(action === 'confirm-reset') { document.getElementById('space-reset-dialog').close(); handleResult(await api.resetDemo()); }
    else if(action === 'reset-search') { progressQuery='';progressFilter='all';render(); document.getElementById('space-course-query')?.focus(); }
    else if(action === 'export' && ensureAccount()) {
      const state=api.getState(),cloud=state.mode==='cloud';
      const blob = new Blob([JSON.stringify({...state,description:cloud?'自由树梦想空间当前账号学习记录快照':'自由树梦想空间本机演示记录，不是云端备份'},null,2)],{type:'application/json;charset=utf-8'});
      const url = URL.createObjectURL(blob), link = document.createElement('a'); link.href=url;link.download=cloud?'自由树梦想空间-学习记录.json':'自由树梦想空间-演示记录.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('已导出当前学习记录。');
    }
    }catch(error){notify(error.message || '操作未完成，请重试。');}finally{target.disabled=false;}
  });
  document.addEventListener('input',event=>{if(event.target.id === 'space-course-query'){progressQuery=event.target.value;updateProgressList(api.getState());}});
  document.addEventListener('change',event=>{
    if(event.target.id === 'space-progress-filter'){progressFilter=event.target.value;updateProgressList(api.getState());}
    if(event.target.id === 'space-note-lesson'){
      const form=document.getElementById('space-note-form');
      if(form.elements.content.value !== form.dataset.initialContent && !window.confirm('切换课程会丢弃这份尚未保存的笔记，确定切换吗？')) {event.target.value=form.dataset.lessonId;return;}
      form.elements.content.value=api.getState().notes.find(item=>item.lessonId === Number(event.target.value))?.content || '';
      form.dataset.lessonId=event.target.value;form.dataset.initialContent=form.elements.content.value;
    }
  });
  function bindForms() {
    ['account','note','feedback'].forEach(kind=>{
      const form=document.getElementById(`space-${kind}-form`);
      if(form) form.addEventListener('submit',event=>submitForm(event,kind));
    });
  }
  function updateLessonTools(state) {
    if(!lessonMounted) return;
    const id = currentId(), root = document.getElementById('space-lesson-tools');
    if(!root || id === null) return;
    root.setAttribute('aria-label',state.mode==='cloud'?'个人学习空间':'个人学习空间预览');
    const done=state.active && state.completed.includes(id), favorite=state.active && state.favorites.includes(id);
    root.innerHTML=`<div><strong>我的学习空间${state.mode==='cloud'?'':' · 预览'}</strong>${state.active ? `<button type="button" class="space-button space-button-primary" data-space-action="complete" data-lesson-id="${id}" aria-pressed="${done}">${icon(done ? 'check' : 'plus')}${done ? '已学完 · 点击取消' : '标记本课已学完'}</button>` : '<a href="' + loginLink() + '" class="space-button">登录 / 体验</a>'}</div><div class="space-lesson-actions"><button type="button" class="space-button" data-space-action="favorite" data-lesson-id="${id}" aria-pressed="${favorite}">${icon('bookmark')}${favorite ? '已收藏 · 点击取消' : '收藏本课'}</button><button type="button" class="space-button" data-space-action="note" data-lesson-id="${id}">${icon('note')}学习笔记</button><button type="button" class="space-button" data-space-action="feedback" data-lesson-id="${id}">${icon('message')}记录问题</button><a class="space-button" href="personal-space.html">查看我的空间</a></div><p>${state.mode==='cloud'?escape(state.storageMessage):state.storageMode === 'persistent' ? '仅保存到本浏览器演示记录，尚未连接云端。' : '浏览器无法持久保存，目前只在本页临时保留。'} 完成标记不代表蛋仔编辑器验证通过。</p>`;
    if(state.mode==='cloud')root.querySelectorAll('[data-space-action]').forEach(button=>{button.disabled=!state.ready||state.saving||button.dataset.spaceAction==='feedback';});
  }
  async function mountLesson() {
    if(document.body.dataset.page !== 'lesson' || currentId() === null) return;
    const dialogSource = await fetch('personal-space.html').then(response=>{if(!response.ok)throw new Error('dialog load');return response.text();}).catch(()=>null);
    if(!dialogSource) return;
    const parsed = new DOMParser().parseFromString(dialogSource,'text/html');
    ['space-account-dialog','space-note-dialog','space-feedback-dialog','space-reset-dialog','space-toast'].forEach(id=>document.body.append(document.importNode(parsed.getElementById(id),true)));
    // 复用同一套弹窗。表单在异步挂载后绑定，避免为课程另写一份业务流程。
    bindForms();
    function attach() {
      const header=document.querySelector('.lesson-article .article-header'); if(!header) return false;
      const root=document.createElement('section');root.id='space-lesson-tools';root.className='space-lesson-tools';root.setAttribute('aria-label','个人学习空间预览');header.after(root);lessonMounted=true;render();
      if(api.getState().active&&api.getState().mode!=='cloud') api.rememberLesson(currentId());
      return true;
    }
    if(!attach()) { const observer=new MutationObserver(()=>{if(attach())observer.disconnect();});observer.observe(document.querySelector('.lesson-article'),{childList:true,subtree:true}); }
  }
  async function submitForm(event,kind) {
    event.preventDefault();const form=event.currentTarget;
    if(form.dataset.saving==='true')return;
    const owner=api.getState().userId,content=kind==='note'?form.elements.content.value:null,controls=[...form.querySelectorAll('input,textarea,select,button')];
    form.dataset.saving='true';controls.forEach(node=>node.disabled=true);
    try{
      const result=await (kind==='account' ? api.setNickname(form.elements.nickname.value) : kind==='note' ? (content.trim() ? api.saveNote(Number(form.elements.lessonId.value),content) : {ok:false,message:'请先写下笔记内容。'}) : api.saveFeedback({lessonId:Number(form.elements.lessonId.value),type:form.elements.type.value,content:form.elements.content.value}));
      if(api.getState().userId!==owner)return;
      if(result.ok){if(kind!=='note'||form.elements.content.value===content)form.closest('dialog').close();handleResult(result);}else form.querySelector('.space-form-error').textContent=result.message;
    }catch(error){if(api.getState().userId===owner)form.querySelector('.space-form-error').textContent=error.message || '保存未完成，内容仍会保留。';}
    finally{form.dataset.saving='false';controls.forEach(node=>node.disabled=false);}
  }
  hydrateIcons();bindForms();api.subscribe(render);render();
  window.addEventListener('hashchange',()=>{render();document.getElementById('space-page-title')?.scrollIntoView({block:'start'});});
  mountLesson();
})();
