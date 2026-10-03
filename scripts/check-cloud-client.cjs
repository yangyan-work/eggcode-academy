'use strict';
// 本地接入契约检查，不连接 Supabase，不作为真实账号、RLS 或 Storage 验证证据。
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'cloud-client.js'),'utf8');
let checks=0;const ok=(condition,message)=>{assert.ok(condition,message);checks++;};
function create(config={url:'',publishableKey:''},backend){
  const requests=[],events=[],window={EGGCODE_SUPABASE_CONFIG:config,dispatchEvent:event=>events.push(event)};
  const context={window,URL,URLSearchParams,atob,Blob,Uint8Array,structuredClone,crypto:require('node:crypto').webcrypto,location:new URL('http://localhost:4178/site/login.html'),setTimeout,clearTimeout,CustomEvent:class{constructor(type,init){this.type=type;this.detail=init.detail;}}};
  context.document={createElement:()=>({remove(){}}),head:{append(script){requests.push(script.src);if(backend){window.supabase={createClient:()=>backend};queueMicrotask(()=>script.onload());}else queueMicrotask(()=>script.onerror());}}};
  vm.runInNewContext(source,context,{filename:'cloud-client.js'});return{api:window.EGG_CLOUD,requests,events};
}
const validConfig={url:'https://example-project.supabase.co',publishableKey:'sb_publishable_'+ 'a'.repeat(30)};
const record={title:'我的测试教程',category:'match3',difficulty:'beginner',summary:'这是一份用来核对接入格式的完整教程简介说明。',preparation:'先准备一个独立的练习场景。',steps:[{title:'第一步',body:'先建立初始状态并检查变量类型，明确本次使用的对象。',image:null},{title:'第二步',body:'再执行一次操作并对比预期结果，不重复添加同一动作。',image:null}],validation:'重新开始试玩后，对比初始值与操作后的结果，记录成功及失败。',tips:'',testStatus:'not-tested'};
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
  await assert.rejects(configured.api.uploadTutorial(record,{expectedUserId:'22222222-2222-4222-8222-222222222222'}),{code:'ACCOUNT_CHANGED'});ok(calls.length===1,'账号变化在任何上传或草稿写入前拒绝');
  let authListener;const other={id:'22222222-2222-4222-8222-222222222222',email:'b@example.com'};
  const switching=create(validConfig,{auth:{onAuthStateChange(fn){authListener=fn;return{data:{subscription:{unsubscribe(){}}}};},getSession:async()=>({data:{session:{user}},error:null}),getUser:async()=>{authListener('SIGNED_IN',{user:other});return{data:{user},error:null};}}});
  await assert.rejects(switching.api.requireUser(),{code:'ACCOUNT_CHANGED'});ok(switching.api.status().user.id===other.id,'过时 Auth 返回不能覆盖已切换账号');
  const html=fs.readFileSync(path.join(root,'login.html'),'utf8'),login=fs.readFileSync(path.join(root,'login.js'),'utf8');
  ok(html.indexOf('cloud-config.js')<html.indexOf('cloud-client.js')&&html.indexOf('cloud-client.js')<html.indexOf('login.js'),'登录加载顺序正确');ok(!/localStorage|sessionStorage/.test(login),'登录表单不自行存邮箱密码');
  console.log('PASS cloud client: '+checks+' assertions; blank configuration has zero third-party requests; validation/RPC contract only.');console.log('NOT TESTED: real Supabase Auth, email delivery, SQL/RLS, Storage and cross-device synchronization.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
