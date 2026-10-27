/* Book room: "Game On: Unity Edition" — a pencil reading room you fly INTO (CSS 3D layers, forward scroll, same feel as About/Awards).
   Stops: the book itself (big, on a sketched desk under a lamp) -> a real flipbook of the first pages -> what's inside -> buy + back.
   Doodles, desk, lamp: drawn in code for this site. Pages: Prajwal's own book, photographed and cleaned (crop/levels only). */
const W = window, D = document;
const room = D.getElementById('book'), hall = D.getElementById('bkh'), cam = D.getElementById('bkcam');
if (room && hall && cam) {
const INK = '#1c1c20', GR = '#8f8f97';
const f = v => (Math.round(v * 10) / 10).toString();
let seed = 2025; const R0 = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const LOWEND = (navigator.hardwareConcurrency || 4) <= 4 && Math.min(innerWidth, innerHeight) < 500;
const reduced = W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches;
/* ---------- freehand line helpers (never ruler-straight) ---------- */
function wl(pts, j){ const p = pts.map(([x, y]) => [x + (R0() - .5) * j, y + (R0() - .5) * j]); let d = 'M' + f(p[0][0]) + ' ' + f(p[0][1]);
  for (let i = 1; i < p.length - 1; i++){ const mx = (p[i][0] + p[i + 1][0]) / 2, my = (p[i][1] + p[i + 1][1]) / 2; d += ' Q' + f(p[i][0]) + ' ' + f(p[i][1]) + ' ' + f(mx) + ' ' + f(my); }
  const q = p[p.length - 1]; return d + ' L' + f(q[0]) + ' ' + f(q[1]); }
function seg(x1, y1, x2, y2, n, j){ const pts = []; for (let i = 0; i <= n; i++){ const t = i / n; pts.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]); } return wl(pts, j); }
function poly(pts, n, j){ let d = ''; for (let i = 0; i < pts.length; i++){ const a = pts[i], b = pts[(i + 1) % pts.length]; d += seg(a[0], a[1], b[0], b[1], n, j) + ' '; } return d; }
const pencil = (d, w, col, op) => '<path d="' + d + '" fill="none" stroke="' + (col || INK) + '" stroke-width="' + (w || 2.4) + '" stroke-linecap="round" stroke-linejoin="round"' + (op ? ' opacity="' + op + '"' : '') + '/>';
const twice = (mk, w, col) => pencil(mk(), w || 2.4, col) + pencil(mk(), (w || 2.4) * .5, col, .5);
const STAR = (x, y, r, col) => { const pts = []; for (let i = 0; i < 10; i++){ const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); } return '<path d="' + poly(pts, 1, r * .08) + '" fill="' + (col === INK ? 'none' : 'rgba(232,185,47,.28)') + '" stroke="' + (col || '#e8b92f') + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>'; };
const SPARK = (x, y, r) => pencil(seg(x, y - r, x, y + r, 2, r * .1) + ' ' + seg(x - r, y, x + r, y, 2, r * .1), 1.8, GR);
/* ---------- lamp + light cone over the book ---------- */
function drawCone(svg){ svg.setAttribute('viewBox', '0 0 300 420'); svg.setAttribute('preserveAspectRatio', 'none');
  let s = '<defs><linearGradient id="bkcg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe27a" stop-opacity=".5"/><stop offset=".6" stop-color="#ffe9a6" stop-opacity=".22"/><stop offset="1" stop-color="#fff3cf" stop-opacity="0"/></linearGradient></defs>';
  s += '<path d="M138 26 L162 26 L270 400 L30 400 Z" fill="url(#bkcg)"/>';
  s += pencil(seg(139, 30, 52, 330, 6, 4), 1.4, '#c4c4ca', .8) + pencil(seg(161, 30, 248, 330, 6, 4), 1.4, '#c4c4ca', .8);
  s += '<path d="' + poly([[132, 28], [168, 28], [160, 8], [140, 8]], 2, 1.4) + '" fill="#fff" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>' + pencil(seg(150, 8, 150, -60, 2, 2), 1.6, INK);
  s += SPARK(112, 44, 6) + SPARK(192, 52, 5);
  svg.innerHTML = s; }
