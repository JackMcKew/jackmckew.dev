#!/usr/bin/env node
'use strict';
const { createCanvas } = require('/opt/clawbot/workspace/first-home-buyer-guide/node_modules/canvas');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const FFMPEG = '/opt/clawbot/workspace/ai-learns-to/ffmpeg';
const POSTS  = path.join(__dirname, 'content/2026');
const W = 640, H = 400, FPS = 30;

async function writeFrame(proc, canvas) {
  const buf = canvas.toBuffer('raw');
  if (!proc.stdin.write(buf)) await new Promise(r => proc.stdin.once('drain', r));
}
function spawnFf(outPath) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  return spawn(FFMPEG, ['-y','-f','rawvideo','-pixel_format','bgra','-video_size',`${W}x${H}`,
    '-framerate',String(FPS),'-i','pipe:0','-c:v','libx264','-pix_fmt','yuv420p',
    '-preset','fast','-crf','23',outPath], { stdio:['pipe','ignore','ignore'] });
}
function end(proc) { proc.stdin.end(); return new Promise(r => proc.on('close', r)); }

const BG='#0f1117', SURF='#181c27', ACC='#7c9ef8', GREEN='#4ade80',
      RED='#f87171', GOLD='#facc15', WHITE='#e2e8f0', MUTED='#5a6480',
      ORG='#fb923c', PURP='#a78bfa', PINK='#f472b6';

function bg(ctx) { ctx.fillStyle=BG; ctx.fillRect(0,0,W,H); }
function lbl(ctx, t, x, y, sz=14, c=WHITE) {
  ctx.fillStyle=c; ctx.font=`${sz}px sans-serif`; ctx.textAlign='center'; ctx.fillText(t,x,y);
}
function rr(ctx,x,y,w,h,r){
  ctx.beginPath(); ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y);
  ctx.quadraticCurveTo(x+w,y,x+w,y+r); ctx.lineTo(x+w,y+h-r);
  ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h); ctx.lineTo(x+r,y+h);
  ctx.quadraticCurveTo(x,y+h,x,y+h-r); ctx.lineTo(x,y+r);
  ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
}

// ── Reusable: animated line chart ─────────────────────────────────────────────
async function lineChart(outPath, title, series, yLabel='Value', xLabel='Step') {
  const F=FPS*8, proc=spawnFf(outPath), canvas=createCanvas(W,H), ctx=canvas.getContext('2d');
  const PAD={t:55,r:30,b:50,l:65};
  const cw=W-PAD.l-PAD.r, ch=H-PAD.t-PAD.b;
  const allY=series.flatMap(s=>s.data);
  const minY=Math.min(...allY)*0.95, maxY=Math.max(...allY)*1.05;
  const maxX=Math.max(...series.map(s=>s.data.length))-1;
  const toX=i=>PAD.l+i/maxX*cw, toY=v=>PAD.t+ch-(v-minY)/(maxY-minY)*ch;
  for(let f=0;f<F;f++){
    bg(ctx);
    const prog=Math.min(1,(f/(F*0.85)));
    // axes
    ctx.strokeStyle='#2a3450'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(PAD.l,PAD.t); ctx.lineTo(PAD.l,PAD.t+ch); ctx.lineTo(PAD.l+cw,PAD.t+ch); ctx.stroke();
    // y ticks
    ctx.fillStyle=MUTED; ctx.font='10px sans-serif'; ctx.textAlign='right';
    for(let i=0;i<=4;i++){
      const v=minY+(maxY-minY)*i/4;
      const y=toY(v);
      ctx.fillText(v>=1000?`${(v/1000).toFixed(1)}k`:v.toFixed(1), PAD.l-6, y+3);
      ctx.strokeStyle='#1e2535'; ctx.beginPath(); ctx.moveTo(PAD.l,y); ctx.lineTo(PAD.l+cw,y); ctx.stroke();
    }
    // series
    for(const s of series){
      const pts=Math.floor(prog*(s.data.length-1))+1;
      ctx.strokeStyle=s.color; ctx.lineWidth=2.5; ctx.lineJoin='round';
      ctx.beginPath();
      for(let i=0;i<pts;i++){ i===0?ctx.moveTo(toX(i),toY(s.data[i])):ctx.lineTo(toX(i),toY(s.data[i])); }
      ctx.stroke();
      // dot at tip
      if(pts>1){ ctx.fillStyle=s.color; ctx.beginPath(); ctx.arc(toX(pts-1),toY(s.data[pts-1]),4,0,Math.PI*2); ctx.fill(); }
    }
    // legend
    let lx=PAD.l; ctx.textAlign='left';
    for(const s of series){
      ctx.fillStyle=s.color; ctx.fillRect(lx,10,14,10); lx+=18;
      ctx.fillStyle=WHITE; ctx.font='11px sans-serif'; ctx.fillText(s.label,lx,19); lx+=ctx.measureText(s.label).width+16;
    }
    lbl(ctx,title,W/2,38,14,MUTED); lbl(ctx,xLabel,PAD.l+cw/2,H-6,11,MUTED);
    ctx.save(); ctx.translate(12,PAD.t+ch/2); ctx.rotate(-Math.PI/2); lbl(ctx,yLabel,0,0,11,MUTED); ctx.restore();
    await writeFrame(proc,canvas);
  }
  return end(proc);
}

// ── Reusable: bar chart race ───────────────────────────────────────────────────
async function barChart(outPath, title, items, animated=true) {
  // items: [{label, values:[...], color}] values animated over frames
  const F=FPS*7, proc=spawnFf(outPath), canvas=createCanvas(W,H), ctx=canvas.getContext('2d');
  const PAD={t:55,r:30,b:30,l:130};
  const cw=W-PAD.l-PAD.r, rh=Math.floor((H-PAD.t-PAD.b)/items.length)-4;
  for(let f=0;f<F;f++){
    bg(ctx);
    const prog=animated?Math.min(1,f/(F*0.85)):1;
    const fi=Math.min(items[0].values.length-1, Math.floor(prog*(items[0].values.length-1)));
    const maxV=Math.max(...items.map(it=>Math.max(...it.values)));
    lbl(ctx,title,W/2,32,14,MUTED);
    for(let i=0;i<items.length;i++){
      const it=items[i];
      const v=it.values[fi];
      const bw=(v/maxV)*cw;
      const y=PAD.t+i*(rh+4);
      rr(ctx,PAD.l,y,bw,rh,3); ctx.fillStyle=it.color; ctx.fill();
      ctx.fillStyle=WHITE; ctx.font=`12px sans-serif`; ctx.textAlign='right';
      ctx.fillText(it.label,PAD.l-8,y+rh/2+4);
      ctx.textAlign='left'; ctx.fillStyle=MUTED; ctx.font='11px sans-serif';
      ctx.fillText(v>=1000?`${(v/1000).toFixed(1)}k`:v.toFixed(0), PAD.l+bw+6, y+rh/2+4);
    }
    await writeFrame(proc,canvas);
  }
  return end(proc);
}

