// Part D scenes (see parts/D.md): time, time_cf, time_vc, time_aws, hands, hands_cf, hands_vc, hands_aws, quiz2
// Local helpers use the d_ prefix.

// ----- part D helpers -----
const d_lin = x => Math.max(0, x);   // linear ramp for code reveals: runs past 1 so the cursor hides when done
const d_num = n => Math.round(n).toLocaleString('en-US');
const d_title = (s, p, y = 160) => fade(p, () => text(s, W / 2, y, { size: 54, weight: 600, fam: SERIF, align: 'center' }), 10);
// Title with the provider's logo on its left (and an optional status badge on its right).
function d_head(k, s, p, o = {}) {
  const y = o.y || 160;
  fade(p, () => {
    const w = measure(s, 54, 600, SERIF), bw = o.badge ? measure(o.badge.toUpperCase(), 20, 800) + 44 : 0, x0 = 960 - (96 + w + bw) / 2;
    logo(k, x0 + 40, y - 4, .7);
    text(s, x0 + 96, y, { size: 54, weight: 600, fam: SERIF });
    if (o.badge) badge(o.badge, x0 + 116 + w, y - 17, { size: 20 });
  }, 10);
}
// Piecewise eased keyframes [[t, v], ...] -> v at time t.
function d_kf(t, keys) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) return lerp(keys[i - 1][1], keys[i][1], eIO((t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0])));
  return keys[keys.length - 1][1];
}
function d_mix(a, b, p) {
  const h = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const x = h(a), y = h(b), q = clamp01(p);
  return `rgb(${x.map((v, i) => Math.round(lerp(v, y[i], q))).join(',')})`;
}
function d_sun(x, y, r, t) {
  ctx.save(); ctx.strokeStyle = C.cfY; ctx.lineWidth = r * .14; ctx.lineCap = 'round';
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + t * .4; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r * 1.3, y + Math.sin(a) * r * 1.3); ctx.lineTo(x + Math.cos(a) * r * 1.6, y + Math.sin(a) * r * 1.6); ctx.stroke(); }
  ctx.restore();
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = C.cfY; ctx.fill();
}
function d_moon(x, y, r, bg) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = '#F6E7B8'; ctx.fill();
  ctx.beginPath(); ctx.arc(x + r * .45, y - r * .3, r * .85, 0, 7); ctx.fillStyle = bg; ctx.fill();
}
// Analog clock face; hour/minute hand angles in radians (0 = 12 o'clock).
function d_clock(x, y, r, ha, ma, rim = C.acc) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = r * .1; ctx.strokeStyle = rim; ctx.stroke();
  ctx.fillStyle = C.muted; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ctx.beginPath(); ctx.arc(x + Math.sin(a) * r * .78, y - Math.cos(a) * r * .78, r * .045, 0, 7); ctx.fill(); }
  ctx.save(); ctx.strokeStyle = C.ink; ctx.lineCap = 'round';
  ctx.lineWidth = r * .08; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.sin(ha) * r * .45, y - Math.cos(ha) * r * .45); ctx.stroke();
  ctx.lineWidth = r * .05; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.sin(ma) * r * .68, y - Math.cos(ma) * r * .68); ctx.stroke();
  ctx.restore();
  ctx.beginPath(); ctx.arc(x, y, r * .07, 0, 7); ctx.fillStyle = rim; ctx.fill();
}
// Alarm clock with bells; ring 0..1 shakes it and draws sound arcs. ha/ma = hand angles.
function d_alarm(x, y, s, t, ring, ha, ma, col = C.cf) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 38) * .12 * ring); ctx.translate(-x, -y);
  for (const sx of [-1, 1]) { ctx.save(); ctx.translate(x + sx * 44 * s, y - 52 * s); ctx.rotate(sx * .5); ctx.beginPath(); ctx.arc(0, 0, 24 * s, Math.PI, 0); ctx.fillStyle = col; ctx.fill(); ctx.restore(); }
  line(x - 34 * s, y + 50 * s, x - 50 * s, y + 74 * s, C.ink, 7 * s); line(x + 34 * s, y + 50 * s, x + 50 * s, y + 74 * s, C.ink, 7 * s);
  d_clock(x, y, 66 * s, ha, ma, col);
  ctx.restore();
  if (ring > 0) {
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 5 * s; ctx.lineCap = 'round';
    for (const sx of [-1, 1]) for (const k of [0, 1]) {
      ctx.globalAlpha = ring * (.5 + .5 * Math.sin(t * 16 + k * 2));
      ctx.beginPath(); ctx.arc(x, y, (92 + k * 20) * s, sx > 0 ? -.5 : Math.PI - .5, sx > 0 ? .5 : Math.PI + .5); ctx.stroke();
    }
    ctx.restore();
  }
}
// Stopwatch: hand angle a (radians), rim color col.
function d_watch(x, y, r, a, col = C.acc) {
  rr(x - r * .18, y - r * 1.32, r * .36, r * .24, r * .06); ctx.fillStyle = col; ctx.fill();
  line(x, y - r * 1.1, x, y - r * .98, col, r * .14);
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = r * .12; ctx.strokeStyle = col; ctx.stroke();
  ctx.fillStyle = C.muted; for (let i = 0; i < 12; i++) { const b = i / 12 * Math.PI * 2; ctx.beginPath(); ctx.arc(x + Math.sin(b) * r * .76, y - Math.cos(b) * r * .76, r * .045, 0, 7); ctx.fill(); }
  line(x, y, x + Math.sin(a) * r * .68, y - Math.cos(a) * r * .68, C.ink, r * .07);
  ctx.beginPath(); ctx.arc(x, y, r * .08, 0, 7); ctx.fillStyle = col; ctx.fill();
}
// Browser window chrome
function d_win(x, y, w, h, url, o = {}) {
  card(x, y, w, h, { r: 18, shadow: o.shadow });
  rr(x, y, w, 50, [18, 18, 0, 0]); ctx.fillStyle = '#EFE9DF'; ctx.fill();
  rr(x, y, w, h, 18); ctx.strokeStyle = o.stroke || C.line; ctx.lineWidth = o.lw || 2.5; ctx.stroke();
  ['#F0715F', '#F2C14E', '#5DC26A'].forEach((c, i) => { ctx.beginPath(); ctx.arc(x + 24 + i * 21, y + 25, 7, 0, 7); ctx.fillStyle = c; ctx.fill(); });
  if (url !== undefined) { rr(x + 94, y + 11, w - 110, 28, 14); ctx.fillStyle = '#fff'; ctx.fill(); if (url) text(url, x + 110, y + 26, { size: 18, weight: 600, color: C.soft, fam: MONO }); }
}
// Mouse pointer with tip at (x, y)
function d_cursor(x, y, s = 1, col = C.ink) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 32); ctx.lineTo(8, 25); ctx.lineTo(14, 38); ctx.lineTo(20, 35); ctx.lineTo(14, 23); ctx.lineTo(24, 22); ctx.closePath();
  ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore();
}
// A human hand pointing up, fingertip at (x, y)
function d_hand(x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#E9B99A'; ctx.strokeStyle = '#B98563'; ctx.lineWidth = 3;
  rr(-28, 34, 60, 60, 20); ctx.fill(); ctx.stroke();
  rr(-10, 0, 20, 52, 10); ctx.fill(); ctx.stroke();
  for (const dy of [50, 66]) { ctx.beginPath(); ctx.moveTo(12, dy); ctx.lineTo(30, dy); ctx.stroke(); }
  rr(-26, 90, 56, 30, 6); ctx.fillStyle = C.teal; ctx.fill();
  ctx.restore();
}
// Glass box (sandbox) with an optional lock on top
function d_glass(x, y, w, h, o = {}) {
  const col = o.stroke || C.teal;
  ctx.save();
  rr(x, y, w, h, 26); ctx.fillStyle = o.fill || 'rgba(214,240,236,0.6)'; ctx.fill();
  ctx.strokeStyle = col; ctx.lineWidth = o.lw || 5; ctx.stroke();
  ctx.globalAlpha *= .8; ctx.strokeStyle = '#fff'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x + 24, y + Math.min(h * .4, 140)); ctx.lineTo(x + 24, y + 40); ctx.quadraticCurveTo(x + 24, y + 24, x + 40, y + 24); ctx.lineTo(x + Math.min(w * .3, 160), y + 24); ctx.stroke();
  ctx.restore();
  if (o.lock !== false) { node(x + w / 2, y, 30, '', { fill: col, stroke: '#fff', lw: 4 }); icon('lock', x + w / 2, y + 3, 17, '#fff'); }
}
// Grid of tiny "endpoint" tiles; p = reveal 0..1 (sweeps diagonally)
function d_wall(x0, y0, cols, rows, cw, ch, p, seed, cols3 = [C.cf, C.cfL, '#fff']) {
  const r = rng(seed);
  for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
    const k = r(), d = (col + row) / (cols + rows), a = clamp01((p * 1.4 - d) * 4);
    if (a <= 0) continue;
    alpha(a, () => { rr(x0 + col * cw, y0 + row * ch, cw - 6, ch - 6, 4); ctx.fillStyle = k < .18 ? cols3[0] : k < .55 ? cols3[1] : cols3[2]; ctx.fill(); });
  }
}
// Tool-call ping-pong: n round trips between yA (agent) and yT (tools); prog counts completed trips.
function d_zig(x0, yA, yT, step, n, prog, lw = 4) {
  for (let i = 0; i < n; i++) {
    const lc = clamp01(prog - i); if (lc <= 0) break;
    const xs = x0 + i * step, u = step / 88;
    arrow(xs, yA + 30, xs + 28 * u, yT - 30, clamp01(lc / .35), { color: C.cf, lw, head: 12 });
    if (lc > .35) { const wp = clamp01((lc - .35) / .25); for (let d = 0; d < 3; d++) if (wp > d / 3) { ctx.beginPath(); ctx.arc(xs + (32 + d * 7) * u, yT - 18, 3, 0, 7); ctx.fillStyle = C.muted; ctx.fill(); } }
    arrow(xs + 50 * u, yT - 30, xs + 78 * u, yA + 30, clamp01((lc - .6) / .4), { color: C.blue, lw, head: 12 });
  }
}
// Lightning strike at (x, y): a big bolt with a white outline and flash spikes; a = 0..1 visibility.
function d_bolt(x, y, s, a) {
  if (a <= 0) return;
  alpha(a, () => {
    icon('bolt', x, y, s * 1.12, '#fff'); icon('bolt', x, y, s, C.cfY);
    ctx.save(); ctx.strokeStyle = C.cfY; ctx.lineWidth = 6; ctx.lineCap = 'round';
    for (let k = 0; k < 8; k++) { const b = k / 8 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(x + Math.cos(b) * s * 1.1, y + s * .9 + Math.sin(b) * s * .5); ctx.lineTo(x + Math.cos(b) * s * 1.45, y + s * .9 + Math.sin(b) * s * .7); ctx.stroke(); }
    ctx.restore();
  });
}
// Pill with a leading icon.
function d_iconPill(s, ic, cx, cy, o = {}) {
  const size = o.size || 30, w = measure(s, size, 700) + size * 2.6, h = size * 1.9;
  card(cx - w / 2, cy - h / 2, w, h, { r: h / 2, fill: o.fill || '#fff', stroke: o.stroke || C.line, lw: 3, shadow: o.shadow });
  icon(ic, cx - w / 2 + size * 1.05, cy, size * .5, o.color || C.ink);
  text(s, cx - w / 2 + size * 1.9, cy + 1, { size, weight: 700, color: o.color || C.ink });
  return w;
}
// Small parcel (a queued job)
function d_box(x, y, col = C.cf, fill = C.cfL) {
  rr(x - 18, y - 14, 36, 28, 5); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x, y - 14); ctx.lineTo(x, y + 14); ctx.stroke();
}
// Status node: 'wait' | 'run' | 'ok' | 'fail'
function d_status(x, y, r, st, t) {
  if (st === 'run') { const pr = (t * 1.3) % 1; ctx.beginPath(); ctx.arc(x, y, r + 4 + pr * 18, 0, 7); ctx.strokeStyle = `rgba(42,157,143,${1 - pr})`; ctx.lineWidth = 3; ctx.stroke(); }
  const fill = st === 'ok' ? C.green : st === 'fail' ? C.red : '#fff', stroke = st === 'ok' ? C.green : st === 'fail' ? C.red : st === 'run' ? C.acc : C.line;
  node(x, y, r, '', { fill, stroke, lw: 4 });
  if (st === 'ok') check(x, y, r * .9, '#fff'); else if (st === 'fail') cross(x, y, r * .8, '#fff');
  else if (st === 'run') { ctx.save(); ctx.translate(x, y); ctx.rotate(t * 3); icon('gear', 0, 0, r * .55, C.acc); ctx.restore(); }
}
// Terminal card with typed lines: L = [[text, isCommand, startTime]]
function d_term(x, y, w, h, title, L, t, size = 26) {
  card(x, y, w, h, { fill: C.code, r: 20 });
  ['#F0715F', '#F2C14E', '#5DC26A'].forEach((c, i) => { ctx.beginPath(); ctx.arc(x + 28 + i * 24, y + 26, 7, 0, 7); ctx.fillStyle = c; ctx.fill(); });
  if (title) text(title, x + w / 2, y + 27, { size: 20, color: '#A59C8F', align: 'center', fam: MONO });
  let last = [x + 60, y + 90];
  L.forEach(([s, cmd, t0], i) => {
    const p = clamp01((t - t0) / (cmd ? .7 : .2)); if (p <= 0) return;
    const ly = y + 90 + i * size * 1.75, body = cmd ? s : s, n = Math.floor(body.length * p);
    if (cmd) { text('$', x + 28, ly, { size, weight: 700, fam: MONO, color: '#5DC26A' }); text(body.slice(0, n), x + 28 + size * 1.2, ly, { size, fam: MONO, color: CODE.text }); last = [x + 28 + size * 1.2 + measure(body.slice(0, n), size, 500, MONO), ly]; }
    else { text(body.slice(0, n), x + 28, ly, { size, fam: MONO, color: s.startsWith('✓') ? '#8FD6A0' : CODE.comment }); last = [x + 28 + measure(body.slice(0, n), size, 500, MONO), ly]; }
  });
  if (Math.sin(t * 8) > 0) { ctx.fillStyle = C.orange; ctx.fillRect(last[0] + 6, last[1] - size * .5, size * .5, size); }
}
// Three provider chips centered on cx; ps = [p0, p1, p2] pop progress; ok = draw a "speaks MCP"-style check.
function d_provRow(cx, y, ps, o = {}) {
  const size = o.size || 26, ws = PROVS.map(k => measure(PV[k].name, size, 800) + size * 2.9 + (o.tag ? measure(o.tag, 26, 700) + 64 : 0));
  const gap = 36, tot = ws.reduce((a, b) => a + b, 0) + gap * 2;
  let x = cx - tot / 2;
  PROVS.forEach((k, i) => {
    const w = ws[i], x0 = x;
    pop(x0 + w / 2, y, ps[i], () => {
      provChip(k, x0, y, { size });
      if (o.tag) { const tx = x0 + measure(PV[k].name, size, 800) + size * 2.9; check(tx + 14, y, 26, C.green); text(o.tag, tx + 38, y + 1, { size: 26, weight: 700, color: C.green }); }
    });
    x += w + gap;
  });
}

