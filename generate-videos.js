#!/usr/bin/env node
'use strict';
/**
 * generate-videos.js
 * Generates gameplay videos for all AI-learns blog posts.
 * Uses node-canvas for rendering + ffmpeg for encoding.
 */

const { createCanvas } = require('/opt/clawbot/workspace/first-home-buyer-guide/node_modules/canvas');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const FFMPEG   = '/opt/clawbot/workspace/ai-learns-to/ffmpeg';
const POSTS    = path.join(__dirname, 'content/2026');
const W = 640, H = 400, FPS = 30;

// ── Backpressure-safe frame writer ────────────────────────────────────────────
async function writeFrame(proc, canvas) {
  const buf = canvas.toBuffer('raw');
  if (!proc.stdin.write(buf)) {
    await new Promise(r => proc.stdin.once('drain', r));
  }
}

// ── Spawn ffmpeg for a given output path ─────────────────────────────────────
function spawnFfmpeg(outPath) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  return spawn(FFMPEG, [
    '-y', '-f', 'rawvideo', '-pixel_format', 'bgra',
    '-video_size', `${W}x${H}`, '-framerate', String(FPS),
    '-i', 'pipe:0',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
    '-preset', 'fast', '-crf', '23',
    outPath
  ], { stdio: ['pipe', 'ignore', 'ignore'] });
}

// ── Colour helpers ────────────────────────────────────────────────────────────
const BG    = '#0f1117';
const SURF  = '#181c27';
const ACC   = '#7c9ef8';
const GREEN = '#4ade80';
const RED   = '#f87171';
const GOLD  = '#facc15';
const WHITE = '#e2e8f0';
const MUTED = '#5a6480';

function drawBg(ctx) {
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);
}

