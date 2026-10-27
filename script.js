/* Prajwal Ghagre: sketchbook portfolio. Hand-written vanilla JS, no libraries. */
(function(){
"use strict";
var D=document, W=window, html=D.documentElement, body=D.body;
html.classList.add('js');
var $=function(s,c){return (c||D).querySelector(s)}, $$=function(s,c){return Array.prototype.slice.call((c||D).querySelectorAll(s))};
var reduced=W.matchMedia('(prefers-reduced-motion: reduce)').matches;
var fine=W.matchMedia('(hover: hover) and (pointer: fine)').matches;
var clamp=function(v,a,b){return v<a?a:v>b?b:v};
var f=function(v){return Math.round(v*10)/10};
var SVGNS='http://www.w3.org/2000/svg';

/* ---------- rough pencil geometry ---------- */
function R(seed){var s=(seed|0)%2147483647; if(s<=0)s+=2147483646; return function(){s=s*16807%2147483647; return (s-1)/2147483646}}
function rl(x1,y1,x2,y2,r,j){
  j=j==null?2:j; var len=Math.hypot(x2-x1,y2-y1)||1, o=Math.min(j,len/8), n=function(){return (r()-.5)*2*o};
  var ux=(x2-x1)/len, uy=(y2-y1)/len, ov=Math.min(5,len*.04);
  var sx=x1-ux*ov*r(), sy=y1-uy*ov*r(), ex=x2+ux*ov*r(), ey=y2+uy*ov*r();
  var mx=sx+(ex-sx)*(.42+r()*.16)+n()*1.4, my=sy+(ey-sy)*(.42+r()*.16)+n()*1.4;
  return 'M'+f(sx+n()*.4)+' '+f(sy+n()*.4)+' Q'+f(mx)+' '+f(my)+' '+f(ex)+' '+f(ey)+' ';
}
function rrect(x,y,w,h,r,j){return rl(x,y,x+w,y,r,j)+rl(x+w,y,x+w,y+h,r,j)+rl(x+w,y+h,x,y+h,r,j)+rl(x,y+h,x,y,r,j)}
function catmull(p){var d='M'+f(p[0][0])+' '+f(p[0][1]);for(var i=0;i<p.length-1;i++){var p0=p[i-1]||p[i],p1=p[i],p2=p[i+1],p3=p[i+2]||p2;d+=' C'+f(p1[0]+(p2[0]-p0[0])/6)+' '+f(p1[1]+(p2[1]-p0[1])/6)+' '+f(p2[0]-(p3[0]-p1[0])/6)+' '+f(p2[1]-(p3[1]-p1[1])/6)+' '+f(p2[0])+' '+f(p2[1])}return d}
function rell(cx,cy,rx,ry,r,j,turns){turns=turns||1.08;var n=Math.max(16,Math.round((rx+ry)/7)),pts=[],a0=r()*Math.PI*2,m=Math.max(rx,ry);for(var i=0;i<=n*turns;i++){var a=a0+i/n*Math.PI*2,k=1+(r()-.5)*2*j/m;pts.push([cx+Math.cos(a)*rx*k,cy+Math.sin(a)*ry*k])}return catmull(pts)}
function el(tag,attrs,parent){var e=D.createElementNS(SVGNS,tag);for(var k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e}
function setLen(p){var L=0;try{L=p.getTotalLength()}catch(e){}L=Math.ceil(L)+2;p.style.strokeDasharray=L;p.style.setProperty('--len',L);return L}

/* ---------- sketch overlays on [data-sk] ---------- */
var skSeed=11;
function sketch(node){
  var old=node.querySelector(':scope > .sk-svg'); if(old)old.remove();
  var w=node.offsetWidth,h=node.offsetHeight; if(!w||!h)return;
  var type=node.getAttribute('data-sk'), r=R(node._seed||(node._seed=skSeed+=37));
  var svg=el('svg',{'class':'sk-svg','aria-hidden':'true'});
  if(type==='btn'){svg.setAttribute('viewBox','0 0 '+w+' '+h);el('path',{'class':'p1',d:rrect(3,3,w-6,h-6,r,2.2)},svg);el('path',{'class':'p2',d:rrect(2,4,w-5,h-7,r,3.2)},svg)}
  else if(type==='circle'){svg.setAttribute('viewBox','-5 -5 '+(w+10)+' '+(h+10));el('path',{'class':'p1',d:rell(w/2,h/2,w/2,h/2,r,2,1.2)},svg)}
  else{svg.setAttribute('viewBox','-5 -5 '+(w+10)+' '+(h+10));el('path',{'class':'p1',d:rrect(0,0,w,h,r,2.4)},svg);el('path',{'class':'p2',d:rrect(1.5,-1,w-2,h+1,r,3.6)},svg)}
  node.appendChild(svg); $$('path',svg).forEach(setLen);
}
var io=('IntersectionObserver' in W)?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');e.target.classList.remove('sk-wait');io.unobserve(e.target)}})},{rootMargin:'0px -4% 0px -4%',threshold:.08}):null;
function watch(node){ if(!io||reduced){node.classList.add('in');node.classList.remove('sk-wait');return} io.observe(node) }
function prepSketch(root){
  $$('[data-sk]',root).forEach(function(n){ if(!n._sk){n._sk=1; if(!n.classList.contains('reveal')&&!n.closest('.reveal'))n.classList.add('sk-wait'); else if(n.closest('.reveal')&&!n.closest('.reveal.in')) n.classList.add('sk-wait'); } sketch(n); if(n.classList.contains('sk-wait')) watch(n) });
  $$('.reveal',root).forEach(function(n){ if(!n._rv){n._rv=1; watch(n)} });
  $$('h2 .ul path',root).forEach(function(p){ if(!p._d){var r=R(p._s=(skSeed+=13));p.setAttribute('d','M4 '+f(9+r()*3)+' C '+f(60+r()*20)+' '+f(3+r()*3)+', '+f(120+r()*20)+' '+f(14+r()*3)+', '+f(180+r()*10)+' '+f(8+r()*2)+' S '+f(265+r()*10)+' '+f(12+r()*3)+', 296 '+f(6+r()*3));p._d=1} setLen(p) });
}
// reveal-linked: when a .reveal gets .in, its inner sk-wait children reveal too
var mo=new MutationObserver(function(ms){ms.forEach(function(m){var t=m.target; if(t.classList&&t.classList.contains('in')){$$('.sk-wait',t).forEach(function(n){n.classList.remove('sk-wait')})}})});
mo.observe(body,{subtree:true,attributes:true,attributeFilter:['class']});
var cssU=D.createElement('style'); D.head.appendChild(cssU);
cssU.textContent='.reveal h2 .ul path{stroke-dashoffset:var(--len)}.reveal.in h2 .ul path{stroke-dashoffset:0}';

/* ---------- smooth horizontal scroll engine ---------- */
var S={el:null,target:0,cur:0,anim:false,onmove:null,
  attach:function(e){this.el=e;this.anim=false;this.target=this.cur=e.scrollLeft},
  max:function(){return this.el.scrollWidth-this.el.clientWidth},
  to:function(x,instant){this.target=clamp(x,0,this.max()); if(instant||reduced){this.anim=false;this.el.scrollLeft=this.target;this.cur=this.target;return} this.start()},
  by:function(d){this.to(this.target+d)},
  start:function(){if(!this.anim){this.anim=true;this.cur=this.el.scrollLeft;requestAnimationFrame(tick)}}
};
function tick(){ if(!S.anim)return; var d=S.target-S.cur; S.cur+=d*.09; if(Math.abs(d)<.6){S.cur=S.target;S.anim=false} S.el.scrollLeft=S.cur; if(S.anim)requestAnimationFrame(tick) }
var hall=$('#hall'), hallStrip=$('#hallStrip');
S.attach(hallStrip);
var locked=true, menuOpen=false;
function onStripScroll(e){ var st=e.currentTarget; if(st!==S.el)return; if(!S.anim){S.target=S.cur=st.scrollLeft} if(!st._raf){st._raf=requestAnimationFrame(function(){st._raf=0;frame(st)})} }
$$('.strip').forEach(function(st){st.addEventListener('scroll',onStripScroll,{passive:true})});
function WA(){return W.PGWorld&&W.PGWorld.active&&!curRoom}
W.addEventListener('wheel',function(e){ if(locked||menuOpen||e.ctrlKey)return; e.preventDefault(); if(WA()){ var dw=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY; if(e.deltaMode===1)dw*=32; W.PGWorld.move(dw/650); return } var d=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY; if(e.deltaMode===1)d*=32; else if(e.deltaMode===2)d*=innerWidth; S.by(d*1.15); walked() },{passive:false});
W.addEventListener('keydown',function(e){
  if(locked)return; var t=e.target, tag=(t.tagName||'').toLowerCase();
  if(e.key==='Escape'){ if(menuOpen)toggleMenu(false); else if(curRoom)closeRoom(); return }
  if(runner&&runner.wants(e))return;
  if(WA()){ if(e.key==='ArrowRight'||e.key==='ArrowDown'||e.key==='PageDown'||e.key===' '){e.preventDefault();W.PGWorld.move(1)} else if(e.key==='ArrowLeft'||e.key==='ArrowUp'||e.key==='PageUp'){e.preventDefault();W.PGWorld.move(-1)} else if(e.key==='Enter'&&curNear){e.preventDefault();openRoom(curNear)} return }
  var step=innerWidth*.55;
  if(e.key==='ArrowRight'||e.key==='ArrowDown'||e.key==='PageDown'){e.preventDefault();S.by(step);walked()}
  else if(e.key==='ArrowLeft'||e.key==='ArrowUp'||e.key==='PageUp'){e.preventDefault();S.by(-step)}
  else if(e.key===' '&&tag!=='button'&&tag!=='a'&&tag!=='canvas'){e.preventDefault();S.by(e.shiftKey?-step:step);walked()}
  else if(e.key==='Home'){e.preventDefault();S.to(0)} else if(e.key==='End'){e.preventDefault();S.to(S.max())}
});
// mouse drag
var drag=null, justDragged=false;
D.addEventListener('pointerdown',function(e){ if(locked||e.pointerType!=='mouse'||e.button!==0||!S.el||!S.el.contains(e.target)||e.target.closest('canvas#run'))return; drag={x:e.clientX,s:S.el.scrollLeft,moved:false,lx:e.clientX,lt:performance.now(),v:0} });
W.addEventListener('pointermove',function(e){ if(!drag)return; var dx=e.clientX-drag.x; if(!drag.moved&&Math.abs(dx)>5){drag.moved=true;body.classList.add('dragging')} if(drag.moved){ var now=performance.now(),dt=Math.max(1,now-drag.lt); drag.v=(e.clientX-drag.lx)/dt; drag.lx=e.clientX; drag.lt=now; S.anim=false; S.el.scrollLeft=drag.s-dx; S.target=S.cur=S.el.scrollLeft; walked() } });
W.addEventListener('pointerup',function(){ if(!drag)return; if(drag.moved){justDragged=true;setTimeout(function(){justDragged=false},60);S.by(-drag.v*260)} body.classList.remove('dragging'); drag=null });
D.addEventListener('click',function(e){ if(justDragged){e.preventDefault();e.stopPropagation()} },true);
D.addEventListener('dragstart',function(e){ if(e.target.tagName==='IMG'||e.target.tagName==='A')e.preventDefault() });
// touch: vertical swipe walks sideways too
var tch=null;
var wt=null;
D.addEventListener('touchstart',function(e){ if(!locked&&!menuOpen&&WA()&&e.target.closest('#world')){ var t0=e.touches[0]; wt={x:t0.clientX,y:t0.clientY,v:0,lt:performance.now(),ly:t0.clientY,lx:t0.clientX}; return } if(locked||menuOpen||!S.el||!S.el.contains(e.target))return; var t=e.touches[0]; S.anim=false; tch={x:t.clientX,y:t.clientY,s:S.el.scrollLeft,axis:null,ly:t.clientY,lt:performance.now(),v:0} },{passive:true});
D.addEventListener('touchmove',function(e){ if(wt){ var t1=e.touches[0], dy=(wt.ly-t1.clientY)+(wt.lx-t1.clientX)*.6; wt.ly=t1.clientY; wt.lx=t1.clientX; var now=performance.now(); wt.v=dy/Math.max(1,now-wt.lt); wt.lt=now; e.preventDefault(); W.PGWorld.move(dy/260); return } if(!tch)return; var t=e.touches[0], dx=t.clientX-tch.x, dy=t.clientY-tch.y;
  if(!tch.axis&&(Math.abs(dx)>7||Math.abs(dy)>7))tch.axis=Math.abs(dy)>Math.abs(dx)?'y':'x';
  if(tch.axis==='y'){ e.preventDefault(); var now=performance.now(),dt=Math.max(1,now-tch.lt); tch.v=(t.clientY-tch.ly)/dt; tch.ly=t.clientY; tch.lt=now; S.el.scrollLeft=tch.s-dy*1.25; S.target=S.cur=S.el.scrollLeft; walked() }
  else if(tch.axis==='x') walked();
},{passive:false});
D.addEventListener('touchend',function(){ if(wt){ W.PGWorld.move(clamp(wt.v*0.35,-.6,.6)); wt=null; return } if(tch&&tch.axis==='y'){S.cur=S.el.scrollLeft;S.by(-tch.v*300)} tch=null },{passive:true});

/* ---------- per-frame scroll effects ---------- */
function frame(st){
  var max=st.scrollWidth-st.clientWidth, p=max>0?st.scrollLeft/max:0;
  var prog=st.parentNode.querySelector('.prog .pfg'); if(prog){ if(!prog._L)prog._L=setLen(prog); prog.style.strokeDashoffset=prog._L*(1-p) }
  if(!reduced){ var vw=innerWidth; (st._px||(st._px=$$('.pola img,.shot img,.award .aimg img',st))).forEach(function(img){ var r=img.parentNode.getBoundingClientRect(); if(r.right<-50||r.left>vw+50)return; var c=(r.left+r.width/2-vw/2)/vw; img.style.transform='translateX('+f(-c*26)+'px) scale(1.12)' }) }
  if(st.querySelector('#journey'))journeyFrame();
  if(st===hallStrip&&cube)cube.check();
}
var didWalk=false; function walked(){ if(!didWalk){didWalk=true;body.classList.add('walked')} }

/* ---------- hallway: doors, floor ---------- */
var DOODLE={
 book:'<path d="M18 22 h28 c3 0 4 2 4 4 v54 c0-3-2-5-5-5 h-27 z"/><path d="M82 22 h-28 c-3 0-4 2-4 4 v54 c0-3 2-5 5-5 h27 z"/><path class="red" d="M58 34 h16 M58 44 h16 M58 54 h10"/>',
 about:'<circle cx="50" cy="50" r="38"/><path d="M24 36 Q30 12 52 15 Q74 14 80 36"/><circle class="fillk" cx="38" cy="45" r="3"/><circle class="fillk" cx="62" cy="45" r="3"/><path class="red" d="M34 61 Q50 76 66 61"/>',
 experience:'<rect x="16" y="38" width="68" height="42" rx="4"/><path d="M38 38 v-9 h24 v9"/><path d="M16 56 h68"/><rect class="red" x="45" y="51" width="10" height="10"/><path class="hat" d="M22 64 l10 -10 M28 74 l18 -18 M60 76 l20 -20"/>',
 projects:'<path class="red" d="M50 12 C 63 30, 76 42, 71 62 C 67 78, 57 86, 50 86 C 39 86, 28 77, 29 62 C 30 50, 40 45, 42 32 C 48 40, 50 47, 50 54 C 57 46, 55 28, 50 12 z"/><path d="M50 62 C 57 68, 57 79, 50 81 C 43 79, 43 69, 50 62 z"/><path d="M18 90 h64"/>',
 games:'PIX',
 workshops:'<path d="M40 16 a10 10 0 0 1 20 0 v26 a10 10 0 0 1 -20 0 z"/><path d="M40 24 h20 M40 32 h20"/><path d="M30 38 v4 a20 20 0 0 0 40 0 v-4"/><path d="M50 62 v16 M36 80 h28"/><path class="red" d="M76 20 q8 8 0 16 M84 14 q14 14 0 28"/>',
 achievements:'<path d="M32 16h36v22c0 12-8 20-18 20S32 50 32 38z"/><path d="M32 22H19c0 12 5 18 13 18 M68 22h13c0 12-5 18-13 18"/><path d="M50 58v12"/><path d="M40 70h20v10H40z M34 86h32"/><path class="red" d="M50 24l3.5 7 7.6.8-5.8 5 1.8 7.6-7.1-4-7.1 4 1.8-7.6-5.8-5 7.6-.8z"/>',
 social:'<path d="M16 22 h52 a8 8 0 0 1 8 8 v24 a8 8 0 0 1 -8 8 h-30 l-12 12 v-12 h-10 a8 8 0 0 1 -8 -8 v-24 a8 8 0 0 1 8 -8 z"/><path class="red" d="M44 36 c-4 -6 -14 -2 -10 6 c2 4 10 9 10 9 c0 0 8 -5 10 -9 c4 -8 -6 -12 -10 -6z"/><path class="blue" d="M70 70 h16 v12 h-5 l-5 6 v-6 h-6 z"/>'
};
var PIX=["....rrrr....","...rrrrrr...","...rrrrrr...","....rrrr....",".....##.....",".....##.....",".....##.....","..########..",".##########.","##r######r##","############"];
function pixels(){var s='',u=100/12;PIX.forEach(function(row,y){for(var x=0;x<row.length;x++){var c=row[x];if(c!=='.')s+='<rect class="'+(c==='r'?'pxr':'px')+'" x="'+f(x*u+.4)+'" y="'+f(y*u+6)+'" width="'+f(u-.8)+'" height="'+f(u-.8)+'"/>'}});return s}
function drawDoor(blk,i){
  var leaf=$('.leaf',blk), frame=$('.frame',blk), key=blk.getAttribute('data-room');
  var w=leaf.offsetWidth,h=leaf.offsetHeight, fw=frame.offsetWidth, fh=frame.offsetHeight, r=R(101+i*29);
  frame.innerHTML=''; leaf.innerHTML='';
  var fs=el('svg',{viewBox:'0 0 '+fw+' '+fh},frame);
  el('path',{d:rl(0,fh,0,0,r,2)+rl(0,0,fw,0,r,2)+rl(fw,0,fw,fh,r,2),'stroke-width':2.4},fs);
  el('path',{d:rl(6,fh,6,6,r,2.5)+rl(6,6,fw-6,6,r,2.5)+rl(fw-6,6,fw-6,fh,r,2.5),'stroke-width':1.2,opacity:.6},fs);
  var ls=el('svg',{viewBox:'0 0 '+w+' '+h},leaf);
  el('path',{d:rrect(1,1,w-2,h-2,r,2),'stroke-width':1.8},ls);
  var px=w*.15,pw=w*.70;
  el('path',{d:rrect(px,h*.07,pw,h*.42,r,2.2),'stroke-width':1.4},ls);
  el('path',{d:rrect(px,h*.56,pw,h*.36,r,2.2),'stroke-width':1.4},ls);
  var hs='';for(var k=0;k<7;k++){var y=h*.6+k*h*.045;hs+=rl(px+6,y+12,px+pw*.38,y-10,r,1.5)}
  el('path',{d:hs,'class':'hat'},ls);
  el('circle',{cx:f(w*.88),cy:f(h*.53),r:5.5,'stroke-width':1.8},ls);
  el('path',{d:rl(w*.88-2,h*.53+7,w*.88-2,h*.53+16,r,1),'stroke-width':1.6},ls);
  var size=Math.min(pw*.82,h*.34), g=el('g',{transform:'translate('+f(w/2-size/2)+' '+f(h*.07+h*.21-size/2)+') scale('+f(size/100)+')','stroke-width':f(2.2*100/size),'class':fine&&!reduced?'dood':''},ls);
  g.innerHTML=DOODLE[key]==='PIX'?pixels():DOODLE[key];
  var sg=$('.sign',blk); sketch(Object.assign(sg,{}));
}
function prepSign(){ $$('.dblk .sign').forEach(function(s){s.setAttribute('data-sk','btn')}) }
function drawHall(){
  $$('.dblk').forEach(drawDoor);
  var fl=$('.floor',hallStrip), wd=hallStrip.scrollWidth; fl.style.width=wd+'px'; var dw0=$('.doorway'); if(dw0){var hr=hallStrip.getBoundingClientRect(),dr0=dw0.getBoundingClientRect(); fl.style.bottom='auto'; fl.style.top=f(dr0.bottom-hr.top-12)+'px'} fl.setAttribute('viewBox','0 0 '+wd+' 24');
  var r=R(5),d='',d2='',x=0; while(x<wd){var nx=Math.min(wd,x+180+r()*160); d+=rl(x,12+r()*3,nx,12+r()*3,r,2); d2+=rl(x+10,20+r()*2,nx-10,20+r()*2,r,2); x=nx}
  var ps=$$('path',fl); ps[0].setAttribute('d',d); ps[1].setAttribute('d',d2);
}
var hoverCss=D.createElement('style');D.head.appendChild(hoverCss);hoverCss.textContent='.dblk:hover .dood{animation:boil .36s steps(1) infinite}@keyframes boil{0%{filter:url(#rough1)}33%{filter:url(#rough2)}66%{filter:url(#rough3)}}';

/* ---------- hero sketch cube ---------- */
var cube=null;
(function(){
  var cv=$('#cube'); if(!cv||!cv.getContext)return; var ctx=cv.getContext('2d'), dpr=Math.min(2,W.devicePixelRatio||1);
  var ax=.5,ay=.6,vx=.0035,vy=.006,mx=0,my=0,seed=1,last=0,running=false,visible=true,boilT=0;
  function size(){var r=cv.getBoundingClientRect();cv.width=Math.max(1,r.width*dpr);cv.height=Math.max(1,r.height*dpr)}
  var V=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]],E=[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
  function line(a,b,r,j,wid,al){ctx.globalAlpha=al;ctx.lineWidth=wid;ctx.beginPath();var mxp=(a[0]+b[0])/2+(r()-.5)*j,myp=(a[1]+b[1])/2+(r()-.5)*j;ctx.moveTo(a[0]+(r()-.5)*j*.5,a[1]+(r()-.5)*j*.5);ctx.quadraticCurveTo(mxp,myp,b[0]+(r()-.5)*j*.5,b[1]+(r()-.5)*j*.5);ctx.stroke()}
  function draw(t){
    var w=cv.width,h=cv.height,s=Math.min(w,h)*.24,cx=w/2,cy=h*.46;ctx.clearRect(0,0,w,h);
    var tx=ax+my*.6, ty=ay+mx*.8, P=V.map(function(v){var x=v[0],y=v[1],z=v[2];var c=Math.cos(ty),sn=Math.sin(ty);var x1=x*c+z*sn,z1=-x*sn+z*c;c=Math.cos(tx);sn=Math.sin(tx);var y1=y*c-z1*sn,z2=y*sn+z1*c;var k=3.4/(3.4+z2);return [cx+x1*s*k,cy+y1*s*k,z2]});
    ctx.strokeStyle='#232326';ctx.lineCap='round';
    var r=R(seed);
    // shadow
    ctx.globalAlpha=.25;ctx.lineWidth=1*dpr;for(var i=0;i<9;i++){var yy=h*.86+(r()-.5)*4*dpr,xx=cx-s*1.1+i*s*.26;ctx.beginPath();ctx.moveTo(xx,yy+6*dpr);ctx.lineTo(xx+s*.32,yy-6*dpr);ctx.stroke()}
    ctx.beginPath();ctx.ellipse(cx,h*.86,s*1.25,s*.18,0,0,Math.PI*2);ctx.lineWidth=1.2*dpr;ctx.globalAlpha=.4;ctx.stroke();
    E.forEach(function(e){var a=P[e[0]],b=P[e[1]],back=(a[2]+b[2])/2>.2;line(a,b,r,5*dpr,(back?1:2)*dpr,back?.35:.9);if(!back)line(a,b,r,7*dpr,.8*dpr,.35)});
    ctx.globalAlpha=.9;ctx.strokeStyle='#e2553f';ctx.lineWidth=2*dpr;var fr=[P[4],P[5],P[6],P[7]];var c0=[(fr[0][0]+fr[2][0])/2,(fr[0][1]+fr[2][1])/2];ctx.beginPath();ctx.arc(c0[0],c0[1],s*.22,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;
  }
  function loop(t){ if(!running)return; ax+=vx;ay+=vy; if(t-boilT>120){seed=(seed+1)%9+1;boilT=t} draw(t); requestAnimationFrame(loop) }
  cube={check:function(){var r=cv.getBoundingClientRect();visible=r.right>0&&r.left<innerWidth;this.run(visible&&!curRoom)},run:function(on){if(reduced){draw(0);return} if(on&&!running){running=true;requestAnimationFrame(loop)}else if(!on)running=false},size:function(){size();draw(0)}};
  if(fine)W.addEventListener('mousemove',function(e){mx=(e.clientX/innerWidth-.5);my=(e.clientY/innerHeight-.5)},{passive:true});
  size(); draw(0);
})();

/* ---------- rooms ---------- */
var curRoom=null, rooms={}; $$('.room').forEach(function(r){rooms[r.id]=r});
function roomStrip(r){return $('.room-strip',r)}
function openRoom(key,opts){
  opts=opts||{}; var room=rooms[key]; if(!room)return; if(menuOpen)toggleMenu(false);
  if(curRoom===room)return;
  if(curRoom){ closeRoom({silent:true,instant:true}) }
  var door=$('.dblk[data-room="'+key+'"]');
  function go(){
    room.hidden=false; void room.offsetWidth; room.classList.add('open'); body.classList.add('room-open'); curRoom=room;
    hall.setAttribute('aria-hidden','true'); var st=roomStrip(room); st.scrollLeft=0; S.attach(st);
    prepSketch(room); roomInit(room); frame(st); if(cube)cube.run(false);
    setTimeout(function(){var b=$('.back',room); if(b)b.focus({preventScroll:true})},opts.instant?0:550);
    setActive(key);
  }
  if(!opts.fromPop&&location.hash!=='#'+key){ try{history.pushState({room:key},'','#'+key)}catch(e){} }
  if(W.PGWorld&&W.PGWorld.active){ if(opts.instant||reduced){ go(); } else W.PGWorld.enter(key,go); return }
  if(door&&!opts.instant&&!reduced){
    var r=door.getBoundingClientRect(), off=r.left<20||r.right>innerWidth-20, delay=0;
    if(off){ S.attach(hallStrip); S.to(hallStrip.scrollLeft+r.left+r.width/2-innerWidth/2); delay=650 }
    setTimeout(function(){
      var dr=$('.doorway',door).getBoundingClientRect();
      door.classList.add('opening');
      setTimeout(function(){ hall.style.transformOrigin=f(dr.left+dr.width/2)+'px '+f(dr.top+dr.height/2)+'px'; hall.style.transform='scale(2.8)'; hall.classList.add('zoom') },420);
      setTimeout(go,820);
    },delay);
  } else { if(door)door.classList.add('opening'); hall.classList.add('zoom'); go() }
}
function closeRoom(opts){
  opts=opts||{}; if(!curRoom)return; var room=curRoom, key=room.id, door=$('.dblk[data-room="'+key+'"]');
  room.classList.remove('open'); body.classList.remove('room-open'); curRoom=null; hall.removeAttribute('aria-hidden'); if(W.PGWorld&&W.PGWorld.active)W.PGWorld.exit(key);
  hall.style.transform=''; hall.classList.remove('zoom'); S.attach(hallStrip);
  setTimeout(function(){ room.hidden=true },opts.instant?0:600);
  setTimeout(function(){ if(door){door.classList.remove('opening'); if(!opts.silent)door.focus({preventScroll:true})} if(cube)cube.check() },opts.instant?0:650);
  if(!opts.silent&&!opts.fromPop){ try{history.pushState(null,'',location.pathname+location.search)}catch(e){} }
  setActive(null);
}
function setActive(k){ $$('.links a').forEach(function(a){a.classList.toggle('active',a.getAttribute('href')==='#'+k)}) }
W.addEventListener('popstate',function(){ var k=location.hash.slice(1); if(rooms[k])openRoom(k,{fromPop:true,instant:true}); else closeRoom({fromPop:true}) });
D.addEventListener('click',function(e){
  var a=e.target.closest('a,button'); if(!a)return;
  if(a.hasAttribute('data-back')||a.hasAttribute('data-home')){ e.preventDefault(); if(menuOpen)toggleMenu(false); if(curRoom)closeRoom(); else S.to(0); return }
  var href=a.getAttribute('href'); if(href&&href.charAt(0)==='#'&&rooms[href.slice(1)]){ e.preventDefault(); if(locked)return; openRoom(href.slice(1),{instant:!!a.closest('.mob,.links,.skip,.hall-end,.room')}) }
});
var menuBtn=$('.menu-btn'), mob=$('#mob');
function toggleMenu(on){ menuOpen=on==null?!menuOpen:on; mob.classList.toggle('open',menuOpen); menuBtn.setAttribute('aria-expanded',menuOpen); menuBtn.querySelector('span')||0; menuBtn.firstChild.nodeValue=menuOpen?'close':'menu'; if(menuOpen)mob.querySelector('a').focus() }
menuBtn.addEventListener('click',function(){toggleMenu()});

/* ---------- room features ---------- */
var runner=null;
function roomInit(room){
  if(room._init){ if(room.id==='experience')layoutJourney(); return } room._init=1;
  var por=$('#portrait',room); if(por){ var ph=$('.ph',por), cur=0, tgt=0, rf=0, full=false;
    function anim(){ cur+=(tgt-cur)*.18; ph.style.setProperty('--r',f(cur)+'px'); if(Math.abs(tgt-cur)>.5)rf=requestAnimationFrame(anim); else {ph.style.setProperty('--r',tgt+'px');rf=0} }
    function setT(v){tgt=v; if(!rf)rf=requestAnimationFrame(anim)}
    ph.addEventListener('pointermove',function(e){ if(e.pointerType!=='mouse')return; var r=ph.getBoundingClientRect(); ph.style.setProperty('--mx',f(e.clientX-r.left)+'px'); ph.style.setProperty('--my',f(e.clientY-r.top)+'px'); if(!full)setT(95) });
    ph.addEventListener('pointerleave',function(e){ if(e.pointerType==='mouse'&&!full)setT(0) });
    function toggle(){ full=!full; ph.style.setProperty('--mx','50%'); ph.style.setProperty('--my','40%'); setT(full?ph.offsetHeight*1.2:0) }
    ph.addEventListener('click',function(e){ if(justDragged)return; toggle() });
    ph.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();toggle()} });
  }
  var bk=$('#pbook',room); if(bk){ var sc=$('[data-scrib]',bk), r=R(77), w=bk.offsetWidth+48, h=bk.offsetHeight+48; $('.scrib',bk).setAttribute('viewBox','0 0 '+w+' '+h); sc.setAttribute('d',rell(w/2,h/2,w/2-6,h/2-6,r,8,1.15)); 
    if(fine&&!reduced){ var cv=$('.cover',bk); bk.addEventListener('mousemove',function(e){var q=bk.getBoundingClientRect();cv.style.setProperty('--ry',f(-16+((e.clientX-q.left)/q.width-.5)*30)+'deg');cv.style.setProperty('--rx',f(4-((e.clientY-q.top)/q.height-.5)*16)+'deg')}); bk.addEventListener('mouseleave',function(){cv.style.removeProperty('--ry');cv.style.removeProperty('--rx')}) } }
  if($('#journey',room))layoutJourney();
  if($('#run',room))runner=Runner($('#run',room));
}
var J=null;
function layoutJourney(){
  var j=$('#journey'); if(!j||!j.offsetWidth)return; var svg=$('.jpath',j), w=j.scrollWidth, h=j.offsetHeight, jr=j.getBoundingClientRect();
  svg.setAttribute('viewBox','0 0 '+w+' '+h); svg.style.width=w+'px'; svg.style.height=h+'px';
  var dots=$$('.cp .dot',j), pts=dots.map(function(d){var r=d.getBoundingClientRect();return [r.left-jr.left+r.width/2,r.top-jr.top+r.height/2]});
  if(!pts.length)return; pts.unshift([Math.max(0,pts[0][0]-120),pts[0][1]+ (pts[1]?(pts[1][1]-pts[0][1])*-.3:0)]); pts.push([pts[pts.length-1][0]+80,pts[pts.length-1][1]]);
  var d=catmull(pts), ps=$$('path',svg); ps.forEach(function(p){p.setAttribute('d',d)}); var L=ps[1].getTotalLength(); ps[1].style.strokeDasharray=L; J={j:j,p:ps[1],L:L,dots:dots,pts:pts.slice(1,-1)}; journeyFrame();
}
function journeyFrame(){
  if(!J)return; var jr=J.j.getBoundingClientRect(); if(!jr.width)return;
  var vis=(innerWidth*.62-jr.left)/jr.width, p=clamp(vis,0,1), L=J.L*p; J.p.style.strokeDashoffset=f(J.L-L);
  var pt=J.p.getPointAtLength(L), wk=$('#walker'); wk.style.transform='translate('+f(pt.x)+'px,'+f(pt.y)+'px)';
  J.dots.forEach(function(d,i){ d.parentNode.classList.toggle('on',J.pts[i][0]<=pt.x+4) });
}

