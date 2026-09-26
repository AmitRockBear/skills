// ---------- scenes for part B: code, code_vc, code_aws, code_mix, brain, brain_cf, brain_vc, brain_aws ----------
// Local helpers use the b_ prefix.

const b_ramp = x => Math.max(0, x);   // linear ramp for code reveals: runs past 1 so the cursor hides when done
const b_title = (s, y = 160) => text(s, W / 2, y, { size: 54, weight: 600, fam: SERIF, align: 'center' });
// Title with the provider's logo on its left and an optional status badge on its right.
function b_head(k, s, o = {}) {
  const y = o.y ?? 160, tw = measure(s, 54, 600, SERIF), lw = 92, gap = 24, x0 = W / 2 - (lw + gap + tw) / 2;
  logo(k, x0 + lw / 2, y - 2, .82);
  text(s, x0 + lw + gap, y, { size: 54, weight: 600, fam: SERIF });
  if (o.badge) badge(o.badge, x0 + lw + gap + tw + 20, y - 17, { size: 22 });
}
// One line of syntax-coloured code, left-aligned at x.
function b_codeLine(s, x, y, size = 28) {
  ctx.font = font(size, 500, MONO); const cw = ctx.measureText('M').width;
  for (const [tk, col] of tokens(s)) { text(tk, x, y, { size, weight: 500, fam: MONO, color: col }); x += tk.length * cw; }
}
// Circular arrow (open ring with an arrowhead), rotated by angle a.
function b_spin(x, y, r, a, col, lw = 6) {
  ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(x, y, r, a, a + Math.PI * 1.6); ctx.stroke();
  const ea = a + Math.PI * 1.6, ex = x + Math.cos(ea) * r, ey = y + Math.sin(ea) * r, ta = ea + Math.PI / 2, h = r * .38;
  ctx.beginPath(); ctx.moveTo(ex + Math.cos(ta) * h, ey + Math.sin(ta) * h); ctx.lineTo(ex + Math.cos(ta + 2.3) * h, ey + Math.sin(ta + 2.3) * h); ctx.lineTo(ex + Math.cos(ta - 2.3) * h, ey + Math.sin(ta - 2.3) * h); ctx.closePath(); ctx.fill();
  ctx.restore();
}
// think -> act -> observe loop. o.p: per-node pop progress; a packet circles and lights the node it passes.
function b_loop(cx, cy, r, t, o = {}) {
  const labs = [['think', 'brain'], ['act', 'hand'], ['observe', 'eye']], col = o.color || C.acc, ps = o.p || [1, 1, 1], ang = i => -Math.PI / 2 + i * Math.PI * 2 / 3;
  ctx.save(); ctx.strokeStyle = col + '44'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke(); ctx.restore();
  for (let i = 0; i < 3; i++) {
    const a = ang(i + .5), x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r, ta = a + Math.PI / 2;
    ctx.beginPath(); ctx.moveTo(x + Math.cos(ta) * 16, y + Math.sin(ta) * 16); ctx.lineTo(x + Math.cos(ta + 2.4) * 16, y + Math.sin(ta + 2.4) * 16); ctx.lineTo(x + Math.cos(ta - 2.4) * 16, y + Math.sin(ta - 2.4) * 16); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
  }
  const pa = -Math.PI / 2 + t * (o.speed || 1.8), run = Math.min(...ps) >= 1;
  if (run) packet(cx + Math.cos(pa) * r, cy + Math.sin(pa) * r, cx + Math.cos(pa) * r, cy + Math.sin(pa) * r, .5, col, 11);
  labs.forEach(([s, ic], i) => {
    const a = ang(i), x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
    const d = Math.abs(Math.atan2(Math.sin(pa - a), Math.cos(pa - a))), hot = run && d < .45 ? 1 - d / .45 : 0;
    pop(x, y, ps[i], () => {
      node(x, y, 48 + 6 * hot, '', { fill: hot > .2 ? col : '#fff', stroke: col, lw: 4 });
      icon(ic, x, y, 22, hot > .2 ? '#fff' : col);
      text(s, x, i === 0 ? y - 80 : y + 82, { size: 28, weight: 800, color: col, align: 'center' });
    });
  });
}
// Air-traffic control tower (the gateway metaphor); cab centred at (x, y), base at y + 260*s.
function b_tower(x, y, t, s = 1, col = C.cf, light = C.cfL) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-36, 40); ctx.lineTo(36, 40); ctx.lineTo(56, 240); ctx.lineTo(-56, 240); ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = C.line; ctx.lineWidth = 3; ctx.stroke();
  for (let i = 0; i < 4; i++) { ctx.fillStyle = light; ctx.fillRect(-40 - i * 4, 70 + i * 44, 80 + i * 8, 16); }
  rr(-90, 240, 180, 20, 8); ctx.fillStyle = C.soft; ctx.fill();
  line(0, -60, 0, -96, C.ink, 5);
  const a = t * 2.2; ctx.save(); ctx.globalAlpha *= .25; ctx.beginPath(); ctx.moveTo(0, -96); ctx.arc(0, -96, 90, a, a + .6); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.restore();
  ctx.beginPath(); ctx.arc(0, -96, 9, 0, 7); ctx.fillStyle = col; ctx.fill();
  rr(-80, -64, 160, 26, 10); ctx.fillStyle = C.ink; ctx.fill();
  card(-110, -40, 220, 80, { r: 18, fill: col });
  rr(-94, -26, 188, 34, 8); ctx.fillStyle = '#EAF0FC'; ctx.fill();
  for (let i = 1; i < 4; i++) line(-94 + i * 47, -26, -94 + i * 47, 8, col, 3);
  ctx.restore();
}
// A packet moving along a polyline; p in 0..1
function b_path(pts, p, color = C.cf, r = 11) {
  if (p <= 0 || p >= 1) return;
  const seg = []; let total = 0;
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); total += d; }
  let d = p * total;
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i]) { const f = d / seg[i], x = lerp(pts[i][0], pts[i + 1][0], f), y = lerp(pts[i][1], pts[i + 1][1], f); packet(x, y, x, y, .5, color, r); return; }
    d -= seg[i];
  }
}
function b_gpu(x, y, s, core = C.cf) {
  const r = 18 * s;
  ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 3 * s; ctx.lineCap = 'round';
  for (let k = -1; k <= 1; k++) {
    const d = k * r * .55; ctx.beginPath();
    ctx.moveTo(x + d, y - r); ctx.lineTo(x + d, y - r - 7 * s); ctx.moveTo(x + d, y + r); ctx.lineTo(x + d, y + r + 7 * s);
    ctx.moveTo(x - r, y + d); ctx.lineTo(x - r - 7 * s, y + d); ctx.moveTo(x + r, y + d); ctx.lineTo(x + r + 7 * s, y + d); ctx.stroke();
  }
  rr(x - r, y - r, 2 * r, 2 * r, 5 * s); ctx.fillStyle = C.ink; ctx.fill();
  rr(x - r * .5, y - r * .5, r, r, 3 * s); ctx.fillStyle = core; ctx.fill();
  ctx.restore();
}
function b_wallet(x, y, s) {
  rr(x - 70 * s, y - 45 * s, 140 * s, 95 * s, 16 * s); ctx.fillStyle = C.orangeD; ctx.fill();
  rr(x - 70 * s, y - 60 * s, 120 * s, 30 * s, 10 * s); ctx.fillStyle = C.orange; ctx.fill();
  rr(x + 20 * s, y - 10 * s, 60 * s, 36 * s, 10 * s); ctx.fillStyle = C.orange; ctx.fill();
  ctx.beginPath(); ctx.arc(x + 44 * s, y + 8 * s, 8 * s, 0, 7); ctx.fillStyle = C.cfY; ctx.fill();
}
// Power plug pointing down: body centred at (x, y), cable up, prongs below (to y + 80*s).
function b_plug(x, y, s, label, col = C.cf) {
  line(x, y - 40 * s, x, y - 95 * s, C.soft, 12 * s);
  ctx.fillStyle = '#BDB5A8'; for (const dx of [-30, 30]) { rr(x + dx * s - 8 * s, y + 38 * s, 16 * s, 42 * s, 5 * s); ctx.fill(); }
  card(x - 130 * s, y - 45 * s, 260 * s, 90 * s, { r: 26 * s, fill: col });
  text(label, x, y + 1, { size: 40 * s, weight: 700, color: '#fff', align: 'center', fam: MONO });
}
// Analog clock face with hour/minute hand angles in radians (0 = 12 o'clock).
function b_clock(x, y, r, ha, ma, rim = C.cf) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = r * .1; ctx.strokeStyle = rim; ctx.stroke();
  ctx.fillStyle = C.muted; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ctx.beginPath(); ctx.arc(x + Math.sin(a) * r * .78, y - Math.cos(a) * r * .78, r * .045, 0, 7); ctx.fill(); }
  ctx.save(); ctx.strokeStyle = C.ink; ctx.lineCap = 'round';
  ctx.lineWidth = r * .08; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.sin(ha) * r * .45, y - Math.cos(ha) * r * .45); ctx.stroke();
  ctx.lineWidth = r * .05; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.sin(ma) * r * .68, y - Math.cos(ma) * r * .68); ctx.stroke();
  ctx.restore();
  ctx.beginPath(); ctx.arc(x, y, r * .07, 0, 7); ctx.fillStyle = rim; ctx.fill();
}
// Alarm clock with bells; hours = clock time in hours (drives both hands); ring 0..1 shakes it.
function b_alarm(x, y, r, t, hours, ring = 0, col = C.cf) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ring * Math.sin(t * 45) * .12); ctx.translate(-x, -y);
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(x + sx * r * .62, y - r * .78, r * .3, 0, 7); ctx.fillStyle = col; ctx.fill(); }
  line(x - r * .5, y + r * .86, x - r * .72, y + r * 1.18, C.ink, r * .09); line(x + r * .5, y + r * .86, x + r * .72, y + r * 1.18, C.ink, r * .09);
  b_clock(x, y, r, hours / 12 * Math.PI * 2, hours * Math.PI * 2, col);
  ctx.restore();
  if (ring > 0) alpha(ring, () => {
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) { const a = -Math.PI / 2 + sx * (.5 + k * .35); ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r * 1.38, y + Math.sin(a) * r * 1.38); ctx.lineTo(x + Math.cos(a) * r * 1.68, y + Math.sin(a) * r * 1.68); ctx.stroke(); }
    ctx.restore();
  });
}
// Pill with a leading icon.
function b_iconPill(s, ic, cx, cy, o = {}) {
  const size = o.size || 30, tw = measure(s, size, 700), w = tw + size * 2.6, h = size * 1.9;
  card(cx - w / 2, cy - h / 2, w, h, { r: h / 2, fill: o.fill || '#fff', stroke: o.stroke || C.line, lw: 3, shadow: o.shadow });
  icon(ic, cx - w / 2 + size * 1.05, cy, size * .5, o.color || C.ink);
  text(s, cx - w / 2 + size * 1.9, cy + 1, { size, weight: 700, color: o.color || C.ink });
  return w;
}
// A labelled feature tile with an icon well.
function b_tile(x, y, w, h, label, ic, color) {
  card(x, y, w, h, { r: 22, stroke: color, lw: 3 });
  rr(x + 14, y + 14, h - 28, h - 28, 14); ctx.fillStyle = color + '22'; ctx.fill();
  icon(ic, x + 14 + (h - 28) / 2, y + h / 2, (h - 28) * .34, color);
  text(label, x + h + 4, y + h / 2 + 1, { size: 30, weight: 700 });
}
// Model / provider chip: fixed-width card, icon well on the left, name after it. Centred at (cx, cy).
function b_chip(name, cx, cy, w, h, o = {}) {
  const col = o.color || PV.aws.col;
  card(cx - w / 2, cy - h / 2, w, h, { r: 18, stroke: o.stroke || C.line, lw: o.lw || 2.5, fill: o.fill });
  node(cx - w / 2 + h / 2, cy, h * .32, '', { fill: o.well || PV.aws.light, stroke: o.well || PV.aws.light });
  icon(o.icon || 'brain', cx - w / 2 + h / 2, cy, h * .17, col);
  text(name, cx - w / 2 + h * .98, cy + 1, { size: o.size || 30, weight: 800, color: o.ink || C.ink, fam: o.fam || SANS });
}
// Dashed "inside AWS" boundary with marching ants and a logo tab.
function b_boundary(x, y, w, h, t, label = 'inside AWS') {
  rr(x, y, w, h, 30); ctx.fillStyle = 'rgba(225,231,240,.5)'; ctx.fill();
  ctx.save(); ctx.setLineDash([18, 12]); ctx.lineDashOffset = -t * 30; ctx.lineWidth = 5; ctx.strokeStyle = PV.aws.col; rr(x, y, w, h, 30); ctx.stroke(); ctx.restore();
  const tw = measure(label, 24, 800) + 112;
  card(x + 36, y - 25, tw, 50, { r: 25, stroke: PV.aws.col, lw: 3, shadow: false });
  logo('aws', x + 36 + 44, y + 1, .42);
  text(label, x + 36 + 86, y + 1, { size: 24, weight: 800, color: PV.aws.col });
}
// Price tag pointing right, centred at (cx, cy).
function b_tag(s, cx, cy, o = {}) {
  const size = o.size || 44, w = measure(s, size, 800) + size * 2, h = size * 2;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(o.rot ?? -.08);
  ctx.save(); ctx.shadowColor = 'rgba(70,45,20,0.16)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 8;
  ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2 + 14); ctx.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + 14, -h / 2); ctx.lineTo(w / 2 - h / 2, -h / 2); ctx.lineTo(w / 2, 0); ctx.lineTo(w / 2 - h / 2, h / 2); ctx.lineTo(-w / 2 + 14, h / 2); ctx.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - 14); ctx.closePath();
  ctx.fillStyle = o.fill || C.green; ctx.fill(); ctx.restore();
  ctx.beginPath(); ctx.arc(w / 2 - h * .42, 0, h * .1, 0, 7); ctx.fillStyle = C.bg; ctx.fill();
  text(s, -h * .25, 2, { size, weight: 800, color: '#fff', align: 'center' });
  ctx.restore();
}
function b_folder(x, y, s, color = C.cfY) {
  ctx.save(); ctx.translate(x, y);
  rr(-50 * s, -36 * s, 44 * s, 22 * s, 6 * s); ctx.fillStyle = color; ctx.fill();
  rr(-50 * s, -26 * s, 100 * s, 66 * s, 8 * s); ctx.fill();
  rr(-50 * s, -14 * s, 100 * s, 54 * s, 8 * s); ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fill();
  ctx.restore();
}
// Two intertwined strands with rungs (Strands Agents), drawn left to right up to progress p.
function b_strands(x0, x1, cy, amp, t, p = 1) {
  const xe = lerp(x0, x1, clamp01(p)), ph = t * 2.2, f = x => (x - x0) / 70;
  ctx.save(); ctx.lineCap = 'round';
  for (let x = x0; x <= xe; x += 26) { const a = Math.sin(f(x) + ph) * amp; line(x, cy - a, x, cy + a, C.line, 5); }
  [[PV.aws.col, 0], [PV.aws.smile, Math.PI]].forEach(([col, o]) => {
    ctx.strokeStyle = col; ctx.lineWidth = 12; ctx.beginPath();
    for (let x = x0; x <= xe; x += 6) { const y = cy + Math.sin(f(x) + ph + o) * amp; x === x0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
    ctx.stroke();
  });
  ctx.restore();
}
// Globe with dotted land grid; returns proj(lat, lon) -> [x, y, z].
const B_CITIES = [[35.7, 139.7], [38.7, -9.1], [40.7, -74], [-23.5, -46.6], [51.5, -.1], [6.5, 3.4], [19, 72.8], [1.3, 103.8], [-33.9, 151.2], [37.8, -122.4], [-26.2, 28], [50.1, 8.7], [25.2, 55.3], [19.4, -99.1], [37.6, 127], [41.9, 12.5], [30, 31.2], [55.8, 37.6], [-1.3, 36.8], [45.5, -73.6]];
function b_globe(cx, cy, R, lon0) {
  const tilt = .35, rad = Math.PI / 180;
  const proj = (lat, lon) => {
    const la = lat * rad, lo = (lon - lon0) * rad;
    const x = Math.cos(la) * Math.sin(lo), y0 = Math.sin(la), z0 = Math.cos(la) * Math.cos(lo);
    const y = y0 * Math.cos(tilt) - z0 * Math.sin(tilt), z = y0 * Math.sin(tilt) + z0 * Math.cos(tilt);
    return [cx + x * R, cy - y * R, z];
  };
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.strokeStyle = C.line; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#C9BBA6';
  for (let lat = -80; lat <= 80; lat += 10) for (let lon = -180; lon < 180; lon += 10) { const [x, y, z] = proj(lat, lon); if (z > 0) { ctx.beginPath(); ctx.arc(x, y, 3.2 * (.4 + .6 * z), 0, 7); ctx.fill(); } }
  return proj;
}
// Small generic provider card (name + optional sub), centred vertically at y.
function b_prov(x, y, w, name, o = {}) {
  const h = o.h || 88, down = o.down, ok = o.ok;
  card(x, y - h / 2, w, h, { r: 20, stroke: down ? C.red : ok ? C.green : C.line, lw: down || ok ? 4 : 2.5, fill: down ? C.redL : ok ? C.greenL : '#fff' });
  node(x + h / 2, y, h * .3, '', { fill: o.well || C.bg, stroke: o.well || C.bg });
  icon('brain', x + h / 2, y, h * .16, o.color || C.soft);
  text(name, x + h * .95, y + 1, { size: o.size || 30, weight: 800, fam: o.fam || SANS });
  if (down) badge('down', x + w - 10, y - h / 2 - 18, { align: 'right', fill: C.red, color: '#fff' });
}

// ================= code =================
const B_CF_CODE = ['import { Agent } from "agents";', '', 'export class Atlas extends Agent {', '  async plan(goal) {', '    this.setState({ goal });', '    await this.schedule(86400, "checkPrices");', '  }', '}'];
const B_CF_FEAT = [['state', 'db', 'state'], ['scheduling', 'clock', 'scheduling'], ['live connection to the browser', 'browser', 'live']];
SCN.code = {
  chapter: CH.code,
  draw(S, t) {
    const w = (j, s) => wordAt(S.name, j, s);
    chapterTitle(S, 2, 'The code', 'code');
    // line 0 tail: one open-source toolkit per cloud, each running the agent loop
    alpha(S.p(0, 3.0, .6) * S.out(1), () => {
      b_title('One toolkit per cloud');
      PROVS.forEach((k, i) => {
        const x = 480 + i * 480;
        pop(x, 360, S.p(0, 3.2 + i * .2, .6), () => provTile(k, x, 350 + Math.sin(t * 1.8 + i) * 4, 70));
        fade(S.p(0, 3.5 + i * .2, .6), () => {
          card(x - 150, 510, 300, 150, { r: 22, fill: C.code });
          icon('code', x - 62, 585, 30, '#EDE6DA');
          b_spin(x + 58, 585, 34, t * 3 + i, CODE.str, 7);
        }, 16);
      });
      pop(960, 770, S.pf(0, w(0, 'agent loop') - .05, .5), () => b_iconPill('open source, for the agent loop', 'star', 960, 770, { size: 28, fill: C.greenL, stroke: C.green, color: C.green }));
    });
    // line 1: Agents SDK: Atlas extends Agent and gets three things built in
    alpha(S.p(1) * S.out(2), () => {
      fade(S.p(1, .05), () => b_head('cf', 'Agents SDK'));
      const cx = 540, cy = 490, ext = S.pf(1, w(1, 'extends'), .5);
      pop(cx, cy, S.pf(1, w(1, 'Atlas') - .02, .6), () => {
        card(cx - 250, cy - 210, 500, 420, { r: 26, stroke: C.cf, lw: 4 });
        rr(cx - 250, cy - 210, 500, 72, [26, 26, 0, 0]); ctx.fillStyle = C.code; ctx.fill();
        b_codeLine('class Atlas extends Agent', cx - 211, cy - 173, 28);
        if (ext > 0) { const cw = measure('M', 28, 500, MONO); line(cx - 211 + 12 * cw, cy - 150, cx - 211 + lerp(12, 25, ext) * cw, cy - 150, C.cf, 4); }
        atlas(cx, cy + 50, 1.7, t, { mood: S.pf(1, w(1, 'built in')) > 0 ? 'happy' : 'ok' });
      });
      B_CF_FEAT.forEach(([label, ic, word], i) => {
        const f = w(1, word), p = S.pf(1, f, .6), ty = 320 + i * 170, col = [C.cf, C.teal, C.blue][i];
        if (p <= 0) return;
        if (p >= .9) {
          line(cx + 250, ty, 1000, ty, col, 5);
          packet(cx + 250, ty, 1000, ty, ((t - S.at(1, f)) * .7 + i * .3) % 1, col, 9);
        }
        alpha(clamp01(p * 2), () => b_tile(1000 + 200 * (1 - eOut(p)), ty - 52, 640, 104, label, ic, col));
      });
      pop(cx, 770, S.pf(1, w(1, 'built in'), .5), () => { card(cx - 120, 740, 240, 60, { r: 30, fill: C.greenL, shadow: false }); check(cx - 70, 770, 28, C.green); text('built in', cx - 38, 771, { size: 30, weight: 800, color: C.green }); });
    });
    // line 2: the code: save the goal, wake up tomorrow
    alpha(S.p(2), () => {
      fade(S.p(2, .05), () => b_head('cf', 'Remember, then wake up'));
      const x0 = 110, y0 = 240, ly = i => y0 + 82 + i * 48 + 15;
      const fs = w(2, 'saves'), fw = w(2, 'woken');
      const hA = S.pf(2, fs) * (1 - S.pf(2, fw - .04)), hB = S.pf(2, fw - .02);
      codeBlock(x0, y0, 1060, B_CF_CODE, { size: 30, file: 'atlas.ts', reveal: chars(B_CF_CODE) * S.p(2, .05, 1.6, b_ramp), cursor: true, hl: [0, 0, 0, 0, hA, hB, 0, 0] });
      // state card
      packet(1100, ly(4), 1270, 330, S.pf(2, fs + .05, .6, clamp01), C.blue, 10);
      pop(1530, 320, S.pf(2, fs + .12, .5), () => {
        card(1270, 250, 520, 150, { r: 22, stroke: C.blue, lw: 3 });
        text('state', 1300, 285, { size: 24, weight: 700, color: C.blue, fam: MONO });
        text('goal: 5 days in Lisbon', 1300, 350, { size: 30, weight: 800 });
      });
      // alarm clock: hands race to tomorrow, then ring to check prices
      const ft = w(2, 'tomorrow'), spinP = S.pf(2, ft, 1.2, eIO), ring = S.pf(2, w(2, 'check prices'), .2) * (1 - S.pf(2, .98, .6));
      packet(1100, ly(5), 1340, 580, S.pf(2, fw, .5, clamp01), C.cf, 10);
      pop(1440, 580, S.pf(2, fw + .04, .5), () => b_alarm(1440, 580, 78, t, 9 + 24 * spinP, ring));
      pop(1440, 745, S.pf(2, ft, .5), () => b_iconPill('tomorrow', 'clock', 1440, 745, { size: 28, fill: C.cfL, stroke: C.cf, color: C.orangeD }));
      fade(S.pf(2, w(2, 'check prices'), .5), () => pill('checkPrices', 1690, 580, { size: 24, fill: '#fff', stroke: C.cf, color: C.orangeD }), 10);
    });
  },
};

// ================= code_vc =================
const B_VC_CODE = ['import { ToolLoopAgent } from "ai";', '', 'const atlas = new ToolLoopAgent({', '  model: "anthropic/claude-sonnet-4.6",', '  instructions: "You plan trips.",', '  tools: { searchFlights, findHotels },', '});', 'const result = await atlas.generate({ prompt });'];
SCN.code_vc = {
  chapter: CH.code,
  draw(S, t) {
    const w = (j, s) => wordAt(S.name, j, s);
    // line 0: the AI SDK, npm package "ai"
    alpha(S.out(1), () => {
      fade(S.p(0, .05), () => b_head('vc', 'AI SDK'));
      const bx = 960, by = 440 + Math.sin(t * 2) * 6;
      alpha(S.p(0, .3, .8), () => {
        for (let i = 0; i < 7; i++) {
          const a = t * .5 + i / 7 * Math.PI * 2;
          icon('star', 960 + Math.cos(a) * 300, 440 + Math.sin(a) * 175, 12 + 5 * Math.sin(t * 3 + i), i % 2 ? '#9A9A9A' : PV.vc.col);
        }
      });
      pop(bx, by, S.p(0, .35, .7), () => {
        ctx.fillStyle = '#D9D9D9';
        ctx.beginPath(); ctx.moveTo(bx - 170, by - 100); ctx.lineTo(bx - 210, by - 140); ctx.lineTo(bx - 40, by - 140); ctx.lineTo(bx, by - 100); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(bx + 170, by - 100); ctx.lineTo(bx + 210, by - 140); ctx.lineTo(bx + 40, by - 140); ctx.lineTo(bx, by - 100); ctx.closePath(); ctx.fill();
        card(bx - 170, by - 100, 340, 200, { r: 14, fill: '#F2F2F2', stroke: PV.vc.col, lw: 4 });
        text('ai', bx, by - 14, { size: 72, weight: 700, color: PV.vc.col, align: 'center', fam: MONO });
        text('npm package', bx, by + 54, { size: 24, weight: 700, color: C.soft, align: 'center' });
      });
      pop(520, 440, S.pf(0, w(0, 'popular'), .5), () => b_iconPill('most popular', 'star', 520, 440, { size: 28, fill: '#fff', stroke: PV.vc.col, color: PV.vc.col }));
      pop(1400, 440, S.pf(0, w(0, 'TypeScript'), .5), () => pill('TypeScript', 1400, 440, { size: 28, fill: C.blueL, color: C.blue }));
      fade(S.pf(0, w(0, 'toolkit'), .6), () => text('TypeScript toolkit for AI apps', 960, 680, { size: 40, weight: 700, align: 'center' }), 14);
    });
    // line 1: ToolLoopAgent runs the think, act, observe loop
    alpha(S.p(1), () => {
      fade(S.p(1, .05), () => b_head('vc', 'ToolLoopAgent'));
      const on = (a, b) => S.pf(1, w(1, a) - .01, .3) * (b ? 1 - S.pf(1, w(1, b) - .02, .3) : 1);
      const hl = [0, 0, on('ToolLoopAgent', 'model'), on('model', 'instructions'), on('instructions', 'tools'), on('tools', 'runs'), 0, S.pf(1, w(1, 'runs') - .01, .3)];
      codeBlock(80, 230, 1000, B_VC_CODE, { size: 28, file: 'atlas.ts', reveal: chars(B_VC_CODE) * S.p(1, .05, 2.3, b_ramp), cursor: true, hl });
      [['model', 'brain', 'model'], ['instructions', 'doc', 'instructions'], ['tools', 'tool', 'tools']].forEach(([n, ic, word], i) => pop(250 + i * 330, 740, S.pf(1, w(1, word) - .01, .5), () => b_iconPill(n, ic, 250 + i * 330, 740, { size: 28, fill: '#F2F2F2', stroke: PV.vc.col, color: PV.vc.col })));
      const lp = [w(1, 'think'), w(1, 'act,'), w(1, 'observe')].map(f => S.pf(1, f - .02, .5));
      fade(S.pf(1, w(1, 'runs') - .02, .5), () => {
        atlas(1480, 505, .95, t, { mood: 'think' });
        b_loop(1480, 500, 160, t, { p: lp, color: C.acc });
      }, 10);
      pop(1480, 800, S.pf(1, w(1, 'for you'), .5), () => pill('the loop runs for you', 1480, 800, { size: 26, fill: C.accL, color: C.acc }));
    });
  },
};

// ================= code_aws =================
const B_AWS_CODE = ['from strands import Agent', '', 'atlas = Agent(tools=[search_flights, find_hotels])', 'atlas("Plan 5 days in Lisbon under $2,000")'];
SCN.code_aws = {
  chapter: CH.code,
  draw(S, t) {
    const w = (j, s) => wordAt(S.name, j, s);
    // line 0: Strands Agents, Python and TypeScript
    alpha(S.out(1), () => {
      fade(S.p(0, .05), () => b_head('aws', 'Strands Agents'));
      fade(S.p(0, .2, .6), () => {
        card(560, 290, 800, 320, { r: 30, stroke: PV.aws.col, lw: 3 });
        b_strands(640, 1280, 450, 80, t, S.p(0, .3, 1.2, eIO));
      }, 20);
      pop(740, 720, S.pf(0, w(0, 'Python'), .5), () => pill('Python', 740, 720, { size: 32, fill: '#FFF3DA', stroke: PV.aws.smile, color: PV.aws.col }));
      pop(1180, 720, S.pf(0, w(0, 'TypeScript'), .5), () => pill('TypeScript', 1180, 720, { size: 32, fill: C.blueL, color: C.blue }));
    });
    // line 1: an Agent with a list of tools; the model picks which to call, and when
    alpha(S.p(1), () => {
      fade(S.p(1, .05), () => b_head('aws', 'The model picks the tools'));
      const fc = w(1, 'create'), fd = w(1, 'decides'), fwn = w(1, 'when');
      codeBlock(80, 330, 1010, B_AWS_CODE, { size: 28, file: 'atlas.py', reveal: chars(B_AWS_CODE) * S.p(1, .05, 1.4, b_ramp), cursor: true, hl: [0, 0, S.pf(1, fc, .3) * (1 - S.pf(1, fd - .03, .3)), S.pf(1, fd - .02, .3)] });
      // the model, thinking
      const mx = 1510, my = 330, think = S.pf(1, fd, .3), pick = S.pf(1, fd + .12, .5), second = S.pf(1, fwn, .5);
      pop(mx, my, S.pf(1, fd - .1, .5), () => {
        node(mx, my, 62, '', { fill: PV.aws.light, stroke: PV.aws.col, lw: 4 });
        icon('brain', mx, my, 30, PV.aws.col);
        text('model', mx + 84, my + 1, { size: 30, weight: 800, color: PV.aws.col });
        if (think > 0 && pick === 0) for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(mx - 22 + k * 22, my - 88 - Math.max(0, Math.sin(t * 8 - k)) * 8, 7, 0, 7); ctx.fillStyle = PV.aws.col; ctx.fill(); }
      });
      // the list of tools; the model lights one up, then the next
      const TOOLS = [['search_flights', 1340, pick], ['find_hotels', 1680, second]];
      fade(S.pf(1, w(1, 'list of tools'), .5), () => {
        rr(1165, 520, 690, 220, 26); ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fill();
        ctx.save(); ctx.setLineDash([10, 10]); ctx.strokeStyle = C.muted; ctx.lineWidth = 3; rr(1165, 520, 690, 220, 26); ctx.stroke(); ctx.restore();
        text('tools', 1190, 552, { size: 24, weight: 800, color: C.soft });
        TOOLS.forEach(([n, x, on]) => {
          card(x - 160, 600, 320, 96, { r: 18, fill: on > 0 ? b_mixCol('#FFFFFF', C.greenL, on) : '#fff', stroke: on > 0 ? C.green : C.line, lw: on > 0 ? 4 : 2.5 });
          icon('tool', x - 122, 648, 16, on > 0 ? C.green : C.soft);
          text(n, x - 96, 649, { size: 26, weight: 600, fam: MONO });
        });
      }, 14);
      TOOLS.forEach(([, x, on], i) => {
        if (on <= 0) return;
        const sx = mx + (i ? 40 : -40), sy = my + 50;
        arrow(sx, sy, lerp(sx, x, on), lerp(sy, 592, on), 1, { color: C.green, lw: 6 });
        pop(lerp(sx, x, .5), lerp(sy, 592, .5), on, () => node(lerp(sx, x, .5), lerp(sy, 592, .5), 22, String(i + 1), { fill: C.green, stroke: '#fff', color: '#fff', size: 24 }));
      });
      pop(1510, 800, S.pf(1, fwn, .5), () => pill('which tool, and when', 1510, 800, { size: 26, fill: C.greenL, color: C.green }));
    });
  },
};
// hex colour blend -> rgb()
function b_mixCol(a, b, p) {
  const h = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const x = h(a), y = h(b), q = clamp01(p);
  return `rgb(${x.map((v, i) => Math.round(lerp(v, y[i], q))).join(',')})`;
}