function label(ctx, text, x, y, size = 14, color = WHITE) {
  ctx.fillStyle = color;
  ctx.font = `${size}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(text, x, y);
}

function pill(ctx, text, x, y, color = ACC) {
  ctx.font = '12px sans-serif';
  const w = ctx.measureText(text).width + 16;
  ctx.fillStyle = color + '33';
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  roundRect(ctx, x - w / 2, y - 10, w, 20, 4);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.fillText(text, x, y + 4);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ═══════════════════════════════════════════════════════════════════════════════
// GAME GENERATORS
// ═══════════════════════════════════════════════════════════════════════════════

// ── 1. PONG ────────────────────────────────────────────────────────────────────
async function genPong(outPath) {
  const FRAMES = FPS * 10;
  const proc = spawnFfmpeg(outPath);
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  const PH = 60, PW = 10, BALL_R = 7;
  let bx = W / 2, by = H / 2;
  let vx = 5, vy = 3.5;
  let ly = H / 2, ry = H / 2;
  let sl = 0, sr = 0;
  const HEADER = 40;

  for (let f = 0; f < FRAMES; f++) {
    drawBg(ctx);

    // header bar
    ctx.fillStyle = SURF;
    ctx.fillRect(0, 0, W, HEADER);
    label(ctx, 'PONG', W / 2, 26, 15, MUTED);
    label(ctx, String(sl), W / 2 - 60, 26, 18, WHITE);
    label(ctx, String(sr), W / 2 + 60, 26, 18, ACC);
    // centre line
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = MUTED + '55';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W / 2, HEADER); ctx.lineTo(W / 2, H); ctx.stroke();
    ctx.setLineDash([]);

    // ball physics
    bx += vx; by += vy;
    if (by - BALL_R < HEADER) { by = HEADER + BALL_R; vy = Math.abs(vy); }
    if (by + BALL_R > H)      { by = H - BALL_R; vy = -Math.abs(vy); }

    // left heuristic paddle (80% tracking + noise)
    const lTarget = by;
    ly += Math.sign(lTarget - ly) * Math.min(Math.abs(lTarget - ly), 3.5);
    ly = Math.max(HEADER + PH / 2, Math.min(H - PH / 2, ly));

    // right AI paddle (perfect)
    ry += Math.sign(by - ry) * Math.min(Math.abs(by - ry), 5.5);
    ry = Math.max(HEADER + PH / 2, Math.min(H - PH / 2, ry));

    // paddle collision
    if (bx - BALL_R < 22 + PW && Math.abs(by - ly) < PH / 2) {
      bx = 22 + PW + BALL_R; vx = Math.abs(vx) * 1.05;
      vy += (by - ly) * 0.05;
    }
    if (bx + BALL_R > W - 22 - PW && Math.abs(by - ry) < PH / 2) {
      bx = W - 22 - PW - BALL_R; vx = -Math.abs(vx) * 1.05;
      vy += (by - ry) * 0.05;
    }
    vx = Math.max(-9, Math.min(9, vx));
    vy = Math.max(-7, Math.min(7, vy));

    // score & reset
    if (bx < 0) { sr++; bx = W / 2; by = H / 2; vx = 5; vy = 3.5; }
    if (bx > W) { sl++; bx = W / 2; by = H / 2; vx = -5; vy = 3.5; }

    // draw paddles
    ctx.fillStyle = WHITE;
    ctx.fillRect(22, ly - PH / 2, PW, PH);
    ctx.fillStyle = ACC;
    ctx.fillRect(W - 22 - PW, ry - PH / 2, PW, PH);

    // ball glow
    const grd = ctx.createRadialGradient(bx, by, 0, bx, by, BALL_R * 2);
    grd.addColorStop(0, '#ffffff');
    grd.addColorStop(1, '#ffffff00');
    ctx.fillStyle = grd;
    ctx.beginPath(); ctx.arc(bx, by, BALL_R * 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(bx, by, BALL_R, 0, Math.PI * 2); ctx.fill();

    // AI label
    label(ctx, 'AI', W - 22 - PW / 2, HEADER + 14, 10, ACC);

    await writeFrame(proc, canvas);
  }
  proc.stdin.end();
  return new Promise(r => proc.on('close', r));
}

// ── 2. BREAKOUT ───────────────────────────────────────────────────────────────
async function genBreakout(outPath) {
  const FRAMES = FPS * 10;
  const proc = spawnFfmpeg(outPath);
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  const ROWS = 5, COLS = 10;
  const BW = (W - 40) / COLS, BH = 18;
  const BRICKS_TOP = 50;
  const bricks = Array.from({ length: ROWS * COLS }, (_, i) => ({
    row: Math.floor(i / COLS), col: i % COLS, alive: true
  }));
  const BRICK_COLORS = [RED, '#fb923c', GOLD, GREEN, ACC];

  const PAD_W = 80, PAD_H = 10;
  let px = W / 2;
  let bx = W / 2, by = H - 60;
  let vx = 4, vy = -5;
  let score = 0;

  for (let f = 0; f < FRAMES; f++) {
    drawBg(ctx);

    // score
    label(ctx, `BREAKOUT  score: ${score}`, W / 2, 25, 14, MUTED);

    // move paddle toward ball x
    px += Math.sign(bx - px) * Math.min(Math.abs(bx - px), 5);
    px = Math.max(PAD_W / 2 + 10, Math.min(W - PAD_W / 2 - 10, px));

    // ball physics
    bx += vx; by += vy;
    if (bx < 10)     { bx = 10; vx = Math.abs(vx); }
    if (bx > W - 10) { bx = W - 10; vx = -Math.abs(vx); }
    if (by < 35)     { by = 35; vy = Math.abs(vy); }
    if (by > H)      { bx = W / 2; by = H - 60; vx = 4; vy = -5; }

    // paddle collision
    if (by + 6 > H - 40 && by + 6 < H - 28 && Math.abs(bx - px) < PAD_W / 2) {
      vy = -Math.abs(vy);
      vx += (bx - px) * 0.04;
    }

    // brick collision
    for (const b of bricks) {
      if (!b.alive) continue;
      const bkX = 20 + b.col * BW, bkY = BRICKS_TOP + b.row * (BH + 4);
      if (bx > bkX && bx < bkX + BW - 2 && by > bkY && by < bkY + BH) {
        b.alive = false; score++;
        vy = -vy;
        break;
      }
    }

    // draw bricks
    for (const b of bricks) {
      if (!b.alive) continue;
      const bkX = 20 + b.col * BW, bkY = BRICKS_TOP + b.row * (BH + 4);
      ctx.fillStyle = BRICK_COLORS[b.row];
      roundRect(ctx, bkX + 1, bkY, BW - 4, BH, 3);
      ctx.fill();
    }

    // paddle
    ctx.fillStyle = ACC;
    roundRect(ctx, px - PAD_W / 2, H - 40, PAD_W, PAD_H, 4);
    ctx.fill();

    // ball
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(bx, by, 6, 0, Math.PI * 2); ctx.fill();

    await writeFrame(proc, canvas);
  }
  proc.stdin.end();
  return new Promise(r => proc.on('close', r));
}

// ── 3. FLAPPY BIRD ────────────────────────────────────────────────────────────
async function genFlappyBird(outPath) {
  const FRAMES = FPS * 10;
  const proc = spawnFfmpeg(outPath);
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  const PIPE_W = 52, GAP = 130, PIPE_SPEED = 3.5;
  const BIRD_X = 100, BIRD_R = 13;
  const GROUND_Y = H - 25;
  let by = H / 2, bvy = 0;
  let score = 0;
  let dead = false, deadTimer = 0;
  const pipes = [
    { x: W + 100, gapY: 190 },
    { x: W + 300, gapY: 230 },
    { x: W + 500, gapY: 165 },
    { x: W + 700, gapY: 245 },
  ];

  function shouldJump(birdY, birdVy, pipeX, gapY) {
    const dist = pipeX - BIRD_X;
    if (dist < 0 || dist > 220) return false;
    return birdY > gapY + 5 && birdVy > -5;
  }

  function checkCollision() {
    // Ground
    if (by + BIRD_R >= GROUND_Y) return true;
    // Ceiling
    if (by - BIRD_R <= 0) return true;
    // Pipes
    for (const p of pipes) {
      const topH = p.gapY - GAP / 2;
      const botY = p.gapY + GAP / 2;
      const inXRange = BIRD_X + BIRD_R > p.x && BIRD_X - BIRD_R < p.x + PIPE_W;
      if (inXRange && (by - BIRD_R < topH || by + BIRD_R > botY)) return true;
    }
    return false;
  }

  for (let f = 0; f < FRAMES; f++) {
    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#0c1445');
    sky.addColorStop(1, '#1a237e');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    if (dead) {
      deadTimer--;
      if (deadTimer <= 0) {
        dead = false;
        by = H / 2; bvy = 0;
      }
    } else {
      // Move pipes
      for (const p of pipes) {
        p.x -= PIPE_SPEED;
        if (p.x + PIPE_W < 0) {
          p.x = pipes.reduce((mx, q) => Math.max(mx, q.x), 0) + 200;
          p.gapY = 140 + Math.floor((f * 37 + score * 83) % 140);
          score++;
        }
      }

      // AI jump decision
      const nextPipe = pipes.filter(p => p.x + PIPE_W > BIRD_X - BIRD_R).sort((a, b) => a.x - b.x)[0];
      if (nextPipe && shouldJump(by, bvy, nextPipe.x, nextPipe.gapY)) {
        bvy = -7.5;
      }

      // Bird physics
      bvy += 0.42;
      by += bvy;

      // Collision detection
      if (checkCollision()) {
        dead = true;
        deadTimer = 28;
        bvy = 0;
        by = Math.min(by, GROUND_Y - BIRD_R); // snap to ground if ground hit
      }
    }

    // Draw pipes
    for (const p of pipes) {
      const topH = p.gapY - GAP / 2;
      const botY = p.gapY + GAP / 2;
      ctx.fillStyle = '#2d7a2d';
      ctx.fillRect(p.x, 0, PIPE_W, topH);
      ctx.fillRect(p.x, botY, PIPE_W, GROUND_Y - botY);
      // Pipe caps
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(p.x - 4, topH - 18, PIPE_W + 8, 18);
      ctx.fillRect(p.x - 4, botY, PIPE_W + 8, 18);
    }

    // Ground
    ctx.fillStyle = '#4a7c2d';
    ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
    ctx.fillStyle = '#2d4a1e';
    ctx.fillRect(0, GROUND_Y, W, 4);

    // Bird
    const birdColor = dead ? RED : GOLD;
    ctx.fillStyle = birdColor;
    ctx.beginPath(); ctx.arc(BIRD_X, by, BIRD_R, 0, Math.PI * 2); ctx.fill();
    if (!dead) {
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(BIRD_X + 5, by - 3, 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(BIRD_X + 7, by - 3, 2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.ellipse(BIRD_X - 5, by + 3, 8, 4, Math.PI * 0.2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // X eyes on death
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(BIRD_X + 2, by - 5); ctx.lineTo(BIRD_X + 7, by); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(BIRD_X + 7, by - 5); ctx.lineTo(BIRD_X + 2, by); ctx.stroke();
    }

    // Score
    label(ctx, `Score: ${score}`, W / 2, 30, 16, WHITE);
    if (dead) label(ctx, 'Hit!', BIRD_X, by - 25, 13, RED);

    await writeFrame(proc, canvas);
  }
  proc.stdin.end();
  return new Promise(r => proc.on('close', r));
}

// ── 4. MAZE ───────────────────────────────────────────────────────────────────
async function genMaze(outPath) {
  const FRAMES = FPS * 8;
  const proc = spawnFfmpeg(outPath);
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  const COLS = 15, ROWS = 10;
  const CW = Math.floor((W - 40) / COLS), CH = Math.floor((H - 60) / ROWS);
  const OX = (W - COLS * CW) / 2, OY = 50;

  // Maze walls (right and bottom walls per cell)
  const maze = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({ r: true, b: true }))
  );

  // Generate maze via recursive backtracker
  const visited = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  function carve(r, c) {
    visited[r][c] = true;
    const dirs = [[0,1],[1,0],[0,-1],[-1,0]].sort(() => Math.random() - 0.5);
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !visited[nr][nc]) {
        if (dr === 0 && dc === 1)  maze[r][c].r = false;
        if (dr === 1 && dc === 0)  maze[r][c].b = false;
        if (dr === 0 && dc === -1) maze[nr][nc].r = false;
        if (dr === -1 && dc === 0) maze[nr][nc].b = false;
        carve(nr, nc);
      }
    }
  }
  // Use seeded-ish random via fixed sequence
  let seed = 42;
  const rng = () => { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff; };
  const dirs = [[0,1],[1,0],[0,-1],[-1,0]];
  function carve2(r, c) {
    visited[r][c] = true;
    const d = dirs.slice().sort(() => rng() - 0.5);
    for (const [dr, dc] of d) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !visited[nr][nc]) {
        if (dr === 0 && dc === 1)  maze[r][c].r = false;
        if (dr === 1 && dc === 0)  maze[r][c].b = false;
        if (dr === 0 && dc === -1) maze[nr][nc].r = false;
        if (dr === -1 && dc === 0) maze[nr][nc].b = false;
        carve2(nr, nc);
      }
    }
  }
  carve2(0, 0);

  // BFS path from (0,0) to (ROWS-1, COLS-1)
  const prev = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  const queue = [[0, 0]];
  const seen = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  seen[0][0] = true;
  while (queue.length) {
    const [r, c] = queue.shift();
    if (r === ROWS - 1 && c === COLS - 1) break;
    const movs = [];
    if (!maze[r][c].r && c + 1 < COLS && !seen[r][c+1])   movs.push([r, c+1]);
    if (!maze[r][c].b && r + 1 < ROWS && !seen[r+1][c])   movs.push([r+1, c]);
    if (c > 0 && !maze[r][c-1].r && !seen[r][c-1])        movs.push([r, c-1]);
    if (r > 0 && !maze[r-1][c].b && !seen[r-1][c])        movs.push([r-1, c]);
    for (const [nr, nc] of movs) { seen[nr][nc] = true; prev[nr][nc] = [r, c]; queue.push([nr, nc]); }
  }
  const path = [];
  let cur = [ROWS - 1, COLS - 1];
  while (cur) { path.unshift(cur); cur = prev[cur[0]][cur[1]]; }

  const stepsPerPath = Math.floor(FRAMES / path.length);
  const trail = [];

  for (let f = 0; f < FRAMES; f++) {
    drawBg(ctx);
    label(ctx, 'MAZE  (BFS agent navigating to exit)', W / 2, 30, 13, MUTED);

    // Draw maze
    ctx.strokeStyle = '#3a4460';
    ctx.lineWidth = 1.5;
    // outer border
    ctx.strokeStyle = WHITE + '88';
    ctx.strokeRect(OX, OY, COLS * CW, ROWS * CH);
    ctx.strokeStyle = '#3a4460';
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = OX + c * CW, y = OY + r * CH;
        if (maze[r][c].r && c < COLS - 1) {
          ctx.beginPath(); ctx.moveTo(x + CW, y); ctx.lineTo(x + CW, y + CH); ctx.stroke();
        }
        if (maze[r][c].b && r < ROWS - 1) {
          ctx.beginPath(); ctx.moveTo(x, y + CH); ctx.lineTo(x + CW, y + CH); ctx.stroke();
        }
      }
    }

    // goal
    ctx.fillStyle = GREEN + '44';
    ctx.fillRect(OX + (COLS-1)*CW + 2, OY + (ROWS-1)*CH + 2, CW - 4, CH - 4);
    ctx.fillStyle = GREEN;
    label(ctx, '★', OX + (COLS-0.5)*CW, OY + (ROWS-0.5)*CH + 5, 14);

    // agent position on path
    const pathIdx = Math.min(path.length - 1, Math.floor(f / stepsPerPath));
    if (pathIdx > 0) trail.length = 0;
    for (let i = 0; i <= pathIdx; i++) trail.push(path[i]);

    // draw trail
    for (let i = 1; i < trail.length; i++) {
      const alpha = 0.15 + 0.55 * (i / trail.length);
      ctx.fillStyle = ACC + Math.round(alpha * 255).toString(16).padStart(2, '0');
      const [tr, tc] = trail[i];
      ctx.fillRect(OX + tc * CW + 3, OY + tr * CH + 3, CW - 6, CH - 6);
    }

    // agent dot
    const [ar, ac] = path[pathIdx];
    const ax = OX + ac * CW + CW / 2, ay = OY + ar * CH + CH / 2;
    ctx.fillStyle = ACC;
    ctx.beginPath(); ctx.arc(ax, ay, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = WHITE;
    ctx.beginPath(); ctx.arc(ax, ay, 2.5, 0, Math.PI * 2); ctx.fill();

    await writeFrame(proc, canvas);
  }
  proc.stdin.end();
  return new Promise(r => proc.on('close', r));
}

// ── 5. BLACKJACK ──────────────────────────────────────────────────────────────
async function genBlackjack(outPath) {
  const FRAMES = FPS * 10;
  const proc = spawnFfmpeg(outPath);
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  const SUITS = ['♠','♥','♦','♣'];
  const VALS  = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  function randCard(seed) { return { v: VALS[(seed*7+3)%13], s: SUITS[(seed*3+1)%4] }; }

  // 3 rounds of blackjack
  const rounds = [
    { player: [{v:'7',s:'♠'},{v:'8',s:'♥'}], dealer: [{v:'K',s:'♦'},{v:'6',s:'♣'}], action:'Stand', result:'Win' },
    { player: [{v:'A',s:'♣'},{v:'6',s:'♠'},{v:'4',s:'♥'}], dealer: [{v:'9',s:'♠'},{v:'7',s:'♦'}], action:'Hit → Stand', result:'Win' },
    { player: [{v:'J',s:'♥'},{v:'A',s:'♦'}], dealer: [{v:'5',s:'♣'},{v:'3',s:'♠'},{v:'Q',s:'♥'}], action:'Stand (Blackjack!)', result:'Win' },
  ];

  function drawCard(x, y, card, face = true) {
    const isRed = card.s === '♥' || card.s === '♦';
    ctx.fillStyle = '#fff';
    roundRect(ctx, x, y, 44, 64, 5);
    ctx.fill();
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.stroke();
    if (face) {
      ctx.fillStyle = isRed ? '#dc2626' : '#111';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(card.v, x + 5, y + 16);
      ctx.textAlign = 'center';
      ctx.font = '18px sans-serif';
      ctx.fillText(card.s, x + 22, y + 42);
    } else {
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(x + 3, y + 3, 38, 58);
      ctx.fillStyle = '#3b82f6';
      for (let i = 0; i < 5; i++) for (let j = 0; j < 7; j++) {
        ctx.beginPath();
        ctx.arc(x + 6 + i * 8, y + 6 + j * 8, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.textAlign = 'center';
  }

  const roundFrames = Math.floor(FRAMES / rounds.length);

  for (let f = 0; f < FRAMES; f++) {
    // Green felt
    const felt = ctx.createRadialGradient(W/2, H/2, 50, W/2, H/2, 350);
    felt.addColorStop(0, '#166534');
    felt.addColorStop(1, '#052e16');
    ctx.fillStyle = felt;
    ctx.fillRect(0, 0, W, H);

    // Table oval
    ctx.fillStyle = '#15803d33';
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(W/2, H/2+30, 280, 150, 0, 0, Math.PI*2);
    ctx.fill(); ctx.stroke();

    const ri = Math.min(rounds.length - 1, Math.floor(f / roundFrames));
    const round = rounds[ri];
    const rfrac = (f % roundFrames) / roundFrames;

    // Show cards progressively
    const showDealer = Math.floor(rfrac * (round.dealer.length + 1));
    const showPlayer = Math.floor(rfrac * (round.player.length + 2));
    const showAction = rfrac > 0.55;
    const showResult = rfrac > 0.8;

    label(ctx, 'DEALER', W/2, 70, 12, '#d4af37');
    for (let i = 0; i < Math.min(showDealer, round.dealer.length); i++) {
      drawCard(W/2 - (round.dealer.length * 26) + i * 52, 85, round.dealer[i], i === 0 || showResult);
    }

    label(ctx, 'PLAYER (AI)', W/2, H-145, 12, '#d4af37');
    for (let i = 0; i < Math.min(showPlayer, round.player.length); i++) {
      drawCard(W/2 - (round.player.length * 26) + i * 52, H-135, round.player[i]);
    }

    if (showAction) {
      ctx.fillStyle = '#000a';
      roundRect(ctx, W/2 - 100, H/2 - 28, 200, 36, 8);
      ctx.fill();
      label(ctx, round.action, W/2, H/2 - 5, 14, GOLD);
    }

    if (showResult) {
      ctx.fillStyle = GREEN + 'cc';
      roundRect(ctx, W/2 - 70, H/2 + 18, 140, 38, 10);
      ctx.fill();
      label(ctx, round.result + ' 🎉', W/2, H/2 + 42, 16, '#fff');
    }

    label(ctx, `Round ${ri + 1} / ${rounds.length}`, 60, 25, 12, '#d4af37');

    await writeFrame(proc, canvas);
  }
  proc.stdin.end();
  return new Promise(r => proc.on('close', r));
}

// ── 6. CONNECT4 ───────────────────────────────────────────────────────────────
async function genConnect4(outPath) {
  const FRAMES = FPS * 9;
  const proc = spawnFfmpeg(outPath);
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  const COLS4 = 7, ROWS4 = 6, CELL = 56;
  const GX = (W - COLS4 * CELL) / 2, GY = (H - ROWS4 * CELL) / 2 + 10;
  // 0=empty, 1=yellow(player), 2=red(AI)
  const grid = Array.from({length:ROWS4}, () => Array(COLS4).fill(0));

  // Pre-planned moves: col indices, alternating player(1) then AI(2)
  const moves = [3, 3, 4, 2, 4, 3, 2, 2, 5, 1, 5, 4, 5, 5]; // AI (2) wins col 5

  function drop(col, player) {
    for (let r = ROWS4 - 1; r >= 0; r--) {
      if (grid[r][col] === 0) { grid[r][col] = player; return r; }
    }
    return -1;
  }

  const moveFrames = Math.floor(FRAMES / (moves.length + 2));
  let revealed = 0;
  let lastDrop = { r: -1, c: -1 };

  for (let f = 0; f < FRAMES; f++) {
    drawBg(ctx);
    label(ctx, 'CONNECT FOUR', W/2, 28, 15, MUTED);
    label(ctx, '● Human', W/2 - 100, 28, 12, GOLD);
    label(ctx, '● AI', W/2 + 80, 28, 12, RED);

    const newReveal = Math.floor(f / moveFrames);
    if (newReveal > revealed && revealed < moves.length) {
      const player = (revealed % 2 === 0) ? 1 : 2;
      const r = drop(moves[revealed], player);
      lastDrop = { r, c: moves[revealed] };
      revealed++;
    }

    // Board background
    ctx.fillStyle = '#1d4ed8';
    roundRect(ctx, GX - 8, GY - 8, COLS4 * CELL + 16, ROWS4 * CELL + 16, 10);
    ctx.fill();

    // Cells
    for (let r = 0; r < ROWS4; r++) {
      for (let c = 0; c < COLS4; c++) {
        const cx = GX + c * CELL + CELL / 2;
        const cy = GY + r * CELL + CELL / 2;
        const v = grid[r][c];
        const isLast = r === lastDrop.r && c === lastDrop.c;

        ctx.fillStyle = v === 0 ? BG : v === 1 ? GOLD : RED;
        ctx.beginPath(); ctx.arc(cx, cy, CELL/2 - 5, 0, Math.PI*2); ctx.fill();

        if (v !== 0 && isLast) {
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(cx, cy, CELL/2 - 5, 0, Math.PI*2); ctx.stroke();
        }
      }
    }

    // Win label
    if (revealed >= moves.length) {
      ctx.fillStyle = RED + 'dd';
      roundRect(ctx, W/2 - 90, H - 50, 180, 36, 10);
      ctx.fill();
      label(ctx, 'AI Wins! 🤖', W/2, H - 27, 16, WHITE);
    }

    await writeFrame(proc, canvas);
  }
  proc.stdin.end();
  return new Promise(r => proc.on('close', r));
}

// ── 7. TIC-TAC-TOE ───────────────────────────────────────────────────────────
async function genTicTacToe(outPath) {
  const FRAMES = FPS * 9;
  const proc = spawnFfmpeg(outPath);
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  const CELL3 = 100, GX3 = W/2 - 150, GY3 = H/2 - 150;
  // Minimax moves: positions (0-8), alternating X then O. X wins.
  const moveSeqs = [
    // Game 1: X wins diagonal
    { moves: [4,0,2,6,8], winner:'X' },
    // Game 2: O wins row
    { moves: [3,0,7,1,5,2], winner:'O' },
    // Game 3: X wins col
    { moves: [0,3,1,4,2], winner:'X' },
  ];

  let gameIdx = 0, board = Array(9).fill(null), moveIdx = 0;
  const gameFrames = Math.floor(FRAMES / moveSeqs.length);
  const moveFrames2 = 20;

  for (let f = 0; f < FRAMES; f++) {
    drawBg(ctx);
    label(ctx, 'TIC-TAC-TOE  (Self-Play)', W/2, 32, 15, MUTED);

    const gi = Math.min(moveSeqs.length - 1, Math.floor(f / gameFrames));
    const relF = f % gameFrames;
    const seq = moveSeqs[gi];

    if (gi > gameIdx) {
      gameIdx = gi; board = Array(9).fill(null); moveIdx = 0;
    }

    const toReveal = Math.floor(relF / moveFrames2);
    if (toReveal > moveIdx && moveIdx < seq.moves.length) {
      const pos = seq.moves[moveIdx];
      board[pos] = moveIdx % 2 === 0 ? 'X' : 'O';
      moveIdx++;
    }

    // Grid lines
    ctx.strokeStyle = WHITE + '66';
    ctx.lineWidth = 3;
    for (let i = 1; i < 3; i++) {
      ctx.beginPath(); ctx.moveTo(GX3 + i*CELL3, GY3); ctx.lineTo(GX3 + i*CELL3, GY3 + 3*CELL3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(GX3, GY3 + i*CELL3); ctx.lineTo(GX3 + 3*CELL3, GY3 + i*CELL3); ctx.stroke();
    }

    // Pieces
    for (let i = 0; i < 9; i++) {
      if (!board[i]) continue;
      const r = Math.floor(i / 3), c = i % 3;
      const cx = GX3 + c * CELL3 + CELL3/2, cy = GY3 + r * CELL3 + CELL3/2;
      ctx.font = 'bold 56px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = board[i] === 'X' ? ACC : RED;
      ctx.fillText(board[i], cx, cy + 20);
    }

    // Result
    if (relF > gameFrames * 0.8 && seq.winner) {
      const winColor = seq.winner === 'X' ? ACC : RED;
      ctx.fillStyle = winColor + 'cc';
      roundRect(ctx, W/2 - 90, GY3 + 3*CELL3 + 15, 180, 36, 10);
      ctx.fill();
      label(ctx, `${seq.winner} Wins!`, W/2, GY3 + 3*CELL3 + 38, 16, WHITE);
    }

    label(ctx, `Game ${gi + 1}`, W/2 + 170, 32, 12, MUTED);

    await writeFrame(proc, canvas);
  }
  proc.stdin.end();
  return new Promise(r => proc.on('close', r));
}

// ── 8. ROCKET LANDING ────────────────────────────────────────────────────────
async function genRocketLanding(outPath) {
  const FRAMES = FPS * 10;
  const proc = spawnFfmpeg(outPath);
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  const PAD_W = 80, PAD_X = W/2, PAD_Y = H - 50;
  let rx = W/2, ry = 80, vx2 = 0.8, vy2 = 0, angle = 0.05;
  const THRUST_FRAMES = 12;
  let thrustTimer = 0;
  let landed = false;
  let landedAt = -1;

  const particles = [];

  function addParticles(x, y, ang) {
    for (let i = 0; i < 4; i++) {
      const spread = (Math.random() - 0.5) * 0.8;
      particles.push({
        x, y,
        vx: Math.sin(ang + spread) * (3 + Math.random() * 2),
        vy: Math.cos(ang + spread) * (3 + Math.random() * 2),
        life: 15 + Math.random() * 10,
        maxLife: 25
      });
    }
  }

  for (let f = 0; f < FRAMES; f++) {
    // Space bg
    ctx.fillStyle = '#06080f';
    ctx.fillRect(0, 0, W, H);
    // Stars
    for (let i = 0; i < 80; i++) {
      const sx = (i * 179 + 37) % W, sy = (i * 97 + 13) % (H - 60);
      const brightness = 0.3 + 0.7 * ((f + i * 7) % 60 < 30 ? 1 : 0.5);
      ctx.fillStyle = `rgba(200,220,255,${brightness * 0.5})`;
      ctx.beginPath(); ctx.arc(sx, sy, 1, 0, Math.PI*2); ctx.fill();
    }

    // Moon surface
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, H - 35, W, 35);
    ctx.strokeStyle = '#2a2a4e'; ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.arc(i * 90 - 20, H - 35, 15 + i * 3, Math.PI, Math.PI * 2);
      ctx.stroke();
    }

    // Landing pad
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(PAD_X - PAD_W/2, PAD_Y - 4, PAD_W, 6);
    ctx.strokeStyle = '#d4af37';
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(PAD_X, PAD_Y - 4); ctx.lineTo(PAD_X, PAD_Y - 25); ctx.stroke();
    ctx.setLineDash([]);
    label(ctx, '▼', PAD_X, PAD_Y - 8, 12, GOLD);

    if (!landed) {
      // Gravity + control
      vy2 += 0.15;
      vx2 *= 0.99;

      // Correct horizontal drift
      if (Math.abs(rx - PAD_X) > 5) {
        vx2 += Math.sign(PAD_X - rx) * 0.08;
      }

      // Brake vertical
      if (ry > H / 2) {
        vy2 *= 0.97;
        thrustTimer = THRUST_FRAMES;
      }

      // Correct angle
      angle *= 0.92;

      rx += vx2; ry += vy2;
      if (thrustTimer > 0) { addParticles(rx, ry, angle); thrustTimer--; }

      if (ry > PAD_Y - 30) {
        landed = true; landedAt = f;
        vx2 = 0; vy2 = 0; rx = PAD_X; ry = PAD_Y - 30;
      }
    }

    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life--;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      const alpha = p.life / p.maxLife;
      const hue = 30 + (1 - alpha) * 30;
      ctx.fillStyle = `hsla(${hue},100%,60%,${alpha})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, 2 + alpha * 2, 0, Math.PI*2); ctx.fill();
    }

    // Rocket body
    ctx.save();
    ctx.translate(rx, ry);
    ctx.rotate(angle);
    // body
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-9, -32, 18, 44);
    // nose cone
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(-9, -32); ctx.lineTo(0, -50); ctx.lineTo(9, -32);
    ctx.closePath(); ctx.fill();
    // fins
    ctx.fillStyle = '#475569';
    ctx.beginPath(); ctx.moveTo(-9, 10); ctx.lineTo(-20, 20); ctx.lineTo(-9, 20); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(9, 10); ctx.lineTo(20, 20); ctx.lineTo(9, 20); ctx.closePath(); ctx.fill();
    // window
    ctx.fillStyle = ACC + 'aa';
    ctx.beginPath(); ctx.arc(0, -12, 5, 0, Math.PI*2); ctx.fill();
    ctx.restore();

    if (landed) {
      const age = f - landedAt;
      if (age > 15) {
        ctx.fillStyle = GREEN + 'dd';
        roundRect(ctx, W/2 - 110, 40, 220, 40, 10);
        ctx.fill();
        label(ctx, 'TOUCHDOWN! Landed safely ✓', W/2, 65, 14, WHITE);
      }
    } else {
      const alt = Math.round(Math.max(0, PAD_Y - ry - 30));
      label(ctx, `Altitude: ${alt}m  |  Vx: ${vx2.toFixed(1)}  Vy: ${vy2.toFixed(1)}`, W/2, 28, 12, MUTED);
    }

    await writeFrame(proc, canvas);
  }
  proc.stdin.end();
  return new Promise(r => proc.on('close', r));
}

