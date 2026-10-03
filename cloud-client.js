"use strict";
(() => {
  const SDK = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.4/dist/umd/supabase.js';
  const CLOUDBASE_SDK = 'https://static.cloudbase.net/cloudbase-js-sdk/3.10.1/cloudbase.full.js';
  const UUID = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/;
  const MAX_IMAGE = 2 * 1024 * 1024, MAX_IMAGES = 8 * 1024 * 1024;
  const categories = ['match3','progression','inventory','parkour','racing','survival','puzzle','simulation','other'];
  const fields = {title:60,summary:300,preparation:1000,validation:1500,tips:1000};
  const subscribers = new Set();
  let clientPromise, currentUser = null, recovery = false, accountGeneration = 0, pendingVerification = null, verificationGeneration = 0;
  const fail = (message, code = 'INVALID_INPUT') => Object.assign(new Error(message), {code});
  const count = text => Array.from(text).length;
  function publicJWT(key) {
    if(typeof key!=='string'||! /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(key))return null;
    try {const payload=key.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');return JSON.parse(atob(payload.padEnd(Math.ceil(payload.length/4)*4,'=')));}catch{return null;}
  }
  function configuration() {
    const pg=window.EGGCODE_CLOUDBASE_CONFIG;
    if(pg&&typeof pg==='object'&&(pg.env!==''&&pg.env!==undefined||pg.publishableKey!==''&&pg.publishableKey!==undefined||pg.region!==undefined&&pg.region!=='ap-shanghai')) {
      const {env,region='ap-shanghai',publishableKey:key}=pg,jwt=publicJWT(key);
      if(typeof env!=='string'||! /^[a-z0-9][a-z0-9-]{2,127}$/.test(env)||region!=='ap-shanghai'||!jwt||jwt.role!=='anon'||jwt.aud!==env||jwt.meta?.platform!=='PublishableKey')return {configured:false,mode:'error',provider:'cloudbase',message:'CloudBase 配置无效：请填写上海 PG 环境 ID 和该环境的公开 Publishable Key。'};
      return {configured:true,mode:'cloud',provider:'cloudbase',env,region,key,message:'CloudBase 学习账号已填写配置；登录、邮件与用户权限仍待真实环境验收，投稿暂未开放。'};
    }
    if(pg!==undefined&&(!pg||typeof pg!=='object'||Array.isArray(pg)))return {configured:false,mode:'error',provider:'cloudbase',message:'CloudBase 配置格式无效，请使用环境 ID、地域和公开 Publishable Key。'};
    const value = window.EGGCODE_SUPABASE_CONFIG || {}, url = value.url, key = value.publishableKey;
    if ((!url || url === '') && (!key || key === '')) return {configured:false,mode:'local',message:'云端服务未配置。可以使用本机体验，记录不会跨设备同步。'};
    try {
      const parsed = new URL(url);
      if (typeof url !== 'string' || parsed.protocol !== 'https:' || !/^[a-z0-9-]+\.supabase\.co$/.test(parsed.hostname) || parsed.port || parsed.username || parsed.password || parsed.pathname !== '/' || parsed.search || parsed.hash || typeof key !== 'string') throw 0;
      let publicKey = /^sb_publishable_[A-Za-z0-9_-]{20,}$/.test(key);
      if (!publicKey && /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(key)) {
        const payload = key.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');
        publicKey = JSON.parse(atob(payload.padEnd(Math.ceil(payload.length/4)*4,'='))).role === 'anon';
      }
      if (!publicKey) throw 0;
      return {configured:true,mode:'cloud',provider:'supabase',message:'已填写兼容 Supabase 配置；连接、邮件与权限仍需在真实项目验收。',url:parsed.origin,key};
    } catch { return {configured:false,mode:'error',message:'云端配置无效：请填写 HTTPS Project URL 和公开 publishable/anon key，禁止使用 secret 或 service_role。'}; }
  }
  function status() {
    const {url,key,...state} = configuration();
    return {...state,user:currentUser ? {id:currentUser.id,email:currentUser.email || ''} : null,recovery};
  }
  const cloudbaseMode=()=>configuration().provider==='cloudbase';
  function cancelVerification(){verificationGeneration++;if(pendingVerification)clearTimeout(pendingVerification.timer);pendingVerification=null;}
  function expectAccount(user,generation){if(generation!==accountGeneration||currentUser?.id!==user.id)throw fail('操作期间账号已变化，请重新读取当前账号记录。','ACCOUNT_CHANGED');}
  function submissionsReady(){if(cloudbaseMode())throw fail('CloudBase 当前仅开放学习记录，教程投稿和配图服务尚未完成真实权限验收。','FEATURE_NOT_READY');}
  function safeNext(value, defaultFile = 'index.html') {
    const fallback = new URL(['index.html','personal-space.html','cloud-account.html'].includes(defaultFile) ? defaultFile : 'index.html', location.href);
    const files = ['index.html','courses.html','practice.html','manual.html','block.html','lesson.html','learning-path.html','big-number-lab.html','verification.html','editor-guide.html','personal-space.html','contribute.html','community.html','community-tutorial.html','works.html','messages.html','admin.html','cloud-account.html','service-info.html'];
    try {
      const next = new URL(value || fallback.href, location.href);
      const paths = files.map(file => new URL(file,location.href).pathname);
      const raw = next.searchParams.get('id');
      if (next.origin !== location.origin || next.username || next.password || !paths.includes(next.pathname)) return fallback.href;
      if (next.pathname === new URL('lesson.html',location.href).pathname && (!/^\d+$/.test(raw || '') || !Number.isSafeInteger(Number(raw)) || Number(raw) >= 145)) return fallback.href;
      return next.href;
    } catch { return fallback.href; }
  }
  function callbackURL(mode, next) {
    const url = new URL('login.html',location.href);
    url.searchParams.set('mode',mode);
    url.searchParams.set('next',safeNext(next));
    return url.href;
  }
  function publish(event) {
    const detail = {...status(),event};
    // Auth 回调内不发起别的 Supabase 请求，避免持有会话锁时互相等待。
    setTimeout(() => {
      subscribers.forEach(fn => fn(detail));
      window.dispatchEvent(new CustomEvent('eggcode-cloud-auth',{detail}));
    },0);
  }
  function sdk(config) {
    return new Promise((resolve,reject) => {
      const script = document.createElement('script');
      const timer = setTimeout(() => finish(fail('登录组件加载超时，请检查网络后重试。','SDK_LOAD_FAILED')),20000);
      function finish(error) { clearTimeout(timer); if (error) {script.remove(); reject(error);} else resolve(); }
      script.src = config.provider==='cloudbase'?CLOUDBASE_SDK:SDK;
      // CloudBase 官方经典脚本未返回 ACAO；强制 CORS 会在执行前阻断加载。
      if(config.provider!=='cloudbase')script.crossOrigin='anonymous';script.referrerPolicy='no-referrer';
      script.onload = () => (config.provider==='cloudbase'?window.cloudbase?.init:window.supabase?.createClient) ? finish() : finish(fail('登录组件未能完整加载。','SDK_LOAD_FAILED'));
      script.onerror = () => finish(fail('登录组件加载失败，请检查网络后重试。','SDK_LOAD_FAILED'));
      document.head.append(script);
    });
  }
  async function client() {
    const config = configuration();
    if (!config.configured) throw fail(config.message,config.mode === 'error' ? 'CONFIG_INVALID' : 'NOT_CONFIGURED');
    if (!clientPromise) clientPromise = (async () => {
      await sdk(config);
      let instance;
      if(config.provider==='cloudbase'){
        const app=window.cloudbase.init({env:config.env,region:config.region,accessKey:config.key,persistence:'local',auth:{detectSessionInUrl:false}}),db=app.rdb();
        instance={auth:app.auth,from:db.from.bind(db),rpc:db.rpc.bind(db),storage:app.storage};
      }else instance=window.supabase.createClient(config.url,config.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'implicit'}});
      instance.auth.onAuthStateChange((event,session,info) => {
        if(info?.error){publish('AUTH_ERROR');return;}
        const previous = currentUser?.id;
        currentUser = session?.user || null;
        if(previous!==currentUser?.id)accountGeneration++;
        if(event==='SIGNED_OUT'||previous&&previous!==currentUser?.id)cancelVerification();
        if (event === 'PASSWORD_RECOVERY') recovery = true;
        else if (event === 'SIGNED_OUT' || previous && previous !== currentUser?.id) recovery = false;
        publish(event);
      });
      const generation=accountGeneration,{data,error} = await instance.auth.getSession();
      if (error) throw error;
      if(generation===accountGeneration)currentUser = data?.session?.user || null;
      return instance;
    })().catch(error => { clientPromise = null; throw error; });
    return clientPromise;
  }
  async function getSession() { const c = await client(), {data,error} = await c.auth.getSession(); if(error) throw error; return data?.session || null; }
  async function requireUser() {
    const c = await client(), generation = accountGeneration;
    let sessionUserId;
    if(cloudbaseMode()){
      const session=await getSession();
      if(generation!==accountGeneration)throw fail('核验账号期间会话已变化，请重新确认当前账号。','ACCOUNT_CHANGED');
      if(!session?.user||session.user.is_anonymous)throw fail('请先使用真实邮箱账号登录。','AUTH_REQUIRED');
      sessionUserId=session.user.id;
    }
    // CloudBase getUser 内部会吞掉刷新错误；refreshUser 直接刷新服务端用户并透传失败。
    const {data,error}=await (cloudbaseMode()?c.auth.refreshUser():c.auth.getUser());
    if(generation!==accountGeneration)throw fail('核验账号期间会话已变化，请重新确认当前账号。','ACCOUNT_CHANGED');
    if (error) throw error;
    if (!data?.user || data.user.is_anonymous || (cloudbaseMode()?typeof data.user.id!=='string'||!data.user.id.length||count(data.user.id)>255:!UUID.test(data.user.id))) throw fail('请先使用真实邮箱账号登录。','AUTH_REQUIRED');
    if(cloudbaseMode()&&data.user.id!==sessionUserId)throw fail('核验账号期间会话身份已变化，请重新确认当前账号。','ACCOUNT_CHANGED');
    if(cloudbaseMode()&&(!data.session?.user||data.session.user.id!==data.user.id||data.session.user.is_anonymous))throw fail('账号服务没有返回有效的用户会话。','AUTH_REQUIRED');
    if(currentUser&&currentUser.id!==data.user.id)throw fail('当前账号与返回结果不一致，请重新登录。','ACCOUNT_CHANGED');
    currentUser = data.user;
    return data.user;
  }
  function lessonId(id) { if(!Number.isInteger(id) || id<0 || id>144) throw fail('课程编号必须是 0～144 的整数。'); return id; }
  function email(value) { if(typeof value!=='string' || value.length>254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) throw fail('请填写有效邮箱地址。'); return value.trim(); }
  function password(value) { if(typeof value!=='string' || value.length<8 || value.length>128) throw fail('密码需要 8～128 个字符；正式项目的更强规则仍由账号服务校验。'); return value; }
  async function signUp(address,secret,next) {
    if(cloudbaseMode())return startVerification('signup',email(address),password(secret));
    const credentials = {email:email(address),password:password(secret),options:{emailRedirectTo:callbackURL('confirm',next)}};
    const {data,error} = await (await client()).auth.signUp(credentials); if(error) throw error; return data;
  }
  async function signIn(address,secret) {
    cancelVerification();
    const credentials = {email:email(address),password:password(secret)};
    const {data,error} = await (await client()).auth.signInWithPassword(credentials); if(error) throw error;
    if(!data.session) throw fail('账号服务没有返回登录会话，登录未完成。','AUTH_REQUIRED');
    return data;
  }
  async function requestPasswordReset(address,next) {
    if(cloudbaseMode())return startVerification('reset',email(address));
    const value = email(address), {error} = await (await client()).auth.resetPasswordForEmail(value,{redirectTo:callbackURL('recovery',next)});
    if(error) throw error; return {requested:true};
  }
  async function updatePassword(secret) {
    if(cloudbaseMode())throw fail('请通过邮箱验证码完成密码重置。','VERIFICATION_REQUIRED');
    const value=password(secret); await requireUser();
    const {data,error} = await (await client()).auth.updateUser({password:value}); if(error) throw error;
    recovery=false; return data;
  }
  async function startVerification(kind,address,secret){
    cancelVerification();const generation=verificationGeneration,c=await client();
    const {data,error}=await (kind==='signup'?c.auth.signUp({email:address,password:secret}):c.auth.resetPasswordForEmail(address));
    if(generation!==verificationGeneration)throw fail('验证码请求已取消，请重新发送。','VERIFICATION_CANCELLED');if(error)throw error;
    const verify=kind==='signup'?data?.verifyOtp:data?.updateUser;
    if(typeof verify!=='function')throw fail('账号服务未返回验证码确认步骤。','UNKNOWN_RESULT');
    pendingVerification={kind,verify,expiresAt:Date.now()+600000,timer:setTimeout(()=>{cancelVerification();publish('VERIFICATION_EXPIRED');},600000)};
    return {verificationRequired:true,kind,email:address};
  }
  async function verifyEmail(token,secret){
    if(typeof token!=='string'||! /^[A-Za-z0-9-]{1,64}$/.test(token.trim()))throw fail('请填写邮件中的验证码。');
    const pending=pendingVerification,generation=verificationGeneration;
    if(!pending||pending.expiresAt<=Date.now()){cancelVerification();throw fail('验证码步骤已取消或超时，请重新发送。','VERIFICATION_EXPIRED');}
    const params=pending.kind==='signup'?{token:token.trim()}:{nonce:token.trim(),password:password(secret)};
    const {data,error}=await pending.verify(params);
    if(generation!==verificationGeneration)throw fail('验证码步骤已取消，请重新登录。','VERIFICATION_CANCELLED');if(error)throw error;
    if(!data?.session?.user||data.session.user.is_anonymous)throw fail('验证后没有有效登录会话，请重新登录。','AUTH_REQUIRED');
    cancelVerification();return data;
  }
  async function signOut() {cancelVerification();const {error}=await (await client()).auth.signOut(cloudbaseMode()?undefined:{scope:'local'});if(error)throw error;if(currentUser)accountGeneration++;currentUser=null;recovery=false;}
  async function loadStudyState() {
    const user=await requireUser(),generation=accountGeneration,c=await client();
    expectAccount(user,generation);
    const queries = [c.from('profiles').select('nickname,last_lesson_id,updated_at').eq('user_id',user.id).maybeSingle(), c.from('lesson_progress').select('lesson_id,completed,revision,updated_at').eq('user_id',user.id), c.from('favorites').select('lesson_id,created_at').eq('user_id',user.id), c.from('lesson_notes').select('lesson_id,content,updated_at').eq('user_id',user.id)];
    const results=await Promise.all(queries); for(const result of results) if(result.error) throw result.error;
    expectAccount(user,generation);
    return {userId:user.id,profile:results[0].data,progress:results[1].data,favorites:results[2].data,notes:results[3].data};
  }
  async function saveProfile(nickname,lastLessonId) {
    return saveProfilePatch({nickname,last_lesson_id:lastLessonId});
  }
  async function saveProfilePatch(value) {
    if(!value||typeof value!=='object'||Array.isArray(value)||!Object.keys(value).length||Object.keys(value).some(key=>!['nickname','last_lesson_id'].includes(key)))throw fail('资料修改字段无效。');
    if(Object.hasOwn(value,'nickname')&&(typeof value.nickname!=='string'||count(value.nickname)>20))throw fail('昵称最多 20 个字符。');
    if(Object.hasOwn(value,'last_lesson_id'))lessonId(value.last_lesson_id);
    const patch={...value},user=await requireUser(),generation=accountGeneration,c=await client();
    expectAccount(user,generation);
    const existing=await c.from('profiles').select('user_id').eq('user_id',user.id).maybeSingle(); if(existing.error) throw existing.error;
    expectAccount(user,generation);
    const result=existing.data ? await c.from('profiles').update(patch).eq('user_id',user.id) : await c.from('profiles').insert({user_id:user.id,nickname:'',last_lesson_id:0,...patch});
    if(result.error)throw result.error;expectAccount(user,generation);
    const saved=await c.from('profiles').select('nickname,last_lesson_id,updated_at').eq('user_id',user.id).single();if(saved.error)throw saved.error;expectAccount(user,generation);return saved.data;
  }
  async function saveProgress(id,completed,expectedRevision) {
    lessonId(id); if(typeof completed!=='boolean'||!Number.isInteger(expectedRevision)||expectedRevision<0||expectedRevision>=2147483647) throw fail('完成状态或预期版本无效。');
    const user=await requireUser(),generation=accountGeneration,c=await client(),params={p_lesson_id:id,p_completed:completed,p_expected_revision:expectedRevision};
    if(cloudbaseMode())params.p_expected_user_id=user.id;
    expectAccount(user,generation);
    const {data,error}=await c.rpc('save_lesson_progress',params);expectAccount(user,generation);
    if(error) throw error; if(!Array.isArray(data)||data.length!==1||typeof data[0].applied!=='boolean') throw fail('进度保存没有返回有效结果，请重新读取核对。','UNKNOWN_RESULT');
    return data[0]; // applied=false 是冲突；调用方保留本机修改，不自动重试。
  }
  async function saveFavorite(id,selected) {
    lessonId(id); if(typeof selected!=='boolean') throw fail('收藏状态无效。');
    if(!selected){await deleteStudyRecord('favorites',id);return {selected:false};}
    const user=await requireUser(),generation=accountGeneration,c=await client();expectAccount(user,generation);
    const exists=await c.from('favorites').select('lesson_id').eq('user_id',user.id).eq('lesson_id',id).maybeSingle(); if(exists.error) throw exists.error;
    expectAccount(user,generation);
    if(!exists.data) {const {error}=await c.from('favorites').insert({user_id:user.id,lesson_id:id}); if(error) throw error;}
    expectAccount(user,generation);
    return {selected:true};
  }
  async function saveNote(id,content) {
    lessonId(id); if(typeof content!=='string'||count(content)>2000) throw fail('笔记最多 2000 个字符。');
    const user=await requireUser(),generation=accountGeneration,c=await client(),where=()=>c.from('lesson_notes').select('lesson_id').eq('user_id',user.id).eq('lesson_id',id).maybeSingle();
    expectAccount(user,generation);
    const exists=await where(); if(exists.error) throw exists.error;
    // ponytail: 沿用 schema 的最后写入规则；多设备合并需增加笔记版本 RPC。
    expectAccount(user,generation);
    const result=exists.data ? await c.from('lesson_notes').update({content}).eq('user_id',user.id).eq('lesson_id',id) : await c.from('lesson_notes').insert({user_id:user.id,lesson_id:id,content});
    if(result.error)throw result.error;expectAccount(user,generation);
    const saved=await c.from('lesson_notes').select('lesson_id,content,updated_at').eq('user_id',user.id).eq('lesson_id',id).single();if(saved.error)throw saved.error;expectAccount(user,generation);return saved.data;
  }
  async function deleteStudyRecord(table,id) {
    lessonId(id);const user=await requireUser(),generation=accountGeneration,c=await client();expectAccount(user,generation);
    const {error}=await c.from(table).delete().eq('user_id',user.id).eq('lesson_id',id);if(error)throw error;expectAccount(user,generation);
    const remaining=await c.from(table).select('lesson_id').eq('user_id',user.id).eq('lesson_id',id).maybeSingle();if(remaining.error)throw remaining.error;expectAccount(user,generation);
    // 读回零行也可能来自切换账号后的 RLS；再次核验服务端身份，才确认原账号记录消失。
    await requireUser();expectAccount(user,generation);
    if(remaining.data!==null)throw fail('删除后仍未确认记录消失，请重新读取核对。','UNKNOWN_RESULT');
    return {deleted:true,lesson_id:id};
  }
  function deleteNote(id) {return deleteStudyRecord('lesson_notes',id);}
  async function listSubmissions() {submissionsReady();const user=await requireUser(),{data,error}=await (await client()).from('tutorial_submissions').select('id,content,status,review_note,updated_at,created_at').eq('user_id',user.id).order('updated_at',{ascending:false});if(error)throw error;return data;}
  async function getSubmission(id) {submissionsReady();if(!UUID.test(id))throw fail('稿件编号无效。');const user=await requireUser(),{data,error}=await (await client()).from('tutorial_submissions').select('id,content,status,review_note,updated_at,created_at').eq('id',id).eq('user_id',user.id).single();if(error)throw error;return data;}
  function contentOf(record,complete=false) {
    if(!record||typeof record!=='object') throw fail('教程草稿无效。');
    const content={};
    for(const [field,max]of Object.entries(fields)) {if(typeof record[field]!=='string'||count(record[field])>max)throw fail('教程的'+field+'长度或类型无效。');content[field]=record[field];}
    for(const [field,values]of Object.entries({category:categories,difficulty:['beginner','intermediate','advanced'],testStatus:['not-tested','author-tested']})) {if(!values.includes(record[field]))throw fail('教程分类、难度或验证状态无效。');content[field]=record[field];}
    if(!Array.isArray(record.steps)||record.steps.length>12||complete&&record.steps.length<2)throw fail('完整投稿需要 2～12 个步骤。');
    content.steps=record.steps.map(step=>{if(!step||typeof step.title!=='string'||count(step.title)>80||typeof step.body!=='string'||count(step.body)>3000||complete&&(count(step.title.trim())<2||count(step.body.trim())<20))throw fail('步骤标题或说明不完整。');return {title:step.title,body:step.body,imagePath:null};});
    if(complete)for(const [field,min]of Object.entries({title:5,summary:20,preparation:10,validation:20}))if(count(content[field].trim())<min)throw fail('请补齐标题、简介、准备说明和试玩验证。');
    return content;
  }
  function sniff(bytes) {
    if([137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v))return'image/png';
    if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return'image/jpeg';
    if(String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP')return'image/webp';
    return null;
  }
  async function imageBlob(image) {
    if(!image||!['image/png','image/jpeg','image/webp'].includes(image.mime)||typeof image.dataUrl!=='string'||image.dataUrl.length>Math.ceil(MAX_IMAGE/3)*4+40)throw fail('只支持不超过 2 MiB 的 PNG/JPEG/WebP。');
    const prefix='data:'+image.mime+';base64,',encoded=image.dataUrl.slice(prefix.length);
    if(!image.dataUrl.startsWith(prefix)||!encoded.length||encoded.length%4||!/^[A-Za-z0-9+/]+={0,2}$/.test(encoded))throw fail('图片编码无效。');
    let bytes;try{bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));}catch{throw fail('图片编码无效。');}
    if(!bytes.length||bytes.length>MAX_IMAGE||image.size!==bytes.length||sniff(bytes)!==image.mime)throw fail('图片内容、大小和格式不一致。');
    const blob=new Blob([bytes],{type:image.mime}); let bitmap;
    try {bitmap=await createImageBitmap(blob);if(bitmap.width<1||bitmap.height<1||bitmap.width>8000||bitmap.height>8000||bitmap.width*bitmap.height>16000000)throw fail('图片尺寸超出限制。');}
    catch(error){throw fail(error.code==='INVALID_INPUT'?error.message:'图片无法解码，请重新选择有效图片。');}finally{bitmap?.close();}
    return blob;
  }
  async function uploadTutorial(record,{cloudDraft=null,onCheckpoint=()=>{},onProgress=()=>{},submit=true,expectedUserId=null}={}) {
    submissionsReady();
    const content=contentOf(record,submit),blobs=[];let total=0;
    for(let i=0;i<record.steps.length;i++){const image=record.steps[i].image;if(image){const blob=await imageBlob(image);total+=blob.size;if(total>MAX_IMAGES)throw fail('整篇配图合计不能超过 8 MiB。');blobs.push({i,blob,image});}}
    const user=await requireUser();
    if(expectedUserId!==null&&user.id!==expectedUserId)throw fail('上传期间账号已变化，请保留本机草稿并重新确认当前账号。','ACCOUNT_CHANGED');
    const c=await client();let checkpoint=cloudDraft ? structuredClone(cloudDraft) : null;
    try {
      if(checkpoint && (checkpoint.userId!==user.id||!UUID.test(checkpoint.id)||!checkpoint.updatedAt))throw fail('重试稿件不属于当前账号，请保留本机草稿并重新选择云端稿件。');
      let row;
      if(checkpoint){row=await getSubmission(checkpoint.id);if(!['draft','rejected'].includes(row.status))throw fail('稿件已提交或发布，不能继续覆盖。','NOT_EDITABLE');if(row.updated_at!==checkpoint.updatedAt)throw fail('另一页面已修改云端草稿，请先读取并比较。本机内容没有覆盖它。','CONFLICT');}
      else {const result=await c.from('tutorial_submissions').insert({user_id:user.id,content}).select('id,updated_at').single();if(result.error)throw result.error;row=result.data;checkpoint={userId:user.id,id:row.id,updatedAt:row.updated_at,images:{}};await onCheckpoint(structuredClone(checkpoint));}
      onProgress({phase:'images',completed:0,total:blobs.length,message:'开始上传配图'});
      let done=0;
      for(const {i,blob,image}of blobs){
        const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer()))).map(b=>b.toString(16).padStart(2,'0')).join('');
        const old=checkpoint.images?.[i],prefix=user.id+'/'+checkpoint.id+'/';let objectPath;
        if(old?.digest===digest&&typeof old.path==='string'&&old.path.startsWith(prefix)&&UUID.test(old.path.slice(prefix.length).split('.')[0]))objectPath=old.path;
        else {const ext={'image/png':'png','image/jpeg':'jpg','image/webp':'webp'}[image.mime];objectPath=prefix+crypto.randomUUID()+'.'+ext;const {error}=await c.storage.from('tutorial-drafts').upload(objectPath,blob,{contentType:image.mime,upsert:false,cacheControl:'3600'});if(error)throw error;checkpoint.images||={};checkpoint.images[i]={digest,path:objectPath};await onCheckpoint(structuredClone(checkpoint));}
        content.steps[i].imagePath=objectPath;onProgress({phase:'images',completed:++done,total:blobs.length,message:'配图已确认 '+done+'/'+blobs.length});
      }
      onProgress({phase:'saving',completed:done,total:blobs.length,message:'正在保存云端正文'});
      const saved=await c.from('tutorial_submissions').update({content}).eq('id',checkpoint.id).eq('user_id',user.id).eq('updated_at',checkpoint.updatedAt).select('id,updated_at,status').maybeSingle();
      if(saved.error)throw saved.error;if(!saved.data)throw fail('云端草稿已变化，当前本机稿没有覆盖它。','CONFLICT');
      checkpoint.updatedAt=saved.data.updated_at;await onCheckpoint(structuredClone(checkpoint));
      if(submit){onProgress({phase:'submitting',completed:done,total:blobs.length,message:'正在提交审核'});const {error}=await c.rpc('submit_tutorial',{p_id:checkpoint.id,p_expected_updated_at:checkpoint.updatedAt});if(error)throw error;}
      onProgress({phase:'done',completed:done,total:blobs.length,message:submit?'已提交云端审核':'云端草稿已保存'});
      return {submitted:submit,cloudDraft:checkpoint};
    } catch(error){error.cloudDraft=checkpoint;throw error;}
  }
  async function privateImageUrl(path) {
    submissionsReady();
    const user=await requireUser();if(typeof path!=='string'||!path.startsWith(user.id+'/')||!new RegExp('^'+user.id+'/[0-9a-f-]{36}/[0-9a-f-]{36}\\.(png|jpg|jpeg|webp)$').test(path))throw fail('私有图片路径无效。');
    const {data,error}=await(await client()).storage.from('tutorial-drafts').createSignedUrl(path,300);if(error)throw error;return data.signedUrl;
  }
  function subscribe(callback) {if(typeof callback!=='function')throw new TypeError('回调必须是函数。');subscribers.add(callback);return()=>subscribers.delete(callback);}
  window.EGG_CLOUD=Object.freeze({status,safeNext,init:client,client,getSession,requireUser,signUp,signIn,requestPasswordReset,updatePassword,verifyEmail,cancelVerification,signOut,loadStudyState,saveProfile,saveProfilePatch,saveProgress,saveFavorite,saveNote,deleteNote,listSubmissions,getSubmission,uploadTutorial,privateImageUrl,subscribe,validateContent:contentOf});
})();
