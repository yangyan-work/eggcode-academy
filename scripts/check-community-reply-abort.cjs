'use strict';
// 定向回归：真实 IndexedDB 事务 abort 后，回复内容和顶部错误跨列表重绘保留。
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const base=(process.argv[2] || 'http://127.0.0.1:4178/site/').replace(/\/?$/,'/'),output=path.resolve(__dirname,'../../qa/community-public');
(async()=>{
  const browser=await chromium.launch({executablePath:process.env.EGG_QA_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  const context=await browser.newContext(),page=await context.newPage(),errors=[],external=[];let checks=0;
  const check=(value,message)=>{assert.ok(value,message);checks++;};page.on('pageerror',error=>errors.push(error.message));
  await context.route('**/*',route=>{if(route.request().url().startsWith(base) || route.request().url().startsWith('data:'))return route.continue();external.push(route.request().url());return route.abort();});
  try{
    await page.goto(base+'community.html');await page.waitForSelector('[data-seed-examples]');await page.locator('[data-seed-examples]').click();await page.waitForSelector('.common-tutorial-row');const href=await page.locator('.common-tutorial-row h2 a').getAttribute('href');await page.goto(base+href);await page.waitForSelector('.common-article');
    await page.locator('#step-2 .common-qa>summary').click();await page.locator('#step-2 .common-question details>summary').click();const form=page.locator('#step-2 [data-answer-form]').first(),questionId=await form.getAttribute('data-question-id');
    await form.locator('textarea').fill('保存失败时，这段完整回复不能丢失。');const before=await page.evaluate(async id=>(await EGG_COMMUNITY.getState()).questions.find(item=>item.id===id).answers.length,questionId);
    await page.evaluate(()=>{window.__originalTransaction=IDBDatabase.prototype.transaction;IDBDatabase.prototype.transaction=function(...args){const tx=window.__originalTransaction.apply(this,args);if(args[1]==='readwrite')queueMicrotask(()=>{try{tx.abort();}catch{}});return tx;};});
    await form.locator('button').click();await page.waitForFunction(()=>document.querySelector('#community-message').dataset.kind==='error');await page.waitForFunction(()=>!document.querySelector('#step-2 [data-answer-form] fieldset').disabled);await page.evaluate(()=>{IDBDatabase.prototype.transaction=window.__originalTransaction;});
    await page.evaluate(()=>window.dispatchEvent(new Event('egg-community-change')));await page.waitForTimeout(150);
    check(await page.locator('#community-message').isVisible(),'回复失败的顶部错误仍可见');check(await page.locator('#community-message').getAttribute('role')==='alert','错误语义保留');check((await page.locator('#community-message').innerText()).length>0,'错误不是空白');check(await form.locator('textarea').inputValue()==='保存失败时，这段完整回复不能丢失。','重绘后回复输入完整保留');check(await page.evaluate(async id=>(await EGG_COMMUNITY.getState()).questions.find(item=>item.id===id).answers.length,questionId)===before,'失败事务没有添加回复');check(errors.length===0,'没有页面错误');check(external.length===0,'没有外部请求');
    fs.mkdirSync(output,{recursive:true});fs.writeFileSync(path.join(output,'reply-abort-results.json'),JSON.stringify({passed:true,checks,errors,external,transaction:'真实IDB事务abort故障注入'},null,2));console.log(JSON.stringify({passed:true,checks,output}));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
