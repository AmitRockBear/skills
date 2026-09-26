const W = 1920, H = 1080;
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const TL = window.TIMELINE, L = TL.lines;

const C = {
  cf: '#F38020', cfL: '#FDE3C8', cfY: '#FAAE40', purple: '#8A6FD1', purpleL: '#ECE5FB', teal: '#2A9D8F', tealL: '#D6F0EC',
  bg: '#F4EFE6', ink: '#1F1E1D', soft: '#5E5A53', muted: '#9A9286', line: '#E3DACB',
  orange: '#D97757', orangeD: '#B9593A', orangeL: '#F3CDBB', peach: '#FBE9DF',
  card: '#FFFFFF', green: '#3F9A62', greenL: '#DDF1E4', red: '#D0493C', redL: '#F9DEDA',
  blue: '#4C7BD9', blueL: '#DCE6FA', idle: '#DDD5C8', code: '#1F1D1A',
  acc: '#2A9D8F', accL: '#D6F0EC',   // the video's accent: chapter chrome, progress bar, highlights
};
const CODE = { text: '#EDE6DA', kw: '#F2A47F', fn: '#8FC7F0', num: '#E7C77B', str: '#A9D59A', comment: '#8C857A', type: '#C9A8F0' };
const SANS = '"Avenir Next", "Helvetica Neue", Arial, sans-serif';
const SERIF = '"Iowan Old Style", Georgia, serif';
const MONO = 'Menlo, Monaco, monospace';

