/* Awards room: a pencil "Hall of Fame" you walk INTO (CSS 3D layers, forward scroll, same feel as the About room).
   Pedestals, spotlights, laurels, floor and doodles: drawn in code for this site. Photos: Prajwal's own. */
const W = window, D = document;
const room = D.getElementById('achievements'), hall = D.getElementById('awh'), cam = D.getElementById('awcam');
if (room && hall && cam) {
const INK = '#1c1c20', GR = '#8f8f97';
const f = v => (Math.round(v * 10) / 10).toString();
let seed = 4242; const R0 = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const LOWEND = (navigator.hardwareConcurrency || 4) <= 4 && Math.min(innerWidth, innerHeight) < 500;
/* ---------- freehand line helpers (never ruler-straight) ---------- */
function wl(pts, j){ const p = pts.map(([x, y]) => [x + (R0() - .5) * j, y + (R0() - .5) * j]); let d = 'M' + f(p[0][0]) + ' ' + f(p[0][1]);
  for (let i = 1; i < p.length - 1; i++){ const mx = (p[i][0] + p[i + 1][0]) / 2, my = (p[i][1] + p[i + 1][1]) / 2; d += ' Q' + f(p[i][0]) + ' ' + f(p[i][1]) + ' ' + f(mx) + ' ' + f(my); }
  const q = p[p.length - 1]; return d + ' L' + f(q[0]) + ' ' + f(q[1]); }
function seg(x1, y1, x2, y2, n, j){ const pts = []; for (let i = 0; i <= n; i++){ const t = i / n; pts.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]); } pts[0][0] += (R0() - .5) * j; return wl(pts, j); }
function poly(pts, n, j){ let d = ''; for (let i = 0; i < pts.length; i++){ const a = pts[i], b = pts[(i + 1) % pts.length]; d += seg(a[0], a[1], b[0], b[1], n, j) + ' '; } return d; }
const pencil = (d, w, col, op) => '<path d="' + d + '" fill="none" stroke="' + (col || INK) + '" stroke-width="' + (w || 2.4) + '" stroke-linecap="round" stroke-linejoin="round"' + (op ? ' opacity="' + op + '"' : '') + '/>';
const twice = (mk, w, col) => pencil(mk(), w || 2.4, col) + pencil(mk(), (w || 2.4) * .5, col, .5);
const STAR = (x, y, r, col) => { const pts = []; for (let i = 0; i < 10; i++){ const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); } return '<path d="' + poly(pts, 1, r * .08) + '" fill="' + (col === INK ? 'none' : 'rgba(232,185,47,.28)') + '" stroke="' + (col || '#e8b92f') + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>'; };
const SPARK = (x, y, r) => pencil(seg(x, y - r, x, y + r, 2, r * .1) + ' ' + seg(x - r, y, x + r, y, 2, r * .1), 1.8, GR);
/* ---------- spotlight cone ---------- */
let gid = 0;
function drawCone(svg){ const id = 'awcg' + (gid++); svg.setAttribute('viewBox', '0 0 300 420'); svg.setAttribute('preserveAspectRatio', 'none');
  let s = '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe27a" stop-opacity=".55"/><stop offset=".55" stop-color="#ffe9a6" stop-opacity=".28"/><stop offset="1" stop-color="#fff3cf" stop-opacity="0"/></linearGradient>'
    + '<radialGradient id="' + id + 'p" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe9a6" stop-opacity=".6"/><stop offset="1" stop-color="#ffe9a6" stop-opacity="0"/></radialGradient></defs>';
  s += '<path d="M132 26 L168 26 L292 400 L8 400 Z" fill="url(#' + id + ')"/>';
  s += '<ellipse cx="150" cy="396" rx="150" ry="22" fill="url(#' + id + 'p)"/>';
  s += pencil(seg(133, 30, 30, 340, 6, 5), 1.6, '#b9b9bf', .8) + pencil(seg(167, 30, 270, 340, 6, 5), 1.6, '#b9b9bf', .8);
  for (let i = 0; i < 4; i++){ const y = 80 + i * 60; s += pencil(seg(133 - (y - 30) * .33 + 10, y, 133 - (y - 30) * .33 + 26, y + 18, 1, 2), 1.1, '#cfcfd4', .8); }
  // the lamp
  s += '<path d="' + poly([[128, 28], [172, 28], [162, 6], [138, 6]], 2, 1.6) + '" fill="#fff" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>' + pencil(seg(150, 6, 150, -40, 2, 2), 1.8, INK);
  s += SPARK(118, 40, 7) + SPARK(186, 46, 6);
  svg.innerHTML = s; }
