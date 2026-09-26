// ---------- scenes & timing ----------
// Each scene: SCN[name] = { chapter: [n, 'Title'] | null, draw(S, t), guide?(S, t) -> narrator staging (see guideStage) }
const SC = [];
L.forEach((l, i) => {
  let s = SC[SC.length - 1];
  if (!s || s.name !== l.scene) { s = { name: l.scene, lines: [], start: i ? l.start - .3 : 0 }; SC.push(s); }
  s.lines.push(i);
});
SC.forEach((s, i) => { s.end = i + 1 < SC.length ? SC[i + 1].start : TL.duration; });
function helpers(s, t) {
  // lines past the end of this cut never start
  const ls = j => j < s.lines.length ? L[s.lines[j]].start : Infinity, le = j => j < s.lines.length ? L[s.lines[j]].end : Infinity;
  const at = (j, f = 0) => j < s.lines.length ? ls(j) + f * (le(j) - ls(j)) : Infinity;
  return {
    ls, le, at, t, start: s.start, end: s.end, dur: s.end - s.start, local: t - s.start,
    p: (j, off = 0, d = .6, f = eOut) => P(t, ls(j) + off, d, f),
    pf: (j, f, d = .6, e = eOut) => P(t, at(j, f), d, e),
    out: (j, off = 0, d = .5) => 1 - P(t, ls(j) + off, d, eIO),
    cur: () => { let k = 0; s.lines.forEach((g, j) => { if (t >= L[g].start - .2) k = j; }); return k; },
  };
}
function heading(s, y, p, size = 64) { fade(p, () => text(s, W / 2, y, { size, weight: 600, fam: SERIF, align: 'center' })); }
const SCENE = n => SC.find(s => s.name === n);
// The narrator stands in one of two spots; moving between them is a cartoon hop (no walking).
const STAGE = { k: .86, x: 300 - 60 * .86, y: 110 - 110 * .86 };   // content x 60..1860 -> 300..1848, y 110..850 -> 110..746
const SPOTS = { big: { x: 330, y: 1012, h: 640 }, corner: { x: 150, y: 1046, h: 430 } };
const inBand = m => m.h < 520;

// Scenes stage the narrator with guide(S, t) -> { spot, look?: [{t0, t1, v}], happy?, hops?: [t0] }
function guideStage(s, t) {
  const def = SCN[s.name];
  const S = { ...helpers(s, t), name: s.name };
  // scenes without their own staging: glance at the material through the middle of each line
  const look = s.lines.map((_, j) => ({ t0: S.at(j, .28), t1: S.at(j, .72), v: .8 }));
  return { spot: 'corner', look, ...(def && def.guide ? def.guide(S, t) : {}) };
}
// Glance segments [{t0, t1, v}] -> eye offset with soft ramps (v: 1 = toward the content on the right)
function glance(t, segs = []) {
  for (const g of segs) {
    if (t < g.t0 || t > g.t1 + .3) continue;
    return (g.v ?? 1) * Math.min(clamp01((t - g.t0) / .3), 1 - clamp01((t - g.t1) / .3));
  }
  return 0;
}
const HOP = .75;
const sceneAt = tt => SC[Math.max(0, SC.findIndex(x => tt >= x.start && tt < x.end))];
const spotAt = tt => guideStage(sceneAt(tt), tt).spot;
function pose(t, si) {
  const cur = guideStage(SC[si], t), to = SPOTS[cur.spot];
  let m = { ...to, hop: 0 };
  // hop whenever the spot changed during the last HOP seconds (between scenes or within one)
  const before = spotAt(Math.max(0, t - HOP));
  if (before !== cur.spot) {
    let lo = Math.max(0, t - HOP), hi = t;
    for (let i = 0; i < 12; i++) { const mid = (lo + hi) / 2; if (spotAt(mid) === cur.spot) hi = mid; else lo = mid; }
    const p = clamp01((t - hi) / HOP), from = SPOTS[before], e = eIO(p);
    m = { x: lerp(from.x, to.x, e), y: lerp(from.y, to.y, e), h: lerp(from.h, to.h, e), hop: p };
  }
  for (const h0 of cur.hops || []) if (t > h0 && t < h0 + .55) m.hop = (t - h0) / .55;   // a happy hop in place
  return { ...m, look: glance(t, cur.look), happy: cur.happy || 0 };
}

