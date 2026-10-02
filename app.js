"use strict";

const page = document.body.dataset.page;
const params = new URLSearchParams(location.search);
const lessons = window.EGG_LESSONS || [];
const practices = window.EGG_TUTORIALS || [];
const buildGuides = window.EGG_BUILD_GUIDES || {};
const manual = window.EGG_MANUAL;
const baseLessonCount = Number(document.body.dataset.foundationCount);
const totalLessonCount = Number(document.body.dataset.lessonCount);
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}
const mascots = ["yellow", "pink", "black"];
const courseSummaries = ["打开蛋码，用一条欢迎提示完成第一次创作。", "认识事件、条件和动作，让地图听懂你的指令。", "用变量记录分数，理解数据的作用范围。", "学会判断与重复，把简单动作排出节奏。", "认识列表和自定义积木，让重复步骤变简单。", "阅读一段纯 Lua 示例，向文本编程迈出一小步。"];

if (page === "home") {
  const legacy = { "#courses": "courses.html", "#practice": "practice.html", "#manual": "manual.html", "#roadmap": "courses.html" };
  if (legacy[location.hash]) location.replace(legacy[location.hash]);
}
if (page === "courses" || page === "practice") {
  const items = page === "courses" ? lessons : practices;
  const renderCard = (item, index) => {
    const number = page === 'courses' ? index + 1 : items.slice(0,index+1).filter(lesson=>(lesson.series||'积木练习')===(item.series||'积木练习')).length;
    return `<a class="course-card tone-${index % 3}" href="lesson.html?id=${index + (page === "practice" ? baseLessonCount : 0)}">
    <div class="course-visual"><span class="course-number">${String(number).padStart(2, "0")}</span><img src="assets/eggy-${mascots[index % 3]}.png" width="120" height="130" alt="" loading="lazy"></div>
    <div class="course-info"><span class="course-category">${escapeHTML(page === "practice" ? item.category : item.category.split(" / ")[1])}</span><h2>${escapeHTML(item.title.replace(/^(?:数值图|消消乐)\s*\d+\s*·\s*/,''))}</h2><p>${escapeHTML(page === "courses" ? courseSummaries[index] : item.summary)}</p><div class="card-bottom"><span>${page === "courses" ? "入门课程 · 含动手练习" : buildGuides[index + baseLessonCount].sections.length + " 个搭建步骤 · 参数与连接图"}</span><span class="round-arrow" aria-hidden="true">↗</span></div></div></a>`;
  };
  document.getElementById(page === "courses" ? "courses-grid" : "practice-grid").innerHTML = page === "courses" ? items.map(renderCard).join("") : [
    ["progression", "数值图", "数值图 · 从训练成长到打怪养成", "18 篇连续课程 / 训练成长 · 单人战斗 · 大数转换与运算"],
    ["match3", "消消乐", "消消乐 · 从棋盘到完整关卡", "6 篇连续课程 / 建议按顺序学习"],
    ["gameplay", "玩法拓展", "把逻辑变成可玩的挑战", "4 个独立玩法 / 在场景中组合验证"],
    ["basics", "积木练习", "先练好每一块积木", "6 个基础案例 / 从提示到机关"]
  ].map(([id, series, title, description],groupIndex) => `<section class="practice-group" id="${id}"><div class="practice-banner"><div><p class="eyebrow">${escapeHTML(series)}专题</p><h2>${escapeHTML(title)}</h2><p>${escapeHTML(description)}</p></div><img src="assets/eggy-${mascots[groupIndex%3]}.png" alt="" width="120" height="130"></div><div class="course-grid">${items.map((item,index) => (item.series || "积木练习") === series ? renderCard(item,index) : "").join("")}</div></section>`).join("");
  if(page==='practice') {
    const selectSeries=()=>{
      const key=location.hash.slice(1),groups=[...document.querySelectorAll('.practice-group')];
      const selected=groups.some(group=>group.id===key)?key:'all';
      groups.forEach(group=>{group.hidden=selected!=='all'&&group.id!==selected;});
      document.querySelectorAll('[data-series]').forEach(link=>{if(link.dataset.series===selected)link.setAttribute('aria-current','true');else link.removeAttribute('aria-current');});
      const count=groups.filter(group=>!group.hidden).reduce((sum,group)=>sum+group.querySelectorAll('.course-card').length,0);
      document.getElementById('series-status').textContent=`当前显示${count}篇教程`;
    };
    selectSeries();window.addEventListener('hashchange',selectSeries);
  }
}

