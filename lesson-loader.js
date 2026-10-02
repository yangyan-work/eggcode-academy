"use strict";
// Keep the full directory; fetch only the detailed chunk containing this lesson.
(() => {
  const loaderURL = new URL(document.currentScript.src);
  const resourceURL = (file, version) => {
    const url = new URL(file, loaderURL);
    url.search = version ? '?v=' + version : loaderURL.search;
    return url.href;
  };
  const article = document.querySelector('.lesson-article');
  const body = document.getElementById('lesson-body');
  article.setAttribute('aria-busy', 'true');
  body.innerHTML = '<p role="status">正在加载本课的详细步骤与积木图…</p>';
  function loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const timer = setTimeout(() => fail(), 20000);
      function fail() { clearTimeout(timer); script.remove(); reject(new Error('课程资源加载失败')); }
      script.onload = () => { clearTimeout(timer); resolve(); };
      script.onerror = fail;
      script.src = url;
      document.head.append(script);
    });
  }
  async function openLesson() {
    const raw = new URLSearchParams(location.search).get('id') ?? '0';
    const id = /^\d+$/.test(raw) ? Number(raw) : -1;
    const valid = Number.isSafeInteger(id) && id >= 0 && id < Number(document.body.dataset.lessonCount);
    if (valid) {
      const response = await fetch(resourceURL('detail-chunks.json'), { cache: 'no-cache', signal: AbortSignal.timeout(20000) });
      if (!response.ok) throw new Error('课程索引加载失败');
      const chunk = (await response.json())[id];
      if (!chunk || !/^detailed-guides-\d+\.js$/.test(chunk.file) || !/^[a-f0-9]{12}$/.test(chunk.version)) throw new Error('课程索引不完整');
      await loadScript(resourceURL(chunk.file, chunk.version));
      if (!window.EGG_DETAILED_GUIDES?.[id]) throw new Error('本课详细步骤未加载');
    }
    await loadScript(resourceURL('app.js'));
    if (document.getElementById('lesson-title').textContent === '正在打开课程') throw new Error('课程未能打开');
    if (valid && (!body.querySelector('.microsteps') || !body.querySelector('#acceptance') || !document.querySelector('#lesson-steps a'))) throw new Error('课程未完整显示');
    article.setAttribute('aria-busy', 'false');
  }
  openLesson().catch(() => {
    article.setAttribute('aria-busy', 'false');
    document.getElementById('lesson-title').textContent = '本课暂时没有加载成功';
    body.innerHTML = '<div role="alert"><p>网络可能中断，详细步骤未能加载完整。请重试，或先返回课程目录。</p><p><button type="button" class="button button-blue" id="retry-lesson">重新加载本课</button> <a class="button button-white" href="learning-path.html">返回课程目录</a></p></div>';
    document.getElementById('retry-lesson').addEventListener('click', () => location.reload());
    document.querySelector('.lesson-navigation').hidden = true;
  });
})();