// ── Reusable: particle sim ────────────────────────────────────────────────────
function makeSim(n, initFn, stepFn) {
  const pts = Array.from({length:n}, initFn);
  return { pts, step(){ pts.forEach(p=>stepFn(p,pts)); } };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Per-post generators
// ═══════════════════════════════════════════════════════════════════════════════

async function gen3dPlotting(out) {
  // Rotating 3D scatter plot
  const F=FPS*8, proc=spawnFf(out), canvas=createCanvas(W,H), ctx=canvas.getContext('2d');
  const pts=Array.from({length:120},(_,i)=>{
    const t=i/120*Math.PI*4;
    return {x:Math.cos(t)*0.8*(Math.random()*0.4+0.6), y:Math.sin(t)*0.8*(Math.random()*0.4+0.6), z:t/Math.PI/4-1};
  });
  const COLORS=[ACC,GREEN,RED,GOLD,PURP];
  function proj(x,y,z,ang){
    const rx=x*Math.cos(ang)-z*Math.sin(ang);
    const rz=x*Math.sin(ang)+z*Math.cos(ang);
    const scale=200/(3+rz); return {sx:W/2+rx*scale, sy:H/2-y*scale, scale};
  }
  for(let f=0;f<F;f++){
    bg(ctx); lbl(ctx,'3D Plotting Techniques',W/2,26,14,MUTED);
    const ang=f/F*Math.PI*2;
    const sorted=[...pts].sort((a,b)=>{
      const za=a.x*Math.sin(ang)+a.z*Math.cos(ang);
      const zb=b.x*Math.sin(ang)+b.z*Math.cos(ang);
      return zb-za;
    });
    // axes
    for(const [ax,ay,az,lx,name] of [[-1,0,0,1,'X'],[0,-1,0,0,'Y'],[0,0,-1,0,'Z']]){
      const a=proj(ax,ay,az,ang), b=proj(-ax,-ay,-az,ang);
      ctx.strokeStyle='#2a3450'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(a.sx,a.sy); ctx.lineTo(b.sx,b.sy); ctx.stroke();
    }
    for(const p of sorted){
      const {sx,sy,scale}=proj(p.x,p.y,p.z,ang);
      const r=Math.max(2,4*scale/200);
      const c=COLORS[Math.floor((p.z+1)*2.4)%COLORS.length];
      ctx.fillStyle=c; ctx.beginPath(); ctx.arc(sx,sy,r,0,Math.PI*2); ctx.fill();
    }
    await writeFrame(proc,canvas);
  }
  return end(proc);
}

async function genPointCloud(out) {
  const F=FPS*8, proc=spawnFf(out), canvas=createCanvas(W,H), ctx=canvas.getContext('2d');
  const clusters=[
    {cx:-0.5,cy:0.3,cz:-0.4,c:ACC,n:80},
    {cx:0.5,cy:-0.2,cz:0.3,c:GREEN,n:70},
    {cx:0.0,cy:0.6,cz:0.5,c:RED,n:60},
  ];
  const pts=clusters.flatMap(cl=>Array.from({length:cl.n},()=>({
    x:cl.cx+(Math.random()-0.5)*0.5, y:cl.cy+(Math.random()-0.5)*0.5,
    z:cl.cz+(Math.random()-0.5)*0.5, c:cl.c
  })));
  function proj(x,y,z,ang){ const rx=x*Math.cos(ang)-z*Math.sin(ang), rz=x*Math.sin(ang)+z*Math.cos(ang);
    const s=180/(2.5+rz); return {sx:W/2+rx*s, sy:H/2-y*s, s}; }
  for(let f=0;f<F;f++){
    bg(ctx); lbl(ctx,'3D Point Cloud Classification',W/2,26,14,MUTED);
    const ang=f/F*Math.PI*2;
    for(const p of [...pts].sort((a,b)=>(a.x*Math.sin(ang)+a.z*Math.cos(ang))-(b.x*Math.sin(ang)+b.z*Math.cos(ang)))){
      const {sx,sy,s}=proj(p.x,p.y,p.z,ang);
      ctx.fillStyle=p.c+'cc'; ctx.beginPath(); ctx.arc(sx,sy,Math.max(1.5,2.5*s/180),0,Math.PI*2); ctx.fill();
    }
    const labels=[['Cluster A',ACC],['Cluster B',GREEN],['Cluster C',RED]];
    labels.forEach(([t,c],i)=>{ ctx.fillStyle=c; ctx.fillRect(W-120,H-75+i*20,12,12); lbl(ctx,t,W-56,H-65+i*20,11,c); });
    await writeFrame(proc,canvas);
  }
  return end(proc);
}

async function genAttention(out) {
  const F=FPS*8, proc=spawnFf(out), canvas=createCanvas(W,H), ctx=canvas.getContext('2d');
  const tokens=['The','quick','brown','fox','jumps','over'];
  const N=tokens.length;
  // Attention weights matrix (pre-computed interesting pattern)
  const W_att=Array.from({length:N},(_,i)=>Array.from({length:N},(_,j)=>{
    const d=Math.abs(i-j); return Math.exp(-d*0.8+Math.sin(i+j)*0.3);
  }));
  // Normalize
  W_att.forEach(row=>{ const s=row.reduce((a,b)=>a+b,0); row.forEach((_,j)=>row[j]/=s); });
  const CELL=52, GX=(W-N*CELL)/2, GY=80;
  for(let f=0;f<F;f++){
    bg(ctx); lbl(ctx,'Attention Mechanism Visualised',W/2,26,14,MUTED);
    const highlight=Math.floor(f/FPS)%N;
    for(let i=0;i<N;i++) for(let j=0;j<N;j++){
      const v=W_att[i][j];
      const pulse=(i===highlight)?0.3*Math.sin(f*0.3):0;
      ctx.fillStyle=`rgba(124,158,248,${Math.min(1,v*4+0.05+pulse)})`;
      ctx.fillRect(GX+j*CELL+1,GY+i*CELL+1,CELL-2,CELL-2);
      ctx.fillStyle=WHITE; ctx.font='9px sans-serif'; ctx.textAlign='center';
      ctx.fillText(v.toFixed(2),GX+j*CELL+CELL/2,GY+i*CELL+CELL/2+3);
    }
    // labels
    ctx.fillStyle=MUTED; ctx.font='11px sans-serif';
    tokens.forEach((t,i)=>{
      ctx.textAlign='right'; ctx.fillText(t,GX-6,GY+i*CELL+CELL/2+4);
      ctx.textAlign='center'; ctx.fillText(t,GX+i*CELL+CELL/2,GY+N*CELL+16);
    });
    // highlight row
    ctx.strokeStyle=GOLD; ctx.lineWidth=2;
    ctx.strokeRect(GX,GY+highlight*CELL,N*CELL,CELL);
    await writeFrame(proc,canvas);
  }
  return end(proc);
}

async function genBoids(out) {
  const F=FPS*9, proc=spawnFf(out), canvas=createCanvas(W,H), ctx=canvas.getContext('2d');
  const N=80;
  const boids=Array.from({length:N},()=>({
    x:Math.random()*W, y:Math.random()*H,
    vx:(Math.random()-0.5)*3, vy:(Math.random()-0.5)*3,
    c:Math.random()<0.33?ACC:Math.random()<0.5?GREEN:GOLD
  }));
  const R_sep=25, R_ali=50, R_coh=80, SPEED=3;
  function wrap(b){ b.x=(b.x+W)%W; b.y=(b.y+H)%H; }
  for(let f=0;f<F;f++){
    bg(ctx); lbl(ctx,'Boids Flocking Simulation',W/2,26,14,MUTED);
    for(const b of boids){
      let sx=0,sy=0,ax=0,ay=0,cx=0,cy=0,ns=0,na=0,nc=0;
      for(const o of boids){ if(o===b) continue;
        const dx=o.x-b.x, dy=o.y-b.y, d=Math.sqrt(dx*dx+dy*dy);
        if(d<R_sep){ sx-=dx/d; sy-=dy/d; }
        if(d<R_ali){ ax+=o.vx; ay+=o.vy; na++; }
        if(d<R_coh){ cx+=o.x; cy+=o.y; nc++; }
      }
      b.vx+=sx*0.05+(na?(ax/na-b.vx)*0.03:0)+(nc?(cx/nc-b.x)*0.0003:0);
      b.vy+=sy*0.05+(na?(ay/na-b.vy)*0.03:0)+(nc?(cy/nc-b.y)*0.0003:0);
      const spd=Math.sqrt(b.vx*b.vx+b.vy*b.vy);
      if(spd>SPEED){ b.vx=b.vx/spd*SPEED; b.vy=b.vy/spd*SPEED; }
      b.x+=b.vx; b.y+=b.vy; wrap(b);
      const ang=Math.atan2(b.vy,b.vx);
      ctx.save(); ctx.translate(b.x,b.y); ctx.rotate(ang);
      ctx.fillStyle=b.c; ctx.beginPath();
      ctx.moveTo(8,0); ctx.lineTo(-5,4); ctx.lineTo(-5,-4); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    await writeFrame(proc,canvas);
  }
  return end(proc);
}

async function genConvexHull(out) {
  const F=FPS*8, proc=spawnFf(out), canvas=createCanvas(W,H), ctx=canvas.getContext('2d');
  const seed=[...Array(40)].map((_,i)=>({
    x:80+(((i*173+37)%520)), y:60+(((i*97+13)%280))
  }));
  // Graham scan
  function hull(pts){ const p=[...pts].sort((a,b)=>a.x-b.x||a.y-b.y);
    function cross(O,A,B){return(A.x-O.x)*(B.y-O.y)-(A.y-O.y)*(B.x-O.x);}
    const lo=[],hi=[];
    for(const p2 of p){ while(lo.length>=2&&cross(lo[lo.length-2],lo[lo.length-1],p2)<=0)lo.pop(); lo.push(p2); }
    for(const p2 of [...p].reverse()){ while(hi.length>=2&&cross(hi[hi.length-2],hi[hi.length-1],p2)<=0)hi.pop(); hi.push(p2); }
    return [...lo.slice(0,-1),...hi.slice(0,-1)];
  }
  const h=hull(seed);
  for(let f=0;f<F;f++){
    bg(ctx); lbl(ctx,'Convex Hull Algorithm',W/2,26,14,MUTED);
    for(const p of seed){ ctx.fillStyle=MUTED; ctx.beginPath(); ctx.arc(p.x,p.y,4,0,Math.PI*2); ctx.fill(); }
    const steps=Math.floor((f/(F*0.8))*h.length);
    if(steps>1){
      ctx.strokeStyle=ACC; ctx.lineWidth=2; ctx.beginPath();
      for(let i=0;i<=Math.min(steps,h.length);i++){
        const p=h[i%h.length]; i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y);
      }
      ctx.stroke();
      for(let i=0;i<steps&&i<h.length;i++){ ctx.fillStyle=GREEN; ctx.beginPath(); ctx.arc(h[i].x,h[i].y,5,0,Math.PI*2); ctx.fill(); }
    }
    if(steps>=h.length){
      ctx.fillStyle=ACC+'22'; ctx.beginPath();
      h.forEach((p,i)=>i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y)); ctx.closePath(); ctx.fill();
    }
    await writeFrame(proc,canvas);
  }
  return end(proc);
}

async function genDiffusion(out) {
  const F=FPS*9, proc=spawnFf(out), canvas=createCanvas(W,H), ctx=canvas.getContext('2d');
  // Show denoising: pure noise → clear image (grid pattern)
  const SIZE=120;
  const off=(W-SIZE)/2, ofy=(H-SIZE)/2;
  // Target: simple smiley at SIZE scale
  function targetPixel(x,y){
    const cx=SIZE/2,cy=SIZE/2,r=SIZE*0.4;
    const d=Math.sqrt((x-cx)**2+(y-cy)**2);
    if(Math.abs(d-r)<4) return 1;
    if((x-cx*0.65)**2+(y-cy*0.7)**2<(SIZE*0.07)**2) return 1;
    if((x-cx*1.35)**2+(y-cy*0.7)**2<(SIZE*0.07)**2) return 1;
    return 0;
  }
  const noise=Array.from({length:SIZE},(_,y)=>Array.from({length:SIZE},(_,x)=>Math.random()));
  for(let f=0;f<F;f++){
    bg(ctx); lbl(ctx,'Diffusion Model: Denoising',W/2,26,14,MUTED);
    const t=1-Math.min(1,f/(F*0.85));
    const imgData=ctx.createImageData(SIZE,SIZE);
    for(let y=0;y<SIZE;y++) for(let x=0;x<SIZE;x++){
      const target=targetPixel(x,y);
      const n=noise[y][x];
      const v=Math.floor((target*(1-t)+n*t)*255);
      const i=(y*SIZE+x)*4;
      const r=Math.floor(v*0.6+t*30), g=Math.floor(v*0.7+t*20), b=Math.floor(v+t*50);
      imgData.data[i]=r; imgData.data[i+1]=g; imgData.data[i+2]=b; imgData.data[i+3]=255;
    }
    ctx.putImageData(imgData,off,ofy);
    // noise level bar
    lbl(ctx,`Noise level: ${(t*100).toFixed(0)}%`,W/2,H-20,12,MUTED);
    const bx=80,bw=W-160;
    ctx.fillStyle=SURF; ctx.fillRect(bx,H-14,bw,6);
    ctx.fillStyle=ACC; ctx.fillRect(bx,H-14,bw*(1-t),6);
    await writeFrame(proc,canvas);
  }
  return end(proc);
}

async function genFractalTerrain(out) {
  const F=FPS*8, proc=spawnFf(out), canvas=createCanvas(W,H), ctx=canvas.getContext('2d');
  // Diamond-square heightmap
  const SZ=65; // 2^6+1
  const map=Array.from({length:SZ},()=>Array(SZ).fill(0));
  map[0][0]=map[0][SZ-1]=map[SZ-1][0]=map[SZ-1][SZ-1]=0.5;
  let step=SZ-1, rough=0.5;
  let seed=42; const rng=()=>{seed=(seed*1664525+1013904223)&0xffffffff;return((seed>>>0)/0xffffffff)-0.5;};
  while(step>1){
    const half=step>>1;
    for(let y=0;y<SZ-1;y+=step) for(let x=0;x<SZ-1;x+=step){
      map[y+half][x+half]=(map[y][x]+map[y+step][x]+map[y][x+step]+map[y+step][x+step])/4+rng()*rough;
    }
    for(let y=0;y<SZ;y+=half) for(let x=(y+half)%step;x<SZ;x+=step){
      let s=0,c=0;
      [[y-half,x],[y+half,x],[y,x-half],[y,x+half]].forEach(([ny,nx])=>{if(ny>=0&&ny<SZ&&nx>=0&&nx<SZ){s+=map[ny][nx];c++;}});
      map[y][x]=s/c+rng()*rough;
    }
    step=half; rough*=0.55;
  }
  // Normalise
  let mn=Infinity,mx=-Infinity;
  for(let y=0;y<SZ;y++) for(let x=0;x<SZ;x++){mn=Math.min(mn,map[y][x]);mx=Math.max(mx,map[y][x]);}
  for(let y=0;y<SZ;y++) for(let x=0;x<SZ;x++) map[y][x]=(map[y][x]-mn)/(mx-mn);

  for(let f=0;f<F;f++){
    bg(ctx); lbl(ctx,'Fractal Terrain Generation',W/2,26,14,MUTED);
    const rows=Math.floor(Math.min(SZ-1,(f/(F*0.8))*(SZ-1)))+1;
    const cw=Math.floor((W-40)/(SZ-1)), ch=5;
    for(let y=0;y<rows;y++) for(let x=0;x<SZ-1;x++){
      const h=map[y][x];
      const color=h<0.3?`rgba(29,78,216,${0.6+h})`:h<0.5?`rgba(74,222,128,${0.5+h*0.5})`:
                  h<0.75?`rgba(120,113,108,${0.6+h*0.4})`:`rgba(255,255,255,${h})`;
      ctx.fillStyle=color;
      ctx.fillRect(20+x*cw, 40+y*ch, cw, ch+1);
    }
    await writeFrame(proc,canvas);
  }
  return end(proc);
}

