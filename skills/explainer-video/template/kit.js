// ---------- shared visual kit ----------
// Layout contract: content area is x 60..1860, y 110..850. Caption bubble covers y > ~870. Chapter chip is top-left.

// Puffy cloud, centered at x,y, width ~ 220*s
function cloud(x, y, s, fill = C.acc, o = {}) {
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

// A service card: rounded card with an icon well, name and optional status badge.
function serviceCard(x, y, w, h, name, o = {}) {
  const color = o.color || C.acc;
  card(x, y, w, h, { r: 22, stroke: o.stroke || C.line, lw: 2.5 });
  if (o.icon) { rr(x + 18, y + (h - (h - 36)) / 2, h - 36, h - 36, 16); ctx.fillStyle = o.iconBg || C.accL; ctx.fill(); icon(o.icon, x + 18 + (h - 36) / 2, y + h / 2, (h - 36) * .36, color); }
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
function packet(x1, y1, x2, y2, p, color = C.acc, r = 11) {
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


// ---------- comparison scorecard (for "X vs Y" videos) ----------
// cols: [{ name, col, light, ink }]; rows: [{ ic, label, cells: [text per column] }].
// o.cell(i, j) -> 0..1 reveal of row i, column j (default 1); o.hi(i) -> 0..1 highlight; o.dim(i) -> 0..1 fade-down.
// Unfilled rows show as faint placeholders so the viewer sees how far along the tour is.
function scoreGrid(cols, rows, o = {}) {
  const x0 = 70, lw = 290, cw = (1780 - lw) / cols.length, y0 = 232, rh = Math.min(51, 610 / rows.length);
  const cell = o.cell || (() => 1), hi = o.hi || (() => 0), dim = o.dim || (() => 0);
  text(o.title || 'Scorecard', x0 + 8, 186, { size: 40, weight: 600, fam: SERIF });
  cols.forEach((c, j) => {
    const cx = x0 + lw + cw * j + cw / 2, w = measure(c.name, 30, 800) + 44;
    rr(cx - w / 2, 160, w, 54, 27); ctx.fillStyle = c.light; ctx.fill();
    text(c.name, cx, 188, { size: 30, weight: 800, color: c.ink || c.col, align: 'center' });
  });
  rows.forEach((r, i) => {
    const y = y0 + i * rh, filled = cols.some((_, j) => cell(i, j) > 0), h = hi(i);
    alpha(1 - .7 * dim(i), () => {
      rr(x0, y + 3, 1780, rh - 6, 14); ctx.fillStyle = filled ? '#FFFFFF' : 'rgba(255,255,255,.45)'; ctx.fill();
      if (h > 0) { ctx.save(); ctx.globalAlpha *= h; rr(x0, y + 3, 1780, rh - 6, 14); ctx.strokeStyle = C.acc; ctx.lineWidth = 4; ctx.stroke(); ctx.restore(); }
      icon(r.ic, x0 + 32, y + rh / 2, 13, filled ? C.acc : C.muted);
      text(r.label, x0 + 60, y + rh / 2 + 1, { size: 25, weight: 800, color: filled ? C.ink : C.muted });
      cols.forEach((c, j) => {
        const p = cell(i, j); if (p <= 0) return;
        fade(p, () => text(r.cells[j], x0 + lw + cw * j + 22, y + rh / 2 + 1, { size: 24, weight: 600, color: c.ink || c.col }), 10);
      });
    });
  });
}
