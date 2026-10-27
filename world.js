/* Prajwal's sketchbook corridor: original pencil-drawn 3D hallway (three.js, vendored). */
import * as THREE from './vendor/three.module.min.js';
import ICONDATA from './assets/icons.js';
const W = window, D = document;
const api = W.PGWorld = { active: false, ready: null };
function glOK(){ try{ const c=D.createElement('canvas'); return !!(c.getContext('webgl2')||c.getContext('webgl')); }catch(e){ return false; } }
if (!glOK() || /[?&]flat\b/.test(location.search)) { api.ready = Promise.resolve(false); }
else { api.ready = init().catch(err => { console.warn('corridor fallback:', err && err.message); D.documentElement.classList.remove('world'); return false; }); }

/* ---------------- pencil drawing kit (freehand, never ruler-straight) ---------------- */
function rnd(seed){ let s=(seed|0)%2147483647; if(s<=0)s+=2147483646; return ()=>((s=s*16807%2147483647)-1)/2147483646; }
let R = rnd(42);
const INK='#1c1c20';
function wobLine(c,x1,y1,x2,y2,o={}){
  const w=o.w||1.6, a=o.a==null?.9:o.a, amp=o.amp==null?1.4:o.amp, passes=o.passes||2, col=o.col||INK;
  const len=Math.hypot(x2-x1,y2-y1)||1, nx=-(y2-y1)/len, ny=(x2-x1)/len, ux=(x2-x1)/len, uy=(y2-y1)/len;
  for(let p=0;p<passes;p++){
    const ph1=R()*6.28, ph2=R()*6.28, f1=(1.5+R()*2)*Math.PI*2/Math.max(len,40), f2=(5+R()*5)*Math.PI*2/Math.max(len,40);
    const ov1=(R()*.8)*Math.min(6,len*.04)*(o.over===false?0:1), ov2=(R()*.8)*Math.min(8,len*.05)*(o.over===false?0:1);
    const off=(p? (R()-.5)*amp*1.6 : 0), steps=Math.max(4,Math.round(len/10));
    c.beginPath(); c.lineWidth=p? w*.6 : w; c.globalAlpha=p? a*.45 : a; c.strokeStyle=col; c.lineCap='round'; c.lineJoin='round';
    for(let i=0;i<=steps;i++){
      const t=i/steps, d=-ov1+t*(len+ov1+ov2), wob=Math.sin(d*f1+ph1)*amp+Math.sin(d*f2+ph2)*amp*.35+off;
      const x=x1+ux*d+nx*wob, y=y1+uy*d+ny*wob; i?c.lineTo(x,y):c.moveTo(x,y);
    }
    c.stroke();
  }
  c.globalAlpha=1;
}
function wobPoly(c,pts,o){ for(let i=0;i<pts.length-1;i++) wobLine(c,pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1],o); }
function wobRect(c,x,y,w,h,o){ const j=()=>(R()-.5)*(o&&o.tilt||3); wobPoly(c,[[x+j(),y+j()],[x+w+j(),y+j()],[x+w+j(),y+h+j()],[x+j(),y+h+j()],[x+j(),y+j()]],o); }
function wobCircle(c,cx,cy,r,o={}){ const n=Math.max(18,r*.8|0), a0=R()*6.28, turns=1.12; for(let p=0;p<(o.passes||2);p++){ c.beginPath(); c.lineWidth=p?(o.w||1.6)*.6:(o.w||1.6); c.globalAlpha=p?.45:(o.a||.9); c.strokeStyle=o.col||INK; for(let i=0;i<=n*turns;i++){ const a=a0+i/n*6.283, k=1+(R()-.5)*.06; const x=cx+Math.cos(a)*r*k, y=cy+Math.sin(a)*r*(o.ry?o.ry/r:1)*k; i?c.lineTo(x,y):c.moveTo(x,y);} c.stroke(); } c.globalAlpha=1; }
function hatch(c,x,y,w,h,o={}){ const gap=o.gap||7, ang=o.ang==null?-0.9:o.ang; c.save(); c.beginPath(); c.rect(x,y,w,h); c.clip(); const L=w+h; for(let i=-L;i<L;i+=gap*(0.7+R()*.6)){ const x1=x+i, y1=y+h, x2=x1+Math.cos(ang)*-L, y2=y1+Math.sin(ang)*L; wobLine(c,x1,y1,x1+L*Math.cos(ang+Math.PI/2+1.57) ,y1, {}); } c.restore(); }
function hatchArea(c,x,y,w,h,o={}){ const gap=o.gap||8; c.save(); c.beginPath(); c.rect(x,y,w,h); c.clip(); for(let i=-h;i<w;i+=gap*(0.75+R()*.5)) wobLine(c,x+i,y+h,x+i+h*.8,y,{w:o.w||1,a:o.a||.35,amp:.8,passes:1}); c.restore(); }
function grain(c,w,h,n,a){ for(let i=0;i<n;i++){ c.globalAlpha=a*(0.3+R()*.7); c.fillStyle=INK; const x=R()*w,y=R()*h; c.fillRect(x,y,1+R()*1.4,1+R()*1.4);} c.globalAlpha=1; }
function canvas(w,h){ const c=D.createElement('canvas'); c.width=w; c.height=h; return [c,c.getContext('2d')]; }
let renderer;
function tex(c,rx=1,ry=1){ const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(rx,ry); t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy()); return t; }
function loadImg(src){ return new Promise(res=>{ const i=new Image(); i.onload=()=>res(i); i.onerror=()=>res(null); i.src=src; }); }
function svgImg(inner,size=200){ const s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="'+size+'" height="'+size+'"><g fill="none" stroke="#1c1c20" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">'+inner.replace(/class="red"/g,'stroke="#2f6fd6"').replace(/class="blue"/g,'stroke="#2f6fd6"').replace(/class="fillk"/g,'fill="#1c1c20"').replace(/class="pxr"/g,'fill="#1c1c20" stroke="none"').replace(/class="px"/g,'fill="#1c1c20" stroke="none"').replace(/class="hat"/g,'opacity=".3"')+'</g></svg>'; return loadImg('data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s)); }

/* ---------------- textures ---------------- */
function floorTex(){ const [c,x]=canvas(1024,1024); x.fillStyle='#fbfaf6'; x.fillRect(0,0,1024,1024); const cols=5, pw=1024/cols;
  for(let i=0;i<cols;i++){ const x0=i*pw; wobLine(x,x0,-20,x0,1044,{w:2.2,amp:1.2});
    let y=-R()*400; while(y<1024){ const nyy=y+300+R()*380; if(y>0) wobLine(x,x0,y,x0+pw,y+(R()-.5)*6,{w:1.8,amp:.8}); y=nyy; }
    const lines=6+(R()*4|0); for(let k=0;k<lines;k++){ const gx=x0+pw*(.08+.84*R()), ph=R()*6.28, amp=3+R()*7, fr=(1+(R()*2|0))*Math.PI*2/1024; x.beginPath(); x.lineWidth=.7+R()*.9; x.globalAlpha=.35+R()*.35; x.strokeStyle=INK; for(let yy=0;yy<=1024;yy+=8){ const xx=gx+Math.sin(yy*fr+ph)*amp+Math.sin(yy*fr*7+ph)*1.2; yy?x.lineTo(xx,yy):x.moveTo(xx,yy);} x.stroke(); }
    if(R()<.8){ const kx=x0+pw*(.3+R()*.4), ky=100+R()*800; for(let r=4;r<22;r+=5) wobCircle(x,kx,ky,r,{ry:r*1.9,w:.9,a:.5,passes:1}); }
  } x.globalAlpha=1; grain(x,1024,1024,2500,.12); return c; }
function wallTex(){ const [c,x]=canvas(1024,870); x.fillStyle='#f3f2ee'; x.fillRect(0,0,1024,870); grain(x,1024,870,5000,.10);
  for(let i=0;i<40;i++){ x.globalAlpha=.04; x.fillStyle=INK; x.fillRect(R()*1024,R()*870,1,40+R()*120); } x.globalAlpha=1;
  // skirting board + rail
  wobLine(x,-10,800,1034,800,{w:2,amp:1.2}); wobLine(x,-10,832,1034,832,{w:1.4,amp:1}); hatchArea(x,0,836,1024,34,{gap:9,a:.25});
  wobLine(x,-10,26,1034,26,{w:1.6,amp:1});
  for(let k=0;k<2;k++){ let px=150+R()*700, py=100+R()*500; const pts=[[px,py]]; for(let s=0;s<6;s++){ px+=20+R()*40; py+=(R()-.3)*40; pts.push([px,py]); } wobPoly(x,pts,{w:.9,a:.35,amp:.6,passes:1}); }
  return c; }
function ceilTex(){ const [c,x]=canvas(1024,1024); x.fillStyle='#f0efeb'; x.fillRect(0,0,1024,1024); grain(x,1024,1024,3000,.08);
  wobLine(x,0,-10,0,1034,{w:1.4}); wobLine(x,1024,-10,1024,1034,{w:1.4});
  for(let k=0;k<3;k++){ let px=100+R()*820, py=R()*1024; const pts=[[px,py]]; for(let s=0;s<10;s++){ px+=(R()-.5)*90; py+=30+R()*50; pts.push([px,py]); if(R()<.35){ wobPoly(x,[[px,py],[px+(R()-.5)*80,py+20+R()*40]],{w:.9,a:.5,passes:1}); } } wobPoly(x,pts,{w:1.3,a:.7,amp:.5}); }
  return c; }
function lightTex(){ const [c,x]=canvas(512,256); const g=x.createRadialGradient(256,128,10,256,128,250); g.addColorStop(0,'#ffffff'); g.addColorStop(1,'#f4f3ee'); x.fillStyle=g; x.fillRect(0,0,512,256); wobRect(x,14,14,484,228,{w:2.4}); wobRect(x,30,30,452,196,{w:1,a:.5}); return c; }
function arrowTex(flip){ const [c,x]=canvas(512,360); if(flip){ x.translate(512,0); x.scale(-1,1); } const pts=[]; for(let t=0;t<=1.0001;t+=.06){ pts.push([60+t*380, 250-Math.sin(t*Math.PI)*170 + t*40]); } wobPoly(x,pts,{w:6,amp:1.5}); const e=pts[pts.length-1], p=pts[pts.length-3]; const a=Math.atan2(e[1]-p[1],e[0]-p[0]); wobLine(x,e[0],e[1],e[0]-Math.cos(a-0.5)*70,e[1]-Math.sin(a-0.5)*70,{w:6}); wobLine(x,e[0],e[1],e[0]-Math.cos(a+0.5)*70,e[1]-Math.sin(a+0.5)*70,{w:6}); return c; }
function signTex(label,sub){ const [c,x]=canvas(1024,420); const by=40, bh=340; // wooden board
  x.fillStyle='#f7f3ea'; x.fillRect(30,by,964,bh); for(let k=0;k<9;k++){ const yy=by+20+k*36+R()*10; x.beginPath(); x.lineWidth=.8; x.globalAlpha=.3; x.strokeStyle=INK; for(let xx=40;xx<=990;xx+=12){ const v=yy+Math.sin(xx*.012+k)*4+Math.sin(xx*.05+k*3)*1.2; xx>40?x.lineTo(xx,v):x.moveTo(xx,v);} x.stroke(); } x.globalAlpha=1;
  wobRect(x,30,by,964,bh,{w:3.4,tilt:6}); wobRect(x,44,by+12,936,bh-24,{w:1.2,a:.5,tilt:5});
  [[70,by+40],[954,by+40],[70,by+bh-40],[954,by+bh-40]].forEach(p=>{ wobCircle(x,p[0],p[1],10,{w:2}); wobLine(x,p[0]-7,p[1]-3,p[0]+7,p[1]+3,{w:1.6,passes:1}); });
  // hatched block letters
  let fs=label.length>12?118:150; x.font='900 '+fs+'px Inter, system-ui, sans-serif'; while(x.measureText(label).width>840){ fs-=6; x.font='900 '+fs+'px Inter, system-ui, sans-serif'; }
  const [m,mx]=canvas(1024,420); mx.font=x.font; mx.textAlign='center'; mx.textBaseline='middle'; mx.fillStyle='#000'; mx.fillText(label,512,by+bh/2+6);
  const [h,hx]=canvas(1024,420); for(let i=-420;i<1024;i+=6.5){ hx.beginPath(); hx.lineWidth=2.2; hx.strokeStyle=INK; hx.moveTo(i,420); hx.lineTo(i+330,0); hx.stroke(); }
  hx.globalCompositeOperation='destination-in'; hx.drawImage(m,0,0); x.drawImage(h,0,0);
  x.textAlign='center'; x.textBaseline='middle'; x.lineWidth=3.2; x.strokeStyle=INK; x.lineJoin='round'; x.save(); x.translate(512,by+bh/2+6); x.rotate((R()-.5)*.03); x.translate(-512,-(by+bh/2+6)); x.strokeText(label,512+1.5,by+bh/2+7); x.globalAlpha=.5; x.lineWidth=1.4; x.strokeText(label,512-2,by+bh/2+4); x.restore(); x.globalAlpha=1;
  return c; }
async function doorTex(cfg){ const [c,x]=canvas(560,1100); // plank door leaf
  x.fillStyle='#f6f1e4'; x.fillRect(0,0,560,1100);
  const planks=5, pw=560/planks; for(let i=1;i<planks;i++) wobLine(x,i*pw+(R()-.5)*4,0,i*pw+(R()-.5)*4,1100,{w:2.2,amp:1.4});
  for(let i=0;i<planks;i++){ for(let k=0;k<4;k++){ const gx=i*pw+10+R()*(pw-20), ph=R()*6, amp=2+R()*5; x.beginPath(); x.lineWidth=.8; x.globalAlpha=.35; x.strokeStyle=INK; for(let yy=0;yy<=1100;yy+=10){ const xx=gx+Math.sin(yy*.006+ph)*amp; yy?x.lineTo(xx,yy):x.moveTo(xx,yy);} x.stroke(); } if(R()<.6){ const kx=i*pw+pw/2, ky=150+R()*800; wobCircle(x,kx,ky,6,{ry:14,w:1,passes:1,a:.5}); } } x.globalAlpha=1;
  // braces + hinges
  wobLine(x,10,170,550,175,{w:2.4}); wobLine(x,10,210,550,214,{w:1.6}); wobLine(x,10,880,550,884,{w:2.4}); wobLine(x,10,920,550,924,{w:1.6});
  [[0,150],[0,860]].forEach(p=>{ wobRect(x,p[0]+6,p[1],120,52,{w:2.4,tilt:3}); hatchArea(x,p[0]+8,p[1]+2,116,48,{gap:6,a:.45}); [[30,26],[95,26]].forEach(q=>wobCircle(x,p[0]+q[0],p[1]+q[1],5,{w:1.6,passes:1})); });
  // lever handle
  wobRect(x,462,520,48,150,{w:2,tilt:3}); hatchArea(x,464,522,44,146,{gap:6,a:.3}); wobCircle(x,486,640,6,{w:1.6,passes:1});
  wobRect(x,4,4,552,1092,{w:3,tilt:3});
  // taped preview sheets
  for(const s of cfg.sheets){ x.save(); x.translate(s.x,s.y); x.rotate(s.r); x.shadowColor='rgba(0,0,0,.18)'; x.shadowBlur=10; x.shadowOffsetY=4; x.fillStyle='#ffffff'; x.fillRect(-s.w/2,-s.h/2,s.w,s.h); x.shadowColor='transparent';
    if(s.img){ const im=await loadImg(s.img); if(im){ const pad=12, iw=s.w-pad*2, ih=s.h-pad*2-(s.cap?34:0); const sc=Math.max(iw/im.width,ih/im.height); x.save(); x.beginPath(); x.rect(-s.w/2+pad,-s.h/2+pad,iw,ih); x.clip(); x.drawImage(im,-s.w/2+pad+(iw-im.width*sc)/2,-s.h/2+pad+(ih-im.height*sc)/2,im.width*sc,im.height*sc); x.restore(); } }
    if(s.svg){ const im=await svgImg(s.svg,400); if(im){ const z=Math.min(s.w,s.h-(s.cap?34:0))*.8; x.drawImage(im,-z/2,-s.h/2+(s.h-(s.cap?34:0)-z)/2,z,z); } }
    if(s.text){ x.fillStyle=INK; x.textAlign='center'; x.font='700 '+(s.fs||44)+'px Caveat, cursive'; s.text.split('\n').forEach((t,i,a)=>x.fillText(t,0,-s.h/2+ (s.h/(a.length+1))*(i+1)+14)); }
    if(s.cap){ x.fillStyle=INK; x.textAlign='center'; x.font='700 34px Caveat, cursive'; x.fillText(s.cap,0,s.h/2-14); }
    wobRect(x,-s.w/2,-s.h/2,s.w,s.h,{w:1.2,a:.5,passes:1,tilt:2});
    // blue masking tape
    const tape=(tx,ty,ang)=>{ x.save(); x.translate(tx,ty); x.rotate(ang); x.globalAlpha=.82; x.fillStyle='#4f86e8'; x.fillRect(-46,-14,92,28); x.globalAlpha=.35; x.fillStyle='#fff'; for(let i=-44;i<44;i+=9) x.fillRect(i,-14,3,28); x.globalAlpha=1; x.restore(); };
    tape(-s.w/2+18,-s.h/2+6,-.6); tape(s.w/2-18,-s.h/2+6,.6); if(s.h>260) tape(0,s.h/2-4,(R()-.5)*.3);
    x.restore(); }
  return c; }
function frameTex(){ const [c,x]=canvas(640,1180); wobRect(x,10,10,620,1170,{w:4,tilt:4}); wobRect(x,40,40,560,1140,{w:2,tilt:4}); hatchArea(x,12,12,26,1166,{gap:7,a:.4}); hatchArea(x,602,12,26,1166,{gap:7,a:.4}); hatchArea(x,12,12,616,26,{gap:7,a:.4}); return c; }
function pictureTex(img,svg,cap){ return (async()=>{ const [c,x]=canvas(512,620); x.fillStyle='#fdfcf8'; x.fillRect(0,0,512,620); wobRect(x,8,8,496,604,{w:5,tilt:4}); wobRect(x,40,40,432,500,{w:1.6,tilt:3}); hatchArea(x,10,10,28,600,{gap:7,a:.3}); hatchArea(x,474,10,28,600,{gap:7,a:.3});
  if(img){ const im=await loadImg(img); if(im){ const iw=420, ih=488, sc=Math.max(iw/im.width,ih/im.height); x.save(); x.beginPath(); x.rect(46,46,iw,ih); x.clip(); x.drawImage(im,46+(iw-im.width*sc)/2,46+(ih-im.height*sc)/2,im.width*sc,im.height*sc); x.restore(); } }
  if(svg){ const im=await svgImg(svg,420); if(im) x.drawImage(im,76,80,360,360); }
  if(cap){ x.fillStyle=INK; x.textAlign='center'; x.font='700 40px Caveat, cursive'; x.fillText(cap,256,590); }
  return c; })(); }
function plantTex(){ const [c,x]=canvas(512,700); const cx=256; for(let i=0;i<14;i++){ const a=-Math.PI/2+(R()-.5)*2.2, L=180+R()*200, ex=cx+Math.cos(a)*L, ey=470+Math.sin(a)*L; wobPoly(x,[[cx,470],[cx+(ex-cx)*.5+(R()-.5)*30,470+(ey-470)*.5],[ex,ey]],{w:2,amp:1}); const lw=26+R()*16; x.save(); x.translate(ex,ey); x.rotate(a+Math.PI/2); wobCircle(x,0,0,lw,{ry:lw*2.1,w:2}); wobLine(x,0,-lw*1.8,0,lw*1.8,{w:1,passes:1}); x.restore(); }
  // pot
  wobPoly(x,[[150,470],[362,470],[332,690],[180,690],[150,470]],{w:3}); wobLine(x,140,470,372,470,{w:4}); hatchArea(x,160,480,60,200,{gap:7,a:.35}); return c; }
function trophyTex(){ const [c,x]=canvas(400,520); wobPoly(x,[[110,60],[290,60],[280,190],[240,250],[160,250],[120,190],[110,60]],{w:3.4}); wobPoly(x,[[110,90],[50,90],[60,160],[120,190]],{w:3}); wobPoly(x,[[290,90],[350,90],[340,160],[280,190]],{w:3}); wobLine(x,200,250,200,330,{w:3}); wobRect(x,140,330,120,40,{w:3}); wobRect(x,110,370,180,60,{w:3}); hatchArea(x,112,372,176,56,{gap:7,a:.4}); x.fillStyle='#2f6fd6'; x.font='700 70px Caveat'; x.textAlign='center'; x.fillText('★',200,175); return c; }
function endTex(){ return (async()=>{ const [c,x]=canvas(1024,900); x.fillStyle='#f6f5f1'; x.fillRect(0,0,1024,900); grain(x,1024,900,3000,.08); x.fillStyle=INK; x.textAlign='center'; x.font='700 120px Caveat, cursive'; x.fillText('to be continued…',512,250); x.font='700 54px Caveat, cursive'; x.fillText('thanks for walking through ✎',512,340); const pts=[]; for(let t=0;t<=1;t+=.05) pts.push([300+t*424,380+Math.sin(t*9)*8]); wobPoly(x,pts,{w:3,col:'#2f6fd6'}); x.font='600 34px Inter, sans-serif'; x.fillStyle='#55555c'; x.fillText('© 2026 Prajwal Ghagre · drawn by hand (well, by code)',512,820); return c; })(); }

function handleTex(){ const [c,x]=canvas(300,120); x.fillStyle='#f4efe2'; x.beginPath(); x.moveTo(26,48); x.lineTo(240,44); x.lineTo(244,76); x.lineTo(24,74); x.closePath(); x.fill(); wobPoly(x,[[24,46],[244,44],[246,76],[22,74],[24,46]],{w:3}); hatchArea(x,26,48,214,24,{gap:5,a:.55}); x.fillStyle='#f4efe2'; x.beginPath(); x.arc(250,60,26,0,7); x.fill(); wobCircle(x,250,60,26,{w:3}); wobCircle(x,250,60,9,{w:2,passes:1}); return c; }
function skyTex(){ const R=rnd(7); const [c,x]=canvas(256,512); x.fillStyle='#ffffff'; x.fillRect(0,0,256,512); const cl=(cx,cy,s)=>{ x.save(); x.translate(cx,cy); x.scale(s,s); x.beginPath(); const n=9; for(let i=0;i<=n;i++){ const a=Math.PI+i/n*Math.PI, r=1+R()*.18; const px=Math.cos(a)*60*r, py=Math.sin(a)*26*r; i?x.quadraticCurveTo(px*1.25,py*1.5,px,py):x.moveTo(px,py);} x.quadraticCurveTo(0,12,-60,0); x.closePath(); x.fillStyle='#fff'; x.fill(); x.lineWidth=2.4/s; x.strokeStyle='#8d8d94'; x.stroke(); x.restore(); }; cl(80,110,.9); cl(190,230,.7); cl(70,360,.8); cl(200,440,.6); return c; }
function glowTex(){ const [c,x]=canvas(256,512); x.fillStyle='#232228'; x.fillRect(0,0,256,512); const g=x.createRadialGradient(128,520,10,128,520,300); g.addColorStop(0,'rgba(255,236,170,.85)'); g.addColorStop(1,'rgba(255,236,170,0)'); x.fillStyle=g; x.fillRect(0,0,256,512); for(let i=-512;i<256;i+=9){ x.globalAlpha=.08; x.strokeStyle='#fff'; x.beginPath(); x.moveTo(i,512); x.lineTo(i+512,0); x.stroke(); } x.globalAlpha=1; return c; }
let ICONS={};
function sticker(x,cx,cy,r,ang,icon,text,col){ x.save(); x.translate(cx,cy); x.rotate(ang); x.shadowColor='rgba(0,0,0,.25)'; x.shadowBlur=8; x.shadowOffsetY=3; x.fillStyle='#ffffff'; x.beginPath(); for(let i=0;i<=24;i++){ const a=i/24*6.283, k=1+(R()-.5)*.08; i?x.lineTo(Math.cos(a)*r*k,Math.sin(a)*r*k):x.moveTo(Math.cos(a)*r*k,Math.sin(a)*r*k);} x.closePath(); x.fill(); x.shadowColor='transparent'; x.lineWidth=1.5; x.strokeStyle='rgba(0,0,0,.25)'; x.stroke();
  if(icon&&ICONS[icon]){ const ic=ICONS[icon], s=r*1.15/24; x.save(); x.translate(-12*s,-12*s); x.scale(s,s); x.fillStyle='#'+ic.hex; x.fill(new Path2D(ic.d)); x.restore(); }
  else if(text){ x.fillStyle=col||INK; x.textAlign='center'; x.textBaseline='middle'; x.font='900 '+(r*.8|0)+'px Inter, sans-serif'; x.fillText(text,0,2); }
  x.restore(); }
/* ================= FRONT scene: dark pen-and-ink sketch (original drawing, made in code) ================= */
const INK2='#202020';
function inkStroke(x,w,a,col){ x.lineWidth=w; x.globalAlpha=a; x.strokeStyle=col||INK2; x.lineJoin='round'; x.lineCap='round'; x.stroke(); x.globalAlpha=1; }
function hatchLines(x,x0,y0,w,h,gap,ang,lw,a,col){ const L=Math.hypot(w,h)+4, cx=x0+w/2, cy=y0+h/2, ca=Math.cos(ang), sa=Math.sin(ang); const p=new Path2D();
  for(let d=-L/2; d<L/2; d+=gap*(.8+R()*.4)){ const px=cx-sa*d, py=cy+ca*d; const n=Math.max(2,L/40|0); for(let i=0;i<=n;i++){ const t=-L/2+i/n*L, wb=(R()-.5)*.9; const qx=px+ca*t-sa*wb, qy=py+sa*t+ca*wb; i?p.lineTo(qx,qy):p.moveTo(qx,qy); } }
  x.lineWidth=lw; x.globalAlpha=a; x.strokeStyle=col||INK2; x.lineCap='round'; x.stroke(p); x.globalAlpha=1; }
function polyPath(pts,smooth){ const p=new Path2D(), n=pts.length; if(!smooth){ p.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<n;i++)p.lineTo(pts[i][0],pts[i][1]); p.closePath(); return p; }
  p.moveTo((pts[0][0]+pts[n-1][0])/2,(pts[0][1]+pts[n-1][1])/2); for(let i=0;i<n;i++){ const a=pts[i], b=pts[(i+1)%n]; p.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2); } p.closePath(); return p; }
