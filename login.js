"use strict";
(() => {
  const api = window.EGG_SPACE;
  const form = document.getElementById('login-demo-form');
  const input = document.getElementById('login-nickname');
  const error = document.getElementById('login-error');
  const warning = document.getElementById('login-storage-warning');
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  function selectTab(tab) {
    if (!tab || tab.disabled) tab = tabs.find(node => !node.disabled);
    if (!tab) return;
    tabs.forEach(node => {
      const selected = node === tab;
      node.setAttribute('aria-selected', String(selected));
      node.tabIndex = selected ? 0 : -1;
      document.getElementById(node.getAttribute('aria-controls')).hidden = !selected;
    });
  }
  tabs.forEach(tab => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const enabled = tabs.filter(node => !node.disabled), index = enabled.indexOf(tab);
      const next = event.key === 'Home' ? enabled[0] : event.key === 'End' ? enabled.at(-1) : enabled[(index + (event.key === 'ArrowRight' ? 1 : enabled.length - 1)) % enabled.length];
      selectTab(next); next?.focus();
    });
  });
  const cloud = window.EGG_CLOUD, state = cloud?.status();
  const demoAllowed = state?.mode === 'local' && typeof window.EGG_ACCESS?.enterDemoSession === 'function';
  document.getElementById('login-demo-tab').disabled = !demoAllowed;
  document.getElementById('login-demo-tab').setAttribute('aria-disabled', String(!demoAllowed));
  form.querySelectorAll('input,button').forEach(node => { node.disabled = !demoAllowed; });
  selectTab(tabs.find(node => node.getAttribute('aria-selected') === 'true'));
  if (!demoAllowed) error.textContent = state?.mode === 'cloud' ? '本站已启用邮箱账号，请使用邮箱登录。' : state?.mode === 'error' ? state.message : '登录校验组件未能加载，请刷新后再试。';
  if (!api) {
    form.querySelector('button').disabled = true;
    error.textContent = '体验入口暂时无法加载，请刷新后再试。';
    return;
  }
  input.value = api.getState().nickname;
  function showStorage(state) {
    warning.hidden = state.storageMode === 'persistent';
    warning.textContent = state.storageMessage;
  }
  showStorage(api.getState());
  input.addEventListener('input', () => { error.textContent = ''; input.removeAttribute('aria-invalid'); });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (cloud?.status().mode !== 'local' || typeof window.EGG_ACCESS?.enterDemoSession !== 'function' || typeof cloud?.safeNext !== 'function') {
      error.textContent = '本机体验入口不可用，请检查登录配置或刷新后再试。'; return;
    }
    const result = api.enterDemo(input.value);
    const state = api.getState();
    showStorage(state);
    if (!result.ok) {
      error.textContent = result.message;
      input.setAttribute('aria-invalid', 'true'); input.focus(); return;
    }
    if (state.storageMode !== 'persistent') {
      error.textContent = '本浏览器未能保存体验状态，暂时无法继续登录。请允许本地存储后再试。';
      return;
    }
    try {
      const session = window.EGG_ACCESS.enterDemoSession();
      if (!session?.ok) { error.textContent = session?.message || '体验会话未能建立，请刷新后再试。'; return; }
    } catch (issue) { error.textContent = issue.message || '体验会话未能建立，请刷新后再试。'; return; }
    const next = new URLSearchParams(location.search).get('next');
    location.assign(cloud.safeNext(next));
  });
})();