/* ---------- mini game: Sketch Runner ---------- */
function Runner(cv){
  var ctx=cv.getContext('2d'), dpr=Math.min(2,W.devicePixelRatio||1), W_=0,H=0, state='idle', obs=[], pl={y:0,vy:0,rot:0}, speed=260, score=0, best=0, spawn=0, last=0, seed=1, frameN=0, scoreEl=$('#score');
  try{best=+localStorage.getItem('pg_runner_best')||0}catch(e){}
  function size(){var r=cv.getBoundingClientRect();W_=r.width;H=r.height;cv.width=W_*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);draw()}
  var G=function(){return H-24}, P=26;
  function ln(x1,y1,x2,y2,r,j,w,a){ctx.globalAlpha=a==null?1:a;ctx.lineWidth=w||2;ctx.beginPath();ctx.moveTo(x1+(r()-.5)*j,y1+(r()-.5)*j);ctx.quadraticCurveTo((x1+x2)/2+(r()-.5)*j*1.5,(y1+y2)/2+(r()-.5)*j*1.5,x2+(r()-.5)*j,y2+(r()-.5)*j);ctx.stroke()}
  function draw(){
    ctx.clearRect(0,0,W_,H); ctx.strokeStyle='#232326'; ctx.lineCap='round'; ctx.lineJoin='round'; var r=R(seed), g=G();
    for(var x=0;x<W_;x+=120)ln(x,g,x+120,g,r,2,2);
    for(var x2=((-frameN*speed/60)%40+40)%40;x2<W_;x2+=40)ln(x2,g+8,x2+10,g+5,r,1,1,.35);
    var px=60, py=g-P-pl.y; ctx.save(); ctx.translate(px+P/2,py+P/2); ctx.rotate(pl.rot);
    ctx.strokeStyle='#232326'; ln(-P/2,-P/2,P/2,-P/2,r,2,2.2); ln(P/2,-P/2,P/2,P/2,r,2,2.2); ln(P/2,P/2,-P/2,P/2,r,2,2.2); ln(-P/2,P/2,-P/2,-P/2,r,2,2.2);
    ctx.fillStyle='#232326'; ctx.globalAlpha=1; ctx.fillRect(1,-6,4,4); ctx.fillRect(7,-6,4,4); ctx.restore();
    obs.forEach(function(o){ ctx.strokeStyle=o.t?'#e2553f':'#232326'; if(o.t){ ln(o.x,g,o.x+o.w/2,g-o.h,r,2,2.2); ln(o.x+o.w/2,g-o.h,o.x+o.w,g,r,2,2.2); for(var k=4;k<o.w-4;k+=5)ln(o.x+k,g-2,o.x+k+3,g-o.h*.45*(1-Math.abs(k/o.w-.5)*2),r,1,1,.3) } else { ln(o.x,g,o.x,g-o.h,r,2,2.2); ln(o.x,g-o.h,o.x+o.w,g-o.h,r,2,2.2); ln(o.x+o.w,g-o.h,o.x+o.w,g,r,2,2.2); ln(o.x+3,g-o.h+6,o.x+o.w-3,g-6,r,1,1,.35) } });
    ctx.globalAlpha=1; ctx.fillStyle='#232326'; ctx.font='20px "Patrick Hand", cursive'; ctx.textAlign='center';
    if(state==='idle')ctx.fillText('tap / click / space to play',W_/2,H*.38);
    if(state==='over'){ctx.font='26px "Caveat", cursive';ctx.fillText('ouch! score '+score+'  ·  tap to retry',W_/2,H*.38)}
  }
  function jump(){ if(state!=='run'){start();return} if(pl.y<=0.5){pl.vy=640} }
  function start(){ state='run'; obs=[]; score=0; speed=260; spawn=.8; pl={y:0,vy:0,rot:0}; last=performance.now(); upd(); requestAnimationFrame(loop) }
  function upd(){ scoreEl.textContent='score '+score+' · best '+best }
  function loop(t){
    if(state!=='run')return; var dt=Math.min(.05,(t-last)/1000); last=t; frameN++; if(frameN%7===0)seed=(seed%9)+1;
    if(!curRoom||curRoom.id!=='games'){state='idle';draw();return}
    pl.vy-=1900*dt; pl.y=Math.max(0,pl.y+pl.vy*dt); if(pl.y===0){pl.vy=Math.max(0,pl.vy); pl.rot=Math.round(pl.rot/(Math.PI/2))*(Math.PI/2)} else pl.rot+=5*dt;
    speed+=6*dt; spawn-=dt; if(spawn<=0){ var t2=Math.random()<.6; obs.push({x:W_+10,w:t2?22+Math.random()*14:16+Math.random()*10,h:t2?22+Math.random()*12:28+Math.random()*16,t:t2,passed:false}); spawn=(.85+Math.random()*.9)*(260/speed)+.25 }
    obs.forEach(function(o){o.x-=speed*dt; if(!o.passed&&o.x+o.w<60){o.passed=true;score++;if(score>best){best=score;try{localStorage.setItem('pg_runner_best',best)}catch(e){}}upd()}});
    obs=obs.filter(function(o){return o.x>-60});
    var g=G(), px=60+4, py=g-P-pl.y+4, pw=P-8;
    for(var i=0;i<obs.length;i++){var o=obs[i],ox=o.x+(o.t?o.w*.25:0),ow=o.t?o.w*.5:o.w,oy=g-o.h*(o.t?.75:1);if(px<ox+ow&&px+pw>ox&&py+pw>oy){state='over';upd();draw();return}}
    draw(); requestAnimationFrame(loop);
  }
  cv.addEventListener('pointerdown',function(e){e.preventDefault();jump()});
  W.addEventListener('resize',size); size(); upd();
  return {wants:function(e){ if(!curRoom||curRoom.id!=='games')return false; if((e.key===' '||e.key==='ArrowUp')&&(D.activeElement===cv||state==='run')){e.preventDefault();jump();return true} return false }};
}