// ================= time =================
const D_PRICE = [.1, .04, .24, .17, .42, .52, .92];
SCN.time = {
  chapter: CH.time,
  draw(S, t) {
    chapterTitle(S, 5, 'Time', 'clock');
    const T0 = S.ls(0) + 3.1, at0 = w => Math.max(T0, S.at(0, wordAt('time', 0, w)));
    const X0 = 140, CW = 234, cx = i => X0 + CW * (i + .5), TY = 690;
    const show = P(t, T0 - .1, .6);
    if (show <= 0) return;
    alpha(show, () => {
      d_title('One job, one whole week', 1);
      card(X0 - 10, 210, CW * 7 + 20, 530, { r: 28 });
      for (let i = 0; i < 7; i++) {
        if (i) line(X0 + CW * i, 232, X0 + CW * i, 718, C.line, 2);
        text('Day ' + (i + 1), cx(i), 250, { size: 26, weight: 800, color: C.soft, align: 'center' });
      }
      // price chart drifting down
      const py = v => lerp(380, 500, v), dp = P(t, at0('prices'), 2.2, clamp01) * 6;
      ctx.save(); ctx.strokeStyle = C.blue; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.beginPath();
      for (let k = 0; k <= Math.ceil(dp); k++) { const kk = Math.min(k, dp), i0 = Math.floor(kk), f = kk - i0, v = i0 + 1 < 7 ? lerp(D_PRICE[i0], D_PRICE[i0 + 1], f) : D_PRICE[i0]; const x = lerp(cx(0), cx(6), kk / 6); k ? ctx.lineTo(x, py(v)) : ctx.moveTo(x, py(v)); }
      ctx.stroke(); ctx.restore();
      fade(P(t, at0('prices') + .1, .5), () => text('price', cx(0) - 60, py(D_PRICE[0]) - 4, { size: 24, weight: 700, color: C.blue, align: 'right' }), 0);
      pop(cx(6), py(D_PRICE[6]), P(t, at0('prices') + 2.2, .5), () => { node(cx(6), py(D_PRICE[6]), 12, '', { fill: C.green, stroke: '#fff' }); text('dropped', cx(6), py(D_PRICE[6]) + 36, { size: 24, weight: 800, color: C.green, align: 'center' }); });
      // a sun each morning, with a check on that day's price
      for (let i = 0; i < 7; i++) {
        const sp = P(t, at0('every') + i * .16, .45);
        pop(cx(i), 312, sp, () => d_sun(cx(i), 312, 15, t + i));
        const v = D_PRICE[i], ring = P(t, at0('every') + i * .16 + .1, .6, clamp01);
        if (ring > 0 && ring < 1) { ctx.beginPath(); ctx.arc(cx(i), py(v), 10 + ring * 22, 0, 7); ctx.strokeStyle = `rgba(242,174,64,${1 - ring})`; ctx.lineWidth = 4; ctx.stroke(); }
        if (sp > 0 && i < 6) { ctx.beginPath(); ctx.arc(cx(i), py(v), 7, 0, 7); ctx.fillStyle = C.blue; ctx.fill(); }
      }
      // pause for days, waiting for the traveller's approval
      const bx0 = X0 + 3 * CW + 10, bx1 = X0 + 6 * CW - 10, bp = P(t, at0('pause'), .7, eIO);
      const pulse = S.p(1, 0, .1) > 0 ? .5 + .5 * Math.sin((t - S.at(1, wordAt('time', 1, 'long'))) * 6) : 0;
      if (bp > 0) {
        ctx.save(); rr(bx0, 556, (bx1 - bx0) * bp, 68, 34); ctx.fillStyle = '#EFE9DF'; ctx.fill();
        ctx.setLineDash([10, 8]); ctx.strokeStyle = S.pf(1, wordAt('time', 1, 'long'), .3) > 0 ? C.acc : C.soft; ctx.lineWidth = 3 + 2 * pulse * S.out(1, 4, .5); ctx.stroke(); ctx.restore();
        alpha(clamp01(bp * 2 - 1), () => {
          const mx = (bx0 + bx1) / 2, tw = measure('waiting for approval', 26, 700);
          rr(mx - tw / 2 - 38, 575, 9, 30, 3); ctx.fillStyle = C.soft; ctx.fill(); rr(mx - tw / 2 - 24, 575, 9, 30, 3); ctx.fill();
          text('waiting for approval', mx + 8, 591, { size: 26, weight: 700, color: C.soft, align: 'center' });
        });
      }
      pop(bx1, 590, P(t, at0('approves'), .5), () => { node(bx1, 590, 26, '', { fill: C.green, stroke: '#fff', lw: 4 }); check(bx1, 590, 24, '#fff'); text('approved', bx1 + 36, 591, { size: 24, weight: 800, color: C.green }); });
      // the job track and Atlas on it (runs during line 1)
      const tc = S.at(1, wordAt('time', 1, 'crashes')) - .15;
      const u = d_kf(t, [[S.ls(1), .3], [tc, 2.3], [tc + 1.0, 2.3], [tc + 1.5, 3.05], [S.at(1, .85), 5.9], [S.le(1) + .4, 6.55]]);
      const ax = X0 + CW * u, crashed = t > tc && t < tc + 1.0;
      line(X0 + 40, TY, X0 + CW * 7 - 40, TY, C.line, 8);
      if (u > .31) line(X0 + 40, TY, ax, TY, crashed ? C.red : C.green, 8);
      const sleep = u > 3.02 && u < 5.88 && t < S.at(1, .85) + .6;
      atlas(ax, TY - 16, .7, t, { mood: crashed ? 'think' : sleep ? 'sleep' : t > S.le(1) ? 'happy' : 'ok' });
      // crash, then carry on
      const bx = X0 + CW * 2.3;
      d_bolt(bx + 10, TY - 100, 44, (t > tc - .15 && t < tc + .45) ? 1 : 0);
      const ex = (t - tc) / .7;
      if (ex > 0 && ex < 1) { ctx.save(); ctx.globalAlpha *= 1 - ex; ctx.strokeStyle = C.red; ctx.lineWidth = 6; ctx.lineCap = 'round'; for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(bx + Math.cos(a) * (40 + ex * 40), TY - 12 + Math.sin(a) * (40 + ex * 40)); ctx.lineTo(bx + Math.cos(a) * (62 + ex * 60), TY - 12 + Math.sin(a) * (62 + ex * 60)); ctx.stroke(); } ctx.restore(); }
      if (crashed) pop(bx - 150, 630, P(t, tc, .3), () => pill('crash!', bx - 150, 630, { size: 26, fill: C.redL, color: C.red }));
      pop(bx - 190, 630, P(t, tc + 1.0, .4), () => pill('survives crashes', bx - 190, 630, { size: 26, fill: C.greenL, color: C.green }));
      // how does each cloud keep the promise?
      const fe = wordAt('time', 1, 'each');
      d_provRow(960, 800, [0, 1, 2].map(i => S.pf(1, fe + i * .04, .5)), { size: 32 });
    });
  },
};