(() => {
  const cloud=window.EGG_CLOUD,$=id=>document.getElementById(id),form=$('login-email-form');
  if(!cloud||!form)return;
  const query=new URLSearchParams(location.search),buttons=[...document.querySelectorAll('[data-auth-mode]')];
  const isCloudbase=()=>cloud.status().provider==='cloudbase';
  let mode=!isCloudbase()&&query.get('mode')==='recovery'?'update':'signin',busy=false,verification=null,lastUserId=cloud.status().user?.id;
  const destination=()=>cloud.safeNext(query.get('next'));
  const hasGate=()=>typeof window.EGG_ACCESS?.logout==='function';
  const titles={signin:'登录',signup:'注册并发送确认邮件',forgot:'发送找回邮件',update:'保存新密码'};
  function showError(error){$('login-cloud-error').textContent=error?.message||String(error);$('login-cloud-result').textContent='';}
  function cancelVerification(){cloud.cancelVerification?.();verification=null;$('login-otp').value='';$('login-password').value='';$('login-confirm').value='';}
  function setMode(value){
    if(busy)return;cancelVerification();mode=value==='update'&&isCloudbase()?'forgot':value;
    if(mode==='forgot'&&isCloudbase()&&cloud.status().user?.email)$('login-email').value=cloud.status().user.email;
    buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.authMode===mode)));
    $('login-email-field').hidden=mode==='update';$('login-password-field').hidden=mode==='forgot';$('login-confirm-field').hidden=!['signup','update'].includes(mode);
    $('login-password').autocomplete=mode==='signin'?'current-password':'new-password';$('login-password-label').textContent=mode==='update'?'新密码':'密码';
    $('login-auth-submit').textContent=titles[mode];$('login-cloud-error').textContent='';$('login-cloud-result').textContent='';
    $('login-password').value='';$('login-confirm').value='';render();
  }
  function render(){
    const state=cloud.status(),hasUser=Boolean(state.user),resetting=verification?.kind==='reset',editing=mode==='update'||mode==='forgot'&&isCloudbase();
    if(state.mode!=='local'){
      $('login-title').textContent=hasUser&&!editing&&!verification?'欢迎回来':({signin:'欢迎回来',signup:'创建账号',forgot:'找回密码',update:'设置新密码'}[mode]||'邮箱登录');
      $('login-intro-help').textContent=verification?'填写邮箱中的验证码，完成验证。':hasUser&&!editing?'继续查看你的课程与学习记录。':({signin:'登录后，继续上次的学习。',signup:'验证邮箱后，即可保存学习进度。',forgot:'通过邮箱验证码重新设置密码。',update:'设置密码后，继续学习。'}[mode]||'使用邮箱账号保存学习进度。');
    }
    $('login-email-field').hidden=mode==='update';$('login-email').readOnly=Boolean(verification);
    $('login-password-field').hidden=verification?.kind==='signup'||mode==='forgot'&&!resetting;
    $('login-confirm-field').hidden=!(resetting||!verification&&['signup','update'].includes(mode));
    $('login-otp-field').hidden=!verification;$('login-otp-actions').hidden=!verification;
    $('login-password').autocomplete=mode==='signin'?'current-password':'new-password';$('login-password-label').textContent=editing?'新密码':'密码';
    buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.authMode===mode)));
    if(!busy)$('login-auth-submit').textContent=verification?resetting?'确认验证码并设置密码':'确认验证码':isCloudbase()?({signin:'登录',signup:'发送注册验证码',forgot:'发送重置验证码'}[mode]||titles[mode]):titles[mode];
    $('login-email-form').hidden=state.mode==='local'||hasUser&&!editing&&!verification;
    $('login-cloud-session').hidden=!hasUser;
    $('login-current-email').textContent=state.user?.email||'';
    $('login-cloud-continue').href=destination();
    document.querySelector('.login-email-fields').disabled=!state.configured||!hasGate()||busy;
    buttons.forEach(button=>{button.disabled=!state.configured||!hasGate()||busy;button.hidden=mode==='signin'?button.dataset.authMode==='signin':button.dataset.authMode!=='signin';});
    document.querySelector('[aria-label="邮箱账号操作"]').hidden=state.mode==='local'||hasUser&&!editing&&!verification;
    $('login-cloud-signout').disabled=!hasGate()||busy;$('login-change-password').disabled=!hasGate()||busy;
    $('login-cloud-continue').setAttribute('aria-disabled',String(!hasGate()));
  }
  buttons.forEach(button=>button.addEventListener('click',()=>setMode(button.dataset.authMode)));
  $('login-change-password').addEventListener('click',()=>setMode('update'));
  $('login-otp-cancel').addEventListener('click',()=>{if(!busy){cancelVerification();render();$('login-email').focus();}});
  $('login-email').addEventListener('input',()=>{if(verification&&!busy){cancelVerification();render();}});
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(busy)return;
    const action=mode,address=$('login-email').value,secret=$('login-password').value,challenge=verification;
    if((challenge?challenge.kind==='reset':['signup','update'].includes(action))&&secret!==$('login-confirm').value){showError(new Error('两次输入的密码不一致。'));$('login-confirm').focus();return;}
    busy=true;render();$('login-auth-submit').textContent='正在处理…';$('login-cloud-error').textContent='';$('login-cloud-result').textContent='';
    try{
      if(!hasGate())throw new Error('登录校验组件未能加载，请刷新后再试。');
      if(challenge){
        await cloud.verifyEmail($('login-otp').value,challenge.kind==='reset'?secret:undefined);verification=null;$('login-otp').value='';mode='signin';
        $('login-cloud-result').textContent=challenge.kind==='reset'?'验证码已确认，密码已重置。':'邮箱验证已完成。';location.assign(destination());
      }else if(action==='signin'){await cloud.signIn(address,secret);location.assign(destination());}
      else if(action==='signup'){
        const data=await cloud.signUp(address,secret,destination());
        if(data.verificationRequired){verification={kind:'signup'};$('login-cloud-result').textContent='验证码已发送，请检查收件箱与垃圾箱，并在此页填写验证码。';}
        else if(data.session){$('login-cloud-result').textContent='账号服务已返回登录会话，可以进入云端账号。';}
        else $('login-cloud-result').textContent='请求已由账号服务处理。请检查邮箱确认邮件；确认邮箱后再登录。若账号已存在，可直接登录或找回密码。';
      }else if(action==='forgot'){
        const data=await cloud.requestPasswordReset(address,destination());
        if(data.verificationRequired){verification={kind:'reset'};$('login-cloud-result').textContent='验证码已发送，请在此页填写验证码和新密码。';}
        else $('login-cloud-result').textContent='账号服务已接受请求。若该邮箱可接收找回邮件，请检查收件箱与垃圾箱，并通过邮件链接设置新密码。';
      }else{
        await cloud.updatePassword(secret);mode='signin';$('login-cloud-result').textContent='账号服务已确认密码更新。可以继续进入云端账号。';
      }
    }catch(error){showError(error);}finally{
      $('login-password').value='';$('login-confirm').value='';busy=false;render();if(verification)$('login-otp').focus();
    }
  });
  $('login-cloud-signout').addEventListener('click',async()=>{
    if(busy)return;busy=true;render();
    try{if(!hasGate())throw new Error('登录校验组件未能加载，请刷新后再试。');cancelVerification();await window.EGG_ACCESS.logout();mode='signin';$('login-cloud-result').textContent='已退出当前登录。';}
    catch(error){showError(error);}finally{busy=false;render();}
  });
  $('login-cloud-continue').addEventListener('click',event=>{
    if(!hasGate()){event.preventDefault();showError(new Error('登录校验组件未能加载，请刷新后再试。'));}
  });
  cloud.subscribe(state=>{
    if(state.event==='VERIFICATION_EXPIRED'){cancelVerification();showError(new Error('验证码步骤已超时，请重新发送。'));}
    if(lastUserId&&lastUserId!==state.user?.id||state.event==='SIGNED_OUT')cancelVerification();lastUserId=state.user?.id;
    if(!isCloudbase()&&state.event==='PASSWORD_RECOVERY')setMode('update');render();
  });
  window.addEventListener?.('pagehide',cancelVerification);
  const state=cloud.status();
  $('login-cloud-entry').hidden=state.mode!=='local';
  $('login-cloud-notice').hidden=state.mode!=='error';
  $('login-cloud-heading').textContent=state.mode==='local'?'邮箱账号请使用腾讯云测试站':state.mode==='error'?'云端配置需要修正':'使用真实邮箱账号';
  $('login-cloud-description').textContent=state.mode==='local'?'使用上方“前往邮箱登录测试站”入口。本机体验的学习记录只保存在当前浏览器。':state.message;
  if(state.mode==='local')$('login-cloud-help').textContent='两个站点的记录分开保存，已有本机记录不会自动上传到邮箱账号。';
  if(isCloudbase())$('login-cloud-help').textContent='邮箱验证码确认后可同步学习记录。教程投稿暂未开放，本机记录不会自动上传。';
  setMode(mode);
  if(!hasGate())showError(new Error('登录校验组件未能加载，请刷新后再试。'));
  if(state.configured&&hasGate()){
    document.getElementById('login-email-tab').click();
    const callbackError=new URLSearchParams(location.hash.slice(1)).get('error_description')||query.get('error_description');
    if(callbackError)showError(new Error('邮箱回跳未完成：'+callbackError));
    cloud.init().then(async()=>{
      const session=await cloud.getSession();
      if(!isCloudbase()&&session&&query.get('mode')==='confirm')$('login-cloud-result').textContent='邮箱回跳会话已恢复，可以进入云端账号。';
      if(mode==='update'&&!session)showError(new Error('当前没有有效的找回会话，请重新发送邮件并通过最新链接回来。'));
      render();
    }).catch(error=>{showError(error);$('login-cloud-heading').textContent='暂时无法连接账号服务';});
  }
})();
