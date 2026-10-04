'use strict';
(() => {
  const themes = [['mist','雾蓝'],['mint','薄荷'],['lavender','薰衣草'],['peach','蜜桃'],['rose','玫瑰']];
  const key = 'freedom-tree.color-theme.v1';
  const valid = value => themes.some(([name]) => name === value);
  let selected = 'mist';
  try { const saved = localStorage.getItem(key); if (valid(saved)) selected = saved; } catch { /* 配色保存不可用时仍可正常切换。 */ }
  document.documentElement.dataset.colorTheme = selected;
  const host = document.querySelector('.hub-inner,.login-header');
  if (!host || host.querySelector('.theme-picker')) return;
  const label = document.createElement('label'), select = document.createElement('select'), caption = document.createElement('span');
  label.className = 'theme-picker'; caption.textContent = '页面配色'; select.setAttribute('aria-label','页面配色');
  for (const [name, title] of themes) { const option = document.createElement('option'); option.value = name; option.textContent = title; select.append(option); }
  select.value = selected;
  select.addEventListener('change', () => {
    if (!valid(select.value)) return;
    document.documentElement.dataset.colorTheme = select.value;
    try { localStorage.setItem(key, select.value); } catch { /* 无持久存储时保留本页选择。 */ }
  });
  label.append(caption, select); host.append(label);
})();
