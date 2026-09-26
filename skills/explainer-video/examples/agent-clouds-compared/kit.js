// ---------- shared visual kit for the agent clouds comparison video ----------
// Layout contract: content area is x 60..1860, y 110..850. Caption bubble covers y > ~870. Chapter chip is top-left.

// Cloudflare-style cloud (generic puffy cloud), centered at x,y, width ~ 220*s
function cloud(x, y, s, fill = C.cf, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath();
  ctx.arc(-55, 18, 42, Math.PI * .5, Math.PI * 1.5);
  ctx.arc(-18, -22, 52, Math.PI * 1.05, Math.PI * 1.85);
  ctx.arc(45, -2, 40, Math.PI * 1.3, Math.PI * .15);
  ctx.arc(62, 30, 30, -Math.PI * .35, Math.PI * .5);
  ctx.closePath();
  ctx.fillStyle = fill; ctx.fill();
  if (o.stroke) { ctx.strokeStyle = o.stroke; ctx.lineWidth = 4 / s; ctx.stroke(); }
  ctx.restore();
}

// Atlas: the trip-planner agent. A round blue bot with a compass face. mood: 'ok' | 'think' | 'happy' | 'sleep'
function atlas(x, y, s, t, o = {}) {
  const mood = o.mood || 'ok', r = 46 * s;
  ctx.save(); ctx.translate(x, y + (mood === 'sleep' ? 0 : Math.sin(t * 2.6 + x) * 3 * s));
  // antenna
  ctx.strokeStyle = '#2F5CB8'; ctx.lineWidth = 5 * s; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, -r * .95); ctx.lineTo(0, -r * 1.35); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -r * 1.42, 8 * s, 0, 7); ctx.fillStyle = mood === 'think' ? (Math.sin(t * 10) > 0 ? C.cfY : C.cf) : C.cf; ctx.fill();
  // head
  ctx.save(); ctx.shadowColor = 'rgba(40,60,120,.18)'; ctx.shadowBlur = 16 * s; ctx.shadowOffsetY = 6 * s;
  rr(-r * 1.15, -r, r * 2.3, r * 1.9, r * .6); ctx.fillStyle = C.blue; ctx.fill(); ctx.restore();
  rr(-r * .9, -r * .72, r * 1.8, r * 1.3, r * .42); ctx.fillStyle = '#EAF0FC'; ctx.fill();
  // eyes
  ctx.fillStyle = C.ink;
  if (mood === 'sleep') { ctx.lineWidth = 4 * s; ctx.strokeStyle = C.ink; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(sx * r * .38, -r * .1, r * .14, .15 * Math.PI, .85 * Math.PI); ctx.stroke(); } }
  else if (mood === 'happy') { ctx.lineWidth = 5 * s; ctx.strokeStyle = C.ink; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(sx * r * .38, -r * .02, r * .15, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke(); } }
  else { const blink = ((t + x * .01) % 3.7) < .12 ? .15 : 1; const lx = mood === 'think' ? r * .08 : 0, ly = mood === 'think' ? -r * .08 : 0; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sx * r * .38 + lx, -r * .1 + ly, r * .1, r * .15 * blink, 0, 0, 7); ctx.fill(); } }
  // mouth
  ctx.strokeStyle = C.ink; ctx.lineWidth = 4 * s; ctx.beginPath();
  if (mood === 'sleep') { ctx.moveTo(-r * .1, r * .25); ctx.lineTo(r * .1, r * .25); } else ctx.arc(0, r * .16, r * .18, .2 * Math.PI, .8 * Math.PI);
  ctx.stroke();
  if (mood === 'sleep') { const z = (t * .8) % 1; ctx.globalAlpha *= 1 - z; text('z', r * 1.1 + z * 20 * s, -r - z * 40 * s, { size: 30 * s, weight: 800, color: C.blue }); }
  ctx.restore();
  if (o.label) text(o.label, x, y + r * 1.35, { size: 26 * s, weight: 700, color: C.blue, align: 'center' });
}