/* ---------- pedestal ---------- */
function drawPed(svg){ let s = '';
  const face = '<path d="M40 22 L260 22 L260 40 L40 40 Z M62 40 L238 40 L234 106 L66 106 Z M46 106 L254 106 L254 116 L46 116 Z" fill="#fff"/>';
  s += '<ellipse cx="150" cy="117" rx="132" ry="7" fill="rgba(60,60,70,.10)"/>' + face;
  s += twice(() => poly([[30, 20], [270, 20], [258, 8], [42, 8]], 3, 2.2), 2.4);
  s += twice(() => poly([[30, 20], [270, 20], [266, 40], [34, 40]], 3, 2.2), 2.4);
  s += twice(() => seg(62, 40, 66, 106, 3, 2) + ' ' + seg(238, 40, 234, 106, 3, 2), 2.4);
  s += twice(() => poly([[44, 106], [256, 106], [258, 117], [42, 117]], 3, 2), 2.4);
  for (let x = 200; x < 232; x += 6) s += pencil(seg(x, 46 + (R0() * 4), x + 8, 100, 1, 2), 1.1, GR, .7);
  s += STAR(150, 72, 13) + SPARK(98, 66, 6) + SPARK(204, 32, 4);
  svg.innerHTML = s; }
function drawBorder(svg){ svg.innerHTML = '<path d="' + poly([[1.5, 2.5], [98.5, 1.5], [98, 98.5], [2, 97.5]], 4, 1.2) + '" fill="none" stroke="' + INK + '" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>'
  + '<path d="' + poly([[2.5, 1.5], [97.5, 2.8], [98.8, 97.5], [1.2, 98.6]], 4, 1.4) + '" fill="none" stroke="' + INK + '" stroke-width="1" opacity=".45" vector-effect="non-scaling-stroke"/>'; }
function drawPlank(svg){ svg.innerHTML = '<path d="M6 6 L394 4 L394 16 L6 18 Z" fill="#fff"/>' + twice(() => seg(4, 6, 396, 4, 8, 2.2), 2.4) + twice(() => seg(4, 17, 396, 15, 8, 2.2), 2.2)
  + pencil(seg(4, 6, 6, 18, 1, 1.5), 2, INK) + pencil(seg(396, 4, 394, 15, 1, 1.5), 2, INK)
  + (() => { let h = ''; for (let x = 20; x < 390; x += 26) h += pencil(seg(x, 9, x + 7, 15, 1, 1.4), 1, GR, .6); return h; })(); }
function drawLaurel(svg){ let s = ''; svg.setAttribute('viewBox', '0 0 400 140');
  const branch = sx => { let b = ''; const cx = 200, cy = 74, rx = 196, ry = 62, pts = [];
    for (let i = 0; i <= 8; i++){ const a = (140 + i * 10) * Math.PI / 180; pts.push([cx + sx * -Math.cos(a) * -rx, cy + Math.sin(a) * ry]); }
    b += pencil(wl(pts, 2), 2, GR);
    for (let i = 1; i < 8; i++){ const a = (140 + i * 10) * Math.PI / 180, x = cx + sx * Math.cos(a) * rx, y = cy + Math.sin(a) * ry, rot = sx * (i * 14 - 40) + (sx > 0 ? 180 : 0);
      for (const side of [-1, 1]){ b += '<ellipse cx="' + f(x + side * 7 * sx) + '" cy="' + f(y) + '" rx="9" ry="4" transform="rotate(' + f(rot + side * 35) + ' ' + f(x) + ' ' + f(y) + ')" fill="#fff" stroke="' + GR + '" stroke-width="1.6"/>'; } }
    return b; };
  s += branch(1) + branch(-1) + SPARK(36, 14, 7) + SPARK(366, 18, 8);
  svg.innerHTML = s; }
