'use strict';
// 真实 Edge + 原生 IndexedDB；每个场景使用新上下文，不访问日常浏览器。
// $env:NODE_PATH='C:/Users/ASUS/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'; node scripts/check-contribute-browser.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require('playwright');
const base = (process.argv[2] || 'http://127.0.0.1:4178/site/').replace(/\/?$/, '/');
const output = path.resolve(process.argv[3] || path.join(__dirname, '..', '..', 'qa', 'contribute'));
const origin = new URL(base).origin;
const executablePath = process.env.EGG_QA_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const KEY = 'eggcode-academy.space-preview.v1', PROGRESS_KEY = 'eggcode-academy.learning-progress';
const DB = 'eggcode-academy.tutorial-posts-preview.v1', STORE = 'tutorials';
const learning = {version:1,active:true,nickname:'林间创作者',completed:Array.from({length:12},(_,i)=>i),favorites:[12,22,40],notes:[{lessonId:40,content:'背包新增物品类型后，要一起修改初始化长度、玩家跨度和索引公式。',updatedAt:'2026-10-03T00:00:00.000Z'}],feedback:[],lastLesson:12};
const oldProgress = JSON.stringify({version:1,completed:[22,70,144],lastLesson:70});
const realPNG = fs.readFileSync(path.join(__dirname, '..', 'assets', 'blocks-event-action.png'));
const realLogo = fs.readFileSync(path.join(__dirname, '..', 'assets', 'free-tree-logo.png'));
const report = {startedAt:new Date().toISOString(),base,browser:executablePath,checks:[],pageErrors:[],resourceFailures:[],blockedSubmissions:[],externalRequests:[],dialogs:[],responsive:[],screenshots:[],downloads:[],cloudDatabaseValidated:false,physicalDiskQuotaValidated:false};
let browser, assertions = 0, downloadNumber = 0;
const equal = (actual,expected,message) => {assert.deepEqual(actual,expected,message);assertions++;};
const ok = (condition,message) => {assert.ok(condition,message);assertions++;};
async function test(name, callback) {
  try {await callback();report.checks.push({name,status:'passed'});console.log('通过：'+name);}
  catch(error){report.checks.push({name,status:'failed',error:error.message,stack:error.stack});console.error('失败：'+name+'\n'+error.message);}
}
async function withPage(options,callback) {
  const context = await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce',acceptDownloads:true});
  let closing=false;
  await context.addInitScript(({key,progressKey,learning,progress,blocked,origin})=>{
    if(location.origin!==origin)return;
    if(localStorage.getItem(key)===null)localStorage.setItem(key,JSON.stringify(learning));
    if(localStorage.getItem(progressKey)===null)localStorage.setItem(progressKey,progress);
    if(localStorage.getItem('contribute-qa.unrelated')===null)localStorage.setItem('contribute-qa.unrelated','保留');
    window.__qaNativeOpen=indexedDB.open.bind(indexedDB);
    if(blocked)indexedDB.open=()=>{throw new DOMException('验收模拟 IndexedDB 访问受阻','SecurityError');};
  },{key:KEY,progressKey:PROGRESS_KEY,learning:{...learning,active:!options.guest},progress:oldProgress,blocked:options.blocked,origin});
  await context.route('**/*',route=>{
    const request=route.request();
    if(!['GET','HEAD'].includes(request.method())){report.blockedSubmissions.push({url:request.url(),method:request.method()});return route.abort('blockedbyclient');}
    if(/^https?:/.test(request.url())&&new URL(request.url()).origin!==origin){report.externalRequests.push(request.url());return route.abort('blockedbyclient');}
    return route.continue();
  });
  context.on('page',page=>{
    page.setDefaultTimeout(8000);
    page.on('pageerror',error=>{if(!closing)report.pageErrors.push({url:page.url(),message:error.message});});
    page.on('requestfailed',request=>{if(!closing)report.resourceFailures.push({url:request.url(),error:request.failure()?.errorText});});
    page.on('response',response=>{if(!closing&&response.status()>=400)report.resourceFailures.push({url:response.url(),status:response.status()});});
  });
  const page=await context.newPage();
  try {
    await callback(page,context);
    const value=await page.evaluate(()=>window.EGG_SPACE.getState());
    for(const field of ['completed','favorites','notes','feedback','lastLesson'])equal(value[field],learning[field],'投稿不改变旧学习数据 '+field);
    equal(await page.evaluate(key=>localStorage.getItem(key),PROGRESS_KEY),oldProgress,'原版学习键不改变');
    equal(await page.evaluate(()=>localStorage.getItem('contribute-qa.unrelated')),'保留','无关本机记录不改变');
  } finally {closing=true;await context.close();}
}
async function visit(page,file='contribute.html') {
  const response=await page.goto(base+file,{waitUntil:'load'});equal(response.status(),200,'页面返回200');
  await page.waitForFunction(()=>Boolean(window.EGG_SPACE));
  if(file.startsWith('contribute.html'))await page.waitForFunction(()=>document.getElementById('contribute-draft-list').children.length>0||document.getElementById('contribute-message').dataset.kind==='error');
}
async function rows(page) {
  return page.evaluate(({name,store})=>new Promise((resolve,reject)=>{
    const request=window.__qaNativeOpen(name);
    request.onupgradeneeded=()=>request.result.createObjectStore(store,{keyPath:'id'});
    request.onerror=()=>reject(request.error);
    request.onsuccess=()=>{const db=request.result,tx=db.transaction(store,'readonly'),read=tx.objectStore(store).getAll();let result;read.onsuccess=()=>{result=read.result;};tx.oncomplete=()=>{db.close();resolve(result);};tx.onabort=()=>{db.close();reject(tx.error);};};
  }),{name:DB,store:STORE});
}
async function fillComplete(page,title='消消乐：用事件积木搭出第一个效果') {
  for(const [id,value] of Object.entries({'post-title':title,'post-summary':'学会在事件触发后执行动作，并用真实配图对照积木连接与参数。','post-preparation':'准备一个触发器、玩家对象和整数分数变量，变量使用玩家作用域。','post-validation':'进入编辑器试玩，触发事件后检查分数变化；重复操作时应每次只增加一次。','post-tips':'检查变量作用域和触发次数，避免把玩家分数存到全局变量中。'}))await page.locator('#'+id).fill(value);
  for(let i=0;i<2;i++){await page.locator(`#step-title-${i}`).fill(i?'连接动作并检查结果':'创建事件与分数变量');await page.locator(`#step-body-${i}`).fill(i?'把设置变量动作连接到事件下面，分数参数填写一，检查玩家分数是否只更新一次。':'从事件分类添加触发积木，创建玩家整数分数变量，初始值设置为零并核对作用域。');}
}
async function settled(page) {await page.waitForFunction(()=>!document.getElementById('contribute-save').disabled);}
async function save(page,submit=false) {
  await page.locator(submit?'#contribute-submit':'#contribute-save').click();
  await settled(page);
  await page.waitForFunction(()=>document.getElementById('contribute-message').dataset.kind==='error'||document.getElementById('contribute-save-status').textContent.includes('已保存'));
  equal(await page.locator('#contribute-message').getAttribute('data-kind'),'info','保存事务完成后才报告成功');
  return (await rows(page)).find(record=>record.id===new URL(page.url()).searchParams.get('draft'));
}
async function exportJSON(page,selector='#contribute-export') {
  const event=page.waitForEvent('download');await page.locator(selector).click();const download=await event;
  equal(download.suggestedFilename(),'自由树-教程备份.json','备份文件名');
  const filename=`tutorial-backup-${++downloadNumber}.json`;await download.saveAs(path.join(output,filename));report.downloads.push(filename);
  return JSON.parse(fs.readFileSync(path.join(output,filename),'utf8'));
}
async function importFile(page,buffer,name='tutorial.json') {
  await page.locator('#contribute-import-button').click();
  await page.locator('#contribute-import-file').setInputFiles({name,mimeType:'application/json',buffer});
  await page.waitForFunction(()=>!document.getElementById('contribute-message').textContent.startsWith('请选择本站'));
}
async function upload(page,file,index=0) {
  await page.locator(`#step-file-${index}`).setInputFiles(file);await settled(page);
}
async function confirm(page,accept,action) {
  const event=page.waitForEvent('dialog');const pending=action();const dialog=await event;
  report.dialogs.push({type:dialog.type(),message:dialog.message(),accepted:accept});
  await (accept?dialog.accept():dialog.dismiss());await pending;
}
async function holdTransactions(page) {
  await page.evaluate(({name,store})=>new Promise(resolve=>{const request=indexedDB.open(name);request.onsuccess=()=>{const db=request.result,tx=db.transaction(store,'readwrite'),object=tx.objectStore(store);window.__qaRelease=false;window.__qaHoldDone=false;tx.oncomplete=()=>{db.close();window.__qaHoldDone=true;};function keep(){const read=object.get('qa-lock');read.onsuccess=()=>{if(!window.__qaRelease)keep();};}keep();resolve();};}),{name:DB,store:STORE});
}
async function releaseTransactions(page) {
  await page.evaluate(()=>{window.__qaRelease=true;});await page.waitForFunction(()=>window.__qaHoldDone);
}
async function dimensions(page,label,viewport) {
  const data=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth}));
  report.responsive.push({view:label,...viewport,...data});ok(data.scrollWidth<=viewport.width+1&&data.bodyWidth<=viewport.width+1,`${viewport.width} ${label} 无横向溢出：${JSON.stringify(data)}`);
}
async function screenshot(page,filename) {
  equal((await page.evaluate(()=>window.EGG_SPACE.getState())).nickname,'林间创作者','设计截图使用默认演示昵称');
  await page.screenshot({path:path.join(output,filename),fullPage:false,animations:'disabled'});report.screenshots.push(filename);
}

