/* About room: a paper-white sky you fly INTO (CSS 3D layers, inner scroll). Original drawings.
   Character: composed from Open Peeps by Pablo Stanley (openpeeps.com) - CC0 1.0 public domain (pose "One Leg Up", hair "Short Messy", face "Smile").
   Clouds, birds, wind, bags and doodles: drawn in code for this site. */
import ICONS from './assets/icons.js';
const W = window, D = document;
const room = D.getElementById('about'), sky = D.getElementById('sky'), cam = D.getElementById('skycam');
if (room && sky && cam) {
const plane = D.getElementById('skyplane'), hint = D.getElementById('skyhint'), prog = room.querySelector('.sky-prog .pfg'), windCv = D.getElementById('skywind');
const INK = '#1c1c20', CLOUD = '#8f8f97';
function rnd(seed){ let s = (seed * 9973 + 7) % 2147483647; return () => ((s = s * 16807 % 2147483647) - 1) / 2147483646; }
const f = n => Math.round(n * 10) / 10;
const LOWEND = (navigator.hardwareConcurrency || 4) <= 4;

/* ---------- volumetric pencil clouds (canvas): clustered soft spheres, union pencil outline, grey belly shading, hatch ---------- */
function puffsFor(kind, w, h, r){
  const P = [];
  if (kind === 'card'){
    const R = Math.min(w, h) * .1, m = R * 1.5, x0 = m, y0 = m, x1 = w - m, y1 = h - m;
    const edge = (ax, ay, bx, by, top) => { const L = Math.hypot(bx - ax, by - ay), n = Math.max(2, Math.round(L / (R * 1.25)));
      for (let i = 0; i < n; i++){ const t = (i + .5) / n, rr = R * (top ? .95 + r() * .5 : .72 + r() * .3); P.push([ax + (bx - ax) * t + (r() - .5) * R * .3, ay + (by - ay) * t + (r() - .5) * R * .25, rr]); } };
    edge(x0, y0, x1, y0, 1); edge(x1, y0, x1, y1, 0); edge(x1, y1, x0, y1, 0); edge(x0, y1, x0, y0, 0);
    [[x0, y0, 1.15], [x1, y0, 1.05], [x1, y1, .85], [x0, y1, .85]].forEach(([x, y, k]) => P.push([x, y, R * k]));
    return { P, core: [x0 - R * .2, y0 - R * .1, x1 - x0 + R * .4, y1 - y0 + R * .2, R * .8] };
  }
  // cumulus: flat-ish belly row + bigger domes on top
  const base = h * .8, n = Math.max(3, Math.round(w / (h * .42)));
  for (let i = 0; i < n; i++){ const t = (i + .5) / n, rr = h * (.2 + r() * .08) * (1 - Math.abs(t - .5) * .5); P.push([w * (.1 + t * .8), base - rr * .62, rr]); }
  const m = kind === 'front' ? 2 : Math.max(2, Math.round(n * .6));
  for (let i = 0; i < m; i++){ const t = m === 1 ? .5 : i / (m - 1), rr = h * (.27 + r() * .12) * (1 - Math.abs(t - .5) * .55); P.push([w * (.26 + t * .48) + (r() - .5) * w * .05, base - h * .3 - rr * .45 + (r() - .5) * h * .05, rr]); }
  if (kind !== 'front'){ const rr = h * (.3 + r() * .06); P.push([w * (.42 + r() * .16), base - h * .42 - rr * .35, rr]); }
  return { P, core: null };
}
function wobCircle(ctx, x, y, rr, r, amp){ const n = 22, ph = r() * 6; ctx.moveTo(x + rr, y);
  for (let i = 1; i <= n; i++){ const a = i / n * Math.PI * 2, k = 1 + Math.sin(a * 3 + ph) * amp + (r() - .5) * amp * .6; ctx.lineTo(x + Math.cos(a) * rr * k, y + Math.sin(a) * rr * k); } ctx.closePath(); }
function drawCloud(cv){
  const kind = cv.dataset.kind || 'puff', seed = +cv.dataset.cloud || 5;
  const cw = cv.offsetWidth, ch = cv.offsetHeight; if (!cw || !ch) return false;
  if (cv._w && Math.abs(cv._w - cw) < 12 && Math.abs(cv._h - ch) < 12) return true;
  cv._w = cw; cv._h = ch;
  const s = Math.min(2, W.devicePixelRatio || 1) * (kind === 'card' ? (LOWEND ? .8 : 1) : (LOWEND ? .7 : .85));
  cv.width = Math.round(cw * s); cv.height = Math.round(ch * s);
  const ctx = cv.getContext('2d'); ctx.setTransform(s, 0, 0, s, 0, 0); ctx.clearRect(0, 0, cw, ch);
  const r = rnd(seed), { P, core } = puffsFor(kind, cw, ch, r);
  const lw = Math.max(2.2, Math.min(cw, ch) * (kind === 'card' ? .008 : .016));
  // soft ground shadow (grey, blurred by shadow) under the belly
  ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.shadowColor = 'rgba(120,120,135,.22)'; ctx.shadowBlur = lw * 6; ctx.shadowOffsetY = lw * 2.5;
  ctx.beginPath(); P.forEach(([x, y, rr]) => { ctx.moveTo(x + rr, y); ctx.arc(x, y, rr, 0, Math.PI * 2); }); if (core) ctx.roundRect ? ctx.roundRect(...core) : ctx.rect(core[0], core[1], core[2], core[3]);
  ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore();
  // 1) pencil outline: every puff stroked (two wobbly passes) — the fills below hide the inner half, leaving the union outline
  ctx.lineJoin = 'round'; ctx.strokeStyle = CLOUD;
  ctx.lineWidth = lw * 2; ctx.beginPath(); P.forEach(([x, y, rr]) => wobCircle(ctx, x, y, rr, r, .012)); if (core){ ctx.roundRect ? ctx.roundRect(...core) : ctx.rect(core[0], core[1], core[2], core[3]); } ctx.stroke();
  ctx.globalAlpha = .45; ctx.lineWidth = lw * 1.2; ctx.beginPath(); P.forEach(([x, y, rr]) => wobCircle(ctx, x + (r() - .5) * lw * 1.5, y + (r() - .5) * lw, rr * 1.025, r, .02)); ctx.stroke(); ctx.globalAlpha = 1;
  // 2) union filled white, then each puff gets a soft grey under-side (no hard rims) so the cluster reads as volume
  ctx.fillStyle = '#fff'; ctx.beginPath(); P.forEach(([x, y, rr]) => { ctx.moveTo(x + rr, y); ctx.arc(x, y, rr, 0, Math.PI * 2); }); ctx.fill();
  for (const [x, y, rr] of P){ const g = ctx.createRadialGradient(x - rr * .5, y - rr * .6, rr * .25, x - rr * .32, y - rr * .42, rr * 1.5);
    g.addColorStop(0, 'rgba(150,150,165,0)'); g.addColorStop(.6, 'rgba(150,150,165,0)'); g.addColorStop(.86, 'rgba(150,150,165,.07)'); g.addColorStop(1, 'rgba(150,150,165,.14)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rr, 0, Math.PI * 2); ctx.fill(); }
  // 3) clean white core for text cards (soft edge)
  if (core){ const [cx0, cy0, cw0, ch0, cr] = core, i0 = cr * .55, OFF = 20000; ctx.save(); ctx.fillStyle = '#fff'; ctx.shadowColor = '#fff'; ctx.shadowBlur = cr * .9; ctx.shadowOffsetX = OFF * s;
    for (let k = 0; k < 3; k++){ ctx.beginPath(); ctx.roundRect ? ctx.roundRect(cx0 + i0 - OFF, cy0 + i0, cw0 - i0 * 2, ch0 - i0 * 2, cr) : ctx.rect(cx0 + i0 - OFF, cy0 + i0, cw0 - i0 * 2, ch0 - i0 * 2); ctx.fill(); }
    ctx.restore(); }
  // 4) belly shading + pencil hatch, clipped to the cloud
  ctx.save(); ctx.beginPath(); P.forEach(([x, y, rr]) => { ctx.moveTo(x + rr, y); ctx.arc(x, y, rr, 0, Math.PI * 2); }); ctx.clip();
  if (!core){ const g = ctx.createLinearGradient(0, ch * .35, 0, ch * .92); g.addColorStop(0, 'rgba(160,160,172,0)'); g.addColorStop(1, 'rgba(150,150,165,.32)'); ctx.fillStyle = g; ctx.fillRect(0, 0, cw, ch); }
  if (!core){ ctx.strokeStyle = CLOUD; ctx.lineCap = 'round'; ctx.lineWidth = Math.max(1, lw * .5); ctx.globalAlpha = .26; ctx.beginPath();
  const hy = core ? ch - core[4] * 1.1 : ch * .76, hn = Math.round(cw / (core ? 40 : 22));
  for (let k = 0; k < hn; k++){ const x = cw * (.08 + .84 * r()), y = hy + r() * (core ? core[4] * .7 : ch * .1), L = (core ? 8 : 6) + r() * (core ? 12 : 9); ctx.moveTo(x, y); ctx.lineTo(x + L * .7, y - L * .7); }
  ctx.stroke(); ctx.globalAlpha = 1; }
  // inner puff seams: lower arcs of the upper puffs (pencil, faint)
  if (!core){ ctx.lineWidth = Math.max(1, lw * .6); ctx.globalAlpha = .4; ctx.beginPath(); P.forEach(([x, y, rr], i) => { if (y < ch * .62 && i % 2 === 0){ ctx.moveTo(x + Math.cos(2.0) * rr * .96, y + Math.sin(2.0) * rr * .96); ctx.arc(x, y, rr * .96, 2.0, 2.9); } }); ctx.stroke(); ctx.globalAlpha = 1; }
  ctx.restore();
  return true;
}
function drawAllClouds(){ room.querySelectorAll('canvas.cloud-bg').forEach(drawCloud); }

/* ---------- the sky's population: 3D cloud banks (2-3 puffs at different depths), birds, sparkles ---------- */
const R0 = rnd(4242), DEEP = 10400, decoEls = [];
function addDeco(cls, html, x, y, z, w, extra){ const el = D.createElement('div'); el.className = 'sl sl-deco ' + cls; el.dataset.z = z; el.dataset.xf = x; el.dataset.yf = y; if (w) el.style.width = w + 'px';
  if (extra) for (const k in extra) el.dataset[k] = extra[k]; el.innerHTML = html; el.setAttribute('aria-hidden', 'true'); cam.appendChild(el); decoEls.push(el); return el; }
let seed = 100;
for (let z = -380; z > -DEEP; z -= (LOWEND ? 520 : 400) + R0() * 160){
  const side = (Math.round(z / 37) % 2 === 0) ? -1 : 1, x = side * (.8 + R0() * .4), y = (R0() - .55) * 1.2, w = 200 + R0() * 170, dx = (R0() - .5) * 14;
  const n = R0() < .5 ? 2 : 1;
  for (let k = 0; k < n; k++) addDeco('sl-cloud', '<canvas class="cloud-bg" data-cloud="' + (seed++) + '" data-kind="puff"></canvas>', x + side * k * .18, y + (k ? .08 : 0), Math.round(z - k * 140), Math.round(w * (k ? .7 : 1)), { dx });
}
// low cloud sea under the hero + a big far bank, so the first view sits *inside* the sky
[[-.66, .47, -150, 300], [.62, .52, -300, 320], [-.3, -.62, -900, 300], [.38, -.66, -700, 240]].forEach(([x, y, z, w]) => addDeco('sl-cloud', '<canvas class="cloud-bg" data-cloud="' + (seed++) + '" data-kind="puff"></canvas>', x, y, z, w, { dx: (R0() - .5) * 10 }));
// flapping pencil birds (SMIL wing flap works on iOS Safari + Chrome)
const UP = 'M2 12 Q9 1 17 11 Q25 1 32 12', DN = 'M2 7 Q9 16 17 11 Q25 16 32 7';
const bird = (sc, d) => '<g transform="scale(' + sc + ')"><path d="' + UP + '"><animate attributeName="d" dur="' + (0.55 + d) + 's" repeatCount="indefinite" values="' + UP + ';' + DN + ';' + UP + '" begin="-' + d + 's"/></path></g>';
const flock = n => { let s = ''; for (let i = 0; i < n; i++){ s += '<g transform="translate(' + (i * 40 + (i % 2) * 8) + ' ' + ((i % 2) * 18 + i * 4) + ')">' + bird(.75 + (i % 3) * .15, i * .17) + '</g>'; } return s; };
[[.02, -.43, -200, 3], [.3, -.26, -1300, 2], [-.4, -.3, -2700, 3], [.2, -.4, -4200, 1], [-.25, -.22, -5800, 2], [.35, -.35, -7300, 3], [-.3, -.38, -8900, 2]].forEach(([x, y, z, n], i) =>
  addDeco('sl-bird', '<svg viewBox="0 0 ' + (n * 42 + 10) + ' 40" fill="none" stroke="#4a4a52" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">' + flock(n) + '</svg>', x, y, z, n * 60, { dx: (i % 2 ? -1 : 1) * (26 + i * 3), bird: 1 }));
// sketched sparkles / swirls floating between stops
const SPK = ['<path d="M20 4 L23 16 L36 20 L23 24 L20 36 L17 24 L4 20 L17 16 Z" fill="#fff"/>', '<path d="M8 30 C2 18 14 6 24 12 C32 17 26 28 19 24 C14 21 18 15 22 17"/>', '<path d="M20 6 v28 M6 20 h28 M10 10 l20 20 M30 10 l-20 20" stroke-width="1.6"/>'];
for (let z = -900, i = 0; z > -DEEP; z -= 760, i++){ const x = (i % 2 ? 1 : -1) * (.3 + R0() * .3), y = (R0() - .5) * .9;
  addDeco('sl-spark', '<svg viewBox="0 0 40 40" fill="none" stroke="#8f8f97" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' + SPK[i % 3] + '</svg>', x, y, z, 26 + R0() * 14); }

/* little doodles on each card (stars, swirls, a sparkle) */
const DOOD = ['<path d="M12 2 L14.6 9 L22 9.6 L16.2 14 L18.4 21.4 L12 17.2 L5.6 21.4 L7.8 14 L2 9.6 L9.4 9 Z"/>', '<path d="M4 18 C2 8 14 2 19 8 C23 13 16 19 12 15 C9 12 13 9 15 11"/>', '<path d="M12 2 v20 M2 12 h20" /><circle cx="12" cy="12" r="2.4" fill="#8f8f97" stroke="none"/>', '<path d="M2 14 q5 -8 10 0 t10 0" />'];
room.querySelectorAll('.cl-card').forEach((card, ci) => { const pos = [['-2%', '8%', -12], ['92%', '4%', 14], ['88%', '86%', -6]];
  pos.forEach(([l, t, rot], k) => { const s = D.createElement('span'); s.className = 'dood'; s.style.left = l; s.style.top = t; s.style.transform = 'rotate(' + rot + 'deg)';
    s.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="' + (k === 0 ? '#e8b92f' : '#8f8f97') + '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + DOOD[(ci + k) % DOOD.length] + '</svg>'; s.setAttribute('aria-hidden', 'true'); card.appendChild(s); }); });

/* skill stickers: real logo colours only here */
room.querySelectorAll('.stickers li').forEach((li, i) => { const k = li.dataset.icon, ic = k && ICONS[k]; const tilt = ((i * 37) % 11 - 5) * 1.3; li.style.setProperty('--t', tilt + 'deg');
  let badge; if (ic) badge = '<svg viewBox="0 0 24 24"><path fill="#' + (ic.hex === '000000' ? '1c1c20' : ic.hex) + '" d="' + ic.d + '"/></svg>';
  else badge = '<b style="color:' + (li.dataset.col || INK) + '">' + li.dataset.txt + '</b>';
  li.innerHTML = '<span class="badge">' + badge + '</span><span class="lbl">' + li.innerHTML + '</span>'; });

const layers = Array.from(cam.querySelectorAll('.sl')).map(el => ({ el, z: +el.dataset.z, xf: +(el.dataset.xf || 0), yf: +(el.dataset.yf || 0), dx: +(el.dataset.dx || 0), bird: !!el.dataset.bird, stop: el.hasAttribute('data-stop'), card: el.classList.contains('sl-card') || el.classList.contains('sl-end'), op: -1, vis: null }));
layers.sort((a, b) => a.z - b.z); layers.forEach(l => cam.appendChild(l.el)); // far first: DOM order == depth order
const STOPOFF = 110; const stops = layers.filter(l => l.stop).map(l => l.z === 0 ? 0 : -l.z - STOPOFF).sort((a, b) => a - b);
const MAX = stops[stops.length - 1];
const reduced = W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches;
const flat = reduced || /[?&]flatsky\b/.test(location.search);
if (flat) room.classList.add('sky-flat');
let c = 0, t = 0, vel = 0, last = 0, lastIn = 0, running = false, moved = false, VW = 0, VH = 0, T0 = performance.now();
function size(){ VW = innerWidth; VH = innerHeight; if (windCv){ const s = LOWEND ? 1 : Math.min(1.5, W.devicePixelRatio || 1); windCv.width = Math.round(VW * s); windCv.height = Math.round(VH * s); windCv._s = s; } }
size();
let rzT = 0; W.addEventListener('resize', () => { size(); render(true); clearTimeout(rzT); rzT = setTimeout(() => { if (room.classList.contains('open')) drawAllClouds(); }, 250); });
const wrap = (v, lo, hi) => { const r = hi - lo; return ((v - lo) % r + r) % r + lo; };
function render(force, now){
  const secs = ((now || performance.now()) - T0) / 1000;
  for (const l of layers){ const d = l.z + c; let op;
    const far = l.card ? 1480 : 1900; if (d > 560 || d < -far) op = 0; else op = Math.min(1, (d + far) / (l.card ? 520 : 650), l.card || l.z === 0 ? (560 - d) / 380 : (l.z > -600 ? (560 - d) / 380 : (120 - d) / 420));
    if (op <= 0.01){ if (l.vis !== false){ l.el.style.visibility = 'hidden'; l.vis = false; } continue; }
    if (l.vis !== true){ l.el.style.visibility = 'visible'; l.vis = true; }
    let x = l.xf * VW, y = l.yf * VH, extra = '';
    if (l.dx){ const span = l.bird ? (VW * .5 + 90) * (900 - d) / 900 : VW * 1.25; x = wrap(x + l.dx * secs, -span, span); }
    if (l.bird) y += Math.sin(secs * 1.3 + l.z) * 10;
    if (l.card){ const k = Math.max(0, Math.min(1, -d / 1600)); extra = ' rotateX(' + f(k * 22) + 'deg) rotateZ(' + f(Math.sin(l.z) * 3 * k) + 'deg)'; }
    l.el.style.transform = 'translate3d(' + f(x) + 'px,' + f(y) + 'px,' + f(d) + 'px) translate(-50%,-50%)' + extra;
    if (force || Math.abs(op - l.op) > .01){ l.el.style.opacity = op.toFixed(3); l.op = op; } }
  if (prog){ if (!prog._L){ try { prog._L = prog.getTotalLength(); } catch(e){ prog._L = 1000; } prog.style.strokeDasharray = prog._L; } prog.style.strokeDashoffset = prog._L * (1 - c / MAX); }
}
/* ---------- wind: pencil speed lines + little curls rushing past, stronger the faster you scroll ---------- */
const wctx = windCv && windCv.getContext('2d'); const parts = []; let wDirty = false, spawnAcc = 0;
function wind(dt, now){
  if (!wctx) return; const s = windCv._s || 1, inten = Math.min(1, Math.max(0, (Math.abs(vel) - 60) / 1400)), dir = vel >= 0 ? 1 : -1;
  spawnAcc += Math.min(1, inten * 1.6) * (LOWEND ? 40 : 65) * dt;
  const cx = VW * .5, cy = VH * .46, R = Math.hypot(VW, VH) * .5;
  while (spawnAcc >= 1 && parts.length < 70){ spawnAcc -= 1; const a = Math.random() * Math.PI * 2, curl = Math.random() < .14;
    parts.push({ a, r: R * (dir > 0 ? .12 + Math.random() * .45 : .75 + Math.random() * .4), life: 0, max: .5 + Math.random() * .45, len: 30 + inten * 110 + Math.random() * 40, w: .9 + Math.random() * 1.4, bend: (Math.random() - .5) * .25, curl, dir }); }
  if (!parts.length){ if (wDirty){ wctx.setTransform(1, 0, 0, 1, 0, 0); wctx.clearRect(0, 0, windCv.width, windCv.height); wDirty = false; } return; }
  wctx.setTransform(s, 0, 0, s, 0, 0); wctx.clearRect(0, 0, VW, VH); wDirty = true; wctx.lineCap = 'round'; wctx.strokeStyle = '#7d7d86';
  for (let i = parts.length - 1; i >= 0; i--){ const p = parts[i]; p.life += dt; if (p.life > p.max || p.r > R * 1.25 || p.r < 6){ parts.splice(i, 1); continue; }
    const sp = (240 + Math.abs(vel) * .55 + p.r * 1.6) * p.dir; p.r += sp * dt;
    const fade = Math.sin(Math.PI * p.life / p.max), ca = Math.cos(p.a), sa = Math.sin(p.a);
    wctx.globalAlpha = .8 * fade * (.4 + inten * .6); wctx.lineWidth = p.w * 1.3;
    const r1 = p.r, r2 = p.r + p.len * (.5 + p.r / R) * p.dir, x1 = cx + ca * r1, y1 = cy + sa * r1, x2 = cx + ca * r2, y2 = cy + sa * r2;
    wctx.beginPath();
    if (p.curl){ const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, rr = 7 + p.len * .08; wctx.moveTo(x1, y1); wctx.quadraticCurveTo(mx - sa * rr, my + ca * rr, mx, my); wctx.arc(mx + ca * rr * .2, my + sa * rr * .2, rr * .6, p.a + Math.PI, p.a + Math.PI * 2.7); }
    else { const bx = (x1 + x2) / 2 - sa * p.len * p.bend, by = (y1 + y2) / 2 + ca * p.len * p.bend; wctx.moveTo(x1, y1); wctx.quadraticCurveTo(bx, by, x2, y2); }
    wctx.stroke(); }
  wctx.globalAlpha = 1;
}
function tick(now){
  if (!running) return; const dt = Math.min(.05, (now - last) / 1000 || .016); last = now;
  if (now - lastIn > 380){ let best = null, bd = 1e9; for (const s of stops){ const dd = Math.abs(s - t); if (dd < bd){ bd = dd; best = s; } } if (best !== null && bd < 900 && bd > .5) t += (best - t) * Math.min(1, dt * 3.2); }
  const prev = c; c += (t - c) * Math.min(1, dt * 4.2); if (Math.abs(t - c) < .3) c = t; vel += ((c - prev) / Math.max(dt, .001) - vel) * .15;
  render(false, now); wind(dt, now);
  if (plane){ const tilt = Math.max(-14, Math.min(14, -vel * .012)), bob = Math.sin(now / 520) * 6, sway = Math.sin(now / 1300) * 10; plane.style.transform = 'translate(calc(-50% + ' + f(sway) + 'px),' + f(bob) + 'px) rotate(' + f(tilt + sway * .3) + 'deg) scale(' + f(1 - Math.min(.12, Math.abs(vel) * .00008)) + ')'; plane.classList.toggle('fast', Math.abs(vel) > 120); }
  requestAnimationFrame(tick);
}
function push(dz){ t = Math.max(0, Math.min(MAX, t + dz)); lastIn = performance.now(); if (!moved && Math.abs(dz) > 2){ moved = true; hint && hint.classList.add('gone'); } }
function stepStop(dir){ const cur = t; let n = dir > 0 ? stops.find(s => s > cur + 30) : [...stops].reverse().find(s => s < cur - 30); if (n === undefined) n = dir > 0 ? MAX : 0; t = n; lastIn = performance.now() - 300; if (!moved){ moved = true; hint && hint.classList.add('gone'); } }
const isOpen = () => room.classList.contains('open') && !flat;
// capture-phase listeners on window run before the corridor's own handlers; we own input while the sky is open
W.addEventListener('wheel', e => { if (!isOpen() || e.ctrlKey) return; e.stopImmediatePropagation(); e.preventDefault(); let d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY; if (e.deltaMode === 1) d *= 32; else if (e.deltaMode === 2) d *= VH; push(d * 1.5); }, { capture: true, passive: false });
let tch = null;
W.addEventListener('touchstart', e => { if (!isOpen() || !room.contains(e.target)) return; if (e.target.closest('.room-bar')) return; e.stopPropagation(); const p = e.touches[0]; tch = { x: p.clientX, y: p.clientY, lt: performance.now(), v: 0 }; }, { capture: true, passive: true });
W.addEventListener('touchmove', e => { if (!tch || !isOpen()) return; e.stopPropagation(); e.preventDefault(); const p = e.touches[0]; const dy = tch.y - p.clientY, dx = tch.x - p.clientX; const d = Math.abs(dy) >= Math.abs(dx) ? dy : dx * .8; tch.x = p.clientX; tch.y = p.clientY; const now = performance.now(); tch.v = d / Math.max(1, now - tch.lt); tch.lt = now; push(d * 3.2); }, { capture: true, passive: false });
W.addEventListener('touchend', e => { if (!tch) return; e.stopPropagation(); if (performance.now() - tch.lt < 90) push(Math.max(-900, Math.min(900, tch.v * 380))); tch = null; }, { capture: true, passive: true });
// mouse drag (desktop)
let md = null;
sky.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' || !isOpen() || e.target.closest('a,button')) return; md = { y: e.clientY }; });
W.addEventListener('pointermove', e => { if (!md) return; const d = md.y - e.clientY; md.y = e.clientY; push(d * 3); });
W.addEventListener('pointerup', () => { md = null; });
W.addEventListener('keydown', e => { if (!isOpen()) return; const k = e.key; if (k === 'ArrowDown' || k === 'ArrowRight' || k === 'PageDown' || k === ' '){ e.preventDefault(); e.stopImmediatePropagation(); stepStop(1); } else if (k === 'ArrowUp' || k === 'ArrowLeft' || k === 'PageUp'){ e.preventDefault(); e.stopImmediatePropagation(); stepStop(-1); } else if (k === 'Home'){ e.preventDefault(); e.stopImmediatePropagation(); t = 0; } else if (k === 'End'){ e.preventDefault(); e.stopImmediatePropagation(); t = MAX; } }, true);
// keyboard focus on a link deep in the sky flies you to it
room.addEventListener('focusin', e => { if (!isOpen()) return; const sl = e.target.closest && e.target.closest('.sl[data-stop]'); if (sl){ const z = +sl.dataset.z; t = z === 0 ? 0 : -z - STOPOFF; lastIn = performance.now() - 300; } });
function start(){ T0 = performance.now(); drawAllClouds(); requestAnimationFrame(drawAllClouds); if (running || flat) return; running = true; c = t = 0; vel = 0; moved = false; hint && hint.classList.remove('gone'); parts.length = 0; render(true); last = performance.now(); requestAnimationFrame(tick); }
function stop(){ running = false; }
new MutationObserver(() => { if (room.classList.contains('open')) start(); else stop(); }).observe(room, { attributes: true, attributeFilter: ['class'] });
if (room.classList.contains('open')) start(); else render(true);
W.PGSky = { state: () => ({ c, t, stops, MAX }), go: z => { t = z; lastIn = performance.now(); } };
}
