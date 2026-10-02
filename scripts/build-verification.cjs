#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const {loadContent}=require('./check.cjs');
const d=loadContent(),w=d.w;
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const base=read('index.html'),head=base.slice(0,base.indexOf('<main')).replace(/<title>.*?<\/title>/,'<title>验证状态与证据 · 自由树梦想空间</title>').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replace('data-page="home"','data-page="verification"').replace('href="index.html" aria-current="page"','href="index.html"');
const foot=base.slice(base.indexOf('<footer'));
function page(report){
 const passing=report.status==='passed';
 const rows=d.all.map((lesson,id)=>'<tr id="course-'+id+'"><td><a href="lesson.html?id='+id+'">'+esc(lesson.title)+'</a></td><td>'+report.lessons[id].detailedSteps+'</td><td>'+report.lessons[id].diagrams+'</td><td>'+report.lessons[id].testScenarios+'</td><td>'+(passing?'文档及网页检查记录已生成':'检查中')+'</td><td>未提供本课可玩演示</td><td>未验证</td></tr>').join('');
 return head+'<main id="main" class="shell evidence-report"><header class="page-heading"><p class="eyebrow">把检查范围说清楚</p><h1>验证状态与对应证据</h1><p>文档审查、网页检查和蛋仔实机是不同阶段。没有记录的项目保持“未验证”，不会因为课程完成按钮被点击就变成通过。</p></header><section><h2>这次实际做了哪些检查？</h2><ul><li>内容结构：145课的步骤、变量、自定义动作和验收场景；手册引用及旧课程ID保护。</li><li>图示：21组渲染语义回归，所有课程SVG有效性；列表初始化、类型化参数、自定义内部结构和分支连接。</li><li>网页：自动化DOM环境下的课程渲染、搜索/筛选、返回/前进、复制、图示放大弹窗等。它不是145个独立游戏的试玩。</li><li>学习记录、大数实验、积木具体案例和挑战参考解法分别有专门检查，结果列在下方。</li><li>按课加载另用真实浏览器覆盖24个详解分片及28课，核对单课请求、目录搜索、前后课、手机排版，以及索引失败、分片失败、不完整数据和重试恢复。</li><li>已抽查复杂SVG导出图的文字与连线。完整浏览器像素布局、PNG下载和实际蛋码执行未逐项验收。</li></ul><p class="callout">蛋仔编辑器实机：全部课程仍是“未验证”。真实多人同步、账户身份、持久化和时间精度必须在编辑器按各课清单复核。</p></section><section><h2>可复查的测试记录</h2><p>检查时间（UTC）：'+esc(report.checkedAt||'尚未完成')+'</p><p><a href="verification-report.json">打开机器可读检查报告</a> · <a href="scripts/README.md">查看如何复跑测试</a></p>'+report.checks.map(check=>'<details><summary>'+esc(check.script)+' · '+esc(check.status)+'</summary><pre>'+esc(check.output)+'</pre></details>').join('')+'</section><section><h2>网页演示与算法实验</h2><p>首页有简化的3×3消消乐交互示意，不能代替6×6关卡或原生蛋码验收。<a href="big-number-lab.html">大数运算实验室</a>提供精确字符串算法网页演示；其中通过的是浏览器算法，不是编辑器积木实机执行。</p><p><a href="learning-path.html">学习路线与完成记录</a>保存的是你本浏览器的学习情况，与测试证据分开。</p></section><section><h2>逐课证据索引</h2><p>步骤数只说明覆盖范围，不作为正确性的证明。文档级审查包括类型、分支、候选/提交、边界、重复执行及继承关系；实际结果仍以原生编辑器记录为准。</p><div class="table-wrap evidence-table"><table><thead><tr><th>课程</th><th>详细步骤</th><th>图示</th><th>验收场景</th><th>文档／网页</th><th>独立玩法演示</th><th>蛋仔实机</th></tr></thead><tbody>'+rows+'</tbody></table></div></section><section><h2>怎样补实机证据？</h2><ol><li>记录编辑器平台、版本、触发器区域、预设名称和测试日期。</li><li>按本课验收逐条操作，记录输入、预期、实际结果。</li><li>保留对应截图或录屏；多人课至少核对两位参与者的隔离、退出和重进。</li><li>失败项目先保留失败记录和复现步骤，修复后重测。只有真正测试通过的项目才能改成实机通过。</li></ol><p>目前本站没有上传或自动核验这些实机证据的后台。请先在自己的项目中保存记录。</p></section></main>'+foot;
}
const report={build:'20261002-learning',status:'pending',checkedAt:null,scope:'文档结构、图示、自动化DOM与真实浏览器按课加载检查；不是原生蛋码执行',engineStatus:'not_tested',webGameplayStatus:'individual_lessons_not_provided',checks:[],lessons:d.all.map((l,id)=>({id,title:l.title,detailedSteps:(w.EGG_DETAILED_GUIDES[id]?.sections||[]).reduce((n,s)=>n+s.steps.length,0),diagrams:d.guides[id].sections.length,testScenarios:w.EGG_DETAILED_GUIDES[id]?.tests.length||0,editorStatus:'not_tested'})),files:{}};
fs.writeFileSync(path.join(root,'verification.html'),page(report));
if(!process.argv.includes('--build-only')){
 for(const script of ['scripts/check.cjs','scripts/check-details.cjs','scripts/check-renderer.cjs','scripts/check-dom.cjs','scripts/check-progress.cjs','scripts/check-big-number.cjs','scripts/check-quality.cjs','scripts/check-block-cases.cjs','scripts/check-challenges.cjs','scripts/check-loading-browser.cjs']){
  if(!fs.existsSync(path.join(root,script)))throw new Error('Missing required test '+script);
  const output=cp.execFileSync(process.execPath,['--expose-gc',script],{cwd:root,env:process.env,encoding:'utf8',maxBuffer:1024*1024*10});
  report.checks.push({script,status:'passed',output:output.trim()});console.log(script+': passed');
 }
 report.status='passed';report.checkedAt=new Date().toISOString();
 for(const f of ['app.js','learning-detail.js','block-diagrams.js','course-validation.js','learning-progress.js','big-number-lab.js','lesson-loader.js','detail-chunks.json','block-curated.js','block-examples.js','challenge-solutions.js','challenge-solutions.css'])report.files[f]=crypto.createHash('sha256').update(read(f)).digest('hex');
}
fs.writeFileSync(path.join(root,'verification-report.json'),JSON.stringify(report,null,2)+'\n');fs.writeFileSync(path.join(root,'verification.html'),page(report));
console.log('Verification report '+report.status+'; native editor remains not_tested.');