(async()=>{
  fs.mkdirSync(output,{recursive:true});browser=await chromium.launch({headless:true,executablePath});
  await test('空白草稿允许保存，真实IndexedDB字段与刷新恢复',()=>withPage({},async page=>{
    await visit(page);equal(await page.locator('.contribute-step').count(),2,'默认两步');equal((await rows(page)).length,0,'打开页面不自动保存空稿');
    await page.locator('#post-title').fill('未写完的草稿');const record=await save(page);
    equal(record.schemaVersion,1,'稿件版本');equal(record.revision,1,'首次真实提交事务的版本');equal(record.status,'draft','不完整内容保存草稿');equal(record.summary,'','允许未写简介');
    await page.reload({waitUntil:'load'});await page.waitForFunction(()=>document.getElementById('post-title').value==='未写完的草稿');equal(await page.locator('#post-title').inputValue(),record.title,'按draft查询恢复');
    equal((await rows(page))[0].id,record.id,'刷新没有创建重复稿件');
  }));
  await test('投稿校验至少两步与必填长度，成功进入本机审核队列',()=>withPage({},async page=>{
    await visit(page);await page.locator('#contribute-submit').click();ok((await page.locator('#contribute-message').innerText()).includes('请先补齐'),'空稿不提交');equal((await rows(page)).length,0,'校验失败不写稿件');
    await fillComplete(page);
    for(const [id,size] of [['post-title',4],['post-summary',19],['post-preparation',9],['post-validation',19],['step-title-0',1],['step-body-0',19]]){
      const value=await page.locator('#'+id).inputValue();await page.locator('#'+id).fill('字'.repeat(size));await page.locator('#contribute-submit').click();equal(await page.locator('#contribute-message').getAttribute('data-kind'),'error','必填最小长度拒绝 '+id);equal(await page.evaluate(()=>document.activeElement.id),id,'聚焦实际缺项 '+id);equal((await rows(page)).length,0,'必填失败不写数据库');await page.locator('#'+id).fill(value);
    }
    await confirm(page,true,()=>page.locator('.contribute-step').last().locator('[data-post-action="remove-step"]').click());
    await page.locator('#contribute-submit').click();ok((await page.locator('#contribute-message').innerText()).includes('至少两步'),'至少两步校验');
    await page.locator('#contribute-add-step').click();await page.locator('#step-title-1').fill('第二步');await page.locator('#step-body-1').fill('字'.repeat(20));
    const record=await save(page,true);equal(record.status,'submitted-demo','草稿仍保留本机提交标记');ok((await page.locator('#contribute-message').innerText()).includes('本机审核队列'),'提交明确只进入本机审核');
    const community=await page.evaluate(()=>EGG_COMMUNITY.getState()),submission=community.submissions.find(item=>item.sourceId===record.id);equal(submission.status,'pending','生成待审核快照');equal(submission.sourceRevision,record.revision,'审核快照绑定已保存版本');equal(community.publications.length,0,'尚未审核不能进入教程广场');
    await page.locator('#contribute-drafts-tab').click();ok((await page.locator('.space-status-pill').innerText()).includes('待审核 · 本机'),'列表显示本机待审核标识');
  }));
  await test('字段最大长度与Unicode边界，拒绝时已有草稿不变',()=>withPage({},async page=>{
    await visit(page);await fillComplete(page);const original=await save(page);
    for(const [id,size] of [['post-title',61],['post-summary',301],['post-preparation',1001],['post-validation',1501],['post-tips',1001],['step-title-0',81],['step-body-0',3001]]){
      const before=await page.locator('#'+id).inputValue();await page.locator('#'+id).fill('字'.repeat(size));await page.locator('#contribute-save').click();equal(await page.locator('#contribute-message').getAttribute('data-kind'),'error','超长字段拒绝 '+id);equal((await rows(page))[0].revision,original.revision,'超长不覆盖已保存版本');await page.locator('#'+id).fill(before);
    }
    await page.locator('#post-title').fill('😀'.repeat(60));const unicode=await save(page);equal(Array.from(unicode.title).length,60,'60个Unicode字符允许保存');
  }));
  await test('真实PNG上传、配图说明、步骤排序与删除',()=>withPage({},async page=>{
    await visit(page);await fillComplete(page);await upload(page,{name:'blocks-event-action.png',mimeType:'image/png',buffer:realPNG});
    equal(await page.locator('.contribute-step-image img').count(),1,'真实图片显示');await page.locator('#step-alt-0').fill('事件连接到动作的真实积木示例');
    const firstId=await page.locator('.contribute-step').first().getAttribute('data-step-id');await page.locator('.contribute-step').first().locator('[data-post-action="move-down"]').click();
    equal(await page.locator('.contribute-step').last().getAttribute('data-step-id'),firstId,'稳定步骤ID随排序移动');equal(await page.locator('#step-alt-1').inputValue(),'事件连接到动作的真实积木示例','配图说明随步骤移动');
    const record=await save(page);equal(record.steps[1].image.size,realPNG.length,'记录真实图片字节');equal(record.steps[1].image.mime,'image/png','记录签名一致的mime');ok(record.steps[1].image.width>0&&record.steps[1].image.height>0,'真实解码尺寸');
    // 仅转码已有真实积木截图，用浏览器原生能力覆盖允许的另外两种格式。
    for(const mime of ['image/jpeg','image/webp']){
      const bytes=await page.evaluate(async({encoded,mime})=>{const bitmap=await createImageBitmap(new Blob([Uint8Array.from(atob(encoded),c=>c.charCodeAt(0))],{type:'image/png'}));const canvas=new OffscreenCanvas(bitmap.width,bitmap.height);canvas.getContext('2d').drawImage(bitmap,0,0);bitmap.close();const blob=await canvas.convertToBlob({type:mime,quality:.9});return Array.from(new Uint8Array(await blob.arrayBuffer()));},{encoded:realPNG.toString('base64'),mime});
      await upload(page,{name:mime==='image/jpeg'?'real-blocks.jpg':'real-blocks.webp',mimeType:mime,buffer:Buffer.from(bytes)},1);const converted=await save(page);equal(converted.steps[1].image.mime,mime,'真实转码图片支持 '+mime);equal(converted.steps[1].image.width,record.steps[1].image.width,'转码保留原图尺寸');
    }
    await page.locator('[data-post-action="remove-image"]').click();equal(await page.locator('.contribute-step-image').count(),0,'图片可移除');
    await confirm(page,false,()=>page.locator('.contribute-step').last().locator('[data-post-action="remove-step"]').click());equal(await page.locator('.contribute-step').count(),2,'取消保留步骤');
    await confirm(page,true,()=>page.locator('.contribute-step').last().locator('[data-post-action="remove-step"]').click());equal(await page.locator('.contribute-step').count(),1,'确认删除步骤');equal(await page.locator('[data-post-action="remove-step"]').isDisabled(),true,'最后一步不能删除');
    const saved=await save(page);equal(saved.steps[0].image,null,'删除图片后持久记录不保留配图');
  }));
  await test('图片签名、MIME、解码、空文件和2MiB限制拒绝且编辑保留',()=>withPage({},async page=>{
    await visit(page);await page.locator('#post-title').fill('拒绝非法图片时保留编辑');
    for(const file of [{name:'fake.png',mimeType:'image/png',buffer:Buffer.from('<svg><script>1</script></svg>')},{name:'mismatch.jpg',mimeType:'image/jpeg',buffer:realPNG},{name:'truncated.png',mimeType:'image/png',buffer:realPNG.subarray(0,32)},{name:'empty.png',mimeType:'image/png',buffer:Buffer.alloc(0)},{name:'oversize.png',mimeType:'image/png',buffer:Buffer.concat([realPNG,Buffer.alloc(2*1024*1024+1-realPNG.length)])}]){
      await upload(page,file);equal(await page.locator('#contribute-message').getAttribute('data-kind'),'error','非法文件拒绝 '+file.name);equal(await page.locator('.contribute-step-image').count(),0,'未添入非法图片');equal(await page.locator('#post-title').inputValue(),'拒绝非法图片时保留编辑','拒绝保留编辑');
    }
  }));
  await test('JSON导出往返重新解码配图，新ID新步骤且强制draft',()=>withPage({},async page=>{
    await visit(page);await fillComplete(page);await upload(page,{name:'blocks-event-action.png',mimeType:'image/png',buffer:realPNG});const record=await save(page,true);
    const pack=await exportJSON(page);equal(pack.format,'free-tree-tutorial','本站教程包标识');equal(pack.version,1,'包版本');equal(pack.tutorial.status,'submitted-demo','备份保留本机提交状态');
    pack.tutorial.steps[0].image.width=999;pack.tutorial.steps[0].image.height=999;
    await importFile(page,Buffer.from(JSON.stringify(pack)));const importedId=new URL(page.url()).searchParams.get('draft');ok(importedId!==record.id,'导入产生新稿件ID');equal((await rows(page)).length,1,'导入尚未保存');
    const imported=await save(page);equal(imported.status,'draft','导入强制草稿');equal(imported.revision,1,'导入从新版本开始');ok(imported.steps[0].id!==record.steps[0].id,'导入产生新步骤ID');equal(imported.steps[0].image.width,record.steps[0].image.width,'重新解码而非信任宽度');equal(imported.steps[0].image.height,record.steps[0].image.height,'重新解码而非信任高度');equal((await rows(page)).length,2,'不覆盖原稿');
  }));
  await test('非法包、发布状态、重复步骤、外部图、坏图和12MiB导入限制',()=>withPage({},async page=>{
    await visit(page);await page.locator('#post-title').fill('保留这一篇现有草稿');const original=await save(page),pack=await exportJSON(page);await page.locator('#post-title').fill('当前还没有保存的编辑');
    const cases=[['外部格式',value=>{value.format='external';}],['包版本',value=>{value.version=2;}],['published状态',value=>{value.tutorial.status='published';}],['记录版本',value=>{value.tutorial.schemaVersion=2;}],['重复步骤',value=>{value.tutorial.steps[1].id=value.tutorial.steps[0].id;}],['分类',value=>{value.tutorial.category='unknown';}],['外部图片',value=>{value.tutorial.steps[0].image={mime:'image/png',dataUrl:'https://example.com/a.png',size:32,name:'a.png',alt:'',width:1,height:1};}],['解码失败',value=>{const buffer=realPNG.subarray(0,32);value.tutorial.steps[0].image={mime:'image/png',dataUrl:'data:image/png;base64,'+buffer.toString('base64'),size:buffer.length,name:'broken.png',alt:'',width:1,height:1};}]];
    for(const [name,mutate] of cases){const value=structuredClone(pack);mutate(value);await importFile(page,Buffer.from(JSON.stringify(value)));equal(await page.locator('#contribute-message').getAttribute('data-kind'),'error','拒绝 '+name);equal(await page.locator('#post-title').inputValue(),'当前还没有保存的编辑','非法导入保留编辑');equal((await rows(page))[0].id,original.id,'非法导入不替换原稿');}
    await importFile(page,Buffer.from('{broken'));equal(await page.locator('#contribute-message').getAttribute('data-kind'),'error','损坏JSON拒绝');
    await importFile(page,Buffer.alloc(12*1024*1024+1,32));ok((await page.locator('#contribute-message').innerText()).includes('12 MB'),'超大教程包先限制容量');equal((await rows(page)).length,1,'超大包不写数据');
  }));
  await test('真实配图合计8MiB预算与最多12步',()=>withPage({},async page=>{
    await visit(page);await fillComplete(page);const pack=await exportJSON(page),image={dataUrl:'data:image/png;base64,'+realLogo.toString('base64'),mime:'image/png',size:realLogo.length,name:'free-tree-logo.png',width:1,height:1,alt:'自由树真实标志'};
    pack.tutorial.steps=Array.from({length:10},(_,i)=>({...pack.tutorial.steps[0],id:`00000000-0000-4000-8000-${String(i).padStart(12,'0')}`,image}));
    ok(realLogo.length*10>8*1024*1024,'真实配图重复引用超过整篇预算');await importFile(page,Buffer.from(JSON.stringify(pack)));ok((await page.locator('#contribute-message').innerText()).includes('8 MB'),'整篇超预算拒绝');
    for(let i=2;i<12;i++)await page.locator('#contribute-add-step').click();equal(await page.locator('.contribute-step').count(),12,'最多12步');equal(await page.locator('#contribute-add-step').isDisabled(),true,'第12步后不能增加');
  }));
  await test('预览及HTML导出只展示转义文本，下载带离线CSP',()=>withPage({},async page=>{
    await visit(page);await fillComplete(page,'<svg/onload=window.__qaXss=1>');const injection='<script>window.__qaXss=2</script>';await page.locator('#step-body-0').fill(injection);await upload(page,{name:'blocks-event-action.png',mimeType:'image/png',buffer:realPNG});await page.locator('#step-alt-0').fill('" onerror="window.__qaXss=3');
    await page.locator('#contribute-preview').click();equal(await page.locator('#contribute-preview-dialog').evaluate(node=>node.open),true,'原生预览弹窗打开');equal(await page.locator('#contribute-preview-content script, #contribute-preview-content svg').count(),0,'文字没有变成可执行节点');ok((await page.locator('#contribute-preview-content').innerText()).includes(injection),'脚本文字原样显示');equal(await page.evaluate(()=>window.__qaXss??null),null,'预览未执行注入');
    const event=page.waitForEvent('download');await page.locator('#contribute-export-html').click();const download=await event;equal(download.suggestedFilename(),'自由树-教程阅读版.html','阅读版文件名');await download.saveAs(path.join(output,'tutorial-reading.html'));report.downloads.push('tutorial-reading.html');
    const html=fs.readFileSync(path.join(output,'tutorial-reading.html'),'utf8');ok(html.includes('&lt;script&gt;window.__qaXss=2&lt;/script&gt;'),'HTML导出转义正文');
    const parsed=await page.evaluate(html=>{const doc=new DOMParser().parseFromString(html,'text/html');return{scripts:doc.querySelectorAll('script').length,svg:doc.querySelectorAll('svg').length,csp:doc.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content};},html);equal(parsed.scripts,0,'阅读版无脚本节点');equal(parsed.svg,0,'阅读版无注入SVG');ok(parsed.csp.includes("default-src 'none'")&&parsed.csp.includes('img-src data:'),'阅读版仅允许内嵌图与样式');
    await page.keyboard.press('Escape');equal(await page.locator('#contribute-preview-dialog').evaluate(node=>node.open),false,'ESC关闭预览');
  }));
  await test('游客入口保留draft查询与hash，登录后回投稿页',()=>withPage({guest:true},async page=>{
    const destination='contribute.html?draft=00000000-0000-4000-8000-000000000001#drafts';await visit(page,destination);
    equal(await page.locator('#contribute-login-gate').isVisible(),true,'游客显示登录入口');equal(await page.locator('#contribute-workspace').isVisible(),false,'游客工作区隐藏');
    await page.locator('#contribute-login-link').click();await page.waitForURL(url=>url.pathname.endsWith('/login.html'));equal(new URL(page.url()).searchParams.get('next'),destination,'保留投稿查询与分区');
    await page.locator('#login-demo-form button[type="submit"]').click();await page.waitForURL(base+destination,{waitUntil:'load'});equal(await page.locator('#contribute-workspace').isVisible(),true,'登录后回工作区');equal(await page.locator('#contribute-drafts-panel').isVisible(),true,'保留我的投稿分区');
  }));
  await test('两页CAS拒绝旧版本并保留编辑，同时保存仅一个成功',()=>withPage({},async(page,context)=>{
    await visit(page);await page.locator('#post-title').fill('最初的共享草稿');const record=await save(page);const second=await context.newPage();await visit(second,`contribute.html?draft=${record.id}`);await second.waitForFunction(()=>document.getElementById('post-title').value==='最初的共享草稿');
    await page.locator('#post-title').fill('第一页已经保存的版本');await save(page);await second.locator('#post-title').fill('第二页仍未保存的编辑');await second.locator('#contribute-save').click();await settled(second);
    ok((await second.locator('#contribute-message').innerText()).includes('另一页'),'旧revision报告冲突');equal(await second.locator('#post-title').inputValue(),'第二页仍未保存的编辑','冲突保留编辑');equal((await rows(page))[0].title,'第一页已经保存的版本','冲突不覆盖先提交数据');
    const backup=await exportJSON(second);equal(backup.tutorial.title,'第二页仍未保存的编辑','冲突编辑仍可导出');
    await confirm(second,true,()=>second.locator('#contribute-reload').click());await second.waitForFunction(()=>document.getElementById('post-title').value==='第一页已经保存的版本');
    await page.locator('#post-title').fill('并发版本甲');await second.locator('#post-title').fill('并发版本乙');await Promise.all([page.locator('#contribute-save').click(),second.locator('#contribute-save').click()]);await Promise.all([settled(page),settled(second)]);
    const final=(await rows(page))[0];equal(final.revision,3,'两个相同revision只有一次原子增加');ok(['并发版本甲','并发版本乙'].includes(final.title),'保留一个真实赢家');const messages=await Promise.all([page.locator('#contribute-message').innerText(),second.locator('#contribute-message').innerText()]);equal(messages.filter(text=>text.includes('另一页')).length,1,'并发恰好一页冲突');
  }));
  await test('真实事务等待期间锁住编辑，完成后恢复操作',()=>withPage({},async(page,context)=>{
    await visit(page);await page.locator('#post-title').fill('事务等待期间不可覆盖');const record=await save(page);await page.locator('#post-summary').fill('事务保存等待另一页时，这段新的简介也应正常保留。');
    const holder=await context.newPage();await visit(holder);
    await holdTransactions(holder);
    try {await page.locator('#contribute-save').click();equal(await page.locator('#post-title').isDisabled(),true,'真实事务等待期间输入禁用');equal(await page.locator('#contribute-add-step').isDisabled(),true,'排序与增删所在fieldset禁用');for(const id of ['contribute-new','contribute-import-button','contribute-submit'])equal(await page.locator('#'+id).isDisabled(),true,'外部修改按钮禁用 '+id);}
    finally {await releaseTransactions(holder);}
    await settled(page);equal((await rows(page))[0].revision,record.revision+1,'释放后保存真实commit');equal(await page.locator('#post-title').isDisabled(),false,'保存后重新可编辑');
  }));
  await test('带draft初始读取延迟时新输入保留，原稿不被覆盖',()=>withPage({},async(page,context)=>{
    await visit(page);await page.locator('#post-title').fill('原来保存的那篇教程');const original=await save(page);
    const holder=await context.newPage();await visit(holder);await holdTransactions(holder);
    const delayed=await context.newPage();
    try {
      const response=await delayed.goto(base+`contribute.html?draft=${original.id}`,{waitUntil:'load'});equal(response.status(),200,'延迟读取页面加载');
      await delayed.waitForFunction(()=>Boolean(window.EGG_SPACE));equal(await delayed.locator('#post-title').inputValue(),'','旧稿读取确实仍在等待事务');
      await delayed.locator('#post-title').fill('等待读取时已经写下的新想法');
    } finally {await releaseTransactions(holder);}
    await delayed.waitForFunction(()=>document.getElementById('contribute-count').textContent==='1');
    equal(await delayed.locator('#post-title').inputValue(),'等待读取时已经写下的新想法','迟到的初始读取不覆盖新输入');
    ok((await delayed.locator('#contribute-save-status').innerText()).includes('尚未保存'),'仍显示编辑未保存');
    equal((await rows(delayed))[0].title,original.title,'原有持久稿件未被新输入改写');
    equal((await exportJSON(delayed)).tutorial.title,'等待读取时已经写下的新想法','未保存的新输入仍可备份');
  }));
  await test('写请求success后事务abort不误报保存，编辑可导出',()=>withPage({},async page=>{
    await visit(page);await page.locator('#post-title').fill('真实事务中断后仍能备份');
    await page.evaluate(()=>{const native=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(...args){const request=native.apply(this,args);if(this.name==='tutorials')request.addEventListener('success',()=>this.transaction.abort(),{once:true});return request;};});
    await page.locator('#contribute-save').click();await settled(page);equal(await page.locator('#contribute-message').getAttribute('data-kind'),'error','事务中断报告失败');equal((await rows(page)).length,0,'中断没有commit');equal(await page.locator('#post-title').inputValue(),'真实事务中断后仍能备份','中断保留编辑');equal((await exportJSON(page)).tutorial.title,'真实事务中断后仍能备份','中断后可导出');
  }));
  await test('IndexedDB受阻时编辑保留并可导出',()=>withPage({blocked:true},async page=>{
    await visit(page);ok((await page.locator('#contribute-message').innerText()).includes('暂不能访问'),'访问受阻提示');await page.locator('#post-title').fill('存储受阻也能导出的草稿');await page.locator('#contribute-save').click();await settled(page);equal(await page.locator('#contribute-message').getAttribute('data-kind'),'error','访问失败不报成功');equal((await exportJSON(page)).tutorial.title,'存储受阻也能导出的草稿','受阻时备份当前编辑');
  }));
  await test('注入QuotaExceededError时真实事务中止，原稿保留且可导出',()=>withPage({},async page=>{
    await visit(page);await page.locator('#post-title').fill('配额不足前已经保存的草稿');const before=await save(page);await upload(page,{name:'blocks-event-action.png',mimeType:'image/png',buffer:realPNG});await page.locator('#post-title').fill('配额不足后的当前编辑');
    await page.evaluate(()=>{const native=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(...args){const request=native.apply(this,args);if(this.name==='tutorials'){const tx=this.transaction;Object.defineProperty(tx,'error',{get:()=>new DOMException('验收注入配额错误','QuotaExceededError')});request.addEventListener('success',()=>tx.abort(),{once:true});}return request;};});
    await page.locator('#contribute-save').click();await settled(page);equal(await page.locator('#contribute-message').getAttribute('data-kind'),'error','注入配额错误报告失败');ok((await page.locator('#contribute-message').innerText()).includes('空间不足'),'配额错误解释');equal((await rows(page))[0].revision,before.revision,'中止事务不覆盖原版本');equal((await exportJSON(page)).tutorial.title,'配额不足后的当前编辑','失败可备份当前编辑');
  }));
  await test('未知数据库版本保留原稿，当前编辑仍可导出',()=>withPage({},async page=>{
    await visit(page);await page.locator('#post-title').fill('其他数据库版本中的原稿');const original=await save(page);
    await page.evaluate(name=>new Promise((resolve,reject)=>{const request=indexedDB.open(name,2);request.onerror=()=>reject(request.error);request.onsuccess=()=>{request.result.close();resolve();};}),DB);
    await page.reload({waitUntil:'load'});await page.waitForFunction(()=>document.getElementById('contribute-message').dataset.kind==='error');equal((await rows(page))[0].id,original.id,'数据库未知版本不删除原记录');await page.locator('#post-title').fill('数据库无法访问时的当前内容');equal((await exportJSON(page)).tutorial.title,'数据库无法访问时的当前内容','未知版本可备份当前编辑');
  }));
  await test('删除确认与未保存替换提示，取消保留、确认移除配图',()=>withPage({},async page=>{
    await visit(page);await fillComplete(page);await upload(page,{name:'blocks-event-action.png',mimeType:'image/png',buffer:realPNG});const original=await save(page);
    await page.locator('#post-title').fill('尚未保存的修改');await confirm(page,false,()=>page.locator('#contribute-new').click());equal(await page.locator('#post-title').inputValue(),'尚未保存的修改','取消新建保留编辑');
    await confirm(page,true,()=>page.locator('#contribute-new').click());equal(await page.locator('#post-title').inputValue(),'','确认新建空稿');equal((await rows(page))[0].id,original.id,'新建未删除原稿');
    await page.locator('#contribute-drafts-tab').click();await confirm(page,false,()=>page.locator('[data-post-action="delete-post"]').click());equal((await rows(page)).length,1,'取消删除保留原稿与配图');
    await confirm(page,true,()=>page.locator('[data-post-action="delete-post"]').click());await page.waitForFunction(()=>document.getElementById('contribute-count').textContent==='0');equal((await rows(page)).length,0,'确认删除整条稿件及内嵌图');
  }));
  await test('320/375/390/768/1280/1440编辑、列表、预览与44px触控',()=>withPage({},async page=>{
    await visit(page);await fillComplete(page);await upload(page,{name:'blocks-event-action.png',mimeType:'image/png',buffer:realPNG});await save(page);
    for(const viewport of [{width:320,height:812},{width:375,height:812},{width:390,height:844},{width:768,height:1024},{width:1280,height:900},{width:1440,height:1000}]){
      await page.setViewportSize(viewport);await page.locator('#contribute-editor-tab').click();await dimensions(page,'editor',viewport);
      const controls=await page.locator('#contribute-form button, #contribute-submit, #contribute-import-button, #contribute-new').evaluateAll(nodes=>nodes.filter(node=>node.getClientRects().length&&!node.disabled).map(node=>({id:node.id||node.dataset.postAction,height:node.getBoundingClientRect().height})));ok(controls.every(item=>item.height>=44),`${viewport.width} 编辑触控至少44px：${JSON.stringify(controls)}`);
      equal(await page.locator('#post-title').evaluate(node=>parseFloat(getComputedStyle(node).fontSize)),16,'输入字号16px');await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await screenshot(page,`contribute-editor-${viewport.width}x${viewport.height}.png`);
      await page.locator('#contribute-preview').click();await dimensions(page,'preview',viewport);const preview=await page.locator('#contribute-preview-dialog').evaluate(node=>({width:node.clientWidth,scrollWidth:node.scrollWidth}));ok(preview.scrollWidth<=preview.width+1,'预览弹窗内容无横溢出');await screenshot(page,`contribute-preview-${viewport.width}x${viewport.height}.png`);await page.keyboard.press('Escape');
      await page.locator('#contribute-drafts-tab').click();await dimensions(page,'drafts',viewport);const buttons=await page.locator('.contribute-post-card button').evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().height));ok(buttons.every(height=>height>=44),'列表按钮至少44px');await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await screenshot(page,`contribute-drafts-${viewport.width}x${viewport.height}.png`);
    }
  }));
  await test('个人空间投稿入口冒烟，六导航与概览响应式保留',()=>withPage({},async page=>{
    await visit(page,'personal-space.html');equal(await page.locator('[data-space-section]').count(),6,'仍为六个个人栏目');equal(await page.locator('.space-contribute-banner a[href="contribute.html"]').getAttribute('href'),'contribute.html','概览投稿入口');
    for(const viewport of [{width:320,height:812},{width:375,height:812},{width:390,height:844},{width:768,height:1024},{width:1280,height:900},{width:1440,height:1000}]){await page.setViewportSize(viewport);await dimensions(page,'space-overview',viewport);ok(await page.locator('.space-contribute-banner a[href="contribute.html"]').evaluate(node=>node.getBoundingClientRect().height>=44),'投稿banner触控至少44px');}
    await page.locator('[data-space-section="settings"]').click();equal(await page.locator('#space-view a[href="contribute.html"]').count(),1,'账号区有投稿入口');await page.locator('#space-view a[href="contribute.html"]').click();await page.waitForURL(base+'contribute.html');equal(await page.locator('#contribute-workspace').isVisible(),true,'空间入口进入投稿页');
  }));
  await test('页面错误、资源失败、外部依赖及真实投稿请求为零',async()=>{
    equal(report.pageErrors,[],'页面错误为零');equal(report.resourceFailures,[],'资源失败为零');equal(report.blockedSubmissions,[],'未尝试真实网络投稿');equal(report.externalRequests,[],'不加载外部依赖');
    const source=fs.readFileSync(path.join(__dirname,'..','contribute.js'),'utf8');equal(/\b(?:fetch|XMLHttpRequest|sendBeacon|WebSocket)\s*\(/.test(source),false,'投稿脚本没有网络调用');
  });
  report.assertions=assertions;report.finishedAt=new Date().toISOString();report.passed=report.checks.filter(item=>item.status==='passed').length;report.failed=report.checks.filter(item=>item.status==='failed').length;
  fs.writeFileSync(path.join(output,'contribute-browser-results.json'),JSON.stringify(report,null,2));console.log(`${report.failed?'FAIL':'PASS'} 真实 Edge 投稿：${report.passed}/${report.checks.length}场景，${assertions}项断言；${report.responsive.length}响应式组合，${report.pageErrors.length}页面错误，${report.resourceFailures.length}资源失败。`);if(report.failed)process.exitCode=1;
})().catch(error=>{report.fatalError=error.stack;report.finishedAt=new Date().toISOString();fs.mkdirSync(output,{recursive:true});fs.writeFileSync(path.join(output,'contribute-browser-results.json'),JSON.stringify(report,null,2));console.error(error.stack);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();});
