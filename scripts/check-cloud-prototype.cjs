'use strict';
// 仅检查云端模式不会读取旧本机社区/草稿；不连接数据库或外部网站。
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {JSDOM}=require('jsdom'),crypto=require('node:crypto').webcrypto;
const root=path.resolve(__dirname,'..');
async function main(){
  let reads=0;
  const scope={window:{EGG_CLOUD:{status:()=>({mode:'cloud'})}},structuredClone,crypto,CustomEvent:class{},indexedDB:{open(){reads++;throw new Error('不可读取旧本机数据');}}};
  vm.runInNewContext(fs.readFileSync(path.join(root,'community-store.js'),'utf8'),scope);
  await assert.rejects(scope.window.EGG_COMMUNITY.getState(),/社区正在接入云端/);
  assert.equal(reads,0,'云端账号不能读取全浏览器的旧社区记录');
  for(const mode of ['cloud','error']){
    const dom=new JSDOM(fs.readFileSync(path.join(root,'contribute.html'),'utf8'),{url:'http://localhost:4180/contribute.html',runScripts:'outside-only'}),w=dom.window;
    let draftReads=0;
    Object.defineProperty(w,'crypto',{value:crypto});w.structuredClone=structuredClone;
    w.EGG_SPACE={getState:()=>({active:true,nickname:'真实账号',mode,ready:true}),subscribe:()=>()=>{}};
    w.EGG_CLOUD={status:()=>({mode,provider:'cloudbase',configured:mode==='cloud'}),subscribe:()=>()=>{}};
    w.indexedDB={open(){draftReads++;throw new Error('不可读取旧本机草稿');}};
    w.eval(fs.readFileSync(path.join(root,'contribute.js'),'utf8'));
    await new Promise(resolve=>setImmediate(resolve));
    assert.equal(draftReads,0,'云端或错误配置不读取旧本机草稿');
    assert.match(w.document.getElementById('contribute-message').textContent,/投稿正在接入云端/);
    w.eval(fs.readFileSync(path.join(root,'contribute-cloud.js'),'utf8'));
    for(const id of ['cloud-upload-draft','cloud-upload-submit'])assert.equal(w.document.getElementById(id).disabled,true,'可信上传未就绪前禁用入口');
    dom.window.close();
  }
  console.log('通过：云端账号不读取旧社区和草稿，错误配置拒绝本机回落，未完成的可信上传入口禁用。未进行真实云端验收。');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
