// ---------- Part C scenes: zdr, byok, memory, memory_cf, memory_vc, memory_aws, quiz1 ----------
// Local helpers use the c_ prefix.

const c_lin = x => clamp01(x);
const c_ramp = x => Math.max(0, x);   // linear ramp for code reveals: runs past 1 so the cursor hides when done
const c_title = (s, y = 160) => text(s, W / 2, y, { size: 54, weight: 600, fam: SERIF, align: 'center' });
// fraction of line j where `w` is spoken; throws at load if the word is missing so a caption edit can't silently desync
const c_w = (scene, j, w) => { if (!lineCap(scene, j).includes(w)) throw new Error(`c_w: "${w}" not in ${scene}[${j}]`); return wordAt(scene, j, w); };
function c_mix(a, b, p) {
  const h = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const x = h(a), y = h(b), q = clamp01(p);
  return `rgb(${x.map((v, i) => Math.round(lerp(v, y[i], q))).join(',')})`;
}
// Scene title with the provider's logo to its left.
function c_provTitle(k, s, y = 160) {
  const tw = measure(s, 54, 600, SERIF), lw = 80, g = 24, x0 = W / 2 - (lw + g + tw) / 2;
  logo(k, x0 + lw / 2, y - 4, .74);
  text(s, x0 + lw + g, y, { size: 54, weight: 600, fam: SERIF });
}
function c_titleBadge(s, b, y = 160) {
  c_title(s, y);
  badge(b, W / 2 + measure(s, 54, 600, SERIF) / 2 + 22, y - 18, { size: 22 });
}
// Pill with a leading icon. Returns its width.
function c_iconPill(s, ic, cx, cy, o = {}) {
  const size = o.size || 30, tw = measure(s, size, 700), w = tw + size * 2.6, h = size * 1.9;
  card(cx - w / 2, cy - h / 2, w, h, { r: h / 2, fill: o.fill || '#fff', stroke: o.stroke || C.line, lw: 3, shadow: o.shadow });
  icon(ic, cx - w / 2 + size * 1.05, cy, size * .5, o.color || C.ink);
  text(s, cx - w / 2 + size * 1.9, cy + 1, { size, weight: 700, color: o.color || C.ink });
  return w;
}
// position along a polyline, p in 0..1
function c_along(pts, p) {
  p = clamp01(p); const seg = []; let total = 0;
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); total += d; }
  let d = p * total;
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i] || i === seg.length - 1) { const f = seg[i] ? Math.min(1, d / seg[i]) : 0; return [lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)]; }
    d -= seg[i];
  }
  return pts[0];
}
function c_path(pts, p, color = C.acc, r = 11) {
  if (p <= 0 || p >= 1) return;
  const [x, y] = c_along(pts, p); packet(x, y, x, y, .5, color, r);
}
// n looping packets along pts, starting at time t0
function c_flow(pts, t, t0, n, speed, color, r = 9) {
  if (t < t0) return;
  for (let k = 0; k < n; k++) c_path(pts, ((t - t0) * speed + k / n) % 1, color, r);
}
// A document page centered at x,y.
function c_doc(x, y, s, o = {}) {
  const w = 60 * s, h = 78 * s;
  ctx.save(); ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot);
  ctx.save(); ctx.shadowColor = 'rgba(70,45,20,.15)'; ctx.shadowBlur = 10 * s; ctx.shadowOffsetY = 4 * s;
  ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2); ctx.lineTo(w / 2 - 16 * s, -h / 2); ctx.lineTo(w / 2, -h / 2 + 16 * s); ctx.lineTo(w / 2, h / 2); ctx.lineTo(-w / 2, h / 2); ctx.closePath(); ctx.fillStyle = o.fill || '#fff'; ctx.fill(); ctx.restore();
  ctx.strokeStyle = C.line; ctx.lineWidth = 2 * s; ctx.stroke();
  ctx.strokeStyle = o.lines || C.idle; ctx.lineWidth = 4 * s; ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-w / 2 + 10 * s, -h / 2 + 22 * s + i * 12 * s); ctx.lineTo(w / 2 - 10 * s - (i === 3 ? 16 * s : 0), -h / 2 + 22 * s + i * 12 * s); ctx.stroke(); }
  ctx.restore();
}
function c_sticky(x, y, w, h, rot, fn, fill = '#FBE38E') {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.save(); ctx.shadowColor = 'rgba(70,45,20,0.16)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 5;
  ctx.fillStyle = fill; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.restore();
  ctx.fillStyle = 'rgba(0,0,0,.06)'; ctx.fillRect(-w / 2, -h / 2, w, h * .16);
  fn(); ctx.restore();
}
// A paper card with a short label; drawn centered at x,y with scale s.
function c_paper(x, y, s, label, col = C.blue) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  card(-170, -52, 340, 104, { r: 18, stroke: col, lw: 3 });
  rr(-170, -52, 14, 104, [18, 0, 0, 18]); ctx.fillStyle = col; ctx.fill();
  text(label, 8, 2, { size: 27, weight: 700, align: 'center' });
  ctx.restore();
}
// On/off switch, left-center at x,y. on in 0..1.
function c_toggle(x, y, on, col = C.green, s = 1) {
  const w = 104 * s, h = 56 * s;
  rr(x, y - h / 2, w, h, h / 2); ctx.fillStyle = c_mix(C.idle, col, on); ctx.fill();
  const kx = lerp(x + h / 2, x + w - h / 2, eIO(on));
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.2)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 2;
  ctx.beginPath(); ctx.arc(kx, y, h / 2 - 5 * s, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore();
  text(on > .5 ? 'ON' : 'OFF', on > .5 ? x + 14 * s : x + w - 14 * s, y + 1, { size: 17 * s, weight: 800, color: on > .5 ? '#fff' : C.soft, align: on > .5 ? 'left' : 'right' });
}
// Filing cabinet, top-left at x,y.
function c_cabinet(x, y, w, h, col = C.soft, o = {}) {
  card(x, y, w, h, { r: 14, fill: o.fill || '#fff', stroke: col, lw: 4 });
  const n = 3, dh = (h - 24) / n;
  for (let i = 0; i < n; i++) {
    const dy = y + 12 + i * dh;
    rr(x + 14, dy + 5, w - 28, dh - 10, 8); ctx.fillStyle = o.drawer || '#FAF6EF'; ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.stroke();
    rr(x + w / 2 - w * .16, dy + dh * .3, w * .32, dh * .16, 4); ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.stroke();
    rr(x + w / 2 - w * .12, dy + dh * .62, w * .24, Math.max(8, dh * .1), 5); ctx.fillStyle = col; ctx.fill();
  }
}
// Shredder: slot on top at y, strips fall below while run > 0.
function c_shredder(x, y, t, run) {
  // strips into a basket
  if (run > 0) for (let i = 0; i < 11; i++) {
    const sx = x - 110 + i * 22, len = 20 + 70 * clamp01(run) + Math.sin(t * 6 + i) * 6;
    ctx.save(); ctx.strokeStyle = i % 3 ? '#fff' : C.blueL; ctx.lineWidth = 12; ctx.lineCap = 'butt';
    ctx.beginPath(); ctx.moveTo(sx, y + 92); for (let k = 1; k <= 6; k++) ctx.lineTo(sx + Math.sin(k * 1.3 + i + t * 3) * 4, y + 92 + len * k / 6); ctx.stroke();
    ctx.restore();
  }
  ctx.save(); ctx.strokeStyle = C.soft; ctx.lineWidth = 3; ctx.setLineDash([6, 8]);
  rr(x - 140, y + 95, 280, 105, 14); ctx.stroke(); ctx.restore();
  card(x - 165, y, 330, 95, { r: 18, fill: C.soft });
  rr(x - 130, y + 16, 260, 12, 6); ctx.fillStyle = C.ink; ctx.fill();
  text('shredder', x, y + 62, { size: 26, weight: 800, color: '#fff', align: 'center' });
  ctx.beginPath(); ctx.arc(x + 138, y + 62, 7, 0, 7); ctx.fillStyle = run > 0 ? C.green : C.idle; ctx.fill();
}
// Golden key centered at x,y (about 104*s wide).
function c_key(x, y, s = 1, col = C.cfY) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = col; ctx.strokeStyle = '#B98A1E'; ctx.lineWidth = 3;
  rr(-12, -7, 62, 14, 4); ctx.fill(); ctx.stroke();
  rr(28, 4, 9, 16, 2); ctx.fill(); ctx.stroke(); rr(41, 4, 9, 11, 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(-30, 0, 23, 0, 7); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(-30, 0, 8, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke();
  ctx.restore();
}
function c_coin(x, y, r, col = C.cfY) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = r * .14; ctx.strokeStyle = '#C98A1B'; ctx.stroke();
  text('$', x, y + 1, { size: r * 1.2, weight: 800, color: '#9A6A10', align: 'center' });
}
function c_calendar(x, y, s = 1) {
  rr(x - 22 * s, y - 20 * s, 44 * s, 42 * s, 7 * s); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = C.red; ctx.lineWidth = 3 * s; ctx.stroke();
  rr(x - 22 * s, y - 20 * s, 44 * s, 13 * s, [7 * s, 7 * s, 0, 0]); ctx.fillStyle = C.red; ctx.fill();
  ctx.fillStyle = C.soft; for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) ctx.fillRect(x - 14 * s + c * 11 * s, y + r * 9 * s, 6 * s, 5 * s);
}
function c_warn(x, y, s = 1, col = C.red) {
  ctx.beginPath(); ctx.moveTo(x, y - 34 * s); ctx.lineTo(x + 38 * s, y + 30 * s); ctx.lineTo(x - 38 * s, y + 30 * s); ctx.closePath();
  ctx.fillStyle = col; ctx.lineJoin = 'round'; ctx.lineWidth = 8 * s; ctx.strokeStyle = col; ctx.stroke(); ctx.fill();
  text('!', x, y + 8 * s, { size: 40 * s, weight: 800, color: '#fff', align: 'center' });
}
// House = a Durable Object "room" (from the reference). Body rect (x, y, w, h); roof drawn above y.
function c_house(x, y, w, h, o = {}) {
  const rh = o.roofH ?? w * .3;
  card(x, y, w, h, { r: 12, fill: o.fill || '#fff', stroke: o.stroke || C.line, lw: 2.5 });
  if (o.inner) o.inner();
  ctx.save(); ctx.shadowColor = 'rgba(70,45,20,0.13)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6;
  ctx.beginPath(); ctx.moveTo(x - 16, y + 4); ctx.lineTo(x + w / 2, y - rh); ctx.lineTo(x + w + 16, y + 4); ctx.closePath();
  ctx.fillStyle = o.roof || C.cf; ctx.fill(); ctx.restore();
  if (o.name) {
    const size = o.nameSize || 22, pw = measure(o.name, size, 800) + size * 1.2, ph = size * 1.6, cy = y - rh * .4;
    rr(x + w / 2 - pw / 2, cy - ph / 2, pw, ph, ph / 2); ctx.fillStyle = '#fff'; ctx.fill();
    text(o.name, x + w / 2, cy + 1, { size, weight: 800, color: C.orangeD, align: 'center' });
  }
}
// Memory props (chapter 4 metaphors), each about 240 x 200 centered at x,y.
function c_desk(x, y, t) {
  rr(x - 125, y + 44, 250, 18, 6); ctx.fillStyle = '#C89B6D'; ctx.fill();
  ctx.fillStyle = '#A97C50'; ctx.fillRect(x - 110, y + 62, 14, 58); ctx.fillRect(x + 96, y + 62, 14, 58);
  rr(x - 78, y - 80, 156, 104, 12); ctx.fillStyle = C.ink; ctx.fill();
  rr(x - 68, y - 70, 136, 84, 6); ctx.fillStyle = '#fff'; ctx.fill();
  const n = 1 + Math.floor((t * 1.2) % 3);
  for (let i = 0; i < n; i++) { const right = i % 2; rr(right ? x - 6 : x - 60, y - 62 + i * 25, 66, 18, 9); ctx.fillStyle = right ? C.blueL : C.accL; ctx.fill(); }
  ctx.fillStyle = C.ink; ctx.fillRect(x - 8, y + 24, 16, 20);
}
function c_warehouse(x, y) {
  card(x - 115, y - 30, 230, 130, { r: 8, stroke: C.line, lw: 2.5 });
  ctx.beginPath(); ctx.moveTo(x - 130, y - 26); ctx.lineTo(x, y - 95); ctx.lineTo(x + 130, y - 26); ctx.closePath(); ctx.fillStyle = C.acc; ctx.fill();
  rr(x - 52, y + 14, 104, 86, 4); ctx.fillStyle = C.idle; ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; for (let k = 1; k < 6; k++) { ctx.beginPath(); ctx.moveTo(x - 52, y + 14 + k * 14); ctx.lineTo(x + 52, y + 14 + k * 14); ctx.stroke(); }
  for (const [bx, by] of [[-95, 62], [-95, 30], [66, 62]]) { rr(x + bx, y + by, 30, 30, 4); ctx.fillStyle = '#E8C28E'; ctx.fill(); ctx.fillStyle = '#D6A96C'; ctx.fillRect(x + bx + 12, y + by, 6, 30); }
}
function c_library(x, y) {
  rr(x - 115, y - 100, 230, 200, 10); ctx.fillStyle = '#B98A5E'; ctx.fill();
  const cols = [C.blue, C.red, C.acc, C.cfY, C.purple, C.green, C.orange];
  for (let s = 0; s < 3; s++) {
    const sy = y - 88 + s * 64; rr(x - 102, sy, 204, 54, 4); ctx.fillStyle = '#F2E6D6'; ctx.fill();
    const r = rng(s * 13 + 5); let bx = x - 98;
    while (bx < x + 90) { const bw = 12 + Math.floor(r() * 12), bh = 36 + Math.floor(r() * 16); if (bx + bw > x + 98) break; ctx.fillStyle = cols[Math.floor(r() * cols.length)]; ctx.fillRect(bx, sy + 54 - bh, bw - 2, bh); bx += bw; }
  }
}
// small labelled box used in trees and wiring diagrams
function c_box(cx, cy, w, h, label, o = {}) {
  card(cx - w / 2, cy - h / 2, w, h, { r: o.r ?? 16, fill: o.fill || '#fff', stroke: o.stroke || C.line, lw: o.lw || 2.5, shadow: o.shadow });
  if (o.icon) { icon(o.icon, cx - w / 2 + 34, cy, 15, o.color || C.ink); text(label, cx - w / 2 + 62, cy + 1, { size: o.size || 26, weight: 700, color: o.color || C.ink }); }
  else text(label, cx, cy + 1, { size: o.size || 26, weight: 700, color: o.color || C.ink, align: 'center' });
}
// Model box: dark card with turning gears and a label.
function c_model(x, y, w, h, t, label = 'model') {
  card(x, y, w, h, { r: 22, fill: C.code });
  for (const [dx, dy, gr, dir] of [[52, h / 2 - 10, 24, 1], [86, h / 2 + 22, 16, -1]]) { ctx.save(); ctx.translate(x + dx, y + dy); ctx.rotate(t * 2 * dir); icon('gear', 0, 0, gr, C.cfY); ctx.restore(); }
  let size = 32; while (size > 20 && measure(label, size, 800) > w - 150) size -= 2;
  text(label, x + 120 + (w - 120) / 2, y + h / 2 + 1, { size, weight: 800, color: '#fff', align: 'center' });
}