/* ---------- pencil cursor + graphite trail ---------- */
if(fine&&!reduced){
  body.classList.add('has-cursor'); var pen=$('#pencil'), tr=$('#trail'), tctx=tr.getContext('2d'), dpr=Math.min(2,W.devicePixelRatio||1), pts=[], idle=0, trRun=false;
  function ts(){tr.width=innerWidth*dpr;tr.height=innerHeight*dpr;tctx.setTransform(dpr,0,0,dpr,0,0)} ts(); W.addEventListener('resize',ts);
  var lx=-100,ly=-100;
  W.addEventListener('pointermove',function(e){ if(e.pointerType!=='mouse')return; pen.style.transform='translate('+e.clientX+'px,'+e.clientY+'px)'; if(lx>-100)pts.push([lx,ly,e.clientX,e.clientY]); lx=e.clientX;ly=e.clientY; idle=0; if(!trRun){trRun=true;requestAnimationFrame(tl)} },{passive:true});
  function tl(){ tctx.globalCompositeOperation='destination-out'; tctx.fillStyle='rgba(0,0,0,.09)'; tctx.fillRect(0,0,innerWidth,innerHeight); tctx.globalCompositeOperation='source-over'; tctx.strokeStyle='rgba(35,35,38,.5)'; tctx.lineWidth=1.3; tctx.lineCap='round'; pts.forEach(function(p){tctx.beginPath();tctx.moveTo(p[0],p[1]);tctx.lineTo(p[2],p[3]);tctx.stroke()}); pts=[]; idle++; if(idle<70)requestAnimationFrame(tl); else {trRun=false;tctx.clearRect(0,0,innerWidth,innerHeight)} }
  D.addEventListener('pointerover',function(e){ pen.classList.toggle('hover',!!e.target.closest('a,button,.dblk,canvas,.ph,[tabindex]')) });
  D.addEventListener('pointerdown',function(){pen.classList.add('down')}); W.addEventListener('pointerup',function(){pen.classList.remove('down')});
  D.addEventListener('mouseleave',function(){pen.style.transform='translate(-100px,-100px)'});
}

