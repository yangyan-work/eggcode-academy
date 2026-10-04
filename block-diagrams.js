"use strict";
// 纯 SVG 积木结构图：只负责教学展示，不是编辑器模板或可执行蛋码。
window.EGG_BLOCKS = (() => {
  const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const colors={event:'#ffb400',action:'#4998f7',control:'#9148dc',condition:'#ff7637',value:'#50cf95',variable:'#ec4b95',literal:'#a0e9bc',custom:'#ef5b62',note:'#e4eaf1'};
  const dark=new Set(['event','action','condition','value','variable','literal','custom','note']);
  const font='Microsoft YaHei, PingFang SC, sans-serif';
  const textWidth=s=>[...String(s)].reduce((n,c)=>n+(/[\u0000-\u00ff]/.test(c)?8.4:16),0);
  function wrap(text,width){
    const lines=[];let row='';
    for(const c of String(text)){if(c==='\n'||textWidth(row+c)>width){lines.push(row);row=c==='\n'?'':c;}else row+=c;}
    if(row||!lines.length)lines.push(row);return lines;
  }
  const text=(lines,x,y,fill='#fff',size=16)=>`<text x="${x}" y="${y}" fill="${fill}" font-family="${font}" font-size="${size}" font-weight="500">${lines.map((line,i)=>`<tspan x="${x}" dy="${i?23:0}">${esc(line)}</tspan>`).join('')}</text>`;
  const translate=(x,y,html)=>`<g transform="translate(${x},${y})">${html}</g>`;
  // Slot labels are teaching annotations; the value inside keeps its own block shape.
  const slotNames={
    '设置变量':['变量名','写入值'], '设置列表的元素':['目标列表','索引（从0开始）','写入值'],
    '列表添加（增加）':['目标列表','追加元素'], '移除列表所有元素':['目标列表'],
    '获取列表长度':['目标列表'], '列表存在元素':['目标列表','查找元素'],
    '重复执行':['次数'], '遍历整数':['起点','终点（不含）','步长'], '遍历列表':['目标列表'],
    '运行计时器':['间隔（秒）','执行次数（-1为无限）','是否立刻执行'],
    '运行帧计时器':['间隔（帧）','执行次数（-1为无限）','是否立刻执行'],
    '如果':['条件'], '比较':['左值','比较符','右值'], '与':['条件1','条件2'], '或':['条件1','条件2'],
    '随机整数':['最小值（含）','最大值（含）'],
    '发送提示给玩家':['接收者','提示文字','持续时间（秒）'], '发送信息':['信息文字'],
    '接收自定义事件（全局）':['事件名'], '发送自定义事件（全局）':['事件名'],
    '由实数获得[X:0, Y:0, Z:0]':['X','Y','Z']
  };
  function displayParts(parts,owner={}){
    const title=parts[0],custom=title==='自定义动作';let input=0;
    const names=owner.inputLabels||slotNames[title]||(/^列表取值/.test(title)?['目标列表','索引（从0开始）']:/运算/.test(title)?['左值','运算符','右值']:[]);
    return parts.map((part,i)=>{
      if(i===0)return custom?(owner.definition?'定义自定义动作':'调用自定义动作'):part;
      if(custom&&i===1)return part;
      if(part==='='&&['设置变量','设置列表的元素'].includes(title))return part;
      // Free-form labels from legacy structured examples are not native input slots.
      if(typeof part==='string'&&!['比较','与','或'].includes(title)&&!/运算/.test(title))return part;
      const label=part.label||names[input]||('参数'+(input+1));input++;
      return{kind:'slot',label,value:part};
    });
  }
  function partLayout(part,maxWidth=640,plainInk='#fff'){
    maxWidth=Math.max(180,maxWidth);
    if(typeof part==='string'){const lines=wrap(part,maxWidth);return{w:Math.max(...lines.map(textWidth))+2,h:lines.length*23,svg:text(lines,0,18,plainInk)};}
    if(part.kind==='slot'){
      const inner=partLayout(part.value,maxWidth,plainInk),label=String(part.label),w=Math.max(inner.w,textWidth(label)*.72);
      return{w,h:inner.h+20,svg:text([label],3,12,plainInk,11)+translate(0,20,inner.svg)};
    }
    const kind=part.kind||'value',ink=dark.has(kind)?'#10240b':'#fff';
    const nested=part.parts?.length?displayParts(part.text?[part.text,...part.parts]:part.parts,part):null;
    const inner=nested?rowLayout(nested,maxWidth-28,ink):partLayout(String(part.text??''),maxWidth-28,ink);
    const w=Math.max(30,inner.w+24),h=inner.h+10;
    const shape=kind==='condition'?`<path d="M12 0 H${w-12} L${w} ${h/2} L${w-12} ${h} H12 L0 ${h/2}Z"/>`:`<rect width="${w}" height="${h}" rx="${kind==='note'?5:Math.min(17,h/2)}"/>`;
    return{w,h,svg:`<g data-slot-kind="${esc(kind)}" fill="${colors[kind]||colors.note}" stroke="${kind==='note'?'#cbd6ec':'#16312880'}" stroke-width="1.2">${shape}</g>`+translate(12,5,inner.svg)};
  }
  function rowLayout(parts,maxWidth,ink='#fff'){
    let x=0,y=0,rowH=23,w=0,svg='';
    for(const p of parts){const item=partLayout(p,maxWidth,ink);if(x&&x+item.w>maxWidth){y+=rowH+9;x=0;rowH=23;}
      svg+=translate(x,y,item.svg);x+=item.w+10;rowH=Math.max(rowH,item.h);w=Math.max(w,x-10);
    }return{w,h:y+rowH,svg};
  }
  function stackPath(w,h,hat=false){return hat?`M0 18 Q0 7 12 7 H20 Q38 -10 58 7 H${w-12} Q${w} 7 ${w} 19 V${h-12} Q${w} ${h} ${w-12} ${h} H65 L59 ${h+6} H41 L35 ${h} H12 Q0 ${h} 0 ${h-12}Z`:`M12 0 H34 L40 6 H60 L66 0 H${w-12} Q${w} 0 ${w} 12 V${h-12} Q${w} ${h} ${w-12} ${h} H66 L60 ${h+6} H40 L34 ${h} H12 Q0 ${h} 0 ${h-12} V12 Q0 0 12 0Z`;}
  function nodesLayout(nodes,maxWidth=820,counter={next:1}){
    let y=0,w=0,svg='';
    for(let i=0;i<nodes.length;i++){
      const node=nodes[i],number=node.kind==='note'?null:counter.next++,n=nodeLayout(node,Math.max(300,maxWidth-34),counter);
      const badge=number===null?'':`<circle cx="12" cy="23" r="12" fill="#20232e" stroke="#a7b4ce"/>`+text([String(number)],number>99?1:number>9?4:8,27,'#eaf0ff',11);
      svg+=translate(0,y,badge)+translate(34,y,`<g data-block-kind="${esc(node.kind||'note')}"${number===null?'':` data-step="${number}"`}>${n.svg}</g>`);
      y+=n.h;w=Math.max(w,n.w+34);
      const next=nodes[i+1],connected=next&&node.kind!=='note'&&next.kind!=='note'&&!node.definition&&!next.definition&&next.kind!=='event';
      if(connected)svg+=`<path d="M84 ${y} v12 m-4 -4 l4 4 l4 -4" fill="none" stroke="#596b7a" stroke-width="1.5" data-flow="next"/>`;
      y+=connected?17:14;
    }return{w,h:y,svg};
  }
  function nodeLayout(node,maxWidth,counter){
    const kind=node.parts?.[0]==='设置变量'?'variable':node.kind||'note',note=kind==='note';
    const ink=dark.has(kind)?'#251c04':note?'#d8dce8':'#fff';
    const row=rowLayout(displayParts(node.parts||[''],node),Math.max(270,maxWidth-44),ink);
    const w=Math.max(note?200:150,row.w+42),h=row.h+(kind==='event'?31:24);
    const headShape=note?`<rect width="${w}" height="${h}" rx="8" fill="${colors.note}" stroke="#697080" stroke-dasharray="5 4"/>`:`<path d="${stackPath(w,h,kind==='event')}" fill="${colors[kind]}" stroke="#ffffff65" stroke-width="1.2"/>`;
    let svg=headShape+translate(20,kind==='event'?20:12,row.svg),height=h+6,totalW=w;
    if(kind==='control'||(kind==='custom'&&node.definition)){
      const title=node.parts?.[0],isIf=title==='如果'||title==='如果/否则',timer=/^运行.*计时器$/.test(title),loop=/^(重复执行|遍历)/.test(title);
      const inside=kind==='custom'?'定义内部 · 依次搭建':isIf?'真 · 条件成立时执行':timer?'到期回调内部 · 每次触发时执行':loop?'循环内部 · 每次重复时执行':'控制内部';
      const label=(content,y)=>text([content],30,y+17,'#e9dcff',13);
      let y=h+6;svg+=label(inside,y);y+=27;
      const children=nodesLayout(node.children?.length?node.children:[{kind:'note',parts:['此内部未连接动作']}],maxWidth-30,counter);
      svg+=translate(26,y,children.svg);y+=children.h+7;totalW=Math.max(totalW,children.w+26,textWidth(inside)*.82+40);
      if(isIf&&node.otherwise){
        svg+=label('假 · 否则执行（与上方分支二选一）',y);y+=27;
        const other=nodesLayout(node.otherwise.length?node.otherwise:[{kind:'note',parts:['此分支不连接动作']}],maxWidth-30,counter);
        svg+=translate(26,y,other.svg);y+=other.h+7;totalW=Math.max(totalW,other.w+26,340);
      }else if(isIf){svg+=label('假 · 跳过内部，继续下方连接',y);y+=30;totalW=Math.max(totalW,340);}
      const exit=kind==='custom'?'定义结束 · 返回调用处':isIf?'分支汇合 · 接下方动作':timer?'外层后续 · 不属于上方到期回调':loop?'循环结束 · 接下方动作':'控制结束 · 接下方动作';
      // The footer is a connector; its adjacent prose is not an invented return/end block.
      const exitLabel='接线提示：'+exit;
      svg=`<rect x="0" y="${h-5}" width="19" height="${y-h+18}" rx="8" fill="${colors[kind]}"/>`+svg+`<path d="${stackPath(118,24)}" transform="translate(0,${y})" fill="${colors[kind]}" stroke="#ffffff50" data-flow="exit"/>`+text([exitLabel],136,y+18,'#596b7a',12);
      height=y+34;totalW=Math.max(totalW,136+textWidth(exitLabel)*.75);
    }else if(node.children?.length){
      const eventLabel=kind==='event'?27:0;
      if(eventLabel)svg+=text(['事件触发后 · 按下方顺序执行'],20,h+24,'#ffe49a',13);
      const children=nodesLayout(node.children,maxWidth,counter);svg+=translate(0,h+6+eventLabel,children.svg);height=h+6+eventLabel+children.h;totalW=Math.max(w,children.w);
    }
    if(node.annotation){const lines=wrap(node.annotation,Math.max(270,totalW-30));svg+=text(lines,12,height+16,'#cbd6ec',12);height+=lines.length*23+8;}
    return{w:totalW,h:height,svg};
  }
  function svg(roots,label='彩色积木搭建示意'){
    const layout=nodesLayout(roots),w=Math.ceil(Math.max(640,layout.w+56)),h=Math.ceil(layout.h+102);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}"><title>${esc(label)}</title><desc>彩色块为教学连接示意，编号用于定位搭建步骤。参数槽显示槽名和具体值，嵌套取值保持在槽内。灰色虚线框是说明，不能直接当作原生积木。循环内部、分支和外层后续分别标明。</desc><rect width="${w}" height="${h}" rx="12" fill="#eef2f6"/>${text(['编号定位搭建步骤 · 小标签是槽位说明 · 灰框为教学备注'],26,29,'#596b7a',12)}${translate(26,57,layout.svg)}</svg>`;
  }
  const literal=text=>({kind:'literal',text:String(text)}),value=text=>({kind:'value',text:String(text)}),variable=text=>({kind:'variable',text:String(text)}),condition=parts=>({kind:'condition',parts});
  const known=window.EGG_MANUAL?.entries||[], titles=[...new Set(known.map(e=>e.title))].sort((a,b)=>b.length-a.length);
  const symbols=new Set(Object.values(window.EGG_BUILD_GUIDES||{}).flatMap(g=>(g.variables||[]).flatMap(row=>row[0].split(/\s*\/\s*/))));
  let lessonTypes=new Map();
  const normalizeType=raw=>String(raw).trim().replace(/（.*|\(.*|[，；].*/g,'').replace(/^实数/,'定点数').replace(/^布尔(?=列表|$)/,'布尔值');
  function inputType(raw){
    let s=raw.trim();
    while((s[0]==='('&&s.at(-1)===')')||(s[0]==='（'&&s.at(-1)==='）')){let depth=0,whole=true;for(let i=0;i<s.length-1;i++){if('（('.includes(s[i]))depth++;if('）)'.includes(s[i]))depth--;if(!depth){whole=false;break;}}if(!whole)break;s=s.slice(1,-1).trim();}
    if(lessonTypes.has(s))return lessonTypes.get(s);
    if(/^[+−-]?\d+\.\d+$/.test(s))return '定点数';
    if(/^[+−-]?\d+$/.test(s))return '整数';
    const item=listAccess(s);
    if(item){const t=lessonTypes.get(item.name);return t?.endsWith('列表')?t.slice(0,-2):null;}
    for(const ops of ['+−-','×÷*']){const i=splitAtTop(s,ops,true,true);if(i>0){const types=[inputType(s.slice(0,i)),inputType(s.slice(i+1))];if(types.includes('向量'))return '向量';if(types.includes('定点数'))return '定点数';if(types.every(t=>t==='整数'))return '整数';return null;}}
    return null;
  }
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
  function listAccess(source){
    const match=/^([\w\u3400-\u9fff]+)\s*\[/.exec(source);
    if(!match||!source.endsWith(']'))return null;
    const start=source.indexOf('[');let depth=0;
    for(let i=start;i<source.length;i++){
      if(source[i]==='[')depth++;else if(source[i]===']')depth--;
      if(depth===0&&i!==source.length-1)return null;
    }
    const index=source.slice(start+1,-1).trim();return depth===0&&index?{name:match[1],index}:null;
  }
  const nativeAliases={'整数运算':'整数运算(+-×÷)','实数运算':'实数运算(+-×÷)','向量运算':'向量运算(+-×÷)','向量':'由实数获得[X:0, Y:0, Z:0]'};
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
    for(const ops of ['+−-','×÷*']){const i=splitAtTop(s,ops,true,true);if(i>0&&s.slice(i+1).trim()){
      const left=s.slice(0,i),right=s.slice(i+1),types=[inputType(left),inputType(right)];
      const decimal=types.includes('定点数')||/(?:^|[^\w])\d+\.\d+/.test(s);
      const vector=types.includes('向量');
      return{kind:'value',parts:[vector?'向量运算(+-×÷)':decimal?'实数运算(+-×÷)':types.every(t=>t==='整数')?'整数运算(+-×÷)':'数值运算（先核对类型）',expression(left),s[i],expression(right)]};
    }}
    if(/^N\(.+\)(次)?$/.test(s))return{kind:'value',parts:['获取列表长度',variable(s.slice(2,s.lastIndexOf(')')))]};
    if(s.endsWith('次')&&/[+−×\w]/.test(s.slice(0,-1)))return expression(s.slice(0,-1));
    const list=listAccess(s);
    if(list){
      const declared=lessonTypes.get(list.name);
      const element=declared?.endsWith('列表')?declared.slice(0,-2):null;
      const title=element&&known.some(e=>e.platform==='移动端'&&e.title==='列表取值：'+element)?'列表取值：'+element:'列表取值（按该列表元素类型选择）';
      return{kind:'value',parts:[title,variable(list.name),expression(list.index)]};
    }
    const call=/^(.+?)〔(.*)〕$/.exec(s);
    if(call){
      const title=nativeAliases[call[1]]||call[1],entry=known.find(e=>e.title===title&&e.platform==='移动端'&&['条件','取值'].includes(e.category));
      if(!entry)return{kind:'note',text:'待核对表达式：'+s};
      return{kind:entry.category==='条件'?'condition':'value',parts:[title,...splitArguments(call[2]).map(x=>expression(call[1]==='向量'?x.replace(/^[XYZ]=/,''):x))]};
    }
    if(known.some(e=>e.title===s&&e.category==='取值'))return value(s);
    const labelled=/^(次数|间隔|立刻执行)(.+)$/.exec(s);
    if(labelled)return expression(labelled[2]);
    return lessonTypes.has(s)||symbols.has(s)||/^(输入行|输入列|格A|格B|格C|目标编号|编号)$/.test(s)?variable(s):literal(s);
  }
  // Parse only the documented teaching grammar. Prose stays a visible note.
  function fromTree(tree,options={}){
    lessonTypes=new Map();
    for(const row of options.variables||[]){for(const name of row[0].split(/\s*\/\s*/))lessonTypes.set(name.trim(),normalizeType(row[1]));}
    const signatures=new Map(),identifier=/^[\w\u3400-\u9fff]+$/;
    function customName(line){const match=/^【自建】([^〔]+)(?:〔(.*)〕)?$/.exec(line);return match?{name:match[1].trim(),raw:match[2]||''}:null;}
    function signature(raw){
      const result=[],pending=[];
      for(const item of splitTop(raw,['，',',','；',';'])){
        const typed=/^(.+?)[：:]\s*(?:均为)?(整数|定点数|实数|布尔值?|字符串|组件|玩家|角色蛋仔|生物|坐标点|向量)(列表)?$/.exec(item.trim());
        if(typed){pending.push(typed[1].trim());for(const name of pending.splice(0))if(identifier.test(name))result.push({name,type:normalizeType(typed[2]+(typed[3]||''))});}
        else if(identifier.test(item.trim())&&!/^\d+$/.test(item.trim()))pending.push(item.trim());
      }
      for(const name of pending)result.push({name,type:null});return result;
    }
    const sourceSections=[...(options.sections||[]),{tree}];
    for(const section of sourceSections){
      const lines=String(section.diagramTree||section.tree||'').split('\n').filter(x=>x.trim());
      for(let i=0;i<lines.length;i++){
        const line=lines[i],custom=customName(line.trim());if(!custom)continue;
        const indented=lines[i+1]&&lines[i+1].match(/^ */)[0].length>line.match(/^ */)[0].length;
        if(indented||/[：:](?:均为)?(?:整数|定点数|实数|布尔|字符串|组件|玩家|角色蛋仔|生物|坐标点|向量)/.test(custom.raw)){
          const params=signature(custom.raw);if(params.length)signatures.set(custom.name,params);
        }
      }
    }
    for(const match of tree.matchAll(/【自建】[^\n〔]+〔([^〕]*)〕/g))for(const param of signature(match[1]))if(param.type)lessonTypes.set(param.name,param.type);
    for(const match of tree.matchAll(/([\w\u3400-\u9fff]+)\s*←/g))symbols.add(match[1]);
    const note=line=>({kind:'note',parts:[line]});
    function parts(line){
      const open=line.indexOf('〔');if(open<0)return[line];const close=line.lastIndexOf('〕');if(close<open)return[line];
      const title=line.slice(0,open),content=line.slice(open+1,close),textOnly=['发送信息','接收自定义事件（全局）','发送自定义事件（全局）'].includes(title);
      const inputs=textOnly?[literal(content)]:splitArguments(content).map((s,i)=>title==='发送提示给玩家'&&i===1?literal(s.trim()):expression(s));
      return[title,...inputs,line.slice(close+1)].filter(x=>x!=='');
    }
    function create(line){
      const custom=customName(line);
      if(custom){const params=signatures.get(custom.name);return[{kind:'custom',parts:['自定义动作',...parts(line.slice(4))],...(params?{inputLabels:params.map(p=>p.name+(p.type?' · '+p.type:''))}:{})}];}
      if(/^如果\s*/.test(line))return[{kind:'control',parts:['如果',expression(line.replace(/^如果\s*/,''))],children:[]}];
      const assignment=/^(.+?)\s*←\s*(.+)$/.exec(line);
      if(assignment){
        const target=assignment[1].trim(),rhs=assignment[2].trim().replace(/〔动作〕$/,''),list=listAccess(target);
        if(!list&&!identifier.test(target))return[note(line)];
        if(/^\[.*\]$/.test(rhs)){
          const declared=lessonTypes.get(target),content=rhs.slice(1,-1),elements=content.trim()?splitArguments(content):[];
          if(!list&&declared?.endsWith('列表')&&elements.every(x=>x.trim()&&!/…|\.\.\./.test(x)&&!/^\s*\[/.test(x)))return[
            {kind:'action',parts:['移除列表所有元素',variable(target)],annotation:'初始化 '+declared+'：先清空，再按索引从0开始逐个追加'},
            ...elements.map((element,i)=>({kind:'action',parts:['列表添加（增加）',variable(target),expression(element)],annotation:'本次追加到索引 '+i}))
          ];
          return[note('列表初始化待核对（需声明列表类型并写全元素）：'+line)];
        }
        return[{kind:'action',parts:list?['设置列表的元素',variable(list.name),expression(list.index),'=',expression(rhs)]:['设置变量',variable(target),'=',expression(rhs)]}];
      }
      const append=/^([\w\u3400-\u9fff]+)\s+追加\s+(.+)$/.exec(line);if(append)return[{kind:'action',parts:['列表添加（增加）',variable(append[1]),expression(append[2])]}];
      const entering=/^进入([\w\u3400-\u9fff]+)$/.exec(line);if(entering)return[{kind:'event',parts:['角色进出指定触发区域',literal('进入'),value(entering[1])],children:[]}];
      const clean=line.replace(/^提示〔/,'发送提示给玩家〔').replace(/〔(?:事件|本课临时测试|最终仅保留这一条)〕$/,'');
      const title=titles.find(t=>clean===t||clean.startsWith(t+'〔')||clean.startsWith(t+'：'));
      const found=known.find(e=>e.title===title&&e.platform==='移动端');
      if(found){const kind={事件:'event',动作:'action',控制:'control',条件:'condition',取值:'value'}[found.category]||'note';return[{kind,parts:parts(clean),...(['event','control'].includes(kind)?{children:[]}:{} )}];}
      return[note(line)];
    }
    function sequence(source){
      const arrow=topTokens(source,['→'])[0],head=(arrow?source.slice(0,arrow.at):source).trim(),tail=arrow?source.slice(arrow.at+1).trim():'';
      const nodes=splitStatements(head).flatMap(create);
      if(tail){
        const last=nodes.at(-1);
        if(!last||last.kind==='note')return[note(source)];
        const next=sequence(tail);
        if(['event','control'].includes(last.kind))last.children.push(...next);
        else nodes.push(...next); // An ordinary action or custom call continues, never owns a callback body.
      }
      return nodes;
    }
    const roots=[],stack=[{indent:-1,nodes:roots,parent:null}];
    for(const raw of tree.split('\n')){
      if(!raw.trim())continue;
      const indent=raw.match(/^ */)[0].length;
      while(stack.length>1&&indent<=stack.at(-1).indent)stack.pop();
      const scope=stack.at(-1),line=raw.trim();
      const field=/^(接收者|提示文字|持续时间|组件|线速度|是否局部坐标|次数|间隔)[：:](.+)$/.exec(line);
      if(field&&scope.parent&&scope.parent.kind!=='custom'){
        const input=field[1]==='提示文字'?literal(field[2]):expression(field[2]);input.label=field[1];scope.parent.parts.push(input);continue;
      }
      const arrow=topTokens(line,['→'])[0],before=(arrow?line.slice(0,arrow.at):line).trim(),after=arrow?line.slice(arrow.at+1).trim():'';
      if(before==='否则'||/^否则如果\s+/.test(before)){
        let previous=scope.nodes.at(-1);
        while(previous?.otherwise?.length===1&&previous.otherwise[0].elseIf)previous=previous.otherwise[0];
        if(previous?.kind==='control'&&previous.parts[0]==='如果'&&!previous.otherwise){
          previous.otherwise=[];let branch={indent,nodes:previous.otherwise,parent:previous};
          if(before!=='否则'){const nested=create(before.slice(2))[0];nested.elseIf=true;branch.nodes.push(nested);branch={indent,nodes:nested.children,parent:nested};}
          stack.push(branch);if(after)branch.nodes.push(...sequence(after));
        }else scope.nodes.push(note(line));
        continue;
      }
      if(/^否则/.test(before)){scope.nodes.push(note(line));continue;}
      const nodes=sequence(line);scope.nodes.push(...nodes);
      const node=nodes.at(-1);
      // A custom block with real indented content is a definition; an inline arrow is a call chain.
      if(node&&['event','control','action','custom'].includes(node.kind)){
        node.children||=[];stack.push({indent,nodes:node.children,parent:node});
      }
    }
    function markDefinitions(nodes){for(const node of nodes){
      if(node.kind==='custom'&&(node.definition||node.children?.length)){node.definition=true;const params=signatures.get(node.parts[1]);if(params)node.parts=['自定义动作',node.parts[1],...params.map(p=>variable(p.name))];}
      if(node.children)markDefinitions(node.children);if(node.otherwise)markDefinitions(node.otherwise);
    }}
    markDefinitions(roots);
    // Legacy guides sometimes put a single definition's body flush left. Do not consume another definition or event.
    if(options.definition&&roots[0]?.kind==='custom'&&!roots[0].definition){
      const stop=roots.findIndex((node,i)=>i>0&&(node.definition||node.kind==='event'));
      const body=roots.splice(1,stop<0?roots.length-1:stop-1);roots[0].children=body;roots[0].definition=true;
    }
    markDefinitions(roots);
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