// ================= code_mix =================
const B_EVE = [['agent.ts', 'doc'], ['instructions.md', 'doc'], ['tools/', 'dir'], ['skills/', 'dir']];
SCN.code_mix = {
  chapter: CH.code,
  draw(S, t) {
    const w = (j, s) => wordAt(S.name, j, s);
    // line 0: not locked in
    alpha(S.out(1), () => {
      fade(S.p(0, .05), () => {
        b_title('Not locked in');
        const lx = 960 - measure('Not locked in', 54, 600, SERIF) / 2 - 56, ly = 162, open = S.pf(0, w(0, 'locked'), .6, back);
        rr(lx - 24, ly - 10, 48, 38, 8); ctx.fillStyle = C.acc; ctx.fill();
        ctx.save(); ctx.strokeStyle = C.acc; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath();
        ctx.moveTo(lx + 14, ly - 10); ctx.lineTo(lx + 14, ly - 20 - open * 16); ctx.arc(lx, ly - 20 - open * 16, 14, 0, Math.PI, true); if (open < .5) ctx.lineTo(lx - 14, ly - 10); ctx.stroke(); ctx.restore();
      });
      line(960, 260, 960, 800, C.line, 4, [6, 12]);
      // AI SDK on Cloudflare Workers
      const fa = w(0, 'AI SDK'), drop = S.pf(0, fa, .9, back);
      fade(S.p(0, .2, .6), () => { cloud(520, 610, 1.9, C.cf); text('Workers', 520, 650, { size: 34, weight: 800, color: '#fff', align: 'center' }); }, 16);
      if (drop > 0) alpha(clamp01(drop * 3), () => {
        const y = lerp(250, 438, drop);
        card(400, y, 240, 84, { r: 20, fill: PV.vc.col });
        ctx.beginPath(); ctx.moveTo(446, y + 26); ctx.lineTo(466, y + 58); ctx.lineTo(426, y + 58); ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill();
        text('AI SDK', 555, y + 43, { size: 32, weight: 800, color: '#fff', align: 'center' });
      });
      pop(520, 790, S.pf(0, w(0, 'Workers'), .5), () => pill('runs on Workers', 520, 790, { size: 28, fill: C.cfL, color: PV.cf.ink }));
      // Strands anywhere Python runs
      const fs = w(0, 'Strands'), fan = S.pf(0, w(0, 'anywhere'), .8, eIO);
      pop(1380, 330, S.pf(0, fs, .5), () => {
        card(1250, 288, 260, 84, { r: 20, fill: PV.aws.col });
        text('Strands', 1380, 328, { size: 32, weight: 800, color: '#fff', align: 'center' });
        ctx.save(); ctx.strokeStyle = PV.aws.smile; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(1336, 352); ctx.quadraticCurveTo(1380, 366, 1424, 352); ctx.stroke(); ctx.restore();
      });
      const DEST = [[1120, 620], [1380, 630], [1640, 620]];
      DEST.forEach(([x, y], i) => {
        const p = clamp01(fan * 1.6 - i * .3);
        if (p <= 0) return;
        arrow(1380, 380, lerp(1380, x, p), lerp(380, y - 80, p), 1, { color: C.muted, lw: 4 });
        if (p >= 1) packet(1380, 380, x, y - 80, ((t - S.at(0, .8)) * .8 + i * .33) % 1, PV.aws.smile, 9);
        pop(x, y, p, () => {
          if (i === 0) laptop(x, y, .55, (sx, sy, sw, sh) => { ctx.fillStyle = C.bg; ctx.fillRect(sx, sy, sw, sh); text('.py', sx + sw / 2, sy + sh / 2, { size: 28, weight: 800, color: PV.aws.col, align: 'center', fam: MONO }); });
          else if (i === 1) server(x, y, .85, PV.aws.col);
          else cloud(x, y, .8, C.idle);
        });
      });
      pop(1380, 790, S.pf(0, w(0, 'anywhere') + .04, .5), () => pill('anywhere Python runs', 1380, 790, { size: 28, fill: PV.aws.light, color: PV.aws.col }));
    });
    // line 1: or skip the loop code: AgentCore harness and eve (beta)
    alpha(S.p(1), () => {
      fade(S.p(1, .05), () => b_title('Or skip the loop code'));
      const fa = w(1, 'AgentCore'), fe = w(1, 'eve'), fb = w(1, 'beta'), fcfg = w(1, 'configuration');
      // intro: the hand-written loop, crossed out
      alpha(S.p(1, .1, .5) * (1 - S.pf(1, fa - .04, .4)), () => {
        card(760, 330, 400, 280, { r: 26, fill: C.code });
        icon('code', 870, 470, 44, '#EDE6DA');
        b_spin(1040, 470, 56, t * 2.4, CODE.str, 9);
        text('loop code', 960, 670, { size: 32, weight: 800, color: C.soft, align: 'center' });
        cross(960, 470, 200, C.red, S.pf(1, w(1, 'rather'), .6));
      });
      // AWS AgentCore harness
      fade(S.pf(1, fa - .02, .6), () => {
        card(130, 240, 780, 500, { r: 28, stroke: C.line, lw: 2.5 });
        rr(130, 240, 780, 104, [28, 28, 0, 0]); ctx.fillStyle = PV.aws.light; ctx.fill();
        logo('aws', 200, 292, .62);
        text('AgentCore harness', 260, 294, { size: 36, weight: 800, color: PV.aws.ink });
        // config doc -> agent
        const x = 330, y = 520;
        card(x - 90, y - 115, 180, 230, { r: 16, stroke: C.line, lw: 2.5 });
        for (let k = 0; k < 5; k++) { rr(x - 60, y - 80 + k * 34, k % 2 ? 90 : 120, 12, 6); ctx.fillStyle = k === 0 ? PV.aws.smile : C.idle; ctx.fill(); }
        icon('gear', x + 50, y + 80, 24, PV.aws.col);
        arrow(460, y, 600, y, S.pf(1, fa + .06, .6), { color: PV.aws.col, lw: 6 });
        packet(460, y, 600, y, ((t - S.at(1, fa + .12)) * .8) % 1 * (S.pf(1, fa + .12) > 0), PV.aws.smile, 9);
        const on = S.pf(1, fa + .1, .5);
        pop(720, y, on, () => atlas(720, y, 1.2, t, { mood: 'happy' }));
        pop(520, 690, S.pf(1, fa + .08, .5), () => pill('config → agent', 520, 690, { size: 28, fill: PV.aws.light, color: PV.aws.col }));
      }, 20);
      // Vercel eve (beta)
      fade(S.pf(1, fe - .02, .6), () => {
        card(1010, 240, 780, 500, { r: 28, stroke: C.line, lw: 2.5 });
        rr(1010, 240, 780, 104, [28, 28, 0, 0]); ctx.fillStyle = '#F2F2F2'; ctx.fill();
        logo('vc', 1080, 292, .62);
        text('eve', 1140, 294, { size: 40, weight: 800, color: PV.vc.ink });
        pop(1290, 292, S.pf(1, fb, .5), () => badge('beta', 1242, 276, { size: 22 }));
        b_folder(1090, 400, .5, '#9A9A9A');
        B_EVE.forEach(([n, kind], i) => {
          const y = 460 + i * 70;
          fade(S.pf(1, fe + .03 + i * .03, .4), () => {
            line(1090, 422, 1090, y, C.line, 3); line(1090, y, 1130, y, C.line, 3);
            if (kind === 'dir') b_folder(1160, y + 2, .32, '#B5B5B5'); else icon('doc', 1160, y, 18, C.soft);
            text(n, 1196, y + 1, { size: 28, weight: 600, fam: MONO });
          }, 8);
        });
        arrow(1480, 520, 1590, 520, S.pf(1, fe + .18, .6), { color: PV.vc.col, lw: 6 });
        packet(1480, 520, 1590, 520, ((t - S.at(1, fe + .24)) * .8) % 1 * (S.pf(1, fe + .24) > 0), C.blue, 9);
        pop(1680, 520, S.pf(1, fe + .2, .5), () => atlas(1680, 520, 1.0, t, { mood: 'happy' }));
      }, 20);
      pop(960, 800, S.pf(1, fcfg, .5), () => b_iconPill('configuration instead of code', 'gear', 960, 800, { size: 28, fill: C.accL, stroke: C.acc, color: C.acc }));
    });
  },
};