/* ---------- sketched desk the book stands on ---------- */
function drawDesk(svg){ let s = '<path d="M40 14 L360 14 L392 40 L8 40 Z M8 40 L392 40 L392 54 L8 54 Z" fill="#fff"/>';
  s += '<ellipse cx="200" cy="58" rx="190" ry="6" fill="rgba(60,60,70,.08)"/>';
  s += twice(() => poly([[40, 14], [360, 14], [392, 40], [8, 40]], 4, 2), 2.4);
  s += twice(() => seg(8, 40, 8, 54, 1, 1.2) + ' ' + seg(392, 40, 392, 54, 1, 1.2) + ' ' + seg(8, 54, 392, 54, 6, 1.8), 2.2);
  s += twice(() => seg(30, 54, 34, 90, 2, 1.4) + ' ' + seg(370, 54, 366, 90, 2, 1.4), 2.2);
  for (let x = 60; x < 340; x += 34) s += pencil(seg(x, 20 + R0() * 3, x + 40, 36, 1, 1.4), 1, GR, .5);
  // a pencil lying on the desk + a coffee mug
  s += twice(() => poly([[262, 30], [330, 22], [332, 27], [264, 35]], 1, .8), 1.6) + pencil(seg(330, 22, 342, 23, 1, .5) + ' ' + seg(332, 27, 342, 23, 1, .5), 1.4) + '<path d="M262 30 L254 33 L264 35 Z" fill="#e8b92f"/>';
  s += twice(() => poly([[60, 4], [86, 4], [84, 32], [62, 32]], 2, 1), 1.8) + pencil('M86 10 C 96 10, 96 24, 85 24', 1.8) + pencil(seg(66, -4, 68, -12, 2, 1.5) + ' ' + seg(76, -2, 78, -12, 2, 1.5), 1.2, GR);
  svg.innerHTML = s; }