// ===================== zdr =====================
const C_ZW = (j, w) => c_w('zdr', j, w);
const C_ZMODELS = [['Model A', 1], ['Model B', 1], ['Model C', 0], ['Model D', 1], ['Model E', 0]];
const C_ZLOG = [['prompt', 'Plan 5 days in Lisbon…', 0], ['answer', 'Day 1: Alfama walk…', 0], ['model', 'model name', 1], ['tokens', '1,204', 1], ['cost', '$0.03', 1], ['latency', '1.8 s', 1]];
const C_ZPROV = [['Provider A', 'zero retention', 1], ['Provider B', 'zero retention', 1], ['Provider C', 'keeps data', 0]];
function c_qCard(cx, cy, kind, label, n, t) {
  card(cx - 290, cy - 180, 580, 360, { r: 30, stroke: C.line, lw: 2.5 });
  node(cx - 240, cy - 130, 26, n, { fill: C.acc, stroke: C.acc, color: '#fff', size: 26 });
  if (kind === 'data') {
    c_doc(cx - 20, cy - 40, 1.7);
    const b = Math.sin(t * 3) * 5;
    node(cx + 50, cy - 90 + b, 36, '?', { fill: C.acc, stroke: '#fff', lw: 4, color: '#fff', size: 44 });
  } else c_key(cx, cy - 40, 1.4);
  text(label, cx, cy + 115, { size: 38, weight: 700, align: 'center' });
}
SCN.zdr = {
  chapter: CH.brain,
  draw(S, t) {
    // ---- line 0: two questions, then the first one ----
    alpha(S.out(1), () => {
      fade(S.p(0, .05), () => c_title('Two questions before sending data'));
      const f = S.pf(0, C_ZW(0, 'First'), .9, eIO);
      alpha(1 - f, () => pop(1300, 500, S.pf(0, .2, .6), () => c_qCard(1300, 500, 'key', 'Can I bring my own key?', 2, t)));
      pop(620, 500, S.pf(0, .08, .6), () => {
        const x = lerp(620, 960, f), s = lerp(1, 1.3, f);
        ctx.save(); ctx.translate(x, 500); ctx.scale(s, s); ctx.translate(-x, -500);
        c_qCard(x, 500, 'data', 'Is my data kept?', 1, t);
        ctx.restore();
      });
    });
    // ---- line 1: ZDR definition, prompt and answer into the shredder ----
    alpha(S.p(1) * S.out(2), () => {
      c_title('Zero data retention (ZDR)');
      fade(S.pf(1, .02, .5), () => c_model(800, 300, 320, 170, t));
      line(470, 385, 800, 385, C.line, 4, [6, 10]); line(1120, 385, 1450, 385, C.line, 4, [6, 10]);
      packet(470, 385, 800, 385, S.pf(1, .12, .7, c_lin), C.blue);
      packet(1120, 385, 1450, 385, S.pf(1, .3, .6, c_lin), C.green);
      const fp = S.pf(1, .56, 1, eIO), fa = S.pf(1, .6, 1, eIO);
      const paper = (p0, x0, label, col, fl) => pop(x0, 385, p0, () => alpha(1 - clamp01((fl - .85) / .15), () =>
        c_paper(lerp(x0, 960, fl), lerp(385, 610, fl), lerp(1, .35, fl), label, col)));
      [[300, fp], [1620, fa]].forEach(([x, fl]) => alpha(clamp01((fl - .5) * 2), () => {
        ctx.save(); ctx.setLineDash([8, 8]); rr(x - 170, 333, 340, 104, 18); ctx.strokeStyle = C.muted; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
        text('not stored', x, 386, { size: 28, weight: 700, color: C.muted, align: 'center' });
      }));
      paper(S.pf(1, .04, .5), 300, 'Plan 5 days in Lisbon', C.blue, fp);
      paper(S.pf(1, .38, .5), 1620, 'Day 1: Alfama walk…', C.green, fa);
      pop(960, 650, S.pf(1, .45, .5), () => c_shredder(960, 600, t, S.pf(1, .68, 1.2, c_lin)));
      pop(960, 250, S.pf(1, .66, .5), () => pill('ZDR = nothing stored after the request', 960, 250, { size: 30, fill: C.accL, color: C.acc }));
    });
    // ---- line 2: Cloudflare, Workers AI + ZDR per model ----
    alpha(S.p(2) * S.out(3), () => {
      c_provTitle('cf', 'Cloudflare');
      fade(S.p(2, .05), () => {
        card(100, 250, 780, 520, { r: 28, stroke: C.line, lw: 2.5 });
        rr(100, 250, 780, 90, [28, 28, 0, 0]); ctx.fillStyle = PV.cf.light; ctx.fill();
        icon('brain', 152, 295, 22, C.cf); text('Workers AI', 192, 296, { size: 36, weight: 800, color: PV.cf.ink });
      });
      const tw = C_ZW(2, 'train');
      fade(S.pf(2, .06, .5), () => {
        c_doc(230, 480, 1.4); text('your data', 230, 575, { size: 26, weight: 700, color: C.soft, align: 'center' });
        arrow(300, 480, 580, 480, S.pf(2, .08, .6), { color: C.muted, dash: [8, 10] });
        c_model(590, 410, 250, 140, t, 'training');
      });
      pop(440, 480, S.pf(2, tw, .5), () => { node(440, 480, 42, '', { fill: C.redL, stroke: C.red }); cross(440, 480, 38, C.red, S.pf(2, tw, .5)); });
      pop(490, 690, S.pf(2, tw + .05, .5), () => c_iconPill('no training on your data', 'shield', 490, 690, { size: 30, fill: C.greenL, stroke: C.green, color: C.green }));
      // outside models
      const ow = C_ZW(2, 'outside'), cw = C_ZW(2, 'covers'), mw = C_ZW(2, 'marked');
      fade(S.pf(2, ow, .5), () => text('Outside models, paid through Cloudflare', 1380, 300, { size: 30, weight: 800, align: 'center' }), 10);
      C_ZMODELS.forEach(([n, ok], i) => {
        const y = 350 + i * 76, mk = S.pf(2, cw + i * .05, .4);
        fade(S.pf(2, ow + .02 + i * .025, .4), () => {
          card(960, y, 840, 62, { r: 16, stroke: mk > 0 && ok ? C.green : C.line, lw: 2.5, shadow: false });
          icon('brain', 1000, y + 31, 15, C.soft); text(n, 1030, y + 32, { size: 28, weight: 700 });
          if (mk > 0) alpha(mk, () => {
            if (ok) { rr(1640, y + 13, 132, 36, 18); ctx.fillStyle = C.greenL; ctx.fill(); check(1668, y + 31, 20, C.green, mk); text('ZDR', 1690, y + 32, { size: 24, weight: 800, color: C.green }); }
            else { rr(1680, y + 27, 60, 8, 4); ctx.fillStyle = C.muted; ctx.fill(); }
          });
        }, 10);
      });
      // scanner that walks the rows while the marks tick in
      const sc = S.pf(2, cw, .05 * 5 * (S.le(2) - S.ls(2)) + .3, c_lin);
      if (sc > 0 && sc < 1) { const y = 350 + Math.min(4, Math.floor(sc * 5)) * 76; rr(955, y - 5, 850, 72, 18); ctx.strokeStyle = C.acc; ctx.lineWidth = 4; ctx.stroke(); }
      pop(1380, 790, S.pf(2, mw, .5), () => pill('marked model by model', 1380, 790, { size: 28, fill: C.accL, color: C.acc }));
    });
    // ---- line 3: AI Gateway logs by default; turn them off ----
    alpha(S.p(3) * S.out(4), () => {
      c_provTitle('cf', 'Cloudflare: AI Gateway logs');
      const off = S.pf(3, C_ZW(3, 'turn logging off'), .5), gw = C_ZW(3, 'whole gateway'), pr = C_ZW(3, 'per request');
      c_flow([[250, 420], [500, 420], [740, 420], [960, 420]], t, S.ls(3) + .2, 3, .45, C.blue);
      fade(S.p(3, .05), () => {
        atlas(180, 420, .9, t, { label: 'Atlas' });
        card(500, 360, 240, 120, { r: 20, stroke: C.cf, lw: 3 });
        icon('gear', 544, 420, 18, C.cf); text('AI Gateway', 570, 421, { size: 26, weight: 800 });
        c_model(960, 360, 280, 120, t);
        line(250, 420, 500, 420, C.line, 5); line(740, 420, 960, 420, C.line, 5);
      });
      const logP = S.pf(3, .06, .5), col = c_mix(C.red, C.muted, off);
      pop(620, 680, logP, () => alpha(1 - .45 * off, () => c_cabinet(490, 560, 260, 240, col, { drawer: off > .5 ? '#F4F1EC' : C.redL })));
      // copies of every request drop into the cabinet while logging is on
      if (logP > 0) for (let k = 0; k < 3; k++) {
        const t0 = S.ls(3) + .5 + k * .5, q = ((t - t0) * .8) % 1;
        if (t < t0 || t0 + Math.floor((t - t0) * .8) / .8 > S.at(3, C_ZW(3, 'turn logging off'))) continue;
        alpha(1 - q, () => { rr(600, 480 + q * 90, 40, 50, 5); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = C.red; ctx.lineWidth = 2.5; ctx.stroke(); });
      }
      pop(1000, 640, S.pf(3, C_ZW(3, 'by default'), .5), () => off > .5
        ? pill('logs: OFF', 1000, 640, { size: 26, fill: C.greenL, color: C.green })
        : pill('AI Gateway logs: ON by default', 1000, 640, { size: 26, fill: C.redL, color: C.red }));
      fade(S.pf(3, .3, .5), () => {
        card(1290, 300, 510, 120, { r: 24, stroke: C.line, lw: 2.5 });
        text('Logging', 1330, 361, { size: 34, weight: 800 });
        c_toggle(1650, 360, 1 - off, C.red);
      }, 12);
      pop(1545, 530, S.pf(3, gw, .5), () => c_iconPill('per gateway', 'gear', 1545, 530, { size: 28, fill: C.accL, stroke: C.acc, color: C.acc }));
      pop(1545, 640, S.pf(3, pr, .5), () => c_iconPill('per request', 'mail', 1545, 640, { size: 28, fill: C.accL, stroke: C.acc, color: C.acc }));
      fade(S.pf(3, pr + .04, .5), () => text('cf-aig-collect-log: false', 1545, 712, { size: 24, weight: 600, fam: MONO, color: C.soft, align: 'center' }), 8);
    });
    // ---- line 4: Vercel, metadata only + ZDR switch ----
    alpha(S.p(4) * S.out(5), () => {
      c_provTitle('vc', 'Vercel: metadata only');
      const nw = C_ZW(4, 'no prompts'), mw = C_ZW(4, 'only metadata'), sw = S.pf(4, C_ZW(4, 'one switch'), .6), fw = C_ZW(4, 'fails');
      fade(S.p(4, .05), () => {
        card(100, 250, 680, 510, { r: 26, stroke: C.line, lw: 2.5 });
        icon('doc', 145, 300, 18, C.soft); text('AI Gateway log', 175, 301, { size: 30, weight: 800 });
        line(130, 336, 750, 336, C.line, 2);
      });
      C_ZLOG.forEach(([k, v, keep], i) => {
        const y = 382 + i * 64, xp = keep ? S.pf(4, mw + i * .02, .4) : S.pf(4, nw + i * .03, .4);
        fade(S.pf(4, .04 + i * .02, .4), () => {
          alpha(keep ? 1 : 1 - .5 * xp, () => { text(k, 140, y, { size: 24, weight: 800, color: C.soft }); text(v, 270, y, { size: 26, weight: 600, fam: MONO }); });
          if (!keep && xp > 0) { line(260, y, lerp(260, 660, xp), y, C.red, 4); cross(720, y, 26, C.red, xp); }
          if (keep && xp > 0) check(720, y, 28, C.green, xp);
        }, 8);
      });
      // ZDR switch
      pop(1200, 310, S.pf(4, C_ZW(4, 'On Pro'), .5), () => {
        card(900, 260, 600, 100, { r: 24, stroke: sw > .5 ? C.green : C.line, lw: 3 });
        text('ZDR', 930, 311, { size: 36, weight: 800 });
        c_toggle(1030, 310, sw, C.green);
        badge('Pro / Enterprise', 1180, 295, { size: 20, fill: '#EDEDED', color: C.ink });
      });
      const gx = 1140, gy = 560, prIn = S.pf(4, C_ZW(4, 'routes'), .5);
      fade(S.pf(4, C_ZW(4, 'On Pro') + .02, .5), () => {
        card(900, 510, 240, 100, { r: 20, stroke: C.line, lw: 2.5 });
        logo('vc', 945, 560, .32); text('AI Gateway', 975, 561, { size: 26, weight: 800 });
      }, 10);
      C_ZPROV.forEach(([n, sub, ok], i) => {
        const py = 430 + i * 150, blocked = !ok && sw > .5;
        alpha(prIn, () => {
          line(gx, gy, 1440, py, blocked ? C.redL : C.line, 5, blocked ? [8, 10] : null);
          card(1440, py - 45, 360, 90, { r: 20, stroke: ok ? (sw > .5 ? C.green : C.line) : (sw > .5 ? C.red : C.line), lw: 3, fill: !ok && sw > .5 ? C.redL : '#fff' });
          text(n, 1468, py - 12, { size: 28, weight: 800 });
          text(sub, 1468, py + 22, { size: 22, weight: 700, color: ok ? C.green : C.red });
          if (blocked) { const mx = lerp(gx, 1440, .6), my = lerp(gy, py, .6); node(mx, my, 24, '', { fill: '#fff', stroke: C.red }); cross(mx, my, 24, C.red, sw); }
        });
      });
      // traffic: all three before the switch, only the zero-retention ones after
      if (prIn > 0) for (let k = 0; k < 6; k++) {
        const i = k % 3, q = ((t - S.ls(4)) * .5 + k / 6) % 1;
        if (i === 2 && sw > .5) continue;
        c_path([[gx, gy], [1440, 430 + i * 150]], q, sw > .5 ? C.green : C.blue, 8);
      }
      // a model only Provider C serves: the request fails instead of falling back
      const fr = S.pf(4, fw, .9, c_lin);
      if (fr > 0 && fr < 1) c_path([[gx, gy], [lerp(gx, 1440, .55), lerp(gy, 730, .55)]], fr, C.red, 12);
      pop(1080, 700, S.pf(4, fw + .03, .5), () => pill("fails, doesn't fall back", 1080, 700, { size: 26, fill: C.redL, color: C.red }));
    });
    // ---- line 5: AWS, Bedrock + org-wide retention mode ----
    alpha(S.p(5) * S.out(6), () => {
      c_provTitle('aws', 'AWS: Bedrock');
      pop(960, 255, S.p(5, .5, .5), () => c_iconPill('Bedrock: not stored by default', 'shield', 960, 255, { size: 30, fill: C.greenL, stroke: C.green, color: C.green }));
      const tr = C_ZW(5, 'data retention mode'), en = C_ZW(5, 'enforce'), wc = C_ZW(5, 'whole company');
      const teams = [560, 960, 1360];
      pop(960, 380, S.pf(5, tr, .5), () => c_box(960, 380, 280, 70, 'Company', { icon: 'globe', stroke: PV.aws.col, lw: 3 }));
      teams.forEach((x, i) => {
        const p = S.pf(5, tr + .04 + i * .02, .5);
        if (p > 0) line(960, 415, lerp(960, x, p), lerp(415, 480, p), C.line, 4);
        pop(x, 510, p, () => c_box(x, 510, 220, 62, 'Team ' + 'ABC'[i], { icon: 'user' }));
        [-95, 95].forEach((dx, k) => {
          const q = S.pf(5, tr + .1 + i * .02 + k * .01, .5);
          if (q > 0) line(x, 541, lerp(x, x + dx, q), lerp(541, 610, q), C.line, 3);
          pop(x + dx, 635, q, () => c_box(x + dx, 635, 170, 52, 'account', { size: 22, shadow: false }));
        });
      });
      // packets trickle down the tree
      if (S.pf(5, tr + .15) > 0) for (let k = 0; k < 6; k++) {
        const i = k % 3, dx = k < 3 ? -95 : 95, q = ((t - S.at(5, tr + .15)) * .5 + k / 6) % 1;
        c_path([[960, 415], [teams[i], 480], [teams[i], 541], [teams[i] + dx, 610]], q, C.green, 7);
      }
      const lk = S.pf(5, en, .6);
      alpha(lk, () => { ctx.save(); ctx.setLineDash([12, 10]); rr(370, 330, 1180, 345, 30); ctx.strokeStyle = PV.aws.smile; ctx.lineWidth = 5; ctx.stroke(); ctx.restore(); });
      pop(1550, 330, lk, () => { const b = Math.sin(t * 3) * 3; node(1550, 330 + b, 46, '', { fill: PV.aws.col, stroke: '#fff', lw: 4 }); icon('lock', 1550, 334 + b, 26, '#fff'); });
      pop(960, 770, S.pf(5, wc, .5), () => c_iconPill('retention mode: none, company-wide', 'lock', 960, 770, { size: 30, fill: PV.aws.light, stroke: PV.aws.col, color: PV.aws.col }));
    });
    // ---- line 6: frontier-model caveat ----
    alpha(S.p(6), () => {
      c_title('One caveat, on all three');
      const ws = PROVS.map(k => measure(PV[k].name, 24, 800) + 24 * 2.9), tot = ws.reduce((a, b) => a + b, 0) + 40;
      let x = 960 - tot / 2;
      PROVS.forEach((k, i) => { const xx = x; fade(S.p(6, .2 + i * .15, .5), () => provChip(k, xx, 240), 8); x += ws[i] + 20; });
      const nw = C_ZW(6, 'newest'), dw = C_ZW(6, 'thirty days'), aw = C_ZW(6, 'always');
      pop(960, 365, S.pf(6, nw, .5), () => {
        card(310, 305, 1300, 120, { r: 26, fill: C.redL, stroke: C.red, lw: 3 });
        c_warn(380, 364, .8);
        text('Newest frontier models: up to 30 days for safety checks', 1000, 366, { size: 34, weight: 700, color: C.red, align: 'center' });
      });
      [0, 1, 2].forEach(i => {
        const x = 360 + i * 420, bob = Math.sin(t * 2 + i) * 3;
        pop(x + 180, 545, S.pf(6, nw + .06 + i * .04, .5), () => {
          card(x, 470 + bob, 360, 150, { r: 24, stroke: C.line, lw: 2.5 });
          c_model(x + 20, 490 + bob, 320, 110, t, 'new model');
        });
        pop(x + 300, 470 + bob, S.pf(6, dw + i * .04, .5), () => {
          card(x + 220, 448 + bob, 170, 48, { r: 24, fill: '#fff', stroke: C.red, lw: 3 });
          c_calendar(x + 252, 472 + bob, .75); text('30 days', x + 320, 473 + bob, { size: 24, weight: 800, color: C.red, align: 'center' });
        });
      });
      pop(960, 745, S.pf(6, aw, .5), () => c_iconPill('check the model, not just the cloud', 'search', 960, 745, { size: 34, fill: C.acc, stroke: C.acc, color: '#fff' }));
    });
  },
};