// ================= brain =================
SCN.brain = {
  chapter: CH.brain,
  draw(S, t) {
    const w = (j, s) => wordAt(S.name, j, s);
    chapterTitle(S, 3, 'The brain', 'brain');
    // line 0 tail: Atlas needs a model; which can each cloud reach?
    alpha(S.p(0, 3.0, .6) * S.out(1), () => {
      b_title('Which models, and how?');
      atlas(330, 560, 1.6, t, { mood: 'think', label: 'Atlas' });
      for (const [x, y, r] of [[430, 440, 10], [470, 400, 16]]) { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); }
      card(470, 250, 440, 150, { r: 75 });
      icon('brain', 560, 325, 34, C.acc);
      text('language', 720, 305, { size: 32, weight: 800, align: 'center' });
      text('model', 720, 347, { size: 32, weight: 800, align: 'center' });
      PROVS.forEach((k, i) => {
        const x = 1180 + i * 260, p = S.p(0, 3.4 + i * .2, .5);
        if (p > 0) line(910, 330, lerp(910, x - 66, p), lerp(330, 520, p), C.line, 4, [6, 10]);
        pop(x, 540, p, () => provTile(k, x, 540, 62));
        pop(x, 400, S.p(0, 3.8 + i * .2, .5), () => { node(x, 400 + Math.sin(t * 3 + i) * 6, 30, '?', { fill: C.accL, stroke: C.acc, color: C.acc, size: 34 }); });
      });
    });
    // line 1: two big ideas: host models, or a gateway
    alpha(S.p(1), () => {
      fade(S.p(1, .05), () => b_title('Two big ideas'));
      const fh = w(1, 'Hosting'), fg = w(1, 'gateway'), fr = w(1, 'routes');
      // idea 1: host models
      fade(S.pf(1, fh - .1, .6), () => {
        card(120, 240, 760, 560, { r: 28, stroke: C.line, lw: 2.5 });
        node(170, 290, 26, '1', { fill: C.acc, stroke: C.acc, color: '#fff', size: 28 });
        text('Host models', 214, 292, { size: 38, weight: 800 });
        const gx = 500, gy = 520, glow = .5 + .5 * Math.sin(t * 3);
        card(gx - 190, gy - 140, 380, 280, { r: 22, fill: C.code });
        for (let k = 0; k < 6; k++) line(gx - 160, gy - 110 + k * 12, gx - 110, gy - 110 + k * 12, '#4A463F', 4);
        rr(gx - 110, gy - 90, 220, 180, 18); ctx.fillStyle = `rgba(42,157,143,${.25 + .25 * glow})`; ctx.fill();
        icon('brain', gx, gy - 8, 50, '#fff');
        text('model', gx, gy + 62, { size: 24, weight: 800, color: '#fff', align: 'center' });
        for (const [dx, dy] of [[-150, 100], [150, 100], [150, -100]]) b_gpu(gx + dx, gy + dy, .7, C.acc);
        text("on the cloud's own GPUs", 500, 730, { size: 28, weight: 700, color: C.soft, align: 'center' });
      }, 20);
      // idea 2: a gateway / control tower
      const PY = [360, 460, 560, 660];
      fade(S.pf(1, fg - .04, .6), () => {
        card(1000, 240, 800, 560, { r: 28, stroke: C.line, lw: 2.5 });
        node(1050, 290, 26, '2', { fill: C.acc, stroke: C.acc, color: '#fff', size: 28 });
        text('Gateway', 1094, 292, { size: 38, weight: 800 });
        atlas(1070, 480, .6, t);
        line(1105, 480, 1123, 480, C.line, 5);
        b_tower(1200, 480, t, .7, C.acc, C.accL);
        const rp = S.pf(1, fr, .7);
        PY.forEach((y, i) => {
          const p = clamp01(rp * 1.6 - i * .2);
          if (p > 0) line(1277, 480, lerp(1277, 1450, p), lerp(480, y, p), C.line, 4);
          if (p >= 1) b_path([[1105, 480], [1277, 480], [1450, y]], ((t - S.at(1, fr)) * .5 + i * .25) % 1, C.blue, 8);
          pop(1605, y, S.pf(1, w(1, 'many') + i * .02, .5), () => {
            card(1450, y - 38, 310, 76, { r: 18, stroke: C.line, lw: 2.5 });
            node(1488, y, 22, '', { fill: C.accL, stroke: C.accL }); icon('brain', 1488, y, 12, C.acc);
            rr(1526, y - 16, 150 - i * 18, 12, 6); ctx.fillStyle = C.idle; ctx.fill(); rr(1526, y + 6, 100 + i * 14, 10, 5); ctx.fill();
          });
        });
        pop(1200, 760, S.pf(1, w(1, 'control tower'), .5), () => pill('control tower', 1200, 760, { size: 26, fill: C.accL, color: C.acc }));
        pop(1605, 760, S.pf(1, w(1, 'many'), .5), () => text('many model providers', 1605, 760, { size: 26, weight: 800, color: C.soft, align: 'center' }));
      }, 20);
    });
  },
};