function sketchOutline(x,path,w,a){ x.lineJoin='round'; x.lineCap='round'; x.lineWidth=w; x.globalAlpha=a; x.strokeStyle=INK2; x.stroke(path); x.save(); x.translate((R()-.5)*2.2,(R()-.5)*2.2); x.lineWidth=w*.45; x.globalAlpha=a*.45; x.stroke(path); x.restore(); x.globalAlpha=1; }
function speck(x,x0,y0,w,h,n,a){ x.fillStyle=INK2; for(let i=0;i<n;i++){ x.globalAlpha=a*(.3+R()*.7); x.fillRect(x0+R()*w,y0+R()*h,1+R()*1.8,1+R()*1.4); } x.globalAlpha=1; }
function grainLines(x,x0,y0,w,h,n,vert,col){ const p=new Path2D(); for(let k=0;k<n;k++){ const g=(vert?x0+R()*w:y0+R()*h), ph=R()*6, am=1.2+R()*3, f=.006+R()*.01; const L=vert?h:w, o0=vert?y0:x0; for(let t=0;t<=L;t+=12){ const v=g+Math.sin(t*f+ph)*am+Math.sin(t*f*5+ph)*.8; vert?(t?p.lineTo(v,o0+t):p.moveTo(v,o0+t)):(t?p.lineTo(o0+t,v):p.moveTo(o0+t,v)); } }
  x.lineWidth=1; x.globalAlpha=.32; x.strokeStyle=col||'#303030'; x.stroke(p); x.globalAlpha=1; }
function grassTufts(x,pts,size,a){ const p=new Path2D(); for(const [gx,gy,sc] of pts){ const s=size*(sc||1)*(.6+R()*.7), n=3+(R()*4|0); for(let k=0;k<n;k++){ const bx=gx+(k-n/2)*s*.22+(R()-.5)*s*.2, lean=(R()-.5)*s*.9, hh=s*(.6+R()*.6); p.moveTo(bx-s*.06,gy); p.quadraticCurveTo(bx+lean*.3,gy-hh*.55,bx+lean,gy-hh); p.quadraticCurveTo(bx+lean*.3+s*.06,gy-hh*.5,bx+s*.08,gy); } }
  x.lineWidth=1.5; x.lineJoin='round'; x.globalAlpha=a; x.strokeStyle=INK2; x.stroke(p); x.globalAlpha=1; }