function renderBuildGuide(guide, index) {
  const code = section => window.EGG_BLOCKS.figure(window.EGG_BLOCKS.fromTree(section.tree,{definition:/自定义动作|封装成自定义/.test(section.title)}),'彩色积木搭建图') + '<details class="diagram-text"><summary>查看文字连接顺序</summary><div class="lesson-code-wrap"><pre><code>' + escapeHTML(section.tree) + '</code></pre><button class="copy-code" type="button">复制连接文字</button></div></details>';
  const series = practices[index-baseLessonCount]?.series;
  const related = ["消消乐","数值图"].includes(series) ? '<details class="series-switcher"><summary>同专题的其他课程</summary><nav class="recipe-series" aria-label="'+escapeHTML(series)+'系列课程">' + practices.map((item,offset)=>item.series===series?'<a href="lesson.html?id='+(offset+baseLessonCount)+'"'+(index===offset+baseLessonCount?' aria-current="page"':'')+'>'+escapeHTML(item.title.split(' · ')[0])+'</a>':'').join('')+'</nav></details>' : '';
  const refs = guide.refs.map(id => manual.entries.find(entry => entry.id === id)).filter(Boolean).map(entry => '<a class="block-reference" href="block.html?id=' + encodeURIComponent(entry.id) + '&lesson=' + index + '">' + escapeHTML(entry.title) + ' <small>' + escapeHTML(entry.group) + '</small></a>').join('');
  return '<div class="build-guide"><h2 class="sr-only">搭建指南</h2><div class="guide-overview"><span><strong>'+guide.sections.length+'</strong> 个搭建步骤</span><span>附彩色连接图与验收清单</span><a class="button button-blue" href="#step-1">开始搭建</a></div>' +
    '<details class="lesson-preparation" id="preparation"><summary><span>搭建前，先准备好这些<small>环境约定、变量、算例与积木参数</small></span><span class="disclosure-mark" aria-hidden="true">+</span></summary><div class="preparation-body"><h3>环境与约定</h3><ul>' + guide.setup.map(item=>'<li>'+escapeHTML(item)+'</li>').join('') + '</ul>' +
    '<details class="recipe-notation"><summary>第一次照图搭建？先看符号与操作说明</summary><ol>' + window.EGG_GUIDE_NOTATION.map(item=>'<li>'+escapeHTML(item)+'</li>').join('') + '</ol></details>' +
    (guide.variables.length ? '<h3 id="variables">变量清单</h3><p>列表类型与普通变量类型分开选择，名称保持一致。</p><div class="table-wrap"><table><thead><tr><th scope="col">名称</th><th scope="col">类型</th><th scope="col">初值 / 用途</th></tr></thead><tbody>' + guide.variables.map(row=>'<tr>'+row.map(cell=>'<td>'+escapeHTML(cell)+'</td>').join('')+'</tr>').join('') + '</tbody></table></div>' : '<p class="recipe-check">本课不需要创建变量。</p>') +
    (guide.samples?.length ? '<h3>跟着数值算一遍</h3><div class="table-wrap"><table><thead><tr>'+guide.samples[0].map(cell=>'<th scope="col">'+escapeHTML(cell)+'</th>').join('')+'</tr></thead><tbody>'+guide.samples.slice(1).map(row=>'<tr>'+row.map(cell=>'<td>'+escapeHTML(cell)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>' : '') +
    '<h3>本课积木 · 点开核对参数</h3><div class="block-references">' + refs + '</div></div></details>' + related + window.EGG_BLOCKS.legend() +
    guide.sections.map((section,i)=>'<section class="recipe-step" id="step-'+(i+1)+'"><p class="recipe-number">STEP '+String(i+1).padStart(2,'0')+'</p><h3>'+escapeHTML(section.title)+'</h3><ol>'+section.steps.map(item=>'<li>'+escapeHTML(item)+'</li>').join('')+'</ol>'+code(section)+'<p class="recipe-check"><strong>这一步检查：</strong>'+escapeHTML(section.verify)+'</p></section>').join('') +
    '<section id="acceptance" class="recipe-step"><h3>搭完后逐项试玩</h3><ol>'+guide.tests.map(item=>'<li>'+escapeHTML(item)+'</li>').join('')+'</ol></section>' +
    (guide.pitfalls?.length ? '<section class="recipe-step"><h3>常见问题</h3><ul>'+guide.pitfalls.map(item=>'<li>'+escapeHTML(item)+'</li>').join('')+'</ul></section>' : '') +
    '<p class="lesson-source">教程解读 · 对照2026-09-03原点版移动端手册编写。连接图需在蛋码画布逐块搭建，不能直接粘贴执行。彩色积木图为教学连接示意，完整玩法仍需按本课清单逐项试玩验收。自定义动作含异步积木时的执行顺序未在手册中明确，本教程核心动作不放等待或计时器；涉及调用后读取结果的地方，应先按步骤验收，也可把动作定义中的整串积木直接展开到调用处。</p></div>';
}

function renderPractice(tutorial, index) {
  return '<p class="lesson-callout">目标：' + escapeHTML(tutorial.goal) + '</p>' + renderBuildGuide(buildGuides[index], index);
}

if (page === "lesson") {
  const allLessons = [...lessons, ...practices];
  const compactReading=matchMedia('(max-width: 768px)');
  const updateReadingLayout=()=>{document.querySelector('.lesson-outline').open=!compactReading.matches;document.querySelector('.course-outline').open=false;};
  updateReadingLayout();compactReading.addEventListener('change',updateReadingLayout);
  const rawId = params.get("id") ?? "0";
  const index = /^\d+$/.test(rawId) ? Number(rawId) : -1;
  const groupOf = (item, i) => i < baseLessonCount ? "入门课程" : item.series || "积木练习";
  document.getElementById("lesson-toc").innerHTML = allLessons.map((item, i) => `${i === 0 || groupOf(item,i) !== groupOf(allLessons[i-1],i-1) ? `<p class="toc-group">${escapeHTML(groupOf(item,i))}</p>` : ""}<a href="lesson.html?id=${i}"${i === index ? ' aria-current="page"' : ""}><span>${String(i < baseLessonCount ? i + 1 : i - baseLessonCount + 1).padStart(2, "0")}</span>${escapeHTML(item.title)}</a>`).join("");
  const lesson = allLessons[index];
  if (!lesson) {
    document.getElementById("lesson-title").textContent = "这堂课暂时不存在";
    document.getElementById("lesson-body").innerHTML = '<p>课程链接可能有误，回到课程目录重新选择吧。</p><a class="button button-blue" href="courses.html">查看全部课程</a>';
    document.querySelector(".lesson-navigation").hidden = true;
  } else {
    const isPractice = index >= lessons.length;
    const parent = document.getElementById("lesson-parent");
    parent.href = isPractice ? "practice.html" : "courses.html";
    parent.textContent = isPractice ? "玩法实战" : "入门课程";
    document.title = lesson.title + " · 蛋码自习室";
    document.getElementById("lesson-breadcrumb").textContent = lesson.title;
    const chapterNumber = isPractice ? practices.slice(0, index - baseLessonCount + 1).filter(item => (item.series || "积木练习") === (lesson.series || "积木练习")).length : index + 1;
    document.getElementById("lesson-counter").textContent = `${isPractice ? lesson.series || "积木练习" : "入门"} / ${String(chapterNumber).padStart(2, "0")}`;
    document.getElementById("lesson-kicker").textContent = lesson.category;
    document.getElementById("lesson-title").textContent = lesson.title;
    document.getElementById("lesson-body").innerHTML = isPractice ? renderPractice(lesson, index) : renderBuildGuide(buildGuides[index], index) + '<details class="concept-review"><summary>概念与原示例回顾' + (index===5?' · 含Lua语法示例':'') + '</summary>' + lesson.content + '</details>';
    const guide=buildGuides[index];
    document.getElementById('lesson-steps').innerHTML='<a href="#preparation">准备与变量</a>'+guide.sections.map((section,i)=>'<a href="#step-'+(i+1)+'"><span>'+String(i+1).padStart(2,'0')+'</span>'+escapeHTML(section.title.replace(/^自定义动作[：:]\s*/,''))+'</a>').join('')+'<a href="#acceptance">试玩验收</a>';
    const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){document.querySelectorAll('#lesson-steps a').forEach(link=>{if(link.hash==='#'+entry.target.id)link.setAttribute('aria-current','step');else link.removeAttribute('aria-current');});}},{rootMargin:'-18% 0px -55% 0px'});
    document.querySelectorAll('#preparation,.recipe-step[id]').forEach(section=>observer.observe(section));
    document.getElementById("lesson-position").textContent = `${index + 1} / ${allLessons.length}`;
    const previous = document.getElementById("previous-lesson");
    previous.href = index === 0 ? "courses.html" : `lesson.html?id=${index - 1}`;
    previous.textContent = index === 0 ? "课程目录" : "上一课";
    const next = document.getElementById("next-lesson");
    next.href = index === allLessons.length - 1 ? "practice.html" : `lesson.html?id=${index + 1}`;
    next.textContent = index === allLessons.length - 1 ? "返回实战目录" : "下一课";
  }
}

