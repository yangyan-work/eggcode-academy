"use strict";
// 装饰层独立于登录：失败或关闭时，原有表单照常使用。
(() => {
  const canvas = document.getElementById('login-particles');
  const toggle = document.getElementById('login-motion-toggle');
  const seed = document.getElementById('login-seed');
  const garden = document.getElementById('login-garden');
  const response = document.getElementById('login-seed-response');
  if (!canvas || !toggle || !seed || !garden) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(pointer: fine)');
  const storageKey = 'eggcode.login-effects.v1';
  let paused = false;
  try { paused = localStorage.getItem(storageKey) === 'off'; } catch {}
  let width = 0, height = 0, frame = 0, last = 0, enabled = false, seedCount = 0;
  let motes = [], bursts = [];
  const pointer = {x: -1000, y: -1000};
  const colors = ['#9acfe0', '#bfa9e4', '#e8c6b0', '#86aada'];
  const random = (min, max) => min + Math.random() * (max - min);
  function resize() {
    width = innerWidth; height = innerHeight;
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    // ponytail: 装饰粒子线性扫描，上限 40 个背景粒子 + 60 个短暂粒子；更大场景再考虑离屏绘制。
    motes = Array.from({length: width < 681 ? 18 : 40}, () => ({x: random(0, width), y: random(0, height), r: random(1, 2.6), speed: random(4, 12), phase: random(0, Math.PI * 2), color: colors[Math.floor(random(0, colors.length))]}));
    bursts = [];
  }
  function paint(now) {
    frame = 0;
    if (!enabled || document.hidden) return;
    const dt = Math.min((now - last) / 1000 || 0, .05); last = now;
    ctx.clearRect(0, 0, width, height);
    for (const p of motes) {
      p.phase += dt * .6; p.y -= p.speed * dt; p.x += Math.sin(p.phase) * dt * 5;
      const dx = p.x - pointer.x, dy = p.y - pointer.y, distance = Math.hypot(dx, dy);
      if (distance > 0 && distance < 100) { p.x += dx / distance * dt * 32; p.y += dy / distance * dt * 32; }
      if (p.y < -8) { p.y = height + 8; p.x = random(0, width); }
      if (p.x < -10) p.x = width + 8; else if (p.x > width + 10) p.x = -8;
      ctx.globalAlpha = .2 + (Math.sin(p.phase) + 1) * .12;
      ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    bursts = bursts.filter(p => p.life > 0);
    for (const p of bursts) {
      p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += dt * 24; p.angle += dt * 1.1;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle); ctx.globalAlpha = Math.max(0, Math.min(1, p.life)); ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(1.7, -1.7); ctx.lineTo(5, 0); ctx.lineTo(1.7, 1.7); ctx.lineTo(0, 5); ctx.lineTo(-1.7, 1.7); ctx.lineTo(-5, 0); ctx.lineTo(-1.7, -1.7); ctx.closePath(); ctx.fill(); ctx.restore();
    }
    ctx.globalAlpha = 1;
    frame = requestAnimationFrame(paint);
  }
  function run() {
    cancelAnimationFrame(frame); frame = 0; last = performance.now();
    if (enabled && !document.hidden) frame = requestAnimationFrame(paint);
  }
  function update() {
    enabled = !paused && !reduced.matches;
    document.body.dataset.motion = enabled ? 'on' : 'off';
    toggle.setAttribute('aria-pressed', String(enabled));
    toggle.disabled = reduced.matches;
    document.getElementById('login-motion-label').textContent = reduced.matches ? '静态模式' : enabled ? '暂停特效' : '开启特效';
    toggle.title = reduced.matches ? '已遵循系统的减少动态效果设置' : enabled ? '暂停粒子与漂浮动画' : '开启粒子与漂浮动画';
    if (!enabled) { ctx.clearRect(0, 0, width, height); bursts = []; pointer.x = pointer.y = -1000; }
    run();
  }
  toggle.addEventListener('click', () => {
    paused = !paused;
    try { localStorage.setItem(storageKey, paused ? 'off' : 'on'); } catch {}
    update();
  });
  document.addEventListener('pointermove', event => {
    if (!enabled || !finePointer.matches || event.pointerType === 'touch') return;
    pointer.x = event.clientX; pointer.y = event.clientY;
  }, {passive: true});
  document.addEventListener('pointerleave', () => { pointer.x = pointer.y = -1000; });
  garden.addEventListener('pointermove', event => {
    if (!enabled || !finePointer.matches || event.pointerType === 'touch') return;
    const rect = garden.getBoundingClientRect(), x = (event.clientX - rect.left) / rect.width - .5, y = (event.clientY - rect.top) / rect.height - .5;
    garden.style.setProperty('--scene-x', `${x * 10}px`); garden.style.setProperty('--scene-y', `${y * 8}px`); garden.style.setProperty('--scene-r', `${x * 2}deg`);
  }, {passive: true});
  garden.addEventListener('pointerleave', () => { for (const name of ['--scene-x', '--scene-y', '--scene-r']) garden.style.removeProperty(name); });
  seed.addEventListener('click', () => {
    const messages = ['一点灵感，折射出新的可能。', '保持好奇，下一站会有新发现。', '让灵感，在这里变成作品。'];
    response.textContent = messages[seedCount++ % messages.length];
    if (!enabled) return;
    const rect = seed.getBoundingClientRect();
    for (let i = 0; i < 20; i++) {
      const angle = random(-Math.PI, 0), speed = random(35, 110);
      bursts.push({x: rect.left + rect.width / 2, y: rect.top, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 20, angle: random(0, 7), life: random(1.2, 2.4), color: colors[i % colors.length]});
    }
    bursts = bursts.slice(-60);
  });
  addEventListener('resize', resize, {passive: true});
  document.addEventListener('visibilitychange', run);
  addEventListener('pagehide', () => { cancelAnimationFrame(frame); frame = 0; });
  addEventListener('pageshow', run);
  reduced.addEventListener('change', update);
  seed.setAttribute('aria-label', '唤醒一点灵感');
  toggle.hidden = seed.hidden = false;
  resize(); update();
})();
