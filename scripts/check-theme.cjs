'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {JSDOM}=require('jsdom'),root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'theme-switch.js'),'utf8');
let checks=0;const ok=(value,message)=>{assert.ok(value,message);checks++;};
for(const header of ['hub-inner','login-header']){
  const dom=new JSDOM('<header class="'+header+'"></header>',{url:'http://qa.invalid/',runScripts:'outside-only'}),w=dom.window;
  try{
    w.localStorage.setItem('freedom-tree.color-theme.v1','invalid');w.eval(source);
    ok(w.document.documentElement.dataset.colorTheme==='mist','无效偏好使用默认雾蓝');
    const select=w.document.querySelector('[aria-label="页面配色"]');ok(select.options.length===5,'恰好五种可切换配色');
    for(const theme of ['mist','mint','lavender','peach','rose']){
      select.value=theme;select.dispatchEvent(new w.Event('change'));
      ok(w.document.documentElement.dataset.colorTheme===theme,'切换真实页面主题 '+theme);
      ok(w.localStorage.getItem('freedom-tree.color-theme.v1')===theme,'记住所选配色 '+theme);
    }
    w.eval(source);ok(w.document.querySelectorAll('.theme-picker').length===1,'重复载入不重复添加选择器');
    ok(w.document.documentElement.dataset.colorTheme==='rose','重新载入恢复所选配色');
  }finally{dom.window.close();}
}
const dom=new JSDOM('<header class="hub-inner"></header>',{url:'http://qa.invalid/',runScripts:'outside-only'});
try{
  Object.defineProperty(dom.window,'localStorage',{get(){throw Error('blocked');}});dom.window.eval(source);
  const select=dom.window.document.querySelector('select');select.value='mint';select.dispatchEvent(new dom.window.Event('change'));
  ok(dom.window.document.documentElement.dataset.colorTheme==='mint','存储不可用仍可切换');
}finally{dom.window.close();}
for(const file of fs.readdirSync(root).filter(n=>n.endsWith('.html'))){
  const html=fs.readFileSync(path.join(root,file),'utf8');
  ok(html.includes('theme-switch.js')&&html.includes('light-theme.css'),file+' 接入统一主题');
}
console.log('PASS 页面配色：'+checks+' 项；五种主题、记忆偏好、无效值、存储失败与全站接入。');
