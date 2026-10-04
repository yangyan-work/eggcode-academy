'use strict';
// VM / DOM 契约检查：不启动浏览器，不连接数据库或外部网站，不读取真实账号。
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {JSDOM}=require('jsdom'),crypto=require('node:crypto').webcrypto;
const root=path.resolve(__dirname,'..'),source=file=>fs.readFileSync(path.join(root,file),'utf8');
let checks=0;
const check=(value,message)=>{assert.ok(value,message);checks++;};
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function page(file,mode){
  const dom=new JSDOM(source(file),{url:'http://localhost:4180/'+file,runScripts:'outside-only'}),w=dom.window;
  Object.defineProperty(w,'crypto',{value:crypto});w.structuredClone=structuredClone;
  w.EGG_SPACE={getState:()=>({active:true,nickname:'契约账号',mode,ready:true}),subscribe:()=>()=>{}};
  w.EGG_CLOUD={status:()=>({mode,provider:mode==='local'?undefined:'cloudbase',configured:mode==='cloud'}),subscribe:()=>()=>{}};
  let reads=0;w.indexedDB={open(){reads++;throw new Error('检查禁止读取旧本机记录');}};
  w.eval(source('community-store.js'));
  return {dom,w,reads:()=>reads};
}
function visibleText(node){if(node.hidden)return '';return [...node.childNodes].map(child=>child.nodeType===3?child.textContent:child.nodeType===1?visibleText(child):'').join(' ');}
async function main(){
  for(const mode of ['cloud','error',undefined]){
    let reads=0;
    const scope={window:{EGG_SPACE:{getState:()=>({active:true,nickname:'契约账号'})},...(mode?{EGG_CLOUD:{status:()=>({mode})}}:{})},structuredClone,crypto,CustomEvent:class{},indexedDB:{open(){reads++;throw new Error('禁止本机回落');}}};
    vm.runInNewContext(source('community-store.js'),scope);
    const api=scope.window.EGG_COMMUNITY;
    check(api.getCapabilities().mode==='unavailable','云端、错误配置及缺失配置组件均不开放本机社区');
    for(const method of ['getState','submit','review','markRead','markAllRead','saveWork','ask','answer','report','resolveReport','seedExamples']){
      await assert.rejects(()=>api[method](null),error=>error.code==='FEATURE_NOT_READY',method+' 应在读写本机或解码图片之前拒绝');checks++;
    }
    check(reads===0,'全部社区入口不访问旧本机数据库');
  }
  const pages={
    'community.html':['community.js'],
    'works.html':['community.js','works.js'],
    'community-tutorial.html':['community.js','community-tutorial.js'],
    'messages.html':['management.js'],
    'admin.html':['management.js'],
    'contribute.html':['contribute.js','contribute-cloud.js']
  };
  for(const mode of ['cloud','error'])for(const [file,scripts] of Object.entries(pages)){
    const {dom,w,reads}=page(file,mode),doc=w.document;
    try{
      for(const script of scripts)w.eval(source(script));await tick();
      check(reads()===0,file+' 在非本机模式不读取本机记录');
      const text=visibleText(doc.querySelector('main'));
      check(/暂未开放/.test(text),file+' 提供一致未开放提示');
      check(!/读取失败|体验账号|本机投稿体验|本机审核|体验管理员|体验审核工作台/.test(text),file+' 不误报读取失败或暴露本机身份与审核文案');
      check(![...doc.querySelectorAll('a[href="admin.html"]')].some(node=>!node.closest('[hidden]')),file+' 不开放审核入口');
      check(![...doc.querySelectorAll('main button,main input,main select,main textarea')].some(node=>!node.disabled&&!node.closest('[hidden]')),file+' 不开放提交、审核、导入或导出控件');
      check(![...doc.querySelectorAll('main [role="alert"]')].some(node=>!node.closest('[hidden]')),file+' 未开放状态不是报错');
      if(file==='contribute.html'){
        assert.throws(()=>w.EGG_CONTRIBUTE.getCloudRecord(),error=>error.code==='FEATURE_NOT_READY');checks++;
        check(doc.querySelector('#contribute-cloud-panel').hidden,'投稿未开放时不创建可信上传入口');
      }
    }finally{dom.window.close();}
  }
  // 本机分支使用现有页面代码与空社区替身，验证体验编辑/导出入口没有被一并禁用。
  for(const [file,scripts] of Object.entries(pages)){
    const {dom,w}=page(file,'local'),doc=w.document;
    try{
      check(w.EGG_COMMUNITY.getCapabilities().mode==='local','真实本机模式保留社区能力');
      const api=w.EGG_COMMUNITY;w.EGG_COMMUNITY={...api,getState:async()=>({submissions:[],publications:[],messages:[],works:[],questions:[],reports:[]})};
      for(const script of scripts)w.eval(source(script));await tick();
      if(file==='contribute.html'){
        check(!doc.querySelector('#contribute-workspace').hidden,'本机投稿编辑保留');
        check(!doc.querySelector('#contribute-export').disabled,'本机导出保留');
        check(!doc.querySelector('#contribute-import-button').disabled,'本机导入保留');
      }else if(file==='works.html')check(!doc.querySelector('#work-editor').hidden&&!doc.querySelector('#work-fields').disabled,'本机作品编辑保留');
      else if(file==='admin.html'||file==='messages.html')check(!doc.querySelector('#manage-workspace').hidden,'本机审核/消息体验保留');
      else if(file==='community.html')check(!doc.querySelector('.common-tools').hidden,'本机示例工具保留');
    }finally{dom.window.close();}
  }
  console.log(`通过 ${checks} 项：6 页云端与错误配置未开放提示、所有社区读写边界、缺失配置拒绝回落、本机体验与导出入口。仅 VM / DOM 契约检查，未进行真实云端验收。`);
}
main().catch(error=>{console.error(error);process.exitCode=1;});