// ================= time_cf =================
const D_CF_WF = [
  'await step.do("search flights", () => searchFlights());',
  'await step.waitForEvent("wait for approval",',
  '  { type: "approved", timeout: "3 days" });',
];
SCN.time_cf = {
  chapter: CH.time,
  draw(S, t) {
    // ---- line 0: schedule yourself ----
    alpha(S.p(0, 0, .5) * S.out(1, 0, .5), () => {
      d_head('cf', 'Cloudflare', 1);
      const f = w => wordAt('time_cf', 0, w);
      const tb = S.at(0, f('schedule')) + 1.1, tn = S.at(0, f('nine'));
      const asleep = t > tb && t < tn + .15, woke = t > tn + .15;
      // night sky -> morning while the clock spins
      const day = P(t, tn - .3, .5);
      const sky = d_mix('#2E3F66', '#D7E8F7', day);
      pop(960, 520, S.p(0, .1, .6), () => {
        rr(260, 240, 1400, 560, 36); ctx.fillStyle = asleep || day > 0 ? sky : '#D7E8F7'; ctx.fill();
        if (asleep && day < 1) alpha(1 - day, () => { d_moon(1520, 330, 38, sky); const r = rng(9); for (let i = 0; i < 14; i++) { ctx.beginPath(); ctx.arc(320 + r() * 1100, 280 + r() * 120, 2.5 + Math.sin(t * 3 + i) * 1.2, 0, 7); ctx.fillStyle = '#F6E7B8'; ctx.fill(); } });
        if (!asleep) d_sun(1520, 330, 30, t);
        rr(470, 690, 330, 56, 28); ctx.fillStyle = '#B9CBEF'; ctx.fill();
        atlas(635, 600, 1.55, t, { mood: asleep ? 'sleep' : woke ? 'happy' : 'ok' });
        // alarm clock: 23:00 -> spins -> 9:00
        const sp = clamp01((t - tb) / (tn - tb));
        const hrs = t < tb ? 23 : lerp(23, 33, eIO(sp));
        const ring = woke ? 1 - P(t, S.ls(1) + .3, .3) : 0;
        d_alarm(1150, 500, 1.35, t, ring, (hrs % 12) / 12 * Math.PI * 2, (hrs % 1) * Math.PI * 2);
        pill('tomorrow 9:00', 1150, 655, { size: 28, fill: '#fff', color: C.cf });
      });
      pop(560, 330, S.pf(0, f('schedule'), .5), () => bubble('Wake me up tomorrow at 9:00', 330, 300, 470, { size: 28, tail: 'right', fill: C.blueL, stroke: C.blueL }));
      pop(1150, 742, S.pf(0, f('schedule') + .05, .5), () => pill('this.schedule', 1150, 742, { size: 28, fill: C.code, color: CODE.fn }));
    });

    // ---- line 1: Queues smooth bursts, Workflows retry steps ----
    alpha(S.p(1, 0, .5) * S.out(2, 0, .5), () => {
      d_head('cf', 'Queues and Workflows', 1);
      // queue panel
      pop(505, 465, S.p(1, .05, .5), () => {
        card(90, 230, 830, 470, { r: 28 });
        text('Queue', 505, 276, { size: 34, weight: 800, color: C.cf, align: 'center' });
        const tb = S.ls(1) + .3, NB = 12;
        pop(205, 360, P(t, tb, .4) * (1 - P(t, tb + 2.2, .4)), () => pill('burst!', 205, 360, { size: 26, fill: C.redL, color: C.red, shadow: false }));
        card(310, 410, 480, 80, { r: 40, stroke: C.cf, lw: 4 });
        node(850, 450, 44, '', { fill: C.cfL, stroke: C.cf }); ctx.save(); ctx.translate(850, 450); ctx.rotate(t * 2.5); icon('gear', 0, 0, 24, C.cf); ctx.restore();
        for (let k = 0; k < NB; k++) {
          const fall = P(t, tb + k * .05, .35), te = tb + .9 + k * .42;
          if (t < te) { if (fall > 0) { const c = k % 4, row = Math.floor(k / 4); d_box(148 + c * 38, 520 - row * 32 - (1 - fall) * 160); } }
          else { const x = 334 + (t - te) * 190; if (x < 836) alpha(x > 800 ? 1 - (x - 800) / 36 : 1, () => d_box(x, 450)); }
        }
        text('smooth, steady flow', 590, 540, { size: 26, weight: 700, color: C.soft, align: 'center' });
        fade(S.pf(1, .12, .5), () => text('soaks up bursts of work', 505, 630, { size: 30, weight: 700, color: C.cf, align: 'center' }), 8);
      });
      // workflow panel
      const fw = wordAt('time_cf', 1, 'Workflows'), tw = S.at(1, fw), tf = S.at(1, .72), tr = tf + .9;
      pop(1405, 465, S.pf(1, fw, .5), () => {
        card(980, 230, 850, 470, { r: 28 });
        text('Workflow', 1405, 276, { size: 34, weight: 800, color: C.cf, align: 'center' });
        const steps = ['search flights', 'hold hotel', 'book trip'];
        const done = [tw + .6, tr, tr + .6];
        steps.forEach((nm, i) => {
          const y = 360 + i * 110, fail = i === 1 && t > tf && t < tr, ok = t > done[i];
          const run = !ok && !fail && t > (i ? done[i - 1] : tw + .1);
          if (i) line(1080, y - 110 + 34, 1080, y - 34, t > done[i - 1] ? C.green : C.line, 5);
          card(1040, y - 40, 480, 80, { r: 20, fill: fail ? C.redL : ok ? C.greenL : '#fff', stroke: fail ? C.red : ok ? C.green : C.line, lw: 3, shadow: false });
          d_status(1080, y, 24, fail ? 'fail' : ok ? 'ok' : run ? 'run' : 'wait', t);
          text(nm, 1124, y + 1, { size: 30, weight: 700 });
        });
        // retry loop
        const rp = P(t, tf + .15, .4) * (1 - P(t, tr + .9, .4));
        pop(1660, 470, rp, () => {
          ctx.save(); ctx.strokeStyle = t < tr ? C.red : C.green; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); const a = t * 4; ctx.arc(1590, 470, 22, a, a + 4.6); ctx.stroke(); ctx.restore();
          text(t < tr ? 'retry' : 'retried', 1625, 471, { size: 28, weight: 800, color: t < tr ? C.red : C.green });
        });
        fade(S.pf(1, fw + .08, .5), () => text('retries each step on failure', 1405, 660, { size: 30, weight: 700, color: C.cf, align: 'center' }), 8);
      });
    });

    // ---- line 2: wait for an event, for days ----
    alpha(S.p(2, 0, .5), () => {
      d_head('cf', 'Wait for an event', 1);
      const f = w => wordAt('time_cf', 2, w), ta = S.at(2, f('approve'));
      const hl = S.pf(2, .12, .4);
      codeBlock(80, 240, 1010, D_CF_WF, { size: 28, file: 'workflow.ts', reveal: chars(D_CF_WF) * S.p(2, 0, 1.5, d_lin), cursor: true, hl: [0, hl, hl] });
      // days pass
      const d0 = S.at(2, .2), dp = clamp01((t - d0) / (ta - .2 - d0));
      fade(S.pf(2, .15, .4), () => {
        text('days pass…', 90, 540, { size: 26, weight: 700, color: C.soft });
        rr(90, 570, 990, 64, 32); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.stroke();
        if (dp > 0) { rr(90, 570, Math.max(64, 990 * dp), 64, 32); ctx.fillStyle = C.cfL; ctx.fill(); }
        for (let i = 0; i < 3; i++) { if (i) line(90 + i * 330, 580, 90 + i * 330, 624, C.line, 2); text('Day ' + (i + 1), 90 + i * 330 + 165, 603, { size: 26, weight: 800, color: dp * 3 > i ? C.cf : C.muted, align: 'center' }); }
        const hx = 90 + Math.max(32, 990 * dp - 32), ph = (dp * 6) % 2;
        if (dp < 1) { if (ph < 1) d_sun(hx, 530, 14, t); else d_moon(hx, 530, 16, C.bg); }
      }, 8);
      const back = P(t, ta + .3, .8, clamp01);
      if (back > 0 && back < 1) { line(1360, 500, 1100, 360, C.green, 4, [6, 10]); packet(1360, 500, 1100, 360, back, C.green, 10); }
      pop(580, 720, P(t, ta + .5, .5), () => d_iconPill('approved, the workflow carries on', 'bolt', 580, 720, { size: 28, fill: C.greenL, stroke: C.green, color: C.green }));
      // phone with the approve button
      fade(S.pf(2, .1, .5), () => phone(1470, 500, 1.4, (x, y, w, h) => {
        ctx.fillStyle = C.bg; ctx.fillRect(x, y, w, h);
        text('Atlas', x + w / 2, y + 32, { size: 24, weight: 800, color: C.blue, align: 'center' });
        card(x + 10, y + 64, w - 20, 130, { r: 14, stroke: C.line, lw: 2 });
        text('Book the', x + w / 2, y + 100, { size: 24, weight: 700, align: 'center' });
        text('Lisbon trip?', x + w / 2, y + 130, { size: 24, weight: 700, align: 'center' });
        text('5 days', x + w / 2, y + 164, { size: 24, weight: 800, color: C.cf, align: 'center' });
        const tap = P(t, ta, .35);
        rr(x + 14, y + 222, w - 28, 62, 31); ctx.fillStyle = tap > 0 ? '#2F7A4D' : C.green; ctx.fill();
        text(tap > 0 ? 'Approved' : 'Approve', x + w / 2, y + 254, { size: 26, weight: 800, color: '#fff', align: 'center' });
        if (tap > 0 && tap < 1) { ctx.beginPath(); ctx.arc(x + w / 2, y + 253, 10 + tap * 60, 0, 7); ctx.strokeStyle = `rgba(63,154,98,${1 - tap})`; ctx.lineWidth = 5; ctx.stroke(); }
      }), 20);
      // the traveller's finger taps
      const hp = P(t, ta - .7, .6, eIO) * (1 - P(t, ta + .6, .5));
      if (hp > 0) alpha(clamp01(hp * 3), () => d_hand(1480 + (1 - hp) * 160, 598 + (1 - hp) * 180, .9));
    });
  },
};