room.querySelectorAll('.cone').forEach(drawCone);
room.querySelectorAll('.ped').forEach(drawPed);
room.querySelectorAll('.lbl-b').forEach(drawBorder);
room.querySelectorAll('.plank').forEach(drawPlank);
const lau = room.querySelector('.laurel'); if (lau) drawLaurel(lau);
/* ---------- floating pencil doodles between stops ---------- */
function addDeco(cls, html, xf, yf, z, w){ const el = D.createElement('div'); el.className = 'al al-deco ' + cls; el.dataset.z = z; el.dataset.xf = xf; el.dataset.yf = yf; el.style.width = w + 'px'; el.setAttribute('aria-hidden', 'true'); el.innerHTML = html; cam.appendChild(el); }
const DOODS = [s => '<svg viewBox="-20 -20 40 40" overflow="visible">' + STAR(0, 0, 16, s ? '#e8b92f' : INK) + '</svg>', () => '<svg viewBox="-20 -20 40 40">' + SPARK(0, 0, 16) + '</svg>',
  () => '<svg viewBox="0 0 40 40">' + pencil('M8 30 C2 18 14 6 24 12 C32 17 26 28 19 24 C14 21 18 15 22 17', 2.2, GR) + '</svg>'];
const stopEls = Array.from(cam.querySelectorAll('.al[data-stop]'));
const DEEP = -Math.min(...stopEls.map(e => +e.dataset.z));
for (let z = -800, i = 0; z > -DEEP; z -= 540, i++){ const x = (i % 2 ? 1 : -1) * (.32 + R0() * .14), y = -.36 + R0() * .55; addDeco('', DOODS[i % 3](i % 2), x, y, z, 24 + R0() * 16); }
/* ---------- layers + camera (same model as the About room) ---------- */
const layers = Array.from(cam.querySelectorAll('.al')).map(el => ({ el, z: +el.dataset.z, xf: +(el.dataset.xf || 0), yf: +(el.dataset.yf || 0), stop: el.hasAttribute('data-stop'), card: el.hasAttribute('data-stop'), op: -1, vis: null }));
layers.sort((a, b) => a.z - b.z); layers.forEach(l => cam.appendChild(l.el));
const STOPOFF = 110; const stopOf = z => z === 0 ? 0 : -z - STOPOFF;
const stops = layers.filter(l => l.stop).map(l => stopOf(l.z)).sort((a, b) => a - b);
const MAX = stops[stops.length - 1];
const reduced = W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches;
const flat = reduced || /[?&]flatsky\b/.test(location.search);
if (flat) room.classList.add('aw-flat');
const prog = room.querySelector('.prog .pfg'), hint = room.querySelector('.aw-hint'), floor = room.querySelector('.aw-floor'), fctx = floor && floor.getContext('2d');
let c = 0, t = 0, vel = 0, last = 0, lastIn = 0, running = false, moved = false, VW = 0, VH = 0, lbOpen = false;
/* polaroid sizes: fit each scene's photo box */
function layout(){ room.querySelectorAll('.aw-scene').forEach(sc => { const box = sc.querySelector('.pols'); if (!box) return; const BW = box.clientWidth, BH = box.clientHeight; if (!BW || !BH) return;
  const ps = box.querySelectorAll('.pol'); const n = ps.length;
  ps.forEach((p, i) => { const img = p.querySelector('img'), a = (+img.getAttribute('width') || 4) / (+img.getAttribute('height') || 3);
    const L = sc.classList.contains('n3l'), maxW = (i === 0 ? (L ? .9 : n > 1 ? .64 : .82) : (L ? .42 : .38)) * BW - 16, maxH = (i === 0 ? (L ? .6 : 1) : (L ? .38 : .52)) * BH - 36;
    let h = maxH, w = h * a; if (w > maxW){ w = maxW; h = w / a; }
    img.style.width = f(w) + 'px'; img.style.height = f(h) + 'px'; }); }); }