/* ---------- loader: circle fills, pencil crack, main door opens ---------- */
var loader=$('#loader'), ring=$('.ring-fg',loader), ringBg=$('.ring-bg',loader), pct=$('.ld-pct',loader), txt=$('.ld-txt',loader), fillrect=$('#fillrect'), dl=$('.door-l',loader), dr=$('.door-r',loader), crack=$('#crack');
var doorPaths=[];
function buildLoader(){
  var r=R(3), vw=innerWidth, vh=innerHeight, cx=vw/2, cy=vh/2;
  ringBg.setAttribute('d',rell(0,0,58,58,r,1.6,1.15)+' '+rell(0,0,56,56,r,2.2,1.05)); ring.setAttribute('d',rell(0,0,62,62,R(9),1.2,1.0)); ring._L=setLen(ring); ring.style.strokeDashoffset=ring._L;
  var hf=$('.hatchfill',loader), hd=''; for(var i=-80;i<80;i+=7)hd+=rl(i-30,60,i+30,-60,r,1.5); hf.innerHTML=''; el('path',{d:hd},hf);
  // crack points: from circle centre to top & bottom edges
  var top=[],bot=[],y,x=cx; for(y=cy;y>-20;y-=18+r()*26){x=cx+(r()-.5)*30;top.push([x,y])} top.push([cx+(r()-.5)*20,-20]);
  x=cx; for(y=cy;y<vh+20;y+=18+r()*26){x=cx+(r()-.5)*30;bot.push([x,y])} bot.push([cx+(r()-.5)*20,vh+20]);
  var pts=top.reverse().concat(bot.slice(1)), d='M'+pts.map(function(p){return f(p[0])+' '+f(p[1])}).join(' L');
  var br=''; for(var k=2;k<pts.length-2;k+=3){var p=pts[k],s=r()<.5?-1:1;br+='M'+f(p[0])+' '+f(p[1])+' l'+f(s*(14+r()*22))+' '+f((r()-.5)*24)+' l'+f(s*(8+r()*12))+' '+f((r()-.5)*16)+' '}
  var cs=$$('path',crack); cs[0].setAttribute('d',d); cs[1].setAttribute('d',br); cs.forEach(function(p){p._L=setLen(p);p.style.strokeDashoffset=p._L});
  var ext=70, lw=cx+ext, rwid=vw-cx+ext, rx0=vw-rwid; dl.style.width=lw+'px'; dr.style.width=rwid+'px';
  dl.style.clipPath='polygon(0 0,'+pts.map(function(p){return f(p[0])+'px '+f(p[1])+'px'}).join(',')+',0 100%)';
  dr.style.clipPath='polygon('+pts.map(function(p){return f(p[0]-rx0)+'px '+f(p[1])+'px'}).join(',')+','+rwid+'px 100%,'+rwid+'px 0)';
  // door drawings
  doorPaths=[];
  [[dl,lw,0],[dr,rwid,rx0]].forEach(function(o,side){
    var svg=$('svg',o[0]), w=o[1], h=vh, off=o[2]; svg.innerHTML=''; svg.setAttribute('viewBox','0 0 '+w+' '+h);
    var m=Math.min(46,vw*.05), inner=side===0?cx-14:14+ (cx-off)-cx+ (cx-off)*0; 
    var x0=side===0?m:ext+8, x1=side===0?cx-14:w-m;
    var add=function(dd,cls,sw){var p=el('path',{d:dd,'stroke-width':sw||1.6},svg);if(cls)p.setAttribute('class',cls);doorPaths.push(p);return p};
    add(rl(x0,h,x0,m,r,2)+rl(x0,m,x1,m,r,2)+rl(x1,m,x1,h,r,2),'',2.2);
    var pw=x1-x0, px=x0+pw*.14, ppw=pw*.72;
    add(rrect(px,h*.13,ppw,h*.36,r,2.4),'',1.5); add(rrect(px+10,h*.13+10,ppw-20,h*.36-20,r,2.6),'',.9);
    add(rrect(px,h*.56,ppw,h*.32,r,2.4),'',1.5);
    var hs='';for(var k=0;k<14;k++){var yy=h*.58+k*h*.021;hs+=rl(px+8,yy+16,px+ppw*.42,yy-12,r,1.5)} add(hs,'shade',1);
    var kx=side===0?x1-30:x0+30; var kn=el('circle',{cx:f(kx),cy:f(h*.64),r:9,'stroke-width':2,fill:'none',stroke:'#232326'},svg);doorPaths.push(kn);
    add(rl(kx,h*.64+12,kx,h*.64+30,r,1),'',2);
    var label=el('text',{x:f(px+ppw/2),y:f(h*.13+h*.18),'text-anchor':'middle','font-size':f(Math.min(54,pw*.16))},svg); label.textContent=side===0?"Prajwal's":'Sketchbook'; label.style.opacity=0; o[0]._label=label;
  });
  doorPaths.forEach(function(p){p._L=setLen(p);p.style.strokeDashoffset=p._L});
}
function setProgress(p){
  pct.textContent=Math.round(p*100); ring.style.strokeDashoffset=ring._L*(1-p); fillrect.setAttribute('y',f(60-120*p));
  doorPaths.forEach(function(q){q.style.strokeDashoffset=q._L*(1-clamp(p*1.15,0,1))});
}
var msgs=['sharpening pencils…','drawing the doors…','spawning player…','compiling shaders…','almost there…'];
function runLoader(){
  buildLoader(); var t0=performance.now(), minT=reduced?400:2100, ready=false, p=0;
  var fontsReady=(D.fonts&&D.fonts.ready)?D.fonts.ready:Promise.resolve();
  var worldReady=new Promise(function(res){ var n=0; (function chk(){ if(W.PGWorld&&W.PGWorld.ready){ W.PGWorld.ready.then(function(ok){ if(ok)hookWorld(); res() }) } else if(n++<40) setTimeout(chk,100); else res() })() });
  Promise.race([Promise.all([fontsReady,worldReady,new Promise(function(res){ if(D.readyState==='complete')res(); else W.addEventListener('load',res)})]),new Promise(function(res){setTimeout(res,9000)})]).then(function(){ready=true});
  function step(t){
    var e=(t-t0)/minT, target=ready?Math.min(1,e):Math.min(.9,e); p+=(target-p)*.12; if(ready&&e>=1&&p>.995)p=1;
    setProgress(p); txt.textContent=msgs[Math.min(msgs.length-1,Math.floor(p*msgs.length))];
    if(p<1)requestAnimationFrame(step); else finish();
  }
  requestAnimationFrame(step);
}
function finish(){
  var lbls=[dl._label,dr._label]; lbls.forEach(function(l){if(l){l.style.transition='opacity .4s';l.style.opacity=1}});
  if(reduced){ loader.classList.add('gone'); enter(); return }
  setTimeout(function(){
    loader.classList.add('cracked');
    $$('path',crack).forEach(function(p,i){p.style.transition='stroke-dashoffset '+(i?'.4s ease .45s':'.6s cubic-bezier(.7,0,.3,1)');p.style.strokeDashoffset=0});
    setTimeout(function(){ loader.classList.add('shake') },420);
    setTimeout(function(){ loader.classList.remove('shake'); loader.classList.add('open'); setTimeout(enter,350); setTimeout(function(){loader.classList.add('gone')},1400) },900);
  },350);
}
function enter(){
  locked=false; body.classList.remove('locked'); body.classList.add('ready'); loader.setAttribute('aria-hidden','true');
  var k=location.hash.slice(1); if(rooms[k])setTimeout(function(){openRoom(k,{fromPop:true})},500);
  if(!(W.PGWorld&&W.PGWorld.active))hallStrip.focus({preventScroll:true});
  if(cube)cube.check();
}