// ================= brain_cf =================
const B_CF_PROV = ['Anthropic', 'OpenAI', 'Google', '+ others'];
const B_FEAT = [['cache', 'db', 'caching'], ['rate limit', 'clock', 'rate'], ['fallback', 'bolt', 'fallbacks'], ['cost logs', 'doc', 'cost']];
const B_ANY = ['Gemma', 'GLM', 'Anthropic', 'OpenAI', 'Google', '…'];
SCN.brain_cf = {
  chapter: CH.brain,
  draw(S, t) {
    const w = (j, s) => wordAt(S.name, j, s);
    // line 0: does both; Workers AI runs open models on GPUs across the network
    const fw = w(0, 'Workers AI');
    alpha(S.out(1), () => {
      alpha(1 - S.pf(0, fw - .02, .4), () => {
        fade(S.p(0, .05), () => b_head('cf', 'Cloudflare does both'));
        [['Host models', 'brain'], ['Gateway', 'gear']].forEach(([s, ic], i) => pop(700 + i * 520, 470, S.p(0, .3 + i * .3, .5), () => {
          card(700 + i * 520 - 220, 380, 440, 180, { r: 28, stroke: C.cf, lw: 4 });
          icon(ic, 700 + i * 520 - 130, 470, 34, C.cf);
          text(s, 700 + i * 520 - 80, 471, { size: 36, weight: 800 });
          node(700 + i * 520 + 200, 390, 28, '', { fill: C.green, stroke: '#fff', lw: 4 }); check(700 + i * 520 + 200, 390, 28, '#fff');
        }));
      });
      alpha(S.pf(0, fw - .02, .5), () => {
        b_head('cf', 'Workers AI');
        const fg = w(0, 'GPUs'), proj = b_globe(560, 540, 280, 10 + (t - S.ls(0)) * 8);
        B_CITIES.forEach(([lat, lon], i) => {
          const [x, y, z] = proj(lat, lon); if (z < .12) return;
          const p = S.pf(0, fg + i * .012, .4);
          if (p <= 0) { ctx.beginPath(); ctx.arc(x, y, 6 * (.5 + .5 * z), 0, 7); ctx.fillStyle = C.cf; ctx.fill(); return; }
          pop(x, y, p, () => b_gpu(x, y, .55 + .45 * z));
        });
        fade(S.pf(0, w(0, 'open models') - .02, .5), () => text('runs open models', 1400, 300, { size: 32, weight: 800, color: C.soft, align: 'center' }), 10);
        pop(1250, 400, S.pf(0, w(0, 'Gemma'), .5), () => pill('Gemma', 1250, 400, { size: 32 }));
        pop(1550, 400, S.pf(0, w(0, 'GLM'), .5), () => pill('GLM', 1550, 400, { size: 32 }));
        pop(1400, 500, S.pf(0, w(0, 'GLM') + .06, .5), () => pill('+ open models', 1400, 500, { size: 30, fill: C.cfL, color: PV.cf.ink }));
        fade(S.pf(0, fg, .5), () => {
          b_gpu(1140, 660, 1.3);
          text('GPUs across', 1200, 642, { size: 32, weight: 800 });
          text("Cloudflare's network", 1200, 684, { size: 28, weight: 600, color: C.soft });
        }, 10);
      });
    });
    // line 1: AI Gateway, the control tower in front of many providers
    alpha(S.p(1) * S.out(2), () => {
      fade(S.p(1, .05), () => b_head('cf', 'AI Gateway'));
      const ax = 250, ay = 430, tx = 820, px = 1380, PY = [280, 400, 520, 640];
      const atl = [ax + 70, ay], cabL = [tx - 94, ay], cabR = [tx + 94, ay];
      const pin = i => S.pf(1, w(1, B_CF_PROV[i].replace('+ ', '')) - .01, .5);
      const fc = w(1, 'caching'), fr = w(1, 'rate'), ff = w(1, 'fallbacks'), fl = w(1, 'cost');
      fade(S.p(1, .1), () => atlas(ax, ay, 1.3, t, { label: 'Atlas' }), 10);
      const tp = S.p(1, .2, .7);
      if (tp > 0) {
        alpha(clamp01(tp * 2), () => { line(atl[0], ay, cabL[0], ay, C.line, 5); B_CF_PROV.forEach((_, i) => { const p = pin(i); if (p > 0) line(cabR[0], ay, lerp(cabR[0], px, p), lerp(ay, PY[i], p), C.line, 5); }); });
        ctx.save(); ctx.translate(tx, ay + 221); ctx.scale(1, eOut(tp)); ctx.translate(-tx, -(ay + 221)); b_tower(tx, ay, t, .85); ctx.restore();
      }
      const down = S.pf(1, ff, .3) > 0;
      B_CF_PROV.forEach((n, i) => pop(px + 190, PY[i], pin(i), () => b_prov(px, PY[i], 380, n, { down: i === 0 && down, ok: i === 1 && down, well: C.cfL, color: C.cf })));
      // steady traffic until the fallback; then everything reroutes to the second provider
      if (pin(0) >= 1) for (let k = 0; k < 4; k++) {
        const q = ((t - S.at(1, w(1, 'Anthropic'))) * .4 + k / 4) % 1, i = down ? 1 : k % 4;
        if (pin(i) >= 1) b_path([atl, cabL, cabR, [px, PY[i]]], q, C.blue, 9);
      }
      // cache: a green answer comes straight back from the tower
      b_path([cabL, atl], S.pf(1, fc, .7, clamp01), C.green, 11);
      if (S.pf(1, ff, .3) > 0 && S.pf(1, fl) === 0) { const x = lerp(cabR[0], px, .8), y = lerp(ay, PY[0], .8); cross(x, y, 34, C.red, S.pf(1, ff, .3)); }
      B_FEAT.forEach(([s, ic, word], i) => pop(390 + i * 380, 790, S.pf(1, w(1, word), .5), () => b_iconPill(s, ic, 390 + i * 380, 790, { size: 30, fill: '#fff', stroke: C.cf, color: PV.cf.ink })));
    });
    // line 2: one binding, one wallet, almost any model
    alpha(S.p(2), () => {
      fade(S.p(2, .05), () => b_head('cf', 'One binding, one wallet'));
      pop(960, 236, S.pf(2, w(2, 'since'), .5), () => pill('since Aug 2026', 960, 236, { size: 24, fill: C.cfL, color: PV.cf.ink }));
      const m = S.pf(2, w(2, 'share') - .04, .9, eIO), merged = clamp01((m - .85) / .15);
      alpha(1 - merged, () => {
        serviceCard(lerp(380, 790, m), 330, 340, 100, 'Workers AI', { icon: 'brain' });
        serviceCard(lerp(1200, 790, m), 330, 340, 100, 'AI Gateway', { icon: 'gear' });
      });
      pop(960, 380, merged, () => b_plug(960, 380, 1, 'env.AI'));
      pop(560, 380, S.pf(2, w(2, 'one binding'), .5), () => { icon('bolt', 440, 380, 22, C.cf); text('one binding', 470, 381, { size: 30, weight: 800 }); });
      pop(1380, 380, S.pf(2, w(2, 'one wallet'), .5), () => { b_wallet(1260, 385, .55); text('one wallet', 1320, 381, { size: 30, weight: 800 }); });
      const fa = w(2, 'one line');
      B_ANY.forEach((n, i) => {
        const x = 360 + i * 240, p = S.pf(2, fa + i * .04, .5);
        if (p > 0) { line(960, 470, lerp(960, x, p), lerp(470, 660, p), C.cfL, 5); if (p >= 1) packet(960, 470, x, 660, ((t - S.at(2, fa)) * .6 + i * .17) % 1, C.cf, 8); }
        pop(x, 690, p, () => pill(n, x, 690, { size: 28, stroke: C.cf }));
      });
      fade(S.pf(2, w(2, 'almost'), .5), () => text('almost any model', 960, 790, { size: 36, weight: 800, color: PV.cf.ink, align: 'center' }), 10);
    });
  },
};