room.querySelectorAll('.bk-cone').forEach(drawCone);
room.querySelectorAll('.bk-desk').forEach(drawDesk);
/* ---------- floating pencil doodles between stops: stars, a game controller, the Unity cube ---------- */
const PAD = () => '<svg viewBox="0 0 100 70">' + twice(() => 'M22 18 h56 c12 0 18 34 8 40 c-8 4 -14 -8 -22 -10 h-28 c-8 2 -14 14 -22 10 c-10 -6 -4 -40 8 -40 z', 2.4) + pencil(seg(28, 32, 40, 32, 1, 1) + ' ' + seg(34, 26, 34, 38, 1, 1), 2.2) + '<circle cx="66" cy="30" r="4" fill="none" stroke="' + INK + '" stroke-width="2"/><circle cx="75" cy="38" r="4" fill="rgba(226,85,63,.35)" stroke="#e2553f" stroke-width="2"/></svg>';
const CUBE = () => '<svg viewBox="0 0 100 100">' + twice(() => poly([[50, 12], [84, 30], [84, 70], [50, 88], [16, 70], [16, 30]], 3, 1.6), 2.4) + twice(() => seg(50, 50, 50, 88, 2, 1.2) + ' ' + seg(50, 50, 16, 30, 2, 1.2) + ' ' + seg(50, 50, 84, 30, 2, 1.2), 2) + '<text x="50" y="104" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="20" fill="' + GR + '">unity</text></svg>';
const DOODS = [s => '<svg viewBox="-20 -20 40 40" overflow="visible">' + STAR(0, 0, 16, s ? '#e8b92f' : INK) + '</svg>', () => '<svg viewBox="-20 -20 40 40">' + SPARK(0, 0, 16) + '</svg>', PAD, CUBE];
function addDeco(html, xf, yf, z, w){ const el = D.createElement('div'); el.className = 'al al-deco'; el.dataset.z = z; el.dataset.xf = xf; el.dataset.yf = yf; el.style.width = w + 'px'; el.setAttribute('aria-hidden', 'true'); el.innerHTML = html; cam.appendChild(el); }
[[-800, 0, 26], [-1150, 2, 64], [-2350, 3, 60], [-2700, 1, 28], [-3950, 0, 30], [-4300, 2, 58]].forEach(([z, k, w], i) => { const x = (i % 2 ? 1 : -1) * (.3 + R0() * .12), y = -.34 + R0() * .5; addDeco(DOODS[k](i % 2), x, y, z, w); });
/* ---------- layers + camera (same model as the About/Awards rooms) ---------- */
const layers = Array.from(cam.querySelectorAll('.al')).map(el => ({ el, z: +el.dataset.z, xf: +(el.dataset.xf || 0), yf: +(el.dataset.yf || 0), stop: el.hasAttribute('data-stop'), card: el.hasAttribute('data-stop'), op: -1, vis: null }));
layers.sort((a, b) => a.z - b.z); layers.forEach(l => cam.appendChild(l.el));
const STOPOFF = 110; const stopOf = z => z === 0 ? 0 : -z - STOPOFF;
const stops = layers.filter(l => l.stop).map(l => stopOf(l.z)).sort((a, b) => a - b);
const MAX = stops[stops.length - 1];
const LOOK = stopOf(-1700);
const flat = reduced || /[?&]flatsky\b/.test(location.search);
if (flat) room.classList.add('bk-flat');
const prog = room.querySelector('.prog .pfg'), hint = room.querySelector('.bk-hint'), floor = room.querySelector('.bk-floor'), fctx = floor && floor.getContext('2d');
let c = 0, t = 0, last = 0, lastIn = 0, running = false, moved = false, VW = 0, VH = 0, lbOpen = false;
function size(){ VW = innerWidth; VH = innerHeight; if (floor){ const s = LOWEND ? 1 : Math.min(1.5, W.devicePixelRatio || 1); floor.width = Math.round(VW * s); floor.height = Math.round(VH * s); floor._s = s; } }
const FL = Array.from({ length: 80 }, () => [R0() - .5, R0() - .5, R0() - .5]);
function drawFloor(){ if (!fctx) return; const s = floor._s || 1, cx = VW * .5, cy = VH * .46, P = 900, Y = Math.max(300, VH * .52), X = Math.max(380, VW * .62);
  fctx.setTransform(s, 0, 0, s, 0, 0); fctx.clearRect(0, 0, VW, VH); fctx.lineCap = 'round'; fctx.strokeStyle = '#a9a9b0';
  const pr = (x, y, d) => { const k = P / (P - d); return [cx + x * k, cy + y * k]; };
  for (const sx of [-1, 1]){ fctx.globalAlpha = .5; fctx.lineWidth = 1.6; fctx.beginPath(); for (let i = 0; i <= 14; i++){ const d = 600 - i * 500, w = FL[i][sx > 0 ? 0 : 1] * 10; const [x, y] = pr(sx * X + w, Y, d); i ? fctx.lineTo(x, y) : fctx.moveTo(x, y); } fctx.stroke();
    fctx.globalAlpha = .22; fctx.lineWidth = 1.2; fctx.beginPath(); for (let i = 0; i <= 14; i++){ const d = 600 - i * 500, w = FL[i + 20][sx > 0 ? 0 : 1] * 10; const [x, y] = pr(sx * X + w, -Y * 1.4, d); i ? fctx.lineTo(x, y) : fctx.moveTo(x, y); } fctx.stroke(); }
  const STEP = 420, off = c % STEP;
  for (let i = 0; i < 12; i++){ const d = 560 - i * STEP + off; if (d > 600) continue; const k = P / (P - d); if (k < .12) continue; const idx = Math.floor((c - off) / STEP) + i, r = FL[((idx % 60) + 60) % 60];
    const [x1, y1] = pr(-X, Y, d), [x2, y2] = pr(X, Y, d); fctx.globalAlpha = Math.min(.45, k * .38) * (d > 300 ? (600 - d) / 300 : 1); fctx.lineWidth = Math.max(.6, 1.4 * Math.min(1.4, k));
    fctx.beginPath(); fctx.moveTo(x1, y1 + r[0] * 3 * k); fctx.quadraticCurveTo((x1 + x2) / 2 + r[1] * 30 * k, y1 + r[2] * 6 * k, x2, y2 + r[1] * 3 * k); fctx.stroke(); }
  fctx.globalAlpha = 1; }