// ---------- math ----------
const clamp01 = x => Math.max(0, Math.min(1, x));
const lerp = (a, b, p) => a + (b - a) * p;
const eOut = x => 1 - Math.pow(1 - clamp01(x), 3);
const eIO = x => { x = clamp01(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const back = x => { x = clamp01(x); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const P = (t, t0, d = .6, f = eOut) => f((t - t0) / d);
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// ---------- drawing helpers ----------
const font = (size, weight = 500, fam = SANS) => `${weight} ${size}px ${fam}`;
function text(s, x, y, o = {}) {
  ctx.font = font(o.size || 32, o.weight || 500, o.fam || SANS);
  ctx.fillStyle = o.color || C.ink;
  ctx.textAlign = o.align || 'left';
  ctx.textBaseline = o.base || 'middle';
  ctx.fillText(s, x, y);
}
function measure(s, size, weight = 500, fam = SANS) { ctx.font = font(size, weight, fam); return ctx.measureText(s).width; }
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function card(x, y, w, h, o = {}) {
  ctx.save();
  if (o.shadow !== false) { ctx.shadowColor = 'rgba(70,45,20,0.13)'; ctx.shadowBlur = 26; ctx.shadowOffsetY = 10; }
  rr(x, y, w, h, o.r ?? 24); ctx.fillStyle = o.fill || C.card; ctx.fill();
  ctx.restore();
  if (o.stroke) { rr(x, y, w, h, o.r ?? 24); ctx.strokeStyle = o.stroke; ctx.lineWidth = o.lw || 3; ctx.stroke(); }
}
function pop(cx, cy, p, fn) {
  if (p <= 0) return;
  const s = back(p);
  ctx.save(); ctx.globalAlpha *= clamp01(p * 2.5);
  ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-cx, -cy);
  fn(); ctx.restore();
}
function fade(p, fn, dy = 26) {
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp01(p); ctx.translate(0, (1 - clamp01(p)) * dy); fn(); ctx.restore();
}
function alpha(a, fn) { if (a <= 0.001) return; ctx.save(); ctx.globalAlpha *= a; fn(); ctx.restore(); }
function wrap(s, maxW, size, weight = 500, fam = SANS) {
  ctx.font = font(size, weight, fam);
  const words = s.split(' '), lines = []; let cur = '';
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; } else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}
function pill(s, cx, cy, o = {}) {
  const size = o.size || 30, w = measure(s, size, o.weight || 600) + size * 1.4, h = size * 1.9;
  card(cx - w / 2, cy - h / 2, w, h, { r: h / 2, fill: o.fill || C.card, stroke: o.stroke, lw: 2.5, shadow: o.shadow });
  text(s, cx, cy + 1, { size, weight: o.weight || 600, color: o.color || C.ink, align: 'center' });
  return w;
}
function arrow(x1, y1, x2, y2, p = 1, o = {}) {
  if (p <= 0) return;
  const x = lerp(x1, x2, p), y = lerp(y1, y2, p);
  ctx.save(); ctx.strokeStyle = o.color || C.muted; ctx.fillStyle = o.color || C.muted; ctx.lineWidth = o.lw || 5; ctx.lineCap = 'round';
  if (o.dash) ctx.setLineDash(o.dash);
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x, y); ctx.stroke(); ctx.setLineDash([]);
  const a = Math.atan2(y2 - y1, x2 - x1), hs = o.head || 16;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - hs * Math.cos(a - .5), y - hs * Math.sin(a - .5)); ctx.lineTo(x - hs * Math.cos(a + .5), y - hs * Math.sin(a + .5)); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function check(x, y, s, color = C.green, p = 1) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = s * .22; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x - s * .45, y); ctx.lineTo(x - s * .12, y + s * .32);
  if (p > .5) ctx.lineTo(lerp(x - s * .12, x + s * .5, (p - .5) * 2), lerp(y + s * .32, y - s * .38, (p - .5) * 2));
  ctx.stroke(); ctx.restore();
}
function cross(x, y, s, color = C.red, p = 1) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = s * .22; ctx.lineCap = 'round';
  const a = clamp01(p * 2), b = clamp01(p * 2 - 1);
  ctx.beginPath(); ctx.moveTo(x - s * .4, y - s * .4); ctx.lineTo(lerp(x - s * .4, x + s * .4, a), lerp(y - s * .4, y + s * .4, a));
  if (b > 0) { ctx.moveTo(x + s * .4, y - s * .4); ctx.lineTo(lerp(x + s * .4, x - s * .4, b), lerp(y - s * .4, y + s * .4, b)); }
  ctx.stroke(); ctx.restore();
}
function node(x, y, r, label, o = {}) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = o.fill || C.card; ctx.fill();
  ctx.lineWidth = o.lw || 3; ctx.strokeStyle = o.stroke || C.line; ctx.stroke();
  if (label !== undefined) text(String(label), x, y + 1, { size: o.size || r * .8, weight: 700, color: o.color || C.ink, align: 'center', fam: o.fam || SANS });
}
function shield(x, y, s, color = C.green) {
  ctx.save(); ctx.translate(x, y); ctx.beginPath();
  ctx.moveTo(0, -s); ctx.bezierCurveTo(s * .55, -s * .75, s * .8, -s * .8, s * .85, -s * .75);
  ctx.bezierCurveTo(s * .85, s * .1, s * .5, s * .7, 0, s); ctx.bezierCurveTo(-s * .5, s * .7, -s * .85, s * .1, -s * .85, -s * .75);
  ctx.bezierCurveTo(-s * .8, -s * .8, -s * .55, -s * .75, 0, -s); ctx.fillStyle = color; ctx.fill(); ctx.restore();
  check(x, y, s * .8, '#fff');
}
function bug(x, y, s, color = C.red) {
  ctx.save(); ctx.translate(x, y);
  ctx.strokeStyle = C.ink; ctx.lineWidth = s * .09; ctx.lineCap = 'round';
  for (const sy of [-.25, .05, .35]) for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * s * .3, sy * s); ctx.lineTo(sx * s * .62, sy * s + s * .08 * sx * sx); ctx.stroke(); }
  ctx.beginPath(); ctx.ellipse(0, s * .08, s * .36, s * .44, 0, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
  ctx.beginPath(); ctx.arc(0, -s * .38, s * .2, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
  ctx.beginPath(); ctx.moveTo(0, -s * .2); ctx.lineTo(0, s * .5); ctx.stroke();
  ctx.fillStyle = C.ink; for (const [dx, dy] of [[-.17, -.02], [.17, .12], [-.14, .28]]) { ctx.beginPath(); ctx.arc(dx * s, dy * s, s * .06, 0, 7); ctx.fill(); }
  ctx.restore();
}
function confetti(t, t0, seed, cx, cy, n = 70, spread = 1) {
  const dt = t - t0; if (dt < 0 || dt > 3.2) return;
  const r = rng(seed), cols = [C.orange, C.blue, C.green, '#E7C77B', '#C9A8F0', C.orangeL];
  ctx.save(); ctx.globalAlpha *= clamp01((3.2 - dt) / .8);
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (r() - .5) * 2.4 * spread, v = 500 + r() * 700, rot = r() * 6;
    const x = cx + Math.cos(a) * v * dt, y = cy + Math.sin(a) * v * dt + 900 * dt * dt;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot + dt * (4 + r() * 6)); ctx.fillStyle = cols[i % cols.length];
    ctx.fillRect(-7, -4, 14, 8); ctx.restore();
  }
  ctx.restore();
}

