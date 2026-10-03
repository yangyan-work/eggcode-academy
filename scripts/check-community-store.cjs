'use strict';
// 真实 Edge + 原生 IndexedDB，使用独立上下文；不访问日常浏览器和外部服务。
// $env:NODE_PATH='C:/Users/ASUS/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'; node scripts/check-community-store.cjs
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const base=(process.argv[2] || 'http://127.0.0.1:4178/site/').replace(/\/?$/,'/');
(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:process.env.EGG_QA_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
  try{
    const context=await browser.newContext(),page=await context.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await context.route('**/*',route=>new URL(route.request().url()).origin===new URL(base).origin && route.request().method()==='GET'?route.continue():route.abort());
    await page.goto(base+'login.html?next=contribute.html');
    await page.locator('#login-nickname').fill('社区状态验收');
    await page.locator('#login-demo-form button[type="submit"]').click();
    await page.waitForURL(base+'contribute.html');
    await page.waitForFunction(()=>Boolean(window.EGG_COMMUNITY) && !document.documentElement.hasAttribute('data-access-pending'));
    const result=await page.evaluate(async()=>{
      const api=window.EGG_COMMUNITY,checks=[];
      const ok=(condition,name)=>{if(!condition)throw new Error(name);checks.push(name);};
      const rejected=async(task,name,code)=>{try{await task();}catch(error){ok(!code || error.code===code,name);return;}throw new Error(name+'（应拒绝却成功）');};
      const time=new Date().toISOString(),record={schemaVersion:1,id:crypto.randomUUID(),revision:1,author:'输入作者',title:'检查示例 · 准备玩法场景',category:'parkour',difficulty:'beginner',summary:'说明如何准备一个简单场景并整理试玩时需要逐一检查的条件。',preparation:'准备一个空白场景，并记录起点、练习区和终点的位置。',steps:[{id:crypto.randomUUID(),title:'准备地图场景',body:'先把起点和终点放在容易看见的位置，再按照玩法需要整理中间的练习区域。',image:null},{id:crypto.randomUUID(),title:'逐段记录试玩',body:'从起点进入地图，逐段尝试路线并记录失败次数，把需要调整的位置逐一列出来。',image:null}],validation:'从起点连续试玩到终点，检查路线是否清楚，并记录所有失败的位置，调整后再完整测试。',tips:'',testStatus:'not-tested',status:'submitted-demo',createdAt:time,updatedAt:time};
      ok((await api.getState()).submissions.length===0,'默认不创建投稿');
      await rejected(()=>api.submit({...record,steps:[]}),'不完整教程不能提交');
      const first=await api.submit(record),again=await api.submit(record);ok(first.id===again.id && (await api.getState()).submissions.length===1,'相同草稿版本提交幂等');
      record.steps[0].body='修改后的说明与先前快照不同，但是仍然必须保留先前提交的冻结内容。';
      ok((await api.getState()).submissions[0].record.steps[0].body!==record.steps[0].body,'审核快照与原对象隔离');
      record.revision=2;const second=await api.submit(record),state2=await api.getState();ok(state2.submissions.find(item=>item.id===first.id).status==='withdrawn','新投稿撤回旧待审版本');
      await rejected(()=>api.review(first.id,'published','',first.revision),'旧快照不能通过', 'conflict');
      await rejected(()=>api.review(second.id,'rejected','',second.revision),'退回必须填写原因');
      const returned=await api.review(second.id,'rejected','请补充说明',second.revision);ok(returned.status==='rejected','退回修改');
      await rejected(()=>api.review(returned.id,'published','',returned.revision),'退回稿不能绕过重新提交');
      record.revision=3;const third=await api.submit(record),approved=await api.review(third.id,'published','',third.revision);ok(approved.status==='published' && (await api.getState()).publications.length===1,'审核通过生成公开快照');
      await rejected(()=>api.review(third.id,'withdrawn','已下架',third.revision),'旧版本审核CAS保护','conflict');
      await rejected(()=>api.ask({tutorialId:third.id,step:8,body:'请说明这个步骤的参数'}),'问题步骤边界检查');
      const question=await api.ask({tutorialId:third.id,step:1,body:'这里的准备工作需要包括什么？'});await api.answer(question.id,'先列出场景对象和预期结果。');ok((await api.getState()).questions[0].answers.length===1,'提问与回复持久保存');
      const report=await api.report({tutorialId:third.id,body:'希望补充一个练习检查表格。'});await api.resolveReport(report.id,'已经记录，稍后完善教程。',report.revision);await rejected(()=>api.resolveReport(report.id,'重复处理',report.revision),'反馈处理CAS保护','conflict');
      await rejected(()=>api.saveWork({title:'演示作品',description:'这是一份完整作品介绍，用于检验输入边界。',videoUrl:'javascript:alert(1)'}),'拒绝脚本视频链接');
      await rejected(()=>api.saveWork({title:'演示作品',description:'这是一份完整作品介绍，用于检验输入边界。',videoUrl:'http://example.com/video'}),'拒绝非HTTPS视频');
      const work=await api.saveWork({title:'演示作品',description:'这是一份完整作品介绍，用于检验本机作品保存。',videoUrl:'https://example.com/video',tutorialId:third.id});ok(work.tutorialId===third.id,'作品关联已发布教程');
      const before=await api.getState(),put=IDBObjectStore.prototype.put;
      IDBObjectStore.prototype.put=function(){throw new DOMException('验收故障注入','QuotaExceededError');};
      try{await rejected(()=>api.markAllRead(),'保存错误不冒充成功');}finally{IDBObjectStore.prototype.put=put;}
      ok(JSON.stringify(await api.getState())===JSON.stringify(before),'写入失败保留原状态');
      record.revision=4;const fourth=await api.submit(record);ok((await api.getState()).publications.find(item=>item.id===third.id).status==='published','新版待审时旧公开版继续展示');
      const newest=await api.review(fourth.id,'published','',fourth.revision);ok((await api.getState()).publications.filter(item=>item.status==='published').length===1,'新版本通过后只保留一个有效公开版');
      await api.review(newest.id,'withdrawn','这篇教程需要补充资料',newest.revision);ok((await api.getState()).publications.every(item=>item.status==='withdrawn'),'下架同步公开快照');
      await rejected(()=>api.ask({tutorialId:newest.id,step:0,body:'下架后再问这个问题'}),'下架稿禁止新增问答');
      const message=(await api.getState()).messages[0];await api.markRead(message.id);ok((await api.getState()).messages.find(item=>item.id===message.id).read,'单条消息已读');await api.markAllRead();ok((await api.getState()).messages.every(item=>item.read),'全部消息已读');
      await api.seedExamples();const seeded=await api.getState();await api.seedExamples();ok((await api.getState()).submissions.length===seeded.submissions.length,'主动示例初始化幂等');ok(['pending','published','rejected'].every(status=>seeded.submissions.some(item=>item.sample && item.status===status)),'示例覆盖三个审核状态');
      const submissions=(await api.getState()).submissions.length;
      window.EGG_SPACE.logout();await rejected(()=>api.ask({tutorialId:seeded.publications.find(item=>item.sample).id,step:0,body:'游客不能直接发布问题'}),'游客不能写入');
      return {checks,submissions};
    });
    await page.waitForURL(url=>url.pathname.endsWith('/login.html'));
    await page.locator('#login-nickname').fill('社区状态验收');
    await page.locator('#login-demo-form button[type="submit"]').click();
    await page.waitForURL(base+'contribute.html');
    await page.waitForFunction(()=>Boolean(window.EGG_COMMUNITY) && !document.documentElement.hasAttribute('data-access-pending'));
    await page.reload();await page.waitForFunction(()=>Boolean(window.EGG_COMMUNITY) && !document.documentElement.hasAttribute('data-access-pending'));
    assert.equal(await page.evaluate(async()=>(await EGG_COMMUNITY.getState()).submissions.length),result.submissions,'退出重登和刷新保留原生IndexedDB记录');
    await page.locator('#post-title').fill('实际表单 · 完整投稿检查');
    await page.locator('#post-summary').fill('通过实际表单填写教程，验证保存草稿后确实进入本机审核流程。');
    await page.locator('#post-preparation').fill('准备空白地图、起点和终点，先确认试玩时的目标。');
    await page.locator('#step-title-0').fill('填写第一个步骤');await page.locator('#step-body-0').fill('在准备区域放置起点，整理需要使用的场景对象，并记录每个对象的名称。');
    await page.locator('#step-title-1').fill('填写第二个步骤');await page.locator('#step-body-1').fill('从起点开始试玩，沿着规划路线抵达终点，记录所有不清楚的方向并调整。');
    await page.locator('#post-validation').fill('从起点开始完整测试，确认玩家能看懂路线并到达终点，再记录失败位置。');
    await page.locator('#contribute-submit').click();
    await page.waitForFunction(()=>document.getElementById('contribute-message').textContent.includes('已进入本机审核队列'));
    const pendingCount=await page.evaluate(async()=>(await EGG_COMMUNITY.getState()).submissions.length);
    await page.locator('#contribute-submit').click();
    await page.waitForFunction(()=>document.getElementById('contribute-message').textContent.includes('已进入本机审核队列') && !document.getElementById('contribute-submit').disabled);
    assert.equal(await page.evaluate(async()=>(await EGG_COMMUNITY.getState()).submissions.length),pendingCount,'实际表单重复提交不新增快照');
    result.checks.push('实际表单保存并进入审核队列','实际表单重复提交幂等');
    assert.deepEqual(errors,[],'没有页面运行错误');
    console.log(JSON.stringify({passed:true,checks:[...result.checks,'刷新保留记录','无页面运行错误'],count:result.checks.length+2},null,2));
    await context.close();
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