let rzT = 0; W.addEventListener('resize', () => { clearTimeout(rzT); rzT = setTimeout(() => { size(); render(true); fbSize(); }, 120); });
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
  if (c > 500) loadPages();
}
function tick(now){
  if (!running) return; const dt = Math.min(.05, (now - last) / 1000 || .016); last = now;
  if (now - lastIn > 380){ let best = null, bd = 1e9; for (const s of stops){ const dd = Math.abs(s - t); if (dd < bd){ bd = dd; best = s; } } if (best !== null && bd < 900 && bd > .5) t += (best - t) * Math.min(1, dt * 3.2); }
  const prev = c; c += (t - c) * Math.min(1, dt * 4.2); if (Math.abs(t - c) < .3) c = t;
  if (Math.abs(c - prev) > .01 || last - lastIn < 600) render(false);
  requestAnimationFrame(tick);
}
function push(dz){ if (lbOpen) return; t = Math.max(0, Math.min(MAX, t + dz)); lastIn = performance.now(); if (!moved && Math.abs(dz) > 2){ moved = true; hint && hint.classList.add('gone'); } }
function goStop(s){ t = s; lastIn = performance.now() - 300; if (!moved){ moved = true; hint && hint.classList.add('gone'); } }
function stepStop(dir){ const cur = t; let n = dir > 0 ? stops.find(s => s > cur + 30) : [...stops].reverse().find(s => s < cur - 30); if (n === undefined) n = dir > 0 ? MAX : 0; goStop(n); }
const isOpen = () => room.classList.contains('open') && !flat;
const inBook = el => el && el.closest && el.closest('.fbook');
W.addEventListener('wheel', e => { if (!room.classList.contains('open') || e.ctrlKey) return; if (lbOpen){ if (!e.target.closest('.bk-lbs')){ e.preventDefault(); } e.stopImmediatePropagation(); return; } if (flat){ e.stopImmediatePropagation(); return; } e.stopImmediatePropagation(); e.preventDefault(); let d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY; if (e.deltaMode === 1) d *= 32; else if (e.deltaMode === 2) d *= VH; push(d * 1.5); }, { capture: true, passive: false });
let tch = null;
W.addEventListener('touchstart', e => { if (!isOpen() || lbOpen || !room.contains(e.target)) return; if (e.target.closest('.room-bar') || inBook(e.target)) return; e.stopPropagation(); const p = e.touches[0]; tch = { x: p.clientX, y: p.clientY, lt: performance.now(), v: 0 }; }, { capture: true, passive: true });
W.addEventListener('touchmove', e => { if (!tch || !isOpen()) return; e.stopPropagation(); e.preventDefault(); const p = e.touches[0]; const dy = tch.y - p.clientY, dx = tch.x - p.clientX; const d = Math.abs(dy) >= Math.abs(dx) ? dy : dx * .8; tch.x = p.clientX; tch.y = p.clientY; const now = performance.now(); tch.v = d / Math.max(1, now - tch.lt); tch.lt = now; push(d * 3.2); }, { capture: true, passive: false });
W.addEventListener('touchend', e => { if (!tch) return; e.stopPropagation(); if (performance.now() - tch.lt < 90) push(Math.max(-900, Math.min(900, tch.v * 380))); tch = null; }, { capture: true, passive: true });
let md = null, dragged = false;
hall.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' || !isOpen() || inBook(e.target)) return; md = { y: e.clientY, y0: e.clientY }; dragged = false; });
W.addEventListener('pointermove', e => { if (!md) return; const d = md.y - e.clientY; md.y = e.clientY; if (Math.abs(md.y0 - e.clientY) > 6) dragged = true; if (dragged) push(d * 3); });
W.addEventListener('pointerup', () => { md = null; });
W.addEventListener('keydown', e => { if (!room.classList.contains('open')) return; const k = e.key;
  if (lbOpen){ if (k === 'Escape'){ e.preventDefault(); e.stopImmediatePropagation(); closeLB(); } else if (k === 'ArrowRight' || k === 'ArrowLeft'){ e.preventDefault(); e.stopImmediatePropagation(); } return; }
  const atBook = flat ? (D.activeElement && inBook(D.activeElement)) : Math.abs(c - LOOK) < 260;
  if (atBook && (k === 'ArrowRight' || k === 'ArrowLeft')){ e.preventDefault(); e.stopImmediatePropagation(); flip(k === 'ArrowRight' ? 1 : -1); return; }
  if (flat) return;
  if (k === 'ArrowDown' || k === 'ArrowRight' || k === 'PageDown' || k === ' '){ e.preventDefault(); e.stopImmediatePropagation(); stepStop(1); } else if (k === 'ArrowUp' || k === 'ArrowLeft' || k === 'PageUp'){ e.preventDefault(); e.stopImmediatePropagation(); stepStop(-1); } else if (k === 'Home'){ e.preventDefault(); e.stopImmediatePropagation(); goStop(0); } else if (k === 'End'){ e.preventDefault(); e.stopImmediatePropagation(); goStop(MAX); } }, true);