// ── 9. SLOTS / MULTI-ARMED BANDIT ────────────────────────────────────────────
async function genSlots(outPath) {
  const FRAMES = FPS * 9;
  const proc = spawnFfmpeg(outPath);
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  const N_ARMS = 5;
  const TRUE_PROBS = [0.2, 0.45, 0.7, 0.35, 0.55]; // arm 2 is best
  const ARM_COLORS = [MUTED, '#fb923c', GREEN, ACC, GOLD];
  const ARM_NAMES  = ['A','B','C','D','E'];

  const q = Array(N_ARMS).fill(0);
  const n = Array(N_ARMS).fill(0);
  const choices = [];
  let totalReward = 0;

  // Pre-simulate UCB agent
  const rng2 = (s) => { s = (s * 1664525 + 1013904223) & 0xffffffff; return ((s>>>0)/0xffffffff); };
  let seed2 = 17;
  for (let t = 0; t < 200; t++) {
    // UCB1
    let arm = -1, maxU = -Infinity;
    for (let a = 0; a < N_ARMS; a++) {
      const u = n[a] === 0 ? Infinity : q[a] + Math.sqrt(2 * Math.log(t + 1) / n[a]);
      if (u > maxU) { maxU = u; arm = a; }
    }
    seed2 = (seed2 * 1664525 + 1013904223) & 0xffffffff;
    const r = ((seed2>>>0)/0xffffffff) < TRUE_PROBS[arm] ? 1 : 0;
    n[arm]++; q[arm] += (r - q[arm]) / n[arm];
    totalReward += r;
    choices.push({ arm, r, q: q.slice(), n: n.slice() });
  }

  const playbackSpeed = Math.ceil(choices.length / FRAMES);

  for (let f = 0; f < FRAMES; f++) {
    drawBg(ctx);
    label(ctx, 'MULTI-ARMED BANDIT  (UCB1 agent)', W/2, 30, 14, MUTED);

    const t = Math.min(choices.length - 1, f * playbackSpeed);
    const state = choices[t];

    const ARM_W = 80, ARM_GAP = 20;
    const totalW = N_ARMS * ARM_W + (N_ARMS - 1) * ARM_GAP;
    const startX = (W - totalW) / 2;
    const BAR_MAX_H = 160, BAR_Y = H - 90;

    for (let a = 0; a < N_ARMS; a++) {
      const x = startX + a * (ARM_W + ARM_GAP);
      const isChosen = state.arm === a;
      const qv = state.q[a];
      const barH = qv * BAR_MAX_H;

      // True prob indicator (faint)
      ctx.fillStyle = ARM_COLORS[a] + '22';
      ctx.fillRect(x, BAR_Y - TRUE_PROBS[a] * BAR_MAX_H, ARM_W, TRUE_PROBS[a] * BAR_MAX_H);
      ctx.strokeStyle = ARM_COLORS[a] + '44';
      ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
      ctx.strokeRect(x, BAR_Y - TRUE_PROBS[a] * BAR_MAX_H, ARM_W, TRUE_PROBS[a] * BAR_MAX_H);
      ctx.setLineDash([]);

      // Q-value bar
      ctx.fillStyle = isChosen ? ARM_COLORS[a] : ARM_COLORS[a] + '88';
      ctx.fillRect(x + 4, BAR_Y - barH, ARM_W - 8, barH);

      // Arm label
      ctx.fillStyle = isChosen ? '#fff' : MUTED;
      ctx.font = `bold 18px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(ARM_NAMES[a], x + ARM_W/2, BAR_Y + 22);

      // Count
      ctx.font = '11px sans-serif';
      ctx.fillStyle = MUTED;
      ctx.fillText(`n=${state.n[a]}`, x + ARM_W/2, BAR_Y + 40);

      // Q value
      ctx.fillStyle = ARM_COLORS[a];
      ctx.fillText(`q=${state.q[a].toFixed(2)}`, x + ARM_W/2, BAR_Y - barH - 8);

      if (isChosen) {
        // Arrow indicator
        ctx.fillStyle = '#fff';
        ctx.font = '14px sans-serif';
        ctx.fillText('▼', x + ARM_W/2, BAR_Y - barH - 22);
      }
    }

    // Stats
    ctx.fillStyle = SURF;
    ctx.fillRect(0, BAR_Y + 52, W, 48);
    label(ctx, `Step: ${t+1}/200  |  Total reward: ${choices.slice(0, t+1).reduce((s,c)=>s+c.r,0)}  |  Best arm: C (p=0.70)`, W/2, BAR_Y + 76, 12, MUTED);

    // Legend
    label(ctx, '■ Estimated Q   ■ True probability', W/2, BAR_Y + 58 + 30, 11, MUTED);

    await writeFrame(proc, canvas);
  }
  proc.stdin.end();
  return new Promise(r => proc.on('close', r));
}

// ── 10. ACROBAT (double pendulum swing-up) ───────────────────────────────────
async function genAcrobat(outPath) {
  const FRAMES = FPS * 10;
  const proc = spawnFfmpeg(outPath);
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  const L_PX = 85;         // display length in pixels
  const L = 1.0;           // physics length in metres (natural period ~2s at g=9.8)
  const OX = W / 2, OY = H / 2 - 10;
  const g = 9.8, m1 = 1, m2 = 1;

  // Correct Acrobot equations of motion (Lagrangian, angles from downward vertical)
  // th1: angle of link1 from down, th2: relative angle of link2 to link1
  // Physics uses L (metres); display uses L_PX (pixels)
  function acrobotDerivs(th1, th2, dth1, dth2, tau) {
    const c2 = Math.cos(th2);
    const s1 = Math.sin(th1), s12 = Math.sin(th1 + th2);
    const d12 = m2 * L * L + m2 * L * L * c2;
    const c12_2 = Math.sin(th2);
    const C1 = -m2 * L * L * c12_2 * (2 * dth1 * dth2 + dth2 * dth2)
               + (m1 + m2) * g * L * s1 + m2 * g * L * s12;
    const C2 =  m2 * L * L * c12_2 * dth1 * dth1
               + m2 * g * L * s12 - tau;
    const M11 = (m1 + m2) * L * L + m2 * L * L + 2 * m2 * L * L * c2;
    const M12 = d12, M21 = d12, M22 = m2 * L * L;
    const detM = M11 * M22 - M12 * M21;
    const ddth1 = (M22 * (-C1) - M12 * (-C2)) / detM;
    const ddth2 = (M11 * (-C2) - M21 * (-C1)) / detM;
    return [dth1, dth2, ddth1, ddth2];
  }

  // RK4 integration step
  function rk4(th1, th2, dth1, dth2, tau, dt) {
    const k1 = acrobotDerivs(th1, th2, dth1, dth2, tau);
    const k2 = acrobotDerivs(th1 + k1[0]*dt/2, th2 + k1[1]*dt/2, dth1 + k1[2]*dt/2, dth2 + k1[3]*dt/2, tau);
    const k3 = acrobotDerivs(th1 + k2[0]*dt/2, th2 + k2[1]*dt/2, dth1 + k2[2]*dt/2, dth2 + k2[3]*dt/2, tau);
    const k4 = acrobotDerivs(th1 + k3[0]*dt, th2 + k3[1]*dt, dth1 + k3[2]*dt, dth2 + k3[3]*dt, tau);
    return [
      th1  + (k1[0] + 2*k2[0] + 2*k3[0] + k4[0]) * dt / 6,
      th2  + (k1[1] + 2*k2[1] + 2*k3[1] + k4[1]) * dt / 6,
      dth1 + (k1[2] + 2*k2[2] + 2*k3[2] + k4[2]) * dt / 6,
      dth2 + (k1[3] + 2*k2[3] + 2*k3[3] + k4[3]) * dt / 6,
    ];
  }

  // Pre-compute swing-up sequence. dt=0.05s per frame = 1.5x real-time for snappy animation.
  const dt = 0.05;
  const angles = [];
  let th1 = Math.PI, th2 = 0.1;
  let dth1 = 0, dth2 = 0;

  // goalY in canvas coords: tip must be above this line
  const goalYCheck = OY - L_PX - L_PX + 20;

  for (let i = 0; i < FRAMES; i++) {
    // Switch to stabilisation when tip is near the goal - NOT based on frame count
    const tipYCanvas = OY - L_PX * Math.cos(th1) - L_PX * Math.cos(th1 + th2);
    const nearTop = tipYCanvas < goalYCheck + 60;

    let tau;
    if (nearTop) {
      // Strong LQR-like stabilisation around upright (th1=0, th2=0)
      const e1 = Math.atan2(Math.sin(th1), Math.cos(th1));
      const e2 = Math.atan2(Math.sin(th2), Math.cos(th2));
      tau = -(e1 * 20 + dth1 * 5 + e2 * 8 + dth2 * 3);
      tau = Math.max(-10, Math.min(10, tau));
    } else {
      // Energy pumping: dE/dt = tau * dth2, so sign(dth2) injects energy
      tau = Math.sign(dth2) * 8.0;
    }
    const next = rk4(th1, th2, dth1, dth2, tau, dt);
    [th1, th2, dth1, dth2] = next;
    dth1 = Math.max(-15, Math.min(15, dth1));
    dth2 = Math.max(-15, Math.min(15, dth2));
    angles.push([th1, th2]);
  }

  // Goal: tip above pivot
  const goalY = OY - L_PX - L_PX + 20;
  const trail = [];

  for (let f = 0; f < FRAMES; f++) {
    drawBg(ctx);
    label(ctx, 'ACROBOT  (Swing-Up)', W/2, 28, 14, MUTED);

    // Goal line
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = GREEN + '66';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(80, goalY); ctx.lineTo(W - 80, goalY); ctx.stroke();
    ctx.setLineDash([]);
    label(ctx, 'Goal', 100, goalY - 6, 11, GREEN);

    const [a1, a2] = angles[f];
    const x1 = OX + L_PX * Math.sin(a1);
    const y1 = OY - L_PX * Math.cos(a1);
    const x2 = x1 + L_PX * Math.sin(a1 + a2);
    const y2 = y1 - L_PX * Math.cos(a1 + a2);

    // Tip trail
    trail.push({ x: x2, y: y2 });
    if (trail.length > 60) trail.shift();
    for (let i = 1; i < trail.length; i++) {
      const alpha = i / trail.length;
      const hex = Math.round(alpha * 180).toString(16).padStart(2, '0');
      ctx.strokeStyle = ACC + hex;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(trail[i-1].x, trail[i-1].y);
      ctx.lineTo(trail[i].x, trail[i].y);
      ctx.stroke();
    }

    // Links
    ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.strokeStyle = WHITE + 'cc';
    ctx.beginPath(); ctx.moveTo(OX, OY); ctx.lineTo(x1, y1); ctx.stroke();
    ctx.strokeStyle = ACC + 'cc';
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();

    // Joints
    ctx.fillStyle = WHITE;
    ctx.beginPath(); ctx.arc(OX, OY, 9, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = SURF; ctx.lineWidth = 2; ctx.strokeStyle = WHITE;
    ctx.beginPath(); ctx.arc(OX, OY, 4, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = ACC;
    ctx.beginPath(); ctx.arc(x1, y1, 8, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = GREEN;
    ctx.beginPath(); ctx.arc(x2, y2, 8, 0, Math.PI*2); ctx.fill();

    // Success banner
    if (y2 < goalY + 15) {
      ctx.fillStyle = GREEN + 'cc';
      roundRect(ctx, W/2 - 85, H - 50, 170, 32, 8);
      ctx.fill();
      label(ctx, 'Goal reached! ✓', W/2, H - 27, 13, WHITE);
    }

    const phase = f / FRAMES < 0.6 ? 'Exploring' : 'Swing-up';
    label(ctx, phase, W/2, H - 10, 11, MUTED);

    await writeFrame(proc, canvas);
  }
  proc.stdin.end();
  return new Promise(r => proc.on('close', r));
}

// ── 11. 3D SNAKE (isometric) ──────────────────────────────────────────────────
async function gen3dSnake(outPath) {
  const FRAMES = FPS * 10;
  const proc = spawnFfmpeg(outPath);
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  const GRID = 8; // 8x8x8 cube
  const ISO_X = 28, ISO_Y = 14; // isometric cell size

  function isoProject(gx, gy, gz) {
    const x = (gx - gz) * ISO_X;
    const y = (gx + gz) * ISO_Y - gy * 20;
    return { x: W / 2 + x, y: H / 2 + y + 40 };
  }

  function drawCell(gx, gy, gz, color, alpha = 1) {
    const { x, y } = isoProject(gx, gy, gz);
    ctx.globalAlpha = alpha;
    // top face
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + ISO_X, y + ISO_Y);
    ctx.lineTo(x, y + ISO_Y * 2);
    ctx.lineTo(x - ISO_X, y + ISO_Y);
    ctx.closePath();
    ctx.fill();
    // right face
    ctx.fillStyle = adjustLuminance(color, -30);
    ctx.beginPath();
    ctx.moveTo(x, y + ISO_Y * 2);
    ctx.lineTo(x + ISO_X, y + ISO_Y);
    ctx.lineTo(x + ISO_X, y + ISO_Y + 18);
    ctx.lineTo(x, y + ISO_Y * 2 + 18);
    ctx.closePath();
    ctx.fill();
    // left face
    ctx.fillStyle = adjustLuminance(color, -50);
    ctx.beginPath();
    ctx.moveTo(x, y + ISO_Y * 2);
    ctx.lineTo(x - ISO_X, y + ISO_Y);
    ctx.lineTo(x - ISO_X, y + ISO_Y + 18);
    ctx.lineTo(x, y + ISO_Y * 2 + 18);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function adjustLuminance(hex, amt) {
    const r = Math.max(0, Math.min(255, parseInt(hex.slice(1,3), 16) + amt));
    const g = Math.max(0, Math.min(255, parseInt(hex.slice(3,5), 16) + amt));
    const b = Math.max(0, Math.min(255, parseInt(hex.slice(5,7), 16) + amt));
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
  }

  // Snake game simulation (2D layer for simplicity, shown isometrically)
  const MID = Math.floor(GRID / 2);
  let snake = [[MID, MID, MID], [MID, MID, MID-1], [MID, MID, MID-2]];
  let dir = [0, 0, 1];
  let food = [MID + 2, MID, MID + 2];
  let score3 = 0;
  const moveEvery = 6; // frames per move
  const allStates = [{ snake: snake.map(s=>s.slice()), food: food.slice(), score: score3 }];

  // Simulate ahead
  let seed3 = 99;
  const rng3 = () => { seed3 = (seed3 * 1664525 + 1013904223) & 0xffffffff; return (seed3>>>0)/0xffffffff; };

  for (let step = 0; step < FRAMES / moveEvery; step++) {
    const head = snake[0];
    const [fx, fy, fz] = food;
    // Simple AI: move toward food
    const dx = fx - head[0], dz = fz - head[2];
    if (Math.abs(dx) >= Math.abs(dz)) {
      dir = [Math.sign(dx), 0, 0];
    } else {
      dir = [0, 0, Math.sign(dz)];
    }
    const newHead = [
      ((head[0] + dir[0] + GRID) % GRID),
      head[1],
      ((head[2] + dir[2] + GRID) % GRID)
    ];
    snake.unshift(newHead);
    const atFood = newHead[0] === food[0] && newHead[2] === food[2];
    if (!atFood) snake.pop();
    else {
      score3++;
      food = [Math.floor(rng3() * GRID), MID, Math.floor(rng3() * GRID)];
    }
    allStates.push({ snake: snake.map(s=>s.slice()), food: food.slice(), score: score3 });
  }

  for (let f = 0; f < FRAMES; f++) {
    drawBg(ctx);
    label(ctx, '3D SNAKE  (DQN agent)', W/2, 26, 14, MUTED);
    label(ctx, `Score: ${allStates[Math.min(allStates.length-1, Math.floor(f/moveEvery))].score}`, W/2 + 150, 26, 14, GREEN);

    const state = allStates[Math.min(allStates.length - 1, Math.floor(f / moveEvery))];

    // Draw grid outline (isometric)
    ctx.strokeStyle = '#2a3450';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID; i++) {
      // Front-bottom edge
      const a = isoProject(i, 0, 0), b = isoProject(i, 0, GRID);
      ctx.beginPath(); ctx.moveTo(a.x, a.y + 18); ctx.lineTo(b.x, b.y + 18); ctx.stroke();
      const c = isoProject(0, 0, i), d = isoProject(GRID, 0, i);
      ctx.beginPath(); ctx.moveTo(c.x, c.y + 18); ctx.lineTo(d.x, d.y + 18); ctx.stroke();
    }

    // Food
    drawCell(state.food[0], state.food[1], state.food[2], RED, 0.9);

    // Snake body (draw from tail to head)
    for (let i = state.snake.length - 1; i >= 0; i--) {
      const [sx, sy, sz] = state.snake[i];
      const frac = 1 - i / state.snake.length;
      const col = i === 0 ? '#4ade80' : `#${Math.round(30 + frac * 100).toString(16).padStart(2,'0')}${Math.round(150 + frac * 78).toString(16).padStart(2,'0')}60`;
      drawCell(sx, sy, sz, i === 0 ? GREEN : ACC, 0.85 + frac * 0.15);
    }

    await writeFrame(proc, canvas);
  }
  proc.stdin.end();
  return new Promise(r => proc.on('close', r));
}