// ===================== byok =====================
const C_BW = (j, w) => c_w('byok', j, w);
SCN.byok = {
  chapter: CH.brain,
  draw(S, t) {
    // ---- line 0: what BYOK means ----
    alpha(S.out(1), () => {
      const bw = C_BW(0, 'BYOK means'), tp = S.pf(0, bw, .5);
      alpha(S.p(0, .05) * (1 - tp), () => c_title('Second question: can I bring my own key?'));
      alpha(tp, () => c_title('BYOK = bring your own key'));
      pop(180, 460, S.p(0, .3, .5), () => atlas(180, 460, 1, t, { label: 'Atlas' }));
      const rw = C_BW(0, 'routes'), cl = C_BW(0, 'while the cloud');
      alpha(S.pf(0, .2, .5), () => { line(250, 460, 760, 460, C.line, 5); line(1160, 460, 1460, 460, C.line, 5); });
      c_flow([[250, 460], [760, 460], [1160, 460], [1460, 460]], t, S.at(0, rw), 3, .6, C.blue);
      pop(960, 460, S.pf(0, .2, .5), () => {
        card(760, 370, 400, 180, { r: 26, stroke: C.acc, lw: 3 });
        cloud(850, 455, .48, C.acc);
        text('cloud', 1040, 440, { size: 32, weight: 800, align: 'center' });
        text('router', 1040, 480, { size: 32, weight: 800, align: 'center' });
      });
      pop(1630, 460, S.pf(0, C_BW(0, 'Anthropic'), .5), () => {
        card(1460, 380, 340, 160, { r: 26, stroke: C.line, lw: 2.5 });
        icon('brain', 1515, 460, 24, C.ink);
        text('Anthropic', 1560, 440, { size: 30, weight: 800 }); text('OpenAI', 1560, 482, { size: 30, weight: 800 });
      });
      const kw = C_BW(0, 'your own contract'), kp = S.pf(0, kw, .5);
      pop(340, 710, kp, () => {
        card(70, 650, 560, 120, { r: 24, fill: '#FFF8E6', stroke: C.cfY, lw: 3 });
        text('your Anthropic / OpenAI', 385, 690, { size: 28, weight: 800, align: 'center' });
        text('contract', 385, 730, { size: 28, weight: 800, align: 'center' });
      });
      // the key rides from your contract, through the router, to the provider
      const kf = S.pf(0, cl, 1.4, eIO), pts = [[150, 710], [960, 560], [1630, 560]];
      if (kp > 0) { const [x, y] = kf > 0 ? c_along(pts, kf) : pts[0]; alpha(kp, () => c_key(x, y + Math.sin(t * 3) * 3, .9)); }
      pop(960, 620, S.pf(0, rw, .5), () => pill('the cloud just routes', 960, 620, { size: 28, fill: C.accL, color: C.acc }));
    });
    // ---- line 1: Cloudflare BYOK + the silent-billing gotcha ----
    alpha(S.p(1) * S.out(2), () => {
      c_provTitle('cf', 'Cloudflare: yes');
      const sw = C_BW(1, 'Store'), fw = C_BW(1, 'no extra fee'), gw = C_BW(1, 'One gotcha'), nw = C_BW(1, 'no key is found'), uw = C_BW(1, 'unless'), rw = C_BW(1, 'require provider');
      const empty = S.pf(1, nw, .4), req = S.pf(1, rw, .5), drop = S.pf(1, sw, .7, eIO);
      alpha(S.p(1, .05), () => { line(240, 450, 430, 450, C.line, 5); line(1010, 415, 1400, 415, C.line, 5); });
      c_flow([[240, 450], [430, 450], [1010, 415], [1400, 415]], t, S.at(1, sw + .05), 3, .45, C.blue);
      fade(S.p(1, .05), () => {
        atlas(170, 450, .9, t, { label: 'Atlas' });
        card(430, 320, 580, 260, { r: 26, stroke: C.cf, lw: 3 });
        logo('cf', 485, 362, .42); text('AI Gateway', 525, 363, { size: 32, weight: 800 });
        ctx.save(); ctx.setLineDash([8, 8]); rr(520, 405, 400, 100, 18); ctx.strokeStyle = empty > .5 ? C.red : C.muted; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
        text('provider keys', 720, 545, { size: 24, weight: 700, color: C.soft, align: 'center' });
        card(1400, 360, 380, 110, { r: 22, stroke: C.line, lw: 2.5 });
        icon('brain', 1450, 415, 22, C.ink); text('Anthropic', 1490, 416, { size: 30, weight: 800 });
        card(1400, 600, 380, 120, { r: 22, stroke: empty > .5 ? C.red : C.line, lw: 3 });
        c_coin(1455, 660, 26); text('Cloudflare credits', 1500, 661, { size: 28, weight: 800 });
      });
      // key drops into the slot, then goes missing
      alpha(drop * (1 - empty), () => c_key(720, lerp(230, 455, drop), 1.1));
      if (empty > 0) alpha(empty * (1 - S.pf(1, uw, .5)), () => text('no key found', 720, 457, { size: 28, weight: 800, color: C.red, align: 'center' }));
      alpha(S.pf(1, uw, .5), () => text('key required', 720, 457, { size: 28, weight: 800, color: C.green, align: 'center' }));
      pop(720, 272, S.pf(1, fw, .5) * S.out(1, (gw) * (S.le(1) - S.ls(1)), .4), () => pill('no fee', 720, 272, { size: 28, fill: C.greenL, color: C.green }));
      pop(720, 272, S.pf(1, gw, .5), () => pill('one gotcha', 720, 272, { size: 28, fill: C.redL, color: C.red }));
      // missing key: coins quietly drain from the credits
      alpha(empty, () => line(1010, 520, 1400, 650, req > .5 ? C.line : C.redL, 5, [8, 10]));
      if (empty > 0 && req < 1) for (let k = 0; k < 3; k++) {
        const q = ((t - S.at(1, nw)) * .55 + k / 3) % 1; if (q <= 0) continue;
        const [x, y] = c_along([[1400, 650], [1010, 520]], q);
        alpha((1 - req) * (1 - clamp01((q - .8) / .2)), () => c_coin(x, y, 18));
      }
      pop(1590, 772, empty * (1 - req), () => pill('billed silently', 1590, 772, { size: 26, fill: C.redL, color: C.red }));
      pop(720, 700, S.pf(1, uw, .5), () => {
        card(430, 640, 580, 120, { r: 24, stroke: req > .5 ? C.green : C.line, lw: 3 });
        text('Require provider', 460, 682, { size: 26, weight: 800 }); text('credentials', 460, 718, { size: 26, weight: 800 });
        c_toggle(860, 700, req, C.green);
      });
      pop(1205, 585, req, () => { node(1205, 585, 28, '', { fill: '#fff', stroke: C.red }); cross(1205, 585, 28, C.red, req); });
    });
    // ---- line 2: Vercel BYOK, credits needed, automatic retry ----
    alpha(S.p(2) * S.out(3), () => {
      c_provTitle('vc', 'Vercel: yes');
      const tw = C_BW(2, 'per team'), rq = C_BW(2, 'even per request'), mk = C_BW(2, 'no markup'), cr = C_BW(2, 'requires purchased'), fw = C_BW(2, 'if your key fails'), aw = C_BW(2, 'automatically');
      pop(640, 262, S.pf(2, tw, .5), () => pill('per team', 640, 262, { size: 28, stroke: C.line }));
      pop(920, 262, S.pf(2, rq, .5), () => pill('per request', 920, 262, { size: 28, stroke: C.line }));
      pop(1230, 262, S.pf(2, mk, .5), () => pill('0% markup', 1230, 262, { size: 28, fill: C.greenL, color: C.green }));
      const failP = S.pf(2, fw, .4), retry = S.pf(2, aw, .8);
      alpha(S.p(2, .05), () => { line(240, 500, 420, 500, C.line, 5); line(880, 470, 1440, 390, failP > .5 ? C.redL : C.line, 5, failP > .5 ? [8, 10] : null); });
      c_flow([[240, 500], [420, 500], [880, 470], failP > .5 ? [1130, 434] : [1440, 390]], t, S.ls(2) + .3, 3, .5, failP > .5 ? C.red : C.blue);
      fade(S.p(2, .05), () => {
        atlas(170, 500, .9, t, { label: 'Atlas' });
        card(420, 410, 460, 180, { r: 26, stroke: C.line, lw: 3 });
        logo('vc', 470, 455, .34); text('AI Gateway', 505, 456, { size: 30, weight: 800 });
        card(1440, 330, 360, 110, { r: 22, stroke: C.line, lw: 2.5 });
        icon('brain', 1490, 385, 22, C.ink); text('Anthropic', 1530, 386, { size: 30, weight: 800 });
      });
      fade(S.p(2, .1), () => { c_key(560, 535, .7); text('your key', 690, 537, { size: 26, weight: 700, color: C.soft }); }, 8);
      pop(1160, 430, failP, () => { node(1160, 430, 30, '', { fill: '#fff', stroke: C.red }); cross(1160, 430, 30, C.red, failP); });
      pop(650, 660, S.pf(2, cr, .5), () => { const w = pill('needs purchased credits', 670, 660, { size: 26, fill: '#F2F2F2', color: C.ink }); c_coin(670 - w / 2 - 30, 660, 22); });
      // retry through Vercel's own keys
      pop(1620, 670, S.pf(2, aw - .06, .5), () => {
        card(1440, 610, 360, 120, { r: 22, stroke: retry > .5 ? C.green : C.line, lw: 3 });
        c_key(1500, 670, .55, C.idle); text("Vercel's keys", 1550, 671, { size: 30, weight: 800 });
      });
      arrow(880, 540, 1440, 670, retry, { color: C.green, lw: 5 });
      arrow(1620, 610, 1620, 450, S.pf(2, aw + .05, .5), { color: C.green, lw: 5 });
      if (retry >= 1) c_flow([[880, 540], [1440, 670], [1620, 610], [1620, 450]], t, S.at(2, aw) + .8, 2, .6, C.green);
      pop(1160, 770, S.pf(2, aw + .03, .5), () => pill('automatic retry', 1160, 770, { size: 26, fill: C.greenL, color: C.green }));
    });
    // ---- line 3: AWS, no key to bring + AgentCore Identity vault ----
    alpha(S.p(3) * S.out(4), () => {
      c_provTitle('aws', 'AWS: no key to bring');
      const bg = C_BW(3, 'But AgentCore'), vw = C_BW(3, 'vault'), nv = C_BW(3, 'never sees');
      pop(400, 440, S.p(3, .1, .6), () => {
        card(100, 260, 600, 360, { r: 26, stroke: C.line, lw: 2.5 });
        rr(100, 260, 600, 80, [26, 26, 0, 0]); ctx.fillStyle = PV.aws.light; ctx.fill();
        logo('aws', 160, 300, .5); text('AWS bill', 215, 301, { size: 32, weight: 800, color: PV.aws.ink });
        ['Bedrock', 'Lambda', 'S3'].forEach((n, i) => {
          const y = 380 + i * 50; text(n, 140, y, { size: 26, weight: 700 });
          ctx.save(); ctx.setLineDash([3, 8]); line(280, y + 6, 560, y + 6, C.muted, 3); ctx.restore();
          rr(580, y - 10, 80, 20, 10); ctx.fillStyle = C.idle; ctx.fill();
        });
        line(130, 530, 670, 530, C.line, 2);
      });
      pop(400, 575, S.pf(3, C_BW(3, 'no key to bring'), .5), () => { check(150, 575, 30, C.green); text('Bedrock: no key needed', 180, 576, { size: 30, weight: 800, color: C.green }); });
      // vault
      const vp = S.pf(3, bg, .6);
      pop(1320, 470, vp, () => {
        card(1080, 290, 480, 360, { r: 28, fill: PV.aws.col });
        text('AgentCore Identity', 1272, 320, { size: 26, weight: 800, color: '#fff', align: 'center' });
        rr(1105, 345, 335, 280, 18); ctx.fillStyle = '#EEF2F8'; ctx.fill();
        const spin = S.pf(3, vw, 1) * Math.PI * 2 + t * .3;
        node(1500, 470, 36, '', { fill: '#3A4A60', stroke: PV.aws.smile, lw: 5 });
        ctx.save(); ctx.translate(1500, 470); ctx.rotate(spin); ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.lineCap = 'round';
        for (let k = 0; k < 4; k++) { ctx.rotate(Math.PI / 2); ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(0, 26); ctx.stroke(); } ctx.restore();
        rr(1470, 560, 60, 12, 6); ctx.fillStyle = '#3A4A60'; ctx.fill();
      });
      ['OpenAI', 'Gemini', 'Anthropic'].forEach((n, i) => pop(1272, 405 + i * 80, S.pf(3, C_BW(3, n), .5), () => c_iconPill(n, 'key', 1272, 405 + i * 80, { size: 26, fill: '#FFF8E6', stroke: C.cfY })));
      pop(1700, 470, S.pf(3, vw, .5), () => { card(1610, 420, 190, 100, { r: 20, stroke: C.line, lw: 2.5 }); icon('brain', 1650, 470, 18, C.ink); text('model', 1680, 471, { size: 26, weight: 800 }); });
      pop(850, 640, S.pf(3, vw, .5), () => atlas(850, 640, .9, t, { label: 'Atlas' }));
      if (S.pf(3, vw + .03) > 0) {
        line(915, 610, 1080, 560, C.line, 4); line(1560, 470, 1610, 470, C.line, 4);
        const q = ((t - S.at(3, vw + .03)) * .4) % 1;
        c_path([[915, 610], [1080, 560]], q * 3, C.blue, 9);              // request in (no key)
        if (q > 1 / 3 && q < 2 / 3) { const [x, y] = c_along([[1560, 470], [1610, 470]], (q - 1 / 3) * 3); c_key(x, y - 26, .4); }
        c_path([[1080, 560], [915, 610]], q * 3 - 2, C.green, 9);         // answer out
      }
      pop(850, 790, S.pf(3, nv, .5), () => c_iconPill('never sees the key', 'eye', 850, 790, { size: 28, fill: C.greenL, stroke: C.green, color: C.green }));
    });
    // ---- line 4: buying models through the cloud ----
    alpha(S.p(4), () => {
      fade(S.p(4, .05), () => c_title('Buying models through the cloud'));
      const cols = [
        ['cf', 'Cloudflare adds', '+5%', 'fee on credits', C.cf],
        ['vc', 'Vercel adds', '0%', 'markup', C.green],
        ['aws', 'Bedrock bills', 'list prices', "Bedrock's own, on your AWS bill", PV.aws.col],
      ];
      cols.forEach(([k, word, big, sub, col], i) => {
        const x = 150 + i * 560, cx = x + 250, p = S.pf(4, C_BW(4, word), .6);
        pop(cx, 510, p, () => {
          card(x, 250, 500, 540, { r: 28, stroke: C.line, lw: 2.5 });
          provTile(k, cx, 350, 56);
          text(big, cx, 520, { size: big.length > 4 ? 56 : 80, weight: 800, color: col, align: 'center' });
          wrap(sub, 440, 28, 700).forEach((ln, j) => text(ln, cx, 590 + j * 38, { size: 28, weight: 700, color: C.soft, align: 'center' }));
          // coin stack: the model price, plus Cloudflare's fee coin on top
          for (let c = 0; c < 3; c++) { rr(cx - 50, 740 - c * 16, 100, 20, 10); ctx.fillStyle = C.cfY; ctx.fill(); ctx.strokeStyle = '#C98A1B'; ctx.lineWidth = 2.5; ctx.stroke(); }
          if (k === 'cf') { const d = S.pf(4, C_BW(4, '5%'), .6, eOut); alpha(d, () => { rr(cx - 50, lerp(620, 692, d), 100, 20, 10); ctx.fillStyle = C.cf; ctx.fill(); }); }
        });
      });
    });
  },
};