/* ---------- social icons + note form ---------- */
var ICONS={"in": "<rect x=\"4\" y=\"4\" width=\"34\" height=\"34\" rx=\"7\"/><path d=\"M12 18v12M12 12v1M18 30v-8a5 5 0 0 1 10 0v8M18 18v4\"/>", "ig": "<rect x=\"4\" y=\"4\" width=\"34\" height=\"34\" rx=\"10\"/><circle cx=\"21\" cy=\"21\" r=\"8\"/><circle cx=\"31\" cy=\"11\" r=\"1.5\"/>", "x": "<path d=\"M7 6 L35 36 M35 6 L7 36\"/><path d=\"M5 6h8l24 30h-8z\" opacity=\".5\"/>", "yt": "<rect x=\"3\" y=\"9\" width=\"36\" height=\"24\" rx=\"7\"/><path d=\"M18 15 l9 6 l-9 6 z\"/>", "gh": "<path d=\"M21 4 a17 17 0 0 0 -5 33 c1 0 1 -1 1 -2 v-4 c-5 1 -6 -2 -6 -2 c-1 -2 -2 -3 -2 -3 c-2 -1 0 -1 0 -1 c2 0 3 2 3 2 c2 3 4 2 5 2 c0 -1 1 -2 1 -3 c-4 0 -8 -2 -8 -8 c0 -2 1 -3 2 -4 c0 -1 -1 -3 0 -4 c0 0 2 0 4 2 a14 14 0 0 1 8 0 c2 -2 4 -2 4 -2 c1 1 0 3 0 4 c1 1 2 2 2 4 c0 6 -4 8 -8 8 c1 1 1 2 1 3 v6 c0 1 0 2 1 2 a17 17 0 0 0 -4 -33 z\"/>", "itch": "<path d=\"M6 12 l4 -7 h22 l4 7 v4 a4 4 0 0 1 -8 0 a4 4 0 0 1 -8 0 a4 4 0 0 1 -8 0 a4 4 0 0 1 -6 0 z\"/><path d=\"M8 20 v12 a4 4 0 0 0 4 4 h18 a4 4 0 0 0 4 -4 v-12\"/><circle cx=\"21\" cy=\"28\" r=\"3\"/>", "amz": "<path d=\"M8 10 h24 v26 h-24 z\"/><path d=\"M12 10 v26\"/><path d=\"M8 30 q13 8 26 0\"/><path d=\"M30 28 l4 2 l-1 4\"/>", "gedu": "<path d=\"M21 6 l17 8 l-17 8 l-17 -8 z\"/><path d=\"M10 18 v9 c4 5 18 5 22 0 v-9\"/><path d=\"M38 14 v10\"/>"};
$$('.sic').forEach(function(s){ var k=s.getAttribute('data-ic'); if(ICONS[k])s.innerHTML='<svg viewBox="0 0 42 42">'+ICONS[k]+'</svg>' });
var nf=$('#noteForm'); if(nf)nf.addEventListener('submit',function(e){ e.preventDefault(); var n=nf.n.value.trim(), m=nf.m.value.trim(); if(!m){nf.m.focus();return} var subj='Hi Prajwal'+(n?' (from '+n+')':''); W.location.href='mailto:ghagreprajwal8@gmail.com?subject='+encodeURIComponent(subj)+'&body='+encodeURIComponent(m+(n?'\n\n— '+n:'')) });