// ================= time_vc =================
const D_VC_WF = [
  'export async function planTrip(goal) {',
  '  "use workflow";',
  '  const flights = await searchFlights(goal);',
  '  await sleep("1 day");',
  '  return await bookBest(flights);',
  '}',
  'async function searchFlights(goal) {',
  '  "use step";   // retried automatically',
  '}',
];
SCN.time_vc = {
  chapter: CH.time,
  draw(S, t) {
    // ---- line 0: Vercel Workflows ----
    alpha(S.p(0, 0, .5) * S.out(1, 0, .5), () => {
      const f = w => wordAt('time_vc', 0, w);
      pop(960, 420, S.p(0, .05, .6), () => {
        const pr = (t * .7) % 1; ctx.beginPath(); ctx.arc(960, 420, 110 + pr * 60, 0, 7); ctx.strokeStyle = `rgba(17,17,17,${.25 * (1 - pr)})`; ctx.lineWidth = 4; ctx.stroke();
        provTile('vc', 960, 420 + Math.sin(t * 1.8) * 5, 100, { label: false });
      });
      fade(S.pf(0, f('Vercel Workflows'), .5), () => text('Vercel Workflows', 960, 630, { size: 72, weight: 600, fam: SERIF, align: 'center' }), 14);
      pop(960, 740, S.pf(0, f('open-source'), .5), () => d_iconPill('open-source Workflow SDK', 'code', 960, 740, { size: 32, fill: '#F2F2F2', stroke: PV.vc.col }));
    });

    // ---- line 1: "use workflow" / "use step", retries, crash + resume ----
    alpha(S.p(1, 0, .5) * S.out(2, .5, .4), () => {
      const f = w => wordAt('time_vc', 1, w);
      d_head('vc', 'Mark it, and it keeps going', 1);
      const h1 = S.pf(1, f('use workflow'), .4) * (1 - .6 * S.pf(1, f('use step'), .4)), h2 = S.pf(1, f('use step'), .4);
      codeBlock(70, 220, 1000, D_VC_WF, { size: 28, file: 'plan-trip.ts', reveal: chars(D_VC_WF) * S.p(1, 0, 2.6, d_lin), cursor: true, hl: [0, h1, 0, 0, 0, 0, 0, h2, 0] });
      // the run
      const tRetry = S.at(1, f('retry')), tc = S.at(1, f('crashes')) - .1, tRes = tc + .9;
      const crashed = t > tc && t < tRes;
      pop(1480, 430, S.pf(1, f('use workflow') + .02, .5), () => {
        card(1130, 220, 700, 420, { r: 28, fill: crashed ? '#FBEFEC' : '#fff', stroke: crashed ? C.red : C.line, lw: 3 });
        text('run: planTrip', 1170, 268, { size: 30, weight: 800, fam: MONO });
        const rows = ['searchFlights', 'sleep 1 day', 'bookBest'];
        const failT = tRetry + .1, okT = [tRetry + 1.0, tRes + .4, tRes + .9];
        rows.forEach((nm, i) => {
          const y = 350 + i * 100, rp = S.pf(1, f('use step') + i * .03, .4);
          if (rp <= 0) return;
          alpha(rp, () => {
            const ok = t > okT[i], fail = i === 0 && t > failT && t < failT + .5;
            const run = !ok && !fail && (i === 0 || t > okT[i - 1]) && !(crashed && i === 1);
            if (i) line(1190, y - 100 + 30, 1190, y - 30, t > okT[i - 1] ? C.green : C.line, 5);
            d_status(1190, y, 26, fail ? 'fail' : ok ? 'ok' : run ? 'run' : 'wait', t);
            text(nm, 1240, y + 1, { size: 30, weight: 700, fam: MONO, color: crashed && i === 1 ? C.muted : C.ink });
            if (i === 0) { const rq = P(t, failT + .4, .3) * (1 - P(t, okT[0] + .8, .3)); if (rq > 0) alpha(rq, () => { ctx.save(); ctx.strokeStyle = C.acc; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(1690, y, 18, t * 4, t * 4 + 4.6); ctx.stroke(); ctx.restore(); text('retry', 1718, y + 1, { size: 26, weight: 800, color: C.acc }); }); }
          });
        });
      });
      if (crashed) pop(1480, 720, P(t, tc, .3), () => d_iconPill('crash!', 'bolt', 1480, 720, { size: 30, fill: C.redL, stroke: C.red, color: C.red }));
      d_bolt(1760, 230, 50, (t > tc - .15 && t < tc + .45) ? 1 : 0);
      pop(1480, 720, P(t, tRes, .5), () => d_iconPill('resumes where it left off', 'bolt', 1480, 720, { size: 30, fill: C.greenL, stroke: C.green, color: C.green }));
    });

    // ---- line 2: sleep for days or months; run has no limit, each step does ----
    alpha(S.p(2, .6, .5) * S.out(3, 0, .5), () => {
      const f = w => wordAt('time_vc', 2, w);
      d_head('vc', 'Sleep for days, even months', 1);
      // day/night time-lapse
      const u = Math.max(0, t - S.ls(2)), ph = u * .55, days = Math.min(180, Math.exp(u * 2) - 1);
      const fr = ph % 1, isDay = fr < .5, a = Math.PI + (isDay ? fr * 2 : (fr - .5) * 2) * Math.PI;
      const dayAmt = Math.sin(fr * Math.PI * 2) > 0 ? Math.min(1, Math.sin(fr * Math.PI * 2) * 3) : 0;
      const sky = d_mix('#2E3F66', '#D7E8F7', dayAmt);
      ctx.save(); rr(100, 230, 800, 480, 32); ctx.clip();
      ctx.fillStyle = sky; ctx.fillRect(100, 230, 800, 480);
      const ox = 500 + Math.cos(a) * 330, oy = 640 + Math.sin(a) * 330;
      if (isDay) d_sun(ox, oy, 30, t); else d_moon(ox, oy, 32, sky);
      ctx.fillStyle = '#CFE3C0'; ctx.fillRect(100, 640, 800, 70);
      ctx.restore();
      atlas(500, 610, .95, t, { mood: 'sleep' });
      const lab = days < 30 ? `${Math.max(1, Math.floor(days))} day${Math.floor(days) >= 2 ? 's' : ''}` : `${Math.floor(days / 30)} month${days >= 60 ? 's' : ''}`;
      pill('asleep: ' + lab, 500, 290, { size: 30, fill: '#fff', color: C.ink });
      text('sleep("…")', 500, 770, { size: 30, weight: 700, fam: MONO, color: C.soft, align: 'center' });
      // run: no time limit
      const pa = S.pf(2, f('no time limit') - .03, .9, eIO);
      fade(S.pf(2, f('no time limit') - .05, .4), () => {
        text('the run', 1000, 300, { size: 28, weight: 700, color: C.soft });
        if (pa > 0) { rr(1000, 330, 700 * pa, 44, 22); ctx.fillStyle = C.green; ctx.fill(); }
        if (pa >= 1) for (let k = 0; k < 3; k++) { const a = .4 + .6 * Math.max(0, Math.sin(t * 4 - k)); alpha(a, () => { ctx.beginPath(); ctx.arc(1730 + k * 26, 352, 7, 0, 7); ctx.fillStyle = C.green; ctx.fill(); }); }
        pop(1400, 430, P(t, S.at(2, f('no time limit')) + .5, .5), () => pill('run: no time limit', 1400, 430, { size: 30, fill: C.greenL, color: C.green }));
      }, 8);
      // each step fits inside the function limit
      const fs = f('each single step');
      fade(S.pf(2, fs, .4), () => {
        text('each step', 1000, 530, { size: 28, weight: 700, color: C.soft });
        for (let i = 0; i < 3; i++) {
          const x = 1000 + i * 250, sp = S.pf(2, fs + i * .04, .4);
          pop(x + 90, 590, sp, () => {
            rr(x, 566, 180, 48, 12); ctx.fillStyle = C.blueL; ctx.fill();
            text('step ' + (i + 1), x + 90, 591, { size: 24, weight: 800, color: C.blue, align: 'center' });
            line(x - 4, 556, x - 4, 624, C.red, 4); line(x + 184, 556, x + 184, 624, C.red, 4);
          });
        }
        pop(1400, 700, S.pf(2, fs + .12, .5), () => {
          const w = pill('      each step ≤ function limit', 1400, 700, { size: 28, fill: C.redL, color: C.red });
          d_watch(1400 - w / 2 + 38, 702, 15, t * 4, C.red);
        });
      }, 8);
    });

    // ---- line 3: Queues (beta) and cron ----
    alpha(S.p(3, 0, .5), () => {
      const f = w => wordAt('time_vc', 3, w);
      d_head('vc', 'Queues and cron jobs', 1);
      pop(510, 480, S.p(3, .05, .5), () => {
        card(120, 240, 780, 480, { r: 28 });
        text('Vercel Queues', 170, 300, { size: 38, weight: 800 });
        badge('beta', 170 + measure('Vercel Queues', 38, 800) + 20, 283, { size: 22 });
        card(180, 440, 560, 80, { r: 40, stroke: PV.vc.col, lw: 4 });
        for (let k = 0; k < 7; k++) { const x = 200 + ((t * 90 + k * 90) % 630); if (x > 210 && x < 800) alpha(x > 760 ? 1 - (x - 760) / 40 : 1, () => d_box(x, 480, PV.vc.col, '#EDEDED')); }
        node(820, 480, 40, '', { fill: '#F2F2F2', stroke: PV.vc.col }); ctx.save(); ctx.translate(820, 480); ctx.rotate(t * 2.5); icon('gear', 0, 0, 22, PV.vc.col); ctx.restore();
        text('in public beta', 510, 640, { size: 28, weight: 700, color: C.blue, align: 'center' });
      });
      pop(1410, 480, S.pf(3, f('cron'), .5), () => {
        card(1020, 240, 780, 480, { r: 28 });
        icon('clock', 1080, 300, 22, PV.vc.col);
        text('cron: every morning', 1116, 301, { size: 36, weight: 800 });
        for (let i = 0; i < 7; i++) {
          const x = 1060 + i * 102, cp = S.pf(3, f('daily') + i * .035, .4);
          card(x, 400, 88, 150, { r: 16, stroke: C.line, lw: 2, shadow: false });
          rr(x, 400, 88, 36, [16, 16, 0, 0]); ctx.fillStyle = PV.vc.col; ctx.fill();
          text('D' + (i + 1), x + 44, 419, { size: 22, weight: 800, color: '#fff', align: 'center' });
          pop(x + 44, 470, cp, () => d_sun(x + 44, 470, 13, t + i));
          pop(x + 44, 522, P(t, S.at(3, f('daily') + i * .035) + .25, .4), () => check(x + 44, 522, 26, C.green));
        }
        fade(S.pf(3, f('daily'), .5), () => text('the daily price check', 1410, 640, { size: 28, weight: 700, color: C.soft, align: 'center' }), 8);
      });
    });
  },
};

// ================= time_aws =================
const D_AWS_DUR = [
  'export const handler = withDurableExecution(async (event, ctx) => {',
  '  const flights = await ctx.step(() => searchFlights(event));',
  '  // ...wait for a price drop: no charge while waiting',
  '  return ctx.step(() => bookBest(flights));',
  '});',
];
SCN.time_aws = {
  chapter: CH.time,
  draw(S, t) {
    // ---- line 0: two answers; Step Functions diagram ----
    const f0 = w => wordAt('time_aws', 0, w), tSF = S.at(0, f0('Step Functions'));
    alpha(S.p(0, 0, .5) * S.out(0, (tSF - S.ls(0)) + 1.0, .4), () => {
      d_head('aws', 'Two answers', 1);
      [['1', 'Step Functions', 'queue'], ['2', 'Lambda durable functions', 'code']].forEach(([n, nm, ic], i) => {
        const x = 960 + (i ? 330 : -330), hot = i === 0 ? S.pf(0, f0('Step Functions'), .4) : 0;
        pop(x, 480, S.p(0, .2 + i * .25, .5), () => {
          card(x - 290, 380, 580, 200, { r: 28, fill: hot > 0 ? PV.aws.light : '#fff', stroke: hot > 0 ? PV.aws.smile : C.line, lw: 3 + 3 * hot });
          node(x - 220, 480, 36, n, { fill: PV.aws.col, stroke: PV.aws.col, color: '#fff', size: 32 });
          text(nm, x - 164, 481, { size: nm.length > 16 ? 30 : 36, weight: 800, color: PV.aws.ink });
        });
      });
    });
    alpha(S.p(0, (tSF - S.ls(0)) + 1.1, .5) * S.out(1, .7, .4), () => {
      d_head('aws', 'Step Functions', 1);
      const X = 960, NS = [
        ['start', 250, f0('diagram')], ['AgentCore agent: plan trip', 365, f0('diagram') + .06], ['Human approval', 490, f0('diagram') + .12],
        ['Book', 615, f0('diagram') + .18], ['end', 720, f0('diagram') + .22],
      ];
      const hotA = S.pf(0, f0('AgentCore'), .4), hotH = S.pf(0, f0('human approval'), .4);
      // token flows through the states
      const k0 = S.at(0, f0('AgentCore')), tap = S.at(0, f0('human approval')) + .4;
      const ty = d_kf(t, [[k0 - .5, 250], [k0, 365], [k0 + .6, 365], [k0 + 1.0, 490], [tap, 490], [tap + .35, 615], [tap + .75, 615], [tap + 1.05, 720]]);
      NS.forEach(([nm, y, fr], i) => {
        if (i) { const p = S.pf(0, fr - .02, .4); if (p > 0) arrow(X, NS[i - 1][1] + (i === 1 ? 26 : 40), X, lerp(NS[i - 1][1] + 40, y - (i === 4 ? 30 : 42), p), 1, { color: t > NS[i - 1][2] && ty >= y - 1 ? PV.aws.smile : C.muted, lw: 5, head: 14 }); }
        pop(X, y, S.pf(0, fr, .45), () => {
          if (i === 0 || i === 4) { node(X, y, 26, '', { fill: i === 0 ? PV.aws.col : '#fff', stroke: PV.aws.col, lw: 5 }); if (i === 4) { ctx.beginPath(); ctx.arc(X, y, 13, 0, 7); ctx.fillStyle = PV.aws.col; ctx.fill(); } text(nm, X + 44, y + 1, { size: 26, weight: 700, color: C.soft }); return; }
          const hot = i === 1 ? hotA : i === 2 ? hotH : 0, w = 560;
          card(X - w / 2, y - 40, w, 80, { r: 18, fill: hot > 0 ? PV.aws.light : '#fff', stroke: hot > 0 ? PV.aws.smile : C.line, lw: 3 + 2 * hot });
          icon(i === 1 ? 'brain' : i === 2 ? 'user' : 'coin', X - w / 2 + 44, y, 18, PV.aws.col);
          text(nm, X - w / 2 + 80, y + 1, { size: 30, weight: 700, color: PV.aws.ink });
        });
      });
      if (t > k0 - .6) { const st = Math.abs(ty - 365) < 1 || Math.abs(ty - 490) < 1 || Math.abs(ty - 615) < 1; ctx.beginPath(); ctx.arc(X + 300, ty, 12, 0, 7); ctx.fillStyle = PV.aws.smile; ctx.fill(); if (st) { const pr = (t * 1.4) % 1; ctx.beginPath(); ctx.arc(X + 300, ty, 14 + pr * 16, 0, 7); ctx.strokeStyle = `rgba(255,153,0,${1 - pr})`; ctx.lineWidth = 3; ctx.stroke(); } }
      // Atlas beside the agent state; the traveller approves beside the approval state
      pop(470, 365, S.pf(0, f0('AgentCore'), .5), () => { atlas(470, 365, .75, t, { mood: t < k0 + .6 ? 'think' : 'happy' }); line(530, 365, 670, 365, C.line, 4, [4, 10]); });
      pop(1450, 490, S.pf(0, f0('human approval'), .5), () => {
        line(1250, 490, 1370, 490, C.line, 4, [4, 10]);
        person(1450, 470, .8, C.teal);
        const ok = P(t, tap - .2, .4);
        pop(1520, 420, ok, () => { node(1520, 420, 24, '', { fill: C.green, stroke: '#fff', lw: 4 }); check(1520, 420, 22, '#fff'); });
      });
      fade(S.pf(0, f0('diagram'), .5), () => text('a diagram of states', 470, 720, { size: 30, weight: 700, color: C.soft, align: 'center' }), 8);
    });

    // ---- line 1: Lambda durable functions ----
    alpha(S.p(1, 1.15, .5) * S.out(2, .6, .4), () => {
      const f = w => wordAt('time_aws', 1, w);
      d_head('aws', 'Lambda durable functions', 1);
      const hl = S.pf(1, f('plain code') + .05, .4);
      codeBlock(70, 230, 1310, D_AWS_DUR, { size: 28, file: 'handler.ts', reveal: chars(D_AWS_DUR) * S.p(1, 1.1, 2.4, d_lin), cursor: true, hl: [0, hl, 0, 0, 0] });
      pop(1620, 390, S.p(1, 1.2, .5), () => {
        card(1430, 230, 380, 320, { r: 28, fill: PV.aws.col });
        text('λ', 1620, 340, { size: 130, weight: 700, fam: SERIF, color: PV.aws.smile, align: 'center' });
        text('Lambda', 1620, 455, { size: 36, weight: 800, color: '#fff', align: 'center' });
        badge('new since December', 1620, 488, { align: 'center', size: 22 });
      });
      // do a step, then wait
      const CH3 = [S.at(1, f('do a step')), S.at(1, f('wait')), S.at(1, f('wait')) + .35];
      CH3.forEach((t0, i) => {
        const x = 520 + i * 440, p = P(t, t0, .45);
        if (i && p > 0) arrow(x - 440 + 130, 710, lerp(x - 440 + 130, x - 130, p), 710, 1, { color: C.muted, lw: 5 });
        pop(x, 710, p, () => {
          const wait = i === 1;
          d_iconPill(wait ? 'wait' : 'do a step', wait ? 'clock' : 'bolt', x, 710, { size: 32, fill: wait ? C.greenL : PV.aws.light, stroke: wait ? C.green : PV.aws.col, color: wait ? C.green : PV.aws.ink });
        });
      });
    });

    // ---- line 2: up to a year, not billed while waiting; SQS + EventBridge ----
    alpha(S.p(2, .7, .5), () => {
      const f = w => wordAt('time_aws', 2, w);
      d_head('aws', 'Runs up to a year', 1);
      const X0 = 180, X1 = 1740, Y = 330, tl = S.p(2, .7, 1.2, eIO);
      text('now', X0, Y + 48, { size: 26, weight: 700, color: C.soft, align: 'center' });
      line(X0, Y, lerp(X0, X1, tl), Y, C.line, 10);
      for (let m = 0; m <= 12; m++) { const x = lerp(X0, X1, m / 12); if (tl * 12 >= m) { ctx.beginPath(); ctx.arc(x, Y, m % 12 ? 6 : 10, 0, 7); ctx.fillStyle = C.muted; ctx.fill(); } }
      pop(X1, Y + 48, P(t, S.ls(2) + 1.8, .4), () => text('1 year', X1, Y + 48, { size: 28, weight: 800, color: PV.aws.ink, align: 'center' }));
      pop(960, 262, S.pf(2, f('up to a year'), .5), () => pill('up to 1 year', 960, 262, { size: 28, fill: PV.aws.light, color: PV.aws.ink }));
      // the run: a step, a long wait, a step
      const ts = S.ls(2) + 1.2, te = S.at(2, .62);
      const mx = d_kf(t, [[ts, X0], [ts + .9, X0 + 110], [te, X1 - 110], [te + .8, X1]]);
      const stepping = (t > ts && t < ts + .9) || (t > te && t < te + .8);
      const waiting = t >= ts + .9 && t <= te;
      if (t > ts) {
        rr(X0, Y - 16, 110, 32, 10); ctx.fillStyle = PV.aws.smile; ctx.fill();
        ctx.save(); ctx.setLineDash([10, 10]); ctx.strokeStyle = C.green; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(X0 + 110, Y); ctx.lineTo(Math.min(mx, X1 - 110), Y); ctx.stroke(); ctx.restore();
        if (t > te) { rr(X1 - 110, Y - 16, Math.min(110, mx - (X1 - 110)), 32, 10); ctx.fillStyle = PV.aws.smile; ctx.fill(); }
        atlas(mx, Y - 70, .55, t, { mood: waiting ? 'sleep' : t > te + .8 ? 'happy' : 'ok' });
      }
      // billing meter
      fade(S.pf(2, f('billed') - .05, .5), () => {
        card(180, 450, 700, 330, { r: 28 });
        text('billing meter', 530, 500, { size: 30, weight: 800, color: C.soft, align: 'center' });
        rr(260, 540, 540, 110, 18); ctx.fillStyle = C.code; ctx.fill();
        if (waiting) {
          rr(420, 570, 14, 50, 4); ctx.fillStyle = '#8FD6A0'; ctx.fill(); rr(446, 570, 14, 50, 4); ctx.fill();
          text('PAUSED', 490, 597, { size: 44, weight: 800, fam: MONO, color: '#8FD6A0' });
        } else text(stepping ? 'running' : t > te ? 'done' : 'idle', 530, 597, { size: 44, weight: 800, fam: MONO, color: stepping ? C.cfY : '#8C857A', align: 'center' });
        text('no charge while it waits', 530, 720, { size: 30, weight: 700, color: C.green, align: 'center' });
      }, 12);
      // SQS + EventBridge
      [['SQS', 'queues', 'queue', f('SQS')], ['EventBridge', 'schedules', 'clock', f('EventBridge')]].forEach(([nm, sub, ic, fr], i) => {
        const x = 1000 + i * 400;
        pop(x + 180, 615, S.pf(2, fr, .5), () => {
          card(x, 470, 360, 290, { r: 28, stroke: PV.aws.col, lw: 3 });
          node(x + 180, 560, 50, '', { fill: PV.aws.light, stroke: PV.aws.light });
          if (i === 0) icon('queue', x + 180 + Math.sin(t * 3) * 4, 560, 30, PV.aws.col);
          else d_clock(x + 180, 560, 34, t * .4, t * 4.8, PV.aws.smile);
          text(nm, x + 180, 660, { size: 36, weight: 800, color: PV.aws.ink, align: 'center' });
          text(sub, x + 180, 708, { size: 26, weight: 600, color: C.soft, align: 'center' });
        });
      });
    });
  },
};

