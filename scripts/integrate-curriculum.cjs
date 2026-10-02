#!/usr/bin/env node
'use strict';
// Deterministic append-only curriculum build. Legacy files are read, never rewritten.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const context = vm.createContext({ window: {} });
for (const file of ['lessons-data.js', 'tutorials.js', 'build-guides.js', 'progression-guides.js', 'manual-data.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
}
const original = [...context.window.EGG_LESSONS, ...context.window.EGG_TUTORIALS];
assert.equal(original.length, 40, 'Review stable ID allocation if the original curriculum changes');
const inputs = [['growth-lessons-1.json', 18], ['growth-lessons-2.json', 18], ['life-puzzle-lessons-1.json', 16], ['life-puzzle-lessons-2.json', 16], ['party-advanced-lessons-1.json', 19], ['party-advanced-lessons-2.json', 18]];
const additions = inputs.flatMap(([file, count]) => {
  const records = JSON.parse(fs.readFileSync(path.join(root, 'curriculum-source', file), 'utf8'));
  assert.equal(records.length, count, file + ' lesson count');
  return records;
});
const titles = new Set(original.map(item => item.title));
const manualIds = new Set(context.window.EGG_MANUAL.entries.map(entry => entry.id));
for (const [offset, record] of additions.entries()) {
  const { tutorial, guide } = record;
  assert.ok(tutorial && guide, 'Missing tutorial/guide at ' + offset);
  for (const field of ['title', 'series', 'category', 'summary', 'goal']) assert.ok(typeof tutorial[field] === 'string' && tutorial[field].trim(), field + ' at ' + offset);
  assert.ok(!titles.has(tutorial.title), 'Duplicate lesson: ' + tutorial.title);
  titles.add(tutorial.title);
  for (const field of ['setup', 'refs', 'variables', 'sections', 'tests']) assert.ok(Array.isArray(guide[field]), field + ' at ' + offset);
  assert.ok(guide.sections.length && guide.tests.length, 'Incomplete guide: ' + tutorial.title);
  guide.refs.forEach(id => assert.ok(manualIds.has(id), 'Unresolved block: ' + id));
  guide.variables.forEach(row => assert.equal(row.length, 3, 'Variable row: ' + tutorial.title));
  guide.sections.forEach(section => {
    assert.ok(section.title && section.tree && section.verify && section.steps?.length, 'Incomplete section: ' + tutorial.title);
  });
}
const families = [
  { id: 'starter', name: '积木与基础玩法', description: '先认识积木，再完成第一张地图。' },
  { id: 'growth', name: '成长与长期玩法', description: '从数值图到背包、技能、任务与可靠存档。' },
  { id: 'life', name: '经营与生活', description: '经营餐厅、照料农场，把日常变成玩法。' },
  { id: 'puzzle', name: '解谜与剧情', description: '机关、合作、推箱子与有分支的故事。' },
  { id: 'party', name: '多人派对', description: '清楚的身份、回合和胜负，让大家一起玩。' },
  { id: 'advanced', name: '进阶玩法', description: '节奏、塔防、肉鸽与更丰富的消消乐。' }
];
const definitions = [
  ['progression', '数值图', 'growth', '从训练成长到打怪养成，读懂大数转换与运算。'],
  ['inventory', '背包与物品管理', 'growth', '固定物品表、独立容量、整理与安全交易。'],
  ['equipment', '装备穿戴与属性计算', 'growth', '从装备实例到穿戴规则，准确重算每一项属性。'],
  ['pets', '宠物养成系统', 'growth', '宠物实例、成长与出战，搭好自己的养成伙伴。'],
  ['loot', '随机掉落与保底', 'growth', '看懂概率区间、随机掉落与保底规则。'],
  ['skills', '主动技能与冷却', 'growth', '技能入口、资源消耗与冷却，做出可靠的主动技能。'],
  ['effects', '增益与异常状态', 'growth', '把状态强度、叠加规则和到期时间分开管理。'],
  ['boss', '多阶段Boss', 'growth', '跨阶段、技能与结算，让首领战有清楚的节奏。'],
  ['quests', '任务与成就', 'growth', '从任务进度到成就奖励，避免重复计数和领取。'],
  ['offline', '离线收益', 'growth', '预览、结算、故障恢复，逐步接通离线收益。'],
  ['daily', '签到与每日刷新', 'growth', '固定业务日、签到奖励与可靠的每日刷新。'],
  ['ownership', '多人数据与奖励归属', 'growth', '识别真实玩家，让个人数据与奖励各归其主。'],
  ['save-migration', '存档升级与故障处理', 'growth', '加载分流、版本迁移与未知提交结果的处理。'],
  ['restaurant', '餐厅经营', 'life', '从一碗面到顾客、菜谱与经营结算。'],
  ['farm', '农场种植', 'life', '土地、播种、生长与收获，串起种植循环。'],
  ['fishing', '钓鱼与图鉴', 'life', '节拍钓鱼、鱼种收集与图鉴奖励。'],
  ['factory', '工厂流水线', 'life', '工位、输送与配方，确保每一件材料有去向。'],
  ['escape', '密室逃脱', 'puzzle', '收集线索、拿到钥匙，再用机关打开出口。'],
  ['cooperative', '双人合作解谜', 'puzzle', '把两人的意图同步成明确、可恢复的机关状态。'],
  ['sokoban', '推箱子关卡', 'puzzle', '网格移动、推动、撤销与关卡验收。'],
  ['story', '分支剧情冒险', 'puzzle', '用状态图管理选择、剧情分支和本局检查点。'],
  ['hide-seek', '躲猫猫', 'party', '藏身、伪装、寻找与一局结束的完整规则。'],
  ['disaster', '灾难生存', 'party', '预警、危险阶段、生存人数与安全结算。'],
  ['capture-flag', '团队夺旗', 'party', '分队、夺旗、归还和计分，做一场团队对抗。'],
  ['hot-potato', '烫手山芋', 'party', '持有人、传递冷却与引信，搭出紧张的淘汰赛。'],
  ['cards', '回合制卡牌', 'party', '牌库、手牌、回合与胜负，组合出卡牌对战。'],
  ['board', '棋盘掷骰冒险', 'party', '掷骰、走格、格子事件与回合冒险。'],
  ['rhythm', '节奏点击', 'advanced', '先测量时间精度，再设计判定窗口与连击。'],
  ['tower-defense', '塔防', 'advanced', '路线、波次、炮塔与伤害结算。'],
  ['roguelike', '肉鸽闯关', 'advanced', '房间分岔、随机强化与单局成长。'],
  ['match3-advanced', '消消乐进阶', 'advanced', '在基础消消乐上增加特殊棋子、冰层与颜色目标。'],
  ['match3', '消消乐', 'starter', '从棋盘到完整关卡，建议按六课顺序学习。'],
  ['gameplay', '玩法拓展', 'starter', '限时收集、记忆机关、跑酷与双开关联动。'],
  ['basics', '积木练习', 'starter', '从提示到机关，先练好每一块积木。']
];
const all = [...original, ...additions.map(record => record.tutorial)];
const series = definitions.map(([id, name, family, description]) => ({
  id, name, family, description,
  lessonIds: all.map((item, index) => index >= 6 && (item.series || '积木练习') === name ? index : null).filter(id => id !== null)
}));
assert.equal(series.reduce((sum, item) => sum + item.lessonIds.length, 0), 139, 'Every practical lesson must have one series');
const curriculum = { version: '20261002-quality', foundationCount: 6, originalCount: 40, addedCount: additions.length, totalCount: all.length, families, series };
const json = value => JSON.stringify(value, null, 2).replace(/</g, '\\u003c');
const outputs = { 'curriculum-expansion.js': '"use strict";\n// Generated by scripts/integrate-curriculum.cjs. Stable IDs start at 40.\nwindow.EGG_EXPANSION_LESSONS = [];\nwindow.EGG_CURRICULUM = ' + json(curriculum) + ';\n' };
function chunks(records) {
  const groups = []; let group = [], size = 0;
  for (const record of records) {
    const bytes = Buffer.byteLength(json(record));
    if (group.length && size + bytes > 170000) { groups.push(group); group = []; size = 0; }
    group.push(record); size += bytes;
  }
  if (group.length) groups.push(group);
  return groups;
}
chunks(additions.map(record => record.tutorial)).forEach((group, index) => {
  outputs[`curriculum-lessons-${String(index + 1).padStart(2, '0')}.js`] = '"use strict";\n// Generated lesson metadata, in stable append order.\nwindow.EGG_EXPANSION_LESSONS.push(...' + json(group) + ');\n';
});
chunks(additions.map((record, offset) => [40 + offset, record.guide])).forEach((group, index) => {
  outputs[`curriculum-guides-${String(index + 1).padStart(2, '0')}.js`] = '"use strict";\n// Generated append-only guides. Load before block-diagrams.js.\nObject.assign(window.EGG_BUILD_GUIDES, ' + json(Object.fromEntries(group)) + ');\n';
});
for (const [file, content] of Object.entries(outputs)) {
  if (process.argv.includes('--check')) assert.equal(fs.readFileSync(path.join(root, file), 'utf8'), content, file + ' is stale; rerun this script');
  else fs.writeFileSync(path.join(root, file), content);
}
console.log(`${process.argv.includes('--check') ? 'Verified' : 'Generated'} ${additions.length} additions; ${all.length} lessons across ${series.length} practical series. Legacy IDs 0–39 are unchanged.`);
