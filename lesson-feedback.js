'use strict';
(() => {
  const root = document.getElementById('lesson-body');
  const raw = new URLSearchParams(location.search).get('id') ?? '0';
  if (!root || !/^\d+$/.test(raw) || Number(raw) >= 145) return;
  const id = Number(raw), title = document.getElementById('lesson-title').textContent;
  const dialog = document.createElement('dialog');
  dialog.className = 'feedback-dialog';
  dialog.setAttribute('aria-labelledby', 'feedback-title');
  dialog.innerHTML = '<header><h2 id="feedback-title">记录这一步的问题</h2><button type="button" class="feedback-close" aria-label="关闭纠错报告">×</button></header><form id="feedback-form"><p id="feedback-position" class="feedback-position"></p><p class="feedback-note">报告会带上课程、步骤、原文和定位链接。这里只生成本地文件，尚未发给站长；请勿填写密码、手机号或他人资料。</p><label for="feedback-kind">问题类型</label><select id="feedback-kind" name="kind"><option>积木名称或查找位置</option><option>参数或类型</option><option>连接顺序</option><option>整数范围或大数计算</option><option>文字说明</option><option>积木图</option><option>版权或来源</option><option>其他</option></select><label for="feedback-description">具体哪里有问题？</label><textarea id="feedback-description" name="description" rows="3" minlength="5" maxlength="1000" required placeholder="写清楚操作、发生的问题，以及你认为需要修改的地方。"></textarea><div class="feedback-fields"><div><label for="feedback-expected">预期结果 <small>选填</small></label><textarea id="feedback-expected" name="expected" rows="2" maxlength="500"></textarea></div><div><label for="feedback-actual">实际结果 <small>选填</small></label><textarea id="feedback-actual" name="actual" rows="2" maxlength="500"></textarea></div></div><label for="feedback-editor">编辑器版本 / 平台 <small>选填</small></label><input id="feedback-editor" name="editor" maxlength="100" placeholder="例如：移动端原点版，版本号"><button class="button button-blue feedback-generate" type="submit">生成定位报告</button></form><section class="feedback-output" hidden><h3>报告已生成，尚未提交</h3><label for="feedback-text" class="sr-only">纠错报告内容</label><textarea id="feedback-text" rows="8" readonly></textarea><div class="feedback-actions"><button type="button" data-feedback-download="txt">下载文字报告</button><button type="button" data-feedback-download="json">下载 JSON 报告</button><button type="button" data-feedback-copy>复制报告</button></div><p>将报告与必要截图交给站长提供的收件渠道。当前没有远程举报接口。</p></section><p id="feedback-message" role="status" aria-live="polite"></p>';
  document.body.append(dialog);
  const form = dialog.querySelector('form'), output = dialog.querySelector('.feedback-output');
  const text = dialog.querySelector('#feedback-text'), message = dialog.querySelector('#feedback-message');
  let position, record, trigger;
  const items = [...root.querySelectorAll('.setup-object ol > li, #start-here > ol > li, .custom-catalog section ol > li, .recipe-step .microsteps ol > li, .recipe-step > ol > li, .scenario-tests .test-case, .recipe-step')];
  items.forEach((node, index) => {
    if (!node.id) node.id = 'feedback-location-' + (index + 1);
    node.classList.add('feedback-location');
    const section = node.closest('.recipe-step,.setup-object,.custom-catalog,.scenario-tests,#start-here') || node;
    const heading = section.querySelector('h3,h4,summary')?.textContent.trim() || '课程准备';
    const excerptNode = node.cloneNode(true);
    excerptNode.querySelectorAll('button,figure,.logic-summary,.diagram-text').forEach(el => el.remove());
    const excerpt = excerptNode.textContent.replace(/\s+/g, ' ').trim().slice(0, 1500);
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'feedback-step-button';
    button.textContent = node.matches('.recipe-step') ? '反馈本段或积木图' : '这一步有问题';
    button.setAttribute('aria-label', '反馈：' + heading + '，定位项 ' + (index + 1));
    button.addEventListener('click', () => {
      trigger = button;
      const url = new URL('lesson.html', location.href); url.searchParams.set('id', String(id)); url.hash = node.id;
      position = { anchor: node.id, item: index + 1, section: heading, excerpt, url: url.href };
      record = null; form.reset(); output.hidden = true; text.value = ''; message.textContent = '';
      dialog.querySelector('#feedback-position').textContent = '第 ' + (id + 1) + ' 课 · ' + title + ' / ' + heading + ' / 定位项 ' + (index + 1);
      dialog.showModal();
      form.elements.description.focus();
    });
    node.append(button);
  });
  form.addEventListener('input', () => { record = null; output.hidden = true; text.value = ''; message.textContent = ''; });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const description = form.elements.description.value.trim();
    if (Array.from(description).length < 5) { message.textContent = '请至少填写 5 个有效字符说明问题。'; form.elements.description.focus(); return; }
    record = { format:'free-tree-correction', version:1, siteVersion:'2026.10.04', createdAt:new Date().toISOString(), status:'not-submitted', lesson:{id,title}, position:{...position}, issue:{kind:form.elements.kind.value,description,expected:form.elements.expected.value.trim(),actual:form.elements.actual.value.trim(),editor:form.elements.editor.value.trim()} };
    text.value = ['自由树梦想空间 · 纠错报告（尚未提交）', '版本：' + record.siteVersion, '生成时间：' + record.createdAt, '课程：' + (id + 1) + '. ' + title, '章节：' + position.section, '定位项：' + position.item, '链接：' + position.url, '原文：' + position.excerpt, '问题类型：' + record.issue.kind, '问题说明：' + description, '预期结果：' + (record.issue.expected || '未填写'), '实际结果：' + (record.issue.actual || '未填写'), '编辑器：' + (record.issue.editor || '未填写')].join('\n');
    output.hidden = false; message.textContent = '报告已生成，只保留在当前页面。下载或复制后再交给站长。';
  });
  dialog.addEventListener('click', async event => {
    if (event.target.closest('.feedback-close')) { dialog.close(); return; }
    const download = event.target.closest('[data-feedback-download]');
    if (download && record) {
      const json = download.dataset.feedbackDownload === 'json';
      const url = URL.createObjectURL(new Blob([json ? JSON.stringify(record, null, 2) : text.value], {type:json ? 'application/json;charset=utf-8' : 'text/plain;charset=utf-8'}));
      const link = document.createElement('a'); link.href = url; link.download = '自由树-课程' + (id + 1) + '-步骤' + position.item + '-纠错.' + (json ? 'json' : 'txt'); link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      message.textContent = '已开始下载报告，尚未发送给站长。';
    }
    if (event.target.closest('[data-feedback-copy]') && record) {
      try { await navigator.clipboard.writeText(text.value); message.textContent = '报告已复制，尚未发送给站长。'; }
      catch { text.focus(); text.select(); message.textContent = '浏览器未允许自动复制。报告已选中，请手动复制。'; }
    }
  });
  dialog.addEventListener('close', () => { record = null; text.value = ''; output.hidden = true; trigger?.focus({preventScroll:true}); });
  if (location.hash && typeof window.revealAnchor === 'function') window.revealAnchor(location.hash);
})();