function caption(t, m) {
  let cur = null;
  for (const l of L) if (t >= l.start - .15 && t <= l.end + .5) cur = l;
  if (!cur || m.noCaption) return;
  const a = clamp01((t - cur.start + .15) / .2) * clamp01((cur.end + .5 - t) / .2);
  const band = inBand(m);
  const x = Math.max(290, m.x + m.h * .34), w = 1870 - x, size = 33, lh = 46;
  const lines = wrap(cur.cap, w - 80, size, 500);
  const h = lines.length * lh + 40, y = 1050 - h;
  ctx.save(); ctx.globalAlpha = a;
  card(x, y, w, h, { r: 26, fill: '#FFFFFF', stroke: C.line, lw: 2 });
  if (band) { ctx.beginPath(); ctx.moveTo(x + 2, 1050 - 60); ctx.lineTo(x - 22, 1050 - 40); ctx.lineTo(x + 2, 1050 - 28); ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill(); }
  lines.forEach((ln, i) => text(ln, x + 40, y + 20 + lh / 2 + i * lh, { size, weight: 500, color: C.ink }));
  ctx.restore();
}

// ---------- frame ----------
const bgCanvas = document.createElement('canvas'); bgCanvas.width = W; bgCanvas.height = H;
{ const b = bgCanvas.getContext('2d'); b.fillStyle = C.bg; b.fillRect(0, 0, W, H); b.fillStyle = 'rgba(120,95,60,0.09)'; for (let x = 20; x < W; x += 40) for (let y = 20; y < H; y += 40) { b.beginPath(); b.arc(x, y, 2, 0, 7); b.fill(); } }

function renderAt(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  ctx.drawImage(bgCanvas, 0, 0);
  const si = Math.max(0, SC.findIndex(s => t >= s.start && t < s.end));
  const s = SC[si], def = SCN[s.name];
  if (!def) { SCN[s.name] = { chapter: null, draw: () => text('TODO scene: ' + s.name, W / 2, H / 2, { size: 60, color: C.red, align: 'center' }) }; return renderAt(t); }
  const S = { ...helpers(s, t), name: s.name };
  const a = (si === 0 ? 1 : clamp01((t - s.start) / .45)) * (si === SC.length - 1 ? 1 : clamp01((s.end - t) / .35));
  // scenes were laid out on the full canvas; draw them slightly smaller to the right of the narrator's column
  ctx.save(); ctx.globalAlpha = a; ctx.translate(STAGE.x, STAGE.y); ctx.scale(STAGE.k, STAGE.k); def.draw(S, t); ctx.restore();
  // chapter chip + progress
  const ch = def.chapter;
  if (ch) {
    const first = SC.find(x => SCN[x.name] && SCN[x.name].chapter && SCN[x.name].chapter[1] === ch[1]) || s;
    ctx.save(); ctx.globalAlpha = clamp01((t - first.start) / .5);
    ctx.font = font(26, 700); const w = ctx.measureText(ch[1]).width + 90;
    card(40, 34, w, 52, { r: 26, shadow: false, fill: '#fff', stroke: C.line, lw: 2 });
    node(66, 60, 17, ch[0], { fill: C.acc, stroke: C.acc, color: '#fff', size: 18 });
    text(ch[1], 94, 61, { size: 26, weight: 700, color: C.soft });
    ctx.restore();
  }
  ctx.fillStyle = C.line; ctx.fillRect(0, 0, W, 6); ctx.fillStyle = C.acc; ctx.fillRect(0, 0, W * t / TL.duration, 6);
  const m = pose(t, si), f = Math.min(TL.env.length - 1, Math.floor(t * TL.fps));
  // lip-sync: a light look-ahead so the mouth opens with the sound, not after it
  const talk = Math.max(TL.env[f] || 0, .7 * (TL.env[f + 1] || 0));
  const pop = back(clamp01((t - .15) / .6));
  if (pop > 0 && !window.HIDE_GUIDE) { ctx.save(); ctx.translate(m.x, m.y); ctx.scale(pop, pop); ctx.translate(-m.x, -m.y); figure(m.x, m.y, m.h, t, { ...m, talk }); ctx.restore(); }
  if (!window.HIDE_GUIDE) caption(t, m);
  const end = clamp01((t - (TL.duration - .8)) / .8);
  if (end > 0) { ctx.globalAlpha = end; ctx.drawImage(bgCanvas, 0, 0); ctx.globalAlpha = 1; }
}
window.renderAt = renderAt;
window.DURATION = TL.duration;
window.FPS = TL.fps;
const q = new URLSearchParams(location.search);
window.READY.then(() => {
if (q.has('t')) renderAt(parseFloat(q.get('t')));
else if (q.has('play')) { const t0 = performance.now() - 1000 * parseFloat(q.get('play') || 0); const loop = () => { renderAt((performance.now() - t0) / 1000); requestAnimationFrame(loop); }; loop(); }
else renderAt(0);
});