// A service card: rounded card with an icon well, name and optional status badge.
function serviceCard(x, y, w, h, name, o = {}) {
  const color = o.color || C.cf;
  card(x, y, w, h, { r: 22, stroke: o.stroke || C.line, lw: 2.5 });
  if (o.icon) { rr(x + 18, y + (h - (h - 36)) / 2, h - 36, h - 36, 16); ctx.fillStyle = o.iconBg || C.cfL; ctx.fill(); icon(o.icon, x + 18 + (h - 36) / 2, y + h / 2, (h - 36) * .36, color); }
  const tx = o.icon ? x + h : x + 26;
  text(name, tx, y + h / 2 - (o.sub ? 16 : 0), { size: o.size || 34, weight: 700 });
  if (o.sub) text(o.sub, tx, y + h / 2 + 22, { size: 22, weight: 500, color: C.soft });
  if (o.badge) badge(o.badge, x + w - 16, y + 16, { align: 'right' });
}

// Status badge: 'beta', 'private beta', 'coming soon', 'GA'...
function badge(s, x, y, o = {}) {
  const size = o.size || 19, w = measure(s.toUpperCase(), size, 800) + 24, h = size + 14;
  const bx = o.align === 'right' ? x - w : o.align === 'center' ? x - w / 2 : x;
  const fill = o.fill || (/soon|private/.test(s) ? C.purpleL : /beta/.test(s) ? C.blueL : C.greenL);
  const color = o.color || (/soon|private/.test(s) ? C.purple : /beta/.test(s) ? C.blue : C.green);
  rr(bx, y, w, h, h / 2); ctx.fillStyle = fill; ctx.fill();
  text(s.toUpperCase(), bx + w / 2, y + h / 2 + 1, { size, weight: 800, color, align: 'center' });
  return w;
}