function bricksTex(){ const Wp=2560, Hp=1500, ppm=Wp/12, pv=Hp/7; const [c,x]=canvas(Wp,Hp); const wy=m=>Hp-m*pv, wx=m=>Wp/2+m*ppm;
  x.fillStyle='#fafafa'; x.fillRect(0,0,Wp,Hp); speck(x,0,0,Wp,Hp,12000,.35);
  const g0=wy(.34), bh=.19*pv, gap=5; const tones=['#fbfbfb','#f8f8f8','#fdfdfd'];const _t0=['#fdfdfd','#fbfbfb','#fafafa','#f9f9f9','#f8f8f8','#fdfdfd','#f6f6f6'];
  for(let row=0;;row++){ const yb=g0-row*bh; if(yb<-bh)break; const yt=yb-bh, off=(row%2)*.25*ppm; let bx=-off-R()*30;
    while(bx<Wp){ const w=.5*ppm*(.86+R()*.28), x0=bx+gap/2, y0=yt+gap/2, ww=w-gap, hh=bh-gap; const j=()=>(R()-.5)*2.4;
      const pts=[[x0+j(),y0+j()],[x0+ww+j(),y0+j()],[x0+ww+j(),y0+hh+j()],[x0+j(),y0+hh+j()]]; const P=polyPath(pts);
      x.fillStyle=tones[(R()*tones.length)|0]; x.fill(P);
      x.globalAlpha=.1; x.fillStyle='#292929'; x.fillRect(x0,y0+hh-5,ww,5); x.fillRect(x0+ww-4,y0,4,hh); x.globalAlpha=.5; x.fillStyle='#ffffff'; x.fillRect(x0+3,y0+2,ww-8,2); x.globalAlpha=1;
      if(R()<.14){ x.save(); x.clip(P); hatchLines(x,x0,y0,ww,hh,4.5+R()*4,R()<.6?-.95:.95,1.1,.22+R()*.15); x.restore(); }
      speck(x,x0,y0,ww,hh,9,.6);
      sketchOutline(x,P,2.3,.92);
      if(R()<.09){ const cx=x0+R()*ww, top=R()<.5, cy=top?y0:y0+hh; const q=new Path2D(); q.moveTo(cx-9,cy); q.lineTo(cx-2,cy+(top?7:-7)); q.lineTo(cx+10,cy); x.lineWidth=1.3; x.strokeStyle=INK2; x.stroke(q); }
      bx+=w; } }
  // stone plinth
  x.fillStyle='#fafafa'; x.fillRect(0,g0,Wp,Hp-g0); for(let bx=0;bx<Wp;){ const w=.8*ppm*(.8+R()*.5); const P=polyPath([[bx+3,g0+6],[bx+w-3,g0+6],[bx+w-3,Hp+4],[bx+3,Hp+4]]); x.fillStyle=['#fafafa','#f9f9f9','#f9f9f9'][R()*3|0]; x.fill(P); sketchOutline(x,P,2,.85); bx+=w; }
  x.save(); x.beginPath(); x.rect(0,g0,Wp,Hp-g0); x.clip(); hatchLines(x,0,g0,Wp,Hp-g0,6,-.9,1.1,.42); x.restore();
  wobLine(x,0,g0,Wp,g0,{w:5,amp:1}); x.globalAlpha=.6; x.fillStyle='#ffffff'; x.fillRect(0,g0+5,Wp,3); x.globalAlpha=1;
  // eaves shade at the top of the wall
  const eg=x.createLinearGradient(0,0,0,.9*pv); eg.addColorStop(0,'rgba(27,27,27,.35)'); eg.addColorStop(1,'rgba(27,27,27,0)'); x.fillStyle=eg; x.fillRect(0,0,Wp,.9*pv);
  x.save(); x.beginPath(); x.rect(0,0,Wp,.35*pv); x.clip(); hatchLines(x,0,0,Wp,.35*pv,6,-.9,1.1,.45); x.restore();
  // windows (desktop width)
  for(const sd of [-1,1]){ const cx=wx(sd*3.35), top=wy(3.65), ww=1.5*ppm, wh=1.6*ppm, l=cx-ww/2;
    // stone lintel + sill
    const lin=polyPath([[l-30,top-46],[l+ww+30,top-46],[l+ww+30,top-4],[l-30,top-4]]); x.fillStyle='#fafafa'; x.fill(lin); x.save(); x.clip(lin); hatchLines(x,l-30,top-46,ww+60,42,6,-.9,1,.35); x.restore(); sketchOutline(x,lin,3,.9);
    const sil=polyPath([[l-36,top+wh],[l+ww+36,top+wh],[l+ww+44,top+wh+30],[l-44,top+wh+30]]); x.fillStyle='#fcfcfc'; x.fill(sil); sketchOutline(x,sil,3,.9);
    x.save(); x.beginPath(); x.rect(l-44,top+wh+30,ww+88,26); x.clip(); hatchLines(x,l-44,top+wh+30,ww+88,26,4,-.9,1.1,.6); x.restore();
    // frame + glass
    x.fillStyle='#fafafa'; x.fillRect(l,top,ww,wh); const fw=22;
    for(const [px,py] of [[l+fw,top+fw],[cx+fw/2,top+fw],[l+fw,top+wh/2+fw/2],[cx+fw/2,top+wh/2+fw/2]]){ const pw=ww/2-fw*1.5, ph=wh/2-fw*1.5; x.fillStyle='#fafafa'; x.fillRect(px,py,pw,ph);
      x.save(); x.beginPath(); x.rect(px,py,pw,ph); x.clip(); hatchLines(x,px,py,pw,ph,4.5,-.75,1.1,.55); hatchLines(x,px,py,pw,ph,9,.75,1,.3);
      x.globalAlpha=.85; x.fillStyle='#fefefe'; x.beginPath(); x.moveTo(px+pw*.15,py+ph); x.lineTo(px+pw*.45,py+ph); x.lineTo(px+pw*.95,py); x.lineTo(px+pw*.65,py); x.closePath(); x.fill(); x.beginPath(); x.moveTo(px+pw*.55,py+ph); x.lineTo(px+pw*.62,py+ph); x.lineTo(px+pw*1.05,py+ph*.1); x.lineTo(px+pw*.98,py+ph*.1); x.closePath(); x.fill(); x.globalAlpha=1; x.restore();
      wobRect(x,px,py,pw,ph,{w:2.2,tilt:1.5,amp:.6}); }
    wobRect(x,l,top,ww,wh,{w:4.5,tilt:2,amp:.9}); grainLines(x,l,top,fw,wh,4,true); grainLines(x,l+ww-fw,top,fw,wh,4,true); }
  // wall lanterns beside the door
  for(const sd of [-1,1]){ const cx=wx(sd*1.68), ly=wy(2.55);
    const gl=x.createRadialGradient(cx,ly+60,10,cx,ly+60,190); gl.addColorStop(0,'rgba(255,255,255,.42)'); gl.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle=gl; x.fillRect(cx-200,ly-140,400,400);
    const bp=polyPath([[cx-14,ly-70],[cx+14,ly-70],[cx+14,ly+10],[cx-14,ly+10]]); x.fillStyle='#565656'; x.fill(bp); sketchOutline(x,bp,2.4,.95);
    const body=polyPath([[cx-34,ly],[cx+34,ly],[cx+28,ly+112],[cx-28,ly+112]]); x.fillStyle='rgba(255,255,255,.95)'; x.fill(body); x.save(); x.clip(body); hatchLines(x,cx-34,ly,68,112,7,-.8,1,.25); x.restore(); sketchOutline(x,body,3,.95);
    wobLine(x,cx,ly,cx,ly+112,{w:2.4,passes:1});
    const cap=polyPath([[cx-48,ly+2],[cx,ly-40],[cx+48,ly+2]]); x.fillStyle='#3b3b3b'; x.fill(cap); sketchOutline(x,cap,3,1);
    const bot=polyPath([[cx-30,ly+112],[cx+30,ly+112],[cx+18,ly+134],[cx-18,ly+134]]); x.fillStyle='#3b3b3b'; x.fill(bot); sketchOutline(x,bot,2.4,1);
    x.beginPath(); x.arc(cx,ly-46,8,0,6.283); x.fillStyle='#3b3b3b'; x.fill(); }
  // timber beam + iron braces that carry the sign chains
  const by=wy(4.95), bH=.2*pv, bl=wx(-2.05), br=wx(2.05);
  x.save(); x.beginPath(); x.rect(bl,by,br-bl,.16*pv); x.clip(); hatchLines(x,bl,by,br-bl,.16*pv,4,-.9,1.1,.6); x.restore();
  for(const sd of [-1,1]){ const ax=wx(sd*1.82), p=new Path2D(); p.moveTo(ax,by); p.lineTo(ax-sd*0, by+.5*pv); p.moveTo(ax,by+.5*pv); p.lineTo(ax+sd*.42*ppm,by); x.lineWidth=11; x.strokeStyle='#2b2b2b'; x.lineCap='round'; x.stroke(p); x.lineWidth=3; x.strokeStyle='#f5f5f5'; x.stroke(p);
    x.beginPath(); x.arc(ax+sd*.14*ppm,by+.17*pv,16,0,6.283); x.lineWidth=7; x.strokeStyle='#2b2b2b'; x.stroke(); }
  const beam=polyPath([[bl,by-bH],[br,by-bH+3],[br,by+2],[bl,by]]); x.fillStyle='#f9f9f9'; x.fill(beam); x.save(); x.clip(beam); grainLines(x,bl,by-bH,br-bl,bH,16,false); hatchLines(x,bl,by-bH*.35,br-bl,bH*.35,4,-.9,1,.5); x.restore();
  for(const ex of [bl,br]){ for(let r=6;r<bH*.45;r+=7){ x.beginPath(); x.ellipse(ex+(ex===bl?16:-16),by-bH/2,r*.5,r,0,0,6.283); inkStroke(x,1,.45); } }
  sketchOutline(x,beam,4.5,.95); x.globalAlpha=.7; x.fillStyle='#ffffff'; x.fillRect(bl+6,by-bH+5,br-bl-12,3); x.globalAlpha=1;
  for(const sd of [-1,1]){ const ex=wx(sd*.943); x.beginPath(); x.arc(ex,by+6,9,0,6.283); x.lineWidth=5; x.strokeStyle='#2b2b2b'; x.stroke(); }
  // the sign's cast shadow on the bricks
  x.save(); const sh=new Path2D(); sh.rect(wx(-1.46+.09),wy(4.59-.11),2.92*ppm,(.78)*pv); sh.rect(wx(-.88+.09),wy(3.72-.11),1.76*ppm,.45*pv); x.clip(sh); x.fillStyle='rgba(23,23,23,.16)'; x.fillRect(0,0,Wp,Hp); hatchLines(x,wx(-1.5),wy(4.6),3.2*ppm,1.5*pv,5,-.9,1,.38); x.restore();
  // door casing (architrave), cornice head, reveal shadow
  const dx=Wp/2, dw=1.12*ppm, dh=2.72*pv, top=Hp-dh, cw=.17*ppm;
  x.save(); x.beginPath(); x.rect(dx+dw+cw,top-.3*pv,26,dh+.3*pv); x.rect(dx-dw-cw-.12*ppm,top-.32*pv+ .36*pv,dw*2+cw*2+.24*ppm,22); x.clip(); hatchLines(x,dx-dw-cw-40,top-.4*pv,dw*2+cw*2+140,dh+.5*pv,4,-.9,1,.45); x.restore();
  for(const sd of [-1,1]){ const jx=sd<0?dx-dw-cw:dx+dw; const J=polyPath([[jx,top-cw],[jx+cw,top-cw],[jx+cw,Hp+4],[jx,Hp+4]]); x.fillStyle='#fafafa'; x.fill(J); x.save(); x.clip(J); grainLines(x,jx,top-cw,cw,dh+cw,9,true); for(const o of [.22,.36,.62]) wobLine(x,jx+cw*o,top-cw+o*cw,jx+cw*o,Hp,{w:1.4,a:.75,amp:.6,passes:1}); hatchLines(x,sd<0?jx+cw*.62:jx,top-cw,cw*.38,dh+cw,4,-.9,1,.5); x.restore(); sketchOutline(x,J,3.5,.95); }
  const H=polyPath([[dx-dw-cw,top-cw],[dx+dw+cw,top-cw],[dx+dw,top],[dx-dw,top]]); x.fillStyle='#f9f9f9'; x.fill(H); x.save(); x.clip(H); grainLines(x,dx-dw-cw,top-cw,dw*2+cw*2,cw,7,false); x.restore(); sketchOutline(x,H,3.5,.95);
  const C=polyPath([[dx-dw-cw-.12*ppm,top-cw-.2*pv],[dx+dw+cw+.12*ppm,top-cw-.2*pv],[dx+dw+cw+.08*ppm,top-cw],[dx-dw-cw-.08*ppm,top-cw]]); x.fillStyle='#fbfbfb'; x.fill(C); x.save(); x.clip(C); hatchLines(x,dx-dw-cw-.12*ppm,top-cw-.08*pv,dw*2+cw*2+.24*ppm,.08*pv,4,-.9,1,.6); x.restore(); sketchOutline(x,C,4,.95);
  const C2=polyPath([[dx-dw-cw-.16*ppm,top-cw-.27*pv],[dx+dw+cw+.16*ppm,top-cw-.27*pv],[dx+dw+cw+.16*ppm,top-cw-.2*pv],[dx-dw-cw-.16*ppm,top-cw-.2*pv]]); x.fillStyle='#f9f9f9'; x.fill(C2); sketchOutline(x,C2,3.5,.95);
  x.clearRect(dx-dw,top,dw*2,dh);
  return c; }

function bigSignTex(){ const [c,x]=canvas(1400,760);
  const chain=(cx,y0,y1)=>{ let y=y0,k=0; while(y<y1){ if(k%2===0){ x.beginPath(); x.ellipse(cx,y+11,10,15,0,0,6.283); x.lineWidth=7; x.strokeStyle='#272727'; x.stroke(); x.beginPath(); x.ellipse(cx-2,y+10,8,12,0,3.4,5.2); x.lineWidth=2.4; x.strokeStyle='#f9f9f9'; x.stroke(); } else { x.beginPath(); x.moveTo(cx,y+1); x.lineTo(cx,y+21); x.lineWidth=8; x.strokeStyle='#212121'; x.lineCap='round'; x.stroke(); x.beginPath(); x.moveTo(cx-1.6,y+5); x.lineTo(cx-1.6,y+15); x.lineWidth=2; x.strokeStyle='#f7f7f7'; x.stroke(); } y+=19; k++; } };
  const plank=(px,py,pw,ph,boards)=>{ x.fillStyle='rgba(16,16,16,.28)'; x.fillRect(px+10,py+12,pw,ph);
    const bhh=ph/boards; for(let b=0;b<boards;b++){ const by=py+b*bhh; x.fillStyle=['#fafafa','#f9f9f9','#fbfbfb'][(b+(R()*3|0))%3]; x.fillRect(px,by,pw,bhh); grainLines(x,px,by,pw,bhh,(bhh/8)|0,false,'#2f2f2f');
      if(R()<.85){ const kx=px+80+R()*(pw-160), ky=by+bhh*(.35+R()*.3); for(let r=5;r<30;r+=6){ x.beginPath(); x.ellipse(kx,ky,r*2,r*.75,0,0,6.283); inkStroke(x,1,.42,'#2f2f2f'); } x.beginPath(); x.ellipse(kx,ky,7,3.5,0,0,6.283); x.fillStyle='#3d3d3d'; x.fill(); }
      x.save(); x.beginPath(); x.rect(px,by+bhh-15,pw,15); x.clip(); hatchLines(x,px,by+bhh-15,pw,15,3.6,-1,1,.55); x.restore();
      if(b>0){ wobLine(x,px,by,px+pw,by+(R()-.5)*3,{w:3.4,a:.95,amp:.8}); x.globalAlpha=.6; x.fillStyle='#fefefe'; x.fillRect(px+4,by+3,pw-8,2.5); x.globalAlpha=1; } }
    x.save(); x.beginPath(); x.rect(px+pw-16,py,16,ph); x.clip(); hatchLines(x,px+pw-16,py,16,ph,3.5,.9,1.2,.65); x.restore();
    x.globalAlpha=.75; x.fillStyle='#fefefe'; x.fillRect(px+5,py+4,pw-12,4); x.fillRect(px+4,py+5,4,ph-10); x.globalAlpha=1;
    wobRect(x,px,py,pw,ph,{w:5.5,tilt:4,amp:1});
    [[px+30,py+30],[px+pw-30,py+30],[px+30,py+ph-30],[px+pw-30,py+ph-30]].forEach(p=>{ x.beginPath(); x.arc(p[0],p[1],11,0,6.283); x.fillStyle='#dcdcdc'; x.fill(); inkStroke(x,2.6,1); x.beginPath(); x.arc(p[0]-3.5,p[1]-3.5,3.5,0,6.283); x.fillStyle='#fdfdfd'; x.fill(); }); };
  for(const cx of [300,1100]) chain(cx,0,166);
  plank(80,150,1240,330,3);
  for(const cx of [480,920]) chain(cx,462,530);
  plank(330,520,740,190,2);
  const lbl='PORTFOLIO'; let fs=210; x.font='900 '+fs+'px Inter, sans-serif'; while(x.measureText(lbl).width>1060){ fs-=6; x.font='900 '+fs+'px Inter, sans-serif'; }
  x.textAlign='center'; x.textBaseline='middle';
  x.fillStyle='rgba(255,255,255,.85)'; x.fillText(lbl,696,318);
  x.fillStyle='#1d1d1d'; x.fillText(lbl,701,323);
  const [m,mx]=canvas(1400,760); mx.font=x.font; mx.textAlign='center'; mx.textBaseline='middle'; mx.fillText(lbl,701,323);
  const [h,hx]=canvas(1400,760); hx.strokeStyle='#ffffff'; hx.lineWidth=1.3; for(let i=-760;i<1400;i+=7){ hx.globalAlpha=.10+R()*.08; hx.beginPath(); hx.moveTo(i,760); hx.lineTo(i+560,0); hx.stroke(); } hx.globalAlpha=1; hx.globalCompositeOperation='destination-in'; hx.drawImage(m,0,0); x.drawImage(h,0,0);
  x.lineWidth=3.2; x.strokeStyle='#0f0f0f'; x.strokeText(lbl,701,323);
  x.fillStyle='#1d1d1d'; x.font='700 120px Caveat, cursive'; x.fillText('Prajwal Ghagre',700,618);
  return c; }

