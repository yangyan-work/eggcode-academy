'use strict';
// 重用旧头部链接；原生 details 负责更多栏目的展开与键盘操作。
(() => {
  const header=document.querySelector('.hub-header'),nav=header?.querySelector('.hub-primary');
  if(!header||!nav)return;
  const page=location.pathname.split('/').pop()||'index.html';
  if(page==='index.html'){
    const legacy={'#courses':'courses.html','#practice':'practice.html','#manual':'manual.html','#roadmap':'learning-path.html'};
    if(legacy[location.hash]){location.replace(legacy[location.hash]);return;}
  }
  function link(href,label){const node=header.querySelector(`a[href="${href}"]:not(.hub-brand)`)||document.createElement('a');node.href=href;node.textContent=label;return node;}
  const paths=['M3 11 12 3l9 8M5 10v10h5v-6h4v6h5V10','M12 6C9 4 6 4 3 5v15c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1Zm0 0v15','m9 5 11 7-11 7Z','M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 3.5h7m-3.5-3.5v7','M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-2a8 8 0 0 1 16 0v2'];
  const common=[['index.html','学习首页','首页'],['courses.html','入门课程','入门'],['practice.html','玩法教程','玩法'],['manual.html','积木手册','积木'],['personal-space.html','我的空间','我的']].map(([href,label,short],index)=>{
    const node=link(href,label),icon=document.createElementNS('http://www.w3.org/2000/svg','svg'),path=document.createElementNS('http://www.w3.org/2000/svg','path');
    icon.setAttribute('viewBox','0 0 24 24');icon.setAttribute('aria-hidden','true');path.setAttribute('d',paths[index]);icon.append(path);
    const title=document.createElement('span'),compact=document.createElement('span');title.className='nav-label';title.textContent=label;compact.className='nav-short';compact.textContent=short;compact.setAttribute('aria-hidden','true');
    node.setAttribute('aria-label',label);node.replaceChildren(icon,title,compact);return node;
  });
  const extra=[['community.html','社区教程'],['works.html','作品展示'],['contribute.html','投稿教程'],['contribute.html#drafts','我的投稿'],['messages.html','消息中心']].map(([href,label])=>link(href,label));
  const cloud=window.EGG_CLOUD?.status(),unavailable=Boolean(cloud&&cloud.mode!=='local');
  if(unavailable)for(const node of extra)node.append(document.createTextNode('（未开放）'));
  const more=document.createElement('details'),summary=document.createElement('summary'),panel=document.createElement('div');
  more.className='hub-more';summary.textContent='更多';panel.className='hub-more-panel';panel.append(...extra);
  if(unavailable){const note=document.createElement('p');note.className='hub-more-note';note.textContent='目前开放课程与个人学习记录。';panel.append(note);}
  more.append(summary,panel);nav.replaceChildren(...common,more);header.querySelector('.hub-actions')?.remove();header.querySelector('.hub-brand')?.removeAttribute('aria-current');
  function current(){
    let route=page,parent=false;
    if(page==='lesson.html'){const id=Number(new URLSearchParams(location.search).get('id'));route=Number.isInteger(id)&&id>=0&&id<6?'courses.html':'practice.html';parent=true;}
    if(page==='block.html'){route='manual.html';parent=true;}
    if(page==='community-tutorial.html'){route='community.html';parent=true;}
    if(page==='contribute.html')route=location.hash==='#drafts'?'contribute.html#drafts':'contribute.html';
    for(const node of nav.querySelectorAll('a')){if(node.getAttribute('href')===route)node.setAttribute('aria-current',parent?'location':'page');else node.removeAttribute('aria-current');}
    const selected=panel.querySelector('[aria-current]');summary.dataset.current=String(Boolean(selected));summary.setAttribute('aria-label',selected?'更多，当前栏目：'+selected.textContent:'更多栏目');
  }
  current();window.addEventListener('hashchange',current);
  more.addEventListener('keydown',event=>{if(event.key==='Escape'&&more.open){more.open=false;summary.focus();}});
  const inner=header.querySelector('.hub-inner'),bar=document.createElement('div'),toggle=document.createElement('button'),drawer=document.createElement('dialog'),close=document.createElement('button');
  bar.className='hub-mobile-header';bar.append(header.querySelector('.hub-brand').cloneNode(true));
  toggle.className='hub-menu-toggle';toggle.type='button';toggle.textContent='菜单';toggle.setAttribute('aria-label','打开侧边栏');toggle.setAttribute('aria-controls','site-navigation-drawer');toggle.setAttribute('aria-expanded','false');bar.append(toggle);
  drawer.className='hub-drawer';drawer.id='site-navigation-drawer';drawer.setAttribute('aria-label','站点侧边导航');
  close.className='hub-drawer-close';close.type='button';close.textContent='×';close.setAttribute('aria-label','关闭侧边栏');inner.prepend(close);header.prepend(bar);header.append(drawer);
  toggle.addEventListener('click',()=>{drawer.showModal();toggle.setAttribute('aria-expanded','true');});
  close.addEventListener('click',()=>drawer.close());
  drawer.addEventListener('close',()=>{toggle.setAttribute('aria-expanded','false');if(window.innerWidth<=700)toggle.focus();});
  drawer.addEventListener('click',event=>{if(event.target!==drawer)return;const rect=drawer.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)drawer.close();});
  let compact;
  const measure=()=>{
    const next=window.innerWidth<=700;
    if(next!==compact){if(drawer.open)drawer.close();more.open=false;next?drawer.append(inner):header.append(inner);compact=next;}
    document.documentElement.style.setProperty('--site-header-height',(next?header.getBoundingClientRect().height:0)+'px');
  };
  measure();if(typeof ResizeObserver==='function')new ResizeObserver(measure).observe(header);else window.addEventListener('resize',measure);
})();