// ================= hands =================
const D_TOOLS = [['airline API', 'call it', 'globe', 'airline'], ['hotel website', 'browse it', 'browser', 'hotel'], ['code runner', 'crunch prices', 'code', 'run code']];
// USB-style plug, tip pointing left at (x, y); returns the x of its back end (cable attach point)
function d_plug(x, y, s, label, col = C.acc) {
  rr(x, y - 14 * s, 40 * s, 28 * s, 13 * s); ctx.fillStyle = '#BDB5A8'; ctx.fill();
  rr(x + 8 * s, y - 5 * s, 24 * s, 10 * s, 5 * s); ctx.fillStyle = '#7D766B'; ctx.fill();
  card(x + 36 * s, y - 34 * s, 124 * s, 68 * s, { r: 22 * s, fill: col });
  if (label) text(label, x + 98 * s, y + 1, { size: 30 * s, weight: 800, color: '#fff', align: 'center' });
  return x + 160 * s;
}
SCN.hands = {
  chapter: CH.hands,
  draw(S, t) {
    chapterTitle(S, 6, 'Hands', 'hand');
    const T0 = S.ls(0) + 3.1, show = P(t, T0 - .1, .6);
    if (show <= 0) return;
    const AX = 300, AY = 480, TX = 1300, TYS = [300, 460, 620], HX = 1130;
    const ins = S.pf(1, wordAt('hands', 1, 'plug') , .9, eIO), plugged = ins >= 1;
    alpha(show, () => {
      alpha(S.out(1, 0, .4), () => d_title('Atlas needs tools', 1));
      fade(S.pf(1, wordAt('hands', 1, 'MCP') - .02, .5), () => {
        text('MCP', 960, 150, { size: 60, weight: 700, fam: SERIF, color: C.acc, align: 'center' });
      }, 8);
      fade(S.pf(1, wordAt('hands', 1, 'Model Context'), .5), () => text('the Model Context Protocol', 960, 208, { size: 30, weight: 600, color: C.soft, align: 'center' }), 8);
      // Atlas with a port
      atlas(AX, AY, 1.5, t, { mood: plugged ? 'happy' : 'think' });
      text('Atlas', AX, AY + 110, { size: 30, weight: 800, color: C.blue, align: 'center' });
      rr(AX + 118, AY - 30, 26, 60, 12); ctx.fillStyle = C.ink; ctx.fill(); rr(AX + 125, AY - 20, 12, 40, 6); ctx.fillStyle = '#6B645A'; ctx.fill();
      // tools on the right
      D_TOOLS.forEach(([nm, sub, ic, w], i) => {
        const y = TYS[i], p = P(t, Math.max(T0, S.at(0, wordAt('hands', 0, w))), .5);
        // line 0: dashed "how?" links; line 1: cables from the hub
        alpha(p * (1 - ins), () => { line(AX + 150, AY, TX - 10, y, C.line, 4, [6, 12]); });
        if (ins > 0) { const q = clamp01(ins * 1.5 - .3); if (q > 0) line(HX, AY, lerp(HX, TX, q), lerp(AY, y, q), C.acc, 8); }
        if (plugged) { const k = (t * .8 + i * .3) % 1; packet(TX, y, HX, AY, k, C.acc, 8); }
        pop(TX + 230, y, p, () => {
          card(TX, y - 60, 460, 120, { r: 24, stroke: plugged ? C.acc : C.line, lw: plugged ? 3.5 : 2.5 });
          rr(TX + 18, y - 42, 84, 84, 18); ctx.fillStyle = C.accL; ctx.fill(); icon(ic, TX + 60, y, 26, C.acc);
          text(nm, TX + 126, y - 16, { size: 32, weight: 800 });
          text(sub, TX + 126, y + 24, { size: 24, weight: 600, color: C.soft });
        });
      });
      pop(1060, 330, P(t, T0 + .6, .4) * (1 - ins), () => text('?', 1060, 330, { size: 80, weight: 800, fam: SERIF, color: C.acc, align: 'center' }));
      // line 1: the universal MCP plug
      const pp = S.pf(1, wordAt('hands', 1, 'plug') - .05, .4);
      if (pp > 0) alpha(pp, () => {
        const tipX = lerp(760, AX + 144, ins), backX = tipX + 160 * 1.1;
        ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 14; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(backX, AY); ctx.bezierCurveTo(backX + 120, AY, HX - 120, AY, HX, AY); ctx.stroke(); ctx.restore();
        d_plug(tipX, AY, 1.1, 'MCP');
        node(HX, AY, 30, '', { fill: C.acc, stroke: '#fff', lw: 4 });
        if (plugged) for (let k = 0; k < 2; k++) packet(HX - 30, AY, backX + 10, AY, (t * .9 + k / 2) % 1, C.cfY, 8);
      });
      const done = plugged ? P(t, S.at(1, wordAt('hands', 1, 'plug')) + .9, .6) : 0;
      if (done > 0 && done < 1) { ctx.beginPath(); ctx.arc(AX + 140, AY, 30 + done * 90, 0, 7); ctx.strokeStyle = `rgba(42,157,143,${1 - done})`; ctx.lineWidth = 6; ctx.stroke(); }
      // all three clouds speak it
      const fa = wordAt('hands', 1, 'All three');
      d_provRow(960, 790, [0, 1, 2].map(i => S.pf(1, fa + i * .05, .5)), { tag: 'speaks MCP', size: 30 });
    });
  },
};