function clumpPath(cx,cy,r){ const n=14+(r/9|0), a0=R()*6.28, pts=[]; for(let i=0;i<=n;i++){ const a=a0+i/n*6.283, rr=r*(.8+R()*.24); pts.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*.84,a]); }
  const p=new Path2D(); p.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<pts.length;i++){ const a=pts[i-1], b=pts[i], am=(a[2]+b[2])/2, bu=r*(.07+R()*.1); p.quadraticCurveTo((a[0]+b[0])/2+Math.cos(am)*bu,(a[1]+b[1])/2+Math.sin(am)*bu*.84,b[0],b[1]); } p.closePath(); return p; }
function clump(x,cx,cy,r,tone,dark){ const P=clumpPath(cx,cy,r); x.save(); x.translate(r*.06,r*.09); x.fillStyle='rgba(20,20,20,.42)'; x.fill(P); x.restore(); x.fillStyle=tone; x.fill(P); x.save(); x.clip(P);
  const D2=new Path2D(), L2=new Path2D(); const N=r*r*.07|0; for(let i=0;i<N;i++){ const px=cx+(R()*2-1)*r, py=cy+(R()*2-1)*r; const s=((px-cx)*.55+(py-cy)*.85)/r; const pr=Math.min(1,Math.max(0,.28+(s+.2)*.8+dark*.3)); if(R()>pr)continue; const rr=3+R()*4, tgt=(s>.3||R()<dark*.6)?D2:L2; tgt.moveTo(px-rr,py); tgt.arc(px,py,rr,Math.PI,Math.PI*2+(R()-.5)*.6); }
  x.lineCap='round'; x.strokeStyle=INK2; x.lineWidth=1.2; x.globalAlpha=.55; x.stroke(L2); x.lineWidth=1.5; x.globalAlpha=.85; x.stroke(D2); x.globalAlpha=1;
  const band=(o,gap,ang,a,lw)=>{ x.save(); x.clip(polyPath([[cx-r*1.4,cy+r*(.45+o)],[cx+r*1.4,cy-r*(.55-o)],[cx+r*1.4,cy+r*1.4],[cx-r*1.4,cy+r*1.4]])); hatchLines(x,cx-r,cy-r,2*r,2*r,gap,ang,lw,a); x.restore(); };
  band(-.25,6,-.95,.28+dark*.15,1); band(.2,4.5,-.95,.4+dark*.2,1.1); band(.6,6,.9,.3+dark*.3,1);
  x.restore(); sketchOutline(x,P,2.4,.92); }
function limb(x,pts,w0,w1){ const Ls=[],Rs=[]; for(let i=0;i<pts.length;i++){ const a=pts[Math.max(0,i-1)], b=pts[Math.min(pts.length-1,i+1)], dx=b[0]-a[0], dy=b[1]-a[1], l=Math.hypot(dx,dy)||1, nx=-dy/l, ny=dx/l, t=i/(pts.length-1), w=w0+(w1-w0)*t+(R()-.5)*3; Ls.push([pts[i][0]+nx*w,pts[i][1]+ny*w]); Rs.push([pts[i][0]-nx*w,pts[i][1]-ny*w]); }
  const P=new Path2D(); P.moveTo(Ls[0][0],Ls[0][1]); for(let i=1;i<Ls.length;i++) P.lineTo(Ls[i][0],Ls[i][1]); for(let i=Rs.length-1;i>=0;i--) P.lineTo(Rs[i][0],Rs[i][1]); P.closePath();
  x.fillStyle='#fafafa'; x.fill(P); x.save(); x.clip(P);
  const bark=new Path2D(); for(let k=0;k<Math.max(4,w0/4);k++){ const f=(R()*2-1)*.9, ph=R()*6; let first=true; for(let i=0;i<pts.length;i++){ const q=Ls[i], r2=Rs[i], u=(f+1)/2+Math.sin(i*1.3+ph)*.04; const bx=q[0]+(r2[0]-q[0])*u, by2=q[1]+(r2[1]-q[1])*u; first?bark.moveTo(bx,by2):bark.lineTo(bx,by2); first=false; } }
  x.lineWidth=1.5; x.globalAlpha=.8; x.strokeStyle=INK2; x.stroke(bark); x.globalAlpha=1;
  const Sh=new Path2D(); for(let i=0;i<pts.length;i++){ const q=Ls[i], r2=Rs[i]; const sx=r2[0]+(q[0]-r2[0])*.55, sy=r2[1]+(q[1]-r2[1])*.55; i?Sh.lineTo(sx,sy):Sh.moveTo(sx,sy); } for(let i=Rs.length-1;i>=0;i--) Sh.lineTo(Rs[i][0],Rs[i][1]); Sh.closePath(); x.clip(Sh);
  let mnx=1e9,mny=1e9,mxx=-1e9,mxy=-1e9; Ls.concat(Rs).forEach(p=>{mnx=Math.min(mnx,p[0]);mny=Math.min(mny,p[1]);mxx=Math.max(mxx,p[0]);mxy=Math.max(mxy,p[1]);});
  hatchLines(x,mnx,mny,mxx-mnx,mxy-mny,3.6,-.9,1.1,.7); hatchLines(x,mnx,mny,mxx-mnx,mxy-mny,6,.8,1,.4); x.restore();
  const o=new Path2D(); o.moveTo(Ls[0][0],Ls[0][1]); for(let i=1;i<Ls.length;i++) o.lineTo(Ls[i][0],Ls[i][1]); o.moveTo(Rs[0][0],Rs[0][1]); for(let i=1;i<Rs.length;i++) o.lineTo(Rs[i][0],Rs[i][1]); sketchOutline(x,o,3.2,.95); }
function frontTreeTex(){ const Wt=1200,Ht=1500; const [c,x]=canvas(Wt,Ht); const bx=760;
  // back canopy (darker)
  const back=[[600,300,190],[400,380,170],[820,330,170],[300,560,150],[960,520,140],[560,520,190],[760,560,170],[480,200,140],[720,170,150],[200,420,120],[1040,380,110]];
  back.forEach(b=>clump(x,b[0],b[1],b[2],'#f7f7f7',.85));
  // trunk + branches
  limb(x,[[bx-20,Ht+4],[bx-14,1340],[bx-30,1180],[bx-44,1040],[bx-52,900],[bx-70,780]],76,34);
  const rootP=polyPath([[bx-130,Ht],[bx-70,Ht-60],[bx+40,Ht-60],[bx+110,Ht]],true); x.fillStyle='#fcfcfc'; x.fill(rootP); x.save(); x.clip(rootP); hatchLines(x,bx-130,Ht-70,260,80,4,-.9,1,.55); x.restore(); sketchOutline(x,rootP,3,.9);
  limb(x,[[bx-60,860],[bx-130,760],[bx-220,660],[bx-330,560]],26,9);
  limb(x,[[bx-50,880],[bx+20,780],[bx+110,680],[bx+190,600]],22,8);
  limb(x,[[bx-70,800],[bx-80,680],[bx-90,560],[bx-120,450]],24,9);
  limb(x,[[bx-200,680],[bx-300,640],[bx-420,620]],12,6);
  // front canopy (lighter, leaves in front of branches)
  const front=[[300,690,120],[470,640,130],[640,650,110],[880,640,120],[1030,600,95],[180,600,95],[420,470,130],[620,410,120],[850,430,120],[560,260,120],[360,290,110],[780,250,105],[1000,470,90],[240,470,90]];
  front.forEach(b=>clump(x,b[0],b[1],b[2],'#fcfcfc',.3));
  // a few loose leaves at the edges
  const lv=new Path2D(); for(let i=0;i<40;i++){ const a=R()*6.283, rr=430+R()*90, lx=600+Math.cos(a)*rr, ly=450+Math.sin(a)*rr*.75; if(ly>780)continue; const L=12+R()*8, aa=R()*6.28; lv.moveTo(lx,ly); lv.quadraticCurveTo(lx+Math.cos(aa+.5)*L,ly+Math.sin(aa+.5)*L,lx+Math.cos(aa)*L*1.6,ly+Math.sin(aa)*L*1.6); lv.quadraticCurveTo(lx+Math.cos(aa-.5)*L,ly+Math.sin(aa-.5)*L,lx,ly); }
  x.fillStyle='#fdfdfd'; x.fill(lv); x.lineWidth=1.6; x.strokeStyle=INK2; x.globalAlpha=.85; x.stroke(lv); x.globalAlpha=1;
  // grass at the foot
  const gp=[]; for(let i=0;i<26;i++) gp.push([bx-200+R()*400,Ht-4-R()*14,1]); grassTufts(x,gp,34,.9);
  return c; }
function groundShadowTex(){ const [c,x]=canvas(512,256); const P=polyPath(irrPts(256,128,236,104,14,.12),true); x.fillStyle='rgba(27,27,27,.20)'; x.fill(P); x.save(); x.clip(P); hatchLines(x,0,0,512,256,5,-.3,1.2,.55); hatchLines(x,0,0,512,256,8,.4,1,.3); x.restore(); return c; }
function irrPts(cx,cy,rx,ry,n,j){ const a0=R()*6.28, out=[]; for(let i=0;i<n;i++){ const a=a0+i/n*6.283+(R()-.5)*.3, k=1+(R()-.5)*j; out.push([cx+Math.cos(a)*rx*k,cy+Math.sin(a)*ry*k]); } return out; }

function robotTex(){ const [c,x]=canvas(420,460);
  const sh=new Path2D(); sh.ellipse(212,446,150,13,0,0,6.283); x.fillStyle='rgba(21,21,21,.35)'; x.fill(sh);
  const box=(px,py,w,h,fill,hat,lw)=>{ const P=polyPath([[px+(R()-.5)*3,py+(R()-.5)*3],[px+w+(R()-.5)*3,py+(R()-.5)*3],[px+w+(R()-.5)*3,py+h+(R()-.5)*3],[px+(R()-.5)*3,py+h+(R()-.5)*3]]); x.fillStyle=fill; x.fill(P); if(hat){ x.save(); x.clip(P); x.beginPath(); x.rect(px+w*.62,py,w*.38,h); x.rect(px,py+h*.8,w,h*.2); x.clip(); hatchLines(x,px,py,w,h,4,-.9,1.1,hat); x.restore(); } sketchOutline(x,P,lw||4,1); return P; };
  // legs + arms
  box(150,380,40,58,'#fafafa',.6,3.4); box(232,380,40,58,'#fafafa',.6,3.4);
  const arm=(pts)=>{ const p=new Path2D(); p.moveTo(...pts[0]); for(const q of pts.slice(1)) p.lineTo(...q); x.lineWidth=13; x.strokeStyle=INK2; x.lineCap='round'; x.lineJoin='round'; x.stroke(p); x.lineWidth=6; x.strokeStyle='#fbfbfb'; x.stroke(p); };
  arm([[140,300],[84,350],[98,372]]); arm([[282,300],[330,250],[350,262]]);
  box(135,270,150,110,'#fbfbfb',.5,4.2);
  wobCircle(x,175,325,12,{w:2.4,passes:1}); wobCircle(x,210,325,12,{w:2.4,passes:1}); x.fillStyle='#c9c9c9'; x.beginPath(); x.arc(245,325,10,0,6.283); x.fill(); wobCircle(x,245,325,11,{w:2.4,passes:1});
  box(110,120,200,150,'#fcfcfc',.45,4.6);
  const scr=polyPath([[132,142],[288,142],[288,246],[132,246]]); x.fillStyle='#ffffff'; x.fill(scr); sketchOutline(x,scr,2.8,1);
  x.fillStyle=INK2; x.fillRect(170,175,18,26); x.fillRect(232,175,18,26); x.fillStyle='#ffffff'; x.fillRect(173,178,5,6); x.fillRect(235,178,5,6);
  wobPoly(x,[[180,222],[210,233],[240,222]],{w:3.4});
  wobLine(x,210,120,210,72,{w:3.6}); x.fillStyle='#c9c9c9'; x.beginPath(); x.arc(210,60,13,0,7); x.fill(); wobCircle(x,210,60,13,{w:2.8}); x.fillStyle='#ffffff'; x.beginPath(); x.arc(206,56,3.5,0,7); x.fill();
  x.fillStyle=INK2; x.font='700 42px Caveat'; x.fillText('hi!',335,230); return c; }

function frontPlantTex(){ const [c,x]=canvas(512,700); const cx=256;
  const sh=new Path2D(); sh.ellipse(256,688,150,12,0,0,6.283); x.fillStyle='rgba(21,21,21,.35)'; x.fill(sh);
  const leaves=[]; for(let i=0;i<15;i++){ const a=-Math.PI/2+(R()-.5)*2.3, L=170+R()*200; leaves.push([a,L]); } leaves.sort((p,q)=>q[1]-p[1]);
  for(const [a,L] of leaves){ const ex=cx+Math.cos(a)*L, ey=470+Math.sin(a)*L; const st=new Path2D(); st.moveTo(cx,470); st.quadraticCurveTo(cx+(ex-cx)*.5+(R()-.5)*30,470+(ey-470)*.5,ex,ey); x.lineWidth=3; x.strokeStyle=INK2; x.stroke(st);
    const lw=24+R()*16; x.save(); x.translate(ex,ey); x.rotate(a+Math.PI/2); const lf=new Path2D(); lf.moveTo(0,lw*2); lf.quadraticCurveTo(lw*1.2,0,0,-lw*2); lf.quadraticCurveTo(-lw*1.2,0,0,lw*2); x.fillStyle='#fcfcfc'; x.fill(lf); x.save(); x.clip(lf); x.beginPath(); x.rect(0,-lw*2,lw*2,lw*4); x.clip(); hatchLines(x,-lw*2,-lw*2,lw*4,lw*4,4,-.8,1,.6); x.restore(); sketchOutline(x,lf,2.4,1); const mid=new Path2D(); mid.moveTo(0,lw*1.9); mid.lineTo(0,-lw*1.8); for(let k=-3;k<=3;k++){ if(!k)continue; mid.moveTo(0,k*lw*.45); mid.lineTo(lw*.6*(k>0?1:1)*(k%2?1:-1),k*lw*.45-lw*.35); } x.lineWidth=1.2; x.globalAlpha=.7; x.stroke(mid); x.globalAlpha=1; x.restore(); }
  const pot=polyPath([[150,480],[362,480],[334,690],[178,690]]); x.fillStyle='#fbfbfb'; x.fill(pot); x.save(); x.clip(pot); x.beginPath(); x.rect(270,470,100,230); x.clip(); hatchLines(x,150,470,220,230,4,-.9,1.1,.6); hatchLines(x,150,470,220,230,7,.8,1,.35); x.restore(); sketchOutline(x,pot,3.6,1);
  const rim=polyPath([[136,452],[376,452],[372,490],[140,490]]); x.fillStyle='#fcfcfc'; x.fill(rim); x.save(); x.clip(rim); hatchLines(x,136,478,240,14,3.5,-.9,1,.6); x.restore(); sketchOutline(x,rim,3.6,1);
  return c; }