// ── 12. ALPHA ZERO (chess) ────────────────────────────────────────────────────
async function genAlphaZero(outPath) {
  const FRAMES = FPS * 10;
  const proc = spawnFfmpeg(outPath);
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  const BOARD_SIZE = 8, CELL8 = 54;
  const BX = (W - BOARD_SIZE * CELL8) / 2, BY = (H - BOARD_SIZE * CELL8) / 2;

  // Simplified chess-like board state with planned moves
  const PIECES = {
    wK:'♔', wQ:'♕', wR:'♖', wB:'♗', wN:'♘', wP:'♙',
    bK:'♚', bQ:'♛', bR:'♜', bB:'♝', bN:'♞', bP:'♟'
  };

  // Start from a midgame position
  let board = Array.from({length:8}, ()=>Array(8).fill(null));
  // Back ranks
  board[0] = ['bR','bN','bB','bQ','bK','bB','bN','bR'];
  board[1] = Array(8).fill('bP');
  board[6] = Array(8).fill('wP');
  board[7] = ['wR','wN','wB','wQ','wK','wB','wN','wR'];
  // Clear some pawns for action
  board[1][4] = null; board[6][4] = null; board[1][3] = null; board[6][3] = null;

  // Move sequence [fromR, fromC, toR, toC, label]
  const moves = [
    [6,4,4,4,'e4','White'],
    [1,4,3,4,'e5','Black'],
    [7,6,5,5,'Nf3','White'],
    [0,1,2,2,'Nc6','Black'],
    [7,5,4,2,'Bc4','White'],
    [0,5,3,2,'Bc5','Black'],
    [5,5,3,4,'Nxe5','White'],
    [0,3,4,7,'Qh4!','Black'],
    [7,7,7,5,'Rf1','White'], // defend
  ];

  const moveFrames3 = Math.floor(FRAMES / (moves.length + 1));
  let mIdx = 0;
  let highlight = null;

  for (let f = 0; f < FRAMES; f++) {
    drawBg(ctx);
    label(ctx, 'ALPHA ZERO  (Self-Play Chess)', W/2, 26, 14, MUTED);

    const newM = Math.floor(f / moveFrames3);
    if (newM > mIdx && mIdx < moves.length) {
      const [fr, fc, tr, tc] = moves[mIdx];
      board[tr][tc] = board[fr][fc];
      board[fr][fc] = null;
      highlight = [fr, fc, tr, tc];
      mIdx++;
    }

    // Board
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const x = BX + c * CELL8, y = BY + r * CELL8;
        const isLight = (r + c) % 2 === 0;
        ctx.fillStyle = isLight ? '#f0d9b5' : '#b58863';
        ctx.fillRect(x, y, CELL8, CELL8);

        // Highlight
        if (highlight && ([0,2].some(i => highlight[i] === r && highlight[i+1] === c))) {
          ctx.fillStyle = 'rgba(255,255,50,0.4)';
          ctx.fillRect(x, y, CELL8, CELL8);
        }
      }
    }

    // Coordinate labels
    ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
    const FILES = 'abcdefgh';
    for (let c = 0; c < 8; c++) {
      ctx.fillStyle = (c % 2 === 0) ? '#b58863' : '#f0d9b5';
      ctx.fillText(FILES[c], BX + c * CELL8 + CELL8/2, BY + BOARD_SIZE * CELL8 + 12);
    }
    for (let r = 0; r < 8; r++) {
      ctx.fillStyle = (r % 2 === 1) ? '#b58863' : '#f0d9b5';
      ctx.textAlign = 'right';
      ctx.fillText(String(8 - r), BX - 4, BY + r * CELL8 + CELL8/2 + 4);
    }
    ctx.textAlign = 'center';

    // Pieces
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (!board[r][c]) continue;
        const x = BX + c * CELL8 + CELL8/2, y = BY + r * CELL8 + CELL8/2;
        const isWhite = board[r][c].startsWith('w');
        ctx.font = `${CELL8 * 0.7}px sans-serif`;
        ctx.fillStyle = isWhite ? '#fff' : '#111';
        ctx.shadowColor = isWhite ? '#0006' : '#fff4';
        ctx.shadowBlur = 3;
        ctx.fillText(PIECES[board[r][c]], x, y + CELL8 * 0.25);
        ctx.shadowBlur = 0;
      }
    }

    // Move log
    if (mIdx > 0) {
      const last = moves[mIdx - 1];
      const side = last[5];
      const move = last[4];
      ctx.fillStyle = SURF;
      roundRect(ctx, W - 120, BY, 110, 32, 6);
      ctx.fill();
      label(ctx, `${side}: ${move}`, W - 65, BY + 20, 13, side === 'White' ? '#fff' : MUTED);
    }

    await writeFrame(proc, canvas);
  }
  proc.stdin.end();
  return new Promise(r => proc.on('close', r));
}