// ================= hands_cf =================
SCN.hands_cf = {
  chapter: CH.hands,
  draw(S, t) {
    // ---- line 0: MCP servers on Workers; 2,500+ endpoints -> two tools ----
    alpha(S.p(0, 0, .5) * S.out(1, 0, .5), () => {
      const f = w => wordAt('hands_cf', 0, w);
      d_head('cf', 'Cloudflare', 1);
      pop(430, 275, S.pf(0, .05, .5), () => {
        card(110, 222, 640, 106, { r: 26, fill: C.cf });
        cloud(180, 278, .34, '#fff');
        text('MCP server on Workers', 250, 276, { size: 34, weight: 800, color: '#fff' });
      });
      const fo = f('its own'), wp = S.pf(0, fo, 2.2, d_lin);
      d_wall(110, 370, 22, 13, 32, 30, wp, 11);
      fade(S.pf(0, fo + .02, .4), () => text(d_num(2500 * S.pf(0, fo, 2.2, eOut)) + '+ API endpoints', 460, 800, { size: 36, weight: 800, color: C.cf, align: 'center' }), 10);
      const ft = f('two tools'), fp = S.pf(0, ft - .1, .6);
      alpha(fp, () => {
        ctx.beginPath(); ctx.moveTo(850, 370); ctx.lineTo(1170, 500); ctx.lineTo(1170, 640); ctx.lineTo(850, 760); ctx.closePath();
        ctx.fillStyle = 'rgba(243,128,32,.12)'; ctx.fill(); ctx.strokeStyle = C.cf; ctx.lineWidth = 4; ctx.stroke();
        const r = rng(5);
        for (let i = 0; i < 24; i++) {
          const sy = 385 + r() * 360, k = (t * .45 + i / 24) % 1, to = i % 2 ? 640 : 400, mid = 570 + (sy - 570) * .15;
          const x = k < .6 ? lerp(850, 1170, k / .6) : lerp(1170, 1250, (k - .6) / .4);
          const y = k < .6 ? lerp(sy, mid, eIO(k / .6)) : lerp(mid, to, (k - .6) / .4);
          ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fillStyle = C.cf; ctx.fill();
        }
      });
      fade(S.pf(0, ft, .4), () => text('just 2 tools', 1490, 300, { size: 32, weight: 700, color: C.soft, align: 'center' }), 10);
      [['search()', f('search'), 400], ['execute()', f('execute'), 640]].forEach(([nm, fr, y]) => pop(1490, y, S.pf(0, fr, .5), () => {
        card(1270, y - 64, 440, 128, { r: 32, fill: C.cf });
        text(nm, 1490, y + 2, { size: 50, weight: 700, fam: MONO, color: '#fff', align: 'center' });
      }));
    });

    // ---- line 1: Code Mode ----
    alpha(S.p(1, 0, .5) * S.out(2, 0, .5), () => {
      const f = w => wordAt('hands_cf', 1, w);
      d_head('cf', 'Code Mode', 1);
      const fw = f('write'), fo = f('one by one'), fs = f('saves');
      // left: one little program
      pop(490, 440, S.p(1, .1, .5), () => {
        card(100, 230, 780, 420, { r: 28, stroke: C.green, lw: 3 });
        text('one little program', 490, 276, { size: 32, weight: 800, color: C.green, align: 'center' });
        atlas(210, 450, 1.0, t, { mood: 'happy' });
        card(330, 320, 500, 260, { fill: C.code, r: 20 });
        const typed = S.pf(1, fw, 2.0, d_lin);
        const bars = [[0, 300, CODE.kw], [1, 380, CODE.fn], [1, 260, CODE.str], [0, 330, CODE.fn], [1, 220, CODE.text], [0, 160, CODE.kw]];
        bars.forEach(([ind, w, col], i) => { const q = clamp01(typed * bars.length - i); if (q > 0) { rr(360 + ind * 36, 350 + i * 36, w * q, 16, 8); ctx.fillStyle = col; ctx.fill(); } });
        const run = S.pf(1, fw + .12, .4);
        if (run > 0) alpha(run, () => { arrow(830, 450, 858, 450, 1, { color: C.green, lw: 5, head: 12 }); });
      });
      // right: tool calls one by one
      pop(1370, 440, S.pf(1, fo - .08, .5), () => {
        card(920, 230, 900, 420, { r: 28, stroke: C.red, lw: 3 });
        text('one tool call at a time', 1370, 276, { size: 32, weight: 800, color: C.red, align: 'center' });
        const yA = 350, yT = 580, prog = 14 * clamp01((t - S.at(1, fo - .05)) / (S.at(1, fs) - S.at(1, fo - .05) + .4));
        line(1040, yA, 1790, yA, C.line, 3, [4, 10]); line(1040, yT, 1790, yT, C.line, 3, [4, 10]);
        atlas(985, yA, .55, t, { mood: prog > 8 ? 'sleep' : 'think' });
        node(985, yT, 30, '', { fill: C.cfL, stroke: C.cf }); icon('tool', 985, yT, 15, C.cf);
        d_zig(1050, yA, yT, 52, 14, prog, 3);
      });
      // token meters
      const grow = clamp01((t - S.at(1, fo - .05)) / (S.at(1, fs) - S.at(1, fo - .05) + .4));
      fade(S.pf(1, fo, .4), () => {
        text('tokens', 920, 700, { size: 26, weight: 700, color: C.soft });
        rr(1030, 684, 790, 34, 17); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.stroke();
        rr(1030, 684, Math.max(34, 790 * grow), 34, 17); ctx.fillStyle = C.red; ctx.fill();
        text('tokens', 100, 700, { size: 26, weight: 700, color: C.soft });
        rr(210, 684, 670, 34, 17); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.stroke();
        rr(210, 684, 34 + 30 * grow, 34, 17); ctx.fillStyle = C.green; ctx.fill();
      }, 8);
      pop(960, 800, S.pf(1, fs, .5), () => d_iconPill('saves a huge number of tokens', 'star', 960, 800, { size: 30, fill: C.greenL, stroke: C.green, color: C.green }));
    });

    // ---- line 2: Browser Run with Live View; Sandboxes ----
    alpha(S.p(2, 0, .5), () => {
      const f = w => wordAt('hands_cf', 2, w);
      d_head('cf', 'Browser Run and Sandboxes', 1);
      const fl = f('live view'), fh = f('step in'), fs = f('Sandboxes');
      pop(590, 500, S.pf(2, .02, .5), () => {
        d_win(100, 240, 980, 520, 'hotel.example/lisbon');
        text('Casa Alfama Hotel', 140, 345, { size: 46, weight: 600, fam: SERIF });
        text('5 nights · October', 140, 398, { size: 28, weight: 600, color: C.soft });
        [['Check-in', 'Oct 12'], ['Guests', '2']].forEach(([lab, v], i) => {
          const x = 140 + i * 420;
          text(lab, x, 455, { size: 26, weight: 700, color: C.soft });
          rr(x, 476, 380, 70, 14); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = C.line; ctx.lineWidth = 2.5; ctx.stroke();
          const n = Math.floor(v.length * S.pf(2, .08 + i * .08, .5, d_lin)); text(v.slice(0, n), x + 20, 512, { size: 32, weight: 600 });
        });
        const booked = P(t, S.at(2, fh) + 1.0, .4);
        rr(140, 590, 360, 76, 18); ctx.fillStyle = booked > 0 ? C.green : C.cf; ctx.fill();
        text(booked > 0 ? 'Booked!' : 'Book room', 320, 629, { size: 32, weight: 800, color: '#fff', align: 'center' });
        // human in the loop
        const tip = S.pf(2, fh - .02, .7, eIO) * (1 - P(t, S.at(2, fh) + 1.6, .5));
        const cp = [[200, 520], [600, 520], [330, 640]], seg = clamp01(S.pf(2, .06, 2.2, d_lin)) * 2, i0 = Math.min(1, Math.floor(seg)), fr = eIO((seg - i0 - .6) / .4);
        const cur = [lerp(cp[i0][0], cp[i0 + 1][0], fr), lerp(cp[i0][1], cp[i0 + 1][1], fr)];
        alpha(1 - tip, () => { d_cursor(cur[0], cur[1], 1.4, C.blue); rr(cur[0] + 28, cur[1] + 42, 96, 36, 18); ctx.fillStyle = C.blue; ctx.fill(); text('Atlas', cur[0] + 76, cur[1] + 61, { size: 24, weight: 800, color: '#fff', align: 'center' }); });
        if (tip > 0) alpha(clamp01(tip * 2), () => { d_hand(lerp(880, 440, tip), lerp(820, 632, tip), 1.1); pop(760, 700, tip, () => pill('a human steps in', 760, 700, { size: 28, fill: C.greenL, color: C.green, shadow: false })); });
        // live view badge
        pop(930, 300, S.pf(2, fl, .5), () => {
          rr(812, 276, 246, 52, 26); ctx.fillStyle = C.red; ctx.fill();
          icon('eye', 846, 302, 16, '#fff');
          text('LIVE VIEW', 958, 303, { size: 24, weight: 800, color: '#fff', align: 'center' });
          ctx.beginPath(); ctx.arc(1034, 302, 6, 0, 7); ctx.fillStyle = Math.sin(t * 6) > 0 ? '#fff' : C.redL; ctx.fill();
        });
      });
      // sandbox terminal
      const ts = S.at(2, fs);
      pop(1480, 500, S.pf(2, fs - .02, .5), () => {
        d_term(1140, 300, 690, 400, 'Sandbox', [['uname -s', 1, ts + .2], ['Linux', 0, ts + .8], ['python3 prices.py', 1, ts + 1.0], ['✓ done', 0, ts + 1.8]], t, 28);
        pill('Linux container', 1485, 760, { size: 28, fill: C.cfL, color: C.cf });
      });
    });
  },
};