// ================= brain_vc =================
const B_DOTCOL = ['#111111', '#6B6B6B', '#4C7BD9', '#2A9D8F', '#D97757', '#8A6FD1', '#3F9A62', '#B9593A'];
SCN.brain_vc = {
  chapter: CH.brain,
  draw(S, t) {
    const w = (j, s) => wordAt(S.name, j, s);
    const hub = (x, y, r) => { node(x, y, r, '', { fill: PV.vc.col, stroke: PV.vc.col }); ctx.beginPath(); ctx.moveTo(x, y - r * .42); ctx.lineTo(x + r * .46, y + r * .36); ctx.lineTo(x - r * .46, y + r * .36); ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill(); };
    // lines 0-1 share the AI Gateway header
    alpha(S.out(2), () => fade(S.p(0, .05), () => b_head('vc', 'AI Gateway')));
    // line 0: no own models; one endpoint in front of ~370 models
    alpha(S.out(1), () => {
      const fg = w(0, 'AI Gateway'), fe = w(0, 'one endpoint'), fn = w(0, '370'), fd = w(0, 'dozens');
      alpha(S.p(0, .2, .5) * (1 - S.pf(0, fg - .06, .4)), () => {
        server(620, 470, 1.4);
        cross(620, 470, 150, C.red, S.pf(0, .08, .6));
        text('no models of its own', 620, 640, { size: 30, weight: 800, color: C.red, align: 'center' });
      });
      const hp = S.pf(0, fg - .02, .6);
      pop(620, 470, hp, () => { hub(620, 470, 90); text('AI Gateway', 620, 600, { size: 30, weight: 800, align: 'center' }); });
      fade(S.pf(0, fe - .04, .5), () => {
        atlas(210, 470, 1.2, t, { label: 'Atlas' });
        line(275, 470, 530, 470, PV.vc.col, 5);
        packet(275, 470, 530, 470, ((t - S.at(0, fe)) * .7) % 1, C.blue, 10);
        pill('one endpoint', 400, 400, { size: 24, fill: '#F2F2F2', color: PV.vc.col });
      }, 10);
      // grid of models with a ticking counter
      const gp = S.pf(0, fn - .12, 1.6, eIO), n = Math.round(370 * gp);
      if (gp > 0) for (let k = 0; k < 5; k++) line(710, 470, 900, 300 + k * 90, C.line, 3);
      for (let i = 0; i < n; i++) {
        const c = i % 25, r = Math.floor(i / 25), x = 918 + c * 36, y = 290 + r * 30;
        ctx.beginPath(); ctx.arc(x, y, 9 + (i === n - 1 ? 3 : 0), 0, 7); ctx.fillStyle = B_DOTCOL[(Math.floor(c / 3) + r * 2) % B_DOTCOL.length]; ctx.fill();
      }
      if (gp > 0) text('~' + n + ' models', 1350, 760, { size: 48, weight: 800, align: 'center' });
      fade(S.pf(0, fd, .5), () => text('from dozens of providers', 1350, 815, { size: 28, weight: 700, color: C.soft, align: 'center' }), 8);
    });
    // line 1: no markup, automatic failover, any cloud
    alpha(S.p(1) * S.out(2), () => {
      const fm = w(1, 'no markup'), ff = w(1, 'fails'), fw2 = w(1, 'works');
      const COLS = [90, 690, 1290], cw = 540;
      [['No markup on tokens', fm], ['Automatic failover', ff], ['Works from any cloud', fw2]].forEach(([h, f], i) => fade(S.pf(1, f - .02, .5), () => {
        card(COLS[i], 250, cw, 560, { r: 28, stroke: C.line, lw: 2.5 });
        text(h, COLS[i] + cw / 2, 305, { size: 32, weight: 800, align: 'center' });
      }, 20));
      // 1: price tag
      pop(360, 500, S.pf(1, fm + .03, .6), () => b_tag('0% markup', 360, 500 + Math.sin(t * 2) * 5));
      fade(S.pf(1, fm + .08, .5), () => {
        for (let k = 0; k < 5; k++) { const q = ((t - S.at(1, fm)) * .35 + k / 5) % 1; alpha(Math.sin(q * Math.PI), () => icon('coin', 150 + q * 420, 680, 20, C.green)); }
        text('tokens', 360, 740, { size: 26, weight: 700, color: C.soft, align: 'center' });
      }, 8);
      // 2: failover
      const hx = 800, hy = 540, bx = 980, PA = 430, PB = 650, fail = S.pf(1, ff + .06, .3);
      fade(S.pf(1, ff, .5), () => {
        line(hx, hy, bx, PA, C.line, 4); line(hx, hy, bx, PB, C.line, 4);
        hub(hx, hy, 50);
        b_prov(bx, PA, 220, 'provider A', { size: 24, h: 80, down: fail > 0 });
        b_prov(bx, PB, 220, 'provider B', { size: 24, h: 80, ok: fail > 0 });
        const q = ((t - S.at(1, ff)) * .6) % 1;
        if (fail <= 0) packet(hx, hy, bx, PA, q, C.blue, 9);
        else { packet(hx, hy, bx, PB, q, C.blue, 9); cross(lerp(hx, bx, .6), lerp(hy, PA, .6), 28, C.red, fail); }
      }, 0);
      pop(960, 760, S.pf(1, w(1, 'automatically'), .5), () => pill('automatic', 960, 760, { size: 26, fill: C.greenL, color: C.green }));
      // 3: from any cloud
      const gx = 1560, gy = 610;
      fade(S.pf(1, fw2, .5), () => {
        const SRC = [[1410, 410], [1560, 410], [1710, 410]];
        SRC.forEach(([x, y], i) => {
          line(x, y + 50, gx, gy - 50, C.line, 4);
          packet(x, y + 50, gx, gy - 50, ((t - S.at(1, fw2)) * .7 + i * .33) % 1, C.blue, 8);
          if (i === 0) logo('cf', x, y, .75); else if (i === 1) logo('aws', x, y, .7); else laptop(x, y, .3);
        });
        hub(gx, gy, 50);
      }, 0);
      pop(1560, 760, S.pf(1, w(1, 'not just'), .5), () => pill('not just Vercel', 1560, 760, { size: 26, fill: '#F2F2F2', color: PV.vc.col }));
    });
    // line 2: switching models is changing a string
    alpha(S.p(2), () => {
      fade(S.p(2, .05), () => b_head('vc', 'Change one string'));
      pop(960, 244, S.p(2, .1, .5), () => pill('AI SDK', 960, 244, { size: 24, fill: '#F2F2F2', color: PV.vc.col }));
      const A = 'anthropic/claude-sonnet-4.6', B = 'openai/gpt-5.5';
      const del = S.pf(2, w(2, 'switching'), .7, b_ramp), typ = S.pf(2, w(2, 'switching') + .16, .7, b_ramp);
      const str = typ > 0 ? B.slice(0, Math.round(B.length * clamp01(typ))) : A.slice(0, Math.round(A.length * (1 - clamp01(del))));
      const done = typ >= 1, before = del <= 0, x0 = 330, y0 = 290;
      codeBlock(x0, y0, 1260, ['model: "' + str + '"'], { size: 34, file: 'atlas.ts', hl: [S.p(2, .2, .4)] });
      if (!before && !done && Math.sin(t * 20) > -.3) { const cw = measure('M', 34, 500, MONO); ctx.fillStyle = C.orange; ctx.fillRect(x0 + 42 + (8 + str.length) * cw + 2, y0 + 82 + 17 - 19, 3, 38); }
      // Atlas talks to whichever model the string names
      const BX = [[1150, 560, 'anthropic', !done], [1150, 700, 'openai', done]];
      fade(S.p(2, .2, .5), () => {
        atlas(560, 630, 1.2, t, { mood: done ? 'happy' : 'ok', label: 'Atlas' });
        BX.forEach(([x, y, n, on]) => {
          line(630, 630, x, y, on ? C.blue : C.line, on ? 5 : 3, on ? null : [6, 10]);
          if (on && (before || done)) packet(630, 630, x, y, ((t - S.ls(2)) * .8) % 1, C.blue, 9);
          b_prov(x, y, 320, n, { size: 28, h: 84, fam: MONO, ok: on && done, well: '#F2F2F2', color: PV.vc.col });
        });
      }, 10);
      pop(960, 810, S.pf(2, w(2, 'changing'), .5), () => pill('change one string', 960, 810, { size: 28, fill: C.accL, color: C.acc }));
    });
  },
};

