// ---------- scenes for part E: senses, senses_2, safety, safety_cf, safety_vc, safety_aws, money ----------
// Helpers are prefixed e_ to avoid collisions with other parts.

// ----- part E helpers -----
function e_title(s, y = 160, o = {}) { text(s, o.x ?? W / 2, y, { size: o.size || 54, weight: 600, fam: SERIF, align: 'center' }); }
// provider title: logo + serif title (+ optional badge), centered on x
function e_ptitle(k, s, y = 160, b, o = {}) {
  const size = o.size || 54, tw = measure(s, size, 600, SERIF), bw = b ? measure(b.toUpperCase(), 19, 800) + 42 : 0;
  const x0 = (o.x ?? W / 2) - (96 + tw + bw) / 2;
  logo(k, x0 + 40, y + (k === 'aws' ? 2 : 0), .72);
  text(s, x0 + 96, y, { size, weight: 600, fam: SERIF });
  if (b) badge(b, x0 + 96 + tw + 18, y - 16);
}
// crossfade helper: a visual that shows from line j (fraction f0) until fraction f1 of line j1
const e_span = (S, j0, f0, j1, f1) => S.pf(j0, f0, .5) * (f1 === undefined ? 1 : 1 - S.pf(j1, f1, .45));
function e_bez(x1, y1, c1x, c1y, c2x, c2y, x2, y2, n = 30) {
  const out = [];
  for (let i = 0; i <= n; i++) { const p = i / n, u = 1 - p; out.push([u * u * u * x1 + 3 * u * u * p * c1x + 3 * u * p * p * c2x + p * p * p * x2, u * u * u * y1 + 3 * u * u * p * c1y + 3 * u * p * p * c2y + p * p * p * y2]); }
  return out;
}
function e_at(pts, p) {
  const n = (pts.length - 1) * clamp01(p), k = Math.min(pts.length - 2, Math.floor(n)), f = n - k;
  return [lerp(pts[k][0], pts[k + 1][0], f), lerp(pts[k][1], pts[k + 1][1], f)];
}
function e_poly(pts, p = 1, color = C.line, lw = 4, dash) {
  if (p <= 0) return;
  const n = (pts.length - 1) * clamp01(p), k = Math.floor(n);
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i <= k; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  if (k < pts.length - 1) { const [x, y] = e_at(pts, p); ctx.lineTo(x, y); }
  ctx.stroke(); ctx.restore();
}
function e_dot(x, y, color = C.cf, r = 10) {
  ctx.beginPath(); ctx.arc(x, y, r * 1.8, 0, 7); ctx.fillStyle = color + '33'; ctx.fill();
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = color; ctx.fill();
}
// animated sound-wave bars
function e_wave(x, y, w, h, t, color, o = {}) {
  const n = o.n || 12, gap = w / n, amp = o.amp ?? 1;
  ctx.save(); ctx.strokeStyle = color; ctx.lineCap = 'round'; ctx.lineWidth = Math.max(3, gap * .45);
  for (let i = 0; i < n; i++) {
    const k = .18 + .82 * Math.abs(Math.sin(t * (o.speed || 7) + i * 1.3) * Math.cos(t * 2.3 + i * .7));
    const hh = Math.max(4, h * k * amp) / 2, bx = x + gap * (i + .5);
    ctx.beginPath(); ctx.moveTo(bx, y - hh); ctx.lineTo(bx, y + hh); ctx.stroke();
  }
  ctx.restore();
}
function e_speaker(x, y, s, color, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineWidth = s * .14; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-s * .8, -s * .28); ctx.lineTo(-s * .45, -s * .28); ctx.lineTo(-s * .05, -s * .65); ctx.lineTo(-s * .05, s * .65); ctx.lineTo(-s * .45, s * .28); ctx.lineTo(-s * .8, s * .28); ctx.closePath(); ctx.fill();
  const ga = ctx.globalAlpha;
  for (let i = 0; i < 2; i++) { ctx.globalAlpha = ga * (.4 + .6 * Math.abs(Math.sin(t * 4 - i))); ctx.beginPath(); ctx.arc(0, 0, s * (.4 + i * .32), -.8, .8); ctx.stroke(); }
  ctx.restore();
}
function e_coin(x, y, r, spin = 0) {
  const sx = Math.max(.15, Math.abs(Math.cos(spin)));
  ctx.save(); ctx.translate(x, y); ctx.scale(sx, 1);
  ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fillStyle = '#E9B949'; ctx.fill(); ctx.lineWidth = r * .16; ctx.strokeStyle = '#C08D22'; ctx.stroke();
  text('$', 0, r * .06, { size: r * 1.15, weight: 800, color: '#8A6212', align: 'center' });
  ctx.restore();
}
function e_stamp(s, x, y, p, color = C.red, o = {}) {
  if (p <= 0) return;
  const size = o.size || 64, k = lerp(1.9, 1, eOut(p)), w = measure(s, size, 900) + size * .9, h = size * 1.5;
  ctx.save(); ctx.globalAlpha *= clamp01(p * 3); ctx.translate(x, y); ctx.rotate(o.rot ?? -.14); ctx.scale(k, k);
  rr(-w / 2, -h / 2, w, h, 14); ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = color; ctx.stroke();
  text(s, 0, 3, { size, weight: 900, color, align: 'center' });
  ctx.restore();
}
// envelope centered at (x, y)
function e_env(x, y, w, h, o = {}) {
  card(x - w / 2, y - h / 2, w, h, { r: 12 * (w / 200 + .5), fill: o.fill || '#fff', stroke: o.stroke || C.line, lw: o.lw || 3, shadow: o.shadow });
  ctx.save(); ctx.strokeStyle = o.stroke || C.line; ctx.lineWidth = o.lw || 3; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x - w / 2 + 6, y - h / 2 + 6); ctx.lineTo(x, y + h * .06); ctx.lineTo(x + w / 2 - 6, y - h / 2 + 6); ctx.stroke(); ctx.restore();
}
// browser window chrome
function e_win(x, y, w, h, url, o = {}) {
  card(x, y, w, h, { r: 18 });
  rr(x, y, w, 50, [18, 18, 0, 0]); ctx.fillStyle = '#EFE9DF'; ctx.fill();
  rr(x, y, w, h, 18); ctx.strokeStyle = o.stroke || C.line; ctx.lineWidth = o.lw || 2.5; ctx.stroke();
  ['#F0715F', '#F2C14E', '#5DC26A'].forEach((c, i) => { ctx.beginPath(); ctx.arc(x + 24 + i * 21, y + 25, 7, 0, 7); ctx.fillStyle = c; ctx.fill(); });
  if (url) { rr(x + 94, y + 11, w - 110, 28, 14); ctx.fillStyle = '#fff'; ctx.fill(); text(url, x + 110, y + 26, { size: 18, weight: 600, color: C.soft, fam: MONO }); }
}
function e_passport(x, y, s = 1, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -.08);
  card(-55 * s, -75 * s, 110 * s, 150 * s, { r: 12 * s, fill: '#243A6B' });
  text('PASSPORT', 0, -48 * s, { size: 15 * s, weight: 800, color: '#E7C77B', align: 'center' });
  icon('globe', 0, 0, 28 * s, '#E7C77B');
  text(o.name || 'Atlas', 0, 50 * s, { size: 20 * s, weight: 800, color: '#E7C77B', align: 'center' });
  ctx.restore();
}
function e_seal(x, y, r = 20, col = C.cf) {
  ctx.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, rad = i % 2 ? r * .86 : r; ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad); } ctx.closePath(); ctx.fillStyle = col; ctx.fill();
  icon('key', x + 1, y, r * .6, '#fff');
}
// grey rogue bot (o.eye / o.body recolor it)
function e_bot(x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y + Math.sin(t * 3 + x * .01) * 3 * s);
  ctx.strokeStyle = '#5E5A53'; ctx.lineWidth = 4 * s; ctx.beginPath(); ctx.moveTo(0, -s * 32); ctx.lineTo(0, -s * 48); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -s * 52, s * 6, 0, 7); ctx.fillStyle = o.eye || C.red; ctx.fill();
  rr(-s * 28, s * 36, s * 56, s * 26, s * 8); ctx.fillStyle = o.body || '#6E6860'; ctx.fill();
  rr(-s * 40, -s * 32, s * 80, s * 64, s * 18); ctx.fillStyle = o.body || '#6E6860'; ctx.fill();
  rr(-s * 30, -s * 20, s * 60, s * 34, s * 10); ctx.fillStyle = '#2E2B28'; ctx.fill();
  ctx.fillStyle = o.eye || '#FF6B5B'; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(sx * s * 13, -s * 4, s * 6, 0, 7); ctx.fill(); }
  ctx.restore();
}
// round badge with a check / cross
const e_ok = (x, y, r = 26) => { node(x, y, r, '', { fill: C.green, stroke: C.green }); check(x, y, r, '#fff'); };
const e_no = (x, y, r = 26) => { node(x, y, r, '', { fill: C.red, stroke: C.red }); cross(x, y, r * .9, '#fff'); };
// stopwatch ring; f = fraction of the ring shown (0..1)
function e_timer(x, y, r, f, col) {
  ctx.save();
  rr(x - 12, y - r - 22, 24, 14, 5); ctx.fillStyle = C.soft; ctx.fill();
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 9; ctx.strokeStyle = C.line; ctx.stroke();
  if (f > 0) { ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * clamp01(f)); ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.stroke(); }
  const a = -Math.PI / 2 + Math.PI * 2 * clamp01(f);
  ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * (r - 18), y + Math.sin(a) * (r - 18)); ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y, 6, 0, 7); ctx.fillStyle = C.ink; ctx.fill();
  ctx.restore();
}
// glowing tunnel from x1 to x2 at height y, with ribs
function e_tunnel(x1, x2, y, r = 42) {
  if (x2 <= x1 + 2) return;
  ctx.save(); ctx.shadowColor = 'rgba(243,128,32,.55)'; ctx.shadowBlur = 30;
  rr(x1, y - r, x2 - x1, 2 * r, r); ctx.fillStyle = 'rgba(253,227,200,.95)'; ctx.fill(); ctx.restore();
  rr(x1, y - r, x2 - x1, 2 * r, r); ctx.strokeStyle = C.cf; ctx.lineWidth = 5; ctx.stroke();
  ctx.save(); ctx.strokeStyle = 'rgba(243,128,32,.35)'; ctx.lineWidth = 3;
  for (let rx = x1 + 70; rx < x2 - 30; rx += 80) { ctx.beginPath(); ctx.ellipse(rx, y, 10, r * .85, 0, 0, 7); ctx.stroke(); }
  ctx.restore();
}
// brick wall around a private network
function e_wall(x, y, w, h) {
  card(x, y, w, h, { r: 30, fill: '#FBF6EE' });
  ctx.save(); rr(x, y, w, h, 30); ctx.lineWidth = 18; ctx.strokeStyle = '#A1927C'; ctx.stroke();
  ctx.setLineDash([24, 10]); ctx.lineWidth = 4; ctx.strokeStyle = '#7F725F'; rr(x, y, w, h, 30); ctx.stroke(); ctx.restore();
}
// provider column card with a tinted header (like triCards); body(cx, y) draws the content
function e_col(k, i, p, body, o = {}) {
  const w = 540, x = 110 + i * 580, y = o.y ?? 240, h = o.h ?? 500;
  fade(p, () => {
    if (o.dashed) { ctx.save(); rr(x, y, w, h, 28); ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fill(); ctx.setLineDash([14, 10]); ctx.strokeStyle = C.muted; ctx.lineWidth = 3; ctx.stroke(); ctx.restore(); }
    else card(x, y, w, h, { r: 28, stroke: C.line, lw: 2.5 });
    rr(x, y, w, 100, [28, 28, 0, 0]); ctx.fillStyle = k === 'vc' ? '#F2F2F2' : PV[k].light; ctx.globalAlpha *= o.dashed ? .6 : 1; ctx.fill(); ctx.globalAlpha /= o.dashed ? .6 : 1;
    logo(k, x + 66, y + 50, .6);
    text(PV[k].name, x + 120, y + 51, { size: 34, weight: 800, color: PV[k].ink });
    body(x + w / 2, y, x);
  }, 24);
}
// chat-app chip: coloured square with the initial + app name
function e_app(name, col, x, y) {
  card(x, y - 38, 400, 76, { r: 20, stroke: C.line, lw: 2 });
  rr(x + 14, y - 26, 52, 52, 14); ctx.fillStyle = col; ctx.fill();
  text(name[0], x + 40, y + 1, { size: 30, weight: 800, color: '#fff', align: 'center' });
  text(name, x + 84, y + 1, { size: 30, weight: 700 });
}
// tollbooth where bots pay a coin to pass. Laid out around (1400, 700) and placed at (ox, oy) with scale s.
// t0: when cars start arriving; o.site: label on the site card; o.cap: caption under the road.
function e_toll(ox, oy, s, t, t0, o = {}) {
  ctx.save(); ctx.translate(ox, oy); ctx.scale(s, s); ctx.translate(-1400, -700);
  rr(1000, 700, 830, 30, 8); ctx.fillStyle = '#CFC6B8'; ctx.fill();
  card(1620, 420, 190, 280, { r: 18, stroke: C.line, lw: 2.5 });
  icon('doc', 1715, 490, 30, C.soft); text(o.site || 'website', 1715, 560, { size: 28, weight: 800, align: 'center' });
  for (let i = 0; i < 3; i++) { rr(1650, 600 + i * 26, 130, 10, 5); ctx.fillStyle = C.line; ctx.fill(); }
  const col = o.col || C.cf;
  rr(1400, 540, 120, 160, 12); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(1385, 545); ctx.lineTo(1460, 495); ctx.lineTo(1535, 545); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
  rr(1420, 570, 80, 50, 8); ctx.fillStyle = C.blueL; ctx.fill();
  text(o.sign || 'TOLL', 1460, 660, { size: 24, weight: 900, color: col, align: 'center' });
  const T = 3, lt = t - t0, cyc = lt > 0 ? lt % T : 0, n = lt > 0 ? Math.floor(lt / T) : 0;
  const approach = clamp01(cyc / .9), pay = clamp01((cyc - .9) / .5), lift = clamp01((cyc - 1.4) / .35), pass = clamp01((cyc - 1.6) / 1.1);
  const armA = 1.25 * eOut(lift) * (1 - clamp01((cyc - 2.6) / .3));
  ctx.save(); ctx.translate(1395, 630); ctx.rotate(armA);
  for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? '#fff' : C.red; ctx.fillRect(-180 + i * 30, -9, 30, 18); }
  ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.strokeRect(-180, -9, 180, 18); ctx.beginPath(); ctx.arc(0, 0, 12, 0, 7); ctx.fillStyle = C.ink; ctx.fill();
  ctx.restore();
  if (lt > 0) {
    const bx = pass > 0 ? lerp(1170, 1600, eIO(pass)) : lerp(1020, 1170, eOut(approach));
    alpha(1 - clamp01((pass - .8) * 5), () => e_bot(bx, 638, .7, t, { eye: '#8FC7F0', body: [C.teal, C.purple][n % 2] }));
    if (pay > 0 && pay < 1) e_coin(lerp(1190, 1440, pay), 600 - Math.sin(pay * Math.PI) * 70, 16, t * 10);
  }
  if (o.cap) text(o.cap, 1400, 790, { size: 26, weight: 700, color: C.soft, align: 'center' });
  ctx.restore();
}
// pill with an icon inside on the left; ic is an icon kind or a draw function (x, y)
function e_ipill(s, ic, cx, cy, o = {}) {
  const size = o.size || 28, iw = size * 1.1, w = measure(s, size, 700) + iw + size * 1.7, h = size * 1.9, x = cx - w / 2;
  card(x, cy - h / 2, w, h, { r: h / 2, fill: o.fill || '#fff', stroke: o.stroke, lw: 2.5, shadow: o.shadow });
  const ix = x + size * .7 + iw / 2;
  if (typeof ic === 'function') ic(ix, cy); else icon(ic, ix, cy, size * .5, o.color || C.ink);
  text(s, ix + iw / 2 + size * .3, cy + 1, { size, weight: 700, color: o.color || C.ink });
  return w;
}
// a leather wallet
function e_wallet(x, y, s = 1) {
  card(x - 115 * s, y - 80 * s, 230 * s, 160 * s, { r: 22 * s, fill: '#9C6B3E' });
  rr(x + 5 * s, y - 40 * s, 120 * s, 80 * s, 18 * s); ctx.fillStyle = '#7E5430'; ctx.fill();
  ctx.beginPath(); ctx.arc(x + 45 * s, y, 12 * s, 0, 7); ctx.fillStyle = C.cfY; ctx.fill();
}