// ================= hands_vc =================
SCN.hands_vc = {
  chapter: CH.hands,
  draw(S, t) {
    // ---- line 0: mcp-handler and the AI SDK's MCP client ----
    alpha(S.p(0, 0, .5) * S.out(1, 0, .5), () => {
      const f = w => wordAt('hands_vc', 0, w);
      d_head('vc', 'Vercel', 1);
      pop(400, 440, S.p(0, .3, .5), () => {
        card(110, 250, 580, 380, { r: 28, stroke: PV.vc.col, lw: 3 });
        rr(110, 250, 580, 84, [28, 28, 0, 0]); ctx.fillStyle = PV.vc.col; ctx.fill();
        ctx.beginPath(); ctx.moveTo(160, 276); ctx.lineTo(180, 308); ctx.lineTo(140, 308); ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill();
        text('MCP server', 205, 293, { size: 34, weight: 800, color: '#fff' });
        pop(400, 390, S.pf(0, f('mcp-handler'), .5), () => pill('mcp-handler', 400, 390, { size: 30, fill: C.code, color: CODE.str, shadow: false }));
        ['search_hotels', 'book_room'].forEach((nm, i) => fade(S.pf(0, f('mcp-handler') + .05 + i * .04, .4), () => {
          const y = 480 + i * 80; rr(150, y - 32, 500, 64, 16); ctx.fillStyle = '#F2F2F2'; ctx.fill(); icon('tool', 190, y, 16, PV.vc.col); text(nm, 225, y + 1, { size: 28, weight: 700, fam: MONO });
        }, 10));
      });
      // AI SDK -> any MCP server
      const fa = f('AI SDK'), SV = [[1560, 290, 'hotels'], [1560, 450, 'flights'], [1560, 610, 'weather']];
      pop(1030, 450, S.pf(0, fa, .5), () => {
        card(880, 380, 300, 140, { r: 26, fill: PV.vc.col });
        text('AI SDK', 1030, 432, { size: 38, weight: 800, color: '#fff', align: 'center' });
        text('MCP client', 1030, 478, { size: 26, weight: 600, color: '#CFCFCF', align: 'center' });
      });
      const lp = S.pf(0, fa + .12, .6);
      if (lp > 0) {
        line(880, 450, lerp(880, 700, lp), 450, C.muted, 4, [6, 10]);
        SV.forEach(([x, y], i) => line(1180, 450, lerp(1180, x - 170, lp), lerp(450, y, lp), C.muted, 4, [6, 10]));
        if (lp >= 1) { const k = (t * .8) % 1; packet(880, 450, 700, 450, k, PV.vc.col, 8); SV.forEach(([x, y], i) => packet(1180, 450, x - 170, y, (k + i * .3) % 1, PV.vc.col, 8)); }
      }
      SV.forEach(([x, y, nm], i) => pop(x, y, S.pf(0, fa + .15 + i * .05, .5), () => {
        card(x - 170, y - 50, 340, 100, { r: 24, stroke: C.line, lw: 2.5 });
        icon('tool', x - 120, y, 18, C.soft);
        text(nm + ' MCP', x - 88, y + 1, { size: 30, weight: 700 });
      }));
      pop(960, 790, S.pf(0, f('any MCP'), .5), () => pill('AI SDK  →  any MCP server', 960, 790, { size: 30, fill: '#F2F2F2', stroke: PV.vc.col }));
    });

    // ---- line 1: Vercel Sandbox, Firecracker microVM, up to 24 h ----
    alpha(S.p(1, 0, .5) * S.out(2, 0, .5), () => {
      const f = w => wordAt('hands_vc', 1, w);
      d_head('vc', 'Vercel Sandbox', 1);
      const bx = 140, by = 262, bw = 1000, bh = 460;
      pop(bx + bw / 2, by + bh / 2, S.p(1, .05, .6), () => {
        d_glass(bx, by, bw, bh, { stroke: PV.vc.col, fill: 'rgba(232,232,232,.55)', lock: false });
        const ts = S.ls(1) + .3;
        d_term(bx + 50, by + 60, 560, 300, '', [['python3 plan.py', 1, ts], ['searching flights…', 0, ts + .9], ['✓ 3 options', 0, ts + 1.6]], t, 26);
        // untrusted code bouncing inside
        const ph = t - S.ls(1), tri = x => { const q = ((x % 2) + 2) % 2; return q < 1 ? q : 2 - q; };
        const x = bx + 680 + tri(ph * .8) * 250, y = by + 80 + tri(ph * 1.1 + .3) * 310;
        pop(x, y, S.pf(1, f('untrusted'), .5), () => { ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 5) * .3); bug(0, 0, 60, C.red); ctx.restore(); });
        pop(bx + 330, by + 400, S.pf(1, f('untrusted'), .5), () => pill('untrusted code', bx + 330, by + 400, { size: 26, fill: C.redL, color: C.red, shadow: false }));
      });
      pop(640, 262, S.pf(1, f('Firecracker'), .5), () => pill('Firecracker microVM', 640, 262, { size: 28, fill: PV.vc.col, color: '#fff' }));
      pop(1520, 450, S.pf(1, f('24 hours') - .05, .5), () => {
        const sw = S.pf(1, f('24 hours') - .05, 2.5, d_lin);
        d_watch(1520, 450, 120, Math.min(1, sw) * Math.PI * 2 * .98 + t * .2, PV.vc.col);
        pill('up to 24 h per session', 1520, 650, { size: 30, fill: '#F2F2F2', color: PV.vc.col });
        text('on the Pro plan', 1520, 720, { size: 26, weight: 600, color: C.soft, align: 'center' });
      });
    });

    // ---- line 2: the firewall injects the secret ----
    alpha(S.p(2, 0, .5) * S.out(3, 0, .5), () => {
      const f = w => wordAt('hands_vc', 2, w);
      d_head('vc', 'Secrets stay outside', 1);
      const WX = 860, GY = 480;
      // sandbox VM
      d_glass(110, 250, 600, 470, { stroke: PV.vc.col, fill: 'rgba(232,232,232,.55)', lock: false });
      text('Sandbox', 150, 300, { size: 32, weight: 800 });
      atlas(260, 450, .9, t, { mood: 'happy' });
      // empty key slot
      pop(520, 620, S.pf(2, f('never'), .5), () => {
        ctx.save(); rr(420, 580, 200, 70, 16); ctx.setLineDash([8, 8]); ctx.strokeStyle = C.red; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
        alpha(.35, () => icon('key', 520, 615, 26, C.muted));
        cross(520, 615, 40, C.red);
        text('no keys here', 520, 690, { size: 28, weight: 800, color: C.red, align: 'center' });
      });
      // firewall wall with a gate
      fade(S.p(2, .1, .5), () => {
        for (const [y0, y1] of [[250, GY - 56], [GY + 56, 720]]) {
          rr(WX - 40, y0, 80, y1 - y0, 10); ctx.fillStyle = C.orangeL; ctx.fill();
          ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
          for (let y = y0 + 36, r = 0; y < y1 - 4; y += 36, r++) { line(WX - 40, y, WX + 40, y, '#fff', 3); }
          for (let y = y0, r = 0; y < y1 - 4; y += 36, r++) { const x = WX + (r % 2 ? -12 : 14); line(x, y + 2, x, Math.min(y1, y + 34), '#fff', 3); }
          ctx.restore();
        }
        text('firewall', WX, 228, { size: 28, weight: 800, color: C.orangeD, align: 'center' });
      }, 0);
      // the secret key waits at the gate
      const kb = S.pf(2, f('injects') - .03, .5);
      pop(WX + 80, GY - 76, kb, () => { node(WX + 80, GY - 76, 32, '', { fill: C.cfY, stroke: '#fff', lw: 4 }); icon('key', WX + 80, GY - 76, 18, C.ink); });
      // requests
      const SX = 1600;
      pop(SX, 480, S.p(2, .2, .5), () => { server(SX, 470, 1.3); text('airline API', SX, 580, { size: 28, weight: 700, color: C.soft, align: 'center' }); });
      if (kb > 0) {
        for (let k = 0; k < 3; k++) {
          const u = ((t - S.at(2, f('injects'))) * .35 + k / 3) % 1; if (t < S.at(2, f('injects'))) break;
          const x = lerp(360, SX - 90, u), keyed = x > WX + 10;
          const y = GY + (x < WX - 60 ? (1 - (x - 360) / (WX - 420)) * -30 : 0);
          rr(x - 34, y - 24, 68, 48, 8); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = PV.vc.col; ctx.lineWidth = 3; ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x - 31, y - 21); ctx.lineTo(x, y + 3); ctx.lineTo(x + 31, y - 21); ctx.stroke();
          if (keyed) { node(x + 38, y - 28, 22, '', { fill: C.cfY, stroke: '#fff', lw: 3 }); icon('key', x + 38, y - 28, 13, C.ink); }
        }
      }
      pop(1240, 360, S.pf(2, f('injects') + .06, .5), () => pill('secret injected at the firewall', 1240, 360, { size: 28, fill: C.cfL, color: C.orangeD }));
    });

    // ---- line 3: no managed browser; Vercel Connect tokens ----
    alpha(S.p(3, 0, .5), () => {
      const f = w => wordAt('hands_vc', 3, w);
      d_head('vc', 'Browsers and connections', 1);
      // left: no managed browser
      pop(500, 300, S.p(3, .1, .5), () => {
        ctx.save(); rr(230, 240, 540, 110, 24); ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fill(); ctx.setLineDash([12, 10]); ctx.strokeStyle = C.muted; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
        icon('browser', 290, 295, 26, C.muted); line(268, 318, 312, 272, C.red, 5);
        text('no managed browser', 340, 296, { size: 32, weight: 800, color: C.soft });
      });
      [['browser inside Sandbox', 'box', f('inside Sandbox'), 100], ['Browserbase', 'browser', f('Browserbase'), 520]].forEach(([nm, ic, fr, x], i) => {
        const p = S.pf(3, fr - .02, .5);
        if (p > 0) arrow(500, 360, lerp(500, x + 190, p), lerp(360, 470, p), 1, { color: C.muted, lw: 5 });
        pop(x + 190, 560, p, () => {
          card(x, 480, 380, 170, { r: 26, stroke: PV.vc.col, lw: 3 });
          icon(ic, x + 190, 530, 26, PV.vc.col);
          text(nm, x + 190, 590, { size: nm.length > 14 ? 28 : 32, weight: 800, align: 'center' });
          if (i) text('from the Marketplace', x + 190, 625, { size: 24, weight: 600, color: C.soft, align: 'center' });
        });
      });
      // right: Vercel Connect hands out short-lived tokens
      const fc = f('Vercel Connect'), CX = 1410;
      pop(CX, 300, S.pf(3, fc, .5), () => {
        card(CX - 270, 240, 540, 120, { r: 28, fill: PV.vc.col });
        ctx.beginPath(); ctx.moveTo(CX - 200, 278); ctx.lineTo(CX - 176, 318); ctx.lineTo(CX - 224, 318); ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill();
        text('Vercel Connect', CX + 30, 300, { size: 38, weight: 800, color: '#fff', align: 'center' });
      });
      fade(S.pf(3, fc + .05, .4), () => text('short-lived tokens', CX, 420, { size: 28, weight: 700, color: C.soft, align: 'center' }), 8);
      [['Slack', f('Slack'), C.purple], ['GitHub', f('GitHub'), C.ink], ['+100', f('hundred'), C.acc]].forEach(([nm, fr, col], i) => {
        const x = CX - 300 + i * 300, y = 640, dp = S.pf(3, fr, .5);
        pop(x, y, dp, () => { card(x - 120, y - 50, 240, 100, { r: 24, stroke: C.line, lw: 2.5 }); node(x - 70, y, 18, '', { fill: col, stroke: col }); text(nm, x - 40, y + 1, { size: 32, weight: 800 }); });
        // a token flies down, then fades away (short-lived)
        const tt0 = S.at(3, fr) - .1, u = (t - tt0) / 1.0;
        if (u > 0 && u < 3.2) {
          const e = eIO(Math.min(1, u)), tx = lerp(CX, x, e), ty = lerp(370, y - 90, e), life = clamp01(1 - (u - 1) / 2.2);
          alpha(u < 1 ? 1 : life, () => {
            rr(tx - 58, ty - 25, 116, 50, 25); ctx.fillStyle = C.cfY; ctx.fill();
            icon('key', tx - 20, ty, 16, C.ink);
            ctx.beginPath(); ctx.moveTo(tx + 30, ty); ctx.arc(tx + 30, ty, 15, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * life); ctx.closePath(); ctx.fillStyle = C.ink; ctx.fill();
          });
        }
      });
    });
  },
};