function size(){ VW = innerWidth; VH = innerHeight; if (floor){ const s = LOWEND ? 1 : Math.min(1.5, W.devicePixelRatio || 1); floor.width = Math.round(VW * s); floor.height = Math.round(VH * s); floor._s = s; } layout(); }
const FL = Array.from({ length: 80 }, () => [R0() - .5, R0() - .5, R0() - .5]);
function drawFloor(){ if (!fctx) return; const s = floor._s || 1, cx = VW * .5, cy = VH * .46, P = 900, Y = Math.max(300, VH * .52), X = Math.max(380, VW * .62);
  fctx.setTransform(s, 0, 0, s, 0, 0); fctx.clearRect(0, 0, VW, VH); fctx.lineCap = 'round'; fctx.strokeStyle = '#a9a9b0';
  const pr = (x, y, d) => { const k = P / (P - d); return [cx + x * k, cy + y * k]; };
  // two wobbly floor edges + two faint wall corners, converging into the hall
  for (const sx of [-1, 1]){ fctx.globalAlpha = .55; fctx.lineWidth = 1.6; fctx.beginPath(); for (let i = 0; i <= 14; i++){ const d = 600 - i * 500, w = FL[i][sx > 0 ? 0 : 1] * 10; const [x, y] = pr(sx * X + w, Y, d); i ? fctx.lineTo(x, y) : fctx.moveTo(x, y); } fctx.stroke();
    fctx.globalAlpha = .25; fctx.lineWidth = 1.2; fctx.beginPath(); for (let i = 0; i <= 14; i++){ const d = 600 - i * 500, w = FL[i + 20][sx > 0 ? 0 : 1] * 10; const [x, y] = pr(sx * X + w, -Y * 1.4, d); i ? fctx.lineTo(x, y) : fctx.moveTo(x, y); } fctx.stroke(); }
  // floorboards rushing past as you walk
  const STEP = 420, off = c % STEP;
  for (let i = 0; i < 12; i++){ const d = 560 - i * STEP + off; if (d > 600) continue; const k = P / (P - d); if (k < .12) continue; const idx = Math.floor((c - off) / STEP) + i, r = FL[((idx % 60) + 60) % 60];
    const [x1, y1] = pr(-X, Y, d), [x2, y2] = pr(X, Y, d); fctx.globalAlpha = Math.min(.5, k * .4) * (d > 300 ? (600 - d) / 300 : 1); fctx.lineWidth = Math.max(.6, 1.4 * Math.min(1.4, k));
    fctx.beginPath(); fctx.moveTo(x1, y1 + r[0] * 3 * k); fctx.quadraticCurveTo((x1 + x2) / 2 + r[1] * 30 * k, y1 + r[2] * 6 * k, x2, y2 + r[1] * 3 * k); fctx.stroke(); }
  fctx.globalAlpha = 1; }