// ----- senses -----
const E_CH = [['chat', 'chat'], ['mic', 'voice'], ['mail', 'email']];
const E_APPS = [['Slack', '#4A154B'], ['Teams', '#5059C9'], ['WhatsApp', '#25A864'], ['Discord', '#5865F2'], ['Telegram', '#229ED9']];
SCN.senses = {
  chapter: CH.senses,
  draw(S, t) {
    chapterTitle(S, 7, 'Senses', 'ear');
    // line 0 tail: chat, voice, email
    alpha(S.p(0, 3.1, .5) * S.out(1, 0, .5), () => {
      e_title('How does Atlas talk to people?', 160);
      atlas(960, 390, 1.3, t, { mood: 'happy' });
      E_CH.forEach(([ic, nm], i) => {
        const x = 560 + i * 400, y = 650, p = S.pf(0, wordAt('senses', 0, nm), .5);
        if (p > 0) line(960, 470, lerp(960, x, p), lerp(470, y - 64, p), C.line, 4, [4, 10]);
        if (p >= 1) packet(x, y - 64, 960, 470, (t * .7 + i * .33) % 1, C.acc, 7);
        pop(x, y, p, () => {
          node(x, y, 62, '', { fill: '#fff', stroke: C.acc, lw: 4 }); icon(ic, x, y, 30, C.acc);
          text(nm, x, y + 100, { size: 34, weight: 800, color: C.acc, align: 'center' });
        });
      });
    });
    // line 1: Cloudflare keeps the WebSocket open and hibernates between messages
    alpha(S.p(1, 0, .5) * S.out(2, 0, .5), () => {
      const fC = wordAt('senses', 1, 'Cloudflare'), cf = S.pf(1, fC, .5);
      alpha(1 - cf, () => e_title('Live connections differ', 160));
      alpha(cf, () => e_ptitle('cf', 'WebSockets that stay open', 160));
      const tube = S.pf(1, wordAt('senses', 1, 'WebSockets'), 1.0, eIO), tH = S.at(1, wordAt('senses', 1, 'hibernate'));
      const c = t > tH ? (t - tH) % 3.2 : -1, asleep = c >= 0 && (c < .9 || c > 2.1), sent = c >= 0 && c < .9;
      fade(S.p(1, .1), () => {
        phone(380, 470, 1.25, (x, y, w, h) => {
          rr(x, y, w, 44, 0); ctx.fillStyle = C.blueL; ctx.fill();
          text('Atlas', x + w / 2, y + 23, { size: 20, weight: 800, color: C.blue, align: 'center' });
          rr(x + 12, y + 64, w * .62, 34, 12); ctx.fillStyle = '#EFE9DF'; ctx.fill();
          rr(x + w * .3, y + 112, w * .62, 34, 12); ctx.fillStyle = C.blueL; ctx.fill();
          rr(x + 12, y + 160, w * .5, 34, 12); ctx.fillStyle = '#EFE9DF'; ctx.fill();
          if (sent) alpha(1 - c / .9, () => { rr(x + w * .3, y + 208, w * .62, 34, 12); ctx.fillStyle = C.cf; ctx.fill(); });
        });
        text('traveller', 380, 690, { size: 28, weight: 700, color: C.soft, align: 'center' });
      }, 0);
      if (tube > 0) {
        e_tunnel(480, lerp(480, 1360, tube), 470, 32);
        alpha(clamp01(tube * 2 - 1), () => text('WebSocket · stays open', 920, 408, { size: 28, weight: 800, color: C.orangeD, align: 'center' }));
      }
      if (c >= 0) {
        if (c < .9) e_dot(lerp(500, 1340, c / .9), 470, C.cf, 11);
        if (c > 1.0 && c < 1.8) e_dot(lerp(1340, 500, (c - 1.0) / .8), 470, C.blue, 11);
      }
      fade(S.p(1, .2), () => {
        atlas(1480, 470, 1.5, t, { mood: asleep ? 'sleep' : 'happy' });
        if (asleep) for (let i = 0; i < 3; i++) { const z = ((t * .7) + i / 3) % 1; alpha(Math.sin(z * Math.PI), () => text('z', 1580 + z * 50, 370 - z * 90, { size: 30 + i * 6, weight: 800, color: C.blue })); }
        if (c >= 0) text(asleep ? 'hibernating between messages' : 'awake instantly', 1480, 610, { size: 28, weight: 800, color: asleep ? C.soft : C.green, align: 'center' });
      }, 0);
      pop(960, 740, S.pf(1, wordAt('senses', 1, 'as long'), .5), () => pill('∞  as long as they like', 960, 740, { size: 32, fill: C.cfL, color: C.orangeD }));
    });
    // line 2: Vercel (beta, function time limit) vs AgentCore (up to 60 min)
    alpha(S.p(2, 0, .5) * S.out(3, 0, .5), () => {
      e_title('How long can the line stay open?', 160);
      const row = (k, y, p, prod, bp, body) => fade(p, () => {
        card(110, y - 110, 1700, 220, { r: 26 });
        logo(k, 190, y - 34, .72);
        text(PV[k].name, 250, y - 32, { size: 36, weight: 800, color: PV[k].ink });
        text(prod, 140, y + 42, { size: 28, weight: 700, color: C.soft });
        if (bp !== undefined) pop(140 + measure(prod, 28, 700) + 60, y + 42, bp, () => badge('beta', 140 + measure(prod, 28, 700) + 16, y + 26));
        body();
      }, 16);
      // Vercel: timer runs down to the function limit, then the line drops
      const yv = 390, tv0 = S.ls(2) + .6, tv1 = S.at(2, wordAt('senses', 2, 'time limit')) + .4;
      const left = 1 - clamp01((t - tv0) / (tv1 - tv0)), cut = t > tv1;
      row('vc', yv, S.p(2, 0, .5), 'WebSockets', S.pf(2, wordAt('senses', 2, 'beta'), .5), () => {
        icon('user', 580, yv, 28, C.soft);
        if (!cut) { line(630, yv, 1300, yv, PV.vc.col, 8); e_dot(lerp(640, 1290, (t * .6) % 1), yv, PV.vc.col, 9); }
        else { line(630, yv, 930, yv, C.red, 8, [14, 12]); line(1000, yv, 1300, yv, C.red, 8, [14, 12]); pop(965, yv, clamp01((t - tv1) / .4), () => e_no(965, yv, 24)); }
        atlas(1350, yv + 4, .55, t, { mood: 'ok' });
        e_timer(1520, yv, 56, left, left < .25 ? C.red : PV.vc.col);
        text('function', 1600, yv - 18, { size: 28, weight: 800, color: C.red });
        text('time limit', 1600, yv + 18, { size: 28, weight: 800, color: C.red });
      });
      // AWS: AgentCore streams up to an hour
      const ya = 670, fA = wordAt('senses', 2, 'AgentCore'), pa = S.pf(2, fA, .5), fill = clamp01((t - S.at(2, fA)) / 9);
      row('aws', ya, pa, 'AgentCore Runtime', undefined, () => {
        icon('user', 580, ya, 28, C.soft);
        line(630, ya, 1300, ya, PV.aws.col, 8);
        for (let i = 0; i < 2; i++) e_dot(lerp(640, 1290, (t * .6 + i * .5) % 1), ya, PV.aws.smile, 9);
        atlas(1350, ya + 4, .55, t, { mood: 'happy' });
        e_timer(1520, ya, 56, fill, C.green);
        alpha(S.pf(2, wordAt('senses', 2, 'up to'), .5), () => {
          text('up to', 1600, ya - 18, { size: 28, weight: 800, color: C.green });
          text('60 min', 1600, ya + 18, { size: 28, weight: 800, color: C.green });
        });
      });
    });
    // line 3: Vercel Chat SDK, one bot, many apps
    alpha(S.p(3, 0, .5), () => {
      const fV = wordAt('senses', 3, 'Vercel'), sdk = S.pf(3, fV, .5);
      alpha(1 - sdk, () => e_title('Reach people where they chat', 160));
      alpha(sdk, () => e_ptitle('vc', 'Chat SDK', 160));
      const fx = [wordAt('senses', 3, 'Slack'), wordAt('senses', 3, 'Teams'), wordAt('senses', 3, 'WhatsApp'), fV + .1, fV + .14];
      E_APPS.forEach(([nm, col], i) => {
        const y = 250 + i * 108, p = S.pf(3, fx[i], .5);
        const pts = e_bez(760, 470, 1000, 470, 1100, y, 1330, y, 24), lp = S.pf(3, fV + .12 + i * .03, .6);
        e_poly(pts, lp, C.line, 5);
        if (lp >= 1) { const [x, yy] = e_at(pts, (t * .55 + i * .2) % 1); e_dot(x, yy, PV.vc.col, 7); }
        pop(1530, y, p, () => e_app(nm, col, 1330, y));
      });
      pop(560, 470, sdk, () => {
        card(360, 330, 400, 280, { r: 28, stroke: PV.vc.col, lw: 4 });
        node(560, 410, 44, '', { fill: '#F2F2F2', stroke: PV.vc.col, lw: 3 }); icon('code', 560, 410, 24, PV.vc.col);
        text('one bot', 560, 500, { size: 42, weight: 800, align: 'center' });
        text('bot.ts', 560, 555, { size: 26, weight: 600, fam: MONO, color: C.soft, align: 'center' });
      });
      pop(960, 790, S.pf(3, wordAt('senses', 3, 'write'), .5), () => pill('write one bot, run it in many apps', 960, 790, { size: 30, fill: C.accL, color: C.acc }));
    });
  },
};