room.addEventListener('focusin', e => { if (!isOpen() || lbOpen) return; const sl = e.target.closest && e.target.closest('.al[data-stop]'); if (sl) goStop(stopOf(+sl.dataset.z)); });

/* =================== FLIPBOOK =================== */
const PAGES = [0, 1, 2, 3, 4, 5, 6, 7].map(i => 'assets/bk/pg' + i + '.jpg');
const PAGE_ALT = ['Cover', 'Title page: Game On, Unity Edition — Dream. Develop. Deploy.', 'Copyright page', 'Unity logo and dedication', 'Introduction: From an Average Student to a Game Developer', 'The Turning Point', 'Imagination is My Power', 'Why This Book?'];
const NP = PAGES.length;
const fb = D.getElementById('fbook'), nEl = room.querySelector('.fb-n'), bPrev = room.querySelector('.fb-prev'), bNext = room.querySelector('.fb-next');
fb.innerHTML = '<div class="fb-pg fb-under"><img alt="" draggable="false"><div class="fb-sh"></div></div><div class="fb-pg fb-cur"><img alt="" draggable="false"></div><div class="fb-leaf" hidden><div class="fb-pg fb-front"><img alt="" draggable="false"><div class="fb-curl"></div></div><div class="fb-pg fb-back"><img alt="" draggable="false"></div></div>';
const under = fb.querySelector('.fb-under'), underImg = under.querySelector('img'), sh = under.querySelector('.fb-sh'), curPg = fb.querySelector('.fb-cur'), curImg = curPg.querySelector('img'),
  leaf = fb.querySelector('.fb-leaf'), frontImg = leaf.querySelector('.fb-front img'), backImg = leaf.querySelector('.fb-back img'), curl = leaf.querySelector('.fb-curl');
under.style.zIndex = 1; curPg.style.zIndex = 2;
let idx = 0, fl = null, pagesLoaded = false;
function loadPages(){ if (pagesLoaded) return; pagesLoaded = true; PAGES.forEach(s => { const im = new Image(); im.decoding = 'async'; im.src = s; }); }
function setImg(img, i){ const s = PAGES[i]; if (img.getAttribute('src') !== s) img.src = s; }
function showStatic(){ setImg(curImg, idx); curImg.alt = 'Page: ' + PAGE_ALT[idx]; curPg.style.visibility = ''; leaf.hidden = true; under.style.visibility = 'hidden'; nEl.textContent = (idx + 1) + ' / ' + NP; bPrev.disabled = idx <= 0; bNext.disabled = idx >= NP - 1; }
function fbSize(){}
/* angle a: 0 = leaf flat over the page, -180 = turned over to the left (the spine is the left edge) */
function paint(a){ const p = Math.min(1, Math.max(0, -a / 180)), s = Math.sin(p * Math.PI);
  const bend = reduced ? 0 : s * 1.6;
  leaf.style.transform = 'rotateY(' + a.toFixed(2) + 'deg) rotateZ(' + (-bend * .35).toFixed(2) + 'deg)';
  leaf.style.opacity = p > .62 ? Math.max(0, 1 - (p - .62) / .38).toFixed(3) : '1';
  curl.style.opacity = s.toFixed(3);
  curl.style.background = 'linear-gradient(90deg, rgba(28,28,32,' + (.30 * s).toFixed(3) + ') 0%, rgba(28,28,32,.04) ' + (30 + 20 * p).toFixed(1) + '%, rgba(255,255,255,' + (.55 * s).toFixed(3) + ') ' + (62 + 10 * p).toFixed(1) + '%, rgba(28,28,32,' + (.22 * s).toFixed(3) + ') 100%)';
  const edge = Math.max(0, Math.cos(p * Math.PI)) * 100; // where the turning edge projects onto the page under it
  sh.style.opacity = p < .5 ? (s * 1).toFixed(3) : (Math.max(0, 1 - (p - .5) * 2.2)).toFixed(3);
  sh.style.background = 'linear-gradient(90deg, rgba(28,28,32,0) ' + Math.max(0, edge - 1).toFixed(1) + '%, rgba(28,28,32,.30) ' + edge.toFixed(1) + '%, rgba(28,28,32,.10) ' + Math.min(100, edge + 8).toFixed(1) + '%, rgba(28,28,32,0) ' + Math.min(100, edge + 26).toFixed(1) + '%)'; }