// Simple line icons. kind: body brain memory clock hand ear shield coin eye globe db file bolt queue browser box mail mic lock key chat code tool gear search star user doc
function icon(kind, x, y, s, color = C.ink) {
  ctx.save(); ctx.translate(x, y); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = Math.max(2, s * .16); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const B = () => ctx.beginPath(), S = () => ctx.stroke(), F = () => ctx.fill();
  switch (kind) {
    case 'body': B(); rr(-s * .7, -s * .45, s * 1.4, s * 1.1, s * .25); S(); B(); ctx.moveTo(-s * .35, -s * .45); ctx.lineTo(-s * .35, -s * .8); ctx.moveTo(s * .35, -s * .45); ctx.lineTo(s * .35, -s * .8); S(); B(); ctx.arc(-s * .28, 0, s * .1, 0, 7); ctx.arc(s * .28, 0, s * .1, 0, 7); F(); break;
    case 'brain': B(); ctx.arc(-s * .3, -s * .2, s * .42, Math.PI * .6, Math.PI * 1.9); ctx.arc(s * .3, -s * .2, s * .42, Math.PI * 1.1, Math.PI * .4); ctx.arc(0, s * .35, s * .45, Math.PI * .1, Math.PI * .9); ctx.closePath(); S(); B(); ctx.moveTo(0, -s * .55); ctx.lineTo(0, s * .7); S(); break;
    case 'memory': case 'db': B(); ctx.ellipse(0, -s * .55, s * .7, s * .25, 0, 0, 7); S(); B(); ctx.moveTo(-s * .7, -s * .55); ctx.lineTo(-s * .7, s * .55); ctx.ellipse(0, s * .55, s * .7, s * .25, 0, Math.PI, 0, true); ctx.lineTo(s * .7, -s * .55); S(); B(); ctx.ellipse(0, 0, s * .7, s * .25, 0, 0, Math.PI); S(); break;
    case 'clock': B(); ctx.arc(0, 0, s * .8, 0, 7); S(); B(); ctx.moveTo(0, 0); ctx.lineTo(0, -s * .5); ctx.moveTo(0, 0); ctx.lineTo(s * .38, s * .2); S(); break;
    case 'hand': case 'tool': B(); ctx.moveTo(-s * .55, s * .7); ctx.lineTo(s * .25, -s * .1); S(); B(); ctx.arc(s * .4, -s * .3, s * .38, Math.PI * .9, Math.PI * 2.6); S(); break;
    case 'ear': case 'chat': B(); rr(-s * .8, -s * .6, s * 1.6, s * 1.05, s * .3); S(); B(); ctx.moveTo(-s * .35, s * .45); ctx.lineTo(-s * .5, s * .8); ctx.lineTo(0, s * .45); S(); for (const dx of [-.35, 0, .35]) { B(); ctx.arc(dx * s, -s * .08, s * .09, 0, 7); F(); } break;
    case 'shield': B(); ctx.moveTo(0, -s * .85); ctx.lineTo(s * .7, -s * .55); ctx.lineTo(s * .6, s * .25); ctx.quadraticCurveTo(s * .35, s * .7, 0, s * .88); ctx.quadraticCurveTo(-s * .35, s * .7, -s * .6, s * .25); ctx.lineTo(-s * .7, -s * .55); ctx.closePath(); S(); break;
    case 'coin': B(); ctx.arc(0, 0, s * .78, 0, 7); S(); text('$', 0, s * .04, { size: s * 1.05, weight: 800, color, align: 'center' }); break;
    case 'eye': B(); ctx.moveTo(-s * .85, 0); ctx.quadraticCurveTo(0, -s * .8, s * .85, 0); ctx.quadraticCurveTo(0, s * .8, -s * .85, 0); S(); B(); ctx.arc(0, 0, s * .25, 0, 7); F(); break;
    case 'globe': B(); ctx.arc(0, 0, s * .8, 0, 7); S(); B(); ctx.ellipse(0, 0, s * .35, s * .8, 0, 0, 7); S(); B(); ctx.moveTo(-s * .8, 0); ctx.lineTo(s * .8, 0); S(); break;
    case 'file': case 'doc': B(); ctx.moveTo(-s * .55, -s * .8); ctx.lineTo(s * .2, -s * .8); ctx.lineTo(s * .55, -s * .45); ctx.lineTo(s * .55, s * .8); ctx.lineTo(-s * .55, s * .8); ctx.closePath(); S(); B(); ctx.moveTo(-s * .25, -s * .1); ctx.lineTo(s * .25, -s * .1); ctx.moveTo(-s * .25, s * .25); ctx.lineTo(s * .25, s * .25); S(); break;
    case 'bolt': B(); ctx.moveTo(s * .15, -s * .85); ctx.lineTo(-s * .45, s * .1); ctx.lineTo(0, s * .1); ctx.lineTo(-s * .15, s * .85); ctx.lineTo(s * .45, -s * .1); ctx.lineTo(0, -s * .1); ctx.closePath(); F(); break;
    case 'queue': for (let i = 0; i < 3; i++) { B(); rr(-s * .8 + i * s * .58, -s * .3, s * .45, s * .6, s * .1); S(); } break;
    case 'browser': B(); rr(-s * .85, -s * .65, s * 1.7, s * 1.3, s * .15); S(); B(); ctx.moveTo(-s * .85, -s * .3); ctx.lineTo(s * .85, -s * .3); S(); for (const dx of [-.65, -.45]) { B(); ctx.arc(dx * s, -s * .48, s * .06, 0, 7); F(); } break;
    case 'box': B(); ctx.moveTo(0, -s * .8); ctx.lineTo(s * .75, -s * .4); ctx.lineTo(s * .75, s * .45); ctx.lineTo(0, s * .85); ctx.lineTo(-s * .75, s * .45); ctx.lineTo(-s * .75, -s * .4); ctx.closePath(); S(); B(); ctx.moveTo(-s * .75, -s * .4); ctx.lineTo(0, 0); ctx.lineTo(s * .75, -s * .4); ctx.moveTo(0, 0); ctx.lineTo(0, s * .85); S(); break;
    case 'mail': B(); rr(-s * .85, -s * .55, s * 1.7, s * 1.1, s * .12); S(); B(); ctx.moveTo(-s * .8, -s * .45); ctx.lineTo(0, s * .12); ctx.lineTo(s * .8, -s * .45); S(); break;
    case 'mic': B(); rr(-s * .28, -s * .85, s * .56, s * 1.05, s * .28); S(); B(); ctx.arc(0, -s * .05, s * .55, 0, Math.PI); S(); B(); ctx.moveTo(0, s * .5); ctx.lineTo(0, s * .85); S(); break;
    case 'lock': B(); rr(-s * .6, -s * .1, s * 1.2, s * .9, s * .15); S(); B(); ctx.arc(0, -s * .1, s * .4, Math.PI, 0); S(); break;
    case 'key': B(); ctx.arc(-s * .4, 0, s * .32, 0, 7); S(); B(); ctx.moveTo(-s * .08, 0); ctx.lineTo(s * .8, 0); ctx.moveTo(s * .55, 0); ctx.lineTo(s * .55, s * .3); ctx.moveTo(s * .75, 0); ctx.lineTo(s * .75, s * .25); S(); break;
    case 'code': B(); ctx.moveTo(-s * .35, -s * .5); ctx.lineTo(-s * .8, 0); ctx.lineTo(-s * .35, s * .5); ctx.moveTo(s * .35, -s * .5); ctx.lineTo(s * .8, 0); ctx.lineTo(s * .35, s * .5); ctx.moveTo(s * .12, -s * .65); ctx.lineTo(-s * .12, s * .65); S(); break;
    case 'gear': B(); for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, rad = i % 2 ? s * .6 : s * .82; ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad); } ctx.closePath(); S(); B(); ctx.arc(0, 0, s * .25, 0, 7); S(); break;
    case 'search': B(); ctx.arc(-s * .15, -s * .15, s * .5, 0, 7); S(); B(); ctx.moveTo(s * .22, s * .22); ctx.lineTo(s * .75, s * .75); S(); break;
    case 'star': B(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rad = i % 2 ? s * .38 : s * .85; ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad); } ctx.closePath(); F(); break;
    case 'user': B(); ctx.arc(0, -s * .35, s * .35, 0, 7); S(); B(); ctx.arc(0, s * .75, s * .65, Math.PI * 1.1, Math.PI * 1.9); S(); break;
  }
  ctx.restore();
}