// ----- senses_2: voice and email -----
SCN.senses_2 = {
  chapter: CH.senses,
  draw(S, t) {
    // line 0: voice
    alpha(S.p(0, 0, .5) * S.out(1, 0, .5), () => {
      e_title('Voice', 160);
      const at = k => S.pf(0, wordAt('senses_2', 0, k), .6);
      const vy = 590;
      e_col('cf', 0, at('Cloudflare'), (cx, y, x) => {
        badge('beta', x + 520, y + 34, { align: 'right' });
        text('Voice agents', cx, 410, { size: 38, weight: 800, align: 'center' });
        text('talk to your agent live', cx, 458, { size: 26, weight: 600, color: C.soft, align: 'center' });
        node(cx - 180, vy, 44, '', { fill: C.cfL, stroke: C.cf, lw: 3 }); icon('mic', cx - 180, vy, 22, C.cf);
        e_wave(cx - 125, vy, 190, 80, t, C.cf, { n: 10 });
        atlas(cx + 165, vy + 6, .72, t, { mood: 'happy' });
      });
      e_col('vc', 1, at('Vercel'), (cx) => {
        text('Realtime speech', cx, 410, { size: 38, weight: 800, align: 'center' });
        text('models via AI Gateway', cx, 458, { size: 26, weight: 600, color: C.soft, align: 'center' });
        e_wave(cx - 225, vy, 150, 70, t, C.soft, { n: 8 });
        node(cx, vy, 52, '', { fill: '#F2F2F2', stroke: PV.vc.col, lw: 4 }); logo('vc', cx, vy + 2, .42);
        text('AI Gateway', cx, vy + 82, { size: 24, weight: 800, align: 'center' });
        e_wave(cx + 75, vy, 150, 70, t + 1.5, PV.vc.col, { n: 8 });
      });
      e_col('aws', 2, at('AWS'), (cx) => {
        text('Nova 2 Sonic', cx, 410, { size: 38, weight: 800, align: 'center' });
        text('speech-to-speech model', cx, 458, { size: 26, weight: 600, color: C.soft, align: 'center' });
        node(cx - 180, vy, 44, '', { fill: PV.aws.light, stroke: PV.aws.col, lw: 3 }); icon('mic', cx - 180, vy, 22, PV.aws.col);
        e_wave(cx - 120, vy, 180, 80, t + .7, PV.aws.smile, { n: 10 });
        e_speaker(cx + 170, vy, 34, PV.aws.col, t);
        alpha(S.pf(0, wordAt('senses_2', 0, 'speech-to-speech'), .5), () => {
          text('speech in', cx - 180, vy + 90, { size: 24, weight: 800, color: C.soft, align: 'center' });
          text('speech out', cx + 170, vy + 90, { size: 24, weight: 800, color: C.soft, align: 'center' });
          arrow(cx - 90, vy + 90, cx + 80, vy + 90, 1, { color: C.muted, lw: 4, head: 12 });
        });
      });
    });
    // line 1: email
    alpha(S.p(1, 0, .5), () => {
      e_title('Email', 160);
      const at = k => S.pf(1, wordAt('senses_2', 1, k), .6), ey = 600;
      e_col('cf', 0, at('Cloudflare'), (cx, y, x) => {
        pop(x + 470, y + 50, at('in beta'), () => badge('beta', x + 520, y + 34, { align: 'right' }));
        text('Email Service', cx, 410, { size: 38, weight: 800, align: 'center' });
        text('receive and send mail', cx, 458, { size: 26, weight: 600, color: C.soft, align: 'center' });
        atlas(cx, ey, .8, t, { mood: 'happy' });
        const k1 = (t * .5) % 1, k2 = (t * .5 + .5) % 1;
        alpha(Math.sin(k1 * Math.PI), () => e_env(lerp(cx - 230, cx - 90, k1), ey, 70, 46, { stroke: C.cf, lw: 3, shadow: false }));
        alpha(Math.sin(k2 * Math.PI), () => e_env(lerp(cx + 90, cx + 230, k2), ey, 70, 46, { stroke: C.cf, lw: 3, shadow: false }));
        text('in', cx - 170, ey + 90, { size: 26, weight: 800, color: C.orangeD, align: 'center' });
        text('out', cx + 170, ey + 90, { size: 26, weight: 800, color: C.orangeD, align: 'center' });
      });
      e_col('vc', 1, at('Vercel'), (cx) => {
        text('no email product', cx, 410, { size: 36, weight: 800, color: C.red, align: 'center' });
        icon('mail', cx, 510, 34, C.muted); cross(cx, 510, 60, C.red);
        const rp = at('partner');
        arrow(cx, 575, cx, 575 + 50 * rp, rp, { color: C.muted, lw: 4, head: 12 });
        pop(cx, 680, rp, () => {
          e_ipill('Resend (partner)', 'mail', cx, 680, { size: 28, stroke: C.line });
        });
      }, { dashed: true });
      e_col('aws', 2, at('AWS'), (cx) => {
        text('Amazon SES', cx, 410, { size: 38, weight: 800, align: 'center' });
        server(cx - 140, ey, .8, PV.aws.col);
        for (let i = 0; i < 3; i++) { const k = (t * .45 + i / 3) % 1; alpha(Math.sin(k * Math.PI), () => e_env(lerp(cx - 50, cx + 200, k), ey - 40 + i * 40, 60, 40, { stroke: PV.aws.smile, lw: 3, shadow: false })); }
      });
    });
  },
};