// ===================== memory (chapter title + the four metaphors) =====================
const C_MEM = [['the chat', 'chat', 'desk', 'the chat'], ['preferences', 'star', 'filing cabinet', 'preferences'], ['files', 'doc', 'warehouse', 'files like tickets'], ['search by meaning', 'search', 'library', 'search by meaning']];
SCN.memory = {
  chapter: CH.memory,
  draw(S, t) {
    chapterTitle(S, 4, 'Memory', 'memory');
    const t0 = S.ls(0) + 3.0;
    fade(P(t, t0, .6), () => c_title('What Atlas must remember'));
    const needW = [c_w('memory', 0, 'the chat'), c_w('memory', 0, 'preferences'), c_w('memory', 0, 'files'), c_w('memory', 0, 'search')];
    const propW = [c_w('memory', 1, 'desk'), c_w('memory', 1, 'filing'), c_w('memory', 1, 'warehouse'), c_w('memory', 1, 'library')];
    C_MEM.forEach(([need, ic, prop, word], i) => {
      const x = 150 + i * 420, cx = x + 190, appear = P(t, Math.max(S.at(0, needW[i]), t0 + i * .1), .6);
      const pp = S.pf(1, propW[i], .6), bob = Math.sin(t * 2 + i) * 3;
      pop(cx, 530, appear, () => {
        card(x, 300, 380, 460, { r: 28, stroke: pp > 0 ? C.acc : C.line, lw: pp > 0 ? 3.5 : 2.5 });
        alpha(1 - pp, () => { node(cx, 430 + bob, 70, '', { fill: C.accL, stroke: C.accL }); icon(ic, cx, 430 + bob, 34, C.acc); });
        pop(cx, 440, pp, () => {
          if (i === 0) c_desk(cx, 410, t);
          else if (i === 1) c_cabinet(cx - 85, 335, 170, 210, C.acc, { drawer: C.accL });
          else if (i === 2) c_warehouse(cx, 440);
          else c_library(cx, 440);
        });
        text(need, cx, 640 - pp * 0, { size: 34, weight: 800, align: 'center' });
        alpha(pp, () => pill(prop, cx, 710, { size: 26, fill: C.accL, color: C.acc, shadow: false }));
      });
    });
  },
};