// A person (traveller) as a friendly bust. color = shirt
function person(x, y, s, color = C.teal, o = {}) {
  ctx.save(); ctx.translate(x, y);
  ctx.beginPath(); ctx.ellipse(0, s * 62, s * 52, s * 40, 0, Math.PI, 0); ctx.fillStyle = color; ctx.fill();
  ctx.beginPath(); ctx.arc(0, 0, s * 34, 0, 7); ctx.fillStyle = o.skin || '#E9B99A'; ctx.fill();
  ctx.beginPath(); ctx.arc(0, -s * 8, s * 35, Math.PI * 1.05, Math.PI * 1.95); ctx.fillStyle = o.hair || '#4A3527'; ctx.fill();
  ctx.fillStyle = C.ink; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(sx * s * 12, s * 2, s * 3.6, 0, 7); ctx.fill(); }
  ctx.strokeStyle = C.ink; ctx.lineWidth = s * 2.6; ctx.beginPath(); ctx.arc(0, s * 10, s * 9, .2 * Math.PI, .8 * Math.PI); ctx.stroke();
  ctx.restore();
  if (o.label) text(o.label, x, y + s * 88, { size: 24 * Math.max(.8, s), weight: 700, color: C.soft, align: 'center' });
}

// Phone and laptop frames; fn(x, y, w, h) draws the screen content in screen coordinates.
function phone(x, y, s, fn) {
  const w = 150 * s, h = 290 * s;
  card(x - w / 2, y - h / 2, w, h, { r: 26 * s, fill: C.ink });
  rr(x - w / 2 + 9 * s, y - h / 2 + 22 * s, w - 18 * s, h - 44 * s, 12 * s); ctx.fillStyle = '#fff'; ctx.fill();
  if (fn) { ctx.save(); rr(x - w / 2 + 9 * s, y - h / 2 + 22 * s, w - 18 * s, h - 44 * s, 12 * s); ctx.clip(); fn(x - w / 2 + 9 * s, y - h / 2 + 22 * s, w - 18 * s, h - 44 * s); ctx.restore(); }
}
function laptop(x, y, s, fn) {
  const w = 360 * s, h = 225 * s;
  card(x - w / 2, y - h / 2, w, h, { r: 16 * s, fill: C.ink });
  ctx.fillStyle = '#fff'; ctx.fillRect(x - w / 2 + 12 * s, y - h / 2 + 12 * s, w - 24 * s, h - 24 * s);
  if (fn) { ctx.save(); ctx.beginPath(); ctx.rect(x - w / 2 + 12 * s, y - h / 2 + 12 * s, w - 24 * s, h - 24 * s); ctx.clip(); fn(x - w / 2 + 12 * s, y - h / 2 + 12 * s, w - 24 * s, h - 24 * s); ctx.restore(); }
  rr(x - w * .6, y + h / 2, w * 1.2, 16 * s, 8 * s); ctx.fillStyle = '#3A3733'; ctx.fill();
}

