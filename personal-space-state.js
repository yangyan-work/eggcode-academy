"use strict";
// 页面共用的学习状态；本机体验与真实账号记录分别保存。
(() => {
  if (window.EGG_SPACE) return;
  const KEY = 'eggcode-academy.space-preview.v1';
  const PROGRESS_KEY = 'eggcode-academy.learning-progress';
  const VERSION = 1;
  const subscribers = new Set();
  const clone = value => JSON.parse(JSON.stringify(value));
  const validId = id => Number.isInteger(id) && id >= 0 && id <= 144;
  const length = value => Array.from(value).length;
  const validNickname = value => typeof value === 'string' && length(value.trim()) >= 1 && length(value.trim()) <= 20;
  const validFeedback = value => typeof value === 'string' && length(value.trim()) >= 10 && length(value.trim()) <= 1000;
  const feedbackTypes = new Set(['content', 'diagram', 'other']);
  const validTime = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value));
  const orderedIds = ids => [...new Set(ids)].sort((a, b) => a - b);
  const defaults = () => ({
    version: VERSION, active: false, nickname: '林间创作者',
    completed: Array.from({length: 12}, (_, id) => id), favorites: [12, 22, 40],
    notes: [{lessonId: 40, content: '背包新增物品类型后，要一起修改初始化长度、玩家跨度和索引公式。', updatedAt: new Date().toISOString()}],
    feedback: [], lastLesson: 12
  });
  let state = defaults();
  let storageMode = 'persistent';
  let storageIssue = null;
  let protectedRecord = false;
  let feedbackSequence = 0;
  let localLoaded = false, cloudSequence = 0, cloudLoadPromise = null, boundCloud = null;
  const emptyCloud = () => ({version:VERSION, mode:'cloud', active:false, ready:false, loading:false, saving:false,
    userId:null, email:'', nickname:'', completed:[], favorites:[], notes:[], feedback:[], lastLesson:null,
    revisions:{}, storageMode:'cloud', storageIssue:null, error:null});
  let cloudState = emptyCloud();
  const cloudMode = () => Boolean(window.EGG_CLOUD && window.EGG_CLOUD.status().mode !== 'local');
  function loadLocal() { if (!localLoaded) { localLoaded=true; acceptRead(read()); } }
  function clearCloud(message = '') {
    ++cloudSequence; cloudLoadPromise=null; cloudState=emptyCloud();
    notify({ok:false,message:message || '已清除上一账号的学习记录。'});
  }
  function bindCloud() {
    const cloud=window.EGG_CLOUD;
    if (!cloud || boundCloud===cloud) return;
    boundCloud=cloud;
    cloud.subscribe(event => {
      if (cloudState.userId && event.user?.id!==cloudState.userId) clearCloud('账号已变化，请重新读取学习记录。');
    });
  }
  const currentCloud = (userId, sequence) => cloudMode() && sequence===cloudSequence && cloudState.userId===userId && window.EGG_CLOUD.status().user?.id===userId;
  const accountChanged = () => ({ok:false,code:'ACCOUNT_CHANGED',message:'账号状态已变化，上一账号的结果没有应用。请重新读取记录。'});
  async function loadCloudUser(user, {refresh=false} = {}) {
    bindCloud();
    if (!cloudMode() || !window.EGG_CLOUD.status().configured || !user || typeof user.id!=='string' || !user.id) return fail('请先核验真实账号。');
    if (cloudState.userId===user.id) {
      if (cloudState.loading) return cloudLoadPromise;
      if (cloudState.saving) return fail('正在保存，请稍后重新读取。');
      if (cloudState.ready && !refresh) return {ok:true,message:'账号学习记录已就绪。'};
    }
    const sequence=++cloudSequence, owner=user.id;
    cloudState={...emptyCloud(),active:true,loading:true,userId:owner,email:user.email || ''};
    notify({ok:true,message:'正在读取账号学习记录…'});
    cloudLoadPromise=(async () => {
      try {
        const model=await window.EGG_CLOUD.loadStudyState();
        if (!currentCloud(owner,sequence)) return accountChanged();
        if (model?.userId!==owner || !Array.isArray(model.progress) || !Array.isArray(model.favorites) || !Array.isArray(model.notes)) throw new Error('账号学习记录返回格式无效。');
        if (model.progress.some(p=>!validId(p.lesson_id) || typeof p.completed!=='boolean' || !Number.isInteger(p.revision) || p.revision<0) ||
            model.favorites.some(f=>!validId(f.lesson_id)) || model.notes.some(n=>!validId(n.lesson_id) || typeof n.content!=='string' || length(n.content)>2000 || !validTime(n.updated_at))) throw new Error('账号学习记录字段无效，请重新读取。');
        cloudState={...cloudState,ready:true,loading:false,error:null,
          nickname:model.profile?.nickname || '创作者',lastLesson:validId(model.profile?.last_lesson_id)?model.profile.last_lesson_id:null,
          completed:orderedIds(model.progress.filter(p=>p.completed).map(p=>p.lesson_id)),favorites:orderedIds(model.favorites.map(f=>f.lesson_id)),
          notes:model.notes.map(n=>({lessonId:n.lesson_id,content:n.content,updatedAt:n.updated_at})),
          revisions:Object.fromEntries(model.progress.map(p=>[p.lesson_id,p.revision]))};
        const result={ok:true,message:'已读取账号学习记录。'}; notify(result); return result;
      } catch (error) {
        if (!currentCloud(owner,sequence)) return accountChanged();
        cloudState.loading=false; cloudState.error=error.message || '学习记录读取失败，请重试。';
        return fail(cloudState.error);
      } finally { if (sequence===cloudSequence) cloudLoadPromise=null; }
    })();
    return cloudLoadPromise;
  }
  async function cloudWrite(request, apply, message) {
    if (!cloudState.active || !cloudState.ready) return fail('账号学习记录尚未就绪，请先重新读取。');
    // ponytail: 每页只允许一个学习写请求；需要批量编辑时再增加逐项队列。
    if (cloudState.saving) return fail('上一项保存仍在处理，请稍后重试。');
    const owner=cloudState.userId, sequence=cloudSequence;
    if (!currentCloud(owner,sequence)) return accountChanged();
    cloudState.saving=true;
    notify({ok:true,message:'正在保存学习记录…'});
    try {
      const value=await request();
      if (!currentCloud(owner,sequence)) return accountChanged();
      cloudState.saving=false; apply(value); cloudState.error=null;
      const result={ok:true,message:message+'账号服务已确认保存。'}; notify(result); return result;
    } catch (error) {
      if (!currentCloud(owner,sequence)) return accountChanged();
      cloudState.saving=false;
      return fail(error.message || '保存未完成，请重新读取核对。');
    }
  }

  function decode(raw) {
    if (raw === null) return {state: defaults(), issue: null};
    try {
      const value = JSON.parse(raw);
      if (!value || typeof value !== 'object' || Array.isArray(value)) return {issue: 'corrupt'};
      if (value.version !== VERSION) return {issue: 'version'};
      if (typeof value.active !== 'boolean' || !validNickname(value.nickname) ||
          !Array.isArray(value.completed) || !value.completed.every(validId) ||
          !Array.isArray(value.favorites) || !value.favorites.every(validId) ||
          !Array.isArray(value.notes) || !value.notes.every(note => note && validId(note.lessonId) && typeof note.content === 'string' && length(note.content) <= 2000 && validTime(note.updatedAt)) ||
          !Array.isArray(value.feedback) || !value.feedback.every(item => item && validId(item.lessonId) && feedbackTypes.has(item.type) && validFeedback(item.content) && typeof item.id === 'string' && item.id.length > 0 && validTime(item.createdAt)) ||
          (value.lastLesson !== null && !validId(value.lastLesson)) ||
          new Set(value.notes.map(note => note.lessonId)).size !== value.notes.length ||
          new Set(value.feedback.map(item => item.id)).size !== value.feedback.length) return {issue: 'corrupt'};
      return {state: {
        version: VERSION, active: value.active, nickname: value.nickname.trim(),
        completed: orderedIds(value.completed), favorites: orderedIds(value.favorites),
        notes: value.notes.map(({lessonId, content, updatedAt}) => ({lessonId, content, updatedAt})),
        feedback: value.feedback.map(({id, lessonId, type, content, createdAt}) => ({id, lessonId, type, content, createdAt})),
        lastLesson: value.lastLesson
      }, issue: null};
    } catch { return {issue: 'corrupt'}; }
  }
  function read() {
    try { return decode(window.localStorage.getItem(KEY)); }
    catch { return {issue: 'unavailable'}; }
  }
  function storageMessage() {
    if (storageIssue === 'version') return '检测到其他版本的演示记录，原记录会保留；当前修改只在本页临时保留，明确重置演示数据后才会重新保存。';
    if (storageIssue === 'corrupt') return '已有演示记录无法读取，原记录会保留；当前修改只在本页临时保留，明确重置演示数据后才会重新保存。';
    if (storageMode === 'temporary') return '浏览器未能保存演示数据，当前修改只在本页临时保留，刷新或离开后可能丢失。';
    return '演示数据仅保存在当前浏览器和站点地址下，不会上传或跨设备同步。';
  }
  function getState() {
    if (cloudMode()) {
      bindCloud();
      return {...clone(cloudState),storageMessage:cloudState.error || (cloudState.loading?'正在读取账号学习记录…':cloudState.ready?'学习记录来自账号服务；每次保存都需服务端确认。':'账号学习记录尚未读取。')};
    }
    loadLocal();
    return {...clone(state), mode:'local', ready:state.active, storageMode, storageIssue, storageMessage: storageMessage()};
  }
  function notify(result) {
    for (const callback of subscribers) {
      try { callback(getState(), clone(result)); } catch { /* 单个界面回调失败不能阻断数据保存。 */ }
    }
  }
  function fail(message) {
    const result = {ok: false, message};
    notify(result);
    return result;
  }
  function acceptRead(latest) {
    if (latest.issue) {
      storageMode = 'temporary';
      storageIssue = latest.issue;
      if (latest.issue === 'corrupt' || latest.issue === 'version') protectedRecord = true;
    } else {
      state = latest.state;
      storageMode = 'persistent';
      storageIssue = null;
    }
  }
  function persist(explicitReset = false) {
    if (protectedRecord) return;
    // 重试临时保存前也检查原值，但不加载它，以保留尚未保存的本页修改。
    if (!explicitReset) {
      const latest = read();
      if (latest.issue) { acceptRead(latest); return; }
    }
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
      storageMode = 'persistent';
      storageIssue = null;
    } catch {
      storageMode = 'temporary';
      storageIssue = 'unavailable';
    }
  }
  function write(change, message, requiresActive = true) {
    loadLocal();
    // 顺序发生的其他标签写入会先合并；localStorage 同时写入仍由最后一次写入决定。
    // 临时状态不重新加载旧存储，避免丢掉尚未持久化的本页修改。
    if (storageMode === 'persistent' && !protectedRecord) acceptRead(read());
    if (requiresActive && !state.active) return fail('请先进入体验账号，再保存个人空间记录。');
    change(state);
    persist();
    const result = {ok: true, message: message + (storageMode === 'temporary' ? '当前仅在本页临时保留。' : '已保存在本浏览器。')};
    notify(result);
    return result;
  }
  function enterDemo(nickname) {
    if (cloudMode()) return fail('本站已启用真实账号，不能进入本机体验。');
    if (!validNickname(nickname)) return fail('体验昵称需为 1 至 20 个字符。');
    return write(next => { next.nickname = nickname.trim(); next.active = true; }, '已进入体验账号。', false);
  }
  function logout() {
    if (cloudMode()) { clearCloud(); return {ok:true,message:'已清除当前账号的学习记录。'}; }
    return write(next => { next.active = false; }, '已退出体验账号，学习记录会保留。', false);
  }
  function setCompleted(id, complete) {
    if (!validId(id) || typeof complete !== 'boolean') return fail('请选择有效课程，并使用明确的完成状态。');
    if (cloudMode()) return cloudWrite(()=>window.EGG_CLOUD.saveProgress(id,complete,cloudState.revisions[id] || 0),value=>{
      if (!value || value.applied!==true) { const error=new Error('另一设备已更新本课进度，请重新读取后再决定如何修改。');error.code='CONFLICT';throw error; }
      if (value.current_completed!==complete || !Number.isInteger(value.current_revision) || value.current_revision<1) throw new Error('进度保存没有返回有效确认，请重新读取核对。');
      cloudState.completed=complete?orderedIds([...cloudState.completed,id]):cloudState.completed.filter(value=>value!==id);
      cloudState.revisions[id]=value.current_revision;
    },complete?'已标记学完。':'已取消学完标记。');
    return write(next => { next.completed = complete ? orderedIds([...next.completed, id]) : next.completed.filter(value => value !== id); }, complete ? '已标记学完。' : '已取消学完标记。');
  }
  function toggleFavorite(id) {
    if (!validId(id)) return fail('请选择有效课程后收藏。');
    if (cloudMode()) { const selected=!cloudState.favorites.includes(id);return cloudWrite(()=>window.EGG_CLOUD.saveFavorite(id,selected),value=>{
      if (value?.selected!==selected) throw new Error('收藏保存没有返回有效确认，请重新读取核对。');
      cloudState.favorites=selected?orderedIds([...cloudState.favorites,id]):cloudState.favorites.filter(value=>value!==id);
    },'收藏已更新。'); }
    return write(next => { next.favorites = next.favorites.includes(id) ? next.favorites.filter(value => value !== id) : orderedIds([...next.favorites, id]); }, '收藏记录已更新。');
  }
  function saveNote(id, content) {
    if (!validId(id) || typeof content !== 'string' || length(content) > 2000) return fail('笔记需属于有效课程，内容最多 2000 个字符。');
    if (cloudMode()) return cloudWrite(()=>window.EGG_CLOUD.saveNote(id,content),value=>{
      if (value?.lesson_id!==id || value.content!==content || !validTime(value.updated_at)) throw new Error('笔记保存没有返回有效确认，请重新读取核对。');
      cloudState.notes=cloudState.notes.filter(note=>note.lessonId!==id);
      cloudState.notes.push({lessonId:id,content:value.content,updatedAt:value.updated_at});
    },'笔记已保存。');
    return write(next => {
      const note = {lessonId: id, content, updatedAt: new Date().toISOString()};
      const index = next.notes.findIndex(item => item.lessonId === id);
      if (index < 0) next.notes.push(note); else next.notes[index] = note;
    }, '笔记已保存。');
  }
  function deleteNote(id) {
    if (!validId(id)) return fail('请选择有效课程后删除笔记。');
    if (cloudMode()) return cloudWrite(()=>window.EGG_CLOUD.deleteNote(id),value=>{
      if (value?.deleted!==true || value.lesson_id!==id) throw new Error('删除没有返回有效确认，请重新读取核对。');
      cloudState.notes=cloudState.notes.filter(note=>note.lessonId!==id);
    },'笔记已删除。');
    return write(next => { next.notes = next.notes.filter(item => item.lessonId !== id); }, '笔记已删除。');
  }
  function saveFeedback(value) {
    if (cloudMode()) return fail('问题反馈暂未接入账号服务，请使用服务说明页的反馈方式。');
    if (!value || !validId(value.lessonId) || !feedbackTypes.has(value.type) || !validFeedback(value.content)) return fail('请选择有效课程和反馈类型，反馈内容需为 10 至 1000 个字符。');
    return write(next => {
      let id;
      do { id = `feedback-${Date.now().toString(36)}-${++feedbackSequence}`; } while (next.feedback.some(item => item.id === id));
      next.feedback.push({id, lessonId: value.lessonId, type: value.type, content: value.content.trim(), createdAt: new Date().toISOString()});
    }, '反馈已保存为本地演示记录。');
  }
  function rememberLesson(id) {
    if (!validId(id)) return fail('请选择有效课程后记录阅读位置。');
    if (cloudMode()) return saveProfilePatch({last_lesson_id:id},'最近阅读课程已更新。');
    return write(next => { next.lastLesson = id; }, '最近阅读课程已更新。');
  }
  function importLocalProgress() {
    if (cloudMode()) return fail('云端账号暂不支持导入本机演示记录，原记录会保留。');
    let value;
    try {
      const raw = window.localStorage.getItem(PROGRESS_KEY);
      if (raw === null) return fail('本浏览器还没有可导入的原学习进度。');
      value = JSON.parse(raw);
    } catch { return fail('原学习进度无法读取，原记录已保留。'); }
    if (!value || Array.isArray(value) || value.version !== 1 || !Array.isArray(value.completed)) return fail('原学习进度格式或版本不支持，原记录已保留。');
    const ids = orderedIds(value.completed.filter(validId));
    return write(next => { next.completed = orderedIds([...next.completed, ...ids]); }, `已合并原学习进度中的 ${ids.length} 个有效课程标记。`);
  }
  function resetDemo() {
    if (cloudMode()) return fail('云端模式不能恢复本机演示数据。');
    state = defaults();
    protectedRecord = false;
    storageMode = 'persistent';
    storageIssue = null;
    persist(true);
    const result = {ok: true, message: '已重置个人空间演示数据。' + (storageMode === 'temporary' ? '浏览器拒绝保存，之前的存储无法确认已替换；当前仅在本页临时保留。' : '原学习进度没有改变。')};
    notify(result);
    return result;
  }
  function subscribe(callback) {
    if (typeof callback !== 'function') throw new TypeError('订阅回调必须是函数。');
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  }
  function saveProfilePatch(patch,message) {
    return cloudWrite(()=>window.EGG_CLOUD.saveProfilePatch(patch),value=>{
      if (!value || Object.entries(patch).some(([key,expected])=>value[key]!==expected)) throw new Error('资料保存没有返回有效确认，请重新读取核对。');
      if (Object.hasOwn(patch,'nickname')) cloudState.nickname=value.nickname;
      if (Object.hasOwn(patch,'last_lesson_id')) cloudState.lastLesson=value.last_lesson_id;
    },message);
  }
  function setNickname(nickname) {
    if (!validNickname(nickname)) return fail('昵称需为 1 至 20 个字符。');
    return cloudMode()?saveProfilePatch({nickname:nickname.trim()},'昵称已更新。'):enterDemo(nickname);
  }

  window.addEventListener('storage', event => {
    if (cloudMode()) return;
    loadLocal();
    if (event.key !== KEY && event.key !== null) return;
    try { if (event.storageArea && event.storageArea !== window.localStorage) return; }
    catch { acceptRead({issue: 'unavailable'}); notify({ok: false, message: storageMessage()}); return; }
    if (storageMode === 'temporary' || protectedRecord) {
      notify({ok: false, message: '其他页面的演示记录发生变化；本页临时修改仍会保留。'});
      return;
    }
    acceptRead(read());
    notify({ok: storageMode === 'persistent', message: storageMode === 'persistent' ? '已更新本浏览器其他页面的演示记录。' : storageMessage()});
  });
  window.EGG_SPACE = Object.freeze({getState, enterDemo, logout, setCompleted, toggleFavorite, saveNote, deleteNote,
    saveFeedback, rememberLesson, importLocalProgress, resetDemo, subscribe, loadCloudUser, setNickname, storageKey: KEY, version: VERSION});
})();