// ----- safety -----
const E_Q = [['Who can talk to the agent?', 'who'], ['What can it touch?', 'what'], ['Can websites trust it?', 'websites']];
SCN.safety = {
  chapter: CH.safety,
  draw(S, t) {
    chapterTitle(S, 8, 'Safety & identity', 'shield');
    // line 0 tail: personal data + money -> locks, IDs, rules
    alpha(S.p(0, 3.1, .5) * S.out(1, 0, .5), () => {
      e_title('Atlas holds data and money', 160);
      atlas(960, 420, 1.4, t, { mood: 'ok' });
      pop(560, 420, S.pf(0, wordAt('safety', 0, 'personal'), .5), () => {
        card(420, 330, 280, 180, { r: 24, stroke: C.blue, lw: 3 });
        icon('doc', 480, 400, 30, C.blue); text('personal', 520, 390, { size: 28, weight: 800 }); text('data', 520, 428, { size: 28, weight: 800 });
        for (let i = 0; i < 2; i++) { rr(450, 460 + i * 20, 220 - i * 60, 10, 5); ctx.fillStyle = C.blueL; ctx.fill(); }
      });
      pop(1360, 420, S.pf(0, wordAt('safety', 0, 'spend'), .5), () => {
        card(1220, 330, 280, 180, { r: 24, stroke: '#C08D22', lw: 3 });
        e_coin(1280, 420, 30, Math.sin(t * 2) * .7); text('can spend', 1325, 400, { size: 28, weight: 800 }); text('money', 1325, 438, { size: 28, weight: 800 });
      });
      [['lock', 'locks'], ['user', 'IDs'], ['doc', 'rules']].forEach(([ic, nm], i) => {
        const x = 620 + i * 340, p = S.pf(0, wordAt('safety', 0, nm), .45);
        pop(x, 690, p, () => e_ipill(nm, ic, x, 690, { size: 34, fill: C.accL, color: C.acc }));
      });
    });
    // line 1: the three questions
    alpha(S.p(1, 0, .5), () => {
      e_title('Three questions', 160);
      E_Q.forEach(([q, w], i) => {
        const x = 110 + i * 580, cx = x + 270, iy = 430, p = S.pf(1, wordAt('safety', 1, w), .55);
        pop(cx, 490, p, () => {
          card(x, 250, 540, 480, { r: 28, stroke: C.line, lw: 2.5 });
          node(x + 50, 295, 22, i + 1, { fill: C.acc, stroke: C.acc, color: '#fff', size: 24 });
          if (i === 0) {
            const open = .5 + .5 * Math.sin(t * 1.6);
            rr(cx - 80, iy - 120, 160, 230, [16, 16, 0, 0]); ctx.fillStyle = '#FFF4D6'; ctx.fill();
            const dw = 160 * (1 - .45 * open);
            rr(cx - 80, iy - 120, dw, 230, [16, 16, 0, 0]); ctx.fillStyle = '#8A5A3C'; ctx.fill();
            ctx.beginPath(); ctx.arc(cx - 80 + dw - 20, iy, 8, 0, 7); ctx.fillStyle = C.cfY; ctx.fill();
            line(cx - 110, iy + 112, cx + 110, iy + 112, '#8C8272', 6);
          } else if (i === 1) {
            const reach = Math.sin(t * 2) * 12;
            icon('hand', cx - 60 + reach, iy + 10, 60, C.blue);
            node(cx + 80, iy, 58, '', { fill: C.redL, stroke: C.red, lw: 4 }); icon('lock', cx + 80, iy + 4, 32, C.red);
          } else {
            e_passport(cx - 10, iy, 1.3, { rot: -.08 + Math.sin(t * 1.5) * .04 });
            e_seal(cx + 70, iy - 70, 26);
          }
          wrap(q, 460, 36, 800).forEach((ln, k, a) => text(ln, cx, 640 + (k - (a.length - 1) / 2) * 46, { size: 36, weight: 800, align: 'center' }));
        });
      });
    });
  },
};