// Server rack icon
function server(x, y, s, color = C.soft) {
  for (let i = 0; i < 3; i++) {
    rr(x - 60 * s, y - 55 * s + i * 38 * s, 120 * s, 32 * s, 7 * s); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = 3 * s; ctx.stroke();
    ctx.beginPath(); ctx.arc(x - 38 * s, y - 39 * s + i * 38 * s, 5 * s, 0, 7); ctx.fillStyle = C.green; ctx.fill();
  }
}

// Speech/chat bubble with wrapped text. tail: 'left' | 'right' | 'none'
function bubble(s, x, y, w, o = {}) {
  const size = o.size || 28, lh = size * 1.35, lines = wrap(s, w - 44, size, o.weight || 500);
  const h = lines.length * lh + 30;
  card(x, y, w, h, { r: 22, fill: o.fill || '#fff', stroke: o.stroke || C.line, lw: 2 });
  if (o.tail === 'left' || o.tail === 'right') {
    const tx = o.tail === 'left' ? x + 30 : x + w - 30;
    ctx.beginPath(); ctx.moveTo(tx - 12, y + h - 1); ctx.lineTo(tx + (o.tail === 'left' ? -18 : 18), y + h + 20); ctx.lineTo(tx + 12, y + h - 1); ctx.closePath(); ctx.fillStyle = o.fill || '#fff'; ctx.fill();
  }
  lines.forEach((ln, i) => text(ln, x + 22, y + 15 + lh / 2 + i * lh, { size, weight: o.weight || 500, color: o.color || C.ink, fam: o.fam || SANS }));
  return h;
}

// Moving dot ("packet") along a straight line; p in 0..1
function packet(x1, y1, x2, y2, p, color = C.cf, r = 11) {
  if (p <= 0 || p >= 1) return;
  const x = lerp(x1, x2, p), y = lerp(y1, y2, p);
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = color; ctx.fill();
  ctx.beginPath(); ctx.arc(x, y, r * 1.8, 0, 7); ctx.fillStyle = color + '33'; ctx.fill();
}
function line(x1, y1, x2, y2, color = C.line, lw = 4, dash) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore();
}

