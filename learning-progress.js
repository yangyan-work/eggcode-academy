"use strict";
/* Self-reported learning progress. Shared account records when cloud auth is configured.
 * Load after curriculum metadata and before app.js; call EGG_PROGRESS.init() after rendering.
 * Optional compact dashboard mount: <div data-learning-progress-summary></div>.
 * Changing this schema requires an explicit migration; unknown versions are never overwritten.
 */
(() => {
  if (window.EGG_PROGRESS) return;
  const KEY = 'eggcode-academy.learning-progress';
  const VERSION = 1;
  const range = (start, end) => Array.from({length: end - start + 1}, (_, i) => start + i);
  const unique = ids => [...new Set(ids)];
  const foundation = range(0, 5);
  const core = range(0, 4);
  const requirements = {
    basics: {ids: core, note: '先认识事件、变量、条件、循环、列表与自定义动作。'},
    progression: {ids: [...core, 8, 9], note: '先会记录玩家数据、限制重复触发。01—08 是训练成长，09—12 在独立副本接战斗；13—18 是大数方案分支，不是同一套累计程序。'},
    inventory: {ids: [2, 3, 4, 22, 23, 24], note: '先理解个人数据、列表和奖励收支，再区分物品表与容量。'},
    equipment: {ids: [40, 41, 42, 30, 32], note: '先理解物品实例和数值重算，避免把装备加成重复累加。'},
    pets: {ids: [40, 41, 42, 22, 25], note: '先会管理物品实例与成长数值，再处理单只宠物的状态。'},
    loot: {ids: [3, 4, 40, 41], note: '先会区间判断、列表和幂等奖励，再接随机与保底。'},
    skills: {ids: [3, 8, 22], note: '先理解事件玩家、冷却时间和重复触发，随后接原生技能入口。'},
    effects: {ids: [52, 53, 54], note: '先完成技能触发与命中，再管理状态持续时间、叠加和清理。'},
    boss: {ids: [30, 31, 52, 53, 54, 55, 56, 57], note: '先掌握伤害、技能与状态，再组织阶段切换和一次性结算。'},
    quests: {ids: [9, 40, 41], note: '先会累计计数和防重复发奖，再接任务进度与领取。'},
    offline: {ids: [29, 70, 71, 72, 73, 74, 75], note: '先建立个人数据、存档版本和故障处理，再结算离线时间。'},
    daily: {ids: [70, 71, 72, 73, 74, 75], note: '先掌握身份、回执与存档故障，再处理业务日和每日奖励。'},
    ownership: {ids: [2, 4, 22, 29, 40, 41], note: '先理解玩家数据、基础存档和奖励回执；用两名真实玩家验证归属。'},
    'save-migration': {ids: [29, 70, 71, 72], note: '先完成存读档与玩家归属，再区分加载失败、新档和未来版本。'},
    restaurant: {ids: [6, 8, 9, 40, 41, 42], note: '先会事件、计时、收支与库存，再串起接单到日结。'},
    farm: {ids: [2, 3, 8, 40, 41, 42], note: '先理解共享时钟与物料收支，再处理生长和单次收获。'},
    fishing: {ids: [3, 8, 49, 50, 51], note: '先认识计时窗口与随机区间，再加入鱼种、图鉴与奖励。'},
    factory: {ids: [3, 4, 40, 41, 42], note: '先会列表、容量检查和物料守恒，再让工位相互交接。'},
    escape: {ids: [18, 19, 20, 21], note: '先练习限时、顺序、检查点与双开关联动，再整合机关。'},
    cooperative: {ids: [21, 70, 71, 72], note: '先完成双开关和多人归属，再处理同步、退出和重开。'},
    sokoban: {ids: [3, 4, 12, 13], note: '先理解网格索引、列表与无效回退，再处理推动和撤销。'},
    story: {ids: [2, 3, 19], note: '先会状态记录与顺序判断，再组织剧情节点和分支条件。'},
    'hide-seek': {ids: [8, 18, 70, 71, 72], note: '先会阶段计时和玩家归属，再处理名单、离线与结算。'},
    disaster: {ids: [8, 10, 18, 70, 71, 72], note: '先会区域检测、阶段计时与个人状态，再组织灾难轮换。'},
    'capture-flag': {ids: [10, 20, 70, 71, 72], note: '先掌握区域事件和玩家归属，再处理唯一持有人与交旗。'},
    'hot-potato': {ids: [8, 18, 70, 71, 72], note: '先会统一计时、限频与玩家归属，再处理转交和继任。'},
    cards: {ids: [4, 40, 41, 42, 70, 71, 72], note: '先掌握实例编号、原子收支与玩家归属，再进入回合出牌。'},
    board: {ids: [3, 4, 49, 70, 71, 72], note: '先掌握列表、随机和玩家归属，再接回合与格子事件。'},
    rhythm: {ids: [3, 8, 9], note: '先理解时钟和单次计数；必须在真实设备测量输入与计时精度。'},
    'tower-defense': {ids: [30, 31, 52, 53, 54], note: '先会伤害、掉落与技能，再组织敌人池、炮塔和波次。'},
    roguelike: {ids: [49, 50, 51, 58, 59, 60], note: '先掌握随机和首领阶段，再组织房间路线与局内成长。'},
    'match3-advanced': {ids: range(12, 17), note: '先完整搭通六课基础消消乐，再增加特殊格、冰层与目标。'},
    match3: {ids: [3, 4, 7, 9], note: '先掌握条件、循环、列表和计数，再按顺序搭棋盘与结算。'},
    gameplay: {ids: range(6, 11), note: '先完成六个积木练习，再把计时、区域、信号串成玩法。'}
  };
  const step = (title, ids, note) => ({title, ids, note});
  const routes = [
    {id: 'first-map', name: '从零到第一张地图', label: '新手起步', text: '先读懂积木，再做短练习，最后拼出能玩的关卡。', steps: [step('认识蛋码', foundation, '第 6 课是 Lua 概念拓展，可先读后回顾。'), step('六个积木小练习', range(6, 11), '逐个验证事件、计时、计数、区域与信号。'), step('组合成小玩法', range(18, 21), '把熟悉的积木连成限时、顺序与开关机制。')]},
    {id: 'growth', name: '搭一套成长养成系统', label: '长期成长', text: '从个人数值和收支出发，再扩展背包、装备、宠物与任务。', steps: [step('事件、变量与列表', core, '这些基础会贯穿整条路线。'), step('数值图基础与战斗', range(22, 33), '保留前课的数据和动作，先验收训练、存档与战斗。'), step('背包、装备与宠物', range(40, 48), '理解实例、归属与重算，不复制叠加旧结果。'), step('任务与成就', range(61, 63), '为成长目标加上清楚的进度和领取回执。')]},
    {id: 'big-numbers', name: '看懂大数，按用途选方案', label: '大数进阶 · ID 34–39', text: '四条独立方案，不是把六课接进同一套程序。先选目标，再搭对应分支。', steps: [step('建议基础：变量、判断与列表', [2, 3, 4], '先能区分数字与字符串，理解循环和逐项运算。'), step('分支 A：大数显示 34 → 35', [34, 35], '34 可独立练习，35 接在 34 后做小数与单位进位。显示格式不会扩大原生整数范围。'), step('分支 B：原生整数 i1', [36], '独立的原生整数方案；先确认编辑器数值边界，不混接其他分支。'), step('分支 C：精确字符串 37 → 38', [37, 38], '37 独立练习逐位算法，38 在同一 s1 方案内加入倍率、交易和存档。'), step('分支 D：近似成长强度 f1', [39], '独立选学。尾数＋指数只适用于允许误差的强度，不用于精确货币或实际伤害结算。')]},
    {id: 'reliable-save', name: '多人数据与可靠存档', label: '稳定运行 · ID 70–75', text: '先把数据认准主人，再应对重连、版本迁移和未知提交结果。', steps: [step('个人数据与基础存档', [2, 4, ...range(22, 29)], '先完成一次保存、离开和重进检查。'), step('背包与幂等奖励', [40, 41, 42], '建立重复请求不重复发奖的思路。'), step('多人数据与奖励归属', range(70, 72), '用两名真实玩家逐项检查数据和奖励。'), step('存档升级与故障处理', range(73, 75), '分清新档、失败、未来版本和未知结果。'), step('接入离线与每日奖励', range(64, 69), '在可靠身份、回执和存档基础上再加入时间结算。')]},
    {id: 'life', name: '经营自己的小小世界', label: '经营与生活', text: '围绕时钟、库存和收支，选择喜欢的经营主题。', steps: [step('基础积木与计时', [...core, ...range(6, 11)], '先把事件与唯一时钟跑稳定。'), step('背包和材料守恒', range(40, 42), '先检查容量与消耗，再提交结果。'), step('餐厅与农场', range(76, 83), '从短循环开始，逐步扩展顾客、田地和订单。'), step('随机掉落基础', range(49, 51), '先认识权重区间与奖励回执，再处理鱼种。'), step('钓鱼与工厂', range(84, 91), '观察随机、队列与库存之间的关系。')]},
    {id: 'puzzles', name: '从机关到合作解谜', label: '解谜与剧情', text: '先写清状态变化，再加入回退、分支与多人协作。', steps: [step('基础与组合机关', [...core, ...range(6, 11), ...range(18, 21)], '用小练习熟悉状态、顺序与双开关。'), step('密室、剧情与网格', [...range(92, 95), ...range(104, 107), 12, 13, ...range(100, 103)], '网格玩法先学习列表棋盘；每次移动先检查再提交。'), step('多人数据基础', range(70, 72), '合作机关需要明确事件玩家与归属。'), step('双人合作解谜', range(96, 99), '在两端测试同步、退出与重开。')]},
    {id: 'party', name: '让朋友一起玩起来', label: '多人派对', text: '围绕名单、身份、阶段和结算，做出规则清楚的派对。', steps: [step('事件与玩法练习', [...core, ...range(6, 11), 18, 20], '先跑通计时、区域和检查点。'), step('多人归属与单次奖励', range(70, 72), '先认识真实玩家和重复请求。'), step('四种派对原型', range(108, 123), '按兴趣选躲猫猫、灾难、夺旗或烫手山芋。'), step('列表实例与随机', [...range(40, 42), 49], '卡牌和棋盘需要唯一实例、原子收支与随机规则。'), step('卡牌与棋盘回合', [...range(124, 127), ...range(132, 135)], '明确谁能行动、何时结束，以及离线怎么办。')]},
    {id: 'advanced', name: '把熟悉的玩法再向前推', label: '专项进阶', text: '进阶不是跳过基础；按自己的目标选择分支，并回到编辑器验收。', steps: [step('基础消消乐 → 特殊格', [...range(12, 17), ...range(142, 144)], '先完整跑通基础消消乐，再增加队列效果与目标。'), step('计时练习 → 节奏点击', [3, 8, 9, ...range(128, 131)], '真实设备的时间精度决定判定窗口。'), step('伤害与技能 → 塔防', [30, 31, ...range(52, 54), ...range(136, 138)], '先做可靠命中，再接目标选择和波次。'), step('掉落与首领 → 肉鸽', [...range(49, 51), ...range(58, 60), ...range(139, 141)], '先跑通依赖专题，再连接房间、强化和重置。')]}
  ];
  let catalog = new Set();
  let titles = [];
  let state = {version: VERSION, completed: [], lastLesson: null};
  let mode = 'persistent';
  let loaded = false;
  let bound = false;
  let lastRemembered = null;
  let observer = null;
  let refreshPending = false;
  const watched = new WeakSet();
  const cloudMode = () => Boolean(window.EGG_CLOUD && window.EGG_CLOUD.status().mode !== 'local');
  let sharedSubscribed=false, remembering=false, sharedUser=null;
  function readShared() {
    const next=window.EGG_SPACE?.getState();
    state={version:VERSION,completed:next?.ready?[...next.completed]:[],lastLesson:next?.ready?next.lastLesson:null};
    mode=next?.ready?'cloud':'cloud-pending';
    if(sharedUser!==next?.userId){sharedUser=next?.userId;lastRemembered=null;}
  }
  async function rememberShared() {
    const id=currentLesson(),next=window.EGG_SPACE?.getState();
    if(id===null || !next?.ready || next.saving || remembering || lastRemembered===id)return;
    const owner=next.userId;remembering=true;
    try{const result=await window.EGG_SPACE.rememberLesson(id);if(result.ok&&window.EGG_SPACE.getState().userId===owner)lastRemembered=id;}
    finally{remembering=false;}
  }
  const escape = value => String(value).replace(/[&<>"']/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]));
  const valid = id => Number.isInteger(id) && catalog.has(id);
  const empty = () => ({version: VERSION, completed: [], lastLesson: null});
  const title = id => titles[id]?.title || `课程 ID ${id}`;
  function refreshCatalog() {
    const metadata = window.EGG_CURRICULUM;
    const count = metadata?.foundationCount || 6;
    catalog = new Set([...range(0, count - 1), ...(metadata?.series || []).flatMap(item => item.lessonIds)].filter(Number.isInteger));
    titles = [...(window.EGG_LESSONS || []), ...(window.EGG_TUTORIALS || []), ...(window.EGG_EXPANSION_LESSONS || [])];
  }
  function decode(raw) {
    if (raw === null) return {state: empty(), mode: 'persistent'};
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {state: empty(), mode: 'corrupt'};
      if (parsed.version !== VERSION) return {state: empty(), mode: 'version'};
      if (!Array.isArray(parsed.completed)) return {state: empty(), mode: 'corrupt'};
      return {state: {version: VERSION, completed: unique(parsed.completed.filter(valid)).sort((a, b) => a - b), lastLesson: valid(parsed.lastLesson) ? parsed.lastLesson : null}, mode: 'persistent'};
    } catch { return {state: empty(), mode: 'corrupt'}; }
  }
  function read() {
    try { return decode(window.localStorage.getItem(KEY)); }
    catch { return {state: empty(), mode: 'unavailable'}; }
  }
  function load() {
    if(cloudMode()){readShared();loaded=true;return;}
    const result = read();
    state = result.state;
    mode = result.mode;
    loaded = true;
  }
  function save(change) {
    // Re-read before each write so ordinary sequential changes in other tabs are preserved.
    // localStorage is not a transactional multi-tab database: simultaneous writes are last-writer-wins.
    const latest = read();
    if (mode !== 'unavailable' && mode !== 'version') {
      if (latest.mode === 'persistent') state = latest.state;
      mode = latest.mode;
    } else if (latest.mode === 'version') mode = 'version';
    change(state);
    if (mode === 'version' || mode === 'corrupt' || mode === 'unavailable') return false;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
      mode = 'persistent';
      return true;
    } catch { mode = 'unavailable'; return false; }
  }
  const count = ids => ids.filter(id => state.completed.includes(id)).length;
  const lessonLink = (id, text) => `<a href="lesson.html?id=${id}">${escape(text || title(id))}</a>`;
  function statusText() {
    if(cloudMode())return window.EGG_SPACE?.getState().storageMessage || '账号学习记录尚未就绪。';
    if (mode === 'unavailable') return '浏览器未允许保存，当前记录只在本页临时保留；刷新或离开后可能丢失。';
    if (mode === 'version') return '检测到其他版本的记录，本站不会覆盖它；当前修改只在本页临时保留。';
    if (mode === 'corrupt') return '已有记录无法读取，原记录会保留；当前修改只在本页临时保留。如需重新保存，请在学习路线页明确清除旧记录。';
    return '仅保存在当前浏览器和站点地址下，不会上传或跨设备同步；清理浏览器数据后会丢失。';
  }
  function announce(message) {
    document.querySelectorAll('[data-progress-notice]').forEach(node => { node.textContent = message; });
  }
  function setCompleted(id, complete) {
    if (!valid(id) || typeof complete !== 'boolean') return false;
    if(cloudMode())return (async()=>{
      const result=await window.EGG_SPACE.setCompleted(id,complete);
      readShared();update();announce(result.message);return result.ok;
    })();
    const persisted = save(next => {
      next.completed = complete ? unique([...next.completed, id]).sort((a, b) => a - b) : next.completed.filter(value => value !== id);
    });
    update();
    announce(`${complete ? '已标记为学完' : '已取消学完标记'}${persisted ? '，已保存在本浏览器。' : '，当前仅在本页临时保留。'}`);
    return true;
  }
  function clearProgress() {
    if(cloudMode()){announce('账号学习记录不会由本机清理按钮删除。');return false;}
    const warning = mode === 'version' ? '检测到了其他版本的记录。' : '';
    if (!window.confirm(`${warning}确定清除本站在本浏览器保存的全部学习记录吗？完成标记和上次打开的课程都会移除，无法撤销。其他网站的数据不受影响。`)) return false;
    try { window.localStorage.removeItem(KEY); mode = 'persistent'; }
    catch { mode = 'unavailable'; }
    state = empty();
    lastRemembered = null;
    update();
    announce(mode === 'unavailable' ? '已清除本页临时记录，但浏览器拒绝访问存储，无法确认已清除之前保存的数据。' : '已清除本浏览器的学习记录。');
    return true;
  }
  function progressBar(ids) {
    return `<div class="learning-progress-meter" data-progress-ids="${ids.join(',')}"><div><span data-progress-count></span><span data-progress-percent></span></div><progress max="${ids.length}" value="0" aria-label="学习完成进度"></progress></div>`;
  }
  function lessonList(ids) {
    return `<ol class="learning-lesson-list">${ids.map(id => `<li>${lessonLink(id)}<span data-lesson-status="${id}" class="learning-lesson-status"></span></li>`).join('')}</ol>`;
  }
  function renderRoutes(root) {
    if (root.dataset.progressMounted) return;
    root.dataset.progressMounted = 'true';
    const series = window.EGG_CURRICULUM?.series || [];
    const families = window.EGG_CURRICULUM?.families || [];
    root.innerHTML = `<section class="learning-dashboard" aria-labelledby="learning-dashboard-title"><div><p class="eyebrow">我的学习记录</p><h2 id="learning-dashboard-title">每一小步，都留下来。</h2><p class="learning-total"><strong data-total-done>0</strong><span> / ${catalog.size} 课已标记学完</span></p><p class="learning-split" data-progress-split></p>${progressBar([...catalog])}<div class="learning-resume" data-progress-resume></div></div><aside class="learning-record-note"><strong>这是你自己记录的学习进度</strong><p>点击“标记本课已学完”不会运行积木，也不代表编辑器验收通过。多人、计时和存档仍需在真实项目中按清单试玩。</p><p data-progress-storage></p><button type="button" class="learning-clear" data-progress-clear>清除本浏览器学习记录</button></aside><p class="learning-notice" data-progress-notice role="status" aria-live="polite"></p></section><section aria-labelledby="learning-routes-title" class="learning-section"><div class="learning-section-heading"><div><p class="eyebrow">先选目标，再走小步</p><h2 id="learning-routes-title">八条推荐路线</h2></div><p>路线是建议顺序，不会锁定课程。学过的课会在所有路线中同步标记。</p></div><div class="learning-route-grid">${routes.map((route, index) => { const ids = unique(route.steps.flatMap(item => item.ids)); return `<article class="learning-route-card learning-route-tone-${index % 3}" id="route-${route.id}"><p class="learning-route-label"><span>${String(index + 1).padStart(2, '0')}</span>${escape(route.label)}</p><h3>${escape(route.name)}</h3><p class="learning-route-description">${escape(route.text)}</p>${route.id === 'big-numbers' ? '<a class="learning-lab-link" href="big-number-lab.html">打开大数算法实验室 →<small>网页算法演示 · 不计入 145 课 · 不代表游戏编辑器已验证</small></a>' : ''}${progressBar(ids)}<a class="button button-blue learning-next" data-progress-next="${ids.join(',')}" href="lesson.html?id=${ids[0]}">从第一课开始</a><details><summary>查看建议顺序 · ${ids.length} 课</summary><ol class="learning-route-steps">${route.steps.map(item => `<li><h4>${escape(item.title)}</h4><p>${escape(item.note)}</p>${lessonList(item.ids)}</li>`).join('')}</ol></details></article>`; }).join('')}</div></section><section class="learning-section" aria-labelledby="learning-catalog-title"><div class="learning-section-heading"><div><p class="eyebrow">完整课程地图</p><h2 id="learning-catalog-title">6 课入门 + ${series.length} 个实战专题</h2></div><p>每个专题都有建议先修。同一方案内按顺序学习；数值图大数部分按用途选择独立分支，不混接不同方案。</p></div><nav class="learning-family-jumps" aria-label="跳到课程方向"><a href="#learning-foundation">入门基础</a>${families.map(family => `<a href="#learning-family-${escape(family.id)}">${escape(family.name)}</a>`).join('')}</nav><details class="learning-series learning-foundation" id="learning-foundation" open><summary><span><small>从这里开始 · ID 0–5</small><strong>入门课程</strong></span><span data-series-progress="${foundation.join(',')}"></span></summary><div class="learning-series-body"><p>事件 → 变量 → 条件与循环 → 列表与复用。Lua 为概念拓展，不是后续积木课程的硬性门槛。</p>${lessonList(foundation)}</div></details>${families.map(family => `<section class="learning-family" id="learning-family-${escape(family.id)}" aria-labelledby="learning-family-heading-${escape(family.id)}"><h3 id="learning-family-heading-${escape(family.id)}">${escape(family.name)}</h3><p>${escape(family.description)}</p><div class="learning-series-grid">${series.filter(item => item.family === family.id).map(item => { const requirement = requirements[item.id] || {ids: core, note: '先理解事件、变量、条件与列表。'}; return `<details class="learning-series" id="learning-series-${escape(item.id)}"><summary><span><small>${item.lessonIds.length} 课 · ID ${item.lessonIds[0]}–${item.lessonIds[item.lessonIds.length - 1]}</small><strong>${escape(item.name)}</strong></span><span data-series-progress="${item.lessonIds.join(',')}"></span></summary><div class="learning-series-body"><p>${escape(item.description)}</p><div class="learning-prerequisites"><h4>建议先修</h4><p>${escape(requirement.note)}</p><p class="learning-prerequisite-count" data-prerequisite-progress="${requirement.ids.join(',')}"></p><details><summary>查看先修课程</summary>${lessonList(requirement.ids)}</details></div>${lessonList(item.lessonIds)}<a class="learning-directory-link" href="practice.html#${escape(item.id)}">打开专题目录 →</a></div></details>`; }).join('')}</div></section>`).join('')}</section>`;
  }
  function currentLesson() {
    if (document.body.dataset.page !== 'lesson') return null;
    const raw = new URLSearchParams(window.location.search).get('id') ?? '0';
    return /^\d+$/.test(raw) && valid(Number(raw)) ? Number(raw) : null;
  }
  function mountLesson(id) {
    const article = document.querySelector('.lesson-article');
    const header = article?.querySelector('.article-header');
    if (!header || article.querySelector('[data-learning-lesson-panel]')) return;
    const panel = document.createElement('section');
    panel.className = 'learning-lesson-panel';
    panel.dataset.learningLessonPanel = String(id);
    panel.setAttribute('aria-label', '本课学习记录');
    panel.innerHTML = `<div class="learning-lesson-panel-top"><div><strong data-current-lesson-status></strong><p>由你手动记录，不代表编辑器验收通过</p></div><button type="button" class="button button-blue" data-progress-toggle="${id}" aria-pressed="false">标记本课已学完</button></div><div class="learning-lesson-panel-bottom"><a href="learning-path.html">查看学习路线与全部进度 →</a><span data-progress-compact-count></span></div><p class="learning-storage-note" data-progress-storage></p><p class="learning-notice" data-progress-notice role="status" aria-live="polite"></p>`;
    header.after(panel);
  }
  function mountSummaries() {
    document.querySelectorAll('[data-learning-progress-summary]').forEach(node => {
      if (node.dataset.progressMounted) return;
      node.dataset.progressMounted = 'true';
      node.classList.add('learning-summary');
      node.innerHTML = '<div><strong>我的学习路线</strong><p><span data-progress-compact-count></span> · <span data-progress-source>本浏览器手动记录</span></p></div><a class="button button-white" href="learning-path.html">选择路线 / 继续学习 →</a>';
    });
  }
  const idsFrom = (node, name) => node.dataset[name].split(',').map(Number).filter(valid);
  function updateCards() {
    document.querySelectorAll('.course-card[data-lesson-id]').forEach(card => {
      const id = Number(card.dataset.lessonId);
      if (!valid(id)) return;
      const done = state.completed.includes(id);
      let badge = card.querySelector('[data-progress-card-badge]');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'learning-card-status';
        badge.dataset.progressCardBadge = 'true';
        (card.querySelector('.course-info') || card).append(badge);
      }
      const text = done ? '✓ 已标记学完' : '尚未标记学完';
      if (badge.textContent !== text) badge.textContent = text;
      badge.classList.toggle('is-complete', done);
      card.classList.toggle('learning-is-complete', done);
    });
  }
  function update() {
    const shared=cloudMode()?window.EGG_SPACE?.getState():null;
    document.querySelectorAll('[data-progress-source]').forEach(node=>{node.textContent=cloudMode()?'账号学习记录':'本浏览器手动记录';});
    document.querySelectorAll('[data-progress-clear]').forEach(node=>{node.hidden=cloudMode();});
    const completed = state.completed.length;
    document.querySelectorAll('[data-total-done]').forEach(node => { node.textContent = completed; });
    document.querySelectorAll('[data-progress-compact-count]').forEach(node => { node.textContent = `已学完 ${completed} / ${catalog.size} 课`; });
    document.querySelectorAll('[data-progress-split]').forEach(node => { node.textContent = `入门 ${count(foundation)} / 6 · 实战 ${count([...catalog].filter(id => id >= 6))} / ${catalog.size - 6}`; });
    document.querySelectorAll('[data-progress-storage]').forEach(node => { node.textContent = statusText(); });
    document.querySelectorAll('[data-progress-ids]').forEach(node => {
      const ids = idsFrom(node, 'progressIds');
      const done = count(ids);
      node.querySelector('[data-progress-count]').textContent = `${done} / ${ids.length} 课已学完`;
      node.querySelector('[data-progress-percent]').textContent = `${Math.round(done / ids.length * 100) || 0}%`;
      const progress = node.querySelector('progress');
      progress.value = done;
      progress.setAttribute('aria-label', `已标记学完 ${done} / ${ids.length} 课`);
    });
    document.querySelectorAll('[data-series-progress]').forEach(node => {
      const ids = idsFrom(node, 'seriesProgress');
      node.textContent = `${count(ids)} / ${ids.length} 已学完`;
      node.classList.toggle('is-complete', count(ids) === ids.length);
    });
    document.querySelectorAll('[data-prerequisite-progress]').forEach(node => {
      const ids = idsFrom(node, 'prerequisiteProgress');
      node.textContent = `先修记录：${count(ids)} / ${ids.length} 课已学完${count(ids) === ids.length ? '，可以继续探索。' : '；可先补齐，也可随时回看。'}`;
    });
    document.querySelectorAll('[data-lesson-status]').forEach(node => {
      const done = state.completed.includes(Number(node.dataset.lessonStatus));
      node.textContent = done ? '✓ 已学完' : '待学习';
      node.classList.toggle('is-complete', done);
    });
    document.querySelectorAll('[data-progress-next]').forEach(node => {
      const ids = idsFrom(node, 'progressNext');
      const next = ids.find(id => !state.completed.includes(id));
      node.href = `lesson.html?id=${next ?? ids[0]}`;
      node.textContent = next === undefined ? '已全部标记 · 回顾路线' : count(ids) ? '继续下一堂未完成课 →' : '从这条路线开始 →';
      node.setAttribute('aria-label', `${node.textContent}：${title(next ?? ids[0])}`);
    });
    document.querySelectorAll('[data-progress-toggle]').forEach(button => {
      button.disabled=Boolean(shared && (!shared.ready || shared.saving));
      const done = state.completed.includes(Number(button.dataset.progressToggle));
      button.setAttribute('aria-pressed', String(done));
      button.textContent = done ? '取消本课已学完标记' : '标记本课已学完';
      const panel = button.closest('[data-learning-lesson-panel]');
      if (panel) {
        panel.classList.toggle('is-complete', done);
        panel.querySelector('[data-current-lesson-status]').textContent = done ? '✓ 本课已标记学完' : '学完这一课，给自己留个标记';
      }
    });
    document.querySelectorAll('[data-progress-resume]').forEach(node => {
      const id = state.lastLesson;
      node.innerHTML = valid(id) ? `<span>上次打开</span>${lessonLink(id)}<small>${state.completed.includes(id) ? '已标记学完，可随时回顾' : '打开课程不会自动标记完成'}</small>` : '<span>还没有最近阅读记录，从下方选一条路线开始吧。</span>';
    });
    updateCards();
  }
  function watchCards() {
    if (!window.MutationObserver) return;
    if (!observer) observer = new MutationObserver(() => {
      if (refreshPending) return;
      refreshPending = true;
      Promise.resolve().then(() => { refreshPending = false; updateCards(); });
    });
    document.querySelectorAll('#courses-grid, #practice-grid').forEach(node => {
      if (watched.has(node)) return;
      watched.add(node);
      observer.observe(node, {childList: true, subtree: true});
    });
  }
  function bind() {
    if (bound) return;
    bound = true;
    document.addEventListener('click', async event => {
      const target = event.target instanceof window.Element ? event.target : null;
      const toggle = target?.closest('[data-progress-toggle]');
      if (toggle) {
        const id = Number(toggle.dataset.progressToggle);
        if(toggle.disabled)return;
        toggle.disabled=true;
        try{await setCompleted(id, !state.completed.includes(id));}finally{update();}
      }
      if (target?.closest('[data-progress-clear]')) clearProgress();
    });
    window.addEventListener('storage', event => {
      if(cloudMode())return;
      if (event.key !== KEY && event.key !== null) return;
      try { if (event.storageArea && event.storageArea !== window.localStorage) return; } catch { return; }
      const latest = read();
      if (latest.mode === 'unavailable') { mode = latest.mode; update(); return; }
      state = latest.state;
      mode = latest.mode;
      update();
      announce('已同步本浏览器其他页面的学习记录。');
    });
  }
  function init() {
    refreshCatalog();
    if (!loaded) load();
    bind();
    if(cloudMode()&&!sharedSubscribed&&window.EGG_SPACE){
      sharedSubscribed=true;
      window.EGG_SPACE.subscribe(()=>{readShared();update();rememberShared();});
      readShared();
    }
    const root = document.getElementById('learning-path-content');
    if (root) renderRoutes(root);
    mountSummaries();
    const id = currentLesson();
    if (id !== null) {
      mountLesson(id);
      if (cloudMode())rememberShared();
      else if (lastRemembered !== id) {
        // Reading alone never changes completion. Corrupt/unknown records are not replaced by a visit.
        if (mode === 'persistent') save(next => { next.lastLesson = id; });
        else state.lastLesson = id;
        lastRemembered = id;
      }
    }
    update();
    watchCards();
  }
  window.EGG_PROGRESS = Object.freeze({init, setCompleted, clearProgress,
    getState: () => ({...state, completed: [...state.completed], storageMode: mode}),
    storageKey: KEY, version: VERSION});
})();