// ================= brain_aws =================
const B_CAT = ['Claude', 'GPT', 'Nova', 'Llama', 'Mistral', 'DeepSeek', 'Qwen', '+ many more'];
const B_API = [['Converse API', 'Converse'], ['OpenAI-compatible', 'OpenAI'], ['Anthropic-compatible', 'Anthropic']];
const B_COST = [['Batch −50%', 'batch'], ['Flex tier', 'Flex'], ['Prompt caching', 'caching']];
SCN.brain_aws = {
  chapter: CH.brain,
  draw(S, t) {
    const w = (j, s) => wordAt(S.name, j, s);
    const chipOpts = n => n === 'Nova' ? { well: '#FFE8C2', color: '#C27400' } : n[0] === '+' ? { well: C.bg, color: C.muted, icon: 'star' } : {};
    // line 0: Amazon Bedrock, a catalog shelf inside AWS
    alpha(S.out(1), () => {
      fade(S.p(0, .05), () => b_head('aws', 'Amazon Bedrock'));
      alpha(S.pf(0, w(0, 'inside') - .02, .6), () => b_boundary(170, 270, 1580, 550, t));
      fade(S.p(0, .4, .6), () => {
        for (const y of [520, 770]) { rr(230, y, 1460, 22, 8); ctx.fillStyle = '#C9A77C'; ctx.fill(); rr(230, y + 16, 1460, 10, 5); ctx.fillStyle = '#A9875E'; ctx.fill(); }
      }, 10);
      B_CAT.forEach((n, i) => {
        const x = 420 + (i % 4) * 360, rest = i < 4 ? 454 : 704, f = w(0, n.replace('+ ', '')), p = S.pf(0, f - .01, .6, back);
        if (p <= 0) return;
        alpha(clamp01(p * 3), () => b_chip(n, x, lerp(rest - 140, rest, Math.min(1, p)) + Math.sin(t * 2 + i) * 2, 320, 110, { size: n[0] === '+' ? 28 : 32, ...chipOpts(n) }));
      });
    });
    // line 1: providers are locked out; prompts stay inside AWS
    alpha(S.p(1) * S.out(2), () => {
      fade(S.p(1, .05), () => b_head('aws', 'Your prompts stay inside AWS'));
      const fo = w(1, 'AWS-owned'), fc = w(1, "can't"), fp = w(1, 'prompts'), RY = [370, 530, 690];
      alpha(S.p(1, .1, .5), () => b_boundary(120, 260, 1380, 540, t));
      fade(S.p(1, .15), () => atlas(300, 530, 1.3, t, { label: 'Atlas' }), 10);
      fade(S.pf(1, fo - .02, .5), () => text('AWS-owned accounts', 1080, 300, { size: 26, weight: 800, color: PV.aws.col, align: 'center' }), 8);
      ['Claude', 'GPT', 'Llama'].forEach((n, i) => pop(1080, RY[i], S.pf(1, fo + i * .04, .5), () => {
        b_chip(n, 1080, RY[i], 440, 100, { size: 32 });
        pop(1260, RY[i], S.pf(1, fc + i * .03, .4), () => { node(1260, RY[i], 28, '', { fill: PV.aws.col, stroke: PV.aws.col }); icon('lock', 1260, RY[i] + 3, 16, '#fff'); });
      }));
      // prompts: Atlas -> each account and back, never leaving the boundary
      if (S.pf(1, fp) > 0) RY.forEach((y, i) => { const q = ((t - S.at(1, fp)) * .55 + i * .33) % 1; b_path([[380, 530], [860, y]], q * 2, C.blue, 9); b_path([[860, y], [380, 530]], q * 2 - 1, C.green, 9); });
      pop(620, 750, S.pf(1, fp, .5), () => pill('prompts stay inside', 620, 750, { size: 26, fill: C.greenL, color: C.green }));
      // the model provider, outside, can't get in
      fade(S.pf(1, fo + .05, .5), () => person(1700, 450, 1, '#6E6860', { label: 'model provider' }), 10);
      const blk = S.pf(1, fc, .5);
      if (blk > 0) { arrow(1640, 470, lerp(1640, 1520, blk), 470, 1, { color: C.red, lw: 5, dash: [8, 8] }); cross(1510, 470, 40, C.red, S.pf(1, fc + .05, .4)); }
      pop(1700, 660, S.pf(1, fc + .04, .5), () => pill("can't access", 1700, 660, { size: 26, fill: C.redL, color: C.red }));
    });
    // line 2: how to call it, and how to cut the cost
    alpha(S.p(2) * S.out(3), () => {
      fade(S.p(2, .05), () => b_head('aws', 'Calling Bedrock'));
      const fcut = w(2, 'cut costs');
      fade(S.p(2, .1), () => {
        atlas(180, 470, 1.1, t, { label: 'Atlas' });
        card(300, 400, 320, 140, { r: 24, stroke: PV.aws.col, lw: 3 });
        logo('aws', 380, 470, .6);
        text('Bedrock', 440, 472, { size: 34, weight: 800, color: PV.aws.col });
        packet(245, 470, 300, 470, ((t - S.ls(2)) * 1.2) % 1, C.blue, 9);
      }, 10);
      fade(S.pf(2, w(2, 'Converse') - .03, .5), () => text('call it with', 1000, 290, { size: 28, weight: 800, color: C.soft, align: 'center' }), 8);
      const cur = B_API.reduce((a, [, word], i) => S.pf(2, w(2, word)) > 0 ? i : a, -1);
      B_API.forEach(([s, word], i) => {
        const y = 380 + i * 110, p = S.pf(2, w(2, word) - .01, .5), pw = measure(s, 28, 600) + 28 * 1.4;
        if (p > 0) { line(620, 470, lerp(620, 1000 - pw / 2, p), lerp(470, y, p), i === cur ? PV.aws.col : C.line, i === cur ? 5 : 3); if (i === cur && p >= 1) packet(620, 470, 1000 - pw / 2, y, ((t - S.at(2, w(2, word))) * .9) % 1, PV.aws.smile, 9); }
        pop(1000, y, p, () => pill(s, 1000, y, { size: 28, stroke: i === cur ? PV.aws.col : C.line, color: PV.aws.col }));
      });
      fade(S.pf(2, fcut - .02, .5), () => {
        text('cut costs', 1560, 290, { size: 28, weight: 800, color: C.soft, align: 'center' });
        line(1300, 280, 1300, 800, C.line, 4, [6, 12]);
      }, 8);
      let cost = 1;
      B_COST.forEach(([s, word], i) => {
        const p = S.pf(2, w(2, word) - .01, .5);
        cost -= [.5, .12, .12][i] * eOut(p);
        pop(1560, 380 + i * 110, p, () => b_iconPill(s, 'coin', 1560, 380 + i * 110, { size: 28, fill: C.greenL, stroke: C.green, color: C.green }));
      });
      fade(S.pf(2, fcut, .5), () => {
        text('cost', 1370, 720, { size: 26, weight: 800, color: C.soft });
        rr(1440, 700, 340, 40, 20); ctx.fillStyle = C.line; ctx.fill();
        rr(1440, 700, 340 * cost, 40, 20); ctx.fillStyle = C.green; ctx.fill();
      }, 8);
    });
    // line 3: AgentCore Gateway reaches models outside AWS
    alpha(S.p(3), () => {
      fade(S.p(3, .05), () => b_head('aws', 'Reaching outside AWS'));
      pop(960, 236, S.pf(3, w(3, 'since July'), .5), () => pill('since July 2026', 960, 236, { size: 24, fill: PV.aws.light, color: PV.aws.col }));
      const fa = w(3, 'AgentCore'), fr = w(3, 'route'), gx = 1280, gy = 550;
      alpha(S.p(3, .1, .5), () => b_boundary(120, 300, 1160, 500, t));
      fade(S.p(3, .15), () => {
        atlas(300, gy, 1.2, t, { label: 'Atlas' });
        b_chip('Claude', 740, 400, 280, 84, { size: 28 });
        b_chip('Nova', 740, 700, 280, 84, { size: 28, well: '#FFE8C2', color: '#C27400' });
      }, 10);
      const open = S.pf(3, fr, .6, eIO);
      pop(gx, gy, S.pf(3, fa, .5), () => {
        card(gx - 34, gy - 150, 68, 300, { r: 16, fill: PV.aws.col });
        rr(gx - 18, gy - 110, 36, 220, 8); ctx.fillStyle = '#fff'; ctx.fill();
        rr(gx - 18, gy - 110, 36, 110 * (1 - open), 8); ctx.fillStyle = PV.aws.smile; ctx.fill();
        rr(gx - 18, gy + 110 - 110 * (1 - open), 36, 110 * (1 - open), 8); ctx.fill();
        card(gx - 150, gy - 230, 300, 60, { r: 30, fill: '#fff', stroke: PV.aws.col, lw: 3 });
        text('AgentCore Gateway', gx, gy - 199, { size: 26, weight: 800, color: PV.aws.col, align: 'center' });
      });
      if (open > 0) {
        arrow(gx + 40, gy, lerp(gx + 40, 1500, open), gy, 1, { color: PV.aws.col, lw: 6 });
        b_path([[380, gy], [gx, gy], [1500, gy]], ((t - S.at(3, fr)) * .45) % 1, C.blue, 10);
      }
      pop(1660, gy, S.pf(3, fr + .08, .5), () => b_prov(1510, gy, 320, 'outside model', { size: 28, h: 100 }));
    });
  },
};