// Big chapter title that shows at the start of a chapter's first scene, then shrinks away.
function chapterTitle(S, n, title, kind) {
  const p = P(S.t, S.start + .1, .7), q = 1 - P(S.t, S.ls(0) + 2.6, .6, eIO);
  if (q <= 0) return 0;
  alpha(p * q, () => {
    ctx.save(); ctx.translate(0, (1 - p) * 30);
    node(W / 2, 330, 64, '', { fill: C.acc, stroke: C.acc });
    icon(kind, W / 2, 330, 34, '#fff');
    text('CHAPTER ' + n, W / 2, 450, { size: 30, weight: 800, color: C.acc, align: 'center' });
    text(title, W / 2, 530, { size: 92, weight: 600, fam: SERIF, align: 'center' });
    ctx.restore();
  });
  return q;
}

// Countdown ring used by quiz scenes. p goes 0..1 over the countdown.
function countdown(x, y, r, p) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = C.line; ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - clamp01(p))); ctx.strokeStyle = C.acc; ctx.stroke();
  text(String(Math.max(1, Math.ceil(3 * (1 - clamp01(p))))), x, y + 2, { size: r * .9, weight: 800, color: C.acc, align: 'center' });
}

// ---------- the three providers ----------
// PV[k]: brand color (col), light tint (light), dark text-on-light color (ink). Keys: cf, vc, aws.
const PV = {
  cf: { name: 'Cloudflare', col: '#F38020', light: '#FDE3C8', ink: '#9A4A0E' },
  vc: { name: 'Vercel', col: '#111111', light: '#E8E8E8', ink: '#111111' },
  aws: { name: 'AWS', col: '#232F3E', light: '#E1E7F0', ink: '#232F3E', smile: '#FF9900' },
};
const PROVS = ['cf', 'vc', 'aws'];
// Brand glyph centered at x,y, roughly s*100 px wide: Cloudflare's cloud, Vercel's triangle, AWS's word + smile.
function logo(k, x, y, s = 1) {
  if (k === 'cf') cloud(x, y + 6 * s, .42 * s, PV.cf.col);
  else if (k === 'vc') { ctx.beginPath(); ctx.moveTo(x, y - 38 * s); ctx.lineTo(x + 44 * s, y + 36 * s); ctx.lineTo(x - 44 * s, y + 36 * s); ctx.closePath(); ctx.fillStyle = PV.vc.col; ctx.fill(); }
  else {
    text('aws', x, y - 8 * s, { size: 54 * s, weight: 800, color: PV.aws.col, align: 'center' });
    ctx.save(); ctx.strokeStyle = PV.aws.smile; ctx.fillStyle = PV.aws.smile; ctx.lineWidth = 7 * s; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - 40 * s, y + 20 * s); ctx.quadraticCurveTo(x, y + 44 * s, x + 38 * s, y + 20 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 44 * s, y + 14 * s); ctx.lineTo(x + 40 * s, y + 30 * s); ctx.lineTo(x + 28 * s, y + 20 * s); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
}
// Logo in a white rounded tile with the provider name beneath (tile is 2r wide).
function provTile(k, x, y, r = 70, o = {}) {
  card(x - r, y - r, 2 * r, 2 * r, { r: r * .34, stroke: o.stroke || C.line, lw: o.lw || 3 });
  logo(k, x, y, r / 70 * .9);
  if (o.label !== false) text(PV[k].name, x, y + r + 34 * (r / 70), { size: 30 * Math.max(.75, r / 70), weight: 800, color: PV[k].ink, align: 'center' });
}
// Three-column comparison cards: cols = { cf: {items: [...], note?, tag?}, vc: {...}, aws: {...} }.
// p: {cf, vc, aws} appear progress per column (0..1); hi: optional key to highlight. Returns column centers.
// items are product names shown as chips; note is a one-line plain-English summary; tag is a "best for" ribbon.
function triCards(cols, p, o = {}) {
  const x0 = o.x ?? 90, y0 = o.y ?? 240, w = o.w ?? 560, h = o.h ?? 560, g = o.gap ?? 40, centers = {};
  PROVS.forEach((k, i) => {
    const x = x0 + i * (w + g), c = cols[k], pp = (p && p[k] !== undefined) ? p[k] : 1;
    centers[k] = x + w / 2;
    fade(pp, () => {
      const hot = o.hi === k;
      card(x, y0, w, h, { r: 28, stroke: hot ? PV[k].col : C.line, lw: hot ? 5 : 2.5 });
      rr(x, y0, w, 110, [28, 28, 0, 0]); ctx.fillStyle = k === 'vc' ? '#F2F2F2' : PV[k].light; ctx.fill();
      logo(k, x + 70, y0 + 55, .62);
      text(PV[k].name, x + 124, y0 + 56, { size: 36, weight: 800, color: PV[k].ink });
      let cy = y0 + 140;
      (c.items || []).forEach((name, j) => {
        const ip = clamp01(pp * 1.6 - .25 - j * .1);
        alpha(ip, () => {
          ctx.font = font(26, 700); const cw = Math.min(w - 60, ctx.measureText(name).width + 34);
          rr(x + 30, cy, cw, 44, 22); ctx.fillStyle = k === 'vc' ? '#F2F2F2' : PV[k].light; ctx.fill();
          text(name, x + 30 + 17, cy + 23, { size: 26, weight: 700, color: PV[k].ink });
        });
        cy += 56;
      });
      if (c.note) { const ls = wrap(c.note, w - 60, 25, 600); ls.forEach((ln, j) => text(ln, x + 30, cy + 22 + j * 34, { size: 25, weight: 600, color: C.soft })); }
      if (c.tag) { const tp = clamp01(pp * 2 - 1); pop(x + w / 2, y0 + h - 40, tp, () => pill(c.tag, x + w / 2, y0 + h - 40, { size: 24, fill: C.accL, color: C.acc, shadow: false })); }
    }, 24);
  });
  return centers;
}
// Small inline provider chip: logo + name, e.g. in tables. Returns its width.
function provChip(k, x, y, o = {}) {
  const size = o.size || 24, w = measure(PV[k].name, size, 800) + size * 2.9, h = size * 1.9;
  card(x, y - h / 2, w, h, { r: h / 2, shadow: false, fill: k === 'vc' ? '#F2F2F2' : PV[k].light });
  logo(k, x + size * 1.25, y, size / 60);
  text(PV[k].name, x + size * 2.3, y + 1, { size, weight: 800, color: PV[k].ink });
  return w;
}