// ----- safety_cf -----
const E_TOOLS = ['calendar', 'files', 'CRM', 'bookings'];
SCN.safety_cf = {
  chapter: CH.safety,
  draw(S, t) {
    const fM = wordAt('safety_cf', 0, 'MCP'), fX = wordAt('safety_cf', 1, 'And AI Crawl');
    // line 0a: Workers VPC tunnel into the private network
    alpha(S.p(0, 0, .5) * (1 - S.pf(0, fM - .02, .45)), () => {
      e_ptitle('cf', 'Workers VPC', 160);
      pop(230, 480, S.p(0, .2, .5), () => {
        card(110, 360, 240, 240, { r: 28, fill: C.cf });
        text('Worker', 230, 392, { size: 26, weight: 800, color: '#fff', align: 'center' });
        rr(140, 415, 180, 160, 20); ctx.fillStyle = '#FFF4EA'; ctx.fill();
        atlas(230, 505, .9, t, { mood: 'happy' });
      });
      pop(1465, 470, S.p(0, .4, .6), () => {
        e_wall(1150, 260, 640, 420);
        text('private network', 1470, 310, { size: 28, weight: 800, color: '#7F725F', align: 'center' });
        icon('db', 1320, 470, 46, C.soft); text('database', 1320, 570, { size: 26, weight: 800, align: 'center' });
        card(1490, 420, 240, 100, { r: 20, stroke: C.line, lw: 2.5 });
        icon('code', 1535, 470, 20, C.soft); text('internal API', 1565, 471, { size: 26, weight: 800 });
        line(1380, 470, 1490, 470, C.line, 4, [4, 8]);
      });
      const g = S.pf(0, wordAt('safety_cf', 0, 'reach'), 1.2, eIO);
      if (g > 0) {
        e_tunnel(350, lerp(350, 1260, g), 480, 40);
        if (g >= 1) for (let i = 0; i < 3; i++) { const k = (t * .45 + i / 3) % 1; if (k < .5) e_dot(lerp(380, 1230, k * 2), 468, C.cf, 9); else e_dot(lerp(1230, 380, (k - .5) * 2), 494, C.green, 9); }
        alpha(clamp01(g * 2 - 1), () => text('private tunnel', 760, 555, { size: 26, weight: 800, color: C.orangeD, align: 'center' }));
      }
      const ex = S.pf(0, wordAt('safety_cf', 0, 'without'), .5);
      fade(ex, () => {
        node(700, 290, 38, '', { fill: '#fff', stroke: C.soft, lw: 3 }); icon('globe', 700, 290, 22, C.soft);
        text('public internet', 755, 291, { size: 26, weight: 800, color: C.soft });
        line(1000, 300, 1140, 300, C.muted, 4, [6, 10]);
        cross(1070, 300, 34, C.red, ex);
      }, 0);
      pop(760, 730, S.pf(0, wordAt('safety_cf', 0, 'exposing') + .04, .5), () => e_ipill('not exposed to the internet', 'lock', 760, 730, { size: 28, fill: C.greenL, color: C.green }));
    });
    // line 0b: MCP server portal, one secure door to company tools
    alpha(S.pf(0, fM, .5) * S.out(1, 0, .5), () => {
      e_ptitle('cf', 'MCP server portals', 160);
      atlas(240, 480, 1.2, t, { mood: 'happy', label: 'Atlas' });
      const l1 = S.pf(0, fM + .05, .5);
      line(330, 480, lerp(330, 850, l1), 480, C.cf, 5);
      if (l1 >= 1) e_dot(lerp(340, 840, (t * .6) % 1), 480, C.cf, 8);
      E_TOOLS.forEach((nm, j) => {
        const y = 300 + j * 120, pts = e_bez(1030, 480, 1220, 480, 1220, y, 1420, y, 20), p = S.pf(0, fM + .1 + j * .04, .5);
        e_poly(pts, p, C.cf, 4);
        if (p >= 1) { const [x, yy] = e_at(pts, (t * .5 + j * .25) % 1); e_dot(x, yy, C.cf, 7); }
        fade(p, () => {
          card(1420, y - 36, 340, 72, { r: 18, stroke: C.line, lw: 2.5 });
          icon('tool', 1460, y, 16, C.soft);
          text(nm, 1492, y + 1, { size: 28, weight: 700, fam: MONO });
          text('MCP', 1740, y + 1, { size: 18, weight: 800, color: C.muted, align: 'right' });
        }, 0);
      });
      alpha(S.pf(0, fM + .1, .5), () => text('company tools', 1590, 232, { size: 26, weight: 800, color: C.soft, align: 'center' }));
      pop(940, 480, S.pf(0, fM + .02, .6), () => {
        card(850, 320, 180, 320, { r: 26, fill: C.cf });
        rr(875, 350, 130, 270, 18); ctx.fillStyle = '#FFF4EA'; ctx.fill();
        node(940, 450, 40, '', { fill: C.cfL, stroke: C.cf, lw: 3 }); icon('lock', 940, 452, 22, C.cf);
        ctx.beginPath(); ctx.arc(985, 530, 8, 0, 7); ctx.fillStyle = C.cf; ctx.fill();
        text('one door', 940, 590, { size: 24, weight: 800, color: C.orangeD, align: 'center' });
      });
      pop(940, 730, S.pf(0, wordAt('safety_cf', 0, 'secure door'), .5), () => e_ipill('one secure door for company tools', 'lock', 940, 730, { size: 28, fill: C.cfL, color: C.orangeD }));
    });
    // line 1a: Web Bot Auth, a signed passport the website verifies
    alpha(S.p(1, 0, .5) * (1 - S.pf(1, fX - .02, .45)), () => {
      e_ptitle('cf', 'Web Bot Auth', 160);
      atlas(270, 460, 1.3, t, { mood: 'happy', label: 'Atlas' });
      const pp = S.pf(1, wordAt('safety_cf', 1, 'signed passport'), .5);
      pop(450, 520, pp, () => { e_passport(450, 520, 1); e_seal(495, 455, 20); });
      alpha(pp, () => text('signed passport', 450, 625, { size: 24, weight: 800, color: '#243A6B', align: 'center' }));
      fade(S.p(1, .2), () => {
        e_win(1150, 260, 630, 440, 'hotels.example');
        text('Lisbon Hotels', 1465, 370, { size: 40, weight: 700, fam: SERIF, color: C.blue, align: 'center' });
      }, 0);
      const vf = wordAt('safety_cf', 1, 'verify'), vv = S.pf(1, vf, .5);
      alpha(S.p(1, .3) * (1 - vv), () => text('who is this?', 1465, 520, { size: 30, weight: 700, color: C.soft, align: 'center' }));
      pop(1465, 510, vv, () => { e_ok(1465, 500, 40); text('verified agent', 1465, 590, { size: 32, weight: 800, color: C.green, align: 'center' }); });
      if (pp >= 1) for (let i = 0; i < 2; i++) {
        const t0 = S.at(1, wordAt('safety_cf', 1, 'signed passport')) + .5 + i * 1.4, k = ((t - t0) / 2.8) % 1;
        if (t < t0) continue;
        const x = lerp(560, 1130, k);
        alpha(clamp01(k * 8) * clamp01((1 - k) * 8), () => { e_env(x, 470, 80, 54, { stroke: C.cf, lw: 3, shadow: false }); e_seal(x + 38, 448, 14); });
      }
      pop(1300, 770, S.pf(1, wordAt('safety_cf', 1, 'real'), .5), () => pill('a real, well-behaved agent', 1465, 770, { size: 28, fill: C.greenL, color: C.green }));
    });
    // line 1b: AI Crawl Control lets sites choose which bots get in
    alpha(S.pf(1, fX, .5), () => {
      e_ptitle('cf', 'AI Crawl Control', 160);
      const t0 = S.at(1, fX), ph = t - t0;
      fade(clamp01(ph / .5), () => {
        e_win(1320, 250, 470, 500, 'hotels.example');
        text('which bots get in?', 1555, 345, { size: 28, weight: 800, align: 'center' });
        [['atlas.example', 'Allow', C.green, 1.0], ['unknown-bot', 'Block', C.red, 1.6]].forEach(([nm, lab, col, at], i) => {
          const y = 440 + i * 110, on = clamp01((ph - at) / .4);
          rr(1350, y - 40, 410, 80, 16); ctx.fillStyle = '#F8F4EC'; ctx.fill();
          text(nm, 1372, y + 1, { size: 24, weight: 700, fam: MONO });
          rr(1640, y - 24, 104, 48, 14); ctx.fillStyle = on > .5 ? col : C.idle; ctx.fill();
          text(lab, 1692, y + 1, { size: 22, weight: 800, color: '#fff', align: 'center' });
        });
        line(160, 760, 1300, 760, C.line, 6);
      }, 0);
      // gate: a post with a barrier arm across the road; it lifts for the signed agent only
      const walk = clamp01((ph - .3) / 1.8), lift = clamp01((ph - .9) / .3) * (1 - clamp01((ph - 2.0) / .3));
      fade(clamp01(ph / .5), () => {
        rr(1120, 560, 24, 200, 8); ctx.fillStyle = C.cf; ctx.fill();
        ctx.save(); ctx.translate(1132, 600); ctx.rotate(1.3 * eOut(lift));
        for (let i = 0; i < 7; i++) { ctx.fillStyle = i % 2 ? '#fff' : C.red; ctx.fillRect(-224 + i * 32, -10, 32, 20); }
        ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.strokeRect(-224, -10, 224, 20); ctx.beginPath(); ctx.arc(0, 0, 14, 0, 7); ctx.fillStyle = C.ink; ctx.fill();
        ctx.restore();
      }, 0);
      alpha(clamp01(ph / .4) * (1 - clamp01((ph - 2.0) / .4)), () => { const ax = lerp(260, 1280, eIO(walk)); atlas(ax, 660, 1.0, t, { mood: 'happy' }); e_seal(ax + 50, 620, 18); });
      pop(1132, 500, clamp01((ph - 1.0) / .4) * (1 - clamp01((ph - 2.3) / .3)), () => e_ok(1132, 500, 30));
      // an unknown bot is stopped at the arm and turned away
      const bIn = clamp01((ph - 1.8) / 1.0), bOut = clamp01((ph - 3.1) / 1.0), bx = lerp(lerp(160, 800, eOut(bIn)), 300, eIO(bOut));
      if (ph > 1.8) { e_bot(bx, 680, 1.0, t); pop(bx, 570, clamp01((ph - 2.6) / .4), () => e_no(bx, 570, 30)); }
      alpha(clamp01((ph - 1.2) / .4) * (1 - clamp01((ph - 2.5) / .3)), () => text('signed agent: let in', 700, 815, { size: 30, weight: 800, color: C.green, align: 'center' }));
      alpha(clamp01((ph - 2.7) / .4), () => text('unknown bot: turned away', 700, 815, { size: 30, weight: 800, color: C.red, align: 'center' }));
    });
  },
};