// ===================== memory_cf =====================
const C_CW = (j, w) => c_w('memory_cf', j, w);
const C_CHAT = [['user', 'Plan 5 days in Lisbon'], ['atlas', 'Budget?'], ['user', 'under $2,000'], ['atlas', "Here's day 1…"]];
const C_CL = [['beach hotels', .22, .38, C.teal], ['city hotels', .45, .76, C.blue], ['museums', .78, .38, C.orange], ['food', .76, .78, C.purple]];
const C_PTS = (() => { const r = rng(17), out = []; C_CL.forEach(([, cx, cy, col], c) => { for (let i = 0; i < 10; i++) out.push({ nx: cx + (r() - .5) * .18, ny: cy + (r() - .5) * .2, sx: .08 + r() * .84, sy: .2 + r() * .72, col, c }); }); return out; })();
SCN.memory_cf = {
  chapter: CH.memory,
  draw(S, t) {
    // ---- line 0: each agent's own SQL database, next to the code ----
    alpha(S.out(1), () => {
      fade(S.p(0, .05), () => c_provTitle('cf', 'Cloudflare: built in'));
      pop(960, 232, S.p(0, .4, .5), () => pill('almost all of it, first-party', 960, 232, { size: 26, fill: C.cfL, color: C.orangeD, shadow: false }));
      const ew = C_CW(0, 'Every agent'), sq = C_CW(0, 'SQL database'), ch = C_CW(0, 'the chat lives'), nx = C_CW(0, 'next to');
      [[160, "ken's Atlas"], [1540, "ana's Atlas"]].forEach(([x, n], i) => pop(x + 110, 640, S.pf(0, ew + .06 + i * .04, .5), () =>
        c_house(x, 540, 220, 220, { roofH: 70, name: n, nameSize: 18, inner: () => { icon('db', x + 110, 640, 34, C.cf); atlas(x + 110, 720, .35, t); } })));
      pop(960, 580, S.pf(0, ew, .6), () => c_house(560, 380, 800, 420, { roofH: 110, name: "maria's Atlas", nameSize: 26, inner: () => {
        card(595, 420, 310, 340, { r: 18, fill: C.code, shadow: false });
        text('Atlas code', 750, 452, { size: 24, weight: 800, color: '#A59C8F', align: 'center' });
        [[.7, CODE.kw], [.5, CODE.fn], [.8, CODE.text], [.4, CODE.str], [.65, CODE.fn], [.55, CODE.text]].forEach(([w, c], k) => { rr(625, 492 + k * 38, 250 * w, 14, 7); ctx.fillStyle = c; ctx.fill(); });
        atlas(750, 720, .38, t);
        fade(S.pf(0, sq, .5), () => {
          card(935, 420, 395, 340, { r: 18, fill: '#fff', stroke: C.cf, lw: 3, shadow: false });
          rr(935, 420, 395, 56, [18, 18, 0, 0]); ctx.fillStyle = C.cfL; ctx.fill();
          icon('db', 968, 448, 15, C.cf); text('SQL database', 992, 449, { size: 26, weight: 800, color: C.orangeD });
          C_CHAT.forEach(([who, s], k) => fade(S.pf(0, ch + k * .04, .4), () => {
            const y = 510 + k * 62; rr(952, y - 22, 362, 46, 10); ctx.fillStyle = who === 'user' ? C.cfL : C.blueL; ctx.fill();
            text(s, 968, y + 1, { size: 22, weight: 600, fam: MONO });
          }, 8));
        }, 10);
      } }));
      // code <-> chat link
      const lp = S.pf(0, nx, .5);
      alpha(lp, () => { line(890, 600, 950, 600, C.cf, 5); ctx.beginPath(); ctx.arc(920, 600, 13 + Math.sin(t * 5) * 2, 0, 7); ctx.fillStyle = C.cf; ctx.fill(); });
      pop(960, 830, lp, () => pill('the chat lives next to the code', 960, 822, { size: 26, fill: C.cfL, color: C.orangeD }));
    });
    // ---- line 1: KV, D1, R2 ----
    alpha(S.p(1) * S.out(2), () => {
      c_provTitle('cf', 'KV, D1 and R2');
      const items = [['KV', 'bolt', 'fast lookups', 'KV'], ['D1', 'db', 'shared SQL tables', 'D1'], ['R2', 'box', 'files', 'R2']];
      items.forEach(([n, ic, sub, word], i) => {
        const x = 120 + i * 580, cx = x + 260, p = S.pf(1, C_CW(1, word), .6);
        pop(cx, 500, p, () => {
          card(x, 260, 520, 470, { r: 28, stroke: C.line, lw: 2.5 });
          node(cx, 350, 56, '', { fill: C.cfL, stroke: C.cfL }); icon(ic, cx, 350, 28, C.cf);
          text(n, cx, 450, { size: 52, weight: 800, align: 'center' });
          text(sub, cx, 505, { size: 30, weight: 700, color: C.soft, align: 'center' });
          if (i === 0) {  // sticky notes that flash on lookup
            ['city → LIS', 'fx → 1.08'].forEach((s, k) => { const fl = .5 + .5 * Math.sin(t * 4 + k * 2); c_sticky(cx - 110 + k * 220, 620, 190, 74, k ? .05 : -.05, () => text(s, 0, 6, { size: 24, weight: 700, fam: MONO, align: 'center' }), c_mix('#FBE38E', '#FFF3BF', fl)); });
          } else if (i === 1) {  // a shared table, row highlight walking down
            const hl = Math.floor(t * 1.5) % 3;
            for (let r = 0; r < 3; r++) { rr(x + 60, 570 + r * 44, 400, 36, 8); ctx.fillStyle = r === hl ? C.cfL : '#F7F2EA'; ctx.fill(); for (let c = 0; c < 3; c++) { rr(x + 76 + c * 128, 583 + r * 44, 90, 10, 5); ctx.fillStyle = C.idle; ctx.fill(); } }
          } else {  // boxes on a shelf, a file downloading
            for (let b = 0; b < 3; b++) { rr(x + 80 + b * 130, 580, 100, 70, 8); ctx.fillStyle = '#E8C28E'; ctx.fill(); ctx.fillStyle = '#D6A96C'; ctx.fillRect(x + 122 + b * 130, 580, 16, 70); }
            rr(x + 60, 652, 400, 12, 4); ctx.fillStyle = C.idle; ctx.fill();
          }
        });
      });
      const fw = S.pf(1, C_CW(1, 'no fees'), .5);
      pop(1540, 790, fw, () => c_iconPill('free downloads', 'coin', 1540, 790, { size: 28, fill: C.greenL, stroke: C.green, color: C.green }));
      if (fw >= 1) for (let k = 0; k < 2; k++) { const q = ((t - S.at(1, C_CW(1, 'no fees'))) * .7 + k / 2) % 1; alpha(1 - q, () => arrow(1720, 555 + q * 60, 1720, 595 + q * 60, 1, { color: C.green, lw: 5 })); }
    });
    // ---- line 2: search by meaning + Agent Memory ----
    alpha(S.p(2), () => {
      c_title('Find by meaning, remember the person');
      const R = { x: 100, y: 250, w: 900, h: 520 }, P2 = (nx, ny) => [R.x + nx * R.w, R.y + ny * R.h];
      const cl = S.p(2, .1, 1.6, eIO);
      fade(S.p(2, 0, .5), () => {
        card(R.x, R.y, R.w, R.h, { r: 24 });
        ctx.save(); ctx.strokeStyle = C.line; ctx.lineWidth = 1.5; for (let k = 1; k < 6; k++) { ctx.beginPath(); ctx.moveTo(R.x + k * R.w / 6, R.y + 70); ctx.lineTo(R.x + k * R.w / 6, R.y + R.h - 10); ctx.stroke(); } for (let k = 1; k < 5; k++) { ctx.beginPath(); ctx.moveTo(R.x + 10, R.y + 70 + k * (R.h - 70) / 5); ctx.lineTo(R.x + R.w - 10, R.y + 70 + k * (R.h - 70) / 5); ctx.stroke(); } ctx.restore();
        C_PTS.forEach(q => { const [x, y] = P2(lerp(q.sx, q.nx, cl), lerp(q.sy, q.ny, cl)); ctx.beginPath(); ctx.arc(x, y, 9, 0, 7); ctx.fillStyle = q.col; ctx.fill(); });
      }, 16);
      C_CL.forEach(([n, cx, cy, col], c) => fade(S.p(2, 1.4 + c * .1, .4), () => text(n, R.x + cx * R.w, R.y + (cy - .15) * R.h, { size: 24, weight: 800, color: col, align: 'center' }), 0));
      pop(250, 295, S.p(2, .1, .5), () => pill('Vectorize', 250, 295, { size: 26, fill: C.cfL, color: C.orangeD, shadow: false }));
      pop(470, 295, S.pf(2, C_CW(2, 'AI Search'), .5), () => pill('AI Search', 470, 295, { size: 26, fill: C.cfL, color: C.orangeD, shadow: false }));
      // a query lands and lights up its nearest neighbours
      const qp = S.pf(2, C_CW(2, 'find things'), .5), [qx, qy] = P2(.3, .5);
      if (qp > 0) {
        const nn = C_PTS.map(q => { const [x, y] = P2(q.nx, q.ny); return { x, y, d: Math.hypot(x - qx, y - qy) }; }).sort((a, b) => a.d - b.d).slice(0, 3);
        nn.forEach((n, k) => { const p = S.pf(2, C_CW(2, 'by meaning') + k * .03, .4); if (p <= 0) return; line(qx, qy, lerp(qx, n.x, p), lerp(qy, n.y, p), C.cf, 4); ctx.beginPath(); ctx.arc(n.x, n.y, 15 + Math.sin(t * 4 + k) * 2, 0, 7); ctx.strokeStyle = C.cf; ctx.lineWidth = 4; ctx.stroke(); });
        pop(qx, qy, qp, () => { const pr = (t * 1.2) % 1; ctx.beginPath(); ctx.arc(qx, qy, 16 + pr * 30, 0, 7); ctx.strokeStyle = `rgba(243,128,32,${1 - pr})`; ctx.lineWidth = 3; ctx.stroke(); icon('star', qx, qy, 24, C.cf); });
      }
      // Agent Memory
      const am = C_CW(2, 'Agent Memory'), rf = C_CW(2, 'remembers');
      pop(1430, 510, S.pf(2, am, .6), () => {
        card(1060, 250, 740, 520, { r: 26, stroke: C.cf, lw: 3 });
        text('Agent Memory', 1100, 310, { size: 38, weight: 800 });
        badge('private beta', 1100 + measure('Agent Memory', 38, 800) + 18, 294, { size: 20 });
        atlas(1230, 520, 1.3, t, { mood: S.pf(2, rf) > 0 ? 'happy' : 'ok' });
        person(1230, 690, .6, C.teal);
      });
      const sp = S.pf(2, rf, .6);
      if (sp > 0) line(1310, 510, lerp(1310, 1480, sp), lerp(510, 500, sp), C.cf, 4, [6, 8]);
      pop(1600, 500, sp, () => c_sticky(1600, 500 + Math.sin(t * 2) * 3, 280, 170, -.04, () => {
        text('prefers', 0, -30, { size: 32, weight: 800, align: 'center' });
        text('window seats', 0, 18, { size: 32, weight: 800, align: 'center' });
      }));
      pop(1600, 690, S.pf(2, rf + .06, .5), () => pill('facts about each user', 1600, 690, { size: 24, fill: C.cfL, color: C.orangeD, shadow: false }));
    });
  },
};