// ---------- the running scorecard ----------
// One row per chapter. Scorecard scenes fill rows as the narration reaches them; the finale shows them all.
const SCORE = [
  { k: 'body', ic: 'body', label: 'Body', cf: 'Instant start, per-agent state', vc: 'Fluid functions, 800 s cap', aws: 'Isolated microVMs, 8 h sessions' },
  { k: 'code', ic: 'code', label: 'Code', cf: 'Agents SDK', vc: 'AI SDK', aws: 'Strands Agents' },
  { k: 'brain', ic: 'brain', label: 'Brain', cf: 'Workers AI + AI Gateway', vc: 'AI Gateway, 0% markup', aws: 'Bedrock, biggest catalog' },
  { k: 'keys', ic: 'key', label: 'ZDR & BYOK', cf: 'ZDR per model · BYOK', vc: 'ZDR switch · BYOK', aws: 'Retention mode · key vault' },
  { k: 'memory', ic: 'memory', label: 'Memory', cf: 'Built in: SQL, KV, R2, vectors', vc: 'Blob + Marketplace partners', aws: 'AgentCore Memory, S3 Vectors' },
  { k: 'time', ic: 'clock', label: 'Time', cf: 'Schedules, Queues, Workflows', vc: 'Workflows: "use workflow"', aws: 'Step Functions, durable Lambda' },
  { k: 'hands', ic: 'hand', label: 'Hands', cf: 'MCP, Code Mode, Browser, Sandbox', vc: 'MCP, Sandbox, Connect', aws: 'Gateway, Code Interpreter, Browser' },
  { k: 'senses', ic: 'ear', label: 'Senses', cf: 'WebSockets, email, voice', vc: 'Chat SDK, realtime voice', aws: 'Nova 2 Sonic, SES' },
  { k: 'safety', ic: 'shield', label: 'Safety', cf: 'VPC, portals, Web Bot Auth', vc: 'BotID, firewall, OIDC', aws: 'Identity, Cedar Policy, Guardrails' },
  { k: 'money', ic: 'coin', label: 'Money', cf: 'x402 in Agents SDK', vc: 'No product yet', aws: 'AgentCore payments' },
  { k: 'ship', ic: 'eye', label: 'Shipping', cf: 'One command, tracing', vc: 'Git previews, rollbacks', aws: 'CloudWatch, Evals, CDK' },
  { k: 'bill', ic: 'doc', label: 'The bill', cf: 'CPU time, from $5/mo', vc: 'Active CPU, free tier', aws: 'Per-second, many meters' },
];
const SCORE_ROW = Object.fromEntries(SCORE.map((r, i) => [r.k, i]));
// o.cell(i, k) -> 0..1 reveal of row i's cell for provider k (default 0); o.hi(i) -> 0..1 highlight; o.dim(i) -> 0..1 fade-down.
// Unfilled rows show as faint placeholders, so the viewer sees how far along the tour is.
function scoreGrid(o = {}) {
  const x0 = 70, lw = 290, cw = (1780 - lw) / 3, y0 = 232, rh = 51;
  const cell = o.cell || (() => 0), hi = o.hi || (() => 0), dim = o.dim || (() => 0);
  text('Scorecard', x0 + 8, 186, { size: 40, weight: 600, fam: SERIF });
  PROVS.forEach((k, j) => {
    const cx = x0 + lw + cw * j + cw / 2, w = measure(PV[k].name, 30, 800) + 74;
    rr(cx - w / 2, 160, w, 54, 27); ctx.fillStyle = k === 'vc' ? '#F2F2F2' : PV[k].light; ctx.fill();
    logo(k, cx - w / 2 + 34, 187, .4);
    text(PV[k].name, cx - w / 2 + 62, 188, { size: 30, weight: 800, color: PV[k].ink });
  });
  SCORE.forEach((r, i) => {
    const y = y0 + i * rh, filled = PROVS.some(k => cell(i, k) > 0), h = hi(i);
    alpha(1 - .7 * dim(i), () => {
      rr(x0, y + 3, 1780, rh - 6, 14); ctx.fillStyle = filled ? '#FFFFFF' : 'rgba(255,255,255,.45)'; ctx.fill();
      if (h > 0) { ctx.save(); ctx.globalAlpha *= h; rr(x0, y + 3, 1780, rh - 6, 14); ctx.strokeStyle = C.acc; ctx.lineWidth = 4; ctx.stroke(); ctx.restore(); }
      icon(r.ic, x0 + 32, y + rh / 2, 13, filled ? C.acc : C.muted);
      text(r.label, x0 + 60, y + rh / 2 + 1, { size: 25, weight: 800, color: filled ? C.ink : C.muted });
      PROVS.forEach((k, j) => {
        const p = cell(i, k); if (p <= 0) return;
        const x = x0 + lw + cw * j + 22;
        fade(p, () => text(r[k], x, y + rh / 2 + 1, { size: 24, weight: 600, color: PV[k].ink }), 10);
      });
    });
  });
}
