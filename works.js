(() => {
  'use strict';
  const ui=window.EGG_COMMUNITY_UI,store=window.EGG_COMMUNITY,e=ui.esc,form=document.querySelector('#work-form'),fields=document.querySelector('#work-fields'),list=document.querySelector('#works-list'),editor=document.querySelector('#work-editor'),coverInput=document.querySelector('#work-cover');
  let cover=null,pending=false,saving=false,dirty=false,request=0;
  function login(){const active=ui.active(),gate=document.querySelector('#work-login-gate');gate.hidden=active;gate.innerHTML=active?'':ui.loginGate();form.hidden=!active;}
  function drawCover(){const target=document.querySelector('#work-cover-preview');target.hidden=!cover;target.innerHTML=cover?`<img src="${e(ui.imageSource(cover))}" alt="作品封面预览"><button class="space-button" type="button" id="work-remove-cover">移除封面</button>`:'';}
  function lock(){fields.disabled=pending || saving;document.querySelector('#work-save-status').textContent=pending?'正在读取与检查封面…':saving?'正在保存作品…':dirty?'有尚未保存的内容。':'本机保存，尚未公开。';}
  async function readImage(file){
    if(!file || file.size===0 || file.size>2*1024*1024 || !['image/png','image/jpeg','image/webp'].includes(file.type))throw new Error('封面需要是 2 MB 以内的 PNG、JPG 或 WebP。');
    const bytes=new Uint8Array(await file.arrayBuffer()),isPNG=[137,80,78,71,13,10,26,10].every((value,i)=>bytes[i]===value),isJPG=bytes[0]===255 && bytes[1]===216 && bytes[2]===255,isWebP=String.fromCharCode(...bytes.slice(0,4))==='RIFF' && String.fromCharCode(...bytes.slice(8,12))==='WEBP',mime=isPNG?'image/png':isJPG?'image/jpeg':isWebP?'image/webp':'';
    if(mime!==file.type)throw new Error('图片扩展名与实际格式不一致，请使用有效的图片文件。');
    let bitmap;try{bitmap=await createImageBitmap(file);}catch{throw new Error('这张图片无法读取，请换一张有效图片。');}const width=bitmap.width,height=bitmap.height;bitmap.close();if(width>8000 || height>8000 || width*height>16000000)throw new Error('图片最长边不能超过 8000 像素，总像素不能超过 1600 万。');
    const dataUrl=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('读取图片失败，请重新选择。'));reader.onabort=()=>reject(new Error('图片读取已中止。'));reader.readAsDataURL(file);});
    return {dataUrl,mime,size:file.size,name:[...file.name].slice(0,120).join(''),width,height,alt:'作者上传的作品封面'};
  }
  coverInput.addEventListener('change',async()=>{const file=coverInput.files[0];if(!file || pending || saving)return;pending=true;lock();try{cover=await readImage(file);dirty=true;drawCover();ui.message('封面已加入，保存作品后才会写入本机。');}catch(error){ui.message(error.message,'error');}finally{pending=false;coverInput.value='';lock();}});
  document.querySelector('#work-cover-preview').addEventListener('click',event=>{if(event.target.closest('#work-remove-cover') && !pending && !saving){cover=null;dirty=true;drawCover();lock();}});
  form.addEventListener('input',()=>{dirty=true;lock();});form.addEventListener('change',()=>{dirty=true;lock();});
  function render(state){
    const publications=state.publications.filter(item=>item.status==='published'),select=document.querySelector('#work-tutorial'),selected=select.value;select.innerHTML='<option value="">不关联教程</option>'+publications.map(item=>`<option value="${e(item.id)}">${e(item.title)}</option>`).join('');if(publications.some(item=>item.id===selected))select.value=selected;
    const works=[...state.works].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));document.querySelector('#works-count').textContent=works.length+' 个作品';
    list.innerHTML=works.length?works.map(work=>{const src=ui.imageSource(work.image),video=ui.videoLink(work.videoUrl),tutorial=publications.find(item=>item.id===work.tutorialId);return `<article class="common-work-card" id="work-${e(work.id)}"><div class="common-work-cover">${src?`<img src="${e(src)}" alt="${e(work.image.alt || work.title+'的封面')}" loading="lazy">`:'<span>等待一张作品实拍</span>'}</div><div class="common-work-content"><div class="common-meta"><span>${e(work.author)}</span>${ui.sample(work)}</div><h3>${e(work.title)}</h3><p>${e(work.description)}</p>${work.mapCode?`<div class="common-map-code">作品编号：${e(work.mapCode)}</div>`:''}<div class="common-work-links">${video?`<a href="${e(video)}" target="_blank" rel="noopener noreferrer">打开演示视频 ↗</a>`:''}${tutorial?`<a href="${e(ui.tutorialLink(tutorial.id))}">查看搭建教程</a>`:''}${!video && !tutorial?'<span class="common-muted">作者尚未关联视频或教程</span>':''}</div><div class="common-work-status">${e(ui.date(work.createdAt))} · 本机体验展示</div></div></article>`;}).join(''):'<section class="common-empty"><h3>把你的第一件作品放在这里</h3><p>添加一张截图，介绍玩法，也可以关联一篇已经通过本机审核的教程。</p><a href="#work-editor" class="space-button" data-open-editor>添加作品</a></section>';
  }
  async function load(){const ticket=++request;try{const state=await store.getState();if(ticket!==request)return;render(state);login();}catch(error){ui.message(error.message || '无法读取作品，请重试。','error');document.querySelector('#works-count').textContent='读取失败';}finally{list.setAttribute('aria-busy','false');}}
  function openEditor(){editor.open=true;setTimeout(()=>{editor.scrollIntoView({behavior:'auto',block:'start'});if(ui.active())document.querySelector('#work-title').focus({preventScroll:true});},0);}
  document.querySelector('#works-create').addEventListener('click',openEditor);list.addEventListener('click',event=>{if(event.target.closest('[data-open-editor]'))openEditor();});
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(pending || saving || !ui.requireLogin() || !form.reportValidity())return;
    const input={title:document.querySelector('#work-title').value.trim(),description:document.querySelector('#work-description').value.trim(),mapCode:document.querySelector('#work-code').value.trim(),videoUrl:document.querySelector('#work-video').value.trim(),tutorialId:document.querySelector('#work-tutorial').value || null,image:cover};
    if(input.videoUrl && !ui.videoLink(input.videoUrl)){ui.message('演示视频请输入不含账号信息的完整 HTTPS 网页链接。','error');document.querySelector('#work-video').focus();return;}
    if([...input.title].length>60 || [...input.title].length<2 || [...input.description].length>1000 || [...input.description].length<10){ui.message('作品名称需 2–60 个字符，玩法介绍需 10–1000 个字符。','error');return;}
    saving=true;lock();try{await store.saveWork(input);form.reset();cover=null;dirty=false;drawCover();ui.message('作品已保存到本机展示，尚未发布到互联网。');await load();}catch(error){ui.message(error.message || '保存失败，填写内容已保留，请重试。','error');}finally{saving=false;lock();}
  });
  window.addEventListener('beforeunload',event=>{if(dirty || pending || saving){event.preventDefault();event.returnValue='';}});
  window.addEventListener('egg-community-change',load);window.addEventListener('focus',()=>{if(!saving && !pending)load();});
  if(location.hash==='#work-editor')editor.open=true;load();
})();