/* ---------- corridor UI ---------- */
var curNear=null, wintro=$('#wintro'), wprompt=$('#wprompt'), wdots=$('#wdots');
var DOORNAMES={about:'About me',book:'My Book',projects:'Projects',games:'Games',experience:'Experience',workshops:'Teaching & Workshops',achievements:'Awards',social:'Social'};
['about','book','projects','games','experience','workshops','achievements','social'].forEach(function(k){ var b=D.createElement('button'); b.type='button'; b.setAttribute('aria-label','Walk to '+DOORNAMES[k]); b.dataset.k=k; b.addEventListener('click',function(){ if(W.PGWorld&&W.PGWorld.active)W.PGWorld.goDoor(k) }); wdots.appendChild(b) });
var wlab=D.createElement('span'); wlab.className='wlab'; wdots.appendChild(wlab);
function hookWorld(){ var Wd=W.PGWorld; if(!Wd)return;
  Wd.onDoor=function(k){ if(!locked&&!curRoom)openRoom(k) };
  Wd.onPM=function(st){ if(st.on){ wpm.hidden=false; wphoto.hidden=true; wpmN.textContent=(st.idx+1)+' / '+st.n; wpmCap.textContent=st.cap; wpmPrev.disabled=st.idx<=0; wpmNext.disabled=st.idx>=st.n-1; var end=st.idx>=st.n-1; if(wpmEnd.hidden===end){ wpmEnd.hidden=!end; if(end)setTimeout(function(){pmSk($('#wpmBack2'))},30) } wpmTip.style.display=st.idx>1?'none':''; setTimeout(function(){pmSk($('#wpmBack'))},30); }
    else { wpm.hidden=true; wpmEnd.hidden=true; pmShowBtn(-1); } };
  Wd.onNear=function(k,sv){ if(k!==curNear){ curNear=k; wprompt.hidden=!k; if(k){ wprompt.querySelector('.lbl').textContent='open · '+DOORNAMES[k]+' →'; } }
    var stage=sv<-1.6?'front':(sv<-0.55?'walk':'none'); if(stage!==wintro._st){ wintro._st=stage; wintro.innerHTML=stage==='front'?'<p class="whint">click the door to enter <span class="arrow">↑</span></p>':stage==='walk'?'<p class="whint"><span class="desk">scroll to walk</span><span class="touch">swipe up to walk</span> <span class="arrow">↓</span></p>':''; }
    pmShowBtn(sv);
    var idx=Math.round(sv); $$('button',wdots).forEach(function(b,i){ b.classList.toggle('on',i===idx&&Math.abs(sv-i)<.5) }); wlab.textContent=(idx>=0&&idx<8&&Math.abs(sv-idx)<.5)?DOORNAMES[$$('button',wdots)[idx].dataset.k]:''; };
}
wprompt.addEventListener('click',function(){ if(curNear)openRoom(curNear) });
/* photo mode: one button at the corridor start -> walk frame to frame */
var wphoto=$('#wphoto'), wpm=$('#wpm'), wpmN=$('#wpmN'), wpmCap=$('#wpmCap'), wpmEnd=$('#wpmEnd'), wpmPrev=$('#wpmPrev'), wpmNext=$('#wpmNext'), wpmTip=$('#wpmTip');
function pmSk(n){ if(n&&n.offsetWidth)sketch(n) }
function pmShowBtn(sv){ if(!wphoto)return; var on=!curRoom&&!body.classList.contains('photo-mode'); if(wphoto.hidden===on){ wphoto.hidden=!on; if(on)setTimeout(function(){pmSk(wphoto)},30) } var big=sv<-0.5; if(big!==wphoto._big){ wphoto._big=big; wphoto.classList.toggle('big',big); pmPos(); setTimeout(function(){pmSk(wphoto)},30) } }
function pmPos(){ if(!wphoto)return; var lg=$('.nav .logo')||$('.logo'), r=lg&&lg.getBoundingClientRect(); wphoto.style.left=(!wphoto._big&&r&&r.width)?Math.round(r.right+14)+'px':''; }
W.addEventListener('resize',function(){ setTimeout(pmPos,200) });
if(wphoto){
  wphoto.addEventListener('click',function(){ if(W.PGWorld&&W.PGWorld.active&&!curRoom)W.PGWorld.photoMode(true) });
  [$('#wpmBack'),$('#wpmBack2')].forEach(function(b){ b.addEventListener('click',function(){ W.PGWorld.photoMode(false) }) });
  wpmPrev.addEventListener('click',function(){ W.PGWorld.pmStep(-1) }); wpmNext.addEventListener('click',function(){ W.PGWorld.pmStep(1) });
  W.addEventListener('keydown',function(e){ if(e.key==='Escape'&&body.classList.contains('photo-mode')&&!curRoom&&!locked){ e.preventDefault(); e.stopImmediatePropagation(); W.PGWorld.photoMode(false) } },true);
}

$('#wmenu')&&$('#wmenu').addEventListener('click',function(){ toggleMenu() });

/* ---------- boot ---------- */
function circlePath(){ var p=$('[data-circ]'); if(p){p.setAttribute('d',rell(100,30,98,28,R(21),3,1.14)); setLen(p)} }
prepSign(); circlePath(); prepSketch(hall); prepSketch($('#nav')); drawHall();
var rz=0; W.addEventListener('resize',function(){ clearTimeout(rz); rz=setTimeout(function(){ drawHall(); $$('[data-sk]').forEach(function(n){ if(n.offsetWidth)sketch(n) }); if(cube)cube.size(); if(curRoom){layoutJourney();frame(roomStrip(curRoom))} else frame(hallStrip); if(locked)buildLoader(),setProgress(1); },180) });
if(D.fonts&&D.fonts.ready)D.fonts.ready.then(function(){ drawHall(); $$('[data-sk]').forEach(function(n){ if(n.offsetWidth)sketch(n) }) });
runLoader();
})();