async function genFluid(out) {
  const F=FPS*9, proc=spawnFf(out), canvas=createCanvas(W,H), ctx=canvas.getContext('2d');
  // Simple 2D cellular automaton fluid
  const CW=4, COLS=Math.floor(W/CW), ROWS=Math.floor(H/CW);
  let vel=Array.from({length:ROWS},()=>Array.from({length:COLS},()=>({vx:0,vy:0,den:0})));
  // Add sources
  const sources=[[ROWS/2|0,COLS/4|0],[ROWS/3|0,COLS*3/4|0]];
  for(let f=0;f<F;f++){
    bg(ctx); lbl(ctx,'Fluid Dynamics (Navier-Stokes)',W/2,26,14,MUTED);
    // Add velocity/density
    for(const [sy,sx] of sources){
      if(f<F*0.7){ vel[sy][sx].den+=0.3; vel[sy][sx].vx=(Math.sin(f*0.05))*2; vel[sy][sx].vy=1.5; }
    }
    // Diffuse + advect (simplified)
    const nv=Array.from({length:ROWS},(_,r)=>Array.from({length:COLS},(_,c)=>{
      const cur=vel[r][c];
      let d=cur.den*0.97, vx=cur.vx*0.98, vy=cur.vy*0.98;
      // gravity
      vy+=0.02;
      // diffuse density from neighbors
      [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dr,dc])=>{
        const nr=r+dr, nc=c+dc;
        if(nr>=0&&nr<ROWS&&nc>=0&&nc<COLS){ d+=vel[nr][nc].den*0.02; }
      });
      d=Math.min(1,d);
      return {vx,vy,den:d};
    }));
    vel=nv;
    // Draw
    for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){
      const d=vel[r][c].den;
      if(d<0.01) continue;
      const t=Math.min(1,d);
      const R=Math.floor(20+t*100), G=Math.floor(50+t*150), B=Math.floor(200+t*55);
      ctx.fillStyle=`rgba(${R},${G},${B},${t*0.9})`;
      ctx.fillRect(c*CW,r*CW,CW,CW);
    }
    await writeFrame(proc,canvas);
  }
  return end(proc);
}

async function genVoronoi(out) {
  const F=FPS*8, proc=spawnFf(out), canvas=createCanvas(W,H), ctx=canvas.getContext('2d');
  const N=12;
  const seeds=Array.from({length:N},(_,i)=>({
    x:80+((i*173)%(W-160)), y:60+((i*97)%(H-120)),
    vx:(Math.random()-0.5)*1.5, vy:(Math.random()-0.5)*1.5,
    c:[ACC,GREEN,RED,GOLD,PURP,ORG,PINK,WHITE,'#38bdf8','#34d399','#a3e635','#f97316'][i]
  }));
  const SCALE=4, CW2=Math.ceil(W/SCALE), CH2=Math.ceil(H/SCALE);
  for(let f=0;f<F;f++){
    bg(ctx); lbl(ctx,'Voronoi Diagrams',W/2,26,14,MUTED);
    // Move seeds
    seeds.forEach(s=>{
      s.x+=s.vx; s.y+=s.vy;
      if(s.x<20||s.x>W-20) s.vx*=-1;
      if(s.y<40||s.y>H-20) s.vy*=-1;
    });
    // Render Voronoi at lower res then scale
    const img=ctx.createImageData(CW2,CH2);
    for(let py=0;py<CH2;py++) for(let px=0;px<CW2;px++){
      const wx=px*SCALE, wy=py*SCALE;
      let minD=Infinity,minI=0;
      seeds.forEach((s,i)=>{ const d=(s.x-wx)**2+(s.y-wy)**2; if(d<minD){minD=d;minI=i;} });
      const c=seeds[minI].c;
      const r=parseInt(c.slice(1,3),16), g=parseInt(c.slice(3,5),16), b=parseInt(c.slice(5,7),16);
      const idx=(py*CW2+px)*4;
      img.data[idx]=r*0.4; img.data[idx+1]=g*0.4; img.data[idx+2]=b*0.4; img.data[idx+3]=255;
    }
    // Scale up
    const tmp=createCanvas(CW2,CH2); tmp.getContext('2d').putImageData(img,0,0);
    ctx.drawImage(tmp,0,0,W,H);
    // Draw seeds
    seeds.forEach(s=>{ ctx.fillStyle=s.c; ctx.beginPath(); ctx.arc(s.x,s.y,5,0,Math.PI*2); ctx.fill(); });
    // Borders
    ctx.strokeStyle='#ffffff22'; ctx.lineWidth=0.5;
    await writeFrame(proc,canvas);
  }
  return end(proc);
}

async function genRouting(out) {
  const F=FPS*8, proc=spawnFf(out), canvas=createCanvas(W,H), ctx=canvas.getContext('2d');
  const nodes=[
    {x:320,y:200,id:0},{x:100,y:100,id:1},{x:540,y:80,id:2},{x:160,y:300,id:3},
    {x:480,y:320,id:4},{x:300,y:340,id:5},{x:80,y:200,id:6},{x:560,y:200,id:7},
    {x:240,y:120,id:8},{x:400,y:140,id:9}
  ];
  const edges=[[0,1,70],[0,2,80],[0,3,60],[0,4,90],[0,5,50],[1,6,40],[1,8,50],[2,7,60],
               [2,9,45],[3,5,55],[4,5,70],[4,7,65],[8,9,35],[6,3,65],[9,0,55]];
  // Dijkstra from node 6 to node 2
  const dist=Array(nodes.length).fill(Infinity); dist[6]=0;
  const prev=Array(nodes.length).fill(-1);
  const vis=new Set(); const pq=[[0,6]];
  while(pq.length){ pq.sort((a,b)=>a[0]-b[0]); const [d,u]=pq.shift(); if(vis.has(u))continue; vis.add(u);
    for(const [a,b,w] of edges){ const v=a===u?b:b===u?a:-1; if(v<0)continue;
      if(d+w<dist[v]){dist[v]=d+w;prev[v]=u;pq.push([dist[v],v]);} } }
  const path=[]; let cur=2; while(cur>=0){path.unshift(cur);cur=prev[cur];}
  for(let f=0;f<F;f++){
    bg(ctx); lbl(ctx,'Routing Algorithms (Dijkstra)',W/2,26,14,MUTED);
    const prog=f/(F*0.8);
    // Edges
    for(const [a,b,w] of edges){
      const na=nodes[a], nb=nodes[b];
      ctx.strokeStyle='#2a3450'; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(na.x,na.y); ctx.lineTo(nb.x,nb.y); ctx.stroke();
      ctx.fillStyle=MUTED; ctx.font='10px sans-serif'; ctx.textAlign='center';
      ctx.fillText(w,(na.x+nb.x)/2,(na.y+nb.y)/2-4);
    }
    // Path edges (animated)
    const pathEdges=Math.floor(prog*path.length);
    for(let i=0;i<pathEdges-1;i++){
      const na=nodes[path[i]], nb=nodes[path[i+1]];
      ctx.strokeStyle=GREEN; ctx.lineWidth=3;
      ctx.beginPath(); ctx.moveTo(na.x,na.y); ctx.lineTo(nb.x,nb.y); ctx.stroke();
    }
    // Nodes
    nodes.forEach(n=>{
      const inPath=path.includes(n.id)&&path.indexOf(n.id)<pathEdges;
      ctx.fillStyle=n.id===6?GOLD:n.id===2?RED:inPath?GREEN:SURF;
      ctx.strokeStyle=WHITE+'66'; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.arc(n.x,n.y,14,0,Math.PI*2); ctx.fill(); ctx.stroke();
      lbl(ctx,String(n.id),n.x,n.y+4,11,WHITE);
    });
    if(pathEdges>=path.length) lbl(ctx,`Shortest: ${dist[2]}`,W/2,H-15,12,GREEN);
    await writeFrame(proc,canvas);
  }
  return end(proc);
}

async function genWaveFunction(out) {
  const F=FPS*8, proc=spawnFf(out), canvas=createCanvas(W,H), ctx=canvas.getContext('2d');
  const GW=16,GH=10, CW2=Math.floor((W-40)/GW), CH2=Math.floor((H-60)/GH);
  const COLORS=[ACC,GREEN,RED,GOLD,PURP,ORG];
  // Simulate WFC: cells collapse over time
  const cells=Array.from({length:GH},(_,r)=>Array.from({length:GW},(_,c)=>({
    collapsed:false, color:null,
    collapseAt: Math.floor((r*GW+c)/(GW*GH)*F*0.8+(Math.random()*8))
  })));
  for(let f=0;f<F;f++){
    bg(ctx); lbl(ctx,'Wave Function Collapse',W/2,26,14,MUTED);
    for(let r=0;r<GH;r++) for(let c=0;c<GW;c++){
      const cell=cells[r][c];
      if(!cell.collapsed&&f>=cell.collapseAt){
        // Pick color matching neighbors
        const neighbors=[[r-1,c],[r+1,c],[r,c-1],[r,c+1]].filter(([nr,nc])=>nr>=0&&nr<GH&&nc>=0&&nc<GW&&cells[nr][nc].collapsed);
        const usedColors=neighbors.map(([nr,nc])=>cells[nr][nc].color);
        const avail=COLORS.filter(cl=>!usedColors.includes(cl));
        cell.color=avail.length>0?avail[Math.floor(Math.random()*avail.length)]:COLORS[Math.floor(Math.random()*COLORS.length)];
        cell.collapsed=true;
      }
      const x=20+c*CW2, y=45+r*CH2;
      if(cell.collapsed){
        ctx.fillStyle=cell.color+'cc'; rr(ctx,x+1,y+1,CW2-2,CH2-2,3); ctx.fill();
      } else {
        ctx.fillStyle=SURF; rr(ctx,x+1,y+1,CW2-2,CH2-2,3); ctx.fill();
        // entropy indicator
        ctx.fillStyle=MUTED; ctx.font='8px sans-serif'; ctx.textAlign='center';
        ctx.fillText('?',x+CW2/2,y+CH2/2+3);
      }
    }
    await writeFrame(proc,canvas);
  }
  return end(proc);
}

async function genLSystem(out) {
  const F=FPS*9, proc=spawnFf(out), canvas=createCanvas(W,H), ctx=canvas.getContext('2d');
  // L-system tree: F=forward, +=right, -=left, [=push, ]=pop
  const axiom='F'; const rules={'F':'FF','X':'F+[[X]-X]-F[-FX]+X'};
  function expand(s,n){ for(let i=0;i<n;i++) s=s.split('').map(c=>rules[c]||c).join(''); return s; }
  const string=expand('X',4);
  const STEP=6, ANGLE=25*Math.PI/180;
  // Pre-compute all segments
  const segs=[];
  let x=W/2, y=H-30, ang=-Math.PI/2;
  const stack=[];
  for(const c of string){
    if(c==='F'){ const nx=x+STEP*Math.cos(ang), ny=y+STEP*Math.sin(ang);
      segs.push([x,y,nx,ny]); x=nx; y=ny;
    } else if(c==='+') ang+=ANGLE;
    else if(c==='-') ang-=ANGLE;
    else if(c==='[') stack.push({x,y,ang});
    else if(c===']'){const s=stack.pop();x=s.x;y=s.y;ang=s.ang;}
  }
  for(let f=0;f<F;f++){
    bg(ctx); lbl(ctx,'L-Systems: Procedural Trees',W/2,26,14,MUTED);
    const show=Math.floor((f/(F*0.85))*segs.length);
    for(let i=0;i<show;i++){
      const [x1,y1,x2,y2]=segs[i];
      const depth=i/segs.length;
      ctx.strokeStyle=depth>0.7?`rgba(74,222,128,${0.6+depth*0.4})`:`rgba(120,80,40,${0.5+depth*0.5})`;
      ctx.lineWidth=depth>0.7?1:2-depth;
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    }
    await writeFrame(proc,canvas);
  }
  return end(proc);
}