function frontHandleTex(){ const [c,x]=canvas(300,120);
  x.fillStyle='rgba(12,12,12,.28)'; x.beginPath(); x.moveTo(34,60); x.quadraticCurveTo(140,56,240,58); x.lineTo(240,86); x.quadraticCurveTo(140,84,36,90); x.closePath(); x.fill();
  const g=x.createLinearGradient(0,44,0,76); g.addColorStop(0,'#fefefe'); g.addColorStop(.35,'#f7f7f7'); g.addColorStop(1,'#585858'); x.fillStyle=g;
  const lv=new Path2D(); lv.moveTo(26,54); lv.quadraticCurveTo(22,45,34,45); lv.quadraticCurveTo(140,41,238,46); lv.lineTo(238,74); lv.quadraticCurveTo(140,72,34,75); lv.quadraticCurveTo(20,73,26,54); lv.closePath(); x.fill(lv); x.lineWidth=3.2; x.strokeStyle=INK2; x.stroke(lv);
  x.beginPath(); x.moveTo(38,50); x.quadraticCurveTo(140,47,226,51); inkStroke(x,2.6,.85,'#ffffff');
  const g2=x.createRadialGradient(242,52,3,250,60,30); g2.addColorStop(0,'#ffffff'); g2.addColorStop(.5,'#f6f6f6'); g2.addColorStop(1,'#515151'); x.fillStyle=g2; x.beginPath(); x.arc(250,60,27,0,6.283); x.fill(); inkStroke(x,3.2,1); x.beginPath(); x.arc(250,60,15,0,6.283); inkStroke(x,1.6,.7);
  return c; }

function groundTex(){ const S2=2048; const [c,x]=canvas(S2,S2); const mx=S2/14, mz=S2/12; x.fillStyle='#fcfcfc'; x.fillRect(0,0,S2,S2); speck(x,0,0,S2,S2,22000,.32); 
  // soil/shade strip along the wall base
  x.save(); x.beginPath(); x.rect(0,0,S2,.32*mz); x.clip(); x.fillStyle='rgba(33,33,33,.12)'; x.fillRect(0,0,S2,.32*mz); hatchLines(x,0,0,S2,.32*mz,5,-.4,1.1,.5); x.restore();
  // lawn tufts: denser near the path edges and the wall
  const tp=[]; for(let i=0;i<4200;i++){ const wxm=(R()*2-1)*7, wzm=R()*12; const near=Math.abs(Math.abs(wxm)-1.0)<.6||wzm<.6; if(!near&&R()<.45)continue; tp.push([S2/2+wxm*mx, wzm*mz, .8+R()*.6]); } grassTufts(x,tp,15,.55);
  // pebbles
  for(let i=0;i<160;i++){ const px=R()*S2, py=R()*S2, r=3+R()*6; const P=polyPath(irrPts(px,py,r*1.3,r,7,.3),true); x.fillStyle='#fbfbfb'; x.fill(P); sketchOutline(x,P,1.4,.8); }
  return c; }
function pathTex(){ const PX=300, Wd=1020, Hd=2400; const [c,x]=canvas(Wd,Hd); const toX=m=>Wd/2+m*PX, toY=z=>(z-4.5)*PX;
  const cxAt=z=>.1*Math.sin((z-4.5)*.75), hwAt=z=>{ const u=Math.min(1,Math.max(0,(z-4.5)/1.6)), s=u*u*(3-2*u); return 1.3+(.82-1.3)*s+.04*Math.sin(z*1.7); };
  // earth bed under the stones, with a ragged edge
  const L=[],Rr=[]; for(let z=4.5; z<=12.6; z+=.12){ const cx=cxAt(z), hw=hwAt(z)+.1; L.push([toX(cx-hw+(R()-.5)*.06),toY(z)]); Rr.push([toX(cx+hw+(R()-.5)*.06),toY(z)]); }
  const bed=new Path2D(); bed.moveTo(L[0][0],-4); L.forEach(p=>bed.lineTo(p[0],p[1])); bed.lineTo(L[L.length-1][0],Hd+4); bed.lineTo(Rr[Rr.length-1][0],Hd+4); for(let i=Rr.length-1;i>=0;i--) bed.lineTo(Rr[i][0],Rr[i][1]); bed.lineTo(Rr[0][0],-4); bed.closePath();
  x.fillStyle='#f8f8f8'; x.fill(bed); x.save(); x.clip(bed); speck(x,0,0,Wd,Hd,14000,.6); hatchLines(x,0,0,Wd,Hd,6,-.5,1.1,.35); x.restore();
  // stones
  const stones=[]; let z=4.56; while(z<12.5){ const d=.4+R()*.2, zc=z+d/2, cx=cxAt(zc), hw=hwAt(zc); const n=hw>1.05?3:(R()<.55?2:3); let xs=[0]; for(let i=1;i<n;i++) xs.push(i/n+(R()-.5)*.18/n*2); xs.push(1); xs=xs.map(v=>cx-hw+v*2*hw);
    for(let i=0;i<n;i++){ const x0=xs[i]+.045, x1=xs[i+1]-.045, z0=z+.04+R()*.02, z1=z+d-.04-R()*.02; const ccx=(x0+x1)/2, ccz=(z0+z1)/2, rx=(x1-x0)/2, rz=(z1-z0)/2; const pts=[]; const m=6+(R()*3|0), a0=R()*6.28;
      for(let k=0;k<m;k++){ const a=a0+k/m*6.283+(R()-.5)*.3, ca=Math.cos(a), sa=Math.sin(a), p=2.6, rr=1/Math.pow(Math.pow(Math.abs(ca),p)+Math.pow(Math.abs(sa),p),1/p), j=1+(R()-.5)*.2; pts.push([toX(ccx+ca*rx*rr*j),toY(ccz+sa*rz*rr*j)]); }
      stones.push({P:polyPath(pts,false),cx:toX(ccx),cy:toY(ccz),rx:rx*PX,ry:rz*PX}); } z+=d; }
  x.save(); x.translate(5,9); for(const s of stones){ x.fillStyle='rgba(19,19,19,.42)'; x.fill(s.P); } x.restore();
  const tones=['#fbfbfb','#f9f9f9','#fafafa','#f8f8f8','#fcfcfc'];
  for(const s of stones){ x.fillStyle=tones[R()*tones.length|0]; x.fill(s.P); x.save(); x.clip(s.P); speck(x,s.cx-s.rx,s.cy-s.ry,s.rx*2,s.ry*2,(s.rx*s.ry*.02)|0,.55);
      const sh=polyPath([[s.cx-s.rx*1.3,s.cy+s.ry*.25],[s.cx+s.rx*.2,s.cy+s.ry*.05],[s.cx+s.rx*.75,s.cy-s.ry*1.3],[s.cx+s.rx*1.3,s.cy-s.ry*1.3],[s.cx+s.rx*1.3,s.cy+s.ry*1.3],[s.cx-s.rx*1.3,s.cy+s.ry*1.3]]); x.save(); x.clip(sh); hatchLines(x,s.cx-s.rx,s.cy-s.ry,s.rx*2,s.ry*2,4.2,-.95,1.2,.62); x.restore();
      if(R()<.4) hatchLines(x,s.cx-s.rx,s.cy-s.ry,s.rx*2,s.ry*2,10,.7,1,.18);
      const nc=R()<.7?(1+(R()*2|0)):0; for(let k=0;k<nc;k++){ let px=s.cx+(R()-.5)*s.rx*1.6, py=s.cy+(R()-.5)*s.ry*1.6; const cp=new Path2D(); cp.moveTo(px,py); const a=R()*6.28; for(let q=0;q<4;q++){ px+=Math.cos(a+(R()-.5)*1.4)*(12+R()*16); py+=Math.sin(a+(R()-.5)*1.4)*(10+R()*12); cp.lineTo(px,py); } x.lineWidth=1.5; x.strokeStyle=INK2; x.globalAlpha=.85; x.stroke(cp); x.globalAlpha=1; }
      x.restore();
      x.save(); x.clip(s.P); x.translate(5,6); x.lineWidth=3; x.strokeStyle='rgba(255,255,255,.85)'; x.stroke(s.P); x.restore();
      sketchOutline(x,s.P,3.6,.95); }
  // grass tufts in the joints and along the edges
  const tp=[]; for(let i=0;i<800;i++){ const zz=4.6+R()*7.9, cx=cxAt(zz), hw=hwAt(zz); const side=R(); const xm= side<.45? cx+(R()<.5?-1:1)*(hw+.02+R()*.12) : cx+(R()*2-1)*hw; tp.push([toX(xm),toY(zz),side<.45?1.2:.8]); } grassTufts(x,tp,24,.8);
  return c; }
function stepTex(top){ const [c,x]=canvas(1024,top?220:110); const w=1024,h=top?220:110; x.fillStyle=top?'#fcfcfc':'#f9f9f9'; x.fillRect(0,0,w,h); speck(x,0,0,w,h,top?2200:1200,.5);
  if(top){ for(const jx of [330,700]) wobLine(x,jx,0,jx+(R()-.5)*8,h,{w:2.4,passes:1}); hatchLines(x,0,0,w,40,4,-.9,1,.5); x.globalAlpha=.8; x.fillStyle='#ffffff'; x.fillRect(0,h-10,w,5); x.globalAlpha=1; }
  else { hatchLines(x,0,0,w,h,4.5,-.9,1.1,.55); for(const jx of [330,700]) wobLine(x,jx,0,jx,h,{w:2.4,passes:1}); }
  wobRect(x,3,3,w-6,h-6,{w:4,tilt:2}); return c; }

async function frontLeafTex(sideRight){ const Wd=512,Hd=1330; const [c,x]=canvas(Wd,Hd); const st=66;
  x.fillStyle='#f9f9f9'; x.fillRect(0,0,Wd,Hd); grainLines(x,0,0,Wd,Hd,54,true);
  const rails=[[0,64],[330,384],[600,750],[1150,1330]];
  rails.forEach(([a,b])=>{ x.fillStyle='#f9f9f9'; x.fillRect(st,a,Wd-2*st,b-a); grainLines(x,st,a,Wd-2*st,b-a,Math.max(3,(b-a)/11|0),false); });
  rails.forEach(([a,b])=>{ if(a>0) wobLine(x,st,a,Wd-st,a,{w:2.2,a:.9,amp:.6,passes:1}); if(b<Hd) wobLine(x,st,b,Wd-st,b,{w:2.2,a:.9,amp:.6,passes:1}); });
  wobLine(x,st,0,st,Hd,{w:2.2,a:.9,amp:.6,passes:1}); wobLine(x,Wd-st,0,Wd-st,Hd,{w:2.2,a:.9,amp:.6,passes:1});
  for(const [a,b] of [[64,330],[384,600],[750,1150]]){ const px=st+4, pw=Wd-2*st-8, py=a+4, ph=b-a-8, bv=30;
    const P=[[px,py],[px+pw,py],[px+pw,py+ph],[px,py+ph]], Q=[[px+bv,py+bv],[px+pw-bv,py+bv],[px+pw-bv,py+ph-bv],[px+bv,py+ph-bv]];
    const quad=(i,j,fill,ha)=>{ const p=polyPath([P[i],P[j],Q[j],Q[i]]); x.fillStyle=fill; x.fill(p); if(ha){ x.save(); x.clip(p); hatchLines(x,px,py,pw,ph,4.2,-.85,1,ha); x.restore(); } };
    quad(0,1,'#fcfcfc',0); quad(3,0,'#fcfcfc',0); quad(1,2,'#f7f7f7',.45); quad(2,3,'#f6f6f6',.65);
    x.fillStyle='#fafafa'; x.fillRect(Q[0][0],Q[0][1],pw-2*bv,ph-2*bv); x.save(); x.beginPath(); x.rect(Q[0][0],Q[0][1],pw-2*bv,ph-2*bv); x.clip(); grainLines(x,Q[0][0],Q[0][1],pw-2*bv,ph-2*bv,9,true); x.restore();
    for(let i=0;i<4;i++) wobLine(x,P[i][0],P[i][1],Q[i][0],Q[i][1],{w:1.7,amp:.4,passes:1,over:false});
    wobRect(x,px,py,pw,ph,{w:3.2,tilt:1.5,amp:.7}); wobRect(x,Q[0][0],Q[0][1],pw-2*bv,ph-2*bv,{w:2.3,tilt:1.2,amp:.6});
    x.save(); x.beginPath(); x.rect(px,py,pw,11); x.clip(); hatchLines(x,px,py,pw,11,3,-.8,1,.6); x.restore(); }
  // brushed metal kick plate
  { const ky=1196, kh=112, P=polyPath([[16,ky],[Wd-16,ky],[Wd-16,ky+kh],[16,ky+kh]]); const g=x.createLinearGradient(0,ky,0,ky+kh); g.addColorStop(0,'#fbfbfb'); g.addColorStop(1,'#f5f5f5'); x.fillStyle=g; x.fill(P); x.save(); x.clip(P); hatchLines(x,16,ky,Wd-32,kh,5,0,1,.22); hatchLines(x,16,ky,Wd-32,kh,4,-.9,1,.3); x.restore(); sketchOutline(x,P,2.8,.95); for(const sx of [34,Wd-34]) for(const sy of [ky+18,ky+kh-18]){ x.beginPath(); x.arc(sx,sy,5,0,6.283); x.fillStyle='#555555'; x.fill(); } }
  // shadow under the door head + along the meeting edge
  x.save(); x.beginPath(); x.rect(0,0,Wd,80); x.clip(); hatchLines(x,0,0,Wd,80,3.8,-.9,1.1,.55); x.restore();
  const ie=sideRight?0:Wd-16; x.save(); x.beginPath(); x.rect(ie,0,16,Hd); x.clip(); hatchLines(x,ie,0,16,Hd,3.4,-.6,1.1,.7); x.restore();
  wobRect(x,3,3,Wd-6,Hd-6,{w:5,tilt:2});
  // escutcheon plate + keyhole
  const hx=sideRight?40:472; { const P=polyPath([[hx-21,580],[hx+21,580],[hx+21,800],[hx-21,800]]); const g=x.createLinearGradient(hx-21,0,hx+21,0); g.addColorStop(0,'#fdfdfd'); g.addColorStop(.5,'#f8f8f8'); g.addColorStop(1,'#d0d0d0'); x.fillStyle=g; x.fill(P); sketchOutline(x,P,3,1); for(const sy of [596,784]){ x.beginPath(); x.arc(hx,sy,4.5,0,6.283); x.fillStyle='#3b3b3b'; x.fill(); } x.fillStyle='#141414'; x.beginPath(); x.arc(hx,742,7,0,6.283); x.fill(); x.beginPath(); x.moveTo(hx-4,744); x.lineTo(hx+4,744); x.lineTo(hx+6,764); x.lineTo(hx-6,764); x.closePath(); x.fill(); }
  const L=sideRight?[['youtube',300,330,62,.2],['github',170,470,54,-.15],['amazon',330,820,60,.12],['googleclassroom',190,960,56,-.1],[null,320,1180,50,.2,'</>','#2f6fd6'],['blender',150,1240,46,-.2]]:[['unity',180,330,62,-.15],['itchdotio',330,470,58,.18],['python',170,800,58,.1],['dotnet',330,950,56,-.12],['amazonwebservices',190,1160,62,.15],[null,340,1250,48,-.18,'C#','#512BD4']];
  for(const s of L) sticker(x,s[1],s[2],s[3],s[4],s[0],s[5],s[6]);
  return c; }