// 锚点可直达折叠区里的变量表，原生 details 仍支持键盘展开。
function revealAnchor(hash) {
  let id;try{id=decodeURIComponent(hash.slice(1));}catch{return;}
  const target=document.getElementById(id);if(!target)return;
  let node=target;while(node){if(node.tagName==='DETAILS')node.open=true;node=node.parentElement;}
  requestAnimationFrame(()=>target.scrollIntoView({block:'start',behavior:'instant'}));
}
if(page==='lesson') {
  document.addEventListener('click',event=>{const link=event.target.closest('a[href^="#"]');if(link&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.altKey)revealAnchor(link.hash);});
  window.addEventListener('hashchange',()=>revealAnchor(location.hash));
  if(location.hash)revealAnchor(location.hash);
}
if(page==='home') {
  // ponytail: 固定 3×3 交换与消除示意；完整棋盘扫描、下落和连锁见消消乐课程。
  const initial=['gold','blue','coral','blue','gold','blue','coral','blue','gold'];
  const cells=[...document.querySelectorAll('[data-cell]')],button=document.getElementById('home-demo'),status=document.getElementById('demo-status');
  let cleared=false;
  button.addEventListener('click',async()=>{
    if(cleared){
      cells.forEach((cell,index)=>cell.className='demo-tile tile-'+initial[index]);
      status.textContent='棋盘已重置。交换一下，再试一次。';
      button.innerHTML='交换，消除！ <span aria-hidden="true">↗</span>';
      button.setAttribute('aria-label','播放消消乐交换与消除演示');
      cleared=false;return;
    }
    button.disabled=true;
    const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
    try{
      if(!reduce){
        const distance=cells[4].offsetTop-cells[1].offsetTop;
        await Promise.all([[1,distance],[4,-distance]].map(([index,y])=>cells[index].animate([{translate:'0 0'},{translate:'0 '+y+'px'}],{duration:340,easing:'cubic-bezier(.2,.8,.2,1)'}).finished));
      }
      cells[1].className='demo-tile tile-gold';cells[4].className='demo-tile tile-blue';
      if(!reduce)await Promise.all([3,4,5].map(index=>cells[index].animate([{scale:1,opacity:1},{scale:1.12,opacity:1,offset:.35},{scale:.3,opacity:0}],{duration:430}).finished));
      [3,4,5].forEach(index=>cells[index].classList.add('is-cleared'));
      status.textContent='消除了 3 个蓝色积木！下一步：下落与补齐。';
      button.innerHTML='再玩一次 <span aria-hidden="true">↻</span>';
      button.setAttribute('aria-label','重置消消乐演示棋盘');
      cleared=true;
    }catch{
      cells.forEach((cell,index)=>cell.className='demo-tile tile-'+initial[index]);
      status.textContent='演示已重置，可以再试一次。';
    }finally{button.disabled=false;}
  });
}