// ----- safety_vc -----
SCN.safety_vc = {
  chapter: CH.safety,
  draw(S, t) {
    const fF = wordAt('safety_vc', 0, 'firewall'), fO = wordAt('safety_vc', 0, 'OIDC'), fL = wordAt('safety_vc', 0, 'short-lived'), fS = wordAt('safety_vc', 0, 'stored');
    // line 0a: BotID on the checkout page, firewall rules
    alpha(S.p(0, 0, .5) * (1 - S.pf(0, fO - .02, .45)), () => {
      e_ptitle('vc', 'BotID and the Firewall', 160);
      fade(S.p(0, .1), () => {
        e_win(560, 250, 600, 480, 'shop.example/checkout');
        text('Checkout', 610, 350, { size: 36, weight: 800 });
        text('Lisbon trip', 610, 400, { size: 26, weight: 600, color: C.soft });
        for (let i = 0; i < 2; i++) { rr(610, 450 + i * 72, 500, 52, 12); ctx.strokeStyle = C.line; ctx.lineWidth = 3; ctx.stroke(); }
        rr(890, 640, 220, 60, 16); ctx.fillStyle = PV.vc.col; ctx.fill(); text('Pay', 1000, 671, { size: 28, weight: 800, color: '#fff', align: 'center' });
      }, 0);
      const bp = S.p(0, .3, .5);
      // bot tries the page and bounces off BotID
      const lt = t - S.ls(0) - .8, cyc = lt > 0 ? lt % 2.8 : -1;
      if (cyc >= 0) {
        const x = cyc < 1 ? lerp(160, 440, eOut(cyc)) : cyc < 1.5 ? 440 : lerp(440, 160, eIO((cyc - 1.5) / .9));
        alpha(clamp01(lt / .4), () => e_bot(x, 500, .95, t));
        if (cyc > 1 && cyc < 1.7) pop(440, 400, clamp01((cyc - 1) / .25), () => e_no(440, 400, 26));
      }
      pop(560, 500, bp, () => { shield(560, 500, 50, C.green); pill('BotID', 560, 580, { size: 26, fill: C.greenL, color: C.green }); });
      // firewall rules
      fade(S.pf(0, fF, .5), () => {
        card(1230, 250, 580, 480, { r: 26, stroke: C.line, lw: 2.5 });
        for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) { rr(1262 + c * 38 + (r % 2) * 19, 282 + r * 22, 34, 18, 4); ctx.fillStyle = r ? '#C9674F' : '#D97757'; ctx.fill(); }
        text('Firewall', 1400, 305, { size: 36, weight: 800 });
      }, 16);
      pop(1520, 400, S.pf(0, wordAt('safety_vc', 0, 'AI bot'), .5), () => {
        rr(1260, 360, 520, 84, 20); ctx.fillStyle = '#F8F4EC'; ctx.fill();
        e_bot(1305, 404, .42, t); text('AI bot rules', 1350, 403, { size: 28, weight: 800 });
        pill('block', 1710, 402, { size: 22, fill: C.redL, color: C.red, shadow: false });
      });
      const rl = S.pf(0, wordAt('safety_vc', 0, 'rate limits'), .5);
      pop(1520, 560, rl, () => {
        rr(1260, 470, 520, 230, 20); ctx.fillStyle = '#F8F4EC'; ctx.fill();
        icon('clock', 1300, 510, 18, C.ink); text('rate limits', 1330, 511, { size: 28, weight: 800 });
        const capY = 580; line(1290, capY, 1750, capY, C.red, 3, [8, 6]);
        text('limit', 1750, capY - 18, { size: 20, weight: 800, color: C.red, align: 'right' });
        for (let i = 0; i < 10; i++) {
          const h = 30 + 80 * Math.abs(Math.sin(i * 1.7 + Math.floor(t * 3) * .9)), cap = 680 - capY, hh = Math.min(h, cap);
          rr(1300 + i * 45, 680 - hh, 30, hh, 5); ctx.fillStyle = C.soft; ctx.fill();
          if (h > cap) { rr(1300 + i * 45, capY - 8, 30, 8, 3); ctx.fillStyle = C.red; ctx.fill(); }
        }
      });
    });
    // line 0b: OIDC short-lived token instead of a stored secret
    alpha(S.pf(0, fO, .5) * S.out(1, 0, .5), () => {
      e_ptitle('vc', 'OIDC', 160);
      card(120, 380, 300, 200, { r: 26, stroke: PV.vc.col, lw: 3 });
      logo('vc', 270, 450, .5); text('function', 270, 530, { size: 30, weight: 800, align: 'center' });
      card(1500, 380, 300, 200, { r: 26, stroke: C.line, lw: 3 });
      cloud(1650, 460, .42, '#9AA7B8'); text('cloud account', 1650, 530, { size: 30, weight: 800, align: 'center' });
      line(430, 480, 1490, 480, C.line, 5, [6, 12]);
      const sw = S.pf(0, fL, .8, eIO), gone = S.pf(0, fS, .5);
      // stored secret drops out of the lane and gets crossed
      alpha(1 - .6 * gone, () => {
        const ky = lerp(480, 700, sw);
        card(810, ky - 55, 300, 110, { r: 22, stroke: C.line, lw: 3 });
        icon('key', 870, ky, 28, '#C08D22'); text('stored secret', 910, ky + 1, { size: 28, weight: 800 });
        cross(960, ky, 70, C.red, gone);
      });
      pop(960, 480, sw, () => {
        card(750, 420, 420, 120, { r: 26, fill: C.greenL, stroke: C.green, lw: 3 });
        text('OIDC', 790, 458, { size: 32, weight: 800, color: C.green });
        text('short-lived token', 790, 500, { size: 26, weight: 700, color: C.soft });
        const k = (t * .4) % 1; e_timer(1100, 482, 36, 1 - k, C.green);
      });
      if (sw >= 1) for (let i = 0; i < 2; i++) { const k = (t * .5 + i * .5) % 1; if (k < .3 || k > .7) e_dot(k < .3 ? lerp(440, 740, k / .3) : lerp(1180, 1480, (k - .7) / .3), 480, C.green, 8); }
      pop(960, 790, gone, () => pill('no stored secrets', 960, 790, { size: 28, fill: C.redL, color: C.red }));
    });
    // line 1: Secure Compute (enterprise), and no signed-agent passport
    alpha(S.p(1, 0, .5), () => {
      const fP = wordAt('safety_vc', 1, 'It protects'), sec = S.pf(1, fP, .5);
      alpha(1 - sec, () => e_ptitle('vc', 'Enterprise: a private network', 160));
      alpha(sec, () => e_ptitle('vc', 'Protects the app, no passport', 160));
      fade(S.p(1, .1), () => {
        card(110, 250, 800, 540, { r: 28, stroke: C.line, lw: 2.5 });
        text('Secure Compute', 150, 305, { size: 36, weight: 800 });
        badge('enterprise', 870, 290, { align: 'right', fill: '#EDE8E0', color: C.soft });
        e_wall(160, 350, 700, 270);
        text('private network', 510, 392, { size: 24, weight: 800, color: '#7F725F', align: 'center' });
        card(220, 430, 240, 150, { r: 20, stroke: PV.vc.col, lw: 3 }); logo('vc', 340, 485, .42); text('function', 340, 548, { size: 26, weight: 800, align: 'center' });
        icon('db', 700, 490, 36, C.soft); text('database', 700, 562, { size: 24, weight: 800, align: 'center' });
        line(470, 505, 640, 505, C.line, 4, [4, 8]);
        e_dot(lerp(480, 630, (t * .6) % 1), 505, PV.vc.col, 7);
      }, 16);
      const ip = S.pf(1, wordAt('safety_vc', 1, 'static'), .5);
      if (ip > 0) { line(510, 625, 510, lerp(625, 690, ip), C.soft, 4); }
      pop(510, 720, ip, () => e_ipill('static IPs', 'globe', 510, 720, { size: 28, stroke: C.line }));
      pop(1405, 380, sec, () => {
        e_win(1000, 250, 810, 260, 'atlas-trips.example');
        shield(1100, 400, 44, C.green);
        text('protects the web app', 1170, 400, { size: 32, weight: 800, color: C.green });
      });
      const np = S.pf(1, wordAt('safety_vc', 1, 'no signed'), .5);
      pop(1405, 660, np, () => {
        ctx.save(); rr(1000, 550, 810, 240, 26); ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fill(); ctx.setLineDash([14, 10]); ctx.strokeStyle = C.muted; ctx.lineWidth = 3; ctx.stroke();
        rr(1060, 590, 120, 160, 14); ctx.strokeStyle = C.red; ctx.stroke(); ctx.restore();
        text('?', 1120, 672, { size: 56, weight: 900, color: C.red, align: 'center' });
        text('no signed-agent passport', 1220, 645, { size: 32, weight: 800, color: C.red });
        text('nothing like Web Bot Auth', 1220, 695, { size: 26, weight: 600, color: C.soft });
      });
    });
  },
};