// ===================== memory_vc =====================
const C_VW = (j, w) => c_w('memory_vc', j, w);
const C_SHOP = [['Neon', 'Postgres', '#00C08B', 'Neon'], ['Supabase', 'Postgres', '#3ECF8E', 'Supabase'], ['Upstash', 'Redis & Vector', '#E0453A', 'Upstash'], ['Mem0', 'agent memory', C.purple, 'Mem0']];
SCN.memory_vc = {
  chapter: CH.memory,
  draw(S, t) {
    // ---- line 0: Blob + Global Config ----
    alpha(S.out(1), () => {
      fade(S.p(0, .05), () => c_provTitle('vc', 'Vercel: fewer pieces of its own'));
      pop(960, 232, S.p(0, .4, .5) * (1 - S.pf(0, C_VW(0, 'Vercel Blob'), .4)), () => pill('first-party storage: just two pieces', 960, 232, { size: 26, fill: '#fff', stroke: C.line, color: C.ink, shadow: false }));
      const bw = C_VW(0, 'Vercel Blob'), gw = C_VW(0, 'Global Config'), fw = C_VW(0, 'formerly'), sw = C_VW(0, 'small settings');
      pop(530, 515, S.pf(0, bw, .6), () => {
        card(160, 280, 740, 470, { r: 28, stroke: C.line, lw: 2.5 });
        logo('vc', 220, 340, .36); text('Vercel Blob', 260, 341, { size: 40, weight: 800 });
        text('files', 260, 390, { size: 30, weight: 700, color: C.soft });
        // files dropping into a bucket
        ctx.beginPath(); ctx.moveTo(390, 560); ctx.lineTo(670, 560); ctx.lineTo(640, 720); ctx.lineTo(420, 720); ctx.closePath(); ctx.fillStyle = '#F2F2F2'; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.stroke();
        for (let k = 0; k < 3; k++) { const q = ((t - S.at(0, bw)) * .6 + k / 3) % 1; alpha(1 - clamp01((q - .75) / .25), () => c_doc(470 + k * 60, lerp(430, 640, eIO(q)), .8, { rot: (k - 1) * .2 })); }
      });
      pop(1390, 515, S.pf(0, gw, .6), () => {
        card(1020, 280, 740, 470, { r: 28, stroke: C.line, lw: 2.5 });
        logo('vc', 1080, 340, .36); text('Global Config', 1120, 341, { size: 40, weight: 800 });
        fade(S.pf(0, fw, .5), () => text('formerly Edge Config', 1120, 390, { size: 26, weight: 600, color: C.soft }), 6);
        fade(S.pf(0, sw, .5), () => {
          [['currency', 'EUR', 0], ['newPlanner', null, 1], ['maxDays', '14', 0]].forEach(([k, v, tg], i) => {
            const y = 480 + i * 72; rr(1070, y - 28, 640, 56, 14); ctx.fillStyle = '#F4F4F4'; ctx.fill();
            text(k, 1095, y + 1, { size: 26, weight: 600, fam: MONO });
            if (tg) c_toggle(1590, y, .5 + .5 * Math.sin(t * 1.5) > .5 ? 1 : 0, C.green, .8); else text(v, 1690, y + 1, { size: 26, weight: 700, fam: MONO, align: 'right' });
          });
          badge('1 MB per store', 1740, 300, { align: 'right', size: 20, fill: '#EDEDED', color: C.ink });
        }, 10);
      });
      fade(S.pf(0, sw + .02, .5), () => text('small settings', 1390, 715, { size: 28, weight: 700, color: C.soft, align: 'center' }), 6);
    });
    // ---- lines 1-2: the Marketplace storefront ----
    alpha(S.p(1), () => {
      c_provTitle('vc', 'Vercel Marketplace');
      const pw = C_VW(2, 'partners');
      fade(S.p(1, .05), () => {
        card(140, 300, 1640, 360, { r: 18, stroke: C.line, lw: 2.5 });
        for (let k = 0; k < 14; k++) { const x = 120 + k * 120; ctx.beginPath(); ctx.moveTo(x, 240); ctx.lineTo(x + 120, 240); ctx.lineTo(x + 120, 290); ctx.arc(x + 60, 290, 60, 0, Math.PI); ctx.closePath(); ctx.fillStyle = k % 2 ? '#fff' : PV.vc.col; ctx.fill(); }
        ctx.strokeStyle = PV.vc.col; ctx.lineWidth = 3; rr(120, 240, 1680, 50, 6); ctx.stroke();
      }, 12);
      C_SHOP.forEach(([n, sub, col, word], i) => {
        const x = 180 + i * 400, cx = x + 180, mem = i === 3;
        const ap = mem ? S.pf(2, C_VW(2, word), .6) : S.pf(1, C_VW(1, word), .6);
        const inst = mem ? S.pf(2, C_VW(2, word) + .1, .3) : S.pf(1, C_VW(1, word) + .06, .3);
        if (mem && ap <= 0) alpha(S.p(1, .2), () => { ctx.save(); ctx.setLineDash([10, 10]); rr(x, 350, 360, 280, 22); ctx.strokeStyle = C.line; ctx.lineWidth = 3; ctx.stroke(); ctx.restore(); text('…', cx, 480, { size: 60, weight: 800, color: C.muted, align: 'center' }); });
        pop(cx, 490, ap, () => {
          card(x, 350, 360, 280, { r: 22, stroke: mem ? C.purple : C.line, lw: mem ? 3.5 : 2.5 });
          node(x + 50, 400, 28, n[0], { fill: col, stroke: col, color: '#fff', size: 30 });
          text(n, x + 92, 401, { size: 34, weight: 800 });
          text(sub, x + 30, 470, { size: 28, weight: 700, color: C.soft });
          rr(x + 30, 540, 300, 60, 30); ctx.fillStyle = inst > .5 ? C.greenL : PV.vc.col; ctx.fill();
          if (inst > .5) { check(x + 130, 570, 24, C.green); text('installed', x + 150, 571, { size: 26, weight: 800, color: C.green }); }
          else text('one-click install', x + 180, 571, { size: 24, weight: 800, color: '#fff', align: 'center' });
          if (S.pf(2, pw, .4) > 0) alpha(S.pf(2, pw, .4), () => badge('partner', x + 30, 496, { size: 18, fill: '#F2F2F2', color: C.soft }));
        });
        if (mem) {
          pop(x + 330, 350, S.pf(2, C_VW(2, word) + .04, .5) * (1 - S.pf(2, pw, .4)), () => { badge('new', x + 330, 336, { align: 'center', size: 22, fill: C.purple, color: '#fff' }); for (const [dx, dy, s, ph] of [[-50, -20, 16, 0], [52, -18, 12, 2]]) { ctx.save(); ctx.translate(x + 330 + dx, 350 + dy); ctx.rotate(t * 2 + ph); icon('star', 0, 0, s, C.purple); ctx.restore(); } });
        }
      });
      // receipt: billed through Vercel (line 1), replaced by the note (line 2)
      pop(960, 755, S.pf(1, C_VW(1, 'billed'), .6) * S.out(2, 0, .4), () => {
        card(520, 690, 880, 130, { r: 20, stroke: C.line, lw: 2.5 });
        logo('vc', 580, 745, .36); text('billed through Vercel', 620, 734, { size: 32, weight: 800 });
        text('Neon · Supabase · Upstash on one invoice', 620, 780, { size: 24, weight: 600, color: C.soft });
      });
      fade(S.pf(2, pw + .04, .5), () => text("partners' products: no Vercel database or vector store", 960, 750, { size: 34, weight: 700, color: C.soft, align: 'center' }), 10);
    });
  },
};