let rzT = 0; W.addEventListener('resize', () => { clearTimeout(rzT); rzT = setTimeout(() => { size(); render(true); if (flat) layout(); }, 120); });
function render(force){
  for (const l of layers){ const d = l.z + c; let op; const far = l.card ? 1650 : 1900;
    if (d > 560 || d < -far) op = 0; else op = Math.min(1, (d + far) / (l.card ? 560 : 650), (560 - d) / 380);
    if (op <= 0.01){ if (l.vis !== false){ l.el.style.visibility = 'hidden'; l.vis = false; } continue; }
    if (l.vis !== true){ l.el.style.visibility = 'visible'; l.vis = true; }
    const x = l.xf * VW, y = l.yf * VH;
    l.el.style.transform = 'translate3d(' + f(x) + 'px,' + f(y) + 'px,' + f(d) + 'px) translate(-50%,-50%)';
    if (force || Math.abs(op - l.op) > .01){ l.el.style.opacity = op.toFixed(3); l.op = op; } }
  if (prog){ if (!prog._L){ try { prog._L = prog.getTotalLength(); } catch(e){ prog._L = 1000; } prog.style.strokeDasharray = prog._L; } prog.style.strokeDashoffset = prog._L * (1 - c / MAX); }
  drawFloor();
}
function tick(now){
  if (!running) return; const dt = Math.min(.05, (now - last) / 1000 || .016); last = now;
  if (now - lastIn > 380){ let best = null, bd = 1e9; for (const s of stops){ const dd = Math.abs(s - t); if (dd < bd){ bd = dd; best = s; } } if (best !== null && bd < 900 && bd > .5) t += (best - t) * Math.min(1, dt * 3.2); }
  const prev = c; c += (t - c) * Math.min(1, dt * 4.2); if (Math.abs(t - c) < .3) c = t; vel += ((c - prev) / Math.max(dt, .001) - vel) * .15;
  if (Math.abs(c - prev) > .01 || last - lastIn < 600) render(false);
  requestAnimationFrame(tick);
}
function push(dz){ if (lbOpen) return; t = Math.max(0, Math.min(MAX, t + dz)); lastIn = performance.now(); if (!moved && Math.abs(dz) > 2){ moved = true; hint && hint.classList.add('gone'); } }
function goStop(s){ t = s; lastIn = performance.now() - 300; if (!moved){ moved = true; hint && hint.classList.add('gone'); } }
function stepStop(dir){ const cur = t; let n = dir > 0 ? stops.find(s => s > cur + 30) : [...stops].reverse().find(s => s < cur - 30); if (n === undefined) n = dir > 0 ? MAX : 0; goStop(n); }
const isOpen = () => room.classList.contains('open') && !flat;
W.addEventListener('wheel', e => { if (!room.classList.contains('open') || e.ctrlKey) return; if (lbOpen){ e.stopImmediatePropagation(); e.preventDefault(); return; } if (flat){ e.stopImmediatePropagation(); return; } e.stopImmediatePropagation(); e.preventDefault(); let d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY; if (e.deltaMode === 1) d *= 32; else if (e.deltaMode === 2) d *= VH; push(d * 1.5); }, { capture: true, passive: false });
let tch = null;
W.addEventListener('touchstart', e => { if (!isOpen() || lbOpen || !room.contains(e.target)) return; if (e.target.closest('.room-bar')) return; e.stopPropagation(); const p = e.touches[0]; tch = { x: p.clientX, y: p.clientY, lt: performance.now(), v: 0 }; }, { capture: true, passive: true });
W.addEventListener('touchmove', e => { if (!tch || !isOpen()) return; e.stopPropagation(); e.preventDefault(); const p = e.touches[0]; const dy = tch.y - p.clientY, dx = tch.x - p.clientX; const d = Math.abs(dy) >= Math.abs(dx) ? dy : dx * .8; tch.x = p.clientX; tch.y = p.clientY; const now = performance.now(); tch.v = d / Math.max(1, now - tch.lt); tch.lt = now; push(d * 3.2); }, { capture: true, passive: false });
W.addEventListener('touchend', e => { if (!tch) return; e.stopPropagation(); if (performance.now() - tch.lt < 90) push(Math.max(-900, Math.min(900, tch.v * 380))); tch = null; }, { capture: true, passive: true });
let md = null, dragged = false;
hall.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' || !isOpen()) return; md = { y: e.clientY, y0: e.clientY }; dragged = false; });
W.addEventListener('pointermove', e => { if (!md) return; const d = md.y - e.clientY; md.y = e.clientY; if (Math.abs(md.y0 - e.clientY) > 6) dragged = true; if (dragged) push(d * 3); });
W.addEventListener('pointerup', () => { md = null; });
W.addEventListener('keydown', e => { if (!room.classList.contains('open')) return; const k = e.key;
  if (lbOpen){ if (k === 'Escape'){ e.preventDefault(); e.stopImmediatePropagation(); closeLB(); } return; }
  if (flat) return;
  if (k === 'ArrowDown' || k === 'ArrowRight' || k === 'PageDown' || k === ' '){ e.preventDefault(); e.stopImmediatePropagation(); stepStop(1); } else if (k === 'ArrowUp' || k === 'ArrowLeft' || k === 'PageUp'){ e.preventDefault(); e.stopImmediatePropagation(); stepStop(-1); } else if (k === 'Home'){ e.preventDefault(); e.stopImmediatePropagation(); goStop(0); } else if (k === 'End'){ e.preventDefault(); e.stopImmediatePropagation(); goStop(MAX); } }, true);
