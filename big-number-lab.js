/* 网页算法演示：只对单个十进制数字做数值运算，不把完整大数转成数值。 */
(function (root) {
  'use strict';
  const LIMIT = 60;
  const DIGITS = '0123456789';
  function clean(s) { let i = 0; while (i < s.length - 1 && s[i] === '0') i++; return s.slice(i); }
  function validate(value, label = '输入', limit = LIMIT) {
    if (typeof value !== 'string' || !/^[0-9]+$/.test(value)) throw new Error(label + '只接受 ASCII 数字 0–9，不能为空；空格、负号、小数、逗号、全角数字和科学计数法均不接受。');
    if (value.length > limit) throw new Error(label + '最多 ' + limit + ' 位（包含前导零），请缩短后重试。');
    return clean(value);
  }
  function digit(s, i) { return i < 0 ? 0 : s.charCodeAt(i) - 48; }
  function record(trace, phase, note, state) { if (trace) trace.push({phase, note, state: state || ''}); }
  function cmp(a, b, trace) {
    if (a.length !== b.length) {
      const r = a.length < b.length ? -1 : 1;
      record(trace, '先比长度', 'A 有 ' + a.length + ' 位，B 有 ' + b.length + ' 位，较长者较大。'); return r;
    }
    for (let i = 0; i < a.length; i++) {
      const x = digit(a, i), y = digit(b, i);
      record(trace, '比较第 ' + (i + 1) + ' 位', '索引 ' + i + '：' + x + ' 与 ' + y + (x === y ? ' 相等，继续。' : ' 不同，立即确定大小。'));
      if (x !== y) return x < y ? -1 : 1;
    }
    return 0;
  }
  function plus(a, b, trace) {
    let out = '', carry = 0;
    const count = Math.max(a.length, b.length);
    for (let k = 0; k < count; k++) {
      const x = digit(a, a.length - 1 - k), y = digit(b, b.length - 1 - k), before = carry;
      const t = x + y + carry; carry = t >= 10 ? 1 : 0; const d = t - carry * 10;
      out = DIGITS[d] + out;
      record(trace, '加法 · 右起第 ' + (k + 1) + ' 位', x + ' + ' + y + ' + 进位 ' + before + ' = ' + t + '；写 ' + d + '，新进位 ' + carry, out);
    }
    if (carry) { out = '1' + out; record(trace, '补最高位', '最后的进位 1 放到最左边。', out); }
    return clean(out);
  }
  function minus(a, b, trace) {
    if (cmp(a, b) < 0) throw new Error('本实验只计算非负整数：A 小于 B，不能直接相减。可交换 A、B，或选择“模拟扣血”。');
    let out = '', borrow = 0;
    for (let k = 0; k < a.length; k++) {
      const x = digit(a, a.length - 1 - k), y = digit(b, b.length - 1 - k), before = borrow;
      let t = x - y - borrow; borrow = t < 0 ? 1 : 0; if (borrow) t += 10;
      out = DIGITS[t] + out;
      record(trace, '减法 · 右起第 ' + (k + 1) + ' 位', x + ' − ' + y + ' − 借位 ' + before + '；写 ' + t + '，新借位 ' + borrow, out);
    }
    return clean(out);
  }
  function times(a, b, trace) {
    if (a === '0' || b === '0') { record(trace, '零的短路分支', '任一因数为 0，直接得到 0。', '0'); return '0'; }
    const m = a.length, n = b.length, slots = Array(m + n).fill(0);
    record(trace, '初始化结果格', '创建 ' + (m + n) + ' 个整数格，全部为 0；索引从 0 到 ' + (m + n - 1) + '。', slots.join(''));
    for (let i = m - 1; i >= 0; i--) {
      let carry = 0;
      for (let j = n - 1; j >= 0; j--) {
        const k = i + j + 1, old = slots[k], previousCarry = carry, x = digit(a, i), y = digit(b, j);
        const t = old + x * y + carry;
        carry = Math.floor(t / 10); slots[k] = t - carry * 10;
        record(trace, '乘法 · A[' + i + '] × B[' + j + ']', '结果格[' + k + ']：旧值 ' + old + ' + ' + x + ' × ' + y + ' + 进位 ' + previousCarry + ' = ' + t + '；写 ' + slots[k] + '，进位 ' + carry, slots.join(''));
      }
      slots[i] = carry;
      record(trace, '收好这一行的进位', '写结果格[' + i + '] = ' + carry + '；下一行重新从进位 0 开始。', slots.join(''));
    }
    return clean(slots.join(''));
  }
  function divide(a, b, trace) {
    if (b === '0') throw new Error('除数不能为 0（包含 00、000 等写法）。请修改 B 后重试。');
    let quotient = '', remainder = '0';
    for (let i = 0; i < a.length; i++) {
      const before = remainder;
      remainder = clean(remainder + a[i]);
      let q = 0; const brought = remainder;
      const subtractions = [];
      while (cmp(remainder, b) >= 0) {
        const old = remainder;
        remainder = minus(remainder, b); q++;
        subtractions.push(old + ' − ' + b + ' = ' + remainder);
        if (q > 9) throw new Error('内部不变量错误：本位商不应超过 9。');
      }
      quotient += DIGITS[q];
      record(trace, '除法 · 落下 A[' + i + '] = ' + a[i], '旧余数 ' + before + ' 拼接本位 → ' + brought + '。' + (q ? subtractions.join('；') + '。' : '小于除数，不减。') + ' 本位商 ' + q + '，余数 ' + remainder + ' < ' + b, '商前缀 ' + quotient + ' ｜ 余数 ' + remainder);
    }
    return {quotient: clean(quotient), remainder};
  }
  function units(value) {
    const s = validate(value, '显示值', 120);
    if (s.length <= 4) return s;
    const names = ['', '万', '亿', '兆', '京', '垓', '秭', '穰', '沟', '涧', '正', '载'];
    const group = Math.floor((s.length - 1) / 4), exponent = group * 4, lead = s.length - exponent;
    const tail = s.slice(lead, lead + 2).padEnd(2, '0');
    const shown = s.slice(0, lead) + '.' + tail;
    const omittedNonzero = /[1-9]/.test(s.slice(lead + 2));
    return (omittedNonzero ? '约 ' : '') + shown + (names[group] || ' × 10^' + exponent) + (omittedNonzero ? '（截断显示）' : '');
  }
  function calculate(operation, rawA, rawB) {
    const a = validate(rawA, 'A'), b = validate(rawB, 'B'), trace = [];
    record(trace, '校验与规范化', '只保留合法数字字符串；去除前导零，零统一为 "0"。', 'A = ' + a + ' ｜ B = ' + b);
    const result = {operation, a, b, trace};
    if (operation === 'compare') { const c = cmp(a, b, trace); result.value = c < 0 ? '<' : c > 0 ? '>' : '='; result.comparison = c; }
    else if (operation === 'add') result.value = plus(a, b, trace);
    else if (operation === 'subtract') result.value = minus(a, b, trace);
    else if (operation === 'multiply') result.value = times(a, b, trace);
    else if (operation === 'divide') { const d = divide(a, b, trace); result.value = d.quotient; result.remainder = d.remainder; }
    else if (operation === 'damage') {
      const c = cmp(a, b, trace);
      result.value = c <= 0 ? '0' : minus(a, b, trace);
      result.defeated = c <= 0;
      record(trace, '虚拟生命结算', c <= 0 ? '伤害 ≥ 剩余生命，生命钳制为 0；由项目单独处理击败逻辑。' : '剩余生命 = 生命字符串 − 伤害字符串。', result.value);
    } else throw new Error('未知运算。');
    return result;
  }
  const api = Object.freeze({LIMIT, validate, calculate, units,
    compare: (a, b) => cmp(validate(a), validate(b)),
    add: (a, b) => plus(validate(a), validate(b)),
    subtract: (a, b) => minus(validate(a), validate(b)),
    multiply: (a, b) => times(validate(a), validate(b)),
    divide: (a, b) => divide(validate(a), validate(b))});
  root.EGG_BIG_NUM = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof document === 'undefined') return;
  const $ = id => document.getElementById(id);
  function renderDiagrams() {
    const blocks = root.EGG_BLOCKS;
    if (!blocks) return;
    const variables = [
      ['a / b / s / 规范串 / 差串 / 积串 / 商串 / 余串 / 除前缀', '字符串'],
      ['乘格', '整数列表'],
      ['乘长A / 乘长B / 乘i / 乘j / 乘k / 乘x / 乘y / 乘临时 / 乘进位 / 乘拼 / 位值 / 比较值 / 除索引 / 除本位商 / p', '整数'],
      ['除法有效 / 减法有效 / 运算中', '布尔值']
    ];
    const helperSignatures = `【自建】BN取一位〔s：字符串，p：整数〕
  助手内部按本页第02节搭建
【自建】BN规范化〔s：字符串〕
  助手内部按本页第02节搭建
【自建】BN比较〔a：字符串，b：字符串〕
  助手内部按本页第02节搭建
【自建】BN减法〔a：字符串，b：字符串〕
  助手内部按本页第02节搭建`;
    const multiply = `【自建】BN乘法〔a：字符串，b：字符串〕
  前置：a、b是已经校验并规范化的数字字符串
  如果 a="0" 或 b="0"
    积串 ← "0"
  否则
    乘长A ← 获取字符串长度〔a〕
    乘长B ← 获取字符串长度〔b〕
    乘格 ← []
    重复执行〔乘长A+乘长B〕
      乘格 追加 0
    乘i ← 乘长A-1
    重复执行〔乘长A〕
      乘进位 ← 0
      乘j ← 乘长B-1
      【自建】BN取一位〔a，乘i〕
      乘x ← 位值
      重复执行〔乘长B〕
        【自建】BN取一位〔b，乘j〕
        乘y ← 位值
        乘k ← 乘i+乘j+1
        乘临时 ← (乘格[乘k]+乘x×乘y)+乘进位
        乘进位 ← 0
        重复执行〔9〕
          如果 乘临时≥10
            乘临时 ← 乘临时-10
            乘进位 ← 乘进位+1
        乘格[乘k] ← 乘临时
        乘j ← 乘j-1
      乘格[乘i] ← 乘进位
      乘i ← 乘i-1
    积串 ← ""
    乘拼 ← 0
    重复执行〔乘长A+乘长B〕
      积串 ← 字符串扩展〔积串，截取字符串〔"0123456789"，乘格[乘拼]，乘格[乘拼]+1〕〕
      乘拼 ← 乘拼+1
    【自建】BN规范化〔积串〕
    积串 ← 规范串`;
    const divide = `【自建】BN除法〔a：字符串，b：字符串〕
  前置：a、b是已经校验并规范化的数字字符串
  商串 ← "0"
  余串 ← "0"
  除法有效 ← 假
  如果 b="0"
    无效：调用者读除法有效，报除零错误，不使用商和余数
  否则
    除法有效 ← 真
    商串 ← ""
    除索引 ← 0
    重复执行〔获取字符串长度〔a〕〕
      除前缀 ← 字符串扩展〔余串，截取字符串〔a，除索引，除索引+1〕〕
      【自建】BN规范化〔除前缀〕
      余串 ← 规范串
      除本位商 ← 0
      重复执行〔9〕
        【自建】BN比较〔余串，b〕
        如果 比较值≥0
          【自建】BN减法〔余串，b〕
          如果 减法有效=真
            余串 ← 差串
            除本位商 ← 除本位商+1
      商串 ← 字符串扩展〔商串，截取字符串〔"0123456789"，除本位商，除本位商+1〕〕
      除索引 ← 除索引+1
    【自建】BN规范化〔商串〕
    商串 ← 规范串`;
    const sections = [{tree: helperSignatures}, {tree: multiply}, {tree: divide}];
    for (const [id, tree, label] of [['bn-multiply-diagram', multiply, 'BN乘法 · 自定义内部完整连接'], ['bn-divide-diagram', divide, 'BN除法 · 自定义内部完整连接']]) {
      const target = $(id); if (!target) continue;
      target.innerHTML = blocks.legend() + blocks.figure(blocks.fromTree(tree, {variables, sections}), label, '参数和结果槽见变量表；BN助手是自建动作；灰框为说明；尚未原生实测');
    }
    const V = blocks.variable, L = blocks.literal;
    const action = (name, ...parts) => ({kind: 'action', parts: [name, ...parts]});
    const set = (name, value) => action('设置变量', V(name), '=', L(value));
    const call = (name, a, b) => ({kind: 'custom', parts: ['自定义动作', name, L(a), L(b)], inputLabels: ['a · 字符串', 'b · 字符串']});
    const entry = [{kind: 'event', parts: ['游戏初始化'], children: [
      {kind: 'control', parts: ['如果', blocks.condition(['比较', V('运算中'), '=', L('假')])], children: [
        set('运算中', '真'), call('BN乘法', '12', '34'), action('发送信息', V('积串')),
        call('BN除法', '12345', '67'),
        {kind: 'control', parts: ['如果', blocks.condition(['比较', V('除法有效'), '=', L('真')])], children: [action('发送信息', V('商串')), action('发送信息', V('余串'))], otherwise: [action('发送信息', L('除法无效，请检查除数'))]},
        set('运算中', '假')
      ]}
    ]}];
    if ($('bn-entry-diagram')) $('bn-entry-diagram').innerHTML = blocks.figure(entry, '主触发器 · 固定用例调用', '本图使用已知合法的固定输入；正式输入先校验，再规范化，最后调用核心');
  }
  function init() {
    if (!$('bn-form')) return;
    renderDiagrams();
    let current = null, traceIndex = 0;
    const examples = [
      {label: '全字符串乘法', operation: 'multiply', a: '12345678901234567890', b: '98765432109876543210'},
      {label: '长除法 12345 ÷ 67', operation: 'divide', a: '12345', b: '67'},
      {label: '借位穿过零', operation: 'subtract', a: '10000000000000000000', b: '1'},
      {label: '超大伤害扣血', operation: 'damage', a: '100000000000000000000', b: '99999999999999999999'},
      {label: '前导零归一', operation: 'compare', a: '000123', b: '123'},
      {label: '除零保护', operation: 'divide', a: '888', b: '000'},
      {label: '60 位 × 60 位', operation: 'multiply', a: '9'.repeat(60), b: '9'.repeat(60)}
    ];
    for (const ex of examples) {
      const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'bn-example'; btn.textContent = ex.label;
      btn.addEventListener('click', () => { $('bn-a').value = ex.a; $('bn-b').value = ex.b; $('bn-operation').value = ex.operation; updateCounts(); run(); });
      $('bn-examples').appendChild(btn);
    }
    function updateCounts() { $('bn-count-a').textContent = $('bn-a').value.length + ' / 60 位'; $('bn-count-b').textContent = $('bn-b').value.length + ' / 60 位'; }
    function showTrace() {
      const step = current.trace[traceIndex];
      $('bn-step-title').textContent = step.phase;
      $('bn-step-note').textContent = step.note;
      $('bn-step-state').textContent = step.state;
      $('bn-step-state').hidden = !step.state;
      $('bn-step-count').textContent = '第 ' + (traceIndex + 1) + ' / ' + current.trace.length + ' 步';
      $('bn-prev').disabled = traceIndex === 0;
      $('bn-next').disabled = traceIndex === current.trace.length - 1;
      $('bn-first').disabled = traceIndex === 0;
      $('bn-last').disabled = traceIndex === current.trace.length - 1;
      $('bn-step-range').max = String(current.trace.length); $('bn-step-range').value = String(traceIndex + 1);
    }
    function run() {
      $('bn-error').hidden = true;
      $('bn-a').removeAttribute('aria-invalid'); $('bn-b').removeAttribute('aria-invalid');
      try {
        current = calculate($('bn-operation').value, $('bn-a').value, $('bn-b').value);
        $('bn-result').hidden = false;
        const labels = {compare: '大小关系', add: '精确的和', subtract: '精确的差', multiply: '精确的积', divide: '整数商', damage: '剩余虚拟生命'};
        $('bn-output-label').textContent = labels[current.operation];
        $('bn-output').textContent = current.operation === 'compare' ? current.a + ' ' + current.value + ' ' + current.b : current.value;
        $('bn-unit').textContent = current.operation === 'compare' ? '先比较位数，相同时逐位比较；没有把整串转为数字。' : '单位显示：' + units(current.value) + ' · 精确值仍以上方字符串为准';
        $('bn-remainder-wrap').hidden = current.operation !== 'divide'; $('bn-remainder').textContent = current.remainder || '';
        $('bn-output-note').textContent = current.operation === 'divide' ? '校验式：A = B × 商 + 余数，且 0 ≤ 余数 < B。' : current.operation === 'damage' ? (current.defeated ? '已到 0：这是网页虚拟生命模拟，没有调用原生伤害积木。' : '存储与扣减都使用字符串，没有调用原生伤害积木。') : current.operation === 'multiply' ? current.value.length + ' 位结果；每步临时数不超过 99。' : '所有输出已去除多余前导零。';
        traceIndex = 0; showTrace();
      } catch (err) {
        current = null; $('bn-result').hidden = true;
        for (const id of ['bn-output', 'bn-unit', 'bn-remainder', 'bn-output-note', 'bn-step-title', 'bn-step-note', 'bn-step-state', 'bn-step-count']) $(id).textContent = '';
        $('bn-error').textContent = err.message; $('bn-error').hidden = false;
      }
    }
    $('bn-form').addEventListener('submit', e => { e.preventDefault(); updateCounts(); run(); });
    $('bn-a').addEventListener('input', updateCounts); $('bn-b').addEventListener('input', updateCounts);
    $('bn-swap').addEventListener('click', () => { const a = $('bn-a').value; $('bn-a').value = $('bn-b').value; $('bn-b').value = a; updateCounts(); run(); });
    $('bn-prev').addEventListener('click', () => { if (current && traceIndex > 0) { traceIndex--; showTrace(); } });
    $('bn-next').addEventListener('click', () => { if (current && traceIndex + 1 < current.trace.length) { traceIndex++; showTrace(); } });
    $('bn-first').addEventListener('click', () => { if (current) { traceIndex = 0; showTrace(); } });
    $('bn-last').addEventListener('click', () => { if (current) { traceIndex = current.trace.length - 1; showTrace(); } });
    $('bn-step-range').addEventListener('input', e => { if (current) { traceIndex = Math.max(0, Math.min(current.trace.length - 1, e.target.valueAsNumber - 1)); showTrace(); } });
    updateCounts(); run();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})(typeof window !== 'undefined' ? window : globalThis);
