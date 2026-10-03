'use strict';
(() => {
  if(window.EGG_ACCESS)return;
  const KEY='eggcode-academy.login-gate.v1',space=window.EGG_SPACE,cloud=window.EGG_CLOUD;
  const root=document.documentElement,isLogin=location.pathname===new URL('login.html',location.href).pathname;
  let approved=false,sequence=0,leaving=false,activating=false;
  const fail=message=>({ok:false,message});
  function conceal(){approved=false;if(!isLogin)root.setAttribute('data-access-pending','');}
  function destination(){const page=location.pathname.split('/').pop()||'index.html';return page+location.search+location.hash;}
  function loginURL(){const url=new URL('login.html',location.href);if(!isLogin)url.searchParams.set('next',destination());return url;}
  function deny(){conceal();try{sessionStorage.removeItem(KEY);}catch{/* 存储不可用时仍保持页面锁定。 */}if(!isLogin&&!leaving){leaving=true;location.replace(loginURL().href);}}
  function localSession(){try{const state=space?.getState();return sessionStorage.getItem(KEY)==='demo'&&state?.active===true&&state.storageMode==='persistent';}catch{return false;}}
  function enterDemoSession(){
    if(!cloud||cloud.status().mode!=='local')return fail('当前网站需要使用邮箱账号登录。');
    const state=space?.getState();if(!state?.active||state.storageMode!=='persistent')return fail('体验状态未能保存，请允许浏览器存储后再登录。');
    try{sessionStorage.setItem(KEY,'demo');if(sessionStorage.getItem(KEY)!=='demo')throw new Error();return {ok:true,message:'体验登录已完成。'};}
    catch{return fail('浏览器无法保存本次登录，请允许会话存储后重试。');}
  }
  async function check(){
    if(isLogin||leaving)return;const current=++sequence;conceal();
    if(!cloud||!space){deny();return;}
    const status=cloud.status();
    if(status.mode==='local'){if(localSession()){approved=true;root.removeAttribute('data-access-pending');}else deny();return;}
    if(!status.configured){deny();return;}
    let timeout;
    try{
      const user=await Promise.race([cloud.requireUser(),new Promise((_,reject)=>{timeout=setTimeout(()=>reject(new Error('账号验证超时')),15000);})]);
      if(current!==sequence||leaving)return;
      if(!user?.id)throw new Error('账号验证没有完成');
      // 本机社区仍用同浏览器体验数据；激活界面不会上传或合并到云端账号。
      if(!space.getState().active){activating=true;try{space.enterDemo(space.getState().nickname);}finally{activating=false;}}
      approved=true;root.removeAttribute('data-access-pending');
    }catch{if(current===sequence)deny();}finally{clearTimeout(timeout);}
  }
  async function logout(){
    ++sequence;conceal();
    if(cloud?.status().configured){try{await cloud.signOut();}catch(error){if(!isLogin)check();throw error;}}
    try{sessionStorage.removeItem(KEY);}catch{/* 当前页仍保持锁定；体验状态同时退出。 */}
    space?.logout();if(!isLogin&&!leaving){leaving=true;location.replace(loginURL().href);}return {ok:true};
  }
  window.EGG_ACCESS=Object.freeze({enterDemoSession,logout,check,isAuthenticated:()=>approved,sessionKey:KEY});
  if(isLogin)return;
  space?.subscribe(()=>{if(!activating&&!leaving&&cloud?.status().mode==='local'){if(!localSession())deny();}});
  cloud?.subscribe(event=>{if(leaving)return;if(event.event==='SIGNED_OUT'){sequence++;deny();}else if(event.event==='SIGNED_IN'||event.event==='USER_UPDATED')check();});
  addEventListener('pageshow',event=>{if(event.persisted)check();});
  addEventListener('pagehide',()=>{++sequence;conceal();});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&!leaving)check();});
  document.addEventListener('click',event=>{const target=event.target.closest?.('[data-space-action="logout"]');if(!target)return;event.preventDefault();event.stopImmediatePropagation();target.disabled=true;logout().catch(error=>{target.disabled=false;alert(error.message||'退出没有完成，请重试。');});},true);
  check();
})();