// ---------- code blocks ----------
const KW = new Set(['const', 'let', 'await', 'async', 'export', 'class', 'extends', 'return', 'new', 'import', 'from', 'this', 'if', 'else', 'for', 'of', 'default', 'function', 'type', 'interface']);
function tokens(line) {
  const out = [], re = /(\/\/.*$|#.*$)|("[^"]*"|'[^']*'|`[^`]*`)|([A-Za-z_$@][\w$]*)|(\d+)|(\s+)|(.)/g; let m;
  while ((m = re.exec(line))) {
    let c = CODE.text;
    if (m[1]) c = CODE.comment; else if (m[2]) c = CODE.str;
    else if (m[3]) c = KW.has(m[3]) ? CODE.kw : /^[A-Z]/.test(m[3]) ? CODE.type : line[re.lastIndex] === '(' ? CODE.fn : CODE.text;
    else if (m[4]) c = CODE.num;
    out.push([m[0], c]);
  }
  return out;
}
function codeBlock(x, y, w, lines, o = {}) {
  const size = o.size || 30, lh = size * 1.6, pad = 32, head = 50;
  const h = head + pad * 2 + lines.length * lh - (lh - size);
  card(x, y, w, h, { fill: C.code, r: 22 });
  ['#F0715F', '#F2C14E', '#5DC26A'].forEach((c, i) => { ctx.beginPath(); ctx.arc(x + 30 + i * 26, y + 26, 8, 0, 7); ctx.fillStyle = c; ctx.fill(); });
  if (o.file) text(o.file, x + w / 2, y + 27, { size: 22, color: '#A59C8F', align: 'center', fam: MONO, weight: 500 });
  let budget = o.reveal ?? 1e9;
  ctx.font = font(size, 500, MONO);
  const cw = ctx.measureText('M').width;
  lines.forEach((ln, i) => {
    const ly = y + head + pad + i * lh + size / 2;
    const hl = o.hl && o.hl[i];
    if (hl) { ctx.save(); ctx.globalAlpha *= hl; rr(x + 14, ly - lh / 2, w - 28, lh, 10); ctx.fillStyle = 'rgba(217,119,87,0.28)'; ctx.fill(); ctx.fillStyle = C.orange; ctx.fillRect(x + 14, ly - lh / 2, 6, lh); ctx.restore(); }
    let cx = x + pad + 10;
    for (const [s, col] of tokens(ln)) {
      if (budget <= 0) break;
      const vis = s.slice(0, Math.max(0, budget)); budget -= s.length;
      ctx.font = font(size, 500, MONO); ctx.fillStyle = col; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(vis, cx, ly); cx += vis.length * cw;
    }
    budget -= 1;
    if (budget > -2 && budget <= 0 && o.cursor) { ctx.fillStyle = C.orange; ctx.fillRect(cx + 2, ly - size * .55, 3, size * 1.1); }
  });
  return h;
}
const chars = lines => lines.reduce((a, l) => a + l.length + 1, 0);
const SCN = {};
