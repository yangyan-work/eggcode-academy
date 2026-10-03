'use strict';
// 无外部依赖：node scripts/check-personal-space-state.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '..', 'personal-space-state.js'), 'utf8');
const KEY = 'eggcode-academy.space-preview.v1';
const PROGRESS_KEY = 'eggcode-academy.learning-progress';
let checks = 0;
const check = (actual, expected, message) => { assert.deepEqual(actual, expected, message); checks++; };
const plain = value => JSON.parse(JSON.stringify(value));
function create({data = new Map(), blocked = false, quota = false} = {}) {
  const listeners = new Map();
  const writes = [];
  let failRead = blocked;
  let failWrite = quota;
  const storage = {
    getItem(key) { if (failRead) throw new Error('SecurityError'); return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { if (failWrite) throw new Error('QuotaExceededError'); writes.push(key); data.set(key, value); }
  };
  const window = {addEventListener(type, callback) { listeners.set(type, callback); }};
  Object.defineProperty(window, 'localStorage', {get() { if (failRead) throw new Error('SecurityError'); return storage; }});
  const context = vm.createContext({window});
  vm.runInContext(source, context, {filename: 'personal-space-state.js'});
  return {api: window.EGG_SPACE, data, writes, reload: () => create({data}),
    event(key = KEY, storageArea = storage) { listeners.get('storage')({key, storageArea}); },
    available() { failRead = false; failWrite = false; }, unavailable() { failRead = true; }, quota() { failWrite = true; },
    rerun() { vm.runInContext(source, context); }};
}

const original = JSON.stringify({version: 1, completed: [70, 144], lastLesson: 144});
const data = new Map([[PROGRESS_KEY, original], ['unrelated', '保留']]);
const page = create({data});
const api = page.api;
let snapshot = api.getState();
check(snapshot.active, false, '默认体验账号未登录');
check(snapshot.nickname, '林间创作者', '默认昵称');
check(plain(snapshot.completed), Array.from({length: 12}, (_, id) => id), '默认 12 课已完成');
check(plain(snapshot.favorites), [12, 22, 40], '默认收藏');
check(snapshot.notes[0].lessonId, 40, '默认笔记');
check(Number.isFinite(Date.parse(snapshot.notes[0].updatedAt)), true, '默认笔记日期有效');
check(plain(snapshot.feedback), [], '默认无反馈');
check(snapshot.lastLesson, 12, '默认最近阅读');
check(snapshot.storageMode, 'persistent', '可用持久存储');
check(data.size, 2, '初始化没有写入或自动导入');
check(snapshot.completed.includes(70), false, '明确导入前不读取原进度到演示');
snapshot.completed.push(144); snapshot.notes[0].content = '不应改动内部';
check(api.getState().completed.includes(144), false, '完成状态深拷贝');
check(api.getState().notes[0].content.includes('初始化长度'), true, '笔记深拷贝');
const notices = [];
check(api.enterDemo('林间创作者').ok, true, '明确登录后测试个人记录');
const unsubscribe = api.subscribe((state, result) => { notices.push({state, result}); state.completed.length = 0; });
api.subscribe(() => { throw new Error('界面错误'); });
check(notices.length, 0, '订阅不会立即调用');
check(api.setCompleted(144, true).ok, true, '最后一课可完成');
check(api.getState().completed.includes(144), true, '回调无法改动内部状态');
check(notices.length, 1, '保存会通知订阅');
check(api.setCompleted(144, true).ok, true, '重复完成可执行');
check(api.getState().completed.filter(id => id === 144).length, 1, '重复完成不重复记录');
check(api.setCompleted(144, false).ok, true, '可以取消完成');
check(api.toggleFavorite(0).ok, true, '课程零可收藏');
check(api.getState().favorites.includes(0), true, '收藏课程零');
api.toggleFavorite(0);
check(api.getState().favorites.includes(0), false, '再次点击取消收藏');
for (const id of [-1, 145, 1.5, '0', null, undefined, NaN, Infinity]) {
  for (const action of [() => api.setCompleted(id, true), () => api.toggleFavorite(id), () => api.saveNote(id, '文本'), () => api.deleteNote(id), () => api.rememberLesson(id)]) check(action().ok, false, '非法课程 ID 被拒绝');
}
check(api.setCompleted(0, 'true').ok, false, '完成标记必须布尔值');
for (const nickname of ['', '   ', '字'.repeat(21), 123, null]) check(api.enterDemo(nickname).ok, false, '昵称输入边界');
check(api.enterDemo('  字'.repeat(1) + '字'.repeat(19) + '  ').ok, true, '20 字昵称允许且去空白');
check(api.getState().nickname.length, 20, '昵称去掉首尾空白');
check(api.enterDemo('😀'.repeat(20)).ok, true, 'Unicode 字符按代码点计数');
check(api.enterDemo('😀'.repeat(21)).ok, false, '超过 20 个 Unicode 字符拒绝');
const injection = '<img src=x onerror=alert(1)><script>alert(2)</script>';
check(api.saveNote(0, injection).ok, true, '注入样式文本按纯文本保存');
check(api.getState().notes.find(note => note.lessonId === 0).content, injection, '文本没有执行或改写');
check(api.saveNote(0, '字'.repeat(2000)).ok, true, '笔记 2000 字边界');
check(api.saveNote(0, '字'.repeat(2001)).ok, false, '笔记超长拒绝');
check(api.saveNote(0, 123).ok, false, '笔记必须字符串');
check(api.saveNote(0, '').ok, true, '空字符串笔记允许');
check(api.getState().notes.filter(note => note.lessonId === 0).length, 1, '修改笔记只保留一条');
check(api.deleteNote(0).ok, true, '可以删除笔记');
check(api.getState().notes.some(note => note.lessonId === 0), false, '笔记被删除');
for (const type of ['content', 'diagram', 'other']) check(api.saveFeedback({lessonId: 0, type, content: '字'.repeat(10)}).ok, true, '反馈类型和最小边界');
check(api.saveFeedback({lessonId: 144, type: 'content', content: '字'.repeat(1000)}).ok, true, '反馈最大边界');
for (const value of [null, {}, {lessonId: 145, type: 'content', content: '字'.repeat(10)}, {lessonId: 0, type: 'unknown', content: '字'.repeat(10)}, {lessonId: 0, type: 'content', content: '字'.repeat(9)}, {lessonId: 0, type: 'content', content: '字'.repeat(1001)}, {lessonId: 0, type: 'content', content: ' '.repeat(10)}]) check(api.saveFeedback(value).ok, false, '非法反馈被拒绝');
const entries = api.getState().feedback;
check(new Set(entries.map(item => item.id)).size, entries.length, '反馈 ID 唯一');
check(entries.every(item => Number.isFinite(Date.parse(item.createdAt))), true, '反馈时间有效');
check(api.rememberLesson(0).ok, true, '零号课程可记为最近阅读');
check(api.getState().lastLesson, 0, '最近阅读更新');
check(api.importLocalProgress().ok, true, '明确导入合并原进度');
check(api.getState().completed.includes(70) && api.getState().completed.includes(144), true, '原进度有效课程合并');
check(data.get(PROGRESS_KEY), original, '导入不写原学习进度键');
check(page.writes.every(key => key === KEY), true, '所有保存只写演示键');
check(data.get('unrelated'), '保留', '无关记录保留');
check(api.logout().ok, true, '可退出账号');
const inactive = plain(api.getState());
for (const action of [() => api.setCompleted(30, true), () => api.toggleFavorite(30), () => api.saveNote(30, '笔记'), () => api.deleteNote(40), () => api.saveFeedback({lessonId: 30, type: 'content', content: '字'.repeat(10)}), () => api.rememberLesson(30), () => api.importLocalProgress()]) check(action().ok, false, '退出状态禁止个人记录写入');
check(plain(api.getState()), inactive, '禁止写入不改变数据');
check(page.reload().api.getState().active, false, '刷新后保持退出且数据保留');
check(api.enterDemo('林间创作者').ok, true, '重新进入同一账号');
check(api.getState().completed.includes(70), true, '重进保留学习数据');
check(plain(page.reload().api.getState()), plain(api.getState()), '完整记录可刷新恢复');
page.rerun();
check(page.api, api, '重复载入保持同一 API');
const beforeUnsubscribe = notices.length;
unsubscribe(); api.rememberLesson(12);
check(notices.length, beforeUnsubscribe, '取消订阅有效');

const other = page.reload();
other.api.setCompleted(30, true);
page.event();
check(api.getState().completed.includes(30), true, '跨标签 storage 事件刷新');
other.api.setCompleted(31, true);
api.setCompleted(32, true);
check(api.getState().completed.includes(31) && api.getState().completed.includes(32), true, '写前读取保留另一页面的顺序写入');
other.api.logout(); page.event('unrelated');
check(api.getState().active, true, '无关存储事件忽略');
page.event(KEY, {});
check(api.getState().active, true, '其他存储区域忽略');
page.event(null);
check(api.getState().active, false, '全站存储事件刷新');
api.resetDemo();
check(api.getState().active, false, '重置恢复默认未登录状态');
check(plain(api.getState().completed), Array.from({length: 12}, (_, id) => id), '重置演示完成记录');
check(data.get(PROGRESS_KEY), original, '重置只修改演示记录');
api.enterDemo('林间创作者');

for (const raw of ['{bad', 'null', '[]', JSON.stringify({version: 2}), JSON.stringify({version: 1, completed: []}), JSON.stringify({...plain(api.getState()), notes: [{lessonId: 40, content: 12, updatedAt: 'bad'}]})]) {
  const damagedData = new Map([[KEY, raw], [PROGRESS_KEY, original]]);
  const damaged = create({data: damagedData});
  damaged.api.enterDemo('林间创作者');
  check(damaged.api.getState().storageMode, 'temporary', '损坏/未知版本开启临时模式');
  damaged.api.setCompleted(70, true); damaged.api.setCompleted(71, true);
  check(damaged.api.getState().completed.includes(70) && damaged.api.getState().completed.includes(71), true, '受保护记录保留临时修改');
  check(damagedData.get(KEY), raw, '损坏/未知版本未被静默覆盖');
  damagedData.set(KEY, data.get(KEY)); damaged.event(); damaged.api.setCompleted(72, true);
  check(damaged.api.getState().storageMode, 'temporary', '外部有效记录不能解除保护，需明确重置');
  check(damagedData.get(KEY), data.get(KEY), '保护期间不覆盖外部记录');
  damaged.api.resetDemo();
  check(damaged.api.getState().storageMode, 'persistent', '明确重置解除存储保护');
  check(JSON.parse(damagedData.get(KEY)).version, 1, '重置写入当前版本');
  check(damagedData.get(PROGRESS_KEY), original, '保护和重置始终隔离原键');
}
for (const raw of ['{bad', 'null', '[]', JSON.stringify({version: 2, completed: [70]}), JSON.stringify({version: 1, completed: 'bad'})]) {
  const imports = new Map([[PROGRESS_KEY, raw]]);
  const test = create({data: imports});
  test.api.enterDemo('林间创作者');
  const before = plain(test.api.getState().completed);
  check(test.api.importLocalProgress().ok, false, '损坏原进度不导入');
  check(plain(test.api.getState().completed), before, '导入失败不更改完成状态');
  check(imports.get(PROGRESS_KEY), raw, '导入失败不覆盖原进度');
}
const mixed = create({data: new Map([[PROGRESS_KEY, JSON.stringify({version: 1, completed: [70, 70, 144, -1, 145, '22', 1.5, null]})]])});
mixed.api.enterDemo('林间创作者');
check(mixed.api.importLocalProgress().ok, true, '导入过滤无效课程 ID');
check(plain(mixed.api.getState().completed), [...Array.from({length: 12}, (_, id) => id), 70, 144], '导入去重并保持默认有效记录');
check(create().api.importLocalProgress().ok, false, '不存在原进度时明确提示');

for (const options of [{blocked: true}, {quota: true}]) {
  const test = create(options);
  test.api.enterDemo('林间创作者');
  test.api.setCompleted(70, true); test.api.setCompleted(71, true); test.api.saveNote(70, injection);
  check(test.api.getState().storageMode, 'temporary', '存储访问/持久失败时临时模式');
  check(test.api.getState().completed.includes(70) && test.api.getState().completed.includes(71), true, '连续临时写不被旧数据覆盖');
  check(test.api.getState().notes.find(note => note.lessonId === 70).content, injection, '临时笔记保留');
  test.event();
  check(test.api.getState().completed.includes(70), true, '存储事件不丢失临时修改');
  test.available(); test.api.setCompleted(72, true);
  check(test.api.getState().storageMode, 'persistent', '存储恢复后可保存本页全部数据');
  check(test.reload().api.getState().completed.includes(70), true, '临时数据恢复为可刷新记录');
  test.quota(); test.api.resetDemo();
  check(test.api.getState().storageMode, 'temporary', '重置失败仍明确临时模式');
}
const changed = create();
changed.api.enterDemo('林间创作者');
changed.api.setCompleted(70, true);
changed.data.set(KEY, '{broken'); changed.event(); changed.api.setCompleted(71, true);
check(changed.data.get(KEY), '{broken', '运行中遭遇损坏存储也禁止覆盖');
check(changed.api.getState().completed.includes(70) && changed.api.getState().completed.includes(71), true, '运行中损坏保留已有与临时记录');
for (const raw of ['{broken', JSON.stringify({version: 99})]) {
  const recovery = create({quota: true});
  recovery.api.enterDemo('林间创作者');
  recovery.api.setCompleted(70, true);
  recovery.data.set(KEY, raw); recovery.available(); recovery.api.setCompleted(71, true);
  check(recovery.data.get(KEY), raw, '临时保存恢复时仍保护损坏/未来版本原值');
  check(recovery.api.getState().completed.includes(70) && recovery.api.getState().completed.includes(71), true, '恢复遇损坏仍保留全部内存修改');
  recovery.api.resetDemo();
  check(recovery.api.getState().storageMode, 'persistent', '恢复遇损坏后明确重置可恢复');
}
check(/\b(?:fetch|XMLHttpRequest|sendBeacon|WebSocket)\s*\(/.test(source), false, '没有网络调用');
check(/\b(?:document|innerHTML|insertAdjacentHTML)\b/.test(source), false, '没有界面渲染');
console.log(`PASS 个人空间状态：${checks} 项检查；145 个稳定课程 ID、独立演示键、深拷贝、刷新和跨标签、账号门槛、Unicode 边界、纯文本、明确导入、损坏/未来版本保护、存储受阻与恢复。`);