async function buildFront(){
  const fg=new THREE.Group(); scene.add(fg); FRONT.g=fg;
  const wall=plane(12,7,tex(bricksTex()),{transparent:true}); wall.material.alphaTest=.5; wall.material.transparent=false; wall.position.set(0,3.5,4); fg.add(wall);
  const gr=plane(14,12,tex(groundTex())); gr.rotation.x=-Math.PI/2; gr.position.set(0,-.003,10); fg.add(gr);
  const pa=plane(3.4,8,tex(pathTex()),{transparent:true}); pa.rotation.x=-Math.PI/2; pa.position.set(0,.002,8.5); pa.renderOrder=1; fg.add(pa);
  const stT=tex(stepTex(true)), stF=tex(stepTex(false)); const stM=[stF,stF,stT,stF,stF,stF].map(m=>new THREE.MeshBasicMaterial({map:m})); const step=new THREE.Mesh(new THREE.BoxGeometry(2.9,.13,.47),stM); step.position.set(0,.065,4.265); fg.add(step);
  const sp=new THREE.Group(); sp.position.set(0,4.95,4.12); fg.add(sp); const sg=plane(3.3,1.8,tex(bigSignTex()),{transparent:true}); sg.position.set(0,-.9,0); sp.add(sg); sp.rotation.z=-.01; FRONT.sign=sp;
  const shT=tex(groundShadowTex()); FRONT.tsh=plane(2.4,1.1,shT,{transparent:true}); FRONT.tsh.rotation.x=-Math.PI/2; FRONT.tsh.renderOrder=2; fg.add(FRONT.tsh);
  FRONT.tree=plane(3.2,4,tex(frontTreeTex()),{transparent:true,double:true}); fg.add(FRONT.tree);
  FRONT.plant=plane(1.1,1.5,tex(frontPlantTex()),{transparent:true,double:true}); fg.add(FRONT.plant);
  FRONT.robot=plane(.62,.68,tex(robotTex()),{transparent:true,double:true}); fg.add(FRONT.robot);
  placeFront();
  const ht=tex(frontHandleTex()); FRONT.leaves=[]; FRONT.handles=[];
  for(const sd of [-1,1]){ const pv=new THREE.Group(); pv.position.set(sd*1.1,0,4.02); fg.add(pv); const lf=plane(1.1,2.7,tex(await frontLeafTex(sd>0))); lf.position.set(-sd*.55,1.35,0); pv.add(lf); lf.userData.front=true; clickables.push(lf); FRONT.leaves.push(pv);
    const hp=new THREE.Group(); hp.position.set(-sd*(1.1-.12),1.33,.03); pv.add(hp); const hm=plane(.36,.144,ht,{transparent:true}); hm.position.set(-.12,0,0); hp.add(hm); if(sd<0){ hp.scale.x=-1; } hm.userData.front=true; clickables.push(hm); FRONT.handles.push(hp); }
}
/* portrait phones see a narrower slice of the facade, so the tree/robot/plant step in closer */
function placeFront(){ if(!FRONT.tree)return; const port=innerWidth/innerHeight<.8;
  if(port){ FRONT.tree.position.set(-2.0,2.0,5.0); FRONT.robot.position.set(-1.3,.34,4.85); FRONT.plant.position.set(1.72,.75,4.7); }
  else { FRONT.tree.position.set(-3.7,2.0,4.7); FRONT.robot.position.set(-1.75,.34,4.5); FRONT.plant.position.set(2.1,.75,4.6); }
  FRONT.tsh.position.set(FRONT.tree.position.x+.55,.004,FRONT.tree.position.z+.15); }
const FRONT={open:false};
/* ---------------- scene ---------------- */
const DOORS=[
 {key:'about',label:'ABOUT ME',sheets:[{img:'assets/pv/me.jpg',x:180,y:470,w:230,h:270,r:-.08,cap:"that's me"},{text:"hi, I'm\nPrajwal",fs:52,x:390,y:690,w:200,h:170,r:.1}],doodle:null},
 {key:'book',label:'MY BOOK',side:1,sheets:[{img:'assets/pv/bookcover.jpg',x:185,y:480,w:220,h:330,r:-.07,cap:'Game On'},{text:'flip\nthrough\nit ✎',fs:44,x:400,y:700,w:190,h:170,r:.09}]},
 {key:'projects',label:'PROJECTS',sheets:[{img:'assets/pv/book.jpg',x:170,y:480,w:200,h:290,r:-.07},{svg:'FLAME',x:400,y:520,w:190,h:210,r:.09,cap:'IFERTS'},{text:'paper\nsubmitted!',fs:40,x:300,y:740,w:210,h:130,r:-.04}]},
 {key:'games',label:'GAMES',sheets:[{img:'assets/pv/game0.jpg',x:165,y:420,w:200,h:170,r:-.08},{img:'assets/pv/game1.jpg',x:395,y:440,w:190,h:160,r:.07},{img:'assets/pv/game2.jpg',x:180,y:640,w:190,h:160,r:.05},{img:'assets/pv/game3.jpg',x:400,y:660,w:190,h:160,r:-.06}]},
 {key:'experience',label:'EXPERIENCE',sheets:[{svg:'BRIEF',x:180,y:470,w:210,h:220,r:-.06},{text:'Denovate\nRural Games\nSave Computer',fs:38,x:390,y:620,w:230,h:220,r:.08}]},
 {key:'workshops',label:'TEACHING & WORKSHOPS',sheets:[{img:'assets/pv/teach.jpg',x:185,y:450,w:250,h:190,r:-.07,cap:'IIIT Nagpur'},{img:'assets/pv/workshop.jpg',x:380,y:650,w:250,h:190,r:.08,cap:'workshops'}]},
 {key:'achievements',label:'AWARDS',sheets:[{img:'assets/pv/award.jpg',x:190,y:460,w:240,h:220,r:-.06},{svg:'MEDAL',x:395,y:650,w:200,h:220,r:.08,cap:'unlocked!'}]},
 {key:'social',label:'SOCIAL',sheets:[{svg:'BUBBLE',x:190,y:470,w:220,h:220,r:-.07},{text:'say hi!\n@ in ▶',fs:48,x:380,y:670,w:220,h:180,r:.08}]}
];
const SVGS={FLAME:'<path class="red" d="M50 12 C 63 30, 76 42, 71 62 C 67 78, 57 86, 50 86 C 39 86, 28 77, 29 62 C 30 50, 40 45, 42 32 C 48 40, 50 47, 50 54 C 57 46, 55 28, 50 12 z"/><path d="M50 62 C 57 68, 57 79, 50 81 C 43 79, 43 69, 50 62 z"/>',
 BRIEF:'<rect x="16" y="38" width="68" height="42" rx="4"/><path d="M38 38 v-9 h24 v9"/><path d="M16 56 h68"/><rect class="red" x="45" y="51" width="10" height="10"/>',
 MEDAL:'<path d="M36 10 l14 30 l14 -30"/><circle cx="50" cy="62" r="22"/><circle cx="50" cy="62" r="14"/><path class="red" d="M50 52l3 6 7 .7-5 4.6 1.5 7-6.5-3.7-6.5 3.7 1.5-7-5-4.6 7-.7z"/>',
 BUBBLE:'<path d="M16 22 h52 a8 8 0 0 1 8 8 v24 a8 8 0 0 1 -8 8 h-30 l-12 12 v-12 h-10 a8 8 0 0 1 -8 -8 v-24 a8 8 0 0 1 8 -8 z"/><path class="red" d="M44 36 c-4 -6 -14 -2 -10 6 c2 4 10 9 10 9 c0 0 8 -5 10 -9 c4 -8 -6 -12 -10 -6z"/>',
 CUBE:'<path d="M30 35 l20 -12 l20 12 v26 l-20 12 l-20 -12 z"/><path d="M30 35 l20 12 l20 -12 M50 47 v26"/><circle cx="43" cy="52" r="2" class="fillk"/><circle cx="55" cy="52" r="2" class="fillk"/>',
 PAD:'<path d="M22 40 h56 c10 0 14 26 6 30 c-6 3 -12 -6 -18 -8 h-32 c-6 2 -12 11 -18 8 c-8 -4 -4 -30 6 -30 z"/><path d="M32 48 v10 M27 53 h10"/><circle cx="66" cy="50" r="3"/><circle class="red" cx="72" cy="57" r="3"/>',
 MOUNT:'<path d="M10 78 l24 -34 l14 18 l14 -26 l28 42 z"/><circle class="red" cx="72" cy="26" r="8"/><path d="M20 84 h60"/>'};
const HW=2, H=3.5, Z0=-6, STEP=6.4, N=DOORS.length, ZEND=Z0-STEP*(N-1)-9;
const DSIDE={about:-1,book:1,projects:1,games:-1,experience:1,workshops:-1,achievements:1,social:-1}; // walls as before; BOOK sits opposite ABOUT ME
const ZS=z=>z<-11.6?z-STEP:z; // the BOOK door (index 1) pushed everything past ABOUT ME one step down the hall
let scene, camera, fogC=0xf4f3ef, doors=[], clickables=[], s=-2, ts=-2, vfov=60, lastInput=0, roomOpen=false, anim=null, needs=true, mouse={x:0,y:0,tx:0,ty:0};
const lineMat=new THREE.LineBasicMaterial({color:0x1c1c20});
function inkBox(w,h,d,pos,grp){ const g=new THREE.BoxGeometry(w,h,d); const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0xf3f1ea})); m.position.set(...pos); grp.add(m);
  const e=new THREE.EdgesGeometry(g); const l=new THREE.LineSegments(e,lineMat); l.position.copy(m.position); grp.add(l); const l2=new THREE.LineSegments(e,new THREE.LineBasicMaterial({color:0x1c1c20,transparent:true,opacity:.35})); l2.position.copy(m.position).add(new THREE.Vector3((R()-.5)*.01,(R()-.5)*.01,(R()-.5)*.01)); l2.scale.setScalar(1.012); grp.add(l2); return m; }
function plane(w,h,map,opts={}){ const mat=new THREE.MeshBasicMaterial({map,transparent:!!opts.transparent,side:opts.double?THREE.DoubleSide:THREE.FrontSide,depthWrite:!opts.transparent}); return new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat); }
function onWall(obj,side,z,x=0,y=0,off=0.01){ obj.position.set(side*(HW-off),y,z+x*side); obj.rotation.y=-side*Math.PI/2; return obj; } // x moves along wall

