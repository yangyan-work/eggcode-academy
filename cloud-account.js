'use strict';
(() => {
  const api=window.EGG_CLOUD,space=window.EGG_SPACE,$=id=>document.getElementById(id),lessons=[...(window.EGG_LESSONS||[]),...(window.EGG_TUTORIALS||[]),...(window.EGG_EXPANSION_LESSONS||[])];
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let model=null,userId=null,selected=0,busy=false,dirty=false,sequence=0;
  function notice(message,error=false){$('cloud-status').textContent=message;$('cloud-status').setAttribute('role',error?'alert':'status');$('cloud-status').dataset.error=String(error);if(error)$('cloud-status').focus();}
  function clear(){model=null;userId=null;dirty=false;sequence++;$('cloud-note').value='';$('cloud-email').textContent='';$('cloud-submissions').replaceChildren();$('cloud-workspace').hidden=true;}
  function syncShared(){
    const state=space?.getState();if(!state?.ready)return;
    if(userId&&userId!==state.userId){clear();return;}
    const note=$('cloud-note').value,wasDirty=dirty;
    userId=state.userId;model={userId,profile:{nickname:state.nickname,last_lesson_id:state.lastLesson},
      progress:Object.entries(state.revisions).map(([id,revision])=>({lesson_id:Number(id),revision,completed:state.completed.includes(Number(id))})),
      favorites:state.favorites.map(lesson_id=>({lesson_id})),notes:state.notes.map(note=>({lesson_id:note.lessonId,content:note.content,updated_at:note.updatedAt}))};
    renderCourse();if(wasDirty){$('cloud-note').value=note;dirty=true;}
  }
  function renderCourse(){if(!model)return;$('cloud-lesson').value=String(selected);$('cloud-lesson-link').href=`lesson.html?id=${selected}`;const progress=model.progress.find(p=>p.lesson_id===selected),favorite=model.favorites.some(f=>f.lesson_id===selected);$('cloud-complete').textContent=progress?.completed?'取消学完标记':'标记学完';$('cloud-complete').setAttribute('aria-pressed',String(Boolean(progress?.completed)));$('cloud-favorite').textContent=favorite?'取消收藏':'收藏课程';$('cloud-favorite').setAttribute('aria-pressed',String(favorite));$('cloud-progress-status').textContent=progress?.completed?'已在云端标记学完':'尚未标记学完';$('cloud-note').value=model.notes.find(n=>n.lesson_id===selected)?.content||'';dirty=false;$('cloud-summary').textContent=`${model.progress.filter(p=>p.completed).length} 课学完 · ${model.favorites.length} 课收藏 · ${model.notes.length} 份笔记`;}
  async function read(refresh=false){
    if(!api||!space)return notice('云端组件未加载成功，请刷新重试。',true);
    const status=api.status();$('cloud-setup').hidden=status.configured;$('cloud-login').hidden=true;$('cloud-workspace').hidden=true;
    if(!status.configured){clear();$('cloud-badge').textContent=status.mode==='error'?'配置需要检查':'尚未连接';if(status.mode==='error')notice(status.message,true);return;}
    const request=++sequence;
    try{const session=await api.getSession();if(request!==sequence)return;if(!session){clear();$('cloud-login').hidden=false;$('cloud-badge').textContent='尚未登录';return;}const result=await space.loadCloudUser(await api.requireUser(),{refresh});if(request!==sequence)return;if(!result.ok)throw new Error(result.message);syncShared();if(api.status().user?.id!==userId)return;$('cloud-email').textContent=session.user.email||'已登录用户';$('cloud-workspace').hidden=false;$('cloud-badge').textContent='已读取云端记录';
      try{const submissions=await api.listSubmissions();if(request!==sequence||api.status().user?.id!==userId)return;const names={draft:'云端草稿',pending:'等待审核',published:'已发布',rejected:'需修改'};$('cloud-submissions').innerHTML=submissions.length?submissions.map(s=>`<article class="cloud-submission"><span class="manage-badge">${esc(names[s.status]||s.status)}</span><h3>${esc(s.content?.title||'未命名稿件')}</h3>${s.review_note?`<p>${esc(s.review_note)}</p>`:''}</article>`).join(''):'<p class="manage-meta">还没有云端投稿。在投稿页完成并保存教程后，可从云端上传区提交。</p>';}catch(error){if(request===sequence)$('cloud-submissions').textContent='投稿记录暂时无法读取：'+error.message;}
    }catch(error){if(request===sequence){clear();$('cloud-badge').textContent='读取失败';notice(error.message||'云端记录读取失败。',true);$('cloud-login').hidden=false;}}
  }
  async function action(callback,success){if(busy||!model)return;busy=true;const account=userId,request=sequence;const ensureCurrent=()=>{if(!model||request!==sequence||account!==api.status().user?.id)throw new Error('账号状态已经变化，请重新登录后读取记录。');};const buttons=[...document.querySelectorAll('#cloud-workspace button,#cloud-workspace select,#cloud-workspace textarea')];buttons.forEach(b=>b.disabled=true);try{await callback(ensureCurrent);ensureCurrent();notice(success);}catch(error){notice(error.message||'操作未完成，笔记内容仍会保留。',true);}finally{busy=false;buttons.forEach(b=>b.disabled=false);}}
  $('cloud-lesson').innerHTML=Array.from({length:145},(_,i)=>`<option value="${i}">${i+1}. ${esc(lessons[i]?.title||`课程 ${i+1}`)}</option>`).join('');
  $('cloud-lesson').addEventListener('change',event=>{if(dirty&&!confirm('这课笔记还未保存，确定切换课程吗？')){event.target.value=String(selected);return;}selected=Number(event.target.value);renderCourse();});
  $('cloud-note').addEventListener('input',()=>{dirty=true;});
  $('cloud-complete').addEventListener('click',()=>action(async check=>{const result=await space.setCompleted(selected,!space.getState().completed.includes(selected));check();if(!result.ok)throw new Error(result.message);syncShared();},'完成状态已由账号服务确认。'));
  $('cloud-favorite').addEventListener('click',()=>action(async check=>{const result=await space.toggleFavorite(selected);check();if(!result.ok)throw new Error(result.message);syncShared();},'收藏状态已由账号服务确认。'));
  $('cloud-note-save').addEventListener('click',()=>action(async check=>{const text=$('cloud-note').value,result=await space.saveNote(selected,text);check();if(!result.ok)throw new Error(result.message);syncShared();dirty=$('cloud-note').value!==text;},'笔记已由账号服务确认。'));
  $('cloud-note-delete').addEventListener('click',()=>{if(!confirm('确定删除当前课程的云端笔记吗？'))return;action(async check=>{const result=await space.deleteNote(selected);check();if(!result.ok)throw new Error(result.message);$('cloud-note').value='';dirty=false;syncShared();},'这课的云端笔记已删除。');});
  $('cloud-refresh').addEventListener('click',()=>{if(!busy&&(!dirty||confirm('重新读取会替换当前未保存的笔记，确定继续吗？'))){dirty=false;read(true);}});
  $('cloud-signout').addEventListener('click',async()=>{if(busy||dirty&&!confirm('有未保存的云端笔记，确定退出吗？'))return;try{await window.EGG_ACCESS.logout();clear();$('cloud-login').hidden=false;$('cloud-badge').textContent='已退出';notice('已退出当前账号。');}catch(error){notice(error.message,true);}});
  addEventListener('beforeunload',event=>{if(dirty||busy){event.preventDefault();event.returnValue='';}});
  api?.subscribe(event=>{if(userId&&event.user?.id!==userId){clear();$('cloud-login').hidden=false;$('cloud-badge').textContent='账号已变化';notice('账号发生变化，已清除本页上一账号的记录。重新登录后可继续。');}});
  space?.subscribe(state=>{if(userId&&state.userId!==userId){clear();$('cloud-login').hidden=false;return;}if(state.ready)syncShared();});
  read();
})();
