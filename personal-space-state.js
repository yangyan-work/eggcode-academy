"use strict";
// 单个体验账号的浏览器本地演示数据；不渲染界面、不调用网络。
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
    return {...clone(state), storageMode, storageIssue, storageMessage: storageMessage()};
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
    if (!validNickname(nickname)) return fail('体验昵称需为 1 至 20 个字符。');
    return write(next => { next.nickname = nickname.trim(); next.active = true; }, '已进入体验账号。', false);
  }
  function logout() {
    return write(next => { next.active = false; }, '已退出体验账号，学习记录会保留。', false);
  }
  function setCompleted(id, complete) {
    if (!validId(id) || typeof complete !== 'boolean') return fail('请选择有效课程，并使用明确的完成状态。');
    return write(next => { next.completed = complete ? orderedIds([...next.completed, id]) : next.completed.filter(value => value !== id); }, complete ? '已标记学完。' : '已取消学完标记。');
  }
  function toggleFavorite(id) {
    if (!validId(id)) return fail('请选择有效课程后收藏。');
    return write(next => { next.favorites = next.favorites.includes(id) ? next.favorites.filter(value => value !== id) : orderedIds([...next.favorites, id]); }, '收藏记录已更新。');
  }
  function saveNote(id, content) {
    if (!validId(id) || typeof content !== 'string' || length(content) > 2000) return fail('笔记需属于有效课程，内容最多 2000 个字符。');
    return write(next => {
      const note = {lessonId: id, content, updatedAt: new Date().toISOString()};
      const index = next.notes.findIndex(item => item.lessonId === id);
      if (index < 0) next.notes.push(note); else next.notes[index] = note;
    }, '笔记已保存。');
  }
  function deleteNote(id) {
    if (!validId(id)) return fail('请选择有效课程后删除笔记。');
    return write(next => { next.notes = next.notes.filter(item => item.lessonId !== id); }, '笔记已删除。');
  }
  function saveFeedback(value) {
    if (!value || !validId(value.lessonId) || !feedbackTypes.has(value.type) || !validFeedback(value.content)) return fail('请选择有效课程和反馈类型，反馈内容需为 10 至 1000 个字符。');
    return write(next => {
      let id;
      do { id = `feedback-${Date.now().toString(36)}-${++feedbackSequence}`; } while (next.feedback.some(item => item.id === id));
      next.feedback.push({id, lessonId: value.lessonId, type: value.type, content: value.content.trim(), createdAt: new Date().toISOString()});
    }, '反馈已保存为本地演示记录。');
  }
  function rememberLesson(id) {
    if (!validId(id)) return fail('请选择有效课程后记录阅读位置。');
    return write(next => { next.lastLesson = id; }, '最近阅读课程已更新。');
  }
  function importLocalProgress() {
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

  acceptRead(read());
  window.addEventListener('storage', event => {
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
    saveFeedback, rememberLesson, importLocalProgress, resetDemo, subscribe, storageKey: KEY, version: VERSION});
})();
