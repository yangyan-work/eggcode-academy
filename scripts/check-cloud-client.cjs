'use strict';
// 本地接入契约检查，不连接 Supabase，不作为真实账号、RLS 或 Storage 验证证据。
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'cloud-client.js'),'utf8');
let checks=0;const ok=(condition,message)=>{assert.ok(condition,message);checks++;};
function create(config={url:'',publishableKey:''},backend,pgConfig){
  const requests=[],sdkAttributes=[],events=[],clock={now:Date.now()},window={EGGCODE_SUPABASE_CONFIG:config,EGGCODE_CLOUDBASE_CONFIG:pgConfig,dispatchEvent:event=>events.push(event)};
  const context={window,URL,URLSearchParams,atob,Blob,Uint8Array,structuredClone,Date:class extends Date{static now(){return clock.now;}},crypto:require('node:crypto').webcrypto,location:new URL('http://localhost:4178/site/login.html'),setTimeout:(fn,ms)=>{const timer=setTimeout(fn,ms);timer.unref();return timer;},clearTimeout,CustomEvent:class{constructor(type,init){this.type=type;this.detail=init.detail;}}};
  context.document={createElement:()=>({remove(){}}),head:{append(script){requests.push(script.src);sdkAttributes.push({crossOrigin:script.crossOrigin,referrerPolicy:script.referrerPolicy});if(backend){if(pgConfig)window.cloudbase={init(options){backend.initialized=options;return{auth:backend.auth,rdb:()=>backend,storage:backend.storage};}};else window.supabase={createClient:()=>backend};queueMicrotask(()=>script.onload());}else queueMicrotask(()=>script.onerror());}}};
  vm.runInNewContext(source,context,{filename:'cloud-client.js'});return{api:window.EGG_CLOUD,requests,sdkAttributes,events,clock};
}
const validConfig={url:'https://example-project.supabase.co',publishableKey:'sb_publishable_'+ 'a'.repeat(30)};
const record={title:'我的测试教程',category:'match3',difficulty:'beginner',summary:'这是一份用来核对接入格式的完整教程简介说明。',preparation:'先准备一个独立的练习场景。',steps:[{title:'第一步',body:'先建立初始状态并检查变量类型，明确本次使用的对象。',image:null},{title:'第二步',body:'再执行一次操作并对比预期结果，不重复添加同一动作。',image:null}],validation:'重新开始试玩后，对比初始值与操作后的结果，记录成功及失败。',tips:'',testStatus:'not-tested'};
const pgConfig={env:'qa-pg-environment',region:'ap-shanghai',publishableKey:'a.'+Buffer.from(JSON.stringify({role:'anon',aud:'qa-pg-environment',meta:{platform:'PublishableKey'}})).toString('base64url')+'.b'};
function pgBackend(){
  const A={id:'CloudBase-user_A',email:'a@example.test',is_anonymous:false},B={id:'CloudBase-user_B',email:'b@example.test',is_anonymous:false};
  let user=A,listener,stamp=0;
  const rows={profiles:[],lesson_progress:[],favorites:[],lesson_notes:[]},calls=[],session=()=>({user,access_token:'仅本地契约令牌'});
  const backend={A,B,rows,calls,actor:null,refreshError:null,readPause:null,ignoredDeletes:false,readAs:null,afterDelete:null,
    switchUser(next){user=next;listener('SIGNED_IN',session());},
    auth:{onAuthStateChange(fn){listener=fn;return{data:{subscription:{unsubscribe(){}}}};},getSession:async()=>({data:{session:session()},error:null}),refreshUser:async()=>({data:{user:backend.readAs||user,session:backend.readAs?{user:backend.readAs}:session()},error:backend.refreshError}),
      signUp:async values=>{calls.push({auth:'signup',values});return{data:{verifyOtp:async values=>{calls.push({auth:'verifyOtp',values});return{data:{user,session:session()},error:null};}},error:null};},
      resetPasswordForEmail:async address=>{calls.push({auth:'reset',address});return{data:{updateUser:async values=>{calls.push({auth:'resetVerify',values});return{data:{user,session:session()},error:null};}},error:null};},
      signOut:async options=>{calls.push({auth:'signOut',options});user=null;listener('SIGNED_OUT',null);return{data:{},error:null};}},
    from(table){return new Query(table);},
    async rpc(name,params){calls.push({rpc:name,params});if(params.p_expected_user_id!==(backend.actor||user.id))return{data:null,error:Object.assign(new Error('账号不一致'),{code:'42501'})};rows.lesson_progress.push({user_id:user.id,lesson_id:params.p_lesson_id});return{data:[{applied:false,current_revision:2,current_completed:false}],error:null};}
  };
  class Query{
    constructor(table){this.table=table;this.op='select';this.filters=[];this.columns='*';}
    select(columns='*'){assert.equal(this.op,'select','写入后不能依赖 select 返回非自增行');this.columns=columns;return this;}
    eq(key,value){this.filters.push([key,value]);return this;}
    insert(values){this.op='insert';this.values=values;return this;}
    update(values){this.op='update';this.values=values;return this;}
    delete(){this.op='delete';return this;}
    single(){this.cardinality='single';return this;}
    maybeSingle(){this.cardinality='maybe';return this;}
    then(resolve,reject){return this.execute().then(resolve,reject);}
    async execute(){
      calls.push({table:this.table,op:this.op,values:this.values,filters:this.filters});
      const matches=row=>this.filters.every(([key,value])=>row[key]===value)&&(this.op!=='select'||!backend.readAs||row.user_id===backend.readAs.id),selected=rows[this.table].filter(matches);
      if(this.op==='insert')rows[this.table].push({...this.values,updated_at:String(++stamp)});
      if(this.op==='update')selected.forEach(row=>Object.assign(row,this.values,{updated_at:String(++stamp)}));
      if(this.op==='delete'){if(!backend.ignoredDeletes)rows[this.table]=rows[this.table].filter(row=>!matches(row));backend.afterDelete?.();}
      if(this.op!=='select')return{data:null,error:null};
      const data=selected.map(row=>this.columns==='*'?{...row}:Object.fromEntries(this.columns.split(',').map(key=>[key,row[key]])));
      if(backend.readPause)await backend.readPause;
      if(this.cardinality==='single'&&data.length!==1)return{data:null,error:new Error('必须返回一行')};
      return{data:this.cardinality?data[0]||null:data,error:null};
    }
  }
  return backend;
}
async function main(){
  const blank=create();ok(blank.api.status().mode==='local','留空配置使用本机模式');await assert.rejects(blank.api.init(),{code:'NOT_CONFIGURED'});ok(blank.requests.length===0,'空配置不创建 SDK 请求');
  for(const config of [{url:validConfig.url,publishableKey:''},{url:'javascript:alert(1)',publishableKey:validConfig.publishableKey},{url:'https://example.com',publishableKey:validConfig.publishableKey},{url:validConfig.url,publishableKey:'sb_secret_'+ 'a'.repeat(30)},{url:validConfig.url,publishableKey:'a.'+Buffer.from(JSON.stringify({role:'service_role'})).toString('base64url')+'.b'}]){const state=create(config);ok(state.api.status().mode==='error','错误与私密配置被拒绝');await assert.rejects(state.api.init(),{code:'CONFIG_INVALID'});ok(state.requests.length===0,'无效配置不访问外部 SDK');}
  for(const file of ['index.html','courses.html','practice.html','manual.html?q=%E4%BA%8B%E4%BB%B6#events','block.html?id=test','learning-path.html','big-number-lab.html','verification.html','editor-guide.html','personal-space.html','contribute.html','community.html','community-tutorial.html?id=demo','works.html','messages.html','admin.html','cloud-account.html','lesson.html?id=0','lesson.html?id=144'])ok(blank.api.safeNext(file).endsWith('/site/'+file),'安全回跳 '+file);
  for(const value of ['https://evil.example/site/admin.html','//evil.example/works.html','javascript:alert(1)','../admin.html','lesson.html?id=-1','lesson.html?id=145','lesson.html?id=1.5','lesson.html','login.html'])ok(blank.api.safeNext(value).endsWith('/site/index.html'),'拒绝越界回跳 '+value);
  ok(blank.api.safeNext(null).endsWith('/site/index.html'),'未指定回跳默认首页');
  ok(blank.api.safeNext(null,'personal-space.html').endsWith('/site/personal-space.html'),'可指定本机空间作为默认回跳');
  ok(blank.api.safeNext(null,'cloud-account.html').endsWith('/site/cloud-account.html'),'可指定云端账号作为默认回跳');
  ok(blank.api.safeNext(null,'login.html').endsWith('/site/index.html'),'无效默认回跳退回首页');
  await assert.rejects(blank.api.signIn('bad','password123'),{code:'INVALID_INPUT'});await assert.rejects(blank.api.signUp('a@example.com','short'),{code:'INVALID_INPUT'});
  for(const task of [()=>blank.api.saveProgress(145,true,0),()=>blank.api.saveProgress(0,'true',0),()=>blank.api.saveProgress(0,true,2147483647),()=>blank.api.saveFavorite(-1,true),()=>blank.api.saveNote(0,'字'.repeat(2001)),()=>blank.api.getSubmission('../draft')])await assert.rejects(task(),{code:'INVALID_INPUT'});
  ok(blank.requests.length===0,'输入边界检查不触发联网');
  const content=blank.api.validateContent(record,true);ok(content.steps.length===2&&content.steps.every(step=>step.imagePath===null),'本机教程转换纯文本云端字段');
  assert.throws(()=>blank.api.validateContent({...record,steps:[record.steps[0]]},true),{code:'INVALID_INPUT'});assert.throws(()=>blank.api.validateContent({...record,title:'短'},true),{code:'INVALID_INPUT'});
  await assert.rejects(blank.api.uploadTutorial({...record,steps:[{...record.steps[0],image:{mime:'image/svg+xml',dataUrl:'data:image/svg+xml;base64,AAAA',size:3}},record.steps[1]]}),{code:'INVALID_INPUT'});ok(blank.requests.length===0,'不合法图片在联网前被拒绝');
  const user={id:'11111111-1111-4111-8111-111111111111',email:'a@example.com'},calls=[];
  const backend={auth:{onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}}),getSession:async()=>({data:{session:null},error:null}),getUser:async()=>({data:{user},error:null})},rpc:async(name,params)=>{calls.push({name,params});return{data:[{applied:false,current_revision:2,current_completed:false,current_updated_at:'2026-10-03T00:00:00Z'}],error:null};}};
  const configured=create(validConfig,backend),result=await configured.api.saveProgress(40,true,1);
  ok(result.applied===false,'版本冲突不被伪装成保存成功');ok(calls.length===1&&calls[0].name==='save_lesson_progress','唯一进度写入口使用 RPC');ok(JSON.stringify(calls[0].params)==='{"p_lesson_id":40,"p_completed":true,"p_expected_revision":1}','RPC 不接受客户端伪造 user_id');ok(configured.requests.length===1&&configured.requests[0].includes('@2.57.4/'),'SDK 仅按需加载一次固定版本');
  ok(configured.sdkAttributes[0].crossOrigin==='anonymous'&&configured.sdkAttributes[0].referrerPolicy==='no-referrer','兼容Supabase保留原跨域与来源属性');
  await assert.rejects(configured.api.uploadTutorial(record,{expectedUserId:'22222222-2222-4222-8222-222222222222'}),{code:'ACCOUNT_CHANGED'});ok(calls.length===1,'账号变化在任何上传或草稿写入前拒绝');
  let authListener;const other={id:'22222222-2222-4222-8222-222222222222',email:'b@example.com'};
  const switching=create(validConfig,{auth:{onAuthStateChange(fn){authListener=fn;return{data:{subscription:{unsubscribe(){}}}};},getSession:async()=>({data:{session:{user}},error:null}),getUser:async()=>{authListener('SIGNED_IN',{user:other});return{data:{user},error:null};}}});
  await assert.rejects(switching.api.requireUser(),{code:'ACCOUNT_CHANGED'});ok(switching.api.status().user.id===other.id,'过时 Auth 返回不能覆盖已切换账号');
  const html=fs.readFileSync(path.join(root,'login.html'),'utf8'),login=fs.readFileSync(path.join(root,'login.js'),'utf8');
  ok(html.indexOf('cloud-config.js')<html.indexOf('cloud-client.js')&&html.indexOf('cloud-client.js')<html.indexOf('login.js'),'登录加载顺序正确');ok(!/localStorage|sessionStorage/.test(login),'登录表单不自行存邮箱密码');
  const pgBlank=create(undefined,undefined,{env:'',region:'ap-shanghai',publishableKey:''});ok(pgBlank.api.status().mode==='local','两种配置留空保持本机');
  for(const value of [{env:'qa-pg-environment',region:'ap-shanghai',publishableKey:''},{...pgConfig,region:'ap-guangzhou'},{...pgConfig,publishableKey:'a.'+Buffer.from(JSON.stringify({role:'service_role'})).toString('base64url')+'.b'},{env:'',region:'invalid',publishableKey:''},null]){
    const invalid=create(validConfig,undefined,value);ok(invalid.api.status().mode==='error','错误CloudBase配置不退回Supabase');await assert.rejects(invalid.api.init(),{code:'CONFIG_INVALID'});ok(invalid.requests.length===0,'错误CloudBase配置不加载SDK');
  }
  const pg=pgBackend(),page=create(validConfig,pg,pgConfig);
  ok(page.api.status().provider==='cloudbase','CloudBase优先于兼容配置');await page.api.init();
  ok(page.requests[0]=== 'https://static.cloudbase.net/cloudbase-js-sdk/3.10.1/cloudbase.full.js'&&pg.initialized.persistence==='local'&&pg.initialized.auth.detectSessionInUrl===false,'固定官方SDK、顶层持久化且不从回跳URL隐式恢复登录');
  ok(page.sdkAttributes[0].crossOrigin===undefined&&page.sdkAttributes[0].referrerPolicy==='no-referrer','CloudBase经典脚本不强制CORS，仍不发送Referer');
  ok((await page.api.requireUser()).id===pg.A.id,'文本用户ID通过服务端刷新核验');pg.refreshError=new Error('服务端刷新失败');await assert.rejects(page.api.requireUser(),/服务端刷新失败/);pg.refreshError=null;
  let profile=await page.api.saveProfilePatch({nickname:'树下学习'});ok(profile.nickname==='树下学习'&&profile.last_lesson_id===0,'首次资料缺省课程为0');
  profile=await page.api.saveProfilePatch({last_lesson_id:40});ok(profile.nickname==='树下学习'&&profile.last_lesson_id===40,'课程补丁保留昵称');
  const profileUpdate=pg.calls.filter(call=>call.table==='profiles'&&call.op==='update').at(-1);ok(Object.keys(profileUpdate.values).join(',')==='last_lesson_id','更新只发送提供字段');
  await page.api.saveNote(40,'第一份笔记');const note=await page.api.saveNote(40,'修订笔记');ok(note.content==='修订笔记'&&note.lesson_id===40,'笔记写入后按账号课程读回');
  const deleted=await page.api.deleteNote(40);ok(deleted.deleted===true&&deleted.lesson_id===40&&pg.rows.lesson_notes.length===0,'删除返回明确确认契约');
  const deleteRead=pg.calls.filter(call=>call.table==='lesson_notes'&&call.op==='select').at(-1);ok(JSON.stringify(deleteRead.filters)===JSON.stringify([['user_id',pg.A.id],['lesson_id',40]]),'删除后只读回原账号原课程');
  pg.rows.lesson_notes.push({user_id:pg.A.id,lesson_id:41,content:'不可丢失的笔记'});pg.rows.favorites.push({user_id:pg.A.id,lesson_id:41});pg.ignoredDeletes=true;
  await assert.rejects(page.api.deleteNote(41),{code:'UNKNOWN_RESULT'});ok(pg.rows.lesson_notes.length===1,'DELETE无报错但仍有笔记时拒绝成功确认');
  await assert.rejects(page.api.saveFavorite(41,false),{code:'UNKNOWN_RESULT'});ok(pg.rows.favorites.length===1,'取消收藏零影响且仍有记录时拒绝成功确认');
  pg.ignoredDeletes=false;ok((await page.api.saveFavorite(41,false)).selected===false&&pg.rows.favorites.length===0,'取消收藏确认原账号记录消失');
  ok((await page.api.deleteNote(42)).deleted===true,'原本无记录的删除在同一服务端身份下幂等成功');
  pg.ignoredDeletes=true;pg.afterDelete=()=>{pg.readAs=pg.B;};await assert.rejects(page.api.deleteNote(41),{code:'ACCOUNT_CHANGED'});ok(pg.rows.lesson_notes.length===1,'读回因静默换B受RLS遮蔽为零行时再次核验身份，拒绝误报');pg.readAs=null;pg.afterDelete=null;pg.ignoredDeletes=false;
  await page.api.saveProgress(40,true,1);ok(pg.calls.at(-1).params.p_expected_user_id===pg.A.id,'CloudBase RPC带账号一致性断言');
  pg.actor=pg.B.id;const writes=pg.rows.lesson_progress.length;await assert.rejects(page.api.saveProgress(41,true,0),{code:'42501'});ok(pg.rows.lesson_progress.length===writes,'SDK请求时token换B被服务端断言拒绝，不写B');pg.actor=null;
  let release;pg.readPause=new Promise(resolve=>release=resolve);const loading=page.api.loadStudyState();await new Promise(resolve=>setImmediate(resolve));pg.switchUser(pg.B);release();await assert.rejects(loading,{code:'ACCOUNT_CHANGED'});pg.readPause=null;
  const getSession=pg.auth.getSession;pg.auth.getSession=async()=>({data:{session:{user:pg.A}},error:null});await assert.rejects(page.api.requireUser(),{code:'ACCOUNT_CHANGED'});pg.auth.getSession=getSession;ok(true,'缓存会话与服务端刷新身份不一致时拒绝');
  for(const action of [()=>page.api.listSubmissions(),()=>page.api.getSubmission('33333333-3333-4333-8333-333333333333'),()=>page.api.uploadTutorial(record),()=>page.api.privateImageUrl('任意路径')])await assert.rejects(action(),{code:'FEATURE_NOT_READY'});
  const registration=await page.api.signUp('b@example.test','password123');ok(registration.verificationRequired&&!registration.verifyOtp&&!JSON.stringify(registration).includes('password123'),'注册只返回验证码状态，不暴露密码或SDK闭包');
  page.api.cancelVerification();await assert.rejects(page.api.verifyEmail('123456'),{code:'VERIFICATION_EXPIRED'});
  await page.api.signUp('b@example.test','password123');page.clock.now+=600001;await assert.rejects(page.api.verifyEmail('123456'),{code:'VERIFICATION_EXPIRED'});
  await page.api.signUp('b@example.test','password123');const verified=await page.api.verifyEmail('123456');ok(verified.session.user.id===pg.B.id,'注册第二步才确认会话');
  await page.api.requestPasswordReset('b@example.test');await page.api.verifyEmail('654321','newpassword123');ok(pg.calls.at(-1).auth==='resetVerify'&&pg.calls.at(-1).values.nonce==='654321','重置密码采用nonce验证码回调');
  await assert.rejects(page.api.updatePassword('newpassword123'),{code:'VERIFICATION_REQUIRED'});await page.api.signOut();ok(pg.calls.at(-1).options===undefined,'CloudBase退出不传Supabase scope');
  const sql=fs.readFileSync(path.join(root,'database/cloudbase-study-schema.sql'),'utf8');
  ok(!/\b(?:v_)?user_id\s+(?:uuid|bigint|varchar)\b/.test(sql)&&/v_user_id text := auth\.uid\(\)/.test(sql)&&!sql.includes('references auth.users'),'CloudBase SQL按JWT文本归属，不连接托管内部主键');
  ok(sql.includes('p_expected_user_id text')&&sql.indexOf('v_user_id <> p_expected_user_id')<sql.indexOf('insert into public.lesson_progress'),'RPC身份断言在首个写入前执行');
  const bounded=pgBackend();bounded.A.id='账😀'.repeat(127)+'账';const boundedPage=create(undefined,bounded,pgConfig);ok((await boundedPage.api.requireUser()).id===bounded.A.id,'255个Unicode字符账号标识可用，不限制UUID或64位');bounded.A.id+='账';await assert.rejects(boundedPage.api.requireUser(),{code:'AUTH_REQUIRED'});ok(true,'256字符账号标识拒绝，边界与SQL一致');
  console.log('PASS cloud client: '+checks+' assertions; blank configuration has zero third-party requests; validation/RPC contract only.');console.log('NOT TESTED: real CloudBase/Supabase Auth, email delivery, SQL/RLS, Storage and cross-device synchronization.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