let toastTimer;
document.addEventListener("click", async event => {
  const button = event.target.closest(".copy-code");
  if (!button) return;
  const code = button.parentElement.querySelector("code");
  try {
    await navigator.clipboard.writeText(code.textContent);
    const toast = document.getElementById("toast");
    toast.textContent = "内容已复制，去试试看吧！";
    toast.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("visible"), 2300);
  } catch {
    const range = document.createRange();
    range.selectNodeContents(code);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    button.textContent = "已选中，请手动复制";
  }
});

// 只渲染手册实际使用的格式；原文不作为 HTML 执行。
function renderManualBody(body) {
  return body.replace(/^(#{3,6} .+)$/gm, "\n\n$1\n\n").split(/\n\s*\n/).filter(Boolean).map(block => {
    const heading = /^(#{3,6})\s+([^\n]+)$/.exec(block.trim());
    if (heading) return `<h3>${escapeHTML(heading[2])}</h3>`;
    const text = block.split(/(!\[[^\]]*\]\(https:\/\/[^\s)]+\))/g).map(part => {
      const image = /^!\[([^\]]*)\]\((https:\/\/[^\s)]+)\)$/.exec(part);
      if (image && new URL(image[2]).hostname === "u5-creator.s3.game.163.com") return `<a class="manual-image-link" href="${escapeHTML(image[2])}" target="_blank" rel="noopener noreferrer">查看官方配图${image[1] ? "：" + escapeHTML(image[1]) : ""}</a>`;
      return escapeHTML(part).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\n/g, "<br>");
    }).join("");
    return block.length > 700 ? `<details class="long-parameter"><summary>展开完整类型或参数说明（${block.length} 字符）</summary><p>${text}</p></details>` : `<p>${text}</p>`;
  }).join("");
}