// ----- safety_aws -----
const E_AWS_TOOLS = ['Identity', 'Policy', 'Guardrails', 'WAF'];
const E_CEDAR = ['permit(principal, action == Action::"book_hotel", resource)', 'when { context.input.price <= 300 };'];
function e_strip(active, p) {
  const ws = E_AWS_TOOLS.map(s => measure(s, 24, 800) + 40), gap = 18, tot = ws.reduce((a, b) => a + b, 0) + gap * 3;
  let x = W / 2 - tot / 2;
  E_AWS_TOOLS.forEach((s, i) => {
    const w = ws[i], on = active === i;
    pop(x + w / 2, 245, p[i], () => {
      rr(x, 223, w, 44, 22); ctx.fillStyle = on ? PV.aws.col : '#fff'; ctx.fill();
      if (!on) { ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.stroke(); }
      text(s, x + w / 2, 246, { size: 24, weight: 800, color: on ? '#fff' : C.soft, align: 'center' });
    });
    x += w + gap;
  });
}
SCN.safety_aws = {
  chapter: CH.safety,
  draw(S, t) {
    const cur = S.cur(), fW = wordAt('safety_aws', 2, 'WAF');
    const active = cur === 0 ? 0 : cur === 1 ? 1 : t > S.at(2, fW) ? 3 : 2;
    e_strip(active, E_AWS_TOOLS.map((_, i) => S.p(0, .5 + i * .18, .45)));
    // line 0: AgentCore Identity, an ID badge and a token vault
    alpha(S.p(0, 0, .5) * S.out(1, 0, .5), () => {
      const fA = wordAt('safety_aws', 0, 'AgentCore'), id = S.pf(0, fA, .5);
      alpha(1 - id, () => e_ptitle('aws', 'The most tools here', 160));
      alpha(id, () => e_ptitle('aws', 'AgentCore Identity', 160));
      pop(430, 450, id, () => atlas(430, 450, 1.5, t, { mood: 'happy' }));
      const bp = S.pf(0, wordAt('safety_aws', 0, 'its own'), .5);
      if (bp > 0) alpha(bp, () => { line(395, 520, 430, 600 + (1 - bp) * -60, '#6B8BC9', 4); line(465, 520, 430, 600 + (1 - bp) * -60, '#6B8BC9', 4); });
      pop(430, 680, bp, () => {
        card(320, 600, 220, 160, { r: 16, stroke: C.line, lw: 2 });
        rr(320, 600, 220, 40, [16, 16, 0, 0]); ctx.fillStyle = PV.aws.col; ctx.fill();
        text('AGENT ID', 430, 621, { size: 18, weight: 900, color: '#fff', align: 'center' });
        rr(340, 656, 70, 84, 10); ctx.fillStyle = C.blueL; ctx.fill(); atlas(375, 706, .38, 0, { mood: 'ok' });
        text('Atlas', 425, 684, { size: 26, weight: 800 }); for (let i = 0; i < 2; i++) { rr(425, 708 + i * 20, 90 - i * 30, 9, 4); ctx.fillStyle = C.line; ctx.fill(); }
      });
      const vp = S.pf(0, wordAt('safety_aws', 0, 'keeps'), .6), lock = S.pf(0, wordAt('safety_aws', 0, 'vault'), .8, eIO);
      pop(1360, 510, vp, () => {
        card(1110, 320, 500, 380, { r: 30, fill: '#5B6675' });
        rr(1135, 345, 450, 330, 22); ctx.fillStyle = '#3F4B5B'; ctx.fill();
        const a = t * .8 + lock * 3;
        ctx.save(); ctx.translate(1360, 440);
        ctx.beginPath(); ctx.arc(0, 0, 58, 0, 7); ctx.fillStyle = '#C9D1DC'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#8994A3'; ctx.stroke();
        ctx.strokeStyle = '#5B6675'; ctx.lineWidth = 8; ctx.lineCap = 'round';
        for (let i = 0; i < 3; i++) { const b = a + i * Math.PI * 2 / 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(b) * 44, Math.sin(b) * 44); ctx.stroke(); }
        ctx.restore();
        text('token vault', 1360, 740, { size: 30, weight: 800, color: PV.aws.col, align: 'center' });
      });
      [['OAuth token', 'OAuth'], ['API key', 'API keys']].forEach(([nm, w], i) => {
        const p = S.pf(0, wordAt('safety_aws', 0, w), .9, eIO), ty = 560 + i * 62;
        if (p <= 0) return;
        const x = lerp(640, 1360, p), y = lerp(460, ty, p) - Math.sin(p * Math.PI) * 60;
        const tw = measure(nm, 26, 800) + 70;
        rr(x - tw / 2, y - 24, tw, 48, 24); ctx.fillStyle = '#FFF4D6'; ctx.fill(); ctx.strokeStyle = '#E7C77B'; ctx.lineWidth = 3; ctx.stroke();
        icon('key', x - tw / 2 + 28, y, 14, '#C08D22'); text(nm, x - tw / 2 + 50, y + 1, { size: 26, weight: 800, color: '#8A6212' });
      });
      pop(1590, 340, lock, () => { node(1590, 340, 30, '', { fill: C.green, stroke: '#fff', lw: 4 }); icon('lock', 1590, 343, 16, '#fff'); });
    });
    // line 1: AgentCore Policy, Cedar rules at a checkpoint outside the model
    alpha(S.p(1, 0, .5) * S.out(2, 0, .5), () => {
      e_ptitle('aws', 'AgentCore Policy', 160);
      const ly = 440, gx = 1000;
      atlas(200, ly, 1.0, t, { mood: t > S.at(1, wordAt('safety_aws', 1, 'confused')) ? 'think' : 'ok' });
      line(270, ly, 1440, ly, C.line, 4, [6, 12]);
      card(1450, ly - 60, 330, 120, { r: 22, stroke: C.line, lw: 2.5 });
      icon('tool', 1500, ly, 22, C.soft); text('tools', 1540, ly - 14, { size: 30, weight: 800 }); text('book, search…', 1540, ly + 22, { size: 22, weight: 600, color: C.soft });
      // allowed call
      const a0 = S.at(1, wordAt('safety_aws', 1, 'every tool call')), pa = clamp01((t - a0) / 1.6), passOk = t > a0 + .8 && t < a0 + 2.2;
      if (pa > 0 && pa < 1) { const x = lerp(420, 1440, eIO(pa)), w = measure('search_flights', 24, 600, MONO) + 30; rr(x - w / 2, ly - 22, w, 44, 22); ctx.fillStyle = C.blueL; ctx.fill(); text('search_flights', x, ly + 1, { size: 24, weight: 600, fam: MONO, color: C.blue, align: 'center' }); }
      // denied call after the confused plea
      const d0 = S.at(1, wordAt('safety_aws', 1, 'confused')), din = clamp01((t - d0 - .5) / .8), dout = clamp01((t - d0 - 1.4) / .6), deny = t > d0 + 1.25;
      if (din > 0) {
        const x = lerp(lerp(420, gx - 150, eIO(din)), gx - 330, eOut(dout)), w = measure('book_hotel · $900', 24, 600, MONO) + 30;
        rr(x - w / 2, ly - 22, w, 44, 22); ctx.fillStyle = C.redL; ctx.fill(); ctx.strokeStyle = C.red; ctx.lineWidth = 2; ctx.stroke();
        text('book_hotel · $900', x, ly + 1, { size: 24, weight: 600, fam: MONO, color: C.red, align: 'center' });
      }
      // checkpoint gate
      const glow = passOk ? C.green : deny ? C.red : PV.aws.col;
      pop(gx, ly, S.p(1, .2, .5), () => {
        card(gx - 45, ly - 90, 90, 180, { r: 20, stroke: glow, lw: passOk || deny ? 7 : 4 });
        shield(gx, ly, 30, glow === PV.aws.col ? '#5B6675' : glow);
      });
      const outside = S.pf(1, wordAt('safety_aws', 1, 'outside'), .4);
      alpha(S.p(1, .2, .5) * (1 - outside), () => pill('policy checkpoint', gx, ly - 125, { size: 24, fill: PV.aws.light, color: PV.aws.ink, shadow: false }));
      pop(gx, ly - 125, outside, () => pill('outside the model', gx, ly - 125, { size: 24, fill: PV.aws.col, color: '#fff', shadow: false }));
      if (passOk) pop(gx + 70, ly - 80, clamp01((t - a0 - .8) / .3), () => e_ok(gx + 70, ly - 80, 22));
      if (deny) pop(gx - 90, ly, clamp01((t - d0 - 1.25) / .3), () => e_no(gx - 90, ly, 26));
      fade(clamp01((t - d0) / .4), () => bubble('but I really need to book the $900 suite!', 290, 292, 560, { size: 26, tail: 'left', fill: C.peach, stroke: C.orangeL }), 10);
      const cf = wordAt('safety_aws', 1, 'Cedar');
      alpha(S.pf(1, cf - .08, .5), () => {
        codeBlock(360, 540, 1200, E_CEDAR, { size: 28, file: 'policy.cedar', reveal: chars(E_CEDAR) * S.pf(1, cf - .05, 2.2, x => x), cursor: true, hl: [0, deny ? 1 : 0] });
        text('simplified', 960, 752, { size: 22, weight: 600, color: C.muted, align: 'center' });
      });
    });
    // line 2: Bedrock Guardrails filter content, AWS WAF verifies Web Bot Auth
    alpha(S.p(2, 0, .5), () => {
      const w = S.pf(2, fW, .5);
      alpha(1 - w, () => e_ptitle('aws', 'Bedrock Guardrails', 160));
      alpha(w, () => e_ptitle('aws', 'Guardrails and AWS WAF', 160));
      // filter screen
      fade(S.p(2, .1), () => {
        text('Guardrails', 640, 310, { size: 26, weight: 800, color: PV.aws.col, align: 'center' });
        rr(615, 340, 50, 420, 14); ctx.fillStyle = 'rgba(225,231,240,.8)'; ctx.fill(); ctx.strokeStyle = PV.aws.col; ctx.lineWidth = 4; ctx.stroke();
        ctx.save(); ctx.strokeStyle = 'rgba(35,47,62,.35)'; ctx.lineWidth = 2; for (let y = 360; y < 750; y += 18) { ctx.beginPath(); ctx.moveTo(620, y); ctx.lineTo(660, y); ctx.stroke(); } ctx.restore();
      }, 0);
      const h0 = S.at(2, wordAt('safety_aws', 2, 'harmful')), hp = clamp01((t - h0 + .2) / .9);
      if (hp > 0) {
        const x = lerp(170, 440, eOut(hp)) - (t > h0 + .9 ? Math.min(40, (t - h0 - .9) * 80) : 0);
        card(x - 140, 380, 280, 110, { r: 20, stroke: C.red, lw: 3 });
        ctx.beginPath(); ctx.moveTo(x - 95, 408); ctx.lineTo(x - 70, 452); ctx.lineTo(x - 120, 452); ctx.closePath(); ctx.fillStyle = C.red; ctx.fill();
        text('!', x - 95, 438, { size: 24, weight: 900, color: '#fff', align: 'center' });
        text('harmful', x - 50, 420, { size: 26, weight: 800 }); text('content', x - 50, 454, { size: 26, weight: 800 });
        pop(610, 360, clamp01((t - h0 - .7) / .3), () => e_no(610, 380, 24));
      }
      const p0 = S.at(2, wordAt('safety_aws', 2, 'personal')), pp = clamp01((t - p0 + .2) / 1.6);
      if (pp > 0) {
        const x = lerp(170, 900, eIO(pp)), past = x > 640;
        card(x - 140, 590, 280, 110, { r: 20, stroke: C.blue, lw: 3 });
        text('personal data', x, 622, { size: 24, weight: 800, align: 'center' });
        if (!past) text('home address · phone', x, 664, { size: 22, weight: 600, color: C.soft, align: 'center' });
        else { ctx.save(); ctx.filter = 'blur(5px)'; text('home address · phone', x, 664, { size: 22, weight: 600, color: C.soft, align: 'center' }); ctx.restore(); rr(x - 110, 650, 220, 28, 8); ctx.fillStyle = 'rgba(200,205,215,.7)'; ctx.fill(); text('hidden', x, 665, { size: 20, weight: 800, color: PV.aws.col, align: 'center' }); }
      }
      // WAF verifies Web Bot Auth
      const wp = S.pf(2, fW, .5), ok = S.pf(2, wordAt('safety_aws', 2, 'signatures'), .5);
      fade(wp, () => {
        card(1170, 300, 630, 480, { r: 28, stroke: C.line, lw: 2.5 });
        text('AWS WAF', 1210, 355, { size: 36, weight: 800, color: PV.aws.col });
        pill('verifies Web Bot Auth', 1485, 450, { size: 26, fill: PV.aws.light, color: PV.aws.ink, shadow: false });
        atlas(1320, 640, .9, t, { mood: 'happy' });
        e_passport(1500, 630, .95); e_seal(1545, 570, 18);
        pop(1660, 620, ok, () => e_ok(1660, 620, 34));
      }, 16);
    });
  },
};