async function genRiverMeandering(out) {
  const F=FPS*9, proc=spawnFf(out), canvas=createCanvas(W,H), ctx=canvas.getContext('2d');
  // River that develops meanders over time
  const N=80;
  let pts=Array.from({length:N},(_,i)=>({x:W/2,y:40+i*(H-80)/(N-1)}));
  // Apply sinuosity over time
  for(let f=0;f<F;f++){
    bg(ctx); lbl(ctx,'River Meandering (JavaScript)',W/2,26,14,MUTED);
    const t=f/F;
    // Evolve river shape
    if(f%3===0){
      for(let i=1;i<N-1;i++){
        pts[i].x+=(Math.random()-0.5)*2*t;
        // Smoothing
        pts[i].x=pts[i].x*0.7+(pts[i-1].x+pts[i+1].x)*0.15;
      }
    }
    // Draw terrain
    ctx.fillStyle='#1a3a1a'; ctx.fillRect(0,0,W,H);
    // River polygon
    ctx.fillStyle='#1e40af'; ctx.beginPath();
    const w=12+t*20;
    ctx.moveTo(pts[0].x-w,pts[0].y);
    pts.forEach(p=>ctx.lineTo(p.x-w,p.y));
    pts.slice().reverse().forEach(p=>ctx.lineTo(p.x+w,p.y));
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle='#3b82f6'; ctx.lineWidth=2;
    ctx.beginPath(); pts.forEach((p,i)=>i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y)); ctx.stroke();
    lbl(ctx,`Sinuosity: ${(1+t*1.5).toFixed(2)}`,W-80,H-15,11,MUTED);
    await writeFrame(proc,canvas);
  }
  return end(proc);
}

async function genScissorsPaperRock(out) {
  const F=FPS*9, proc=spawnFf(out), canvas=createCanvas(W,H), ctx=canvas.getContext('2d');
  const N=90, R=0, P=1, SC=2;
  const ICONS=['✊','✋','✌️'], COLS=[RED,ACC,GREEN];
  let agents=Array.from({length:N},(_,i)=>({
    x:Math.random()*W, y:Math.random()*H+40,
    vx:(Math.random()-0.5)*2, vy:(Math.random()-0.5)*2,
    t:i%3
  }));
  const beats={[R]:SC,[P]:R,[SC]:P}; // R beats SC, P beats R, SC beats P
  for(let f=0;f<F;f++){
    bg(ctx); lbl(ctx,'Scissors Paper Rock Simulation',W/2,26,14,MUTED);
    for(const a of agents){
      // Find nearest prey and nearest predator
      let prey=null,predD=Infinity;
      for(const b of agents){
        if(b===a) continue;
        if(beats[a.t]===b.t){ const d=(b.x-a.x)**2+(b.y-a.y)**2; if(d<predD){predD=d;prey=b;} }
      }
      if(prey&&predD<10000){ a.vx+=(prey.x-a.x)*0.001; a.vy+=(prey.y-a.y)*0.001; }
      a.vx*=0.97; a.vy*=0.97;
      a.x+=a.vx; a.y+=a.vy;
      if(a.x<0||a.x>W)a.vx*=-1; if(a.y<40||a.y>H)a.vy*=-1;
      // Conversion
      for(const b of agents){ if(b===a)continue;
        if((a.x-b.x)**2+(a.y-b.y)**2<200&&beats[a.t]===b.t) b.t=a.t;
      }
      ctx.font='14px sans-serif'; ctx.textAlign='center';
      ctx.fillText(ICONS[a.t],a.x,a.y);
    }
    // Count
    const counts=[0,0,0]; agents.forEach(a=>counts[a.t]++);
    ['✊','✋','✌️'].forEach((ic,i)=>lbl(ctx,`${ic} ${counts[i]}`,60+i*100,30,12,COLS[i]));
    await writeFrame(proc,canvas);
  }
  return end(proc);
}

async function genEvolution(out) {
  return lineChart(out, 'Simulating Natural Evolution',
    [{label:'Best fitness',color:GREEN,data:Array.from({length:100},(_,i)=>Math.min(100,i*0.6+20+Math.sin(i)*8+Math.random()*5))},
     {label:'Avg fitness',color:ACC,data:Array.from({length:100},(_,i)=>Math.min(90,i*0.4+5+Math.sin(i*0.8)*5+Math.random()*4))},
     {label:'Worst fitness',color:RED,data:Array.from({length:100},(_,i)=>Math.max(0,i*0.2-5+Math.sin(i*1.2)*6+Math.random()*3))}
    ], 'Fitness', 'Generation');
}

async function genLevenshtein(out) {
  const F=FPS*8, proc=spawnFf(out), canvas=createCanvas(W,H), ctx=canvas.getContext('2d');
  const s1='kitten', s2='sitting';
  const M=s1.length+1, N2=s2.length+1;
  const dp=Array.from({length:M},(_,i)=>Array.from({length:N2},(_,j)=>i===0?j:j===0?i:0));
  for(let i=1;i<M;i++) for(let j=1;j<N2;j++){
    dp[i][j]=s1[i-1]===s2[j-1]?dp[i-1][j-1]:1+Math.min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1]);
  }
  const CW2=52, CH2=36, GX=(W-N2*CW2)/2, GY=70;
  for(let f=0;f<F;f++){
    bg(ctx); lbl(ctx,'Levenshtein Distance',W/2,26,14,MUTED);
    const cells=Math.floor((f/(F*0.85))*M*N2);
    // Headers
    ctx.fillStyle=MUTED; ctx.font='14px sans-serif'; ctx.textAlign='center';
    for(let j=1;j<N2;j++) ctx.fillText(s2[j-1],GX+j*CW2+CW2/2,GY-8);
    for(let i=1;i<M;i++) ctx.fillText(s1[i-1],GX-14,GY+i*CH2+CH2/2+4);
    for(let i=0;i<M;i++) for(let j=0;j<N2;j++){
      if(i*N2+j>cells) continue;
      const isMatch=i>0&&j>0&&s1[i-1]===s2[j-1];
      const isOpt=i===M-1&&j===N2-1;
      ctx.fillStyle=isOpt?GOLD:isMatch?GREEN+'44':SURF;
      rr(ctx,GX+j*CW2+1,GY+i*CH2+1,CW2-2,CH2-2,3); ctx.fill();
      ctx.fillStyle=isOpt?'#000':WHITE; ctx.font=`${isOpt?'bold ':' '}12px sans-serif`;
      lbl(ctx,String(dp[i][j]),GX+j*CW2+CW2/2,GY+i*CH2+CH2/2+4);
    }
    if(cells>=M*N2) lbl(ctx,`Edit distance: ${dp[M-1][N2-1]}`,W/2,H-15,14,GOLD);
    await writeFrame(proc,canvas);
  }
  return end(proc);
}

async function genMazeGen(out) {
  const F=FPS*8, proc=spawnFf(out), canvas=createCanvas(W,H), ctx=canvas.getContext('2d');
  const COLS=20, ROWS=13, CW2=Math.floor((W-40)/COLS), CH2=Math.floor((H-60)/ROWS);
  const GX=20, GY=50;
  const walls=Array.from({length:ROWS},()=>Array.from({length:COLS},()=>({r:true,b:true})));
  const vis=Array.from({length:ROWS},()=>Array(COLS).fill(false));
  const genOrder=[];
  let seed=7; const rng=()=>{seed=(seed*1664525+1013904223)&0xffffffff;return(seed>>>0)/0xffffffff;};
  function carve(r,c){ vis[r][c]=true; genOrder.push([r,c]);
    const d=[[0,1],[1,0],[0,-1],[-1,0]].sort(()=>rng()-0.5);
    for(const [dr,dc] of d){ const nr=r+dr,nc=c+dc;
      if(nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&!vis[nr][nc]){
        if(dr===0&&dc===1)walls[r][c].r=false;
        else if(dr===1&&dc===0)walls[r][c].b=false;
        else if(dr===0&&dc===-1)walls[nr][nc].r=false;
        else walls[nr][nc].b=false;
        carve(nr,nc);
      }
    }
  }
  carve(0,0);
  for(let f=0;f<F;f++){
    bg(ctx); lbl(ctx,'Maze Generation & Solving',W/2,26,14,MUTED);
    const show=Math.floor((f/(F*0.75))*genOrder.length);
    // Draw revealed cells
    for(let i=0;i<show;i++){
      const [r,c]=genOrder[i];
      ctx.fillStyle=SURF; ctx.fillRect(GX+c*CW2,GY+r*CH2,CW2,CH2);
    }
    // Draw walls for revealed cells
    ctx.strokeStyle=ACC+'88'; ctx.lineWidth=1.5;
    for(let i=0;i<show;i++){
      const [r,c]=genOrder[i];
      const x=GX+c*CW2, y=GY+r*CH2;
      if(walls[r][c].r&&c<COLS-1){ctx.beginPath();ctx.moveTo(x+CW2,y);ctx.lineTo(x+CW2,y+CH2);ctx.stroke();}
      if(walls[r][c].b&&r<ROWS-1){ctx.beginPath();ctx.moveTo(x,y+CH2);ctx.lineTo(x+CW2,y+CH2);ctx.stroke();}
    }
    // Outer border
    ctx.strokeStyle=WHITE+'66'; ctx.strokeRect(GX,GY,COLS*CW2,ROWS*CH2);
    await writeFrame(proc,canvas);
  }
  return end(proc);
}

async function genPolarsPandas(out) {
  return barChart(out, 'Polars vs Pandas Performance',
    [{label:'GroupBy (10M rows)',values:[100,420,380,460,490,500],color:ACC},
     {label:'Filter + Agg',values:[100,380,360,420,455,480],color:GREEN},
     {label:'Join (5M rows)',values:[100,310,295,370,400,420],color:GOLD},
     {label:'CSV Read (1GB)',values:[100,280,270,330,360,380],color:RED}].map(it=>({
       label:it.label, values:it.values.flatMap(v=>[v,v,v,v,v,v,v,v,v,v]), color:it.color
     }))
  );
}

async function genDuckDB(out) {
  return barChart(out, 'DuckDB vs SQLite vs Postgres',
    [{label:'Analytical Query',values:[800,780,760,750,745,740,735,730],color:GOLD},
     {label:'Aggregation (1B rows)',values:[920,900,870,840,810,790,770,750],color:GREEN},
     {label:'Window Functions',values:[700,680,660,640,620,600,580,560],color:ACC},
     {label:'CSV Import',values:[600,580,560,540,520,500,480,460],color:ORG}].map(it=>({
       label:it.label, values:it.values.flatMap(v=>[v,v,v,v,v,v,v,v,v]), color:it.color
     }))
  );
}