function blockURL(id, extra = {}) {
  return 'block.html?' + new URLSearchParams({id, ...extra});
}
if (page === 'manual') {
  if (params.has('block')) location.replace(blockURL(params.get('block'),params.has('lesson')?{lesson:params.get('lesson')}:{}));
  const query = document.getElementById('manual-query'), platform = document.getElementById('manual-platform'), category = document.getElementById('manual-category'), group = document.getElementById('manual-group');
  group.innerHTML += [...new Set(manual.entries.map(e=>e.group))].sort((a,b)=>a.localeCompare(b,'zh-CN')).map(x=>`<option>${escapeHTML(x)}</option>`).join('');
  query.value=params.get('q')||'';
  platform.value=params.get('platform')==='电脑端'?'电脑端':'移动端';
  if([...category.options].some(o=>o.value===params.get('category')))category.value=params.get('category');
  if([...group.options].some(o=>o.value===params.get('group')))group.value=params.get('group');
  const pageSize=16;
  let currentPage=Math.max(0,Math.floor(Number(params.get('page'))||1)-1),matched=[];
  const searchable=manual.entries.map(entry=>({entry,text:`${entry.title} ${entry.group} ${entry.body}`.normalize('NFKC').toLocaleLowerCase()}));
  const state = () => new URLSearchParams({q:query.value,platform:platform.value,category:category.value,group:group.value,page:String(currentPage+1)});
  function render(){
    const total=Math.max(1,Math.ceil(matched.length/pageSize));
    currentPage=Math.min(currentPage,total-1);
    const search=state().toString();
    history.replaceState(null,'','manual.html?'+search);
    document.getElementById('manual-result-count').textContent=`${platform.value} · ${matched.length.toLocaleString('zh-CN')} 条结果`;
    document.getElementById('manual-results').innerHTML=matched.slice(currentPage*pageSize,(currentPage+1)*pageSize).map(e=>{
      const desc=e.body.match(/#### 描述\s+([^\n]+)/)?.[1]||e.body.replace(/^#+ .*/gm,'').trim().split('\n')[0];
      return `<a class="manual-result" href="${escapeHTML(blockURL(e.id,{from:search}))}"><span class="manual-result-meta"><span class="block-kind" data-kind="${e.category}">${e.category}</span><span>${escapeHTML(e.group)}</span></span><span><strong>${escapeHTML(e.title)}</strong><span class="manual-excerpt">${escapeHTML(desc.replace(/\{#(\d+)\}/g,(_,n)=>'〔参数'+(Number(n)+1)+'〕'))}</span></span><span class="manual-read">详解 · 例子</span></a>`;
    }).join('');
    document.getElementById('manual-empty').hidden=matched.length>0;
    document.getElementById('manual-page').textContent=matched.length?`${currentPage+1} / ${total}`:'0 条结果';
    document.getElementById('manual-prev').disabled=currentPage===0;
    document.getElementById('manual-next').disabled=!matched.length||currentPage>=total-1;
  }
  function filter(reset=true){
    if(reset)currentPage=0;
    const words=query.value.normalize('NFKC').trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    matched=searchable.filter(({entry:e,text})=>(e.platform===platform.value||e.platform==='通用')&&(!category.value||e.category===category.value)&&(!group.value||e.group===group.value)&&words.every(w=>text.includes(w))).map(x=>x.entry);
    render();
  }
  const form=document.getElementById('manual-search-form');
  form.addEventListener('submit',e=>{e.preventDefault();filter();});
  form.addEventListener('reset',()=>setTimeout(()=>filter(),0));
  query.addEventListener('input',()=>filter());
  [platform,category,group].forEach(x=>x.addEventListener('change',()=>filter()));
  document.getElementById('manual-clear-empty').addEventListener('click',()=>form.reset());
  for(const [id,delta]of[['manual-prev',-1],['manual-next',1]])document.getElementById(id).addEventListener('click',()=>{currentPage+=delta;render();document.getElementById('manual-result-count').scrollIntoView({block:'start'});});
  filter(false);
}
if(page==='block'){
  const entry=manual.entries.find(e=>e.id===params.get('id'));
  const root=document.getElementById('block-content');
  const from=new URLSearchParams(params.get('from')||'');
  const safeFrom=new URLSearchParams();
  for(const key of ['q','platform','category','group','page'])if(from.has(key))safeFrom.set(key,from.get(key));
  document.getElementById('block-back').href='manual.html'+(safeFrom.size?'?'+safeFrom:'');
  if(!entry){root.innerHTML='<section class="empty-state"><h1>这条积木链接不存在</h1><p>请回到手册按名称重新搜索。</p><a class="button button-blue" href="manual.html">打开积木手册</a></section>';}
  else{
    const ex=window.EGG_EXAMPLE_FOR(entry), diagram=window.EGG_BLOCKS.forEntry(entry,ex), source=manual.sources.find(s=>s.id===entry.source);
    document.title=entry.title+' · '+entry.group+' · 蛋码自习室';
    document.getElementById('block-crumb').textContent=entry.title;
    const list=(items,tag='ul')=>`<${tag}>${items.map(x=>`<li>${escapeHTML(x)}</li>`).join('')}</${tag}>`;
    const other=manual.entries.filter(e=>e.platform===entry.platform&&e.group===entry.group&&e.category===entry.category&&e.id!==entry.id).slice(0,6);
    const lessonId=params.get('lesson');
    const back=/^\d+$/.test(lessonId||'')&&Number(lessonId)<totalLessonCount?`<a class="button button-white" href="lesson.html?id=${Number(lessonId)}">返回刚才的教程</a>`:'';
    const table=ex.parameters.length?`<div class="table-wrap"><table><thead><tr><th>参数顺序</th><th>类型</th><th>填写要点</th></tr></thead><tbody>${ex.parameters.map(p=>`<tr><td>第 ${p.index+1} 项</td><td>${escapeHTML(p.summary)}${p.raw.startsWith('可选')?`<details><summary>完整支持类型</summary><p>${escapeHTML(p.raw)}</p></details>`:''}</td><td>${escapeHTML(p.help)}</td></tr>`).join('')}</tbody></table></div>`:'<p>'+escapeHTML(entry.category==='基础'?'这是一篇基础说明，不是带参数的独立积木。请按下方例子在画布中操作。':'原文没有列出普通参数。具体条件槽或内部动作区的接法见下方示例。')+'</p>';
    root.innerHTML=`<div class="block-layout"><article class="block-article"><header><div class="block-meta"><span class="block-kind" data-kind="${entry.category}">${entry.category}</span><span>${escapeHTML(entry.platform)} / ${escapeHTML(entry.group)}</span></div><h1>${escapeHTML(entry.title)}</h1><p class="block-lead">${escapeHTML(ex.explanation)}</p><p class="callout">${escapeHTML(ex.attachment)}</p>${back}</header><section class="block-section" id="parameters"><h2>01 · 参数怎么看</h2>${ex.description?`<p class="source-label">官方描述（数字与下表参数顺序对应）</p><div class="callout">${escapeHTML(ex.description.replace(/\{#(\d+)\}/g,(_,n)=>'〔参数'+(Number(n)+1)+'〕'))}</div>`:''}${table}${ex.returnType?`<p>示例输出类型：<strong>${escapeHTML(ex.returnType)}</strong></p>`:''}${ex.warnings.map(w=>`<p class="callout warning">${escapeHTML(w)}</p>`).join('')}</section><section class="block-section" id="example"><p class="example-label">教学解读 / ${escapeHTML(ex.mode)}</p><h2>02 · 动手试一次</h2><p class="example-name">${escapeHTML(ex.sampleTitle)}</p>${window.EGG_BLOCKS.legend()}${window.EGG_BLOCKS.figure(diagram.roots,entry.title+' · 彩色积木图',diagram.caption)}<h3>先准备</h3>${list(ex.setup)}<h3>逐步搭建</h3>${list(ex.steps,'ol')}${ex.tree?`<div class="lesson-code-wrap"><pre><code>${escapeHTML(ex.tree)}</code></pre><button class="copy-code" type="button">复制连接示意</button></div>`:''}<p class="recipe-check"><strong>预期结果：</strong>${escapeHTML(ex.expected)}</p></section><section class="block-section" id="pitfalls"><h2>03 · 容易出错的地方</h2>${list(ex.pitfalls)}</section><section class="block-section" id="source"><h2>04 · 对照官方原文</h2><details class="original-text"><summary>展开原文 · 描述、参数与说明</summary>${renderManualBody(entry.body)}</details><p class="lesson-source">${escapeHTML(source.filename)} · 第 ${entry.sourceLine} 行起 · 快照 ${manual.snapshot}<br>上方示例为学习站教学解读，尚未在编辑器中逐条实机验证。对象称呼和 A / B / R 等符号需换成实际对象或数值，不能直接粘贴运行。</p></section></article><aside class="block-outline"><strong>本页内容</strong><nav aria-label="积木阅读目录"><a href="#parameters">参数说明</a><a href="#example">使用例子</a><a href="#pitfalls">常见问题</a><a href="#source">官方原文</a></nav><hr><div class="related-blocks"><strong>同类积木</strong>${other.map(e=>`<a href="${escapeHTML(blockURL(e.id))}">${escapeHTML(e.title)}</a>`).join('')}</div></aside></div>`;
  }
}

// 图只在浏览器中缩放或导出，不执行任何地图逻辑。
document.addEventListener('click',async event=>{
  const button=event.target.closest('[data-diagram]');if(!button)return;
  const container=button.closest('.block-figure, .diagram-dialog');
  const picture=container?.querySelector('svg');if(!picture)return;
  const action=button.dataset.diagram;
  if(action==='zoom-in'||action==='zoom-out'){
    const scale=Math.max(.5,Math.min(2,(Number(picture.dataset.scale)||1)+(action==='zoom-in'?.25:-.25)));
    picture.dataset.scale=scale;picture.style.width=(Number(picture.getAttribute('width'))*scale)+'px';return;
  }
  if(action==='expand'){
    let dialog=document.getElementById('diagram-dialog');
    if(!dialog){dialog=document.createElement('dialog');dialog.id='diagram-dialog';dialog.className='diagram-dialog';dialog.setAttribute('aria-label','积木搭建大图');document.body.append(dialog);dialog.addEventListener('click',e=>{if(e.target===dialog||e.target.closest('[data-close-diagram]'))dialog.close();});}
    dialog.innerHTML='<div class="diagram-dialog-header"><strong>积木搭建大图</strong><button type="button" data-close-diagram>关闭</button></div><div class="diagram-viewport" tabindex="0">'+picture.outerHTML+'</div>';
    dialog.style.width=Math.min(Number(picture.getAttribute('width'))+44,1600)+'px';
    dialog.showModal();return;
  }
  if(action==='download'){
    const previous=button.textContent;button.disabled=true;button.textContent='正在生成图片…';
    let url;
    try{
      const clone=picture.cloneNode(true);clone.removeAttribute('style');clone.removeAttribute('data-scale');
      const markup=new XMLSerializer().serializeToString(clone);
      url=URL.createObjectURL(new Blob([markup],{type:'image/svg+xml;charset=utf-8'}));
      const img=new Image();img.src=url;await img.decode();
      const w=Number(picture.getAttribute('width')),h=Number(picture.getAttribute('height'));
      const scale=Math.min(2,Math.sqrt(16000000/(w*h)));
      const canvas=document.createElement('canvas');canvas.width=Math.ceil(w*scale);canvas.height=Math.ceil(h*scale);
      const ctx=canvas.getContext('2d');if(!ctx)throw new Error('无法创建图片');ctx.drawImage(img,0,0,canvas.width,canvas.height);
      const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw new Error('图片导出失败');
      if(button.dataset.downloadUrl)URL.revokeObjectURL(button.dataset.downloadUrl);
      const downloadURL=URL.createObjectURL(blob);button.dataset.downloadUrl=downloadURL;
      let a=container.querySelector('.diagram-save');if(!a){a=document.createElement('a');a.className='diagram-save';button.after(a);}
      a.href=downloadURL;a.download='蛋码-彩色积木搭建图.png';a.textContent='保存 PNG';a.click();
      button.textContent='PNG 已生成';
    }catch{button.textContent='导出失败，请查看大图后重试';}
    finally{if(url)URL.revokeObjectURL(url);button.disabled=false;setTimeout(()=>button.textContent=previous,3500);}
  }
});