async function init(){
  await Promise.all([D.fonts&&D.fonts.load?D.fonts.load('700 60px Caveat'):0, D.fonts&&D.fonts.load?D.fonts.load('900 60px Inter'):0]).catch(()=>{});
  ICONS=ICONDATA||{};
  const host=D.getElementById('world'); const mobile=Math.min(innerWidth,innerHeight)<700;
  renderer=new THREE.WebGLRenderer({antialias:!mobile,powerPreference:'high-performance'}); renderer.setPixelRatio(Math.min(W.devicePixelRatio||1,mobile?1.6:2)); renderer.setSize(innerWidth,innerHeight); renderer.outputColorSpace=THREE.SRGBColorSpace; host.appendChild(renderer.domElement);
  scene=new THREE.Scene(); scene.background=new THREE.Color(fogC); scene.fog=new THREE.Fog(fogC,7,30);
  camera=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,.05,80); camera.rotation.order='YXZ';
  scene.add(new THREE.AmbientLight(0xffffff,1.6)); const dl=new THREE.DirectionalLight(0xffffff,1.2); dl.position.set(1,3,2); scene.add(dl);
  const L=-ZEND+4, zc=(ZEND+4)/2;
  const fl=plane(HW*2,L,tex(floorTex(),1,L/4)); fl.rotation.x=-Math.PI/2; fl.position.set(0,0,zc); scene.add(fl);
  const cl=plane(HW*2,L,tex(ceilTex(),1,L/4)); cl.rotation.x=Math.PI/2; cl.position.set(0,H,zc); scene.add(cl);
  const wt=wallTex(); [-1,1].forEach(sd=>{ const w=plane(L,H,tex(wt,L/4,1)); w.position.set(sd*HW,H/2,zc); w.rotation.y=-sd*Math.PI/2; scene.add(w); });
  const endw=plane(HW*2,H,new THREE.CanvasTexture(await endTex())); endw.material.map.colorSpace=THREE.SRGBColorSpace; endw.position.set(0,H/2,ZEND); scene.add(endw);
  const lt=tex(lightTex()); for(let z=0;z>ZEND+2;z-=5){ const p=plane(1.5,.75,lt); p.rotation.x=Math.PI/2; p.position.set(0,H-.01,z); scene.add(p); }
  // hanging studio sign
  await buildFront();
  // doors
  const ft=tex(frameTex()), arrowR=tex(arrowTex(false)), arrowL=tex(arrowTex(true)), handleT=tex(handleTex()), glowT=tex(glowTex()), skyT=tex(skyTex());
  for(let i=0;i<N;i++){ const d=DOORS[i]; d.side=DSIDE[d.key]||(i%2===0?-1:1); d.z=Z0-STEP*i; d.i=i;
    for(const sh of d.sheets) if(sh.svg&&SVGS[sh.svg]) sh.svg=SVGS[sh.svg];
    const grp=new THREE.Group(); onWall(grp,d.side,d.z,0,0,.26); scene.add(grp);
    const inside=plane(1.18,2.3,d.key==='about'?skyT:glowT); inside.position.set(0,1.15,-.24); grp.add(inside);
    inkBox(.12,2.42,.28,[-.65,1.21,-.12],grp); inkBox(.12,2.42,.28,[.65,1.21,-.12],grp); inkBox(1.42,.12,.28,[0,2.36,-.12],grp);
    const pivot=new THREE.Group(); pivot.position.set(-.59,0,-.02); grp.add(pivot);
    const leaf=plane(1.18,2.3,tex(await doorTex(d))); leaf.position.set(.59,1.15,0); pivot.add(leaf);
    const hp=new THREE.Group(); hp.position.set(1.024,1.13,.03); pivot.add(hp); const hm=plane(.36,.144,handleT,{transparent:true}); hm.position.set(-.12,0,0); hp.add(hm); d.handle=hp; clickables.push(hm); hm.userData.door=d;
    const fr=plane(1.42,2.6,ft,{transparent:true}); fr.position.set(0,1.27,.02); grp.add(fr);
    const sign=plane(1.6,.66,tex(signTex(d.label)),{transparent:true}); sign.position.set(0,2.92,.04); sign.rotation.z=(R()-.5)*.05; grp.add(sign);
    const a1=plane(.7,.5,arrowR,{transparent:true}); a1.position.set(-1.2,1.55,-.2); a1.rotation.z=-.25; grp.add(a1);
    const a2=plane(.7,.5,arrowL,{transparent:true}); a2.position.set(1.2,1.55,-.2); a2.rotation.z=.25; grp.add(a2);
    [leaf,fr,sign,inside].forEach(m=>{m.userData.door=d; clickables.push(m)}); d.pivot=pivot; d.open=0; doors.push(d);
  }
  // furniture & frames (all ink-on-paper)
  const pics=[[ 'assets/pv/book.jpg',null,'my book', -1, -14.6],[null,SVGS.CUBE,'cube runner',1,Z0-STEP*1.5],[null,SVGS.PAD,'press start',-1,Z0-STEP*2.5],['assets/pv/me.jpg',null,'the author',1,-22.3],[null,SVGS.MOUNT,'level 7',-1,-27.35],['assets/pv/award.jpg',null,'IBR · Icon · Magic Book',1,-34.9]];
  for(const [img,svg,cap,sd,z] of pics){ const p=plane(.82,1.0,tex(await pictureTex(img,svg,cap))); onWall(p,sd,cap==='my book'?z:ZS(z),0,1.75,.015); p.rotation.z=(R()-.5)*.06; scene.add(p); }
  const furn=new THREE.Group(); scene.add(furn);
  // bench near start (right), side tables with plants, pedestal with trophy
  const bench=(sd,z)=>{ z=ZS(z); inkBox(.42,.07,1.5,[sd*(HW-.3),.46,z],furn); inkBox(.38,.42,.07,[sd*(HW-.3),.22,z-.65],furn); inkBox(.38,.42,.07,[sd*(HW-.3),.22,z+.65],furn); };
  const table=(sd,z)=>{ z=ZS(z); inkBox(.5,.05,.9,[sd*(HW-.32),.78,z],furn); [[-.18,-.38],[.18,-.38],[-.18,.38],[.18,.38]].forEach(o=>inkBox(.04,.76,.04,[sd*(HW-.32)+o[0],.38,z+o[1]],furn)); };
  const ptx=tex(plantTex()), tt=tex(trophyTex());
  const plant=(sd,z,y=0,sc=1)=>{ if(z>ZEND+2) z=ZS(z); const p=plane(.8*sc,1.1*sc,ptx,{transparent:true,double:true}); p.position.set(sd*(HW-.35),y+.55*sc,z); p.rotation.y=-sd*.9; furn.add(p); };
  bench(1,-2.4); table(1,Z0-STEP*.5); plant(1,Z0-STEP*.5,.8,.62); plant(-1,Z0-STEP*1.5+.2); table(-1,Z0-STEP*3.5); plant(-1,Z0-STEP*3.5,.8,.55); bench(-1,Z0-STEP*4.6);
  inkBox(.5,.95,.5,[1*(HW-.35),.475,ZS(Z0-STEP*5.5)],furn); const tr=plane(.42,.55,tt,{transparent:true,double:true}); tr.position.set(HW-.35,1.23,ZS(Z0-STEP*5.5)); tr.rotation.y=-.9; furn.add(tr);
  plant(-1,ZEND+1.2); plant(1,ZEND+1.4);

  // ---- photo frames on the corridor walls: B&W pencil look, press & hold -> original colour ----
  buildPhotoFrames();
  // input
  resize(); W.addEventListener('resize',resize);
  const cv=renderer.domElement; let down=null;
  const pfRelease=()=>{ PF.forEach(f=>{ f.held=false; f.pressT=0; }); };
  cv.addEventListener('contextmenu',e=>e.preventDefault());
  cv.addEventListener('pointerdown',e=>{ const f=(!roomOpen&&!anim&&(FRONT.open||PM.on))?pfPick(e.clientX,e.clientY):null; down={x:e.clientX,y:e.clientY,t:performance.now(),pf:f}; if(f){ f.pressT=performance.now(); try{cv.setPointerCapture(e.pointerId)}catch(_){} } });
  cv.addEventListener('pointerup',e=>{ if(!down)return; const moved=Math.hypot(e.clientX-down.x,e.clientY-down.y), dur=performance.now()-down.t, f=down.pf; down=null;
    if(f){ pfRelease(); if(moved<=10&&dur<260&&!roomOpen){ if(PM.on&&PM.idx!==PM.list.indexOf(f)) pmGo(PM.list.indexOf(f)); else pfLightbox(f); } return; }
    if(PM.on||moved>8||roomOpen||anim)return; const hit=pick(e.clientX,e.clientY); if(hit){ if(hit.key==='__front') openFront(); else api.onDoor&&api.onDoor(hit.key); } });
  cv.addEventListener('pointercancel',()=>{ down=null; pfRelease(); });
  cv.addEventListener('pointermove',e=>{ if(down&&down.pf&&Math.hypot(e.clientX-down.x,e.clientY-down.y)>14){ pfRelease(); down.pf=null; down.x=-1e4; }
    if(e.pointerType==='mouse'){ mouse.tx=(e.clientX/innerWidth-.5); mouse.ty=(e.clientY/innerHeight-.5); const pf=!roomOpen&&(FRONT.open||PM.on)&&pfPick(e.clientX,e.clientY); PF.forEach(f=>f.hover=(f===pf)); const hit=!pf&&!roomOpen&&!PM.on&&pick(e.clientX,e.clientY); cv.style.cursor=(hit||pf)?'pointer':''; D.body.classList.toggle('door-hover',!!hit); needs=true; } });
  cv.addEventListener('pointerleave',e=>{ if(e.pointerType==='mouse') PF.forEach(f=>f.hover=false); });
  api.active=true; D.documentElement.classList.add('world'); update(0); renderer.render(scene,camera);
  requestAnimationFrame(loop);
  return true;
}
const ray=new THREE.Raycaster(), v2=new THREE.Vector2();
function pick(x,y){ v2.set(x/innerWidth*2-1,-(y/innerHeight)*2+1); ray.setFromCamera(v2,camera); const h=ray.intersectObjects(clickables,false)[0]; if(!h||h.distance>12)return null; if(h.object.userData.front) return FRONT.open?null:{key:'__front'}; return h.distance<9?h.object.userData.door:null; }
function resize(){ const a=innerWidth/innerHeight; vfov=a<1?72:58; camera.aspect=a; camera.fov=vfov; camera.updateProjectionMatrix(); renderer.setSize(innerWidth,innerHeight); K=null; placeFront(); needs=true; }
/* camera path: keyframes in s; pauses (zero velocity) when facing each door */
function key(sv){ const pts=[]; const th=Math.tan(THREE.MathUtils.degToRad(vfov/2)), tw=th*camera.aspect;
  const fz=4+Math.max((4.95-1.75)/th, (camera.aspect<.8?2.35:1.6)/tw)+.2; pts.push({s:-2,x:0,z:Math.min(fz,13),y:1.75,yaw:0,stop:true}); pts.push({s:-1,x:0,z:2.4,y:1.62,yaw:0,stop:true});
  doors.forEach((d,i)=>{ const dist=Math.max(1.75/th, .9/tw); const cx=d.side*(HW-Math.min(dist,HW*2-.35));
    pts.push({s:i-.42,x:0,z:d.z+1.9,y:1.6,yaw:0}); pts.push({s:i,x:cx,z:d.z,y:1.72,yaw:-d.side*Math.PI/2,stop:true}); pts.push({s:i+.42,x:0,z:d.z-1.9,y:1.6,yaw:0}); });
  pts.push({s:N,x:0,z:ZEND+3.2,y:1.6,yaw:0,stop:true}); return pts; }
let K=null;
function interp(sv){ if(!K)K=key(); sv=Math.max(-2,Math.min(N,sv)); let k=0; while(k<K.length-2&&K[k+1].s<sv)k++; const a=K[k], b=K[k+1], u=(sv-a.s)/(b.s-a.s);
  const tan=(i,f)=>{ const p=K[i]; if(p.stop||i===0||i===K.length-1) return 0; return (K[i+1][f]-K[i-1][f])/(K[i+1].s-K[i-1].s)*(b.s-a.s); };
  const h=(f)=>{ const p0=a[f],p1=b[f],m0=tan(k,f),m1=tan(k+1,f),u2=u*u,u3=u2*u; return (2*u3-3*u2+1)*p0+(u3-2*u2+u)*m0+(-2*u3+3*u2)*p1+(u3-u2)*m1; };
  return {x:h('x'),z:h('z'),y:h('y'),yaw:h('yaw')}; }
let cur=-2, t0=performance.now(), opening=null, fadeEl=null;
function update(dt){
  const ease=1-Math.pow(.0009,dt); cur+= (ts-cur)*Math.min(1,ease*1.0); if(Math.abs(ts-cur)<.0005)cur=ts;
  // snap to a door when idle
  if(!roomOpen&&!anim&&performance.now()-lastInput>260){ const r=Math.round(ts); if(FRONT.open&&r>=-1&&r<N&&Math.abs(ts-r)<.32&&ts!==r){ ts+= (r-ts)*Math.min(1,dt*7); if(Math.abs(ts-r)<.002)ts=r; needs=true; } }
  const p=interp(cur); mouse.x+=(mouse.tx-mouse.x)*.06; mouse.y+=(mouse.ty-mouse.y)*.06;
  const t=(performance.now()-t0)/1000, bob=Math.sin(cur*9)*.015;
  let x=p.x,z=p.z,y=p.y+bob,yaw=p.yaw-mouse.x*.12, pitch=-mouse.y*.06+Math.sin(t*.7)*.004;
  if(anim){ const a=anim, u=Math.min(1,(performance.now()-a.t0)/a.dur), e=u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2; a.step(e,u); if(u>=1){ const done=a.done; anim=null; done&&done(); } if(a.cam){ x+=a.cam.x; z+=a.cam.z; } needs=true; }
  if(PM.b>0||PM.on){ const bt=PM.on?1:0; PM.b=RM?bt:(bt>PM.b?Math.min(1,PM.b+dt/.9):bt<PM.b?Math.max(0,PM.b-dt/.8):PM.b); pmTick(dt);
    const e=PM.b*PM.b*(3-2*PM.b), q=PM.pose; x+=(q.x-x)*e; z+=(q.z-z)*e; y+=(q.y-y)*e; yaw+=(q.yaw-mouse.x*.04-yaw)*e; pitch*=1-e*.8; needs=true; }
  camera.position.set(x,y,z); camera.rotation.set(pitch,yaw,0);
  // doors: ajar when facing
  doors.forEach(d=>{ const near=Math.max(0,1-Math.abs(cur-d.i)/.25); const target=d.force!=null?d.force:near*.16+(D.body.classList.contains('door-hover')&&near>.5?.1:0); d.open+= (target-d.open)*.12; d.pivot.rotation.y=d.open; if(d.handle&&!anim){ const hv=D.body.classList.contains('door-hover')&&near>.5; d.handle.rotation.z+= ((hv?Math.sin(performance.now()/90)*.08+.08:0)-d.handle.rotation.z)*.2; } });
  pfUpdate(dt);
  const near=!PM.on&&PM.b<.01&&doors.find(d=>Math.abs(cur-d.i)<.12); api.onNear&&api.onNear(near?near.key:null, cur);
}

/* ---------------- corridor photo frames (pencil B&W, hold to colour) ---------------- */
const PF=[]; let pfHit=[], pfPlace=null;
const PHOTOS=[ // [file, w, h, side, z, y, longSide(m), caption, door] — hung just past each door, where the camera sweeps as you turn in/out
 ['c03',799,800,-1,-8.0, 1.95,.74,'',              'about'],
 ['c02',800,600,-1,-9.1, 2.18,.88,'Game On launch','about'],
 ['c06',360,800,-1,-10.1,1.88,1.02,'marathon finisher','about'],
 ['c15',446,800,-1,-11.05,2.02,.98,'presenting Game On','about'],
 ['c14',450,800, 1,-14.35,2.0,.98,'in VR','projects'],
 ['c04',565,800, 1,-27.35,1.95,1.02,'GameJamPlus organizer','experience'],
 ['c05',720,719, 1,-28.6,2.08,.86,'GameJamPlus in numbers','experience'],
 ['c11',800,531,-1,-33.85,2.0,.95,'felicitation','workshops'],
 ['c12',800,449,-1,-35.1,2.25,.95,'Endless Cube Runner','workshops'],
 ['c10',600,800,-1,-36.25,1.9,.95,'workshop day','workshops'],
 ['c13',600,800,-1,-37.3,2.02,.95,'Nagpur workshop','workshops'],
 ['c08',566,800, 1,-40.0,1.95,1.0,'Students Achievements','achievements'],
 ['c09',565,800, 1,-41.05,2.25,.92,'AI Insights Bulletin','achievements'],
 ['c07',618,800, 1,-42.1,1.95,1.0,'Times of India','achievements'],
 ['c01',739,800, 1,-43.2,2.05,.9,'Best Non-Fiction nominee','achievements'],
 ['c16',446,800, 1,-44.25,1.95,1.0,'Magic Book of Record','achievements'],
];
function pfFrameTex(pw,ph,cap,seed){ R=rnd(seed); const PX=360, M=.075, TOP=.27, BOT=cap?.2:.06, SD=.04;
  const fw=pw+2*M, fh=ph+2*M, W2=Math.round((fw+2*SD)*PX), H2=Math.round((fh+TOP+BOT)*PX);
  const [c,x]=canvas(W2,H2); const ox=SD*PX, oy=TOP*PX, w=fw*PX, h=fh*PX, m=M*PX;
  // soft pencil shadow + paper frame band
  x.save(); x.shadowColor='rgba(28,28,32,.22)'; x.shadowBlur=14; x.shadowOffsetX=5; x.shadowOffsetY=8; x.fillStyle='#f7f5ef'; x.fillRect(ox,oy,w,h); x.restore();
  x.save(); x.beginPath(); x.rect(ox,oy,w,h); x.rect(ox+m*.62,oy+h-m*.62,w-m*1.24,-(h-m*1.24)); x.clip('evenodd'); hatchArea(x,ox,oy,w,h,{gap:6,a:.32,w:.9}); x.restore();
  x.fillStyle='#fbfaf6'; x.fillRect(ox+m*.62,oy+m*.62,w-m*1.24,h-m*1.24);
  wobRect(x,ox,oy,w,h,{w:2.6,amp:1.3,tilt:4}); wobRect(x,ox+m*.62,oy+m*.62,w-m*1.24,h-m*1.24,{w:1.6,amp:1,tilt:3});
  wobRect(x,ox+m-2,oy+m-2,w-2*m+4,h-2*m+4,{w:1.2,amp:.7,tilt:2,a:.7});
  [[0,0,1,1],[1,0,-1,1],[0,1,1,-1],[1,1,-1,-1]].forEach(([a,b,dx,dy])=>wobLine(x,ox+a*w,oy+b*h,ox+a*w+dx*m*.62,oy+b*h+dy*m*.62,{w:1.2,amp:.4,passes:1}));
  // string + nail
  const nx=ox+w/2+(R()-.5)*8, ny=oy-TOP*PX*.72; wobLine(x,ox+w*.2,oy+3,nx,ny,{w:1.3,amp:.6,a:.75}); wobLine(x,ox+w*.8,oy+3,nx,ny,{w:1.3,amp:.6,a:.75});
  x.fillStyle=INK; x.beginPath(); x.arc(nx,ny,5,0,6.283); x.fill(); wobCircle(x,nx,ny,8,{w:1.2,passes:1,a:.6}); x.fillStyle='#fbfaf6'; x.beginPath(); x.arc(nx-1.6,ny-1.6,1.5,0,6.283); x.fill();
  if(cap){ x.save(); x.translate(ox+w/2,oy+h+BOT*PX*.56); x.rotate((R()-.5)*.05); x.fillStyle=INK; x.globalAlpha=.86; x.textAlign='center'; x.textBaseline='middle'; let fs=46; x.font='700 '+fs+'px Caveat, cursive'; while(x.measureText(cap).width>w*1.02&&fs>26){ fs-=2; x.font='700 '+fs+'px Caveat, cursive'; } x.fillText(cap,0,0); x.restore(); }
  return {c, fw:fw+2*SD, fh:fh+TOP+BOT, cy:(TOP-BOT)/2}; }
