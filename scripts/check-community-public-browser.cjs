'use strict';
// 隔离 Edge 浏览器上下文，验证社区阅读、逐步问答、封面与输入保留；不接公网服务。
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const base=(process.argv[2] || 'http://127.0.0.1:4178/site/').replace(/\/?$/,'/');
const output=path.resolve(__dirname,'../../qa/community-public');
fs.mkdirSync(output,{recursive:true});
(async()=>{
  const browser=await chromium.launch({executablePath:process.env.EGG_QA_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage(),errors=[],external=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('dialog',dialog=>dialog.accept());
  await context.route('**/*',route=>{if(!route.request().url().startsWith(base) && !route.request().url().startsWith('data:')){external.push(route.request().url());return route.abort();}return route.continue();});
  let checks=0;
  const check=(condition,message)=>{assert.ok(condition,message);checks++;};
  try {
    await page.goto(base+'community.html');await page.waitForSelector('[data-seed-examples]');
    check(await page.locator('.common-empty').innerText().then(text=>text.includes('第一篇教程')),'默认空社区有操作入口');
    await page.locator('[data-seed-examples]').click();await page.waitForSelector('.common-tutorial-row');
    check(await page.locator('.common-tag-sample').count()===1,'示例明确标注');
    await page.locator('#community-search').fill('不存在的玩法');check(await page.locator('.common-empty').innerText().then(text=>text.includes('没有找到')),'无结果提示');
    await page.locator('[data-reset-filter]').click();check(await page.locator('.common-tutorial-row').count()===1,'清除筛选恢复');
    const detailURL=await page.locator('.common-tutorial-row h2 a').getAttribute('href');
    await page.goto(base+detailURL);await page.waitForSelector('.common-article');
    check(await page.locator('.common-validation').innerText().then(text=>text.includes('尚未')),'未虚称实机通过');
    await page.locator('#step-1 .common-qa summary').click();await page.locator('#question-1').fill('这个步骤需要先准备哪些场景对象？');await page.locator('[data-question-form][data-step="1"] button').click();await page.waitForSelector('#step-1 .common-question');
    check(await page.locator('#step-1 .common-question').innerText().then(text=>text.includes('先准备哪些')),'逐步问题保存与显示');
    await page.locator('#step-1 .common-question details summary').click();await page.locator('#step-1 [data-answer-form] textarea').fill('先准备起点、练习区和终点标记，再逐一搭建。');await page.locator('#step-1 [data-answer-form] button').click();await page.waitForSelector('#step-1 .common-answer');
    check(await page.locator('#step-1 .common-answer').innerText().then(text=>text.includes('终点标记')),'回复保存与显示');
    await page.locator('#question-1').fill('还没有提交的输入应该保留');await page.evaluate(()=>window.dispatchEvent(new Event('egg-community-change')));await page.waitForTimeout(200);check(await page.locator('#question-1').inputValue()==='还没有提交的输入应该保留','异步刷新保留问答输入');await page.locator('#question-1').fill('');
    await page.locator('#report summary').click();await page.locator('#report-body').fill('建议为第一步补一张变量设置示意图。');await page.locator('[data-report-form] button').click();await page.waitForFunction(async()=>{const state=await EGG_COMMUNITY.getState();return state.reports.some(item=>item.body.includes('变量设置示意图'));});checks++;
    await page.goto(base+'works.html#work-editor');await page.waitForSelector('#work-title');await page.locator('#work-title').fill('测试作品 · 林间机关');await page.locator('#work-description').fill('使用多段跳跃与机关门组合完成的一张练习地图。');await page.locator('#work-code').fill('TEST-1234');await page.locator('#work-video').fill('https://example.com/video');
    await page.locator('#work-cover').setInputFiles(path.resolve(__dirname,'../assets/blocks-event-action.png'));await page.waitForSelector('#work-cover-preview img');
    await page.locator('#work-save').click();await page.waitForFunction(()=>document.querySelector('#works-count').textContent==='2 个作品');
    check(await page.locator('.common-work-card').first().locator('img').count()===1,'真实PNG封面显示');check(await page.locator('.common-work-card').first().locator('a[target="_blank"]').getAttribute('rel')==='noopener noreferrer','视频安全外链');
    await page.locator('#work-title').fill('需要保留的标题');await page.locator('#work-description').fill('这段内容在保存失败时应该完整保留在输入框。');
    await page.evaluate(()=>{window.__realStore=window.EGG_COMMUNITY;window.EGG_COMMUNITY.saveWork=()=>Promise.reject(new Error('模拟保存失败'));});
    // 模块对象冻结，使用真实 IndexedDB transaction.abort 故障注入检验失败后的输入。
    await page.evaluate(()=>{window.__originalTransaction=IDBDatabase.prototype.transaction;IDBDatabase.prototype.transaction=function(...args){const tx=window.__originalTransaction.apply(this,args);if(args[1]==='readwrite')queueMicrotask(()=>{try{tx.abort();}catch{}});return tx;};});
    await page.locator('#work-save').click();await page.waitForFunction(()=>document.querySelector('#community-message').dataset.kind==='error');check(await page.locator('#work-title').inputValue()==='需要保留的标题','事务失败保留作品输入');await page.evaluate(()=>{IDBDatabase.prototype.transaction=window.__originalTransaction;});
    await page.locator('#work-title').fill('');await page.locator('#work-description').fill('');
    await page.goto(base+'community.html');
    await page.evaluate(()=>EGG_SPACE.logout());await page.reload();await page.waitForSelector('.common-tutorial-row');check(await page.locator('.common-tutorial-row').count()===1,'访客可读教程');
    await page.goto(base+detailURL);await page.waitForSelector('.common-article');check(await page.locator('[data-question-form]').count()===0,'访客写入提供登录入口');
    await page.goto(base+'works.html#work-editor');await page.waitForFunction(()=>!document.querySelector('#work-login-gate').hidden);check(await page.locator('#work-form').isHidden(),'访客作品写入提供登录入口');
    await page.evaluate(()=>EGG_SPACE.enterDemo('林间创作者'));
    const responsive=[];
    for(const [width,height] of [[320,812],[390,844],[768,1024],[1440,1000]]){
      await page.setViewportSize({width,height});
      for(const [name,url] of [['community','community.html'],['tutorial',detailURL],['works','works.html']]){
        await page.goto(base+url);await page.waitForFunction(()=>document.querySelector('[aria-busy="true"]')===null);await page.waitForTimeout(60);
        const sizes=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));check(sizes.scroll<=sizes.width,`${name} ${width} 无横向溢出`);responsive.push({name,width,...sizes});await page.screenshot({path:path.join(output,`${name}-${width}.png`),fullPage:true});
      }
    }
    check(errors.length===0,'无页面错误');check(external.length===0,'无外部资源请求');
    fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({checks,errors,external,responsive,passed:true},null,2));console.log(JSON.stringify({passed:true,checks,responsive:responsive.length,output}));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
