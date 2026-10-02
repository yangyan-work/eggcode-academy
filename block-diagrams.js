"use strict";
// 纯 SVG 积木结构图：只负责教学展示，不是编辑器模板或可执行蛋码。
window.EGG_BLOCKS = (() => {
  const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const colors={event:'#ffb400',action:'#4998f7',control:'#9148dc',condition:'#ff7637',value:'#50cf95',variable:'#ec4b95',literal:'#a0e9bc',custom:'#ef5b62',note:'#3b4050'};
  const dark=new Set(['event','action','condition','value','variable','literal','custom']);
  const font='Microsoft YaHei, PingFang SC, sans-serif';
  const textWidth=s=>[...String(s)].reduce((n,c)=>n+(/[\u0000-\u00ff]/.test(c)?8.4:16),0);
  function wrap(text,width){
    const lines=[];let row='';
    for(const c of String(text)){if(c==='\n'||textWidth(row+c)>width){lines.push(row);row=c==='\n'?'':c;}else row+=c;}
    if(row||!lines.length)lines.push(row);return lines;
  }
  const text=(lines,x,y,fill='#fff',size=16)=>`<text x="${x}" y="${y}" fill="${fill}" font-family="${font}" font-size="${size}" font-weight="500">${lines.map((line,i)=>`<tspan x="${x}" dy="${i?23:0}">${esc(line)}</tspan>`).join('')}</text>`;
  const translate=(x,y,html)=>`<g transform="translate(${x},${y})">${html}</g>`;
  function partLayout(part,maxWidth=640,plainInk='#fff'){
    if(typeof part==='string'){const lines=wrap(part,maxWidth);return{w:Math.max(...lines.map(textWidth))+2,h:lines.length*23,svg:text(lines,0,18,plainInk)};}
    const kind=part.kind||'value',ink=dark.has(kind)?'#10240b':'#fff';
    const inner=part.parts?.length?rowLayout(part.text?[part.text,...part.parts]:part.parts,maxWidth-28,ink):partLayout(String(part.text??''),maxWidth-28,ink);
    const w=Math.max(30,inner.w+24),h=inner.h+10;
    const shape=kind==='condition'?`<path d="M12 0 H${w-12} L${w} ${h/2} L${w-12} ${h} H12 L0 ${h/2}Z"/>`:`<rect width="${w}" height="${h}" rx="${Math.min(17,h/2)}"/>`;
    return{w,h,svg:`<g fill="${colors[kind]||colors.value}" stroke="#ffffff50" stroke-width="1">${shape}</g>`+translate(12,5,inner.svg)};
  }
  function rowLayout(parts,maxWidth,ink='#fff'){
    let x=0,y=0,rowH=23,w=0,svg='';
    for(const p of parts){const item=partLayout(p,maxWidth,ink);if(x&&x+item.w>maxWidth){y+=rowH+7;x=0;rowH=23;}
      svg+=translate(x,y,item.svg);x+=item.w+8;rowH=Math.max(rowH,item.h);w=Math.max(w,x-8);
    }return{w,h:y+rowH,svg};
  }
  function stackPath(w,h,hat=false){return hat?`M0 18 Q0 7 12 7 H20 Q38 -10 58 7 H${w-12} Q${w} 7 ${w} 19 V${h-12} Q${w} ${h} ${w-12} ${h} H65 L59 ${h+6} H41 L35 ${h} H12 Q0 ${h} 0 ${h-12}Z`:`M12 0 H34 L40 6 H60 L66 0 H${w-12} Q${w} 0 ${w} 12 V${h-12} Q${w} ${h} ${w-12} ${h} H66 L60 ${h+6} H40 L34 ${h} H12 Q0 ${h} 0 ${h-12} V12 Q0 0 12 0Z`;}
  function nodesLayout(nodes,maxWidth=730){
    let y=0,w=0,svg='';
    for(const node of nodes){const n=nodeLayout(node,maxWidth);svg+=translate(0,y,n.svg);y+=n.h+(node.kind==='note'?12:2);w=Math.max(w,n.w);}return{w,h:y,svg};
  }
  function nodeLayout(node,maxWidth){
    const kind=node.parts?.[0]==='设置变量'?'variable':node.kind||'note',note=kind==='note';
    const ink=dark.has(kind)?'#251c04':note?'#d8dce8':'#fff';
    const row=rowLayout(node.parts||[''],Math.max(270,maxWidth-44),ink);
    const w=Math.max(note?200:150,row.w+42),h=row.h+(kind==='event'?31:24);
    let header=row.svg;
    const headShape=note?`<rect width="${w}" height="${h}" rx="8" fill="${colors.note}" stroke="#697080" stroke-dasharray="5 4"/>`:`<path d="${stackPath(w,h,kind==='event')}" fill="${colors[kind]}" stroke="#ffffff65" stroke-width="1.2"/>`;
    let svg=headShape+translate(20,kind==='event'?20:12,header),height=h+6,totalW=w;
    if(kind==='control' || (kind==='custom'&&node.children?.length)){
      const children=nodesLayout(node.children||[{kind:'note',parts:['内部动作区']}],maxWidth-24);
      let y=h+1;
      svg+=translate(24,y,children.svg);y+=children.h+8;totalW=Math.max(totalW,children.w+24);
      if(node.otherwise){svg+=`<rect x="0" y="${y}" width="128" height="34" rx="10" fill="${colors[kind]}"/>`+text(['否则执行'],25,y+23);y+=35;const other=nodesLayout(node.otherwise.length?node.otherwise:[{kind:'note',parts:['此分支不连接动作']}],maxWidth-24);svg+=translate(24,y,other.svg);y+=other.h+8;totalW=Math.max(totalW,other.w+24);}
      svg=`<rect x="0" y="${h-5}" width="20" height="${y-h+13}" rx="8" fill="${colors[kind]}"/>`+svg+`<path d="${stackPath(118,24)}" transform="translate(0,${y})" fill="${colors[kind]}" stroke="#ffffff50"/>`;
      height=y+32;
    }else if(node.children?.length){const children=nodesLayout(node.children,maxWidth);svg+=translate(0,h+2,children.svg);height=h+2+children.h;totalW=Math.max(w,children.w);}
    return{w:totalW,h:height,svg};
  }
  function svg(roots,label='彩色积木搭建示意'){
    const layout=nodesLayout(roots),w=Math.ceil(Math.max(600,layout.w+56)),h=Math.ceil(layout.h+64);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}"><title>${esc(label)}</title><desc>事件、控制、动作与参数按连接顺序排列。文字版本在图下方。</desc><rect width="${w}" height="${h}" rx="12" fill="#292b36"/>${translate(26,26,layout.svg)}</svg>`;
  }
  const literal=text=>({kind:'literal',text:String(text)}),value=text=>({kind:'value',text:String(text)}),variable=text=>({kind:'variable',text:String(text)}),condition=parts=>({kind:'condition',parts});
  const known=window.EGG_MANUAL?.entries||[], titles=[...new Set(known.map(e=>e.title))].sort((a,b)=>b.length-a.length);
  const symbols=new Set(Object.values(window.EGG_BUILD_GUIDES||{}).flatMap(g=>g.variables.flatMap(row=>row[0].split(' / '))));
  // Only split connectors outside parameter slots, grouping brackets and quoted text.
  function topTokens(s,tokens){
    const pairs={'〔':'〕','[':']','（':'）','(':')'},stack=[],out=[];let quote='';
    for(let i=0;i<s.length;i++){
      const c=s[i];
      if(quote){if(c==='\\'){i++;continue;}if(c===quote)quote='';continue;}
      if(c==='"'||c==='“'){quote=c==='“'?'”':'"';continue;}
      if(pairs[c]){stack.push(pairs[c]);continue;}
      if(stack.length&&c===stack.at(-1)){stack.pop();continue;}
      if(stack.length)continue;
      const token=tokens.find(t=>s.startsWith(t,i));
      if(token){out.push({at:i,token});i+=token.length-1;}
    }
    return out;
  }
  function splitAtTop(s,separators,last=false,binary=false){
    const found=topTokens(s,[...separators]).filter(({at,token})=>at>0&&(!binary||!'+−-'.includes(token)||!/[+−\-×÷*]$/.test(s.slice(0,at).trim())));
    return (last?found.at(-1):found[0])?.at??-1;
  }
  function splitTop(s,separators){let start=0;const out=[];for(const {at,token} of topTokens(s,separators)){out.push(s.slice(start,at));start=at+token.length;}out.push(s.slice(start));return out;}
  const splitArguments=s=>splitTop(s,['，',',']);
  const splitStatements=s=>splitTop(s,['；',';']).map(x=>x.trim()).filter(Boolean);
  function expression(raw){
    let s=raw.trim().replace(/〔(?:事件|动作|条件)〕$/,'');
    // 只剥掉包围整个表达式的括号，不能破坏 (a+b)×(c+d) 的分组。
    while((s.startsWith('(')&&s.endsWith(')'))||(s.startsWith('（')&&s.endsWith('）'))){
      let depth=0,encloses=true;
      for(let i=0;i<s.length-1;i++){if('（('.includes(s[i]))depth++;else if('）)'.includes(s[i]))depth--;if(depth===0){encloses=false;break;}}
      if(!encloses)break;s=s.slice(1,-1).trim();
    }
    if(/^(true|false|真|假)$/i.test(s))return literal(s.toLowerCase()==='true'?'真':s.toLowerCase()==='false'?'假':s);
    if(/^[+−-]?\d+(\.\d+)?(秒|次)?$/.test(s))return literal(s);
    if(/^[“"].*[”"]$/.test(s))return literal(s.replace(/^[“"]|[”"]$/g,''));
    for(const op of ['或','且']){const i=splitAtTop(s,op);if(i>0)return condition([op==='且'?'与':'或',expression(s.slice(0,i)),expression(s.slice(i+1))]);}
    const comparisons=topTokens(s,['>=','<=','!=','≥','≤','≠','=','>','<']);
    if(comparisons.length){
      let start=0;const operands=[];
      for(const {at,token} of comparisons){operands.push(s.slice(start,at).trim());start=at+token.length;}
      operands.push(s.slice(start).trim());
      // 0≤p<2 means (0≤p) AND (p<2), never 0≤(p<2).
      if(operands.every(Boolean))return comparisons.map(({token},i)=>condition(['比较',expression(operands[i]),token,expression(operands[i+1])])).reduce((left,right)=>condition(['与',left,right]));
      return literal(s);
    }
    for(const ops of ['+−-','×÷*']){const i=splitAtTop(s,ops,true,true);if(i>0&&s.slice(i+1).trim())return{kind:'value',parts:['整数运算',expression(s.slice(0,i)),s[i],expression(s.slice(i+1))]};}
    if(/^N\(.+\)(次)?$/.test(s))return{kind:'value',parts:['获取列表长度',variable(s.slice(2,s.lastIndexOf(')')))]};
    if(s.endsWith('次')&&/[+−×\w]/.test(s.slice(0,-1)))return expression(s.slice(0,-1));
    const list=/^([^\[\]]+)\[([^\[\]]+)\]$/.exec(s);
    if(list)return{kind:'value',parts:['列表取值：整数',variable(list[1]),expression(list[2])]};
    const call=/^(.+?)〔(.*)〕$/.exec(s);
    if(call)return{kind:known.some(e=>e.title===call[1]&&e.platform==='移动端'&&e.category==='条件')?'condition':'value',parts:[call[1]==='向量'?'由实数获得[X:0, Y:0, Z:0]':call[1],...splitArguments(call[2]).map(x=>expression(call[1]==='向量'?x.replace(/^[XYZ]=/,''):x))]};
    if(known.some(e=>e.title===s&&e.category==='取值'))return value(s);
    const labelled=/^(次数|间隔|立刻执行)(.+)$/.exec(s);
    if(labelled)return expression(labelled[2]);
    return symbols.has(s)||/^(输入行|输入列|格A|格B|格C|目标编号|编号)$/.test(s)?variable(s):literal(s);
  }
  // ponytail: 解析现有教学连接文本的有限语法，不把说明句伪装成可执行积木；复杂式保持在参数槽中，精确图可由结构化数据覆盖。
  function fromTree(tree,options={}){
    const roots=[],stack=[{indent:-1,nodes:roots,parent:null}];
    for(const match of tree.matchAll(/([\w\u4e00-\u9fff]+)\s*←/g))symbols.add(match[1]);
    function create(line){
      if(/^【自建】/.test(line)){const label=line.replace(/^【自建】/,'');return{kind:'custom',parts:['自定义动作',...parts(label)]};}
      if(/^如果\s*/.test(line))return{kind:'control',parts:['如果',expression(line.replace(/^如果\s*/,''))],children:[]};
      const assignment=/^(.+?)\s*←\s*(.+)$/.exec(line);
      if(assignment){const list=/^(.+)\[(.+)\]$/.exec(assignment[1].trim());return{kind:'action',parts:list?['设置列表的元素',variable(list[1]),expression(list[2]),'=',expression(assignment[2])]:['设置变量',variable(assignment[1].trim()),'=',expression(assignment[2])]};}
      const append=/^(.+?)\s+追加\s+(.+)$/.exec(line);if(append)return{kind:'action',parts:['列表添加（增加）',variable(append[1]),expression(append[2])]};
      const entering=/^进入(.+)$/.exec(line);if(entering)return{kind:'event',parts:['角色进出指定触发区域',literal('进入'),value(entering[1])],children:[]};
      const clean=line.replace(/^提示〔/,'发送提示给玩家〔');
      const title=titles.find(t=>clean===t||clean.startsWith(t+'〔')||clean.startsWith(t+'：'));
      const found=known.find(e=>e.title===title&&e.platform==='移动端');
      if(found){const kind={事件:'event',动作:'action',控制:'control',条件:'condition',取值:'value'}[found.category]||'note';return{kind,parts:parts(clean.replace(/〔(?:事件|本课临时测试|最终仅保留这一条)〕$/,'')),...(['event','control'].includes(kind)?{children:[]}:{} )};}
      return{kind:'note',parts:[line]};
    }
    function parts(line){
      const open=line.indexOf('〔');if(open<0)return[line];const close=line.lastIndexOf('〕');if(close<open)return[line];
      const title=line.slice(0,open),content=line.slice(open+1,close),textOnly=['发送信息','接收自定义事件（全局）','发送自定义事件（全局）'].includes(title);
      const inputs=textOnly?[literal(content)]:splitArguments(content).map((s,i)=>title==='发送提示给玩家'&&i===1?literal(s):expression(s));
      return[title,...inputs,line.slice(close+1)].filter(x=>x!=='');
    }
    for(const raw of tree.split('\n')){
      if(!raw.trim())continue;
      const indent=raw.match(/^ */)[0].length;
      while(stack.length>1&&indent<=stack.at(-1).indent)stack.pop();
      let scope=stack.at(-1),line=raw.trim();
      // 参数说明行并入父积木的插槽。
      const field=/^(接收者|提示文字|持续时间|组件|线速度|是否局部坐标|次数|间隔)：(.+)$/.exec(line);
      if(field&&scope.parent&&scope.parent.kind!=='control'){scope.parent.parts.push(field[1],field[1]==='提示文字'?literal(field[2]):expression(field[2]));continue;}
      const arrow=topTokens(line,[' → '])[0]?.at??-1;let before=arrow<0?line:line.slice(0,arrow),after=arrow<0?'':line.slice(arrow+3);
      if(before==='否则'||/^否则如果\s+/.test(before)){
        const previous=[...scope.nodes].reverse().find(n=>n.kind==='control');
        if(previous){
          previous.otherwise=[];let branch={indent,nodes:previous.otherwise,parent:previous};
          if(before!=='否则'){const nested=create(before.slice(2));branch.nodes.push(nested);branch={indent,nodes:nested.children,parent:nested};}
          stack.push(branch);if(after)for(const statement of splitStatements(after))branch.nodes.push(create(statement));
        }else scope.nodes.push({kind:'note',parts:[line]});
        continue;
      }
      // 其余“否则…”是说明文字，不能省略条件或擅自转成无条件的否则分支。
      if(/^否则/.test(before)){scope.nodes.push({kind:'note',parts:[line]});continue;}
      // 同行语句均转为独立动作；参数槽和字符串内部的分号保持原样。
      const lines=splitStatements(before);
      for(const item of lines){const node=create(item);scope.nodes.push(node);
        if(after){node.children||=[];for(const s of splitStatements(after))node.children.push(create(s));}
        if(node.children||node.kind==='action'){node.children||=[];stack.push({indent,nodes:node.children,parent:node});}
      }
    }
    if(options.definition&&roots[0]?.kind==='custom'&&roots.length>1){roots[0].children=[...(roots[0].children||[]),...roots.splice(1)];}
    return roots;
  }
  function figure(roots,label,caption='按下方步骤在编辑器搭建'){
    const picture=svg(roots,label);
    return `<figure class="block-figure"><div class="diagram-toolbar"><span>${esc(label)}</span><div><button type="button" data-diagram="zoom-out" aria-label="缩小积木图">−</button><button type="button" data-diagram="zoom-in" aria-label="放大积木图">＋</button><button type="button" data-diagram="expand">查看大图</button><button type="button" data-diagram="download">下载图片</button></div></div><div class="diagram-viewport" tabindex="0" aria-label="可横向滚动的彩色积木图">${picture}</div><figcaption>教学拼接示意 · ${esc(caption)}</figcaption></figure>`;
  }
  function forEntry(entry,ex){
    const exact=(window.EGG_DIAGRAM_DATA?.examples||[]).find(d=>d.exactIds.includes(entry.id));
    if(exact)return exact;
    const family=entry.title.split(/[：:]/)[0],type=entry.title.split(/[：:]/)[1];
    const action=(name,...parts)=>({kind:'action',parts:[name,...parts]});
    const output=(name,parts)=>action('设置变量',variable(name),'=',{kind:'value',parts});
    const start=children=>({kind:'event',parts:['接收自定义事件（全局）',literal('运行示例')],children});
    const prepare={kind:'note',parts:['先完成下方准备，再发送全局自定义事件“运行示例”测试一次。']};
    let parts=[entry.title],children=[],roots=[];
    if(type&&/^(列表取值|复制列表|列表中随机取|获取自定义属性|表格取值|权重池中随机取)/.test(entry.title)){
      if(family==='列表取值'){parts.push(variable('样本列表'),literal(0));children=[output('观察值',parts)];}
      else if(family==='复制列表'){parts.push(variable('原列表'));children=[output('副本',parts),action('列表添加（增加）',variable('原列表'),variable('C'))];}
      else if(family.startsWith('列表中随机取')){parts.push(variable('候选'));if(!family.includes('一个'))parts.push(literal(1),literal('假'));children=[output('抽取结果',parts)];}
      else if(family==='获取自定义属性'){parts.push(literal('记录板：组件'),literal('示例数据'));children=[action('设置对象的自定义属性',literal('记录板：组件'),literal('示例数据'),variable('A（'+type+'）')),output('读取结果',parts)];}
      else if(family==='表格取值'){parts.push(variable('样本表'),variable('R：实际行号'),literal('示例数据'));children=[output('读取结果',parts)];}
      else{parts.push(variable('奖励池'));if(!family.includes('一个'))parts.push(literal(1),literal('假'));children=[output('抽取结果',parts)];}
      roots=[{kind:'note',parts:['样本的数据类型：'+type+'。A / B / C / R 是下方例子中准备的样本或实际行号。']},prepare,start(children)];
    }else{
      const inputParts=(ex.diagramInputs||[]).map((input,i)=>{
        const t=ex.parameters[i]?.type;
        if(t==='回调函数')return null;
        if(t==='待核对')return{kind:'note',text:'此槽需在编辑器核对'};
        return{kind:/列表$|权重池$/.test(t)?'variable':'literal',text:input};
      }).filter(Boolean);
      parts.push(...inputParts);
      if(entry.category==='事件')roots=[{kind:'event',parts,children:[action('发送信息',literal(entry.title+'已触发'))]}];
      else if(entry.category==='条件')roots=[prepare,start([{kind:'control',parts:['如果',{kind:'condition',parts}],children:[action('发送信息',literal('条件成立'))],otherwise:[action('发送信息',literal('条件不成立'))]}])];
      else if(entry.category==='取值')roots=[prepare,start([output('观察值',parts)])];
      else roots=[prepare,start([{kind:'action',parts},action('发送信息',literal('已执行到下一步'))])];
    }
    return{caption:'按本条参数练习搭建；场景对象和前提见下方步骤。',roots};
  }
  function legend(){return '<div class="diagram-legend" aria-label="积木分类颜色">'+[['event','事件'],['action','动作'],['control','控制'],['condition','条件'],['value','取值'],['variable','变量'],['custom','自定义']].map(([k,t])=>'<span data-block-kind="'+k+'" style="--swatch:'+colors[k]+'">'+t+'</span>').join('')+'</div>';}
  return{svg,figure,fromTree,forEntry,literal,value,variable,condition,legend};
})();