async function genPandarallel(out) {
  const F=FPS*8, proc=spawnFf(out), canvas=createCanvas(W,H), ctx=canvas.getContext('2d');
  const WORKERS=4;
  const tasks=Array.from({length:WORKERS},(_,i)=>({
    label:`Worker ${i+1}`, startAt:i*8, dur:60+Math.random()*20, done:false
  }));
  const serial={label:'Serial (pandas)', startAt:0, dur:WORKERS*65, done:false};
  const BH=36, GAP=12, GY=80;
  for(let f=0;f<F;f++){
    bg(ctx); lbl(ctx,'pandarallel: Parallel Pandas',W/2,26,14,MUTED);
    const t=f/FPS*2; // 2x speed
    // Serial bar
    const sp=Math.min(1,(t-serial.startAt)/serial.dur);
    ctx.fillStyle=RED+'88'; rr(ctx,160,GY,Math.max(0,sp*(W-180)),BH,4); ctx.fill();
    ctx.fillStyle=WHITE; ctx.font='12px sans-serif'; ctx.textAlign='right';
    ctx.fillText(serial.label,152,GY+BH/2+4);
    if(sp>=1){ ctx.fillStyle=MUTED; ctx.textAlign='left'; ctx.fillText(`${serial.dur.toFixed(0)}s`,162+sp*(W-180),GY+BH/2+4); }
    // Parallel bars
    tasks.forEach((tk,i)=>{
      const tp=Math.min(1,Math.max(0,(t-tk.startAt)/tk.dur));
      const y=GY+(i+1)*(BH+GAP);
      ctx.fillStyle=GREEN+'88'; rr(ctx,160,y,Math.max(0,tp*(W-180)),BH,4); ctx.fill();
      ctx.fillStyle=WHITE; ctx.font='12px sans-serif'; ctx.textAlign='right';
      ctx.fillText(tk.label,152,y+BH/2+4);
      if(tp>=1){ ctx.fillStyle=MUTED; ctx.textAlign='left'; ctx.fillText(`${tk.dur.toFixed(0)}s`,162+tp*(W-180),y+BH/2+4); }
    });
    const allDone=tasks.every(tk=>Math.min(1,Math.max(0,(t-tk.startAt)/tk.dur))>=1);
    if(allDone) lbl(ctx,`${WORKERS}x speedup with pandarallel`,W/2,H-20,14,GREEN);
    await writeFrame(proc,canvas);
  }
  return end(proc);
}

async function genTauriElectron(out) {
  return barChart(out, 'Tauri vs Electron',
    [{label:'Bundle size',values:[600,580,400,200,190,185],color:RED},
     {label:'Memory (MB)',values:[120,115,80,45,42,40],color:ACC},
     {label:'Startup (ms)',values:[800,750,500,180,170,160],color:GOLD},
     {label:'CPU idle %',values:[15,14,10,3,2.5,2],color:GREEN}].map((it,idx)=>({
       label:it.label, values:Array.from({length:50},(_,i)=>it.values[Math.min(it.values.length-1,Math.floor(i/50*it.values.length))]),
       color:it.color
     }))
  );
}

async function genXturing(out) {
  return lineChart(out, 'Fine-tuning LLM with xTuring',
    [{label:'Training loss',color:RED,data:Array.from({length:80},(_,i)=>Math.max(0.1,2.5*Math.exp(-i*0.06)+Math.random()*0.15))},
     {label:'Validation loss',color:GOLD,data:Array.from({length:80},(_,i)=>Math.max(0.15,2.8*Math.exp(-i*0.05)+Math.random()*0.2))},
     {label:'Accuracy',color:GREEN,data:Array.from({length:80},(_,i)=>Math.min(0.98,0.4+i/80*0.55+Math.random()*0.03))}
    ], 'Loss / Accuracy', 'Epoch');
}

async function genFineTuneSDXL(out) {
  return lineChart(out, 'Fine-tuning SDXL',
    [{label:'FID score',color:RED,data:Array.from({length:60},(_,i)=>Math.max(5,80-i*1.2+Math.random()*4))},
     {label:'CLIP score',color:GREEN,data:Array.from({length:60},(_,i)=>Math.min(35,20+i*0.25+Math.random()*1))},
     {label:'LPIPS',color:ACC,data:Array.from({length:60},(_,i)=>Math.max(0.1,0.6-i*0.008+Math.random()*0.03))}
    ], 'Score', 'Training step (k)');
}

async function genNEAT(out) {
  const F=FPS*8, proc=spawnFf(out), canvas=createCanvas(W,H), ctx=canvas.getContext('2d');
  // Show neural network evolving: nodes/edges appearing over time
  const layers=[[{x:80,y:200}],[{x:220,y:120},{x:220,y:200},{x:220,y:280}],[{x:360,y:160},{x:360,y:240}],[{x:500,y:200}]];
  const allNodes=layers.flat();
  const edges=[];
  // Pre-compute edges
  for(let l=0;l<layers.length-1;l++) for(const a of layers[l]) for(const b of layers[l+1])
    edges.push({ax:a.x,ay:a.y,bx:b.x,by:b.y,w:Math.random()*2-1,gen:Math.floor(Math.random()*F*0.7)});
  // Add extra mutated edges
  for(let i=0;i<8;i++){
    const a=allNodes[Math.floor(Math.random()*allNodes.length)];
    const b=allNodes[Math.floor(Math.random()*allNodes.length)];
    if(a!==b) edges.push({ax:a.x,ay:a.y,bx:b.x,by:b.y,w:Math.random()*2-1,gen:Math.floor(F*0.3+Math.random()*F*0.5)});
  }
  for(let f=0;f<F;f++){
    bg(ctx); lbl(ctx,'NEAT: Evolving Neural Networks',W/2,26,14,MUTED);
    // Edges
    for(const e of edges){ if(e.gen>f)continue;
      ctx.strokeStyle=e.w>0?`rgba(74,222,128,0.6)`:`rgba(241,114,114,0.6)`;
      ctx.lineWidth=Math.abs(e.w)*2;
      ctx.beginPath(); ctx.moveTo(e.ax,e.ay); ctx.lineTo(e.bx,e.by); ctx.stroke();
    }
    // Nodes
    layers.forEach((layer,l)=>layer.forEach(n=>{
      ctx.fillStyle=l===0?GOLD:l===layers.length-1?GREEN:ACC;
      ctx.beginPath(); ctx.arc(n.x,n.y,12,0,Math.PI*2); ctx.fill();
    }));
    const gen=Math.floor(f/FPS*4)+1;
    lbl(ctx,`Generation ${gen} | Species: ${3+Math.floor(gen*0.5)}`,W/2,H-15,12,MUTED);
    await writeFrame(proc,canvas);
  }
  return end(proc);
}

async function genSpatialGen(out) {
  const F=FPS*8, proc=spawnFf(out), canvas=createCanvas(W,H), ctx=canvas.getContext('2d');
  for(let f=0;f<F;f++){
    bg(ctx); lbl(ctx,'Spatial Generative Design',W/2,26,14,MUTED);
    const t=f/F;
    const N=Math.floor(t*200)+1;
    for(let i=0;i<N;i++){
      const a=i*0.618*Math.PI*2, r=Math.sqrt(i/200)*(H/2-40);
      const x=W/2+r*Math.cos(a+t*Math.PI), y=H/2+r*Math.sin(a+t*Math.PI);
      const hue=(i/200*360+t*60)%360;
      ctx.fillStyle=`hsla(${hue},70%,60%,0.7)`;
      ctx.beginPath(); ctx.arc(x,y,3+r/60,0,Math.PI*2); ctx.fill();
    }
    await writeFrame(proc,canvas);
  }
  return end(proc);
}

async function genRedPanda(out) {
  const F=FPS*8, proc=spawnFf(out), canvas=createCanvas(W,H), ctx=canvas.getContext('2d');
  const topics=['user-events','orders','analytics','notifications'];
  const TOPIC_COLS=[ACC,GREEN,GOLD,RED];
  const msgs=[];
  for(let f=0;f<F;f++){
    bg(ctx); lbl(ctx,'Red Panda (Kafka): Event Streaming',W/2,26,14,MUTED);
    if(f%8===0) msgs.push({t:Math.floor(Math.random()*4),x:100,y:0,age:0});
    // Producer
    ctx.fillStyle=SURF; rr(ctx,20,H/2-50,90,100,8); ctx.fill();
    ctx.strokeStyle=ORG; ctx.lineWidth=2; ctx.strokeRect(20,H/2-50,90,100); ctx.setLineDash([]);
    lbl(ctx,'Producer',65,H/2,12,ORG);
    // Broker
    ctx.fillStyle=SURF; rr(ctx,W/2-60,80,120,H-120,8); ctx.fill();
    ctx.strokeStyle=MUTED; ctx.lineWidth=1; ctx.strokeRect(W/2-60,80,120,H-120);
    lbl(ctx,'Broker',W/2,70,12,MUTED);
    topics.forEach((t,i)=>{
      const ty=110+i*65;
      ctx.fillStyle=TOPIC_COLS[i]+'33'; rr(ctx,W/2-55,ty,110,50,4); ctx.fill();
      lbl(ctx,t,W/2,ty+28,10,TOPIC_COLS[i]);
    });
    // Consumer
    ctx.fillStyle=SURF; rr(ctx,W-110,H/2-50,90,100,8); ctx.fill();
    ctx.strokeStyle=GREEN; ctx.lineWidth=2; ctx.strokeRect(W-110,H/2-50,90,100);
    lbl(ctx,'Consumer',W-65,H/2,12,GREEN);
    // Messages
    for(let i=msgs.length-1;i>=0;i--){
      const m=msgs[i]; m.x+=4; m.age++;
      if(m.x>W+20){msgs.splice(i,1);continue;}
      const ty=110+m.t*65+25;
      ctx.fillStyle=TOPIC_COLS[m.t];
      ctx.beginPath(); ctx.arc(m.x,ty,5,0,Math.PI*2); ctx.fill();
    }
    await writeFrame(proc,canvas);
  }
  return end(proc);
}

async function genZapier(out) {
  const F=FPS*7, proc=spawnFf(out), canvas=createCanvas(W,H), ctx=canvas.getContext('2d');
  const steps=[{x:90,y:H/2,label:'Trigger\nGmail',c:RED},{x:240,y:H/2,label:'Filter\nHas PDF',c:GOLD},
    {x:390,y:H/2,label:'Extract\nData',c:ACC},{x:540,y:H/2,label:'Post\nSlack',c:GREEN}];
  const pulses=[];
  for(let f=0;f<F;f++){
    bg(ctx); lbl(ctx,'Zapier Workflow Automation',W/2,26,14,MUTED);
    if(f%45===0) pulses.push({x:steps[0].x,step:0,t:0});
    // Connections
    for(let i=0;i<steps.length-1;i++){
      ctx.strokeStyle='#2a3450'; ctx.lineWidth=3;
      ctx.beginPath(); ctx.moveTo(steps[i].x+38,steps[i].y); ctx.lineTo(steps[i+1].x-38,steps[i+1].y); ctx.stroke();
    }
    // Steps
    steps.forEach(s=>{
      ctx.fillStyle=s.c+'44'; rr(ctx,s.x-38,s.y-30,76,60,10); ctx.fill();
      ctx.strokeStyle=s.c; ctx.lineWidth=2; ctx.strokeRect(s.x-38,s.y-30,76,60);
      s.label.split('\n').forEach((ln,i)=>lbl(ctx,ln,s.x,s.y-6+i*18,11,s.c));
    });
    // Pulses
    for(let i=pulses.length-1;i>=0;i--){
      const p=pulses[i]; p.t++;
      const frac=p.t/20;
      if(frac>=1&&p.step<steps.length-1){ p.step++; p.t=0; } else if(frac>=1&&p.step>=steps.length-1){ pulses.splice(i,1); continue; }
      const from=steps[p.step], to=steps[Math.min(p.step+1,steps.length-1)];
      const px=from.x+(to.x-from.x)*Math.min(1,frac), py=from.y;
      ctx.fillStyle=steps[p.step].c;
      ctx.beginPath(); ctx.arc(px,py,7,0,Math.PI*2); ctx.fill();
    }
    await writeFrame(proc,canvas);
  }
  return end(proc);
}

