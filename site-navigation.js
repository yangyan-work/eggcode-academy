'use strict';
// Navigation remains usable without this enhancement; measure one shared sticky header.
(() => {
  const header = document.querySelector('.hub-header');
  if (!header) return;
  const measure = () => document.documentElement.style.setProperty('--site-header-height', header.getBoundingClientRect().height + 'px');
  measure();
  if (typeof ResizeObserver === 'function') new ResizeObserver(measure).observe(header);
  else window.addEventListener('resize', measure);

  const page = location.pathname.split('/').pop();
  if (page === 'lesson.html') {
    const lesson = Number(new URLSearchParams(location.search).get('id'));
    const parent = Number.isInteger(lesson) && lesson >= 0 && lesson < 6 ? 'courses.html' : 'practice.html';
    header.querySelectorAll('.hub-primary a').forEach(link => {
      if (link.getAttribute('href') === parent) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  if (page === 'contribute.html') {
    const tab = header.querySelector('.hub-primary a[href="contribute.html#drafts"]');
    const publish = header.querySelector('.hub-publish');
    const updateDraftTab = () => {
      if (location.hash === '#drafts') {
        tab?.setAttribute('aria-current', 'page');
        publish?.removeAttribute('aria-current');
      } else {
        tab?.removeAttribute('aria-current');
        publish?.setAttribute('aria-current', 'page');
      }
    };
    updateDraftTab();
    window.addEventListener('hashchange', updateDraftTab);
  }
})();