// ── 13. CARTPOLE (neuroevolution) ─────────────────────────────────────────────
async function genCartpole(outPath) {
  const FRAMES = FPS * 10;
  const proc = spawnFfmpeg(outPath);
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  const GROUND_Y = H - 80;
  const CART_W = 70, CART_H = 28;
  const POLE_L = 130;
  const CART_BASE_Y = GROUND_Y - CART_H; // where the pole is attached

  // Cartpole dynamics: returns [ddcx, ddth]
  // Standard equations: m_c=1, m_p=0.1, l=1 (scaled), g=9.8
  function cartpoleDerivs(th, dth, cvx, force) {
    const g = 9.8, mc = 1.0, mp = 0.1, l = 0.5;
    const costh = Math.cos(th), sinth = Math.sin(th);
    const total_mass = mc + mp;
    const polemass_length = mp * l;
    const temp = (force + polemass_length * dth * dth * sinth) / total_mass;
    const ddth = (g * sinth - costh * temp) / (l * (4/3 - mp * costh * costh / total_mass));
    const ddcx = temp - polemass_length * ddth * costh / total_mass;
    return [ddcx, ddth];
  }

  // Pre-simulate three episodes at different skill levels
  const DT = 1 / FPS;
  const episodeFrames = Math.floor(FRAMES / 3);

  function simulate(frames, controller, startTh = 0.1, startDth = 0.05) {
    const states = [];
    let cx = W / 2, cvx = 0, th = startTh, dth = startDth;
    let dead = false, deadFrames = 0;
    for (let f = 0; f < frames; f++) {
      if (dead) {
        // Keep falling under gravity (no control)
        const [, ddth] = cartpoleDerivs(th, dth, cvx, 0);
        dth += ddth * DT; th += dth * DT;
        // Clamp pole to ground contact
        const poleEndY = CART_BASE_Y - POLE_L * Math.cos(th);
        if (poleEndY >= GROUND_Y) {
          // Pole hit the ground - freeze at ground
          const thMax = Math.acos(Math.max(-1, (CART_BASE_Y - GROUND_Y) / POLE_L));
          th = th > 0 ? thMax : -thMax;
          dth = 0;
        }
        deadFrames++;
        states.push({ cx, th, dead: true, crashed: poleEndY >= GROUND_Y - 2 });
        // Reset after 25 frames on the ground
        if (deadFrames > 25 && poleEndY >= GROUND_Y - 5) {
          cx = W / 2; cvx = 0; th = startTh; dth = startDth; dead = false; deadFrames = 0;
        }
        continue;
      }

      const force = controller(th, dth, cx, cvx, f);
      const [ddcx, ddth] = cartpoleDerivs(th, dth, cvx, force);
      cvx += ddcx * DT; cvx = Math.max(-6, Math.min(6, cvx));
      cx += cvx * 30; // scale to pixels
      cx = Math.max(60, Math.min(W - 60, cx));
      dth += ddth * DT; th += dth * DT;

      // Fail if pole falls past ~50 degrees
      if (Math.abs(th) > 0.87) {
        dead = true; deadFrames = 0;
        states.push({ cx, th, dead: true, crashed: false });
        continue;
      }
      states.push({ cx, th, dead: false, crashed: false });
    }
    return states;
  }

  // Gen 1: random controller - fails immediately
  const gen1 = simulate(episodeFrames,
    (th, dth, cx, cvx, f) => (Math.sin(f * 0.8) > 0 ? 8 : -8),
    0.12, 0.03
  );
  // Gen 5: weak PD controller - survives longer but fails
  const gen5 = simulate(episodeFrames,
    (th, dth) => Math.max(-10, Math.min(10, -th * 6 - dth * 1.5)),
    0.1, 0.04
  );
  // Gen 12: strong PD controller - stays balanced
  const gen12 = simulate(episodeFrames,
    (th, dth, cx, cvx) => Math.max(-10, Math.min(10, -th * 18 - dth * 4 + (W/2 - cx) * 0.004 - cvx * 0.6)),
    0.05, 0.01
  );

  const allStates = [...gen1, ...gen5, ...gen12];
  const genLabels = [
    { label: 'Gen 1  (random)', color: RED },
    { label: 'Gen 5  (learning)', color: GOLD },
    { label: 'Gen 12  (trained)', color: GREEN },
  ];

  for (let f = 0; f < FRAMES; f++) {
    drawBg(ctx);

    const genIdx = Math.min(2, Math.floor(f / episodeFrames));
    const { label: genLabel, color: genColor } = genLabels[genIdx];
    label(ctx, 'CARTPOLE  (Neuroevolution)', W/2, 26, 14, MUTED);
    pill(ctx, genLabel, W/2, 50, genColor);

    const state = allStates[Math.min(allStates.length - 1, f)];
    const { cx, th, dead, crashed } = state;

    // Ground
    ctx.fillStyle = SURF;
    ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
    ctx.fillStyle = '#2a3450';
    ctx.fillRect(0, GROUND_Y, W, 2);

    // Track
    ctx.strokeStyle = MUTED; ctx.lineWidth = 1; ctx.setLineDash([8, 8]);
    ctx.beginPath(); ctx.moveTo(60, GROUND_Y + 1); ctx.lineTo(W - 60, GROUND_Y + 1); ctx.stroke();
    ctx.setLineDash([]);

    // Cart
    ctx.fillStyle = dead ? '#444' : WHITE;
    roundRect(ctx, cx - CART_W/2, GROUND_Y - CART_H, CART_W, CART_H, 6);
    ctx.fill();
    ctx.fillStyle = BG;
    ctx.beginPath(); ctx.arc(cx - 20, GROUND_Y - 2, 8, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 20, GROUND_Y - 2, 8, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = MUTED;
    ctx.beginPath(); ctx.arc(cx - 20, GROUND_Y - 2, 4, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 20, GROUND_Y - 2, 4, 0, Math.PI*2); ctx.fill();

    // Pole
    const poleBaseX = cx;
    const poleBaseY = CART_BASE_Y;
    const poleEndX = poleBaseX + POLE_L * Math.sin(th);
    const poleEndY = poleBaseY - POLE_L * Math.cos(th);
    const poleColor = dead ? RED : genColor;
    ctx.strokeStyle = poleColor;
    ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(poleBaseX, poleBaseY); ctx.lineTo(poleEndX, poleEndY); ctx.stroke();
    ctx.fillStyle = poleColor;
    ctx.beginPath(); ctx.arc(poleEndX, poleEndY, 7, 0, Math.PI*2); ctx.fill();

    // Crash flash
    if (crashed) {
      ctx.fillStyle = RED + '44';
      ctx.fillRect(0, 0, W, H);
      label(ctx, 'FAILED', cx, GROUND_Y - CART_H - 20, 16, RED);
    }

    // Angle indicator
    const deg = (th * 180 / Math.PI).toFixed(1);
    label(ctx, `θ: ${deg}°  |  x: ${(cx - W/2).toFixed(0)}px`, W/2, H - 25, 12, MUTED);

    await writeFrame(proc, canvas);
  }
  proc.stdin.end();
  return new Promise(r => proc.on('close', r));
}

// ── 14. MOUNTAIN CAR ──────────────────────────────────────────────────────────
async function genMountainCar(outPath) {
  const FRAMES = FPS * 10;
  const proc = spawnFfmpeg(outPath);
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Mountain shape: y = sin(3x) mapped to canvas
  const X_MIN = -1.2, X_MAX = 0.6;
  function mountainY(x) { return -Math.sin(3 * x); }
  function toScreenX(x) { return 60 + (x - X_MIN) / (X_MAX - X_MIN) * (W - 120); }
  function toScreenY(y) { return H - 80 - y * 110; }

  // Car physics
  let carX = -0.5, carVx = 0;
  const GOAL_X = 0.45;
  let reached = false, reachedAt = -1;

  // Phase: early frames show failed attempts, later frames show success
  const ATTEMPTS = 3;
  const attemptFrames = Math.floor(FRAMES / ATTEMPTS);

  for (let f = 0; f < FRAMES; f++) {
    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#0f172a');
    sky.addColorStop(1, '#1e3a5f');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    const attempt = Math.floor(f / attemptFrames);
    const relF = f % attemptFrames;
    const rfrac = relF / attemptFrames;

    if (relF === 0) {
      carX = -0.5 + attempt * 0.02;
      carVx = 0;
      reached = false;
    }

    // Control
    const power = 0.001;
    let action;
    if (attempt < 2) {
      // naive / random early
      action = (Math.sin(f * 0.15 + attempt * 1.7) > 0) ? 1 : -1;
    } else {
      // Shaped reward: build momentum by oscillating
      action = carVx >= 0 ? 1 : -1;
    }

    if (!reached) {
      carVx += action * power - 0.0025 * Math.cos(3 * carX);
      carVx = Math.max(-0.07, Math.min(0.07, carVx));
      carX += carVx;
      if (carX <= X_MIN) { carX = X_MIN; carVx = 0; }
      if (carX >= GOAL_X) { reached = true; reachedAt = f; }
    }

    // Draw mountain
    ctx.strokeStyle = '#64748b';
    ctx.fillStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let px = 0; px <= W; px++) {
      const wx = X_MIN + (px / W) * (X_MAX - X_MIN);
      const sy = toScreenY(mountainY(wx));
      ctx.lineTo(px, sy);
    }
    ctx.lineTo(W, H); ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Goal flag
    const gx = toScreenX(GOAL_X);
    const gy = toScreenY(mountainY(GOAL_X));
    ctx.strokeStyle = GOLD; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx, gy - 30); ctx.stroke();
    ctx.fillStyle = GOLD;
    ctx.beginPath(); ctx.moveTo(gx, gy - 30); ctx.lineTo(gx + 18, gy - 22); ctx.lineTo(gx, gy - 14); ctx.closePath(); ctx.fill();

    // Car
    const csx = toScreenX(carX);
    const mY  = mountainY(carX);
    const csy = toScreenY(mY);
    const slope = -3 * Math.cos(3 * carX); // dy/dx of mountain
    const angle = Math.atan(slope * (W - 120) / 220 * (110 / (W - 120)));

    ctx.save();
    ctx.translate(csx, csy - 8);
    ctx.rotate(Math.atan2(-slope, 1) * 0.4);
    ctx.fillStyle = RED;
    roundRect(ctx, -18, -12, 36, 18, 4);
    ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.arc(-10, 6, 5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(10, 6, 5, 0, Math.PI*2); ctx.fill();
    ctx.restore();

    // Thrust particles if going right in attempt 2
    if (attempt >= 2 && action > 0 && Math.abs(carVx) > 0.01) {
      for (let i = 0; i < 3; i++) {
        const ox = csx - 15 - Math.random() * 8;
        const oy = csy - 8 + (Math.random() - 0.5) * 6;
        ctx.fillStyle = `rgba(251,146,60,${0.4 + Math.random() * 0.4})`;
        ctx.beginPath(); ctx.arc(ox, oy, 3 + Math.random() * 3, 0, Math.PI*2); ctx.fill();
      }
    }

    // Attempt / status labels
    label(ctx, 'MOUNTAIN CAR  (Reward Shaping)', W/2, 26, 14, MUTED);
    const attemptLabel = attempt < 2 ? `Attempt ${attempt + 1} (random policy)` : 'Attempt 3 (shaped reward)';
    pill(ctx, attemptLabel, W/2, 52, attempt < 2 ? RED : GREEN);

    if (reached) {
      ctx.fillStyle = GREEN + 'dd';
      roundRect(ctx, W/2 - 110, H - 50, 220, 36, 10);
      ctx.fill();
      label(ctx, 'Goal reached! Reward shaping works ✓', W/2, H - 27, 13, WHITE);
    }

    label(ctx, `x: ${carX.toFixed(3)}  v: ${carVx.toFixed(4)}`, W/2, H - 12, 11, MUTED);

    await writeFrame(proc, canvas);
  }
  proc.stdin.end();
  return new Promise(r => proc.on('close', r));
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

const GAMES = [
  { slug: 'ai-learns-pong',           fn: genPong,        name: 'Pong'           },
  { slug: 'ai-learns-breakout',        fn: genBreakout,    name: 'Breakout'       },
  { slug: 'ai-learns-flappy-bird',     fn: genFlappyBird,  name: 'Flappy Bird'    },
  { slug: 'ai-learns-maze',            fn: genMaze,        name: 'Maze'           },
  { slug: 'ai-learns-blackjack',       fn: genBlackjack,   name: 'Blackjack'      },
  { slug: 'ai-learns-connect4',        fn: genConnect4,    name: 'Connect 4'      },
  { slug: 'ai-learns-tictactoe-self-play', fn: genTicTacToe, name: 'Tic-Tac-Toe' },
  { slug: 'ai-learns-rocket-landing',  fn: genRocketLanding, name: 'Rocket Landing' },
  { slug: 'ai-learns-slots',           fn: genSlots,       name: 'Slots/Bandit'   },
  { slug: 'ai-learns-acrobat',         fn: genAcrobat,     name: 'Acrobat'        },
  { slug: 'ai-learns-3d-snake',        fn: gen3dSnake,     name: '3D Snake'       },
  { slug: 'alpha-zero-self-play',      fn: genAlphaZero,   name: 'Alpha Zero'     },
  { slug: 'neuroevolution-cartpole',   fn: genCartpole,    name: 'CartPole'       },
  { slug: 'reward-shaping-mountain-car', fn: genMountainCar, name: 'Mountain Car' },
];

async function main() {
  for (const game of GAMES) {
    const outPath = path.join(POSTS, game.slug, 'images', game.slug + '.mp4');
    process.stdout.write(`Generating ${game.name}... `);
    const t = Date.now();
    await game.fn(outPath);
    console.log(`done (${((Date.now() - t) / 1000).toFixed(1)}s) → ${outPath}`);
  }
  console.log('\nAll videos generated.');
}

main().catch(err => { console.error(err); process.exit(1); });
