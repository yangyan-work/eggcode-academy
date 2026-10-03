'use strict';
// 本地契约检查：运行真实状态/页面脚本，账号服务用明确替身；不发起云端请求。
// NODE_PATH 指向已有 jsdom QA node_modules 后运行 node scripts/check-shared-account.cjs。
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('jsdom'),root=path.resolve(__dirname,'..');
const plain=value=>JSON.parse(JSON.stringify(value)),tick=()=>new Promise(resolve=>setImmediate(resolve));
let checks=0;const eq=(actual,expected,message)=>{assert.deepEqual(plain(actual),plain(expected),message);checks++;};
const deferred=()=>{let resolve;return{promise:new Promise(done=>resolve=done),resolve:value=>resolve(value)};};
function service(){
  const A={id:'account-a',email:'a@example.test'},B={id:'account-b',email:'b@example.test'},subscribers=new Set(),calls=[];
  let user=A;const records=new Map([A,B].map(u=>[u.id,{userId:u.id,profile:null,progress:[],favorites:[],notes:[]} ]));
  const model=()=>records.get(user.id),next={},errors={};
  async function call(name,args,run){calls.push({name,args:plain(args)});if(errors[name])throw new Error(errors[name]);if(next[name]){const value=next[name];delete next[name];return value;}return run();}
  const api={
    status:()=>({configured:true,mode:'cloud',user}),subscribe(fn){subscribers.add(fn);return()=>subscribers.delete(fn);},
    requireUser:async()=>{if(!user)throw new Error('未登录');return user;},getSession:async()=>user?{user}:null,
    loadStudyState:()=>call('loadStudyState',[],()=>plain(model())),
    saveProgress:(id,complete,revision)=>call('saveProgress',[id,complete,revision],()=>{const old=model().progress.find(p=>p.lesson_id===id);if((old?.revision||0)!==revision)return{applied:false,current_completed:old?.completed||false,current_revision:old?.revision||0};const row={lesson_id:id,completed:complete,revision:revision+1};model().progress=model().progress.filter(p=>p.lesson_id!==id);model().progress.push(row);return{applied:true,current_completed:complete,current_revision:row.revision};}),
    saveFavorite:(id,selected)=>call('saveFavorite',[id,selected],()=>{model().favorites=model().favorites.filter(f=>f.lesson_id!==id);if(selected)model().favorites.push({lesson_id:id});return{selected};}),
    saveNote:(id,content)=>call('saveNote',[id,content],()=>{const row={lesson_id:id,content,updated_at:new Date().toISOString()};model().notes=model().notes.filter(n=>n.lesson_id!==id);model().notes.push(row);return plain(row);}),
    deleteNote:id=>call('deleteNote',[id],()=>{model().notes=model().notes.filter(n=>n.lesson_id!==id);return{deleted:true,lesson_id:id};}),
    saveProfilePatch:patch=>call('saveProfilePatch',[patch],()=>{model().profile={nickname:'',last_lesson_id:0,...model().profile,...patch};return plain(model().profile);}),
    listSubmissions:async()=>[],signOut:async()=>change(null),safeNext:value=>value||'index.html'
  };
  function change(value){user=value;for(const fn of subscribers)fn({user,event:value?'SIGNED_IN':'SIGNED_OUT'});}
  return{api,A,B,calls,next,errors,records,change};
}
const metadata=['lessons-data.js','tutorials.js','build-guides.js','progression-guides.js','curriculum-expansion.js','curriculum-lessons-01.js','curriculum-lessons-02.js'];
function page(file='personal-space.html',cloud=service()){
  const dom=new JSDOM(fs.readFileSync(path.join(root,file),'utf8'),{url:'https://qa.invalid/'+file,runScripts:'outside-only'}),w=dom.window;
  let reads=0;const errors=[];w.addEventListener('error',event=>{errors.push(event.message);event.preventDefault();});Object.defineProperty(w,'localStorage',{get(){reads++;throw new Error('云端不应读取旧本机记录');}});
  w.HTMLElement.prototype.scrollIntoView=function(){};
  w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};w.confirm=()=>true;
  const run=file=>w.eval(fs.readFileSync(path.join(root,file),'utf8'));
  run('personal-space-state.js');w.EGG_CLOUD=cloud.api;for(const file of metadata)run(file);
  return{dom,w,cloud,run,api:w.EGG_SPACE,get reads(){return reads;},close:()=>{dom.window.close();eq(errors,[],'页面脚本没有未处理错误');}};
}
async function main(){
  let p=page();try{
    const {api,cloud}=p;
    eq(api.getState().completed,[],'真实新账号初始没有演示完成标记');eq(api.getState().favorites,[],'没有演示收藏');eq(api.getState().notes,[],'没有演示笔记');
    eq((await api.loadCloudUser(cloud.A)).ok,true,'装载真实账号');eq(api.getState().lastLesson,null,'无profile的最近阅读为空');eq(p.reads,0,'加载顺序与云端读取均不访问本机键');
    eq((await api.setCompleted(40,true)).ok,true,'完成保存确认');eq((await api.setCompleted(40,false)).ok,true,'取消完成保存确认');eq((await api.setCompleted(40,true)).ok,true,'重新完成沿用false行的版本');
    eq(cloud.calls.filter(c=>c.name==='saveProgress').map(c=>c.args[2]),[0,1,2],'revision不会被completed数组丢失');
    cloud.records.get(cloud.A.id).progress[0].revision=9;eq((await api.setCompleted(40,false)).ok,false,'版本冲突拒绝覆盖');eq(api.getState().completed,[40],'冲突不伪装成功');
    eq((await api.toggleFavorite(0)).ok,true,'收藏确认');eq(api.getState().favorites,[0],'共享收藏已更新');
    eq((await api.saveNote(0,'第一份笔记')).ok,true,'笔记确认');cloud.errors.saveNote='RLS拒绝';eq((await api.saveNote(0,'不能成功的笔记')).ok,false,'RLS错误不成功');eq(api.getState().notes[0].content,'第一份笔记','失败不覆盖已保存笔记');delete cloud.errors.saveNote;
    cloud.next.saveNote={lesson_id:0,content:'无有效时间'};eq((await api.saveNote(0,'无有效时间')).ok,false,'未知确认结果不成功');
    eq((await api.deleteNote(0)).ok,true,'删除确认');eq(api.getState().notes,[],'删除通知共享快照');
    eq((await api.setNickname('真实昵称')).ok,true,'昵称部分更新');eq((await api.rememberLesson(144)).ok,true,'阅读部分更新');eq(cloud.calls.filter(c=>c.name==='saveProfilePatch').map(c=>c.args[0]),[{nickname:'真实昵称'},{last_lesson_id:144}],'昵称与最近阅读互不覆盖');
    eq(api.importLocalProgress().ok,false,'云端禁止隐式本机导入');eq(api.resetDemo().ok,false,'云端禁止演示重置');eq(api.enterDemo('体验').ok,false,'云端禁止体验身份');eq(p.reads,0,'全部云端操作均未访问旧键');
    const held=deferred();cloud.next.saveNote=held.promise;const save=api.saveNote(1,'账号A在途');eq(api.getState().saving,true,'请求挂起时锁住写入');eq((await api.toggleFavorite(1)).ok,false,'重复写入不发第二请求');
    cloud.change(cloud.B);eq(api.getState().userId,null,'切换立即清除上一账号');await api.loadCloudUser(cloud.B);held.resolve({lesson_id:1,content:'账号A在途',updated_at:new Date().toISOString()});eq((await save).code,'ACCOUNT_CHANGED','拒绝迟到保存');eq(api.getState().notes,[],'B没有A的迟到笔记');eq(api.getState().userId,cloud.B.id,'B身份保持');
    const readHeld=deferred(),old=plain(cloud.records.get(cloud.B.id));cloud.next.loadStudyState=readHeld.promise;const read=api.loadCloudUser(cloud.B,{refresh:true});cloud.change(cloud.A);await api.loadCloudUser(cloud.A);readHeld.resolve(old);eq((await read).code,'ACCOUNT_CHANGED','拒绝迟到读取');eq(api.getState().userId,cloud.A.id,'迟到读取不恢复上一账号');
    cloud.errors.loadStudyState='PG暂不可用';eq((await api.loadCloudUser(cloud.A,{refresh:true})).ok,false,'读取错误明确返回');eq(api.getState().ready,false,'读取错误不冒充零记录');eq((await api.setCompleted(1,true)).ok,false,'读取失败时禁止写');delete cloud.errors.loadStudyState;await api.loadCloudUser(cloud.A);
    cloud.change(null);eq(api.getState().active,false,'登出清除共享快照');eq(api.getState().completed,[],'登出不保留旧记录展示');
  }finally{p.close();}
  const localService=service();localService.api.status=()=>({configured:false,mode:'local',user:null});
  p=page('personal-space.html',localService);try{
    p.run('personal-space.js');p.api.enterDemo('本机文案检查');
    eq(p.w.document.querySelector('.space-preview-note p').textContent,'浏览器体验模式，数据保存在当前浏览器，尚未连接云端。','本机保留预览说明');
    eq(p.w.document.querySelector('.space-footer-note').textContent,'登录后使用本站功能。当前体验记录保存在本浏览器；云端账号记录需接入数据库。','本机保留末尾说明');
    eq(p.w.document.querySelector('.space-sidebar-bottom [data-space-action="logout"]').getAttribute('aria-label'),'退出体验账号','本机保留退出体验账号标签');
    eq(p.w.document.querySelector('#space-note-form .space-field-help').textContent,'每课保存一份笔记，最多 2000 字。预览仅保存在本机。','本机笔记仍显示本机保存说明');
    eq(p.w.document.querySelector('#space-account-dialog > p').textContent,'仅修改当前浏览器的体验昵称，已有学习记录会保留，不会创建新的账号。','本机昵称仍显示体验说明');
  }finally{p.close();}
  p=page();try{
    const {api,cloud,w}=p;p.run('personal-space.js');
    await api.loadCloudUser(cloud.A);
    eq(w.document.querySelector('.space-preview-note p').textContent,'邮箱账号模式：'+api.getState().storageMessage+' 社区与投稿功能仍在接入中。','云端说明使用真实状态消息与社区状态');
    eq(w.document.querySelector('.space-footer-note').textContent,'当前账号的学习记录由账号服务保存，保存结果以服务端确认为准。社区与投稿功能尚未开放。','云端末尾说明服务端保存确认');
    eq(w.document.querySelector('.space-sidebar-bottom [data-space-action="logout"]').getAttribute('aria-label'),'退出邮箱账号','云端退出标签同步账号模式');
    eq(w.document.querySelector('#space-note-form .space-field-help').textContent,'每课保存一份笔记，最多 2000 字。'+api.getState().storageMessage,'云端笔记帮助使用真实状态消息');
    eq(w.document.querySelector('#space-account-dialog > p').textContent,'昵称保存在当前邮箱账号中，修改后需由账号服务确认。学习记录会保留。','云端昵称说明账号服务保存');
    eq(w.document.querySelector('#space-feedback-form button[type="submit"]').disabled,true,'云端反馈没有被文案同步误开放');
    w.document.querySelector('[data-space-action="note"]').click();const form=w.document.getElementById('space-note-form');form.elements.content.value='失败后应保留的内容';cloud.errors.saveNote='模拟笔记保存失败';
    form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));await tick();
    eq(w.document.getElementById('space-note-dialog').open,true,'失败保留主空间笔记弹窗');eq(form.elements.content.value,'失败后应保留的内容','失败保留主空间笔记输入');eq(form.querySelector('.space-form-error').textContent,'模拟笔记保存失败','失败显示服务错误');
    delete cloud.errors.saveNote;form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));await tick();eq(w.document.getElementById('space-note-dialog').open,false,'服务端成功确认后关闭弹窗');
    w.location.hash='#settings';w.dispatchEvent(new w.Event('hashchange'));eq(w.document.querySelector('[data-space-action="import"]'),null,'云端设置无导入演示按钮');eq(w.document.querySelector('[data-space-action="reset"]'),null,'云端设置无演示重置按钮');
  }finally{p.close();}
  p=page('learning-path.html');try{
    const {api,cloud,w}=p;p.run('learning-progress.js');w.EGG_PROGRESS.init();eq(w.document.querySelectorAll('.learning-route-card').length,8,'保留八条学习路线');eq(w.document.querySelector('.learning-dashboard progress').max,145,'保留145课');eq(w.EGG_PROGRESS.getState().completed,[],'等待账号时不读取旧进度');
    await api.loadCloudUser(cloud.A);await w.EGG_PROGRESS.setCompleted(144,true);eq(w.EGG_PROGRESS.getState().completed,[144],'课程工具委托共享保存');eq(w.document.querySelector('[data-total-done]').textContent,'1','共享通知更新路线统计');eq(w.document.querySelector('[data-progress-clear]').hidden,true,'云端隐藏本机清理按钮');eq(p.reads,0,'课程进度云端无旧键访问');
    cloud.change(cloud.B);await api.loadCloudUser(cloud.B);eq(w.EGG_PROGRESS.getState().completed,[],'课程工具切换身份清除旧完成记录');
  }finally{p.close();}
  p=page('cloud-account.html');try{
    const {api,cloud,w}=p;w.EGG_ACCESS={logout:async()=>{await cloud.api.signOut();api.logout();return{ok:true};}};p.run('cloud-account.js');await tick();await tick();
    eq(w.document.getElementById('cloud-workspace').hidden,false,'云端账号页读取共同状态');w.document.getElementById('cloud-complete').click();await tick();eq(api.getState().completed,[0],'账号页保存更新共同状态');
    w.document.getElementById('cloud-note').value='账号页未保存文本';w.document.getElementById('cloud-note').dispatchEvent(new w.Event('input'));cloud.errors.saveFavorite='账号页收藏失败';w.document.getElementById('cloud-favorite').click();await tick();eq(w.document.getElementById('cloud-note').value,'账号页未保存文本','账号页其他操作失败保留笔记');
    w.document.getElementById('cloud-signout').click();await tick();eq(api.getState().active,false,'账号页退出经统一闸门清理');eq(w.document.getElementById('cloud-note').value,'','退出清除原账号笔记展示');
  }finally{p.close();}
  p=page('lesson.html');try{
    const {api,cloud,w}=p;w.history.replaceState(null,'','lesson.html?id=144');w.fetch=async()=>({ok:true,text:async()=>fs.readFileSync(path.join(root,'personal-space.html'),'utf8')});p.run('learning-progress.js');w.EGG_PROGRESS.init();p.run('personal-space.js');
    eq(cloud.calls.filter(c=>c.name==='saveProfilePatch').length,0,'课程未加载账号前不写阅读位置');await api.loadCloudUser(cloud.A);await tick();
    eq(cloud.calls.filter(c=>c.name==='saveProfilePatch').map(c=>c.args[0]),[{last_lesson_id:144}],'课程载入后只写一次阅读位置');w.EGG_PROGRESS.init();await tick();eq(cloud.calls.filter(c=>c.name==='saveProfilePatch').length,1,'重复init不重复保存阅读位置');
    eq(w.document.querySelector('#space-note-form .space-field-help').textContent,'每课保存一份笔记，最多 2000 字。'+api.getState().storageMessage,'课程异步挂载弹窗同样同步云端说明');
    eq(w.document.getElementById('space-lesson-tools').getAttribute('aria-label'),'个人学习空间','课程工具云端无预览账号标签');
    const held=deferred();cloud.next.saveProgress=held.promise;const save=api.setCompleted(144,true);
    eq(w.document.querySelector('[data-progress-toggle]').disabled,true,'保存时课程进度按钮收到共享忙状态');eq(w.document.querySelector('[data-space-action="complete"]').disabled,true,'保存时主空间课程按钮收到共享忙状态');
    held.resolve({applied:true,current_completed:true,current_revision:1});await save;eq(w.document.querySelector('[data-progress-toggle]').getAttribute('aria-pressed'),'true','完成后课程进度按钮同步');eq(w.document.querySelector('[data-space-action="complete"]').getAttribute('aria-pressed'),'true','完成后主空间课程按钮同步');eq(cloud.calls.filter(c=>c.name==='saveProfilePatch').length,1,'忙状态通知不触发阅读保存循环');
  }finally{p.close();}
  p=page();try{
    const {cloud,w}=p;cloud.errors.loadStudyState='PG故障';p.run('access-gate.js');await tick();await tick();
    eq(w.EGG_ACCESS.isAuthenticated(),true,'真实身份不因学习数据库故障降为未登录');eq(w.document.documentElement.hasAttribute('data-access-pending'),false,'数据库故障仍显示学习重试界面');eq(p.api.getState().ready,false,'故障仍禁止学习写入');eq(p.reads,0,'云端闸门没有enterDemo或旧本机键读写');
  }finally{p.close();}
  console.log('PASS 共享账号本地契约：'+checks+' 项检查；未连接真实CloudBase或PG。');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