room.addEventListener('focusin', e => { if (!isOpen() || lbOpen) return; const sl = e.target.closest && e.target.closest('.al[data-stop]'); if (sl) goStop(stopOf(+sl.dataset.z)); });
/* ---------- lightbox (tap a polaroid; close with X, Esc or back) ---------- */
const lb = D.getElementById('awlb'), lbImg = lb.querySelector('img'), lbCap = lb.querySelector('figcaption'), lbX = lb.querySelector('.lb-x');
let lbPushed = false, lbFrom = null;
function openLB(btn){ const img = btn.querySelector('img'); lbImg.src = btn.dataset.full; lbImg.alt = img ? img.alt : ''; lbCap.textContent = btn.dataset.cap || ''; lb.hidden = false; void lb.offsetWidth; lb.classList.add('on'); lbOpen = true; lbFrom = btn;
  try { history.pushState({ room: 'achievements', lb: 1 }, '', location.hash || '#achievements'); lbPushed = true; } catch(e){ lbPushed = false; }
  setTimeout(() => lbX.focus({ preventScroll: true }), 30); }
function hideLB(){ if (!lbOpen) return; lbOpen = false; lb.classList.remove('on'); setTimeout(() => { if (!lbOpen){ lb.hidden = true; lbImg.removeAttribute('src'); } }, reduced ? 0 : 260); if (lbFrom){ lbFrom.focus({ preventScroll: true }); lbFrom = null; } }
function closeLB(){ if (!lbOpen) return; if (lbPushed){ lbPushed = false; hideLB(); history.back(); } else hideLB(); }
lbX.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); closeLB(); });
lb.addEventListener('click', e => { if (e.target === lb){ closeLB(); } });
W.addEventListener('popstate', () => { if (lbOpen){ lbPushed = false; hideLB(); } }, true);
new MutationObserver(() => { if (!room.classList.contains('open') && lbOpen){ lbPushed = false; hideLB(); } }).observe(room, { attributes: true, attributeFilter: ['class'] });
room.addEventListener('click', e => {
  const go = e.target.closest('.smini'); if (go){ e.preventDefault(); const sl = cam.querySelector('.al[data-k="' + go.dataset.go + '"]'); if (sl){ if (flat) sl.scrollIntoView({ behavior: 'auto', block: 'center' }); else goStop(stopOf(+sl.dataset.z)); } return; }
  const p = e.target.closest('.pol'); if (!p || dragged) return; e.preventDefault();
  const sl = p.closest('.al[data-stop]'); if (sl && !flat){ const s = stopOf(+sl.dataset.z); if (Math.abs(s - c) > 300){ goStop(s); return; } }
  openLB(p); });
/* ---------- open / close ---------- */
let loaded = false;
function loadImgs(){ if (loaded) return; loaded = true; room.querySelectorAll('img[data-src]').forEach(im => { im.src = im.dataset.src; im.removeAttribute('data-src'); }); }
function start(){ loadImgs(); size(); if (flat){ layout(); return; } if (running) return; running = true; c = t = 0; vel = 0; moved = false; hint && hint.classList.remove('gone'); render(true); last = performance.now(); requestAnimationFrame(tick); }
function stop(){ running = false; }
new MutationObserver(() => { if (room.classList.contains('open')) start(); else stop(); }).observe(room, { attributes: true, attributeFilter: ['class'] });
size(); if (room.classList.contains('open')) start(); else render(true);
W.PGAwards = { state: () => ({ c, t, stops, MAX, lbOpen }), go: z => { t = z; lastIn = performance.now(); }, stop: i => goStop(stops[i]) };
}