let pfPh=null;
function pfPlaceholder(){ if(pfPh)return pfPh; const [c,x]=canvas(64,64); x.fillStyle='#ecebe6'; x.fillRect(0,0,64,64); for(let i=-64;i<64;i+=7){ x.strokeStyle='rgba(28,28,32,.16)'; x.beginPath(); x.moveTo(i,64); x.lineTo(i+64,0); x.stroke(); } pfPh=tex(c); return pfPh; }
function pfMaterial(asp){ const mat=new THREE.MeshBasicMaterial({map:pfPlaceholder()}); const uCol={value:0}, uAsp={value:asp}; mat.userData.uCol=uCol;
  mat.onBeforeCompile=sh=>{ sh.uniforms.uCol=uCol; sh.uniforms.uAsp=uAsp;
    sh.fragmentShader='uniform float uCol;\nuniform float uAsp;\n'+sh.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
    { vec3 lin=diffuseColor.rgb; float l=dot(lin,vec3(.2126,.7152,.0722)); float g=pow(max(l,0.),.4545); g=smoothstep(.03,.97,g);
      vec2 q=vMapUv*vec2(uAsp,1.)*150.; float h1=smoothstep(.6,1.,abs(sin(q.x+q.y))); float h2=smoothstep(.75,1.,abs(sin(q.x-q.y)));
      float dk=1.-g; g=clamp(g-(h1*dk*.13+h2*smoothstep(.45,1.,dk)*.12),0.,1.);
      vec3 pen=mix(vec3(.105,.105,.125),vec3(.957,.95,.928),g); pen=pow(pen,vec3(2.2));
      diffuseColor.rgb=mix(pen,lin*(1.+.06*uCol),uCol); }`); };
  mat.customProgramCacheKey=()=>'pfpencil'; return mat; }
function buildPhotoFrames(){
  PHOTOS.forEach((p,i)=>{ const [file,iw,ih,side,z0,y,L,cap,door]=p; const z=ZS(z0); const asp=iw/ih; const pw=asp>=1?L:L*asp, ph=asp>=1?L/asp:L;
    const ft=pfFrameTex(pw,ph,cap,900+i*37); const g=new THREE.Group(); onWall(g,side,z,0,y,.03); const tilt=((i*7919)%13/13-.5)*.07; g.rotation.z=tilt; scene.add(g);
    const inner=new THREE.Group(); g.add(inner);
    const fr=plane(ft.fw,ft.fh,tex(ft.c),{transparent:true}); fr.position.set(0,ft.cy,0); inner.add(fr);
    const mat=pfMaterial(asp); const ph3=new THREE.Mesh(new THREE.PlaneGeometry(pw,ph),mat); ph3.position.z=.004; inner.add(ph3);
    const f={i,file,cap,door,z,side,y,fw:ft.fw,fh:ft.fh,cy:ft.cy,g:inner,mat,u:0,held:false,hover:false,loaded:false,ph:ph3};
    fr.userData.pf=f; ph3.userData.pf=f; pfHit.push(fr,ph3); PF.push(f); });
  // little hand-written hint near the first frames
  const [c,x]=canvas(420,190); R=rnd(77); x.fillStyle='#fbfaf6'; x.fillRect(14,14,392,162); wobRect(x,14,14,392,162,{w:1.8,amp:1}); x.fillStyle=INK; x.textAlign='center'; x.font='700 50px Caveat, cursive'; x.fillText('press & hold',210,82); x.font='700 40px Caveat, cursive'; x.fillText('a photo → colour ✎',210,140);
  const hint=plane(.62,.28,tex(c)); onWall(hint,-1,-8.55,0,1.0,.025); hint.rotation.z=.06; scene.add(hint);
}
function pfLoad(f){ if(f.loaded)return; f.loaded=true; const t=new THREE.TextureLoader().load('assets/cf/'+f.file+'.jpg',()=>{ t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy()); f.mat.map=t; f.mat.needsUpdate=true; },undefined,()=>{ f.loaded=false; }); }
function pfPick(x,y){ v2.set(x/innerWidth*2-1,-(y/innerHeight)*2+1); ray.setFromCamera(v2,camera); const h=ray.intersectObjects(pfHit,false)[0]; return h&&h.distance<9?h.object.userData.pf:null; }
const RM=W.matchMedia&&W.matchMedia('(prefers-reduced-motion: reduce)').matches;
function pfUpdate(dt){ const cz=camera.position.z, now=performance.now();
  for(const f of PF){ if(!f.loaded&&Math.abs(cz-f.z)<17) pfLoad(f);
    if(f.pressT&&!f.held&&now-f.pressT>110) f.held=true;
    const tgt=(f.held||f.hover)?1:0; if(f.u!==tgt){ f.u=RM?tgt:(tgt>f.u?Math.min(tgt,f.u+dt/.3):Math.max(tgt,f.u-dt/.3)); const e=f.u*f.u*(3-2*f.u); f.mat.userData.uCol.value=e; if(!RM){ f.g.scale.setScalar(1+.07*e); f.g.position.z=.05*e; } } }
}
/* lightbox (quick tap) */
let LB=null;
function pfLightbox(f){ if(!LB){ LB=D.createElement('div'); LB.id='cflb'; LB.innerHTML='<button class="cflb-x" aria-label="Close">✕</button><figure><img alt=""><figcaption></figcaption></figure><p class="cflb-tip">press &amp; hold for colour</p>'; D.body.appendChild(LB);
    const img=LB.querySelector('img'); const on=e=>{ e.preventDefault(); img.classList.add('hold'); }, off=()=>img.classList.remove('hold');
    img.addEventListener('pointerdown',on); ['pointerup','pointercancel','pointerleave'].forEach(ev=>img.addEventListener(ev,off)); img.addEventListener('contextmenu',e=>e.preventDefault());
    LB.addEventListener('click',e=>{ if(performance.now()-LB.t0<450)return; if(e.target===LB||e.target.closest('.cflb-x')) pfClose(); });
    LB.addEventListener('wheel',e=>{ e.preventDefault(); e.stopPropagation(); },{passive:false});
    W.addEventListener('keydown',e=>{ if(LB.classList.contains('open')&&e.key==='Escape'){ e.preventDefault(); e.stopImmediatePropagation(); pfClose(); } },true);
    W.addEventListener('popstate',e=>{ if(LB.classList.contains('open')){ e.stopImmediatePropagation(); LB.pushed=false; pfClose(true); } },true); }
  const img=LB.querySelector('img'); img.src='assets/cf/'+f.file+'_l.jpg'; img.alt=f.cap||'photo'; LB.querySelector('figcaption').textContent=f.cap||''; LB.t0=performance.now(); LB.classList.add('open');
  try{ history.pushState({cflb:1},'',location.href); LB.pushed=true; }catch(e){} }
function pfClose(fromPop){ if(!LB||!LB.classList.contains('open'))return; LB.classList.remove('open'); if(!fromPop&&LB.pushed){ LB.pushed=false; history.back(); } }
api.pfScreen=i=>{ const f=PF[i]; if(!f)return null; const v=new THREE.Vector3(); f.ph.getWorldPosition(v); v.project(camera); return {x:(v.x+1)/2*innerWidth,y:(1-v.y)/2*innerHeight,z:v.z}; };
api.photoFrames=()=>PF.map(f=>({file:f.file,door:f.door,u:f.u,loaded:!!(f.mat.map&&f.mat.map!==pfPh)}));
/* ---------------- photo mode: walk frame to frame, square-on, big ---------------- */
const PM={on:false,b:0,idx:0,list:[],pose:{x:0,y:1.7,z:0,yaw:0},tw:null,acc:0,lastIn:0,cool:0};
function pmTarget(f){ const th=Math.tan(THREE.MathUtils.degToRad(vfov/2)), tw=th*camera.aspect;
  const dist=Math.min(HW*2-.3, Math.max(.75, (f.fh*.5)/(th*.8), (f.fw*.5)/(tw*.86)));
  return {x:f.side*(HW-.03-dist), y:f.y+f.cy*.9, z:f.z, yaw:-f.side*Math.PI/2}; }
function pmGo(i,instant){ i=Math.max(0,Math.min(PM.list.length-1,i)); PM.idx=i; const f=PM.list[i]; pfLoad(f); if(PM.list[i+1])pfLoad(PM.list[i+1]);
  const t=pmTarget(f), a={...PM.pose}; const dd=Math.hypot(t.x-a.x,t.z-a.z);
  if(instant||RM||PM.b<.02){ PM.pose={...t}; PM.tw=null; } else PM.tw={a,t,t0:performance.now(),dur:Math.min(1300,520+dd*55)};
  needs=true; api.onPM&&api.onPM({on:PM.on,idx:i,n:PM.list.length,cap:f.cap||'',door:f.door}); }
function pmTick(){ if(PM.tw){ const w=PM.tw, u=Math.min(1,(performance.now()-w.t0)/w.dur), e=u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2; const p=PM.pose;
    p.x=w.a.x+(w.t.x-w.a.x)*e; p.z=w.a.z+(w.t.z-w.a.z)*e; p.yaw=w.a.yaw+(w.t.yaw-w.a.yaw)*e; p.y=w.a.y+(w.t.y-w.a.y)*e+Math.sin(u*Math.PI)*.04; if(u>=1)PM.tw=null; }
  else if(PM.on&&PM.list[PM.idx]){ const t=pmTarget(PM.list[PM.idx]); PM.pose.x+=(t.x-PM.pose.x)*.2; PM.pose.y+=(t.y-PM.pose.y)*.2; } }
function pmInput(d){ const now=performance.now(); if(Math.abs(d)>=1){ if(now>PM.cool) { pmGo(PM.idx+(d>0?1:-1)); PM.cool=now+260; } return; }
  if(now-PM.lastIn>260)PM.acc=0; PM.lastIn=now; if(now<PM.cool){ PM.acc=0; return; } PM.acc+=d;
  if(Math.abs(PM.acc)>=.3){ const dir=PM.acc>0?1:-1; PM.acc=0; PM.cool=now+520; pmGo(PM.idx+dir); } }
api.photoMode=(on,idx)=>{ if(roomOpen||anim)return; on=!!on; if(on===PM.on){ if(on&&idx!=null)pmGo(idx); return; }
  if(on){ if(!PM.list.length) PM.list=PF.slice().sort((a,b)=>b.z-a.z);
    if(!FRONT.open){ FRONT.open=true; FRONT.leaves.forEach((l,i)=>l.rotation.y=i?-1.55:1.55); ts=cur=-1; api.onFront&&api.onFront(); }
    PF.forEach(f=>{f.held=false;f.hover=false;}); if(PM.b<.02){ const p=interp(cur); PM.pose={x:p.x,y:p.y,z:p.z,yaw:p.yaw}; }
    PM.on=true; D.body.classList.add('photo-mode'); pmGo(idx==null?0:idx,true); }
  else { const f=PM.list[PM.idx]; PM.on=false; PM.tw=null; D.body.classList.remove('photo-mode');
    let best=-1, bd=Infinity; if(f&&PM.idx>0) doors.forEach(d=>{ const dz=Math.abs(d.z-f.z); if(dz<bd){bd=dz;best=d.i;} });
    ts=cur=best; lastInput=performance.now(); PF.forEach(x=>{x.held=false;x.hover=false;}); api.onPM&&api.onPM({on:false}); }
  needs=true; };
api.pmStep=(d)=>{ if(PM.on) pmGo(PM.idx+d); };
api.pmState=()=>({on:PM.on,b:PM.b,idx:PM.idx,n:PM.list.length,tweening:!!PM.tw});
let last=performance.now();
function loop(now){ const dt=Math.min(.05,(now-last)/1000); last=now; if(!roomOpen){ if(FRONT.sign&&!FRONT.open&&!RM&&cur<-1.2) FRONT.sign.rotation.z=-.01+Math.sin(now*.0012)*.007+Math.sin(now*.0029)*.002; update(dt); renderer.render(scene,camera); } requestAnimationFrame(loop); }
function press(h,dir,cb){ const t0=performance.now(); (function st(){ const u=Math.min(1,(performance.now()-t0)/420); const a= u<.45? (u/.45)*.62 : .62 - Math.sin((u-.45)/.55*Math.PI)*.1*(1-u); h.rotation.z=dir*a; if(u<1) requestAnimationFrame(st); else cb&&cb(); })(); }
function openFront(){ if(FRONT.open||FRONT.busy)return; FRONT.busy=true; let n=0; FRONT.handles.forEach((h,i)=>press(h,i?1:-1,()=>{ if(++n<2)return; const t0=performance.now(); (function sw(){ const u=Math.min(1,(performance.now()-t0)/1200), e=u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2; FRONT.leaves[0].rotation.y=e*1.55; FRONT.leaves[1].rotation.y=-e*1.55; FRONT.handles.forEach(hh=>hh.rotation.z*=.9); if(u<1)requestAnimationFrame(sw); })(); setTimeout(()=>{ FRONT.open=true; FRONT.busy=false; ts=-1; lastInput=performance.now(); api.onFront&&api.onFront(); },450); })); }
api.openFront=openFront;
api.move=(d)=>{ if(roomOpen||anim||(LB&&LB.classList.contains('open')))return; if(PM.on){ pmInput(d); return; } if(!FRONT.open){ if(d>0)openFront(); return; } ts=Math.max(-2,Math.min(N,ts+d)); lastInput=performance.now(); };
api.goDoor=(key,cb)=>{ const d=doors.find(x=>x.key===key); if(!d){cb&&cb();return} ts=d.i; lastInput=0; const wait=()=>{ if(Math.abs(cur-d.i)<.01){ cb&&cb(); } else setTimeout(wait,60); }; wait(); };
api.state=()=>({s:cur,ts});
api.enter=(key,go)=>{ const d=doors.find(x=>x.key===key); if(!d){go();return} if(PM.on||PM.b>0){ PM.on=false; PM.b=0; PM.tw=null; D.body.classList.remove('photo-mode'); api.onPM&&api.onPM({on:false}); } fadeEl=fadeEl||D.getElementById('wfade'); fadeEl.style.background=(key==='about'||key==='book')?'#ffffff':'';
  if(!FRONT.open){ FRONT.open=true; FRONT.leaves.forEach((l,i)=>l.rotation.y=i?-1.55:1.55); }
  api.goDoor(key,()=>press(d.handle,1,()=>{ d.force=1.75; const dirx=d.side; anim={t0:performance.now(),dur:1100,cam:{x:0,z:0},step:(e,u)=>{ anim.cam.x=dirx*e*1.5; if(u>.55) fadeEl.style.opacity=Math.min(1,(u-.55)/.4); },done:()=>{ roomOpen=true; go(); setTimeout(()=>{fadeEl.style.opacity=0},80); }}; }));
};
api.exit=(key)=>{ const d=doors.find(x=>x.key===key); fadeEl=fadeEl||D.getElementById('wfade'); roomOpen=false; if(d){ d.force=1.75; ts=cur=d.i; anim={t0:performance.now(),dur:700,cam:{x:0,z:0},step:(e)=>{ anim.cam.x=d.side*(1-e)*1.2; },done:()=>{ d.force=null; }}; } last=performance.now(); };