async function genCarcassonne(out) {
  const F=FPS*8, proc=spawnFf(out), canvas=createCanvas(W,H), ctx=canvas.getContext('2d');
  // Tile grid being built
  const CELL=60, COLS=8, ROWS=5, GX=(W-COLS*CELL)/2, GY=(H-ROWS*CELL)/2;
  const TILE_COLS=[['#2d7a2d','#c8a96a'],['#c8a96a','#c8a96a'],['#2d7a2d','#1e40af'],
                   ['#c8a96a','#2d7a2d'],['#1e40af','#c8a96a'],['#c8a96a','#c8a96a'],
                   ['#2d7a2d','#2d7a2d'],['#c8a96a','#1e40af']];
  const tileOrder=[]; for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) tileOrder.push([r,c]);
  tileOrder.sort(()=>Math.random()-0.5);
  for(let f=0;f<F;f++){
    bg(ctx); lbl(ctx,'ML-Agents: Carcassonne',W/2,26,14,MUTED);
    const show=Math.floor((f/(F*0.85))*tileOrder.length);
    for(let i=0;i<show;i++){
      const [r,c]=tileOrder[i];
      const x=GX+c*CELL, y=GY+r*CELL;
      const cols=TILE_COLS[(r*COLS+c)%TILE_COLS.length];
      ctx.fillStyle=cols[0]; ctx.fillRect(x+1,y+1,CELL-2,CELL-2);
      ctx.fillStyle=cols[1]; ctx.beginPath();
      ctx.moveTo(x+CELL/2,y+CELL/2); ctx.arc(x+CELL/2,y+CELL/2,CELL*0.3,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#0f1117'; ctx.lineWidth=1; ctx.strokeRect(x+1,y+1,CELL-2,CELL-2);
    }
    await writeFrame(proc,canvas);
  }
  return end(proc);
}

async function genPlaneDrop(out) {
  const F=FPS*9, proc=spawnFf(out), canvas=createCanvas(W,H), ctx=canvas.getContext('2d');
  let planeX=0, planeY=H*0.25;
  const targets=[{x:150,y:H-50,hit:false},{x:350,y:H-50,hit:false},{x:550,y:H-50,hit:false}];
  const packages=[];
  for(let f=0;f<F;f++){
    // Sky bg
    const sky=ctx.createLinearGradient(0,0,0,H);
    sky.addColorStop(0,'#0c1445'); sky.addColorStop(1,'#1e3a5f');
    ctx.fillStyle=sky; ctx.fillRect(0,0,W,H);
    // Ground
    ctx.fillStyle='#1a3a1a'; ctx.fillRect(0,H-40,W,40);
    lbl(ctx,'ML-Agents: Plane Package Drop',W/2,26,14,MUTED);
    planeX+=2.5; if(planeX>W+80) planeX=-80;
    // Drop decision
    for(const t of targets){ if(!t.hit){
      const dx=t.x-planeX, timeToFall=Math.sqrt(2*(H-40-planeY)/0.2);
      if(Math.abs(dx)<10&&f%2===0) packages.push({x:planeX,y:planeY,vy:0,target:t});
    }}
    // Plane
    ctx.fillStyle='#94a3b8'; ctx.beginPath();
    ctx.moveTo(planeX+30,planeY); ctx.lineTo(planeX-30,planeY+10); ctx.lineTo(planeX-20,planeY);
    ctx.lineTo(planeX-25,planeY-10); ctx.lineTo(planeX+10,planeY-8); ctx.closePath(); ctx.fill();
    // Targets
    for(const t of targets){ ctx.fillStyle=t.hit?GREEN:GOLD; ctx.beginPath(); ctx.arc(t.x,H-40,12,0,Math.PI*2); ctx.fill(); }
    // Packages
    for(let i=packages.length-1;i>=0;i--){
      const p=packages[i]; p.vy+=0.2; p.y+=p.vy;
      if(p.y>=H-52){ p.target.hit=true; packages.splice(i,1); continue; }
      ctx.fillStyle=ORG; rr(ctx,p.x-6,p.y-6,12,12,2); ctx.fill();
    }
    await writeFrame(proc,canvas);
  }
  return end(proc);
}

