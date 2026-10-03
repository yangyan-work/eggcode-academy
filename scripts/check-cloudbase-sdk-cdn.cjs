'use strict';
// 只访问公开 SDK CDN；隔离浏览器空白页不初始化 app，不访问任何用户环境。
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const url='https://static.cloudbase.net/cloudbase-js-sdk/3.10.1/cloudbase.full.js',origin='http://127.0.0.1:4180';
const output=path.resolve(process.argv[2]||path.join(__dirname,'../../evidence'));
const report={checkedAt:new Date().toISOString(),url,origin,userEnvironmentAccessed:false,cases:[]};let browser;
(async()=>{
  browser=await chromium.launch({headless:true,executablePath:process.env.EGG_QA_BROWSER||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
  for(const cors of [true,false]){
    const context=await browser.newContext(),page=await context.newPage(),evidence={crossOrigin:cors?'anonymous':null,responses:[],diagnostics:[]};
    await context.route('**/*',route=>{const current=new URL(route.request().url());if(current.origin===origin)return route.fulfill({contentType:'text/html',body:'<!doctype html><html><head></head><body>公开SDK加载检查</body></html>'});if(current.href===url)return route.continue();return route.abort();});
    page.on('console',item=>{if(item.type()==='error')evidence.diagnostics.push(item.text());});
    page.on('pageerror',error=>evidence.diagnostics.push(error.message));page.on('requestfailed',request=>evidence.diagnostics.push(request.failure()?.errorText));
    page.on('response',async response=>{if(response.url()===url)evidence.responses.push({status:response.status(),allowOrigin:(await response.allHeaders())['access-control-allow-origin']||null});});
    await page.goto(origin+'/__public_sdk_probe__');
    evidence.result=await page.evaluate(({url,cors})=>new Promise(resolve=>{const script=document.createElement('script');script.src=url;script.referrerPolicy='no-referrer';if(cors)script.crossOrigin='anonymous';const timer=setTimeout(()=>resolve({event:'timeout',sdkAvailable:Boolean(window.cloudbase?.init)}),15000);script.onload=()=>{clearTimeout(timer);resolve({event:'load',sdkAvailable:Boolean(window.cloudbase?.init)});};script.onerror=()=>{clearTimeout(timer);resolve({event:'error',sdkAvailable:Boolean(window.cloudbase?.init)});};document.head.append(script);}),{url,cors});
    report.cases.push(evidence);await context.close();
  }
  assert.equal(report.cases[0].result.event,'error');assert.equal(report.cases[0].result.sdkAvailable,false);
  assert.ok(report.cases[0].diagnostics.some(message=>message.includes("No 'Access-Control-Allow-Origin'")));
  assert.equal(report.cases[1].result.event,'load');assert.equal(report.cases[1].result.sdkAvailable,true);
  assert.ok(report.cases[1].responses.some(response=>response.status===200&&response.allowOrigin===null));assert.equal(report.cases[1].diagnostics.length,0);
  report.passed=true;console.log('PASS 官方CDN真实Edge加载：强制CORS失败、经典脚本成功；7项断言；未初始化app或访问用户环境。');
})().catch(error=>{report.passed=false;report.error=error.stack;console.error(error);process.exitCode=1;}).finally(async()=>{fs.mkdirSync(output,{recursive:true});fs.writeFileSync(path.join(output,'cloudbase-sdk-cdn-results.json'),JSON.stringify(report,null,2));if(browser)await browser.close();});
