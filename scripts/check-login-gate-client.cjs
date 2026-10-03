'use strict';
// 登录与门禁接口契约：JSDOM + 本地替身，不连接账号服务。沿用 DOM QA 的 NODE_PATH 环境。
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {JSDOM}=require('jsdom'),root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'login.html'),'utf8'),login=fs.readFileSync(path.join(root,'login.js'),'utf8'),client=fs.readFileSync(path.join(root,'cloud-client.js'),'utf8');
let checks=0;const ok=(condition,message)=>{assert.ok(condition,message);checks++;};
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function open({mode='local',provider='supabase',gate=true,persistent=true,sessionOK=true,query=''}={}){
  const dom=new JSDOM(html,{url:'https://qa.invalid/site/login.html'+query,runScripts:'outside-only'}),document=dom.window.document;
  const assigned=[],calls=[],location=new URL(dom.window.location.href);location.assign=target=>assigned.push(target);
  const window={EGGCODE_SUPABASE_CONFIG:{url:'',publishableKey:''}};
  vm.runInNewContext(client,{window,location,URL,URLSearchParams,Set});
  const safeNext=window.EGG_CLOUD.safeNext;
  let user=null,cancellations=0;const subscribers=new Set(),verificationCalls=[];
  const state={active:false,nickname:'契约检查',storageMode:persistent?'persistent':'temporary',storageMessage:persistent?'':'存储暂时不可用'};
  window.EGG_SPACE={getState:()=>({...state}),enterDemo(name){calls.push('enterDemo');state.nickname=name;state.active=true;return{ok:true};}};
  window.EGG_CLOUD={status:()=>({mode,provider,configured:mode==='cloud',message:mode==='error'?'配置错误':'契约替身',user}),safeNext,subscribe(fn){subscribers.add(fn);},init:async()=>{calls.push('init');},getSession:async()=>null,signIn:async()=>{calls.push('signIn');user={id:'qa',email:'qa@example.test'};},
    cancelVerification(){cancellations++;},signUp:async()=>{calls.push('signUp');return{verificationRequired:true,kind:'signup'};},requestPasswordReset:async()=>{calls.push('reset');return{verificationRequired:true,kind:'reset'};},verifyEmail:async(token,secret)=>{verificationCalls.push({token,secret});user={id:'qa',email:'qa@example.test'};return{session:{user}};}};
  if(gate)window.EGG_ACCESS={enterDemoSession(){calls.push('enterDemoSession');return{ok:sessionOK,message:'会话存储被拒绝'};},logout:async()=>{calls.push('gateLogout');user=null;}};
  vm.runInNewContext(login,{window,document,location,URL,URLSearchParams});
  const $=id=>document.getElementById(id),submit=id=>$(id).dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));
  return{dom,$,submit,assigned,calls,verificationCalls,window,get cancellations(){return cancellations;},authEvent(event){subscribers.forEach(fn=>fn({...window.EGG_CLOUD.status(),event}));},close:()=>dom.window.close()};
}
async function main(){
  let page=open();try{
    page.submit('login-demo-form');ok(page.calls.join(',')==='enterDemo,enterDemoSession','先保存本机状态，再建立门禁会话');ok(page.assigned[0]==='https://qa.invalid/site/index.html','体验未指定next进入首页');
  }finally{page.close();}
  page=open({query:'?next='+encodeURIComponent('lesson.html?id=144&q=教程#lesson-body')});try{
    page.submit('login-demo-form');ok(new URL(page.assigned[0]).searchParams.get('q')==='教程'&&new URL(page.assigned[0]).hash==='#lesson-body','指定next保留课程、查询和锚点');
  }finally{page.close();}
  for(const options of [{gate:false},{persistent:false},{sessionOK:false}]){
    page=open(options);try{page.submit('login-demo-form');ok(page.assigned.length===0,'守卫或存储失败不跳转 '+JSON.stringify(options));ok(page.$('login-error').textContent.trim().length>0,'失败有明确反馈');if(!options.gate&&options.gate!==undefined)ok(!page.calls.includes('enterDemo'),'守卫缺失时不修改体验状态');}finally{page.close();}
  }
  for(const mode of ['cloud','error']){
    page=open({mode});try{
      ok(page.$('login-demo-tab').disabled&&page.$('login-nickname').disabled,'云端或配置错误时禁用体验入口 '+mode);
      ok(page.$('login-email-tab').getAttribute('aria-selected')==='true'&&page.$('login-demo-panel').hidden,'禁用的初始tab切到邮箱 '+mode);
      page.$('login-email-tab').dispatchEvent(new page.dom.window.KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true}));
      ok(page.$('login-email-tab').getAttribute('aria-selected')==='true'&&page.$('login-demo-tab').tabIndex===-1,'键盘不会切到禁用体验tab '+mode);
      page.submit('login-demo-form');ok(!page.calls.includes('enterDemo')&&page.assigned.length===0,'程序提交也不能绕过关闭的体验入口 '+mode);
      if(mode==='cloud')ok(!page.$('login-auth-submit').closest('fieldset').disabled,'有效云端配置仍允许邮箱表单');
    }finally{page.close();}
  }
  page=open({mode:'cloud'});try{
    page.$('login-email').value='qa@example.test';page.$('login-password').value='password123';page.submit('login-email-form');await tick();
    ok(page.calls.includes('signIn')&&page.assigned[0]==='https://qa.invalid/site/index.html','邮箱登录未指定next进入首页');
    page.$('login-cloud-signout').click();await tick();ok(page.calls.includes('gateLogout'),'邮箱退出交给门禁统一清理');ok(!page.$('login-email-form').hidden,'退出后恢复邮箱登录表单');
  }finally{page.close();}
  page=open({mode:'cloud',gate:false});try{
    page.submit('login-email-form');await tick();ok(!page.calls.includes('init')&&!page.calls.includes('signIn')&&page.assigned.length===0,'缺少守卫时邮箱流程不发起请求或跳转');
    const event=new page.dom.window.MouseEvent('click',{bubbles:true,cancelable:true});page.$('login-cloud-continue').dispatchEvent(event);ok(event.defaultPrevented,'缺少守卫时禁止已有会话继续入口');
  }finally{page.close();}
  page=open({mode:'cloud',provider:'cloudbase',query:'?mode=recovery'});try{
    await tick();ok(page.$('login-password-label').textContent==='密码','CloudBase不从旧隐式recovery链接虚构会话');
    page.dom.window.document.querySelector('[data-auth-mode="signup"]').click();page.$('login-email').value='qa@example.test';page.$('login-password').value='password123';page.$('login-confirm').value='password123';page.submit('login-email-form');await tick();
    ok(page.calls.includes('signUp')&&!page.$('login-otp-field').hidden&&page.$('login-password-field').hidden,'注册发码后显示验证码并隐藏原密码');
    ok(!page.assigned.length&&page.$('login-password').value===''&&page.$('login-confirm').value==='','仅发码不跳转，清空密码输入');
    ok(page.$('login-otp').autocomplete==='one-time-code'&&page.$('login-email').readOnly,'验证码允许自动填充且锁定本次邮箱');
    page.$('login-otp').value='123456';page.submit('login-email-form');await tick();
    ok(page.verificationCalls[0].token==='123456'&&page.verificationCalls[0].secret===undefined&&page.assigned.length===1,'注册确认只传验证码，确认会话后跳转');
  }finally{page.close();}
  page=open({mode:'cloud',provider:'cloudbase'});try{
    await tick();page.dom.window.document.querySelector('[data-auth-mode="forgot"]').click();page.$('login-email').value='qa@example.test';page.submit('login-email-form');await tick();
    ok(!page.$('login-otp-field').hidden&&!page.$('login-password-field').hidden&&!page.$('login-confirm-field').hidden,'找回发码后显示验证码与两次新密码');
    page.$('login-otp').value='654321';page.$('login-password').value='newpassword123';page.$('login-confirm').value='newpassword123';page.submit('login-email-form');await tick();
    ok(page.verificationCalls[0].token==='654321'&&page.verificationCalls[0].secret==='newpassword123','重置提交验证码和新密码');
    ok(page.$('login-password').value===''&&page.$('login-confirm').value==='','重置完成清除密码字段');
  }finally{page.close();}
  page=open({mode:'cloud',provider:'cloudbase'});try{
    await tick();page.dom.window.document.querySelector('[data-auth-mode="forgot"]').click();page.$('login-email').value='qa@example.test';page.submit('login-email-form');await tick();
    const cancellations=page.cancellations;page.$('login-otp-cancel').click();ok(page.$('login-otp-field').hidden&&page.cancellations>cancellations&&!page.$('login-email').readOnly,'重新填写邮箱会取消内存验证码步骤');
    page.submit('login-email-form');await tick();page.authEvent('VERIFICATION_EXPIRED');ok(page.$('login-otp-field').hidden&&page.$('login-cloud-error').textContent.includes('超时'),'过期反馈并恢复发码步骤');
    page.submit('login-email-form');await tick();page.dom.window.document.querySelector('[data-auth-mode="signin"]').click();ok(page.$('login-otp-field').hidden&&page.$('login-otp').value==='','切换账号操作模式清除验证码');
  }finally{page.close();}
  console.log('PASS login gate client: '+checks+' assertions; local contract only; zero real cloud requests.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
