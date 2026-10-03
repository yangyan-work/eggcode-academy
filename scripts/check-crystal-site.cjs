'use strict';
// 整站视觉回归只使用隔离 Edge、本机体验登录及 IndexedDB；不写真实云端或用户浏览器。
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const base=(process.argv[2]||'http://127.0.0.1:4178/site/').replace(/\/?$/,'/'),origin=new URL(base).origin;
const output=path.resolve(__dirname,'../../qa/crystal-site'),site=path.resolve(__dirname,'..');
const pages=fs.readdirSync(site).filter(name=>name.endsWith('.html')&&name!=='login.html');
const report={realCloudValidated:false,startedAt:new Date().toISOString(),checks:[],assertions:0,pageErrors:[],consoleErrors:[],externalRequests:[],httpErrors:[],layouts:[],screenshots:[]};
let browser,currentPage;
function ok(value,message){assert.ok(value,message);report.assertions++;}
async function test(name,fn){try{await fn();report.checks.push({name,passed:true});console.log('通过：'+name);}catch(error){report.checks.push({name,passed:false,error:error.message});console.error('失败：'+name+'\n'+error.stack);if(currentPage&&!currentPage.isClosed())await currentPage.screenshot({path:path.join(output,'failure-'+report.checks.length+'.png'),fullPage:false,animations:'disabled'}).catch(()=>{});}}
async function session(width=1440,reducedMotion='reduce'){
  const context=await browser.newContext({viewport:{width,height:width<500?844:1000},reducedMotion});
  await context.route('**/*',route=>{const request=route.request(),url=new URL(request.url());if(url.protocol==='http:'||url.protocol==='https:'){if(url.origin!==origin){report.externalRequests.push(url.href);return route.abort();}if(!['GET','HEAD'].includes(request.method())){report.externalRequests.push('禁止外部提交 '+url.href);return route.abort();}}return route.continue();});
  context.on('page',page=>{page.setDefaultTimeout(10000);page.on('pageerror',error=>report.pageErrors.push({url:page.url(),error:error.message}));page.on('console',message=>{if(message.type()==='error')report.consoleErrors.push({url:page.url(),error:message.text()});});page.on('response',response=>{if(response.status()>=400)report.httpErrors.push({url:response.url(),status:response.status()});});page.on('dialog',dialog=>dialog.accept());});
  const page=await context.newPage();currentPage=page;return{context,page,close:()=>context.close()};
}
async function visit(page,file){await page.goto(base+file,{waitUntil:'load'});await page.waitForFunction(()=>!document.documentElement.hasAttribute('data-access-pending'));await page.waitForFunction(()=>!document.querySelector('[aria-busy="true"]'));await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(80);ok(!new URL(page.url()).pathname.endsWith('login.html'),'已登录业务页没有退回登录');}
async function login(page){await page.goto(base+'login.html?next=index.html');await page.locator('#login-nickname').fill('林间创作者');await page.locator('#login-demo-form button[type="submit"]').click();await page.waitForURL(base+'index.html');await page.waitForFunction(()=>!document.documentElement.hasAttribute('data-access-pending'));ok(true,'真实界面登录通过');}
async function seed(page){await visit(page,'community.html');await page.locator('[data-seed-examples]').click();await page.locator('.common-tutorial-row').waitFor();return page.locator('.common-tutorial-row h2 a').first().getAttribute('href');}
async function capture(page,name){await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:path.join(output,name),fullPage:false,animations:'disabled'});report.screenshots.push(name);}
async function layout(page,label,width){
  const metrics=await page.evaluate(()=>{
    const rgba=value=>{const parts=value.match(/[\d.]+/g)?.map(Number)||[];return{rgb:parts.slice(0,3),alpha:parts[3]??1};};
    const paintedBackground=el=>{let color=[7,7,16];const chain=[];for(let node=el;node;node=node.parentElement)chain.unshift(node);for(const node of chain){const paint=rgba(getComputedStyle(node).backgroundColor);if(paint.rgb.length===3)color=color.map((v,i)=>paint.rgb[i]*paint.alpha+v*(1-paint.alpha));}return color;};
    const visible=el=>Boolean(el.getClientRects().length)&&getComputedStyle(el).visibility!=='hidden';
    const inputs=[...document.querySelectorAll('main input:not([type=checkbox]):not([type=radio]):not([type=file]):not([type=range]),main select,main textarea')].filter(visible).slice(0,8).map(el=>({id:el.id,background:paintedBackground(el),color:rgba(getComputedStyle(el).color).rgb,fontSize:parseFloat(getComputedStyle(el).fontSize)}));
    const cards=[...document.querySelectorAll('.course-card,.lesson-article,.block-article,.filter-panel,.space-panel,.common-tutorial-row,.contribute-section,.common-work-card,.manage-panel')].filter(visible).slice(0,5).map(el=>({selector:el.className,background:paintedBackground(el)}));
    const h1=document.querySelector('main h1');
    return{width:innerWidth,documentWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,bodyBackground:paintedBackground(document.body),bodyColor:rgba(getComputedStyle(document.body).color).rgb,headingColor:h1?rgba(getComputedStyle(h1).color).rgb:null,inputs,cards,overflow:[...document.querySelectorAll('body *')].filter(el=>visible(el)&&el.getBoundingClientRect().left>innerWidth).slice(0,3).map(el=>el.className||el.tagName)};
  });
  report.layouts.push({label,...metrics});
  ok(metrics.documentWidth<=width+1&&metrics.bodyWidth<=width+1,label+' 页面无横向溢出 '+JSON.stringify({document:metrics.documentWidth,body:metrics.bodyWidth,width,overflow:metrics.overflow}));
  ok(metrics.bodyBackground.every(channel=>channel<70),label+' 全页使用暗色背景 '+metrics.bodyBackground);
  ok(metrics.headingColor&&metrics.headingColor.reduce((a,b)=>a+b,0)/3>145,label+' 标题文字保持可读的浅色');
  for(const field of metrics.inputs){ok(field.background.every(channel=>channel<115),label+' 暗色输入面板 '+field.id+' '+field.background);ok(field.color.reduce((a,b)=>a+b,0)/3>145,label+' 输入文字为浅色 '+field.id);if(width<=390)ok(field.fontSize>=16,label+' 手机输入字号至少16px '+field.id);}
  for(const card of metrics.cards)ok(card.background.every(channel=>channel<115),label+' 暗色卡片 '+card.selector+' '+card.background);
}
(async()=>{fs.mkdirSync(output,{recursive:true});browser=await chromium.launch({executablePath:process.env.EGG_QA_BROWSER||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});try{
  for(const width of [320,390,768,1440]){
    const s=await session(width);currentPage=s.page;
    try{
      await login(s.page);const detail=await seed(s.page);await visit(s.page,'manual.html');const block=await s.page.locator('#manual-results a[href*="block.html"]').first().getAttribute('href');
      for(const file of pages)await test(width+'px · '+file,async()=>{
        const target=file==='lesson.html'?'lesson.html?id=40':file==='community-tutorial.html'?detail:file==='block.html'?block:file;
        await visit(s.page,target);ok(await s.page.locator('main').isVisible(),file+' 主体可见');await layout(s.page,file,width);
        if([390,1440].includes(width)&&['index.html','courses.html','practice.html','lesson.html','manual.html','personal-space.html','community.html','contribute.html'].includes(file))await capture(s.page,file.replace('.html','')+'-'+width+'.png');
      });
    }finally{await s.close();}
  }
  await test('积木手册真实筛选和有效详情',async()=>{
    const s=await session(390);currentPage=s.page;try{
      await login(s.page);await visit(s.page,'manual.html');await s.page.locator('#manual-query').fill('不存在的积木名称验收');
      await s.page.locator('#manual-empty').waitFor({state:'visible'});ok(await s.page.locator('#manual-empty').isVisible(),'没有结果时清晰提示');
      await s.page.locator('#manual-clear-empty').click();await s.page.locator('#manual-results a[href*="block.html"]').first().waitFor();
      await s.page.locator('#manual-category').selectOption({label:'事件'});const href=await s.page.locator('#manual-results a[href*="block.html"]').first().getAttribute('href');
      await visit(s.page,href);ok((await s.page.locator('.block-kind').innerText()).includes('事件'),'过滤结果打开正确积木类别');
      await s.page.locator('[data-diagram="expand"]').first().click();await s.page.locator('#diagram-dialog').waitFor({state:'visible'});ok(await s.page.locator('#diagram-dialog svg').count()>0,'积木大图弹窗保留真实SVG内容');
      await layout(s.page,'积木大图弹窗',390);await s.page.screenshot({path:path.join(output,'block-dialog-390.png'),fullPage:false});await s.page.keyboard.press('Escape');ok(!await s.page.locator('#diagram-dialog').isVisible(),'原生Escape可关闭大图');
    }finally{await s.close();}
  });
  await test('长课程图示、文字展开与手机排版',async()=>{
    const s=await session(390);currentPage=s.page;try{
      await login(s.page);await visit(s.page,'lesson.html?id=40');ok((await s.page.locator('#lesson-body').innerText()).length>2000,'课程正文完整');
      ok(await s.page.locator('.block-figure svg').count()>0,'彩色积木图仍存在');
      const text=s.page.locator('.diagram-text').first();await text.locator('summary').click();ok(await text.locator('pre').isVisible(),'文字连接说明可以展开');
      await layout(s.page,'课程文字展开',390);await s.page.locator('.block-figure').first().scrollIntoViewIfNeeded();await s.page.screenshot({path:path.join(output,'lesson-blocks-390.png'),fullPage:false,animations:'disabled'});
    }finally{await s.close();}
  });
  await test('个人空间菜单键盘焦点与笔记保存恢复',async()=>{
    const s=await session(390);currentPage=s.page;try{
      await login(s.page);await visit(s.page,'personal-space.html');await s.page.locator('[data-space-section="notes"]').focus();await s.page.keyboard.press('Enter');
      await s.page.waitForFunction(()=>location.hash==='#notes');ok(await s.page.locator('[data-space-section="notes"]').getAttribute('aria-current')==='page','键盘切换笔记菜单');
      await s.page.locator('#space-view [data-space-action="note"]').first().click();await s.page.locator('#space-note-content').fill('水晶玻璃改版验收笔记：先核对事件，再连接动作。');
      await s.page.locator('#space-note-form button[type="submit"]').click();await s.page.locator('#space-note-dialog').waitFor({state:'hidden'});
      await s.page.reload();await s.page.waitForFunction(()=>!document.documentElement.hasAttribute('data-access-pending'));ok((await s.page.locator('#space-view').innerText()).includes('水晶玻璃改版验收笔记'),'笔记保存后刷新恢复');
      await layout(s.page,'个人空间笔记',390);await capture(s.page,'space-notes-390.png');
      await visit(s.page,'index.html');await s.page.keyboard.press('Tab');ok(await s.page.locator('.skip-link').evaluate(el=>el===document.activeElement),'跳转正文链接能最先获得键盘焦点');
      const focused=await s.page.locator('.skip-link').evaluate(el=>({outline:getComputedStyle(el).outlineWidth,visible:el.matches(':focus-visible')}));ok(focused.visible&&parseFloat(focused.outline)>0,'键盘焦点有可見轮廓');
    }finally{await s.close();}
  });
  await test('投稿表单保存草稿、刷新恢复与暗色预览',async()=>{
    const s=await session(390);currentPage=s.page;try{
      await login(s.page);await visit(s.page,'contribute.html');await s.page.locator('#post-title').fill('水晶玻璃验收：第一条触发器');
      await s.page.locator('#post-summary').fill('练习创建一个事件并连接动作，检查页面表单与草稿保存功能。');
      await s.page.locator('#contribute-save').click();await s.page.waitForFunction(()=>document.querySelector('#contribute-save-status').textContent.includes('已保存'));
      const draftURL=s.page.url();ok(new URL(draftURL).searchParams.has('draft'),'保存产生真实草稿ID');
      await s.page.reload();await s.page.waitForFunction(()=>document.querySelector('#post-title').value==='水晶玻璃验收：第一条触发器');ok(true,'草稿刷新可恢复');
      await s.page.locator('#contribute-preview').click();await s.page.locator('#contribute-preview-dialog').waitFor({state:'visible'});ok((await s.page.locator('#contribute-preview-content').innerText()).includes('第一条触发器'),'预览显示真实草稿');
      await layout(s.page,'投稿预览弹窗',390);await s.page.screenshot({path:path.join(output,'contribute-preview-390.png'),fullPage:false,animations:'disabled'});
    }finally{await s.close();}
  });
  await test('社区示例和逐步问答仍可保存',async()=>{
    const s=await session(390);currentPage=s.page;try{
      await login(s.page);const detail=await seed(s.page);await visit(s.page,detail);await s.page.locator('#step-1 .common-qa summary').click();
      await s.page.locator('#question-1').fill('这个触发器需要先放置哪些场景对象？');await s.page.locator('[data-question-form][data-step="1"] button').click();
      await s.page.locator('#step-1 .common-question').waitFor();ok((await s.page.locator('#step-1 .common-question').innerText()).includes('场景对象'),'本机问答保存后展示');
      await layout(s.page,'社区教程问答展开',390);await s.page.locator('#step-1 .common-qa').scrollIntoViewIfNeeded();await s.page.screenshot({path:path.join(output,'community-question-390.png'),fullPage:false,animations:'disabled'});
    }finally{await s.close();}
  });
  await test('减少动态设置覆盖首页和登录页',async()=>{
    const s=await session(390,'reduce');currentPage=s.page;try{
      await s.page.goto(base+'login.html');await s.page.waitForFunction(()=>document.body.dataset.motion==='off');ok(await s.page.locator('#login-motion-toggle').isDisabled(),'登录页尊重系统减少动态');
      await login(s.page);await s.page.waitForTimeout(500);const moving=await s.page.evaluate(()=>document.getAnimations().filter(animation=>animation.playState==='running').map(animation=>({target:animation.effect?.target?.className,iterations:animation.effect?.getTiming().iterations})));ok(moving.length===0,'首页减少动态时不存在持续动画 '+JSON.stringify(moving));ok(await s.page.locator('main').isVisible(),'减少动态不隐藏内容');
    }finally{await s.close();}
  });
  await test('脚本、资源和外部请求检查',async()=>{ok(report.pageErrors.length===0,JSON.stringify(report.pageErrors));ok(report.consoleErrors.length===0,JSON.stringify(report.consoleErrors));ok(report.httpErrors.length===0,JSON.stringify(report.httpErrors));ok(report.externalRequests.length===0,JSON.stringify(report.externalRequests));});
}finally{await browser.close();report.passed=report.checks.every(check=>check.passed);report.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({passed:report.passed,checks:report.checks.length,assertions:report.assertions,layouts:report.layouts.length,screenshots:report.screenshots.length,realCloudValidated:false}));if(!report.passed)process.exitCode=1;}})().catch(error=>{console.error(error);process.exitCode=1;});
