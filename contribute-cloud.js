'use strict';
(() => {
  const host=document.getElementById('contribute-cloud-panel'),api=window.EGG_CLOUD;
  if(!host||!api)return;
  if(window.EGG_COMMUNITY.getCapabilities().mode!=='local'){host.hidden=true;return;}
  host.innerHTML='<div class="cloud-upload-card"><h3>保存到真实云端</h3><p id="cloud-upload-description"></p><p><a class="space-plain" href="cloud-account.html">管理云端账号与投稿</a></p><div><button type="button" class="space-button" id="cloud-upload-draft">保存云端草稿</button> <button type="button" class="space-button space-button-primary" id="cloud-upload-submit">上传并提交云端审核</button></div><progress id="cloud-upload-progress" max="1" hidden aria-label="云端上传进度"></progress><p id="cloud-upload-message" role="status" tabindex="-1"></p></div>';
  const $=id=>document.getElementById(id),cache=new Map();let busy=false,volatile=false;
  function message(text,error=false){const node=$('cloud-upload-message');node.textContent=text;node.dataset.error=String(error);node.setAttribute('role',error?'alert':'status');if(error)node.focus();}
  function render(){const status=api.status(),notReady=status.provider==='cloudbase';$('cloud-upload-description').textContent=notReady?'教程投稿正在接入云端，完成上传校验和审核服务后开放。':status.configured?'先保存完整的本机草稿，再上传到当前邮箱账号。图片按张显示进度；上传失败后可重试，本机原稿会保留。真实审核服务需要单独接入。':status.message;$('cloud-upload-draft').disabled=busy||!status.configured||notReady;$('cloud-upload-submit').disabled=busy||!status.configured||notReady;}
  function readCheckpoint(key){if(cache.has(key))return cache.get(key);const raw=localStorage.getItem(key);if(raw===null)return null;let checkpoint;try{checkpoint=JSON.parse(raw);}catch{throw new Error('这份稿件的上传记录无法读取，请先到云端投稿列表核对；本机原稿仍保留。');}if(!checkpoint||typeof checkpoint!=='object'||Array.isArray(checkpoint))throw new Error('上传记录格式不正确，请先到云端核对，不会自动重复创建稿件。');return checkpoint;}
  function saveCheckpoint(key,value){cache.set(key,structuredClone(value));try{localStorage.setItem(key,JSON.stringify(value));}catch{volatile=true;}}
  async function upload(submit){
    if(busy)return;let record,user,key,checkpoint;
    busy=true;volatile=false;render();
    try{
      record=window.EGG_CONTRIBUTE.getCloudRecord();user=await api.requireUser();key=`eggcode-academy.cloud-upload.v1.${user.id}.${record.id}.${record.revision}`;checkpoint=readCheckpoint(key);$('cloud-upload-progress').hidden=false;$('cloud-upload-progress').removeAttribute('value');
      // 每个本机稿件版本有独立重试记录；上传使用冻结副本，编辑器中的后续修改不会被发送。
      if(checkpoint){const existing=await api.getSubmission(checkpoint.id);if(['pending','published'].includes(existing.status)){message(existing.status==='pending'?'服务器确认：这份稿件已经在等待审核，不会重复提交。':'服务器确认：这份稿件已经发布。修改后请保存为新的本机版本再提交。');return;}}
      const result=await api.uploadTutorial(record,{cloudDraft:checkpoint,expectedUserId:user.id,submit,onCheckpoint:value=>saveCheckpoint(key,value),onProgress:progress=>{if(progress.phase==='images'&&progress.total){$('cloud-upload-progress').max=progress.total;$('cloud-upload-progress').value=progress.completed;}else $('cloud-upload-progress').removeAttribute('value');message(progress.message);}});
      saveCheckpoint(key,result.cloudDraft);message((result.submitted?'已收到服务器确认：稿件提交成功，等待云端审核。':'已保存云端草稿。可继续编辑，或提交审核。')+(volatile?' 本机上传记录暂时无法持久保存，关闭页面前请到云端投稿列表核对。':''));
    }catch(error){if(key&&error.cloudDraft)saveCheckpoint(key,error.cloudDraft);message((error.message||'上传没有完成。')+' 本机原稿仍会保留。'+(volatile?' 重试记录目前仅保留在本页。':''),true);}
    finally{busy=false;render();$('cloud-upload-progress').hidden=true;}
  }
  $('cloud-upload-draft').addEventListener('click',()=>upload(false));$('cloud-upload-submit').addEventListener('click',()=>upload(true));
  addEventListener('beforeunload',event=>{if(busy){event.preventDefault();event.returnValue='';}});api.subscribe(()=>render());render();
})();