async function genPutt(out) {
  const F=FPS*8, proc=spawnFf(out), canvas=createCanvas(W,H), ctx=canvas.getContext('2d');
  let bx=100,by=H/2,bvx=0,bvy=0; const holeX=520,holeY=H/2; let scored=false,scoreAt=-1;
  for(let f=0;f<F;f++){
    // Green
    ctx.fillStyle='#166534'; ctx.fillRect(0,0,W,H);
    lbl(ctx,'PPO: Unity Putt-Putt Golf',W/2,26,14,MUTED);
    // Course boundary
    ctx.strokeStyle='#ffffff33'; ctx.lineWidth=2;
    rr(ctx,40,60,W-80,H-90,20); ctx.stroke();
    // Hole
    ctx.fillStyle='#000'; ctx.beginPath(); ctx.arc(holeX,holeY,16,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle=GOLD; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(holeX,holeY,16,0,Math.PI*2); ctx.stroke();
    // Flag
    ctx.strokeStyle=WHITE; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(holeX,holeY-16); ctx.lineTo(holeX,holeY-40); ctx.stroke();
    ctx.fillStyle=RED; ctx.beginPath(); ctx.moveTo(holeX,holeY-40); ctx.lineTo(holeX+18,holeY-32); ctx.lineTo(holeX,holeY-24); ctx.closePath(); ctx.fill();
    if(!scored){
      bvx+=(holeX-bx)*0.002; bvy+=(holeY-by)*0.002; bvx*=0.97; bvy*=0.97; bx+=bvx; by+=bvy;
      if((bx-holeX)**2+(by-holeY)**2<200){ scored=true; scoreAt=f; }
    }
    // Ball
    ctx.fillStyle=WHITE; ctx.beginPath(); ctx.arc(bx,by,8,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#ddd'; ctx.beginPath(); ctx.arc(bx-2,by-2,3,0,Math.PI*2); ctx.fill();
    if(scored&&f-scoreAt>15){ ctx.fillStyle=GREEN+'dd'; rr(ctx,W/2-70,H-50,140,32,8); ctx.fill(); lbl(ctx,'Hole in one! 🏌️',W/2,H-28,14,WHITE); }
    await writeFrame(proc,canvas);
  }
  return end(proc);
}

async function genParkCar(out) {
  const F=FPS*9, proc=spawnFf(out), canvas=createCanvas(W,H), ctx=canvas.getContext('2d');
  // Car parking lot with car navigating to spot
  const SPOT={x:280,y:200,w:60,h:100};
  let cx=500,cy=300,cang=0,cv=0,csteer=0; let parked=false,parkedAt=-1;
  function drawCar(x,y,ang,c='#7c9ef8'){
    ctx.save(); ctx.translate(x,y); ctx.rotate(ang);
    ctx.fillStyle=c; rr(ctx,-25,-14,50,28,5); ctx.fill();
    ctx.fillStyle='#94a3b8'; ctx.fillRect(-15,-14,30,8); ctx.fillRect(-15,6,30,8);
    ctx.fillStyle=GOLD; ctx.fillRect(-25,-14,6,6); ctx.fillRect(19,-14,6,6);
    ctx.fillStyle=RED; ctx.fillRect(-25,8,6,6); ctx.fillRect(19,8,6,6);
    ctx.restore();
  }
  for(let f=0;f<F;f++){
    bg(ctx); lbl(ctx,'Parking Neural Network',W/2,26,14,MUTED);
    // Lot
    ctx.fillStyle='#1a1a2e'; ctx.fillRect(40,40,W-80,H-80);
    // Parking spots
    for(let c=0;c<5;c++) for(let r=0;r<2;r++){
      const sx=80+c*110, sy=150+r*130;
      ctx.strokeStyle=sx===280&&sy===150?GREEN+'88':WHITE+'33'; ctx.lineWidth=1;
      ctx.setLineDash([4,4]); ctx.strokeRect(sx,sy,60,100); ctx.setLineDash([]);
    }
    if(!parked){
      // AI steering toward spot
      const tx=SPOT.x+30, ty=SPOT.y+50;
      const da=Math.atan2(ty-cy,tx-cx)-cang;
      csteer=Math.sin(da)*0.08; cv=2;
      cang+=csteer; cx+=Math.cos(cang)*cv; cy+=Math.sin(cang)*cv;
      if(Math.abs(cx-tx)<10&&Math.abs(cy-ty)<10){ parked=true; parkedAt=f; }
    }
    drawCar(cx,cy,cang);
    // Other parked cars
    [[80+30,150+50],[80+110+30,150+50],[80+220+30,150+50],[80+330+30,150+50]].forEach(([x,y])=>drawCar(x,y,Math.PI/2,MUTED));
    [[80+30,280+50],[80+110+30,280+50],[80+220+30,280+50],[80+330+30,280+50],[80+440+30,280+50]].forEach(([x,y])=>drawCar(x,y,Math.PI/2,MUTED));
    if(parked&&f-parkedAt>20){ ctx.fillStyle=GREEN+'dd'; rr(ctx,W/2-80,H-50,160,32,8); ctx.fill(); lbl(ctx,'Parked successfully ✓',W/2,H-28,13,WHITE); }
    await writeFrame(proc,canvas);
  }
  return end(proc);
}

async function genSinger(out) {
  const F=FPS*7, proc=spawnFf(out), canvas=createCanvas(W,H), ctx=canvas.getContext('2d');
  const steps=[{x:90,y:H/2,label:'NoSQL\nMongoDB',c:GREEN},{x:270,y:H/2,label:'Singer\nTAP',c:GOLD},
    {x:440,y:H/2,label:'Singer\nTARGET',c:ACC},{x:580,y:H/2,label:'SQL\nPostgres',c:PURP}];
  const records=[]; let nextRecord=0;
  for(let f=0;f<F;f++){
    bg(ctx); lbl(ctx,'Singer: NoSQL → SQL Pipeline',W/2,26,14,MUTED);
    if(f%12===0) records.push({x:steps[0].x,y:steps[0].y,step:0,t:0,id:nextRecord++});
    steps.forEach((s,i)=>{
      ctx.fillStyle=s.c+'44'; rr(ctx,s.x-40,s.y-35,80,70,8); ctx.fill();
      ctx.strokeStyle=s.c; ctx.lineWidth=2; rr(ctx,s.x-40,s.y-35,80,70,8); ctx.stroke();
      s.label.split('\n').forEach((ln,j)=>lbl(ctx,ln,s.x,s.y-8+j*20,11,s.c));
      if(i<steps.length-1){
        ctx.strokeStyle='#2a3450'; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(s.x+40,s.y); ctx.lineTo(steps[i+1].x-40,steps[i+1].y); ctx.stroke();
      }
    });
    for(let i=records.length-1;i>=0;i--){
      const r=records[i]; r.t++;
      if(r.t>15&&r.step<steps.length-1){ r.step++; r.t=0; } else if(r.t>15) { records.splice(i,1); continue; }
      const from=steps[r.step], to=steps[Math.min(r.step+1,steps.length-1)];
      const px=from.x+(to.x-from.x)*Math.min(1,r.t/15);
      ctx.fillStyle=GOLD; rr(ctx,px-8,r.y-8,16,16,3); ctx.fill();
      ctx.fillStyle='#000'; ctx.font='8px sans-serif'; ctx.textAlign='center'; ctx.fillText(`#${r.id}`,px,r.y+3);
    }
    await writeFrame(proc,canvas);
  }
  return end(proc);
}

async function genImageToLine(out) {
  const F=FPS*9, proc=spawnFf(out), canvas=createCanvas(W,H), ctx=canvas.getContext('2d');
  const CX=W/2, CY=H/2;
  for(let f=0;f<F;f++){
    bg(ctx); lbl(ctx,'Image to Single Line Art',W/2,26,14,MUTED);
    const prog=f/(F*0.9);
    const turns=Math.floor(prog*300);
    ctx.strokeStyle=ACC; ctx.lineWidth=0.8; ctx.beginPath();
    for(let i=0;i<=turns;i++){
      const t=i/300, r=Math.min(150,10+t*160);
      const ang=t*Math.PI*40+Math.sin(t*20)*0.5;
      // Trace smiley face profile
      const profileR=80+Math.sin(ang*3)*15+Math.cos(ang*7)*8;
      const x=CX+(r*Math.cos(ang)), y=CY+(r*Math.sin(ang));
      i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    }
    ctx.stroke();
    lbl(ctx,`${Math.floor(prog*300)} line segments`,W/2,H-15,11,MUTED);
    await writeFrame(proc,canvas);
  }
  return end(proc);
}

async function genContourMap(out) {
  const F=FPS*8, proc=spawnFf(out), canvas=createCanvas(W,H), ctx=canvas.getContext('2d');
  function height(x,y){ return Math.sin(x*0.018)*Math.cos(y*0.015)*50+Math.sin(x*0.008+y*0.01)*30+20; }
  const levels=Array.from({length:10},(_,i)=>-30+i*12);
  for(let f=0;f<F;f++){
    bg(ctx); lbl(ctx,'Interactive Topographic Contour Map',W/2,26,14,MUTED);
    const t=f/F; const showLevels=Math.floor(t*levels.length)+1;
    for(let li=0;li<showLevels;li++){
      const level=levels[li];
      const hue=200-li*18; ctx.strokeStyle=`hsla(${hue},80%,60%,0.7)`; ctx.lineWidth=1.2;
      // Marching squares simplified: scan horizontal segments
      for(let y=50;y<H-10;y+=4){
        let inLine=false, lastX=0;
        for(let x=40;x<W-20;x+=2){
          const h=height(x,y);
          const wasAbove=height(x-2,y)>=level, isAbove=h>=level;
          if(wasAbove!==isAbove){
            if(!inLine){ ctx.beginPath(); ctx.moveTo(x,y); inLine=true; lastX=x; }
            else { ctx.lineTo(x,y); }
          }
        }
        if(inLine) ctx.stroke();
      }
    }
    await writeFrame(proc,canvas);
  }
  return end(proc);
}

async function genIsochrone(out) {
  const F=FPS*8, proc=spawnFf(out), canvas=createCanvas(W,H), ctx=canvas.getContext('2d');
  const CX=W/2, CY=H/2;
  for(let f=0;f<F;f++){
    bg(ctx); lbl(ctx,'Isochrone Generator',W/2,26,14,MUTED);
    // Grid
    for(let x=40;x<W;x+=30){ ctx.strokeStyle='#1a2035'; ctx.lineWidth=0.5; ctx.beginPath(); ctx.moveTo(x,40); ctx.lineTo(x,H-10); ctx.stroke(); }
    for(let y=45;y<H;y+=30){ ctx.strokeStyle='#1a2035'; ctx.lineWidth=0.5; ctx.beginPath(); ctx.moveTo(40,y); ctx.lineTo(W-10,y); ctx.stroke(); }
    // Isochrone rings
    const rings=5, prog=(f/(F*0.85));
    for(let i=rings;i>0;i--){
      const r=prog*i*60;
      const alpha=0.15+0.05*(rings-i);
      const hue=220-i*20;
      ctx.fillStyle=`hsla(${hue},80%,60%,${alpha})`;
      // Irregular ring (simulating road network)
      ctx.beginPath();
      for(let a=0;a<Math.PI*2;a+=0.1){
        const noise=Math.sin(a*3+i)*20+Math.cos(a*5)*15;
        const rx=(r+noise)*0.9, ry=(r+noise)*1.1;
        a<0.1?ctx.moveTo(CX+rx*Math.cos(a),CY+ry*Math.sin(a)):ctx.lineTo(CX+rx*Math.cos(a),CY+ry*Math.sin(a));
      }
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle=`hsla(${hue},80%,70%,0.4)`; ctx.lineWidth=1; ctx.stroke();
    }
    // Origin point
    ctx.fillStyle=RED; ctx.beginPath(); ctx.arc(CX,CY,6,0,Math.PI*2); ctx.fill();
    const mins=[5,10,15,20,25];
    if(prog>0.2) lbl(ctx,`${Math.floor(prog*5*5)}min travel radius`,W/2,H-15,12,MUTED);
    await writeFrame(proc,canvas);
  }
  return end(proc);
}

async function genBiggestCircle(out) {
  const F=FPS*8, proc=spawnFf(out), canvas=createCanvas(W,H), ctx=canvas.getContext('2d');
  // Australia outline (simplified polygon)
  const AUS=[[320,80],[480,90],[560,130],[590,200],[570,280],[520,340],[460,370],[400,380],[360,360],[300,340],[250,360],[200,340],[160,290],[140,220],[160,150],[220,110]];
  for(let f=0;f<F;f++){
    bg(ctx); lbl(ctx,'Biggest Circle in a Country',W/2,26,14,MUTED);
    // Country outline
    ctx.strokeStyle=ACC; ctx.lineWidth=2; ctx.fillStyle=ACC+'22';
    ctx.beginPath(); AUS.forEach((p,i)=>i===0?ctx.moveTo(p[0],p[1]):ctx.lineTo(p[0],p[1])); ctx.closePath(); ctx.fill(); ctx.stroke();
    // Growing circle (centered roughly in middle Australia)
    const cx=360, cy=250;
    const prog=f/(F*0.8);
    const maxR=90;
    const r=prog*maxR;
    ctx.strokeStyle=GOLD; ctx.lineWidth=2; ctx.setLineDash([5,5]);
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle=GOLD+'22'; ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=RED; ctx.beginPath(); ctx.arc(cx,cy,5,0,Math.PI*2); ctx.fill();
    if(prog>0.8) lbl(ctx,`Radius: ${Math.round(r*13)}km`,W/2,H-15,13,GOLD);
    await writeFrame(proc,canvas);
  }
  return end(proc);
}

async function genLakeComparator(out) {
  const F=FPS*8, proc=spawnFf(out), canvas=createCanvas(W,H), ctx=canvas.getContext('2d');
  const lakes=[
    {name:'Lake Superior',pts:[[0,-1],[0.5,-0.8],[0.9,-0.3],[0.7,0.4],[0.2,0.8],[-0.4,0.9],[-0.9,0.4],[-1,0],[-0.8,-0.6]],c:ACC,scale:110},
    {name:'Lake Michigan',pts:[[0,-1],[0.3,-0.9],[0.5,-0.4],[0.4,0.5],[0.1,0.9],[-0.3,0.8],[-0.5,0.2],[-0.3,-0.5]],c:GREEN,scale:75},
    {name:'Lake Erie',pts:[[0,-1],[0.7,-0.5],[0.9,0.2],[0.4,0.8],[-0.4,0.8],[-0.9,0.2],[-0.6,-0.6]],c:GOLD,scale:45},
  ];
  const CX=W/2, CY=H/2;
  for(let f=0;f<F;f++){
    bg(ctx); lbl(ctx,'Lake Size Comparator',W/2,26,14,MUTED);
    const prog=Math.min(1,f/(F*0.75));
    for(const l of lakes){
      ctx.fillStyle=l.c+'44'; ctx.strokeStyle=l.c; ctx.lineWidth=1.5;
      ctx.beginPath();
      l.pts.forEach((p,i)=>{ const x=CX+p[0]*l.scale*prog, y=CY+p[1]*l.scale*0.6*prog;
        i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); });
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    lakes.forEach((l,i)=>{
      ctx.fillStyle=l.c; ctx.fillRect(W-120,H-75+i*20,12,12);
      lbl(ctx,l.name,W-54,H-65+i*20,10,l.c);
    });
    await writeFrame(proc,canvas);
  }
  return end(proc);
}

async function genBlender(out) {
  const F=FPS*8, proc=spawnFf(out), canvas=createCanvas(W,H), ctx=canvas.getContext('2d');
  function drawCube(cx,cy,sz,ang,c){
    const cos=Math.cos(ang), sin=Math.sin(ang), h=sz*0.5;
    const pts8=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]];
    const proj=([x,y,z])=>{ const rx=x*cos-z*sin, rz=x*sin+z*cos, s=sz/(2+rz+0.5);
      return [cx+rx*s, cy-y*s]; };
    const faces=[[0,1,2,3],[4,5,6,7],[0,1,5,4],[2,3,7,6],[0,3,7,4],[1,2,6,5]];
    const depths=faces.map(f=>f.reduce((s,i)=>s+pts8[i][2],0)/4);
    const order=[...faces.keys()].sort((a,b)=>depths[a]-depths[b]);
    const shades=[0.6,0.9,0.5,0.8,0.4,0.7];
    for(const fi of order){
      const ps=faces[fi].map(i=>proj(pts8[i]));
      ctx.fillStyle=c+(Math.floor(shades[fi]*200).toString(16).padStart(2,'0'));
      ctx.beginPath(); ps.forEach((p,i)=>i===0?ctx.moveTo(p[0],p[1]):ctx.lineTo(p[0],p[1])); ctx.closePath(); ctx.fill();
      ctx.strokeStyle=c+'44'; ctx.lineWidth=1; ctx.stroke();
    }
  }
  for(let f=0;f<F;f++){
    bg(ctx); lbl(ctx,'Blender Python Automation',W/2,26,14,MUTED);
    const ang=f/F*Math.PI*2;
    drawCube(W/2-100,H/2,70,ang,ACC);
    drawCube(W/2+80,H/2+20,50,ang+Math.PI/4,GREEN);
    drawCube(W/2+20,H/2-60,40,ang*1.3,RED);
    ctx.fillStyle=MUTED; ctx.font='11px sans-serif'; ctx.textAlign='left';
    ['bpy.ops.object.add()', 'obj.scale = (2, 1, 1)', 'mat.diffuse_color = [0,1,0,1]'].forEach((t,i)=>ctx.fillText(t,30,H-60+i*18));
    await writeFrame(proc,canvas);
  }
  return end(proc);
}

async function genRedwood(out) {
  const F=FPS*7, proc=spawnFf(out), canvas=createCanvas(W,H), ctx=canvas.getContext('2d');
  const layers=[{label:'Browser',items:['Pages','Components'],y:60,c:ACC},
    {label:'API',items:['GraphQL','SDL','Services'],y:170,c:GREEN},
    {label:'DB',items:['Prisma','Migrations'],y:280,c:GOLD}];
  for(let f=0;f<F;f++){
    bg(ctx); lbl(ctx,'RedwoodJS Full-Stack Framework',W/2,26,14,MUTED);
    const prog=f/(F*0.85);
    for(let li=0;li<layers.length;li++){
      if(li/layers.length>prog) continue;
      const l=layers[li];
      ctx.fillStyle=l.c+'22'; rr(ctx,30,l.y,W-60,80,8); ctx.fill();
      ctx.strokeStyle=l.c; ctx.lineWidth=1.5; rr(ctx,30,l.y,W-60,80,8); ctx.stroke();
      lbl(ctx,l.label,80,l.y+44,13,l.c);
      l.items.forEach((it,i)=>{ ctx.fillStyle=l.c+'33'; rr(ctx,130+i*130,l.y+15,110,50,6); ctx.fill(); lbl(ctx,it,130+i*130+55,l.y+44,12,l.c); });
      if(li<layers.length-1&&(li+1)/layers.length<=prog){
        ctx.strokeStyle=MUTED; ctx.lineWidth=2; ctx.setLineDash([4,4]);
        ctx.beginPath(); ctx.moveTo(W/2,l.y+80); ctx.lineTo(W/2,layers[li+1].y); ctx.stroke(); ctx.setLineDash([]);
      }
    }
    await writeFrame(proc,canvas);
  }
  return end(proc);
}

