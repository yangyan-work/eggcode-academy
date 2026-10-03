'use strict';
// 仅检查真实 Edge 中的验证码页面布局；云端客户端由本地契约替身替换，不验证账号服务。
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const base=(process.argv[2]||'http://127.0.0.1:4180/').replace(/\/?$/,'/');
const output=path.resolve(process.argv[3]||path.join(__dirname,'../../evidence'));
const origin=new URL(base).origin,report={base,authValidated:false,isolatedContext:true,screenshots:[],views:[],pageErrors:[],externalRequests:[],resourceFailures:[]};
let browser,checks=0;
const ok=(condition,message)=>{assert.ok(condition,message);checks++;};
const clientStub=`window.EGG_CLOUD={status:()=>({configured:true,mode:'cloud',provider:'cloudbase',user:null,message:'CloudBase 学习账号已填写配置；登录、邮件与用户权限仍待真实环境验收，投稿暂未开放。'}),safeNext:()=>new URL('index.html',location.href).href,init:async()=>{},getSession:async()=>null,subscribe:()=>()=>{},cancelVerification:()=>{},signUp:async()=>({verificationRequired:true,kind:'signup'}),requestPasswordReset:async()=>({verificationRequired:true,kind:'reset'})};`;
(async()=>{
  fs.mkdirSync(output,{recursive:true});
  browser=await chromium.launch({headless:true,executablePath:process.env.EGG_QA_BROWSER||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
  for(const width of [390,1440]){
    const context=await browser.newContext({viewport:{width,height:width===390?844:1000},reducedMotion:'reduce'});
    await context.route('**/*',route=>{
      const request=route.request(),url=new URL(request.url());
      if(url.origin!==origin){report.externalRequests.push(request.url());return route.abort();}
      if(url.pathname.endsWith('/cloud-client.js'))return route.fulfill({contentType:'application/javascript',body:clientStub});
      return route.continue();
    });
    const page=await context.newPage();let closing=false;
    page.on('pageerror',error=>{if(!closing)report.pageErrors.push(error.message);});
    page.on('requestfailed',request=>{if(!closing)report.resourceFailures.push(request.url());});
    try{
      ok((await page.goto(base+'login.html',{waitUntil:'load'})).status()===200,'本机页面返回200');
      await page.locator('[data-auth-mode="signup"]').click();
      await page.locator('#login-email').fill('qa-learner@example.test');
      await page.locator('#login-password').fill('qa-password123');await page.locator('#login-confirm').fill('qa-password123');
      await page.locator('#login-auth-submit').click();await page.locator('#login-otp').waitFor({state:'visible'});
      ok(await page.locator('#login-password').inputValue()==='','发码后清空密码');
      ok(!await page.locator('#login-password-field').isVisible(),'注册确认只显示邮箱验证码');
      ok(await page.locator('#login-email').getAttribute('readonly')!==null,'验证码步骤固定已发码邮箱');
      for(const kind of ['signup','reset']){
        if(kind==='reset'){
          await page.locator('[data-auth-mode="forgot"]').click();
          await page.locator('#login-auth-submit').click();await page.locator('#login-otp').waitFor({state:'visible'});
          ok(await page.locator('#login-password-field').isVisible()&&await page.locator('#login-confirm-field').isVisible(),'重置步骤显示新密码和确认');
        }
        const view=await page.evaluate(()=>{const input=document.getElementById('login-otp'),button=document.getElementById('login-auth-submit'),cancel=document.getElementById('login-otp-cancel'),box=button.getBoundingClientRect();return{width:innerWidth,scrollWidth:document.documentElement.scrollWidth,inputFont:parseFloat(getComputedStyle(input).fontSize),button:{left:box.left,right:box.right,height:box.height},cancelHeight:cancel.getBoundingClientRect().height};});
        ok(view.scrollWidth<=width+1,'验证码视图没有横向滚动');
        ok(view.inputFont>=16,'验证码输入至少16px');
        ok(view.button.height>=44&&view.cancelHeight>=44&&view.button.left>=0&&view.button.right<=width,'确认和取消按钮可触控且未横向裁切');
        const filename='login-otp-'+kind+'-'+width+'.png';
        await page.screenshot({path:path.join(output,filename),fullPage:true,animations:'disabled'});
        report.screenshots.push(filename);report.views.push({kind,...view});
      }
    }finally{closing=true;await context.close();}
  }
  ok(report.pageErrors.length===0,'页面没有脚本错误');ok(report.externalRequests.length===0,'没有请求真实SDK和账号服务');ok(report.resourceFailures.length===0,'本机资源没有加载失败');
  report.assertions=checks;report.passed=true;
  console.log('PASS 验证码页面：'+checks+' 项断言，390/1440 注册和重置共四张截图；未验证真实 Auth。');
})().catch(error=>{report.passed=false;report.error=error.stack;console.error(error);process.exitCode=1;}).finally(async()=>{fs.mkdirSync(output,{recursive:true});fs.writeFileSync(path.join(output,'login-otp-browser-results.json'),JSON.stringify(report,null,2));if(browser)await browser.close();});