function begin(dir){ if (fl) return false; const to = idx + dir; if (to < 0 || to >= NP) return false; loadPages();
  if (dir > 0){ setImg(underImg, to); setImg(frontImg, idx); setImg(backImg, idx); }
  else { setImg(underImg, idx); setImg(frontImg, to); setImg(backImg, to); }
  under.style.visibility = ''; curPg.style.visibility = 'hidden'; leaf.hidden = false; fl = { dir, to, a: dir > 0 ? 0 : -180 }; paint(fl.a); return true; }
function finish(done){ const g = fl; fl = null; if (done) idx = g.to; showStatic(); }
function animTo(target, ms, cb){ const g = fl; if (!g) return; if (reduced){ g.a = target; paint(target); cb && cb(); return; } const a0 = g.a, t0 = performance.now(), dur = ms * Math.max(.35, Math.abs(target - a0) / 180);
  const step = now => { const u = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - u, 3); g.a = a0 + (target - a0) * e; paint(g.a); if (u < 1) requestAnimationFrame(step); else cb && cb(); }; requestAnimationFrame(step); }
function flip(dir){ if (fl){ return; } if (!begin(dir)) { nudge(dir); return; } const g = fl; animTo(dir > 0 ? -180 : 0, 720, () => finish(true)); }
function nudge(dir){ if (reduced) return; fb.animate && fb.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(' + (-dir * 6) + 'px)' }, { transform: 'translateX(0)' }], { duration: 260 }); }
bPrev.addEventListener('click', e => { e.preventDefault(); flip(-1); });
bNext.addEventListener('click', e => { e.preventDefault(); flip(1); });
/* touch / mouse on the book: horizontal drag turns the page (follows the finger), vertical drag still walks the room, tap = edge turn or zoom */
let pd = null;
fb.addEventListener('pointerdown', e => { if (fl && !pd) return; if (e.pointerType === 'mouse' && e.button !== 0) return; const r = fb.getBoundingClientRect(); pd = { id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, t0: performance.now(), mode: null, w: r.width, r, lt: performance.now(), v: 0 }; try { fb.setPointerCapture(e.pointerId); } catch(_){} });
fb.addEventListener('pointermove', e => { if (!pd || e.pointerId !== pd.id) return; const dx = e.clientX - pd.x0, dy = e.clientY - pd.y0; const now = performance.now();
  if (!pd.mode && Math.hypot(dx, dy) > 8){ if (Math.abs(dx) > Math.abs(dy) * 1.1){ pd.mode = begin(dx < 0 ? 1 : -1) ? 'flip' : 'none'; if (pd.mode === 'none') nudge(dx < 0 ? 1 : -1); } else pd.mode = flat ? 'none' : 'walk'; }
  if (pd.mode === 'flip' && fl){ const pr = Math.min(1, Math.max(0, (fl.dir > 0 ? -dx : dx) / (pd.w * .95))); fl.a = fl.dir > 0 ? -180 * pr : -180 * (1 - pr); paint(fl.a); pd.v = ((fl.dir > 0 ? -1 : 1) * (e.clientX - pd.x)) / Math.max(1, now - pd.lt); }
  else if (pd.mode === 'walk'){ const d = pd.y - e.clientY; push(d * 3.2); pd.v = d / Math.max(1, now - pd.lt); }
  pd.x = e.clientX; pd.y = e.clientY; pd.lt = now; });
function pend(e, cancel){ if (!pd || (e && e.pointerId !== pd.id)) return; const g = pd; pd = null; const dist = Math.hypot(g.x - g.x0, g.y - g.y0), dur = performance.now() - g.t0;
  if (g.mode === 'flip' && fl){ const pr = fl.dir > 0 ? -fl.a / 180 : 1 + fl.a / 180; const go = !cancel && (pr > .38 || g.v > .45); animTo(go ? (fl.dir > 0 ? -180 : 0) : (fl.dir > 0 ? 0 : -180), 520, () => finish(go)); return; }
  if (g.mode === 'walk'){ if (performance.now() - g.lt < 90) push(Math.max(-900, Math.min(900, g.v * 380))); return; }
  if (!cancel && !g.mode && dist < 8 && dur < 450 && !fl){ const rx = (g.x0 - g.r.left) / g.r.width;
    if (!flat && Math.abs(c - LOOK) > 300){ goStop(LOOK); return; }
    if (rx > .74) flip(1); else if (rx < .26) flip(-1); else openLB(idx); } }
fb.addEventListener('pointerup', e => pend(e, false));
fb.addEventListener('pointercancel', e => pend(e, true));
fb.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); e.stopPropagation(); openLB(idx); } });
showStatic();
/* ---------- page zoom (tap the page; X, Esc or back closes) ---------- */
const lb = D.getElementById('bklb'), lbImg = lb.querySelector('img'), lbX = lb.querySelector('.lb-x'), lbS = lb.querySelector('.bk-lbs');
let lbPushed = false, lbT = 0;
function openLB(i){ lbT = performance.now(); lbImg.src = PAGES[i]; lbImg.alt = 'Page: ' + PAGE_ALT[i]; lb.classList.remove('z2'); lb.hidden = false; void lb.offsetWidth; lb.classList.add('on'); lbOpen = true; lbS.scrollTop = 0;
  try { history.pushState({ room: 'book', lb: 1 }, '', location.hash || '#book'); lbPushed = true; } catch(e){ lbPushed = false; }
  setTimeout(() => lbX.focus({ preventScroll: true }), 30); }
