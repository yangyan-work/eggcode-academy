"use strict";
// 阅读辅助来自逐课详解和原文类型。手册分类不冒充未经核对的编辑器菜单。
window.EGG_DETAIL_UI = (() => {
  const esc = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const list=(items,tag='ol')=>`<${tag}>${(items||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</${tag}>`;
  function location(entry){
    const params=new URLSearchParams({platform:entry.platform,category:entry.category,group:entry.group,q:entry.title});
    const twins=(window.EGG_MANUAL?.entries||[]).filter(e=>e.title===entry.title&&e.platform===entry.platform&&e.id!==entry.id);
    return `<div class="block-location"><p class="eyebrow">先找到这一块</p><p class="block-path">手册定位：${esc(entry.platform)} → ${esc(entry.category)} → ${esc(entry.group)} → <strong>${esc(entry.title)}</strong></p><ol><li>在本站积木手册先选“${esc(entry.platform)}”，再选“${esc(entry.category)}”和“${esc(entry.group)}”，搜索完整名称“${esc(entry.title)}”。<a href="manual.html?${esc(params.toString())}">打开已筛选的手册</a></li><li>${entry.platform==='移动端'?'移动端先从“更多 → 高级功能 → 蛋码编辑”进入，并按本课说明选对触发器区域。可在积木库右下角搜索完整名称，打开积木列表左上角“说明”查看官方讲解，再点击或拖入画布。':'按当前平台进入蛋码画布，在积木库按完整名称搜索或按类别查找，再点击或拖入画布；电脑端不要照搬手机端的左右方位。'}分类名称来自手册快照；位置不同时以完整名称、对象类型和参数核对。</li><li>${entry.category==='基础'?'本条是基础说明，不是可拖入画布的单块积木。':`核对本条对象组为“${esc(entry.group)}”，平台为“${esc(entry.platform)}”；再逐项对照下方参数，不要把同名的其他对象版本拖进来。`}</li></ol>${entry.title==='比较'?'<p class="callout warning">手册的比较参数表存在多类型说明与右槽整数标注不一致。非整数比较请先在当前编辑器核对可接入类型；不要把玩家对象换成姓名字符串或把小数强行取整。</p>':''}${twins.length?`<details><summary>同一平台还有 ${twins.length} 个同名版本，怎样分清？</summary><p>当前选用“${esc(entry.group)}”组。只有目标对象、输入类型和用途都对应时才换用其他版本。</p><ul>${twins.map(e=>`<li><a href="block.html?id=${esc(e.id)}">${esc(e.category)} → ${esc(e.group)} → ${esc(e.title)}</a></li>`).join('')}</ul></details>`:''}</div>`;
  }
  function slots(entry,ex){
    if(!ex.parameters.length)return '';
    const rows=ex.parameters.map(p=>{
      const role=p.type==='回调函数'?'内部动作区':p.type==='布尔值'?'条件 / 布尔参数槽':/列表$|权重池$/.test(p.type)?'对应类型容器变量':/预设/.test(p.type)?'对应预设资源选择':p.type==='待核对'?'原文缺项，先核对':/^(整数|定点数|字符串)$/.test(p.type)?'直接填写，或嵌入同类型取值':'同类型值 / 对象引用';
      const checks=p.type==='回调函数'?'动作要在内部凹槽中，不是在这块积木下方并排连接。':p.type==='布尔值'?'输出必须是真/假，不是字符串“真”或整数1。':/列表$/.test(p.type)?'元素类型与本条版本一致；读取前先确认长度和0起始索引。':/预设/.test(p.type)?'选的是资源模板，不能拿场景中的运行时对象代替。':/^(整数|定点数)$/.test(p.type)?'确认单位、正负号和范围；整数槽不填小数。':p.type==='字符串'?'文本原样输入，名称、字段、事件名大小写及空格一致。':'核对对象类型、有效期与本条限制；不把对象名称当字符串。';
      return `<tr><td>第 ${p.index+1} 槽</td><td>${esc(p.type)}</td><td>${esc(role)}<br>${esc(p.help)}</td><td>${esc(checks)}</td></tr>`;
    }).join('');
    return `<div class="slot-workbench"><h3>参数怎么填</h3><p>槽位编号与官方描述一致。名称和值见下方例子；多类型参数按本例选用的类型填写。</p><div class="table-wrap"><table><thead><tr><th>槽位</th><th>类型</th><th>填法</th><th>注意</th></tr></thead><tbody>${rows}</tbody></table></div><p>手册未列明的参数标为“待核对”，不补猜测值。</p></div>`;
  }
  function wiring(entry,ex){
    if(entry.category==='基础')return `<section class="wiring-walkthrough"><h3>先按基础说明操作</h3>${list(ex.steps)}</section>`;
    const place={事件:'把这块作为当前触发器的事件头，放在动作链最上方；不要把事件头塞进另一块动作的参数槽。',动作:'先放能触发本次测试的事件头，把本块接到该事件的动作区；继续的动作再接在本块下方。',条件:'先放“如果/否则”，把本块嵌入其条件槽；成立动作放在成立区，不成立动作放在否则区。',控制:'将本块接在本次事件的动作区。重复、分支或计时回调的动作接在内部动作槽，只有明确要在控制结束后执行的动作才接到整块下方。',取值:'先选择一个需要本条输出类型的参数槽，把本块嵌进去。例如示例要求记录结果时，把它放入“设置变量”的新值槽；变量类型必须与输出一致。'}[entry.category];
    return `<section class="wiring-walkthrough"><h3>接在哪</h3><p>${esc(place||'按下方例子的连接图放置。')}</p><p><a href="editor-guide.html">触发器区域与对象引用说明</a></p></section>`;
  }
  function referenceCards(guide,index){
    const entries=window.EGG_MANUAL?.entries||[];
    return `<div class="lesson-block-cards">${guide.refs.map(id=>{
      const e=entries.find(x=>x.id===id);if(!e)return '';
      return `<details class="lesson-block-card"><summary>${esc(e.title)} <small>${esc(e.category)} · ${esc(e.group)}</small></summary>${location(e)}<p><a class="text-link" href="block.html?id=${esc(id)}&lesson=${index}">看这块的每个参数、接法与完整例子 →</a></p></details>`;
    }).join('')}</div>`;
  }
  function variableTable(guide,detail){
    if(!guide.variables.length)return '<p>本课不需要创建变量。</p>';
    const rows=guide.variables.map(row=>{
      const names=row[0].split(/[／/、；;，,]/).map(x=>x.trim()).filter(Boolean);
      const matches=(detail?.variableSteps||[]).map((text,index)=>({text,index})).filter(({text})=>names.some(name=>{
        if(/^[A-Za-z0-9_]+$/.test(name)){const escaped=name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');return new RegExp('(^|[^A-Za-z0-9_])'+escaped+'([^A-Za-z0-9_]|$)').test(text);}
        return name.length>1&&text.includes(name);
      }));
      const type=row[1];let why='本项可能包含不同类型或动作上下文，必须按对应的逐项创建说明区分；不能整行统一设成全局变量。';
      if(/列表$/.test(type))why='把同一种类型的多个值按顺序保存；索引用于找到对应项。先建立长度，再按0起始索引访问，元素类型不能混用。';
      else if(type==='整数')why='用于计数、编号、索引或离散状态（例如0/1）。这些值需要精确整数；初值和重置时点按本行用途确定。';
      else if(/^(定点数|实数)$/.test(type))why='用于需要小数的时间、距离或原生数值。注意单位和引擎可表示范围，不用它保存超大精确金额。';
      else if(type==='字符串')why='保存文本、字段名或逐位数字文本。超大整数作为文本处理，不能先把整串转换成普通数值。';
      else if(type==='布尔值')why='记录只有真/假两种可能的条件或开关。不要拿文字“真”或整数1替代布尔值。';
      else if(/玩家|角色|组件|生物|技能|预设|坐标点|向量/.test(type)&&!/[；;/]/.test(type))why='这里保存对应类型的值或对象引用。预设、实际实例和事件参数需要分清；是否存成字段取决于创建说明，不能因类型是玩家就推断成玩家属性。';
      const evidence=matches.length?'<details class="variable-evidence"><summary>查看 '+matches.length+' 条创建与作用域说明</summary><ol>'+matches.map(m=>'<li>'+esc(m.text)+' <a href="#variable-step-'+(m.index+1)+'">定位这一步</a></li>').join('')+'</ol></details>':'<a href="#variable-creation">本项见“变量实际怎么建”；未据名称推断作用域</a>';
      return '<tr>'+row.map(x=>'<td>'+esc(x)+'</td>').join('')+'<td>'+evidence+'</td><td>'+esc(why)+'</td></tr>';
    }).join('');
    return '<h3 id="variables">变量表：类型、初值、作用范围与理由</h3><p>合并名称只为便于阅读；不同动作参数、临时值和对象字段要逐项建立。同名文字不代表它们具有相同作用域。</p><div class="table-wrap"><table class="detailed-variable-table"><thead><tr><th>名称</th><th>原声明类型</th><th>初值／用途</th><th>作用范围与创建说明</th><th>为什么这样设置</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
  }
  function placements(items){
    if(!items?.length)return '';
    return `<section class="trigger-placement"><h3>触发器位置</h3>${items.map((item,i)=>`<article><h4>${i+1}. ${esc(item.area)}</h4><p><strong>进入顺序：</strong>${esc(item.entry)}</p><p><strong>归属对象：</strong>${esc(item.owner)}</p><p><strong>对象从哪里取：</strong>${esc(item.objectSource)}</p><p><strong>连接前检查：</strong>${esc(Array.isArray(item.notes)?item.notes.join('；'):item.notes)}</p></article>`).join('')}<p class="source-label">区域名称按当前使用的九类区域说明；旧版手册的“全局／关卡／预设”叫法只作背景。每个事件能否使用，还需核对其原文运行域限制。</p></section>`;
  }
  function preparation(detail){
    if(!detail)return '';
    return `<div class="lesson-ready-list"><h3>先准备</h3><p>${detail.scene.map(obj=>`${esc(obj.name)}（${esc(obj.type)}）`).join('；')}。</p><p>${esc(detail.scene[0]?.steps[0]||detail.scopeNote)}</p><p><a href="#variable-creation">变量逐项创建说明 · ${detail.variableSteps.length} 步</a>${detail.customActions.length?` · 自定义动作 ${detail.customActions.length} 项`:''}</p></div><details class="lesson-prep-details"><summary>展开场景、触发器与逐项创建说明</summary><section class="detailed-start" id="start-here"><h2>场景与变量</h2><p><a class="text-link" href="editor-guide.html">触发器区域与对象说明</a></p><p class="callout">${esc(detail.scopeNote)}</p>${placements(detail.triggerPlacement)}${detail.scene.map((obj,i)=>`<details class="setup-object"${i===0?' open':''}><summary>${i+1}. ${esc(obj.name)} <small>${esc(obj.type)}</small></summary>${list(obj.steps)}</details>`).join('')}<h3 id="variable-creation">创建变量</h3><p>按下面的作用范围创建。同名的动作参数分别建立；赋值槽只放一个值或表达式，不填分号、箭头文字。自定义动作使用调用块，不能用发送事件代替。</p><ol>${detail.variableSteps.map((step,i)=>`<li id="variable-step-${i+1}">${esc(step)}</li>`).join('')}</ol>${detail.customActions.length?`<details class="custom-catalog"><summary>自定义动作定义（${detail.customActions.length} 项）</summary><p class="callout">下方分步说明接在这些定义里，每个动作只创建一次。</p>${detail.customActions.map(action=>`<section><h4>${esc(action.name)}</h4><p>参数按顺序创建：${esc(action.parameters.length?action.parameters.join('；'):'无参数')}</p>${list(action.steps)}</section>`).join('')}</details>`:''}</section></details>`;
  }
  function sectionSteps(detailSection,original){
    return detailSection?`<div class="microsteps">${list(detailSection.steps)}</div><p class="recipe-check"><strong>结果：</strong>${esc(detailSection.check)}</p><details class="logic-summary"><summary>逻辑概要</summary>${list(original.steps)}<p>${esc(original.verify)}</p></details>`:list(original.steps)+`<p class="recipe-check">${esc(original.verify)}</p>`;
  }
  function tests(detail){
    if(!detail)return '';
    return `<div class="scenario-tests">${detail.tests.map((t,i)=>`<section class="test-case"><h4>测试 ${i+1}</h4><p><strong>动手操作：</strong>${esc(t.action)}</p><p><strong>应该看到：</strong>${esc(t.expected)}</p><details class="lesson-reading-extra"><summary>结果不一致？查看排查提示</summary><p>${esc(t.ifNot)}</p></details></section>`).join('')}</div>${detail.pitfalls.length?`<details><summary>常见错误</summary>${list(detail.pitfalls)}</details>`:''}`;
  }
  return{location,slots,wiring,referenceCards,preparation,sectionSteps,tests,variableTable};
})();
