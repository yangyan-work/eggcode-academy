"use strict";
// 教学解释基于原文的参数结构；完整原文始终保留。枚举和缺失字段不猜测。
window.EGG_EXAMPLE_FOR = function(entry) {
  const section = name => (entry.body.match(new RegExp('#### '+name+'\\s*([\\s\\S]*?)(?=\\n#{3,6} |$)'))?.[1] || '').trim();
  const description=section('描述'), note=section('说明');
  const declared=[...section('参数').matchAll(/^(\d+)\.\s*(.+)$/gm)].map(m=>({index:Number(m[1])-1,type:m[2].trim()}));
  const slots=[...description.matchAll(/\{#(\d+)\}/g)].map(m=>Number(m[1]));
  const count=Math.max(declared.length,...slots.map(n=>n+1),0);
  const warnings=[];
  if(window.EGG_MANUAL_NOTES?.[entry.id])warnings.push(window.EGG_MANUAL_NOTES[entry.id]);
  const familyType=entry.title.split(/[：:]/)[1]?.trim();
  const family=/^(列表取值|复制列表|列表中随机取|获取自定义属性|表格取值|权重池中随机取)/.test(entry.title);
  const choose = raw => {
    if(!raw.startsWith('可选'))return raw;
    const options=raw.replace(/^可选[：:]\s*/,'').split(/[,，]\s*/);
    return family&&familyType&&options.includes(familyType+'列表')?familyType+'列表':options.includes('整数权重池')?'整数权重池':options.includes('整数列表')?'整数列表':options.includes('整数')?'整数':options.includes('组件')?'组件':options[0];
  };
  const parameters=Array.from({length:count},(_,index)=>{const raw=declared.find(x=>x.index===index)?.type;return {index,raw:raw||'原文未列出此项类型',type:raw?choose(raw):'待核对'};});
  if(parameters.some(p=>p.type==='待核对'))warnings.push('描述中有参数槽，但原文参数表缺少对应类型。本页保留缺项提示；请在编辑器核对该槽的类型后再填写，不把示例补充当作官方定义。');
  if(entry.title.startsWith('列表中随机取一个值')&&parameters[0]&&!parameters[0].type.endsWith('列表'))warnings.push('这条原文的描述要求列表，但参数类型未写“列表”。以下按列表随机抽取做教学演示；实际输入槽请以编辑器为准。');
  function parameterHelp(p) {
    if(p.raw.startsWith('可选'))return '这些类型选其中一种，并让输入与使用它的积木类型保持一致；“可选”不代表可留空。';
    const basics={'整数':'直接填整数，例如 3。用作索引或编号时，必须对应已存在的数据，不填小数或数字字符串。','定点数':'用于可带小数的数值，例如 2.0。秒数、距离、比例等单位按上方描述填写。','布尔值':'填真或假，或嵌入条件积木。不要输入字符串“真”或数字 1。','字符串':'输入文本，或接字符串取值积木。名称、标签和字段必须与创建时完全一致。','向量':'由向量组构造器填 X/Y/Z。它可能表示方向、速度或缩放，按本积木描述选择。','坐标点':'用位置组构造器或有效对象位置，表示空间中的一个点；不要用向量类型替代。','旋转角':'填旋转角类型值。普通三维向量和旋转角类型不能混用。','颜色':'使用颜色选择器或颜色类型的获取积木，不把颜色名称文字当颜色值。','回调函数':'把到期后要执行的动作放进内部动作区；它不是普通数字或文字。','待核对':'原文遗漏了此槽的类型，需要在编辑器中核对后填写。'};
    if(basics[p.type])return basics[p.type];
    if(p.type.endsWith('列表'))return '先创建同类型列表并放入有效元素。取值或抽取前检查列表非空和索引范围。';
    if(p.type.endsWith('权重池'))return '创建同类型权重池，加入有效元素和正权重；权重是相对比例，不是固定出现次数。';
    if(p.type.includes('预设'))return '在资源选择器选择已有的对应预设；预设是模板，不能直接当作运行中的对象。';
    if(/类型|枚举|模式|方式|运算符|比较符|槽位|区域类型|拖动平面|状态|限制|关系/.test(p.type))return '从编辑器实际下拉项中选择。此条原文未列完整选项，不猜测其底层编号。';
    return '取得有效的'+p.type+'引用后填入对应槽；示例名称只用于辨认对象，不能填成普通字符串。';
  }
  const briefType=p=>p.raw.startsWith('可选')?'支持多种类型（展开查看）':p.raw;
  const purpose=description.replace(/\{#(\d+)\}/g,(_,n)=>'参数'+(Number(n)+1));
  const objectNotes=new Set();
  function value(type,i=0){
    if(type==='整数')return String(i===0?3:i===1?2:1);
    if(type==='定点数')return i===0?'2.0':'1.0';
    if(type==='布尔值')return '真';
    if(type==='字符串')return '“测试'+(i+1)+'”';
    if(type==='向量')return /缩放/.test(entry.title+description.slice(Math.max(0,description.indexOf('{#'+i+'}')-12),description.indexOf('{#'+i+'}')))?'向量[X:1, Y:1, Z:1]':(i%2?'向量[X:0, Y:1, Z:0]':'向量[X:1, Y:0, Z:0]');
    if(type==='坐标点')return i%2?'坐标点[X:3, Y:0, Z:4]':'坐标点[X:0, Y:0, Z:0]';
    if(type==='旋转角')return '旋转角[X:0, Y:0, Z:0]';
    if(type==='颜色'){objectNotes.add('颜色槽使用编辑器颜色选择器，示例选红色。');return '红色';}
    if(type==='回调函数')return '内部动作区放“发送信息”，内容“计时完成”';
    if(type==='待核对')return '编辑器中核对第'+(i+1)+'个槽后填写';
    if(type.endsWith('列表')){objectNotes.add('新建“样本列表”（'+type+'），先加入两个有效的同类型元素，且不要混用其他类型。');return '样本列表';}
    if(type.endsWith('权重池')){objectNotes.add('新建“样本池”（'+type+'），放入两个有效同类型样本，权重分别为 1、3。');return '样本池';}
    if(type==='表格'){objectNotes.add('在表格中创建“样本表”，预先建立一条有效行和对应类型的列，记录实际行号。');return '样本表';}
    if(type==='玩家'){objectNotes.add('玩家对象在加入游戏的事件中取得并保存，等玩家有效后执行本例。玩家不是角色对象。');return '已在线的测试玩家'+(i+1);}
    if(/^(角色蛋仔|角色I生物|生物)$/.test(type)){objectNotes.add('等待测试角色或生物创建完成，取得有效的'+type+'对象引用；不要用玩家对象或名称文字替代。');return '已创建的测试'+type+(i+1);}
    if(/(类型|枚举|模式|方式|运算符|比较符|方向轴|染色区域|槽位|风场形状|拖动平面|状态|限制|关系|属性索引|跳跃参数|移动参数|光照|雾效|滤镜|景深|音色|音组|音名|编号|天空盒|曲线|关节属性|动态表情)/.test(type)){
      objectNotes.add('“'+type+'”未在本条原文列出完整可选值。请打开实际下拉选择一个有效选项，记录选项名称；不要把类型名称当成可输入的值。');return '在“'+type+'”下拉中选择实际有效项';
    }
    if(type.includes('预设')){objectNotes.add('先创建或选择已有的'+type+'“测试资源”，通过资源选择器填入；预设不等于运行时实例。');return '已有的测试'+type;}
    if(/ID$/.test(type)){objectNotes.add(type+'应从已有对象获取，不随意填写数字。');return '有效的'+type;}
    if(type==='时间戳'){objectNotes.add('先获取一次当前时间戳作为输入，不把秒数当作时间戳。');return '已取得的当前时间戳';}
    objectNotes.add('先准备一个有效的'+type+'对象，记作“测试'+type+(i+1)+'”，用对象选择器或获取积木填入；多对象参数分别选不同实例，名字不是字符串参数。');
    return '测试'+type+(i+1);
  }
  const samples=parameters.map(p=>value(p.type,p.index));
  const preconditions = note.split(/[。；\n]/).filter(s=>/(需要|必须|只有|只能|仅.*可用|开启|发布.*生效)/.test(s)&&s.length<250);
  preconditions.forEach(s=>objectNotes.add('原文前提：'+s));
  const filled=description.replace(/\{#(\d+)\}/g,(_,n)=>'【'+(samples[Number(n)]||'在编辑器核对')+'】');
  const attachment={事件:'放在触发器顶部。事件发生后，才会执行它下面的动作。',动作:'连接在事件或控制积木的动作区，按执行顺序修改游戏状态。',条件:'放进“如果/否则”的条件槽，输出真或假；也可接到布尔值槽。',控制:'放在动作流程中，并把要重复、分支或定时执行的动作放入内部动作区。',取值:'嵌入其他积木的参数槽。它提供一个值，本身不单独执行动作。',基础:'先理解画布、事件与动作的连接，再进入编辑器动手。'}[entry.category];
  let result={diagramInputs:samples,parameters:parameters.map(p=>({...p,summary:briefType(p),help:parameterHelp(p)})),description,purpose,attachment,warnings,explanation:(purpose||entry.title)+'。'+attachment,setup:[...objectNotes],steps:[],expected:'',pitfalls:[],tree:'',sampleTitle:'试一次：'+entry.title,mode:'参数练习'};
  const config=parameters.map((p,i)=>'第'+(i+1)+'项（'+p.type+'）：'+samples[i]);
  if(entry.category==='事件'){
    result.steps=['新建一条触发器，把“'+entry.title+'”放在最上方。',...config,'在下方接“发送信息”，内容填“'+entry.title+'已触发”。','试玩时满足本条事件的行为：'+(filled||entry.title)+'；再尝试一个不满足条件的操作，对照调试窗口。'];
    result.expected='发生“'+(filled||entry.title)+'”时，调试窗口出现“'+entry.title+'已触发”；重复次数取决于该事件实际发生次数。';
    result.tree=entry.title+'\n'+config.map(x=>'  '+x).join('\n')+'\n  └─ 发送信息：“'+entry.title+'已触发”';
    result.pitfalls=['只放事件不会产生可见效果，必须在其动作区连接动作。','指定对象事件只监听已选择的对象；事件发生前要先完成监听注册。'];
  }else if(entry.category==='条件'){
    result.steps=['在测试对象和数据准备完成后，建立一条单次执行的触发器。','在动作区加入“如果/否则”，条件槽放“'+entry.title+'”。',...config,'真分支发送信息“条件成立”，假分支发送信息“条件不成立”。','改变被判断的数据或对象状态，再触发同一流程进行对照。'];
    result.expected='判断“'+filled+'”成立时输出“条件成立”，否则输出“条件不成立”。每次调用都重新读取当时的状态。';
    result.tree='准备完成后触发\n  └─ 如果 / 否则\n       条件：'+(filled||entry.title)+'\n       真：发送信息“条件成立”\n       假：发送信息“条件不成立”';
    result.pitfalls=['条件积木不会主动监控变化，必须在事件触发后重新判断。','把条件接入布尔值槽，不接在普通动作的下面。'];
  }else if(entry.category==='取值'){
    result.steps=['在对象或输入数据有效后触发一次读取。',...config,'新建“观察值”变量，类型与该积木在编辑器显示的输出类型一致，并开启变量监听。','使用“设置变量”，把“'+entry.title+'”嵌入“观察值”的值槽。','执行后在调试窗口查看结果；只改变一个输入，再触发一次读取进行比较。'];
    result.expected='“观察值”保存这次计算或读取的结果：'+(filled||entry.title)+'。它是读取当时的值；要观察后续变化，需要再次执行读取。';
    result.tree='对象与数据准备完成\n  └─ 设置变量“观察值”\n       值槽：'+entry.title+'\n'+config.map(x=>'         '+x).join('\n');
    result.pitfalls=['输入参数的类型不等于输出类型；以积木的输出槽类型创建变量。','对象已销毁、列表越界或属性尚未设置时，读取可能失败；先确认数据存在。'];
  }else{
    result.steps=['准备一份测试场景，在目标对象或数据有效后执行一次。',...config,'将“'+entry.title+'”接在测试触发器的动作区，并在它后面接“发送信息”，内容填“已执行到下一步”。','试玩前记录目标的状态，触发一次后对照“'+(filled||entry.title)+'”的变化，再改变一个参数复测。'];
    result.expected='目标按下面的参数配置执行：'+(filled||entry.title)+'。调试信息只说明流程到达后续动作；异步效果是否完成，要另外观察对象或对应完成事件。';
    result.tree='目标准备完成后触发\n  ├─ '+entry.title+'\n'+config.map(x=>'  │    '+x).join('\n')+'\n  └─ 发送信息：“已执行到下一步”';
    result.pitfalls=['先确认对象与参数类型一致；预设、实例和 ID 不能互相直接替代。','包含持续时间的效果可能异步执行，后面的动作不代表一定在效果完成后运行。'];
  }
  // 类型展开的积木共享行为规则，例子仍按每条的真实类型构造。
  if(family&&familyType){
    objectNotes.clear();
    const type=familyType,base=value(type,0);
    result.mode='类型示例';result.setup=[];
    const assign=(setup,steps,expected,tree)=>{result.setup=setup;result.steps=steps;result.expected=expected;result.tree=tree;};
    if(/^列表取值/.test(entry.title)){
      assign(['新建“样本列表”，元素类型选“'+type+'”。先放入两个有效样本 A、B；A、B 只是讲解代号。','A 的内容设为 '+base+'；B 使用另一个有效的'+type+'值。'],['将第 1 项接“样本列表”，第 2 项索引填 0。','新建同类型变量“观察值”，把本积木放进设置变量的值槽。','再次将索引改为 1，重复读取；读取前确认列表长度大于索引。'],'索引 0 返回 A，索引 1 返回 B。返回的是一个'+type+'元素，不是整个列表。','样本列表 = [A, B]\n设置观察值 = '+entry.title+'（样本列表，0）\n结果：A');
      result.pitfalls=['列表首个索引为 0；长度为 2 时有效索引为 0、1。','条目后缀“'+type+'”限定本例的输出类型，列表中的元素类型要与它一致。'];
    }else if(/^复制列表/.test(entry.title)){
      assign(['准备'+type+'列表“原列表”，内含两个有效元素 A、B。','创建同类型列表变量“副本”。'],['设置“副本”为“'+entry.title+'”，输入接“原列表”。','在原列表末尾加入一个有效的'+type+'元素 C，再分别检查两个列表长度。'],'原列表长度变成 3，副本长度仍为 2。复制的是列表容器；手册未承诺把每个对象也创建成独立副本。','原列表 = [A, B]\n副本 = '+entry.title+'（原列表）\n原列表添加 C\n长度：原列表 3 / 副本 2');
      result.pitfalls=['不要把普通赋值当成复制列表。','当元素是对象引用时，不应把此操作理解成克隆场景对象。'];
    }else if(/^列表中随机取/.test(entry.title)){
      const multi=parameters.length>1;
      assign(['创建'+type+'列表“候选”，填入两个不同的有效值 A、B（例如 A 使用 '+base+'）。'],['列表槽接“候选”。',...(multi?['数量填 1，允许重复填假。']:[]),'把结果保存到'+type+(multi?'列表':'')+'变量；连续手动触发几次观察。'],'每次'+(multi?'得到一个只含 1 个元素的新列表，其元素':'得到的值')+'来自 A 或 B；每次具体抽到哪个无法预先确定。','候选 = [A, B]\n结果 = '+entry.title+'（候选'+(multi?'，1，假':'')+'）');
      result.pitfalls=['候选列表不能为空；禁止重复时，抽取数量不要超过可用元素数。','允许重复是本次多次抽取的配置，不保证多次调用之间不重复。'];
    }else if(/^获取自定义属性/.test(entry.title)){
      assign(['选择一个有效组件“记录板”。','先用“设置自定义属性”，在记录板上写入名为“示例数据”的属性，值类型必须为'+type+'，内容记作 A（'+base+'）。'],['对象槽选择同一个记录板；属性名字符串精确填“示例数据”。','将“'+entry.title+'”嵌入同类型变量“读取结果”的值槽。','写入后再读取；先判断自定义属性存在，再访问它。'],'读取结果为之前写入的 A；对象、属性名、类型三者都要与写入时相同。','记录板.示例数据 = A（'+type+'）\n读取结果 = '+entry.title+'（记录板，“示例数据”）\n结果：A');
      result.pitfalls=['属性存在不代表类型一定正确，必须选择相同类型的读取积木。','空格不同或换了对象，就不是原来写入的属性。'];
    }else if(/^表格取值/.test(entry.title)){
      assign(['创建表格“样本表”，建立'+type+'类型的一列“示例数据”。','向一条已存在的行写入有效值 A（'+base+'），记录该行在编辑器中的实际行号 R。'],['表格槽接“样本表”；行号填 R（实际整数，不是字母字符串）。','列名字符串填“示例数据”；将结果保存到'+type+'变量。'],'得到指定单元格的 A；行号和列名都必须存在，且列内值类型为'+type+'。','样本表[R,“示例数据”] = A\n读取结果 = '+entry.title+'（样本表，R，“示例数据”）');
      result.pitfalls=['R 是讲解代号，要替换成编辑器实际行号。','列名是字符串，不能拿可见的列顺序编号替代；缺行、缺列不视为自动补零。'];
    }else if(/^权重池中随机取/.test(entry.title)){
      const multi=parameters.length>1;
      assign(['新建'+type+'权重池“奖励池”，放入两个不同有效样本 A、B。','A 权重设 1，B 权重设 3；两项都先存在再抽取。'],['第 1 项接“奖励池”。',...(multi?['抽取数量填 1，是否重复填假。']:[]),'把结果记录到'+type+(multi?'列表':'')+'变量，手动触发数次。'],'每次结果'+(multi?'为一个单元素列表，元素':'')+'只能来自 A 或 B；按 1:3 的相对权重随机，几次实验不会严格按比例出现。','奖励池 = {A:权重1, B:权重3}\n结果 = '+entry.title+'（奖励池'+(multi?'，1，假':'')+'）');
      result.pitfalls=['权重不是百分比；1 和 3 表示相对比例。','禁止重复时不要超出可抽取样本数；不能根据前几次结果保证下一次抽到谁。'];
    }
    result.explanation=(note?note+'。':'')+'此版本处理“'+type+'”。'+attachment;
  }
  const curated=(window.EGG_CURATED||[]).find(x=>x.exactIds?.includes(entry.id));
  if(curated){
    result={...result,mode:'搭建示例',sampleTitle:curated.name||('试一次：'+entry.title),explanation:curated.explanation,setup:curated.setup,steps:curated.steps,expected:curated.expected,pitfalls:curated.pitfalls,returnType:curated.returnType||'',tree:''};
  }
  result.setup=result.setup.length?result.setup:['打开一份独立测试地图，进入对应关卡的蛋码画布。'];
  if(note&&!curated&&!family)result.explanation=(note.length>450?note.slice(0,450)+'…（完整说明见原文）':note).replace(/!\[[^\]]*\]\([^)]*\)/g,'').replace(/\*\*/g,'');
  if(!curated && window.EGG_MANUAL_NOTES?.[entry.id])result.explanation = "本条用于："+(purpose||entry.title)+"。原文存在歧义，见下方核对提示。";
  if(parameters.some(p=>p.raw.startsWith('可选')))result.pitfalls=[...result.pitfalls,'参数表中的“可选”表示支持多种数据类型，不表示这个槽可以留空。'];
  if(!curated&&objectNotes.size&&family)result.setup.push(...objectNotes);
  return result;
};