// ===================== memory_aws =====================
const C_AW = (j, w) => c_w('memory_aws', j, w);
const C_EV = ['5 days in Lisbon', 'window seat, please', 'under $2,000'];
SCN.memory_aws = {
  chapter: CH.memory,
  draw(S, t) {
    // ---- line 0: AgentCore Memory: short-term events, long-term facts ----
    alpha(S.out(1), () => {
      fade(S.p(0, .05), () => c_provTitle('aws', 'AWS: AgentCore Memory'));
      pop(960, 240, S.p(0, .4, .5), () => pill('the deepest shelf', 960, 240, { size: 26, fill: PV.aws.light, color: PV.aws.col, shadow: false }));
      const am = C_AW(0, 'AgentCore Memory'), st = C_AW(0, 'short-term'), lt = C_AW(0, 'long-term'), ws = C_AW(0, 'prefers window');
      fade(S.p(0, .2), () => phone(160, 500, .8, (x, y, w, h) => { ctx.fillStyle = '#F4F7FC'; ctx.fillRect(x, y, w, h); for (let k = 0; k < 4; k++) { rr(k % 2 ? x + 30 : x + 10, y + 20 + k * 44, w - 40, 30, 10); ctx.fillStyle = k % 2 ? C.blueL : PV.aws.light; ctx.fill(); } }), 12);
      pop(960, 490, S.pf(0, am, .6), () => {
        card(640, 320, 640, 340, { r: 28, stroke: PV.aws.col, lw: 3.5 });
        rr(640, 320, 640, 70, [28, 28, 0, 0]); ctx.fillStyle = PV.aws.light; ctx.fill();
        icon('memory', 690, 355, 17, PV.aws.col); text('AgentCore Memory', 720, 356, { size: 32, weight: 800, color: PV.aws.ink });
        line(960, 400, 960, 640, C.line, 3);
        text('short-term', 800, 430, { size: 26, weight: 800, color: C.soft, align: 'center' });
        text('long-term', 1120, 430, { size: 26, weight: 800, color: C.soft, align: 'center' });
      });
      // chat events stream in and stack as short-term events
      const n = Math.min(5, Math.floor(Math.max(0, t - S.at(0, st)) * 1.4));
      for (let k = 0; k < n; k++) { rr(680, 610 - k * 36, 240, 28, 8); ctx.fillStyle = k % 2 ? C.blueL : PV.aws.light; ctx.fill(); text('event ' + (k + 1), 800, 625 - k * 36, { size: 18, weight: 700, color: C.soft, align: 'center' }); }
      if (S.pf(0, st) > 0) for (let k = 0; k < 3; k++) {
        const q = ((t - S.at(0, st)) * .45 + k / 3) % 1, x = lerp(350, 500, q), s = C_EV[k];
        alpha(clamp01(q / .1) * (1 - clamp01((q - .7) / .3)), () => { const w = measure(s, 22, 700) + 28; rr(x - w / 2, 470 + k * 36 - 16, w, 32, 16); ctx.fillStyle = k % 2 ? C.blueL : '#fff'; ctx.fill(); ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.stroke(); text(s, x, 471 + k * 36, { size: 22, weight: 700, align: 'center' }); });
      }
      // extraction gear turns, a long-term memory pops out
      pop(1120, 530, S.pf(0, lt, .5), () => { ctx.save(); ctx.translate(1120, 530); ctx.rotate(t * 1.8); icon('gear', 0, 0, 46, PV.aws.smile); ctx.restore(); icon('star', 1120, 530, 16, PV.aws.smile); });
      const sp = S.pf(0, ws, .6);
      if (sp > 0) arrow(1200, 520, lerp(1200, 1390, sp), 510, sp, { color: PV.aws.smile, lw: 5 });
      pop(1580, 500, sp, () => c_sticky(1580, 500 + Math.sin(t * 2) * 3, 300, 170, .04, () => { text('prefers', 0, -30, { size: 32, weight: 800, align: 'center' }); text('window seats', 0, 18, { size: 32, weight: 800, align: 'center' }); }));
      pop(1580, 650, S.pf(0, lt + .04, .5), () => pill('long-term memory', 1580, 650, { size: 26, fill: PV.aws.light, color: PV.aws.col, shadow: false }));
    });
    // ---- line 1: S3, DynamoDB, S3 Vectors ----
    alpha(S.p(1) * S.out(2), () => {
      c_provTitle('aws', 'Storage building blocks');
      const items = [['S3', 'box', 'files', 'S3 stores'], ['DynamoDB', 'bolt', 'fast records', 'DynamoDB'], ['S3 Vectors', 'search', 'embeddings', 'S3 Vectors']];
      items.forEach(([n, ic, sub, word], i) => {
        const x = 120 + i * 580, cx = x + 260, p = S.pf(1, C_AW(1, word), .6);
        pop(cx, 500, p, () => {
          card(x, 260, 520, 470, { r: 28, stroke: C.line, lw: 2.5 });
          node(cx, 350, 56, '', { fill: PV.aws.light, stroke: PV.aws.light }); icon(ic, cx, 350, 28, PV.aws.col);
          text(n, cx, 450, { size: 50, weight: 800, align: 'center' });
          text(sub, cx, 505, { size: 30, weight: 700, color: C.soft, align: 'center' });
          if (i === 0) { for (let k = 0; k < 3; k++) { const q = ((t - S.at(1, 0)) * .5 + k / 3) % 1; alpha(1 - clamp01((q - .8) / .2), () => c_doc(cx - 70 + k * 70, lerp(560, 650, eIO(q)), .7)); } rr(x + 80, 680, 360, 12, 6); ctx.fillStyle = C.idle; ctx.fill(); }
          else if (i === 1) { const hl = Math.floor(t * 2.5) % 4; for (let r = 0; r < 4; r++) { rr(x + 70, 560 + r * 34, 380, 28, 7); ctx.fillStyle = r === hl ? PV.aws.smile + '55' : '#F2F4F8'; ctx.fill(); icon('bolt', x + 92, 574 + r * 34, 8, r === hl ? PV.aws.smile : C.muted); } }
          else {  // a bucket with vector dots inside
            ctx.beginPath(); ctx.moveTo(x + 130, 560); ctx.lineTo(x + 390, 560); ctx.lineTo(x + 360, 700); ctx.lineTo(x + 160, 700); ctx.closePath(); ctx.fillStyle = PV.aws.light; ctx.fill(); ctx.strokeStyle = PV.aws.col; ctx.lineWidth = 3; ctx.stroke();
            const r = rng(3); for (let k = 0; k < 12; k++) { const dx = r() * 180, dy = r() * 100; ctx.beginPath(); ctx.arc(x + 170 + dx, 585 + dy + Math.sin(t * 2 + k) * 3, 7, 0, 7); ctx.fillStyle = [C.teal, C.blue, PV.aws.smile][k % 3]; ctx.fill(); }
          }
        });
      });
      pop(1540, 760, S.pf(1, C_AW(1, 'cheaply'), .5), () => c_iconPill('cheap, right inside S3', 'coin', 1540, 770, { size: 26, fill: C.greenL, stroke: C.green, color: C.green }));
    });
    // ---- line 2: Bedrock Knowledge Bases ----
    alpha(S.p(2) * S.out(3), () => {
      c_provTitle('aws', 'Bedrock Knowledge Bases');
      const cw = C_AW(2, 'connectors'), ms = C_AW(2, 'managed search'), sp = C_AW(2, 'SharePoint'), cf = C_AW(2, 'Confluence'), mo = C_AW(2, 'and more');
      pop(860, 480, S.p(2, .1, .6), () => {
        card(640, 330, 440, 300, { r: 28, stroke: PV.aws.col, lw: 3.5 });
        node(860, 430, 56, '', { fill: PV.aws.light, stroke: PV.aws.light }); icon('search', 860, 430, 28, PV.aws.col);
        text('Knowledge', 860, 530, { size: 34, weight: 800, align: 'center' }); text('Base', 860, 574, { size: 34, weight: 800, align: 'center' });
      });
      // your documents first, then the connectors that feed them
      const swap = S.pf(2, cw, .5);
      alpha(S.p(2, .2) * (1 - swap), () => { for (let k = 0; k < 3; k++) c_doc(260 + k * 40, 470 - k * 10, 1.3, { rot: (k - 1) * .12 }); text('your documents', 300, 580, { size: 28, weight: 700, color: C.soft, align: 'center' }); });
      [['SharePoint', sp, 380], ['Confluence', cf, 480], ['+ more', mo, 580]].forEach(([n, f, y]) => pop(300, y, S.pf(2, f, .4), () => c_iconPill(n, 'doc', 300, y, { size: 26, stroke: PV.aws.col })));
      for (let k = 0; k < 3; k++) { const q = ((t - S.ls(2) - .5) * .7 + k / 3) % 1; if (t > S.ls(2) + .5) c_path([[440, 380 + k * 100], [640, 480]], q, PV.aws.smile, 9); }
      line(1080, 480, 1180, 480, C.line, 4);
      fade(S.pf(2, ms, .5), () => {
        card(1180, 330, 620, 90, { r: 45, stroke: C.line, lw: 2.5 });
        icon('search', 1230, 375, 20, C.soft);
        const q = 'hotel rules for Lisbon trip?', n = Math.floor(q.length * S.pf(2, ms + .03, 1.4, c_lin));
        text(q.slice(0, n), 1270, 376, { size: 28, weight: 600 });
      }, 10);
      pop(1490, 540, S.pf(2, ms + .22, .5), () => {
        card(1180, 460, 620, 160, { r: 24, fill: C.greenL, stroke: C.green, lw: 3 });
        text('Answer from your docs', 1210, 505, { size: 28, weight: 800, color: C.green });
        c_doc(1240, 570, .6); text('travel-policy.pdf', 1280, 572, { size: 24, weight: 700, fam: MONO });
      });
    });
    // ---- line 3: several services, several bills ----
    alpha(S.p(3), () => {
      c_title('Several services, several bills');
      const bw = C_AW(3, 'its own bill'), su = C_AW(3, 'its own setup');
      const boxes = [['AgentCore Memory', 380, 330], ['S3', 380, 520], ['DynamoDB', 380, 710], ['S3 Vectors', 1540, 330], ['Knowledge Bases', 1540, 520], ['Bedrock', 1540, 710]];
      pop(960, 500, S.p(3, 0, .5), () => atlas(960, 480, 1.3, t, { label: 'Atlas' }));
      boxes.forEach(([n, x, y], i) => {
        const p = S.pf(3, .08 + i * .04, .5), side = x < 960 ? 1 : -1, ex = x + side * 180;
        if (p > 0) { ctx.save(); ctx.strokeStyle = C.muted; ctx.lineWidth = 4; ctx.setLineDash([2, 10]); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(960 - side * 70, 480); ctx.bezierCurveTo(lerp(960, ex, .5), 480, lerp(960, ex, .5), y, lerp(960 - side * 70, ex, p), lerp(480, y, p)); ctx.stroke(); ctx.restore(); }
        pop(x, y, p, () => { c_box(x, y, 360, 84, n, { stroke: PV.aws.col, lw: 3, size: 28 }); });
        pop(x + side * 150, y - 42, S.pf(3, su + i * .02, .4) * (1 - S.pf(3, bw, .3)), () => { ctx.save(); ctx.translate(x + side * 150, y - 42); ctx.rotate(t * 2); icon('gear', 0, 0, 18, C.soft); ctx.restore(); });
        pop(x - side * 150, y - 42, S.pf(3, bw + i * .02, .4), () => { rr(x - side * 150 - 26, y - 64, 52, 44, 8); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = C.red; ctx.lineWidth = 3; ctx.stroke(); text('$', x - side * 150, y - 41, { size: 26, weight: 800, color: C.red, align: 'center' }); });
      });
      pop(960, 790, S.p(3, .1, .5), () => pill('powerful, but more wiring', 960, 790, { size: 30, fill: PV.aws.light, color: PV.aws.col }));
    });
  },
};