function hideLB(){ if (!lbOpen) return; lbOpen = false; lb.classList.remove('on'); setTimeout(() => { if (!lbOpen){ lb.hidden = true; lbImg.removeAttribute('src'); } }, reduced ? 0 : 230); fb.focus({ preventScroll: true }); }
function closeLB(){ if (!lbOpen) return; if (lbPushed){ lbPushed = false; hideLB(); history.back(); } else hideLB(); }
lbX.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); closeLB(); });
lbImg.addEventListener('click', e => { e.stopPropagation(); if (performance.now() - lbT < 450) return; const r = lbImg.getBoundingClientRect(), fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height; lb.classList.toggle('z2'); if (lb.classList.contains('z2')){ requestAnimationFrame(() => { lbS.scrollLeft = fx * lbS.scrollWidth - lbS.clientWidth / 2; lbS.scrollTop = fy * lbS.scrollHeight - lbS.clientHeight / 2; }); } });
lb.addEventListener('click', e => { if (performance.now() - lbT < 450) return; if (e.target === lb || e.target === lbS) closeLB(); });
lb.addEventListener('touchstart', e => e.stopPropagation(), { passive: true });
lb.addEventListener('touchmove', e => e.stopPropagation(), { passive: true });
W.addEventListener('popstate', () => { if (lbOpen){ lbPushed = false; hideLB(); } }, true);
new MutationObserver(() => { if (!room.classList.contains('open') && lbOpen){ lbPushed = false; hideLB(); } }).observe(room, { attributes: true, attributeFilter: ['class'] });
/* ---------- open / close ---------- */
let loaded = false;
function loadImgs(){ if (loaded) return; loaded = true; room.querySelectorAll('img[data-src]').forEach(im => { im.src = im.dataset.src; im.removeAttribute('data-src'); }); setImg(curImg, idx); }
function start(){ loadImgs(); size(); if (flat){ loadPages(); return; } if (running) return; running = true; c = t = 0; moved = false; hint && hint.classList.remove('gone'); render(true); last = performance.now(); requestAnimationFrame(tick); }
function stop(){ running = false; }
new MutationObserver(() => { if (room.classList.contains('open')) start(); else stop(); }).observe(room, { attributes: true, attributeFilter: ['class'] });
curImg.removeAttribute('src');
size(); if (room.classList.contains('open')) start(); else render(true);
W.PGBook = { state: () => ({ c, t, stops, MAX, lbOpen, page: idx, flipping: !!fl }), go: z => { t = z; lastIn = performance.now(); }, stop: i => goStop(stops[i]), flip };
}