// ================= hands_aws =================
const D_TOOLNAMES = ['search_hotels', 'book_room', 'get_fares', 'check_visa', 'convert_currency'];
SCN.hands_aws = {
  chapter: CH.hands,
  draw(S, t) {
    // ---- line 0: AgentCore Gateway turns APIs + Lambdas into MCP tools, with search ----
    alpha(S.p(0, 0, .5) * S.out(1, 0, .5), () => {
      const f = w => wordAt('hands_aws', 0, w);
      d_head('aws', 'AgentCore Gateway', 1);
      const IN = [['API', 'globe', f('APIs')], ['API', 'globe', f('APIs') + .03], ['Lambda', 'code', f('Lambda')], ['Lambda', 'code', f('Lambda') + .03]];
      const GX0 = 560, GX1 = 920, GY = 460;
      IN.forEach(([nm, ic, fr], i) => {
        const y = 290 + i * 120, p = S.pf(0, fr, .5);
        pop(250, y, p, () => { card(100, y - 44, 300, 88, { r: 20, stroke: PV.aws.col, lw: 2.5 }); rr(116, y - 30, 60, 60, 14); ctx.fillStyle = PV.aws.light; ctx.fill(); if (nm === 'Lambda') text('λ', 146, y + 2, { size: 38, weight: 700, fam: SERIF, color: PV.aws.smile, align: 'center' }); else icon(ic, 146, y, 18, PV.aws.col); text(nm, 196, y + 1, { size: 30, weight: 700, color: PV.aws.ink }); });
        if (p >= 1) { line(400, y, GX0, GY, C.line, 4); packet(400, y, GX0, GY, (t * .7 + i * .25) % 1, PV.aws.smile, 7); }
      });
      pop((GX0 + GX1) / 2, GY, S.pf(0, f('AgentCore Gateway'), .5), () => {
        card(GX0, GY - 120, GX1 - GX0, 240, { r: 28, fill: PV.aws.col });
        text('AgentCore', 740, GY - 30, { size: 38, weight: 800, color: '#fff', align: 'center' });
        text('Gateway', 740, GY + 18, { size: 38, weight: 800, color: '#fff', align: 'center' });
        ctx.save(); ctx.strokeStyle = PV.aws.smile; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(660, GY + 64); ctx.quadraticCurveTo(740, GY + 92, 820, GY + 64); ctx.stroke(); ctx.restore();
      });
      // MCP tools pile up into a big grid
      const fm = f('MCP tools'), gp = S.pf(0, fm, 2.4, d_lin), GX = 1060, GYT = 330, NC = 20, NR = 11;
      if (gp > 0) { line(GX1, GY, GX - 10, GY, C.line, 4); packet(GX1, GY, GX - 10, GY, (t * 1.2) % 1, PV.aws.smile, 8); }
      const fs = f('search'), sp = S.pf(0, fs, .5), pick = [7, 5];
      for (let r = 0; r < NR; r++) for (let c = 0; c < NC; c++) {
        const a = clamp01((gp * 1.3 - (c + r * .5) / (NC + NR * .5)) * 5); if (a <= 0) continue;
        const hit = c === pick[0] && r === pick[1];
        alpha(a * (hit ? 1 : 1 - .6 * sp), () => { rr(GX + c * 36, GYT + r * 32, 30, 26, 6); ctx.fillStyle = hit && sp > 0 ? C.green : (c + r) % 3 ? PV.aws.light : '#C9D3E2'; ctx.fill(); });
      }
      fade(S.pf(0, fm, .4), () => text('MCP tools', GX, GYT - 26, { size: 28, weight: 800, color: PV.aws.ink }), 8);
      fade(S.pf(0, fm + .05, .4) * (1 - sp), () => text('hundreds of tools', GX + 360, GYT + NR * 32 + 40, { size: 30, weight: 800, color: PV.aws.ink, align: 'center' }), 0);
      // search box finds one
      pop(1420, 770, sp, () => {
        card(1100, 736, 440, 68, { r: 34, stroke: PV.aws.col, lw: 3 });
        icon('search', 1142, 770, 18, PV.aws.col);
        const q = 'book a room', n = Math.floor(q.length * S.pf(0, fs + .03, 1.0, d_lin));
        text(q.slice(0, n), 1172, 771, { size: 28, weight: 600 });
        if (Math.sin(t * 8) > 0 && n < q.length) { ctx.fillStyle = C.ink; ctx.fillRect(1176 + measure(q.slice(0, n), 28, 600), 754, 3, 32); }
      });
      const res = P(t, S.at(0, fs) + 1.2, .5);
      if (res > 0) { const hx = GX + pick[0] * 36 + 15, hy = GYT + pick[1] * 32 + 13; line(hx, hy, 1680, 770, C.green, 3, [4, 8]); }
      pop(1690, 770, res, () => pill('book_room', 1690, 770, { size: 26, fill: C.greenL, color: C.green }));
    });

    // ---- line 1: Code Interpreter + AgentCore Browser ----
    alpha(S.p(1, 0, .5) * S.out(2, 0, .5), () => {
      const f = w => wordAt('hands_aws', 1, w);
      d_head('aws', 'Run code, browse the web', 1);
      pop(500, 505, S.pf(1, 0, .5), () => {
        card(100, 230, 800, 550, { r: 28, stroke: PV.aws.col, lw: 3 });
        icon('code', 150, 284, 20, PV.aws.col);
        text('Code Interpreter', 185, 285, { size: 36, weight: 800, color: PV.aws.ink });
        badge('sandbox', 860, 268, { align: 'right', size: 20, fill: C.accL, color: C.acc });
        pop(210, 355, S.pf(1, f('Python'), .4), () => pill('Python', 210, 355, { size: 28, fill: PV.aws.light, color: PV.aws.ink, shadow: false }));
        pop(390, 355, S.pf(1, f('JavaScript'), .4), () => pill('JavaScript', 390, 355, { size: 28, fill: PV.aws.light, color: PV.aws.ink, shadow: false }));
        const tp = S.at(1, f('Python')), tj = S.at(1, f('JavaScript'));
        d_term(140, 410, 720, 330, '', [['python3 fares.py', 1, tp + .1], ['✓ cheapest week found', 0, tp + .8], ['node plan.js', 1, tj + .3], ['✓ itinerary built', 0, tj + 1.0]], t, 26);
      });
      const fb = f('AgentCore Browser');
      pop(1360, 505, S.pf(1, fb, .5), () => {
        card(920, 230, 900, 550, { r: 28, stroke: PV.aws.col, lw: 3 });
        icon('browser', 970, 284, 20, PV.aws.col);
        text('AgentCore Browser', 1005, 285, { size: 36, weight: 800, color: PV.aws.ink });
        d_win(970, 340, 800, 400, 'hotels.example');
        // a simple Chrome-like glyph and page content
        const cx = 1060, cy = 460;
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * .8);
        [C.red, C.cfY, C.green].forEach((c, i) => { ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 44, i * 2.094, (i + 1) * 2.094); ctx.closePath(); ctx.fillStyle = c; ctx.fill(); });
        ctx.restore(); ctx.beginPath(); ctx.arc(cx, cy, 20, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.beginPath(); ctx.arc(cx, cy, 14, 0, 7); ctx.fillStyle = C.blue; ctx.fill();
        for (let k = 0; k < 3; k++) { rr(1140, 430 + k * 34, 480 - k * 90, 18, 9); ctx.fillStyle = '#E6DFD3'; ctx.fill(); }
        const sc = ((t * 40) % 60);
        for (let k = 0; k < 3; k++) { rr(1010 + k * 250, 560 - sc * .2, 220, 130, 14); ctx.fillStyle = [C.blueL, C.cfL, C.greenL][k]; ctx.fill(); }
        pop(1370, 740, S.pf(1, f('managed Chrome'), .5), () => pill('managed Chrome', 1370, 740, { size: 30, fill: PV.aws.col, color: '#fff' }));
      });
    });

    // ---- line 2: Nova Act clicks through a site; AWS MCP Server ----
    alpha(S.p(2, 0, .5), () => {
      const f = w => wordAt('hands_aws', 2, w);
      d_head('aws', 'Nova Act and the AWS MCP Server', 1);
      const fc = f('clicking'), T = S.ls(2);
      pop(560, 500, S.pf(2, 0, .5), () => {
        d_win(100, 240, 920, 520, 'hotel.example/book');
        text('Book your stay in Lisbon', 140, 340, { size: 42, weight: 600, fam: SERIF });
        const tf = [S.at(2, fc) - .4, S.at(2, fc) + .5, S.at(2, fc) + 1.4];
        [['Check-in', 'Oct 12', 140, 420], ['Nights', '5', 560, 420]].forEach(([lab, v, x, y], i) => {
          text(lab, x, y, { size: 26, weight: 700, color: C.soft });
          rr(x, y + 22, 380, 70, 14); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = t > tf[i] && t < tf[i] + .9 ? C.purple : C.line; ctx.lineWidth = 3; ctx.stroke();
          const n = Math.floor(v.length * P(t, tf[i] + .15, .5, d_lin)); text(v.slice(0, n), x + 20, y + 58, { size: 32, weight: 600 });
        });
        const booked = P(t, tf[2] + .2, .4);
        rr(140, 570, 380, 78, 18); ctx.fillStyle = booked > 0 ? C.green : C.cf; ctx.fill();
        text(booked > 0 ? 'Booked!' : 'Book room', 330, 610, { size: 32, weight: 800, color: '#fff', align: 'center' });
        if (booked > 0) pop(700, 610, booked, () => { check(580, 610, 34, C.green); text('5 nights, Oct 12', 610, 611, { size: 30, weight: 700, color: C.green }); });
        // Nova Act's cursor
        const pts = [[820, 720], [330, 478], [760, 478], [330, 612]];
        const cx = d_kf(t, [[T + .3, pts[0][0]], [tf[0], pts[1][0]], [tf[1], pts[2][0]], [tf[2], pts[3][0]]]);
        const cy = d_kf(t, [[T + .3, pts[0][1]], [tf[0], pts[1][1]], [tf[1], pts[2][1]], [tf[2], pts[3][1]]]);
        tf.forEach(tt => { const cl = (t - tt) / .5; if (cl > 0 && cl < 1) { ctx.beginPath(); ctx.arc(cx, cy, 8 + cl * 30, 0, 7); ctx.strokeStyle = `rgba(138,111,209,${1 - cl})`; ctx.lineWidth = 4; ctx.stroke(); } });
        d_cursor(cx, cy, 1.4, C.purple);
        rr(cx + 30, cy + 44, 136, 38, 19); ctx.fillStyle = C.purple; ctx.fill();
        text('Nova Act', cx + 98, cy + 64, { size: 24, weight: 800, color: '#fff', align: 'center' });
      });
      // AWS MCP Server
      const fm = f('AWS MCP Server'), fk = f('fifteen thousand');
      pop(1440, 500, S.pf(2, fm, .5), () => {
        card(1080, 250, 740, 500, { r: 30, stroke: PV.aws.col, lw: 3 });
        rr(1080, 250, 740, 100, [30, 30, 0, 0]); ctx.fillStyle = PV.aws.col; ctx.fill();
        text('aws', 1145, 294, { size: 30, weight: 800, color: '#fff', align: 'center' });
        ctx.save(); ctx.strokeStyle = PV.aws.smile; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(1123, 311); ctx.quadraticCurveTo(1145, 323, 1167, 311); ctx.stroke(); ctx.restore();
        text('AWS MCP Server', 1210, 301, { size: 36, weight: 800, color: '#fff' });
        d_wall(1120, 390, 19, 5, 36, 26, S.pf(2, fm, 2.0, d_lin), 17, [PV.aws.smile, PV.aws.light, '#EEF1F6']);
        const n = 15000 * S.pf(2, fk - .03, 1.4, eOut);
        fade(S.pf(2, fk - .05, .4), () => { text(d_num(n) + '+', 1450, 600, { size: 72, weight: 600, fam: SERIF, color: PV.aws.ink, align: 'center' }); text('AWS APIs', 1450, 660, { size: 30, weight: 700, color: C.soft, align: 'center' }); }, 8);
        pop(1450, 718, S.pf(2, f('free'), .4), () => pill('free', 1450, 712, { size: 30, fill: C.green, color: '#fff', shadow: false }));
      });
    });
  },
};

// ================= quiz2 =================
const D_QUIZ = [['Vercel Blob', 'file', 'files'], ['Vercel Sandbox', 'box', 'isolated microVM'], ['Global Config', 'gear', 'settings'], ['Cron Jobs', 'clock', 'schedules']];
SCN.quiz2 = {
  chapter: CH.hands,
  guide: (S, t) => ({ look: [{ t0: S.ls(0) + .5, t1: S.le(0) }], happy: S.p(1, .1) > 0 ? 1 : 0, hops: [S.ls(1) + .1] }),
  draw(S, t) {
    pop(960, 160, S.p(0, .05, .7), () => {
      card(640, 108, 640, 104, { r: 52, fill: C.acc });
      text('Quick check!', 960, 162, { size: 60, weight: 700, fam: SERIF, color: '#fff', align: 'center' });
      for (const [x, y, s, ph] of [[600, 130, 22, 0], [1320, 190, 26, 1.5], [1350, 115, 16, 3]]) { ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 2 + ph) * .3); icon('star', 0, 0, s, C.cfY); ctx.restore(); }
    });
    fade(S.pf(0, .1, .6), () => {
      // a freshly written Python script
      ctx.save(); ctx.translate(250, 320); ctx.rotate(-.1);
      card(-60, -74, 120, 148, { r: 14, fill: C.code });
      for (let k = 0; k < 4; k++) { rr(-40, -44 + k * 24, [70, 50, 80, 40][k], 12, 6); ctx.fillStyle = [CODE.kw, CODE.fn, CODE.str, CODE.text][k]; ctx.fill(); }
      rr(-72, 40, 70, 30, 8); ctx.fillStyle = C.blue; ctx.fill(); text('.py', -37, 56, { size: 22, weight: 800, color: '#fff', align: 'center' });
      ctx.restore();
      const cw = provChip('vc', 370, 290, { size: 28 });
      text('Atlas must safely run a Python script', 370 + cw + 18, 291, { size: 38, weight: 600 });
      text('that the model just wrote.', 370, 352, { size: 38, weight: 600 });
    }, 14);
    fade(S.pf(0, .8, .5), () => text('Which service?', 370 + measure('that the model just wrote.', 38, 600) + 22, 352, { size: 38, weight: 800, color: C.acc }), 10);
    // answer cards
    const win = S.p(1, 0, .5);
    D_QUIZ.forEach(([name, ic, use], i) => {
      const x = 150 + i * 420, y = 430 + Math.sin(t * 2 + i) * 3, right = i === 1;
      pop(x + 180, y + 130, S.pf(0, .5 + i * .07, .5), () => {
        alpha(right ? 1 : 1 - .35 * win, () => {
          card(x, y, 360, 260, { r: 28, fill: right && win > 0 ? C.greenL : '#fff', stroke: right && win > 0 ? C.green : C.line, lw: right ? 3 + 3 * win : 3 });
          node(x + 38, y + 38, 20, 'ABCD'[i], { fill: C.bg, stroke: C.line, size: 20, color: C.soft });
          node(x + 180, y + 88, 52, '', { fill: right && win > 0 ? '#fff' : '#F2F2F2', stroke: 'transparent' });
          icon(ic, x + 180, y + 88, 30, right && win > 0 ? C.green : PV.vc.col);
          text(name, x + 180, y + 172, { size: name.length > 12 ? 36 : 40, weight: 800, align: 'center' });
          fade(S.pf(1, right ? .12 : .02 + i * .03, .5), () => text(use, x + 180, y + 222, { size: 26, weight: 700, color: right ? C.green : C.soft, align: 'center' }), 8);
        });
        if (right) pop(x + 330, y + 30, win, () => { node(x + 330, y + 30, 34, '', { fill: C.green, stroke: '#fff', lw: 4 }); check(x + 330, y + 30, 34, '#fff'); });
      });
    });
    confetti(t, S.ls(1), 11, 150 + 420 + 180, 430, 90);
    // countdown during the hold after line 0
    const cs = S.le(0), ce = S.ls(1) - .1, cp = (t - cs) / (ce - cs);
    pop(960, 780, P(t, cs - .2, .4) * (1 - P(t, S.ls(1), .3)), () => countdown(960, 780, 52, cp));
    // the other clouds' equivalents
    const cf = wordAt('quiz2', 1, 'Cloudflare'), aw = wordAt('quiz2', 1, 'AWS');
    const chip = (k, s, cx, p) => pop(cx, 790, p, () => {
      const w = measure(s, 30, 800) + 96;
      card(cx - w / 2, 760, w, 60, { r: 30, fill: PV[k].light, shadow: false });
      logo(k, cx - w / 2 + 40, 790, .45);
      text(s, cx - w / 2 + 76, 791, { size: 30, weight: 800, color: PV[k].ink });
    });
    chip('cf', 'Cloudflare: Sandboxes', 620, S.pf(1, cf, .5));
    chip('aws', 'AWS: Code Interpreter', 1300, S.pf(1, aw, .5));
  },
};