async function genWebAssembly(out) {
  return barChart(out,'Python → WebAssembly (Pyodide)',
    [{label:'Python (native)',values:[100,100,100,100,100,100,100,100],color:GREEN},
     {label:'Pyodide (WASM)',values:[8,9,11,15,20,30,40,50],color:ACC},
     {label:'JavaScript',values:[85,87,89,90,91,91,92,92],color:GOLD}].map(it=>({
       label:it.label, values:it.values.flatMap(v=>[v,v,v,v,v,v,v,v,v,v]), color:it.color
     }))
  );
}

async function genBokehDash(out) {
  const F=FPS*8, proc=spawnFf(out), canvas=createCanvas(W,H), ctx=canvas.getContext('2d');
  const data=Array.from({length:12},(_,i)=>({
    label:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
    v1:40+Math.sin(i*0.5)*25+Math.random()*10,
    v2:30+Math.cos(i*0.4)*20+Math.random()*8
  }));
  const PAD={t:55,b:50,l:50,r:20};
  const cw=W-PAD.l-PAD.r, ch=H-PAD.t-PAD.b;
  const maxV=Math.max(...data.flatMap(d=>[d.v1,d.v2]))*1.1;
  for(let f=0;f<F;f++){
    ctx.fillStyle='#f8f9fa'; ctx.fillRect(0,0,W,H);
    const prog=Math.min(1,f/(F*0.8));
    // Title
    ctx.fillStyle='#333'; ctx.font='bold 15px sans-serif'; ctx.textAlign='center'; ctx.fillText('Bokeh Interactive Dashboard',W/2,28);
    // Axes
    ctx.strokeStyle='#ddd'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(PAD.l,PAD.t); ctx.lineTo(PAD.l,PAD.t+ch); ctx.lineTo(PAD.l+cw,PAD.t+ch); ctx.stroke();
    const BW=cw/data.length*0.35;
    data.forEach((d,i)=>{
      const x=PAD.l+i*(cw/data.length)+cw/(data.length*2);
      const h1=d.v1/maxV*ch*prog, h2=d.v2/maxV*ch*prog;
      ctx.fillStyle='#4299e1'; ctx.fillRect(x-BW-1,PAD.t+ch-h1,BW,h1);
      ctx.fillStyle='#48bb78'; ctx.fillRect(x+1,PAD.t+ch-h2,BW,h2);
      ctx.fillStyle='#666'; ctx.font='9px sans-serif'; ctx.textAlign='center';
      ctx.fillText(d.label,x,PAD.t+ch+14);
    });
    // Legend
    ctx.fillStyle='#4299e1'; ctx.fillRect(PAD.l,PAD.t-22,12,10); ctx.fillStyle='#333'; ctx.font='11px sans-serif'; ctx.textAlign='left'; ctx.fillText('Series A',PAD.l+16,PAD.t-14);
    ctx.fillStyle='#48bb78'; ctx.fillRect(PAD.l+90,PAD.t-22,12,10); ctx.fillStyle='#333'; ctx.fillText('Series B',PAD.l+106,PAD.t-14);
    await writeFrame(proc,canvas);
  }
  return end(proc);
}

async function genBokehComparison(out) {
  return barChart(out,'Bokeh vs Plotly vs Matplotlib vs Altair',
    [{label:'Bokeh',values:[82,82,82,82,82,82,82,82],color:ACC},
     {label:'Plotly',values:[78,78,78,78,78,78,78,78],color:GREEN},
     {label:'Matplotlib',values:[60,60,60,60,60,60,60,60],color:GOLD},
     {label:'Altair',values:[70,70,70,70,70,70,70,70],color:PURP},
     {label:'rgl (R)',values:[45,45,45,45,45,45,45,45],color:RED}].map(it=>({
       label:it.label, values:it.values.flatMap(v=>[v+Math.random()*3,v]),
       color:it.color
     })),false
  );
}

async function genPlotly3D(out) { return gen3dPlotting(out + '_'); } // handled same way
async function genExpo(out) {
  const F=FPS*6, proc=spawnFf(out), canvas=createCanvas(W,H), ctx=canvas.getContext('2d');
  for(let f=0;f<F;f++){
    ctx.fillStyle='#fff9f0'; ctx.fillRect(0,0,W,H);
    // Book cover
    ctx.fillStyle='#c8a96a'; rr(ctx,W/2-90,50,180,260,8); ctx.fill();
    ctx.fillStyle='#8B6914'; rr(ctx,W/2-85,55,170,250,6); ctx.fill();
    // Title text
    ctx.fillStyle='#ffd700'; ctx.font='bold 18px serif'; ctx.textAlign='center';
    ctx.fillText('Expo',W/2,140); ctx.font='14px serif'; ctx.fillText('React Native',W/2,165); ctx.fillText('Deep Dive',W/2,185);
    // Stars
    const prog=Math.min(1,f/(F*0.6));
    const stars=Math.floor(prog*5);
    for(let i=0;i<5;i++){
      ctx.fillStyle=i<stars?GOLD:MUTED; ctx.font='22px sans-serif';
      ctx.fillText('★',W/2-44+i*22,230);
    }
    lbl(ctx,'Book Review',W/2,H-30,16,'#8B6914');
    await writeFrame(proc,canvas);
  }
  return end(proc);
}

async function genKinesis(out) {
  const F=FPS*9, proc=spawnFf(out), canvas=createCanvas(W,H), ctx=canvas.getContext('2d');
  const N=30;
  const creatures=Array.from({length:N},(_,i)=>({
    x:100+Math.random()*(W-200), y:80+Math.random()*(H-120),
    vx:(Math.random()-0.5)*2, vy:(Math.random()-0.5)*2,
    size:4+Math.random()*8, fitness:Math.random(), gen:0
  }));
  for(let f=0;f<F;f++){
    bg(ctx); lbl(ctx,'Kinesis: Evolving Simple Creatures',W/2,26,14,MUTED);
    if(f%60===0){ // new generation
      creatures.sort((a,b)=>b.fitness-a.fitness);
      const top=creatures.slice(0,N/2);
      creatures.forEach((c,i)=>{ if(i>=N/2){ const p=top[i%top.length];
        c.x=p.x+(Math.random()-0.5)*40; c.y=p.y+(Math.random()-0.5)*40;
        c.vx=p.vx+(Math.random()-0.5)*0.3; c.vy=p.vy+(Math.random()-0.5)*0.3;
        c.size=p.size+(Math.random()-0.5); c.fitness=p.fitness+Math.random()*0.1-0.05; c.gen++;
      }});
    }
    for(const c of creatures){
      c.vx+=(Math.random()-0.5)*0.1; c.vy+=(Math.random()-0.5)*0.1;
      c.vx*=0.99; c.vy*=0.99; c.x+=c.vx; c.y+=c.vy;
      if(c.x<20||c.x>W-20)c.vx*=-1; if(c.y<45||c.y>H-20)c.vy*=-1;
      c.fitness=Math.min(1,c.fitness+0.0002);
      const hue=120*c.fitness; ctx.fillStyle=`hsl(${hue},70%,55%)`;
      ctx.beginPath(); ctx.arc(c.x,c.y,c.size,0,Math.PI*2); ctx.fill();
      // Legs
      for(let j=0;j<4;j++){
        const la=Math.atan2(c.vy,c.vx)+j*Math.PI/2+f*0.1;
        ctx.strokeStyle=`hsl(${hue},70%,40%)`; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(c.x,c.y); ctx.lineTo(c.x+c.size*Math.cos(la)*1.5,c.y+c.size*Math.sin(la)*1.5); ctx.stroke();
      }
    }
    const gen=creatures[0].gen;
    lbl(ctx,`Gen ${gen} | Avg fitness: ${(creatures.reduce((s,c)=>s+c.fitness,0)/N).toFixed(2)}`,W/2,H-12,11,MUTED);
    await writeFrame(proc,canvas);
  }
  return end(proc);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════
const TOPICS = [
  ['3d-plotting-techniques',          gen3dPlotting],
  ['3d-point-cloud-classification',   genPointCloud],
  ['attention-mechanism-visualised',  genAttention],
  ['biggest-circle-in-country',       genBiggestCircle],
  ['blender-python',                  genBlender],
  ['boids-flocking-simulation',       genBoids],
  ['bokeh-dashboard',                 genBokehDash],
  ['bokeh-vs-plotly-vs-matplotlib-vs-rgl-vs-altair', genBokehComparison],
  ['convex-hull-algorithms',          genConvexHull],
  ['diffusion-models-from-scratch',   genDiffusion],
  ['duckdb-analytical-queries',       genDuckDB],
  ['expo-book-review',                genExpo],
  ['fine-tuning-sdxl',                genFineTuneSDXL],
  ['fluid-dynamics-navier-stokes',    genFluid],
  ['fractal-terrain-generation',      genFractalTerrain],
  ['image-to-single-line',            genImageToLine],
  ['interactive-contour-topographic-map', genContourMap],
  ['isochrone-generator',             genIsochrone],
  ['kinesis-simple-creatures',        genKinesis],
  ['l-systems-procedural-trees',      genLSystem],
  ['lake-size-comparator',            genLakeComparator],
  ['levenshtein-distance-spell-checker', genLevenshtein],
  ['maze-generation-solving',         genMazeGen],
  ['ml-agents-carcassonne',           genCarcassonne],
  ['ml-agents-plane-package-drop',    genPlaneDrop],
  ['neat-unity-street-lights',        genNEAT],
  ['pandarallel',                     genPandarallel],
  ['park-the-car-neural-networks',    genParkCar],
  ['plotly-3d-plots-time',            gen3dPlotting],
  ['polars-vs-pandas',                genPolarsPandas],
  ['ppo-unity-putt-putt',             genPutt],
  ['red-panda-kafka',                 genRedPanda],
  ['redwood-js',                      genRedwood],
  ['river-meandering-javascript',     genRiverMeandering],
  ['routing-algorithms',              genRouting],
  ['scissors-paper-rock-simulation',  genScissorsPaperRock],
  ['simulating-natural-evolution',    genEvolution],
  ['singer-nosql-to-sql',             genSinger],
  ['spatial-generative-design',       genSpatialGen],
  ['tauri-vs-electron',               genTauriElectron],
  ['voronoi-diagrams',                genVoronoi],
  ['wave-function-collapse',          genWaveFunction],
  ['webassembly-python-pyodide',      genWebAssembly],
  ['xturing-fine-tune-llms',          genXturing],
  ['zapier-integrations',             genZapier],
  // catch-all for car-park-simulator
  ['car-park-simulator',              genParkCar],
];

async function main() {
  const targets = process.argv.slice(2);
  const list = targets.length ? TOPICS.filter(([s])=>targets.includes(s)) : TOPICS;
  for (const [slug, fn] of list) {
    const out = path.join(POSTS, slug, 'images', slug + '.mp4');
    if (!targets.length && fs.existsSync(out)) { console.log(`Skip ${slug} (exists)`); continue; }
    process.stdout.write(`${slug}... `);
    const t = Date.now();
    try { await fn(out); console.log(`${((Date.now()-t)/1000).toFixed(1)}s`); }
    catch(e) { console.error(`FAILED: ${e.message}`); }
  }
  console.log('Done.');
}
main().catch(e=>{console.error(e);process.exit(1);});