// ===================== quiz1 =====================
const C_QUIZ = [['Global Config', 'gear', 'small settings', .28], ['Vercel Blob', 'file', 'files', .36], ['Marketplace', 'db', 'Neon, Supabase', c_w('quiz1', 1, 'Neon')], ['Runtime Cache', 'bolt', 'temporary cache', .44]];
SCN.quiz1 = {
  chapter: CH.memory,
  guide: (S, t) => ({ look: [{ t0: S.ls(0), t1: S.le(1) }], happy: t >= S.ls(1) ? 1 : 0, hops: [S.ls(1)] }),
  draw(S, t) {
    pop(960, 160, S.p(0, .05, .7), () => {
      card(640, 108, 640, 104, { r: 52, fill: C.acc });
      text('Quick check!', 960, 162, { size: 60, weight: 700, fam: SERIF, color: '#fff', align: 'center' });
      for (const [x, y, s, ph] of [[600, 130, 22, 0], [1320, 190, 26, 1.5], [1350, 115, 16, 3]]) { ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 2 + ph) * .3); icon('star', 0, 0, s, C.cfY); ctx.restore(); }
    });
    fade(S.pf(0, .12, .6), () => {
      logo('vc', 360, 310, .9);
      text('Atlas runs on Vercel and needs a Postgres database for bookings.', 450, 296, { size: 36, weight: 600 });
    }, 14);
    fade(S.pf(0, .78, .5), () => text('Where does it come from?', 450, 350, { size: 36, weight: 800, color: C.acc }), 10);
    const win = S.p(1, 0, .5);
    C_QUIZ.forEach(([name, ic, use, f], i) => {
      const x = 150 + i * 420, y = 430 + Math.sin(t * 2 + i) * 3, right = i === 2;
      pop(x + 180, y + 130, S.pf(0, .55 + i * .07, .5), () => {
        alpha(right ? 1 : 1 - .3 * win, () => {
          card(x, y, 360, 260, { r: 28, fill: right && win > 0 ? C.greenL : '#fff', stroke: right && win > 0 ? C.green : C.line, lw: right ? 3 + 3 * win : 3 });
          node(x + 38, y + 38, 20, 'ABCD'[i], { fill: C.bg, stroke: C.line, size: 20, color: C.soft });
          node(x + 180, y + 88, 52, '', { fill: right && win > 0 ? '#fff' : C.accL, stroke: 'transparent' });
          icon(ic, x + 180, y + 88, 30, right && win > 0 ? C.green : C.acc);
          text(name, x + 180, y + 172, { size: 42, weight: 800, align: 'center' });
          fade(S.pf(1, f, .5), () => text(use, x + 180, y + 222, { size: 26, weight: 700, color: right ? C.green : C.soft, align: 'center' }), 8);
        });
        if (right) pop(x + 330, y + 30, win, () => { node(x + 330, y + 30, 34, '', { fill: C.green, stroke: '#fff', lw: 4 }); check(x + 330, y + 30, 34, '#fff'); });
      });
    });
    confetti(t, S.ls(1), 13, 150 + 2 * 420 + 180, 430, 90);
    // countdown during the hold after line 0
    const cs = S.le(0), ce = S.ls(1) - .1, cp = (t - cs) / (ce - cs);
    pop(960, 780, P(t, cs - .2, .4) * (1 - P(t, S.ls(1), .3)), () => countdown(960, 780, 52, cp));
    pop(960, 790, S.pf(1, .7, .5), () => c_iconPill('Postgres  →  Marketplace partner', 'db', 960, 790, { size: 30, fill: C.greenL, stroke: C.green, color: C.green }));
  },
};