// ----- money -----
const E_SEQ = [[420, 1, 'GET /flight-prices', C.ink, 'shared'], [520, -1, '402 Payment Required', C.red, 'payment required'], [620, 1, 'pay $0.01 (stablecoin)', C.orangeD, 'pays'], [720, -1, '200 OK · prices', C.green, 'gets the data']];
SCN.money = {
  chapter: CH.money,
  draw(S, t) {
    chapterTitle(S, 9, 'Money', 'coin');
    // line 0 tail: Atlas and a paid flight-price API
    alpha(S.p(0, 3.1, .5) * S.out(1, 0, .5), () => {
      e_title('Agents will pay on their own', 160);
      atlas(560, 480, 1.5, t, { mood: 'happy' });
      const ap = S.pf(0, wordAt('money', 0, 'flight-price'), .5);
      pop(1340, 480, ap, () => {
        card(1120, 380, 440, 200, { r: 26, stroke: C.line, lw: 2.5 });
        ctx.save(); ctx.translate(1190, 450); ctx.rotate(-.3); ctx.fillStyle = C.blue;
        rr(-30, -5, 60, 10, 5); ctx.fill(); ctx.beginPath(); ctx.moveTo(-5, -4); ctx.lineTo(9, -26); ctx.lineTo(16, -26); ctx.lineTo(11, -4); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-5, 4); ctx.lineTo(9, 26); ctx.lineTo(16, 26); ctx.lineTo(11, 4); ctx.closePath(); ctx.fill(); ctx.restore();
        text('flight-price API', 1235, 452, { size: 32, weight: 800 });
        pill('paid', 1340, 530, { size: 24, fill: '#FFF4D6', color: '#8A6212', shadow: false });
      });
      if (ap > 0) {
        line(680, 480, 1100, 480, C.line, 5, [6, 12]);
        const k = (t * .5) % 1; e_coin(lerp(700, 1080, k), 470 - Math.sin(k * Math.PI) * 40, 20, t * 8);
      }
    });
    // line 1: the x402 sequence
    alpha(S.p(1, 0, .5) * S.out(2, 0, .5), () => {
      e_title('The shared idea: x402', 160);
      const L1 = 480, L2 = 1440;
      atlas(L1, 290, .9, t, { mood: S.pf(1, wordAt('money', 1, 'gets the data')) > 0 ? 'happy' : 'ok' });
      text('Atlas', L1 + 95, 295, { size: 30, weight: 800, color: C.blue });
      card(L2 - 210, 240, 420, 100, { r: 24, stroke: C.line, lw: 2.5 });
      text('flight-price API', L2, 291, { size: 30, weight: 800, align: 'center' });
      line(L1, 360, L1, 790, C.line, 4, [6, 10]); line(L2, 360, L2, 790, C.line, 4, [6, 10]);
      E_SEQ.forEach(([y, dir, lab, col, w], i) => {
        const f = i === 0 ? .02 : wordAt('money', 1, w) - .02, p = S.pf(1, f, .6, eIO), a = dir > 0 ? L1 + 10 : L2 - 10, b = dir > 0 ? L2 - 10 : L1 + 10;
        arrow(a, y, b, y, p, { color: col === C.ink ? C.soft : col, lw: 5 });
        fade(S.pf(1, f + .02, .4), () => text(lab, 960, y - 26, { size: 28, weight: 700, fam: MONO, color: col, align: 'center' }), 0);
      });
      const cf = wordAt('money', 1, 'pays'), cp = S.pf(1, cf, .9, eIO);
      if (cp > 0 && cp < 1) e_coin(lerp(L1 + 20, L2 - 30, cp), 620 - Math.sin(cp * Math.PI) * 60, 22, t * 9);
      pop(L2 + 70, 620, S.pf(1, cf + .1, .4), () => e_coin(L2 + 70, 620, 22));
      pop(L1 - 150, 720, S.pf(1, wordAt('money', 1, 'gets the data') + .06, .5), () => { card(L1 - 280, 685, 220, 70, { r: 18, fill: C.greenL }); text('data', L1 - 190, 721, { size: 28, weight: 800, color: C.green, align: 'center' }); check(L1 - 110, 721, 26, C.green); });
    });
    // line 2: Cloudflare, x402 in the Agents SDK + sites charge crawlers
    alpha(S.p(2, 0, .5) * S.out(3, 0, .5), () => {
      e_ptitle('cf', 'x402 on Cloudflare', 160);
      line(960, 250, 960, 800, C.line, 3, [4, 12]);
      const sp = S.pf(2, wordAt('money', 2, 'Agents SDK'), .5);
      pop(500, 300, sp, () => e_ipill('x402 in the Agents SDK', 'code', 500, 300, { size: 30, fill: C.cfL, color: C.orangeD }));
      fade(sp, () => {
        atlas(250, 520, 1.1, t, { mood: 'happy' });
        line(340, 520, 640, 520, C.line, 5);
        const k = (t * .55) % 1; e_coin(lerp(360, 620, k), 505 - Math.sin(k * Math.PI) * 40, 20, t * 8);
        card(660, 450, 240, 140, { r: 22, stroke: C.cf, lw: 3 }); icon('tool', 710, 520, 22, C.cf); text('paid API', 740, 521, { size: 28, weight: 800 });
        text('Atlas pays per request', 520, 680, { size: 28, weight: 700, color: C.soft, align: 'center' });
      }, 16);
      const tf = wordAt('money', 2, 'charge');
      alpha(S.pf(2, tf - .06, .5), () => {
        text('sites charge AI crawlers', 1420, 300, { size: 32, weight: 800, color: C.orangeD, align: 'center' });
        e_toll(1400, 700, 1, t, S.at(2, tf) - .6, { site: 'website', cap: 'crawlers pay a coin to pass' });
      });
    });
    // line 3: AWS, AgentCore payments wallets with spending limits + WAF charges bots
    alpha(S.p(3, 0, .5) * S.out(4, 0, .5), () => {
      e_ptitle('aws', 'AgentCore payments', 160);
      line(1040, 280, 1040, 800, C.line, 3, [4, 12]);
      pop(560, 245, S.pf(3, wordAt('money', 3, 'available'), .5), () => pill('GA · Aug 2026', 560, 245, { size: 26, fill: C.greenL, color: C.green, shadow: false }));
      const wp = S.pf(3, wordAt('money', 3, 'wallets'), .5);
      pop(290, 430, S.p(3, .2, .5), () => { e_wallet(290, 430, 1); e_coin(230, 350, 22, 0); e_coin(270, 340, 22, 0); text('agent wallet', 290, 540, { size: 26, weight: 800, color: C.soft, align: 'center' }); });
      [['Coinbase', '#1652F0'], ['Stripe Privy', '#635BFF']].forEach(([nm, col], i) => pop(720, 380 + i * 90, clamp01(wp * 1.4 - i * .3), () =>
        e_ipill(nm, (x, y) => { ctx.beginPath(); ctx.arc(x, y, 12, 0, 7); ctx.fillStyle = col; ctx.fill(); }, 720, 380 + i * 90, { size: 28, stroke: C.line })));
      // spending limit bar
      const lf = wordAt('money', 3, 'spending'), bp = S.pf(3, lf - .04, .5);
      alpha(bp, () => {
        const x0 = 150, x1 = 940, cap = .78, cx = lerp(x0, x1, cap), fill = Math.min(cap, S.pf(3, lf - .02, 2.4, x => x) * 1.1 * cap / .78), hit = fill >= cap;
        text('spending limit', cx, 620, { size: 24, weight: 800, color: C.red, align: 'center' });
        rr(x0, 650, x1 - x0, 44, 22); ctx.fillStyle = '#EFE9DF'; ctx.fill();
        if (fill > 0) { rr(x0, 650, (x1 - x0) * fill / 1, 44, 22); ctx.fillStyle = hit ? C.red : C.green; ctx.fill(); }
        line(cx, 638, cx, 706, C.red, 5);
        const k = (t * .8) % 1; if (!hit) e_coin(lerp(x0 + 20, x0 + (x1 - x0) * fill, k), 672, 16, t * 8);
        pop(cx, 750, hit ? clamp01((S.pf(3, lf - .02, 2.4, x => x) * 1.1 - 1) * 8 + .01) : 0, () => pill('no spending past the cap', cx - 150, 750, { size: 24, fill: C.redL, color: C.red, shadow: false }));
      });
      // WAF charges bots
      const tf = wordAt('money', 3, 'WAF');
      alpha(S.pf(3, tf - .04, .5), () => {
        text('AWS WAF: charge bots', 1450, 330, { size: 32, weight: 800, color: PV.aws.col, align: 'center' });
        e_toll(1500, 690, .72, t, S.at(3, tf) - .5, { site: 'website', sign: '402', col: PV.aws.col, cap: 'bots pay to pass' });
      });
    });
    // line 4: Vercel, an x402 experiment but no payment product
    alpha(S.p(4, 0, .5), () => {
      e_ptitle('vc', 'Vercel and payments', 160);
      pop(960, 440, S.p(4, .2, .6), () => {
        ctx.save(); rr(560, 280, 800, 320, 28); ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fill(); ctx.setLineDash([14, 10]); ctx.strokeStyle = C.muted; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
        text('x402 experiment (2025)', 960, 350, { size: 38, weight: 800, color: C.soft, align: 'center' });
        pill('x402-mcp', 860, 440, { size: 28, fill: '#F2F2F2', color: C.ink, shadow: false });
        text('for MCP tools', 1060, 441, { size: 28, weight: 700, color: C.soft });
        alpha(.55, () => { e_coin(760, 530, 22, Math.sin(t * 2) * .7); icon('tool', 830, 530, 22, C.muted); });
        text('an early try', 960, 540, { size: 26, weight: 600, color: C.muted, align: 'center' });
      });
      const np = S.pf(4, wordAt('money', 4, 'no payment'), .5);
      pop(960, 700, np, () => e_ipill('no payment product today', (x, y) => cross(x, y, 28, C.red), 960, 700, { size: 32, fill: C.redL, color: C.red }));
    });
  },
};
