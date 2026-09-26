// ---------- Part A: meet, agent, atlas, body, body_cf, body_vc, body_aws (helpers use the a_ prefix) ----------

// ----- part-A helpers -----
const a_lin = x => clamp01(x);
const a_title = (s, y = 160) => text(s, W / 2, y, { size: 54, weight: 600, fam: SERIF, align: 'center' });
// Scene title led by the provider's logo
function a_head(k, s, y = 160) {
  const w = measure(s, 54, 600, SERIF), x0 = W / 2 - (w + 96) / 2;
  logo(k, x0 + 36, y - 2, k === 'cf' ? .7 : .55);
  text(s, x0 + 96, y, { size: 54, weight: 600, fam: SERIF });
}
function a_iconPill(s, ic, cx, cy, o = {}) {
  const size = o.size || 30, tw = measure(s, size, 700), w = tw + size * 2.6, h = size * 1.9;
  card(cx - w / 2, cy - h / 2, w, h, { r: h / 2, fill: o.fill || '#fff', stroke: o.stroke || C.line, lw: 3, shadow: o.shadow });
  icon(ic, cx - w / 2 + size * 1.05, cy, size * .5, o.color || C.ink);
  text(s, cx - w / 2 + size * 1.9, cy + 1, { size, weight: 700, color: o.color || C.ink });
  return w;
}
function a_hut(x, y, s = 1, roof = C.cf) {
  rr(x - 14 * s, y - 6 * s, 28 * s, 22 * s, 3 * s); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = C.line; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - 18 * s, y - 5 * s); ctx.lineTo(x, y - 21 * s); ctx.lineTo(x + 18 * s, y - 5 * s); ctx.closePath(); ctx.fillStyle = roof; ctx.fill();
}
// House = a Durable Object. Body rect (x, y, w, h); roof above y. o.inner() draws contents; o.dim darkens it (asleep).
function a_house(x, y, w, h, o = {}) {
  const rh = o.roofH ?? w * .3;
  card(x, y, w, h, { r: 12, fill: o.fill || '#fff', stroke: o.stroke || C.line, lw: 2.5 });
  if (o.inner) o.inner();
  if (o.dim) alpha(o.dim, () => { rr(x, y, w, h, 12); ctx.fillStyle = 'rgba(47,79,134,.34)'; ctx.fill(); });
  ctx.save(); ctx.shadowColor = 'rgba(70,45,20,0.13)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6;
  ctx.beginPath(); ctx.moveTo(x - 16, y + 4); ctx.lineTo(x + w / 2, y - rh); ctx.lineTo(x + w + 16, y + 4); ctx.closePath();
  ctx.fillStyle = o.roof || C.cf; ctx.fill(); ctx.restore();
  if (o.name) {
    const size = o.nameSize || 24, pw = measure(o.name, size, 800) + size * 1.2, ph = size * 1.6, cy = y - rh * .4;
    rr(x + w / 2 - pw / 2, cy - ph / 2, pw, ph, ph / 2); ctx.fillStyle = '#fff'; ctx.fill();
    text(o.name, x + w / 2, cy + 1, { size, weight: 800, color: C.orangeD, align: 'center' });
  }
}
// Rising "Z"s above a sleeper
function a_zzz(x, y, t, a = 1, color = '#fff') {
  for (let k = 0; k < 3; k++) {
    const z = (t * .5 + k / 3) % 1;
    alpha(a * (1 - z) * clamp01(z * 4), () => text('Z', x + z * 60 + k * 6, y - z * 120, { size: 30 + k * 8, weight: 800, color, align: 'center' }));
  }
}
// Globe (from the reference video). o.pins 0..1 reveals pins; o.huts draws named cities as tiny kitchens.
const A_CITIES = [['Tokyo', 35.7, 139.7], ['Lisbon', 38.7, -9.1], ['New York', 40.7, -74], ['São Paulo', -23.5, -46.6], ['London', 51.5, -.1], ['Lagos', 6.5, 3.4], ['Mumbai', 19, 72.8], ['Singapore', 1.3, 103.8], ['Sydney', -33.9, 151.2], ['San Francisco', 37.8, -122.4], ['Johannesburg', -26.2, 28], ['Frankfurt', 50.1, 8.7], ['Dubai', 25.2, 55.3], ['Mexico City', 19.4, -99.1], ['Seoul', 37.6, 127]];
const A_PINS = (() => { const r = rng(7), out = []; for (let i = 0; i < 110; i++) out.push([null, -38 + r() * 98, -180 + r() * 360]); return out; })();
function a_globe(cx, cy, R, lon0, t, o = {}) {
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
  const pins = o.pins ?? 1, n = A_CITIES.length + A_PINS.length;
  [...A_CITIES, ...A_PINS].forEach(([name, lat, lon], i) => {
    if (i / n > pins) return;
    const [x, y, z] = proj(lat, lon); if (z <= 0.05) return;
    if (o.huts && name) { a_hut(x, y + 6, .9 + .4 * z); return; }
    const flash = o.flash ? o.flash * (.5 + .5 * Math.sin(t * 9 + i)) : 0;
    ctx.beginPath(); ctx.arc(x, y, (name ? 7 : 4.5) * (.5 + .5 * z) * (1 + flash * .6), 0, 7); ctx.fillStyle = name ? C.cf : 'rgba(243,128,32,.7)'; ctx.fill();
  });
  return proj;
}
// Kitchen shop-front for a provider, centered at cx (sign at y 262, floor at y 760)
function a_shop(k, cx, t) {
  const w = 360, x = cx - w / 2, col = PV[k].col, lt = k === 'vc' ? '#F2F2F2' : PV[k].light;
  card(x, 400, w, 360, { r: 18, stroke: C.line, lw: 2.5 });
  rr(x + 28, 470, 172, 150, 12); ctx.fillStyle = lt; ctx.fill();
  // a pot on the stove, steaming
  rr(x + 72, 560, 84, 46, [0, 0, 16, 16]); ctx.fillStyle = C.ink; ctx.fill();
  ctx.fillRect(x + 62, 556, 104, 8);
  ctx.save(); ctx.strokeStyle = C.muted; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const sx = x + 92 + i * 22, ph = (t * .8 + i * .33) % 1;
    ctx.globalAlpha = (1 - ph) * .8; ctx.beginPath();
    for (let s = 0; s <= 10; s++) { const yy = 546 - s * 5 - ph * 20, xx = sx + Math.sin(s * .8 + t * 4 + i) * 5; s ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
    ctx.stroke();
  }
  ctx.restore();
  // door
  rr(x + 228, 470, 104, 290, [14, 14, 0, 0]); ctx.fillStyle = col; ctx.fill();
  ctx.beginPath(); ctx.arc(x + 312, 620, 7, 0, 7); ctx.fillStyle = k === 'aws' ? PV.aws.smile : '#fff'; ctx.fill();
  // striped awning with scallops
  for (let i = 0; i < 6; i++) {
    const sx = x - 10 + i * (w + 20) / 6, sw = (w + 20) / 6, c = i % 2 ? '#fff' : (k === 'aws' ? PV.aws.smile : col);
    ctx.fillStyle = c; ctx.fillRect(sx, 342, sw, 52);
    ctx.beginPath(); ctx.arc(sx + sw / 2, 394, sw / 2, 0, Math.PI); ctx.fill();
  }
  rr(x - 10, 342, w + 20, 52, 4); ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.stroke();
  // sign board
  card(x + 16, 262, w - 32, 72, { r: 16, stroke: k === 'aws' ? PV.aws.smile : col, lw: 3 });
  logo(k, x + 70, 298, k === 'cf' ? .6 : .45);
  text(PV[k].name, x + 118, 299, { size: 32, weight: 800, color: PV[k].ink });
}
// A person in a hard hat
function a_builder(x, y, s) {
  person(x, y, s, C.blue);
  ctx.beginPath(); ctx.arc(x, y - 12 * s, 36 * s, Math.PI, 0); ctx.fillStyle = '#F2C14E'; ctx.fill();
  rr(x - 46 * s, y - 16 * s, 92 * s, 10 * s, 5 * s); ctx.fill();
}
// A labelled AWS service block
function a_block(name, x, y, o = {}) {
  const w = o.w || 170;
  card(x - w / 2, y - 27, w, 54, { r: 12, fill: PV.aws.light, stroke: PV.aws.col, lw: 3, shadow: o.shadow });
  text(name, x, y + 1, { size: 24, weight: 800, color: PV.aws.col, align: 'center' });
}
// Hourglass that drains and flips every 3 seconds
function a_hourglass(x, y, s, t, col = C.soft) {
  const ph = (t % 3) / 3, flip = ph > .85 ? eIO((ph - .85) / .15) : 0, sand = clamp01(ph / .85);
  const w = 34 * s, h = 46 * s;
  ctx.save(); ctx.translate(x, y); ctx.rotate(flip * Math.PI);
  ctx.fillStyle = C.cfY;
  const top = 1 - sand; // sand left in the top bulb
  if (top > 0) { ctx.beginPath(); ctx.moveTo(-w * top, -h * top); ctx.lineTo(w * top, -h * top); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill(); }
  ctx.beginPath(); ctx.moveTo(-w, h); ctx.lineTo(w, h); ctx.lineTo(w * (1 - sand * .9), h - h * sand * .7); ctx.lineTo(-w * (1 - sand * .9), h - h * sand * .7); ctx.closePath(); ctx.fill();
  if (sand < 1 && flip === 0) { ctx.fillRect(-1.5 * s, 0, 3 * s, h); }
  ctx.strokeStyle = col; ctx.lineWidth = 4 * s; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-w, -h); ctx.lineTo(w, -h); ctx.lineTo(0, 0); ctx.lineTo(w, h); ctx.lineTo(-w, h); ctx.lineTo(0, 0); ctx.closePath(); ctx.stroke();
  ctx.fillStyle = col; rr(-w - 8 * s, -h - 8 * s, 2 * w + 16 * s, 8 * s, 3 * s); ctx.fill(); rr(-w - 8 * s, h, 2 * w + 16 * s, 8 * s, 3 * s); ctx.fill();
  ctx.restore();
}
// Atlas's minute: mostly grey waiting, with thin orange computing slivers
const A_MIN = [['cpu', .04], ['model', .24], ['cpu', .05], ['web', .18], ['cpu', .04], ['human', .38], ['cpu', .07]];
const A_MIN_CPU = .2;
const a_seg = i => { let x = 0; for (let k = 0; k < i; k++) x += A_MIN[k][1]; return [x, x + A_MIN[i][1]]; };
// CPU share used up to bar position u, and whether u sits in a computing sliver
function a_cpu(u) {
  let x = 0, used = 0, on = false;
  for (const [k, f] of A_MIN) { if (k === 'cpu') { used += clamp01((u - x) / f) * f; if (u >= x && u < x + f) on = true; } x += f; }
  return { used, on };
}
// A playhead that sweeps the bar every `period` seconds from t0: position u and finished passes n
function a_loop(t, t0, period) { const e = Math.max(0, t - t0) / period; return { u: e % 1, n: Math.floor(e) }; }
function a_strip(x, y, w, h, o = {}) {
  const rv = o.reveal ?? 1;
  ctx.save(); rr(x, y, w, h, 14); ctx.clip();
  ctx.fillStyle = '#fff'; ctx.fillRect(x, y, w, h);
  let sx = x;
  A_MIN.forEach(([k, f]) => {
    const sw = f * w, vis = clamp01((rv * w - (sx - x)) / sw);
    if (vis > 0) { ctx.fillStyle = k === 'cpu' ? C.cf : C.idle; ctx.fillRect(sx + 1.5, y, Math.max(0, sw * vis - 3), h); }
    if (o.labels && k !== 'cpu' && vis >= 1) alpha(o.labels, () => text('waiting', sx + sw / 2, y + h / 2 + 1, { size: 24, weight: 700, color: C.soft, align: 'center' }));
    sx += sw;
  });
  ctx.restore();
  rr(x, y, w, h, 14); ctx.strokeStyle = C.line; ctx.lineWidth = 3; ctx.stroke();
  if (o.u !== undefined) {
    const px = x + o.u * w, on = a_cpu(o.u).on;
    line(px, y - 14, px, y + h + 14, C.ink, 5);
    ctx.beginPath(); ctx.moveTo(px - 13, y - 30); ctx.lineTo(px + 13, y - 30); ctx.lineTo(px, y - 12); ctx.closePath(); ctx.fillStyle = on ? C.cf : C.ink; ctx.fill();
  }
}
// Taxi-style meter, centered at cx with its body's top at y (flag sits above y)
function a_meter(cx, y, val, on) {
  const w = 380, h = 180;
  rr(cx - 80, y - 44, 160, 48, [14, 14, 0, 0]); ctx.fillStyle = on ? C.cfY : C.idle; ctx.fill();
  text('METER', cx, y - 19, { size: 24, weight: 800, color: on ? C.ink : C.soft, align: 'center' });
  card(cx - w / 2, y, w, h, { r: 24, fill: C.code });
  rr(cx - w / 2 + 26, y + 24, w - 52, 86, 14); ctx.fillStyle = '#0D0C0B'; ctx.fill();
  text(String(Math.floor(val)).padStart(5, '0'), cx, y + 69, { size: 62, weight: 700, fam: MONO, color: on ? C.cfY : '#77706A', align: 'center' });
  ctx.beginPath(); ctx.arc(cx - 64, y + 146, 10, 0, 7); ctx.fillStyle = on ? C.cf : '#77706A'; ctx.fill();
  text(on ? 'running' : 'paused', cx - 44, y + 147, { size: 26, weight: 700, color: on ? '#fff' : '#A59C8F' });
}
// meter reading for a playhead: CPU-only (pauses in grey) or wall-clock (always runs)
const a_cpuVal = lp => (lp.n * A_MIN_CPU + a_cpu(lp.u).used) * 2500;
const a_wallVal = lp => (lp.n + lp.u) * 2500;
function a_sparkle(x, y, s, color = C.cfY) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r = i % 2 ? s * .28 : s; ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
  ctx.closePath(); ctx.fillStyle = color; ctx.fill();
}
function a_broom(x, y, s, ang) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  ctx.strokeStyle = '#9A6B3F'; ctx.lineWidth = 9 * s; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, -150 * s); ctx.lineTo(0, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-26 * s, 0); ctx.lineTo(26 * s, 0); ctx.lineTo(44 * s, 62 * s); ctx.lineTo(-44 * s, 62 * s); ctx.closePath(); ctx.fillStyle = '#E7C77B'; ctx.fill();
  ctx.strokeStyle = '#C9A55A'; ctx.lineWidth = 3 * s;
  for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(i * 7 * s, 8 * s); ctx.lineTo(i * 12 * s, 58 * s); ctx.stroke(); }
  ctx.restore();
}
// Sealed glass box (microVM); inner() draws what's inside, behind the glass
function a_glass(x, y, w, h, inner) {
  card(x, y, w, h, { r: 22, fill: '#EEF4FB', shadow: true });
  if (inner) inner();
  rr(x, y, w, h, 22); ctx.fillStyle = 'rgba(190,215,245,.28)'; ctx.fill();
  ctx.strokeStyle = '#9DB7D8'; ctx.lineWidth = 4; ctx.stroke();
  ctx.save(); ctx.globalAlpha *= .75; ctx.strokeStyle = '#fff'; ctx.lineWidth = 8; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x + 24, y + 70); ctx.lineTo(x + 70, y + 24); ctx.moveTo(x + 24, y + 112); ctx.lineTo(x + 112, y + 24); ctx.stroke(); ctx.restore();
}
// Stopwatch body; the dial is drawn by the caller
function a_stopwatch(cx, cy, r) {
  rr(cx - 26, cy - r - 54, 52, 34, 8); ctx.fillStyle = C.soft; ctx.fill();
  rr(cx - 12, cy - r - 24, 24, 26, 4); ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy, r + 18, 0, 7); ctx.fillStyle = C.ink; ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fillStyle = '#fff'; ctx.fill();
  ctx.fillStyle = C.muted;
  for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2, l = i % 5 ? 8 : 18; ctx.save(); ctx.translate(cx + Math.sin(a) * (r - 14), cy - Math.cos(a) * (r - 14)); ctx.rotate(a); ctx.fillRect(-1.5, -l / 2, 3, l); ctx.restore(); }
}
// A database cylinder with a label
function a_cyl(x, y, s, col, label) {
  const w = 80 * s, h = 90 * s, e = 20 * s;
  ctx.fillStyle = col + '22'; ctx.strokeStyle = col; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(x - w, y - h / 2); ctx.lineTo(x - w, y + h / 2); ctx.ellipse(x, y + h / 2, w, e, 0, Math.PI, 0, true); ctx.lineTo(x + w, y - h / 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(x, y - h / 2, w, e, 0, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(x, y, w, e, 0, 0, Math.PI); ctx.stroke();
  if (label) text(label, x, y + h / 2 + e + 30, { size: 26, weight: 800, color: col, align: 'center' });
}

// ===================== meet: three kitchens =====================
const A_SHELF = [['Workers', 'Durable Objects'], ['Workers AI', 'R2'], ['Vectorize', 'Workflows']];
const A_USERS = [['São Paulo', C.teal], ['New York', C.purple], ['Johannesburg', C.blue], ['Lagos', C.orange]];
// [name, rack, level, slot] of labelled warehouse boxes
const A_TAGS = [['Lambda', 0, 1, 2], ['S3', 1, 3, 4], ['Bedrock', 2, 0, 1], ['DynamoDB', 3, 2, 3], ['SQS', 0, 4, 5], ['IAM', 2, 3, 3]];
const A_WHX = (rack, slot) => 180 + rack * 272 + slot * 34 + 17, A_WHY = level => 360 + level * 94;
const A_BUILD = ['Lambda', 'S3', 'IAM'];
const A_HOW = [['how', 'how,', 'gear'], ['how much', 'how much', 'coin'], ['how easy', 'how easy', 'star']];
SCN.meet = {
  chapter: null,
  draw(S, t) {
    const w = (j, s) => wordAt('meet', j, s);
    // line 0: three shop-fronts
    alpha(S.out(1), () => {
      fade(S.p(0, .05), () => a_title('Meet the contenders'));
      PROVS.forEach((k, i) => pop(460 + i * 500, 510, S.p(0, .5 + i * .35, .6), () => a_shop(k, 460 + i * 500, t)));
      fade(S.pf(0, w(0, 'kitchens') - .08), () => text('three very different kitchens', 960, 815, { size: 32, weight: 700, color: C.soft, align: 'center' }), 12);
    });
    // line 1: Cloudflare, a small kitchen in hundreds of cities
    alpha(S.p(1) * S.out(2), () => {
      fade(S.p(1, .05), () => a_head('cf', 'Cloudflare: a kitchen in every city'));
      const gx = 540, gy = 500, R = 285;
      const proj = a_globe(gx, gy, R, -12 + Math.sin(t * .3) * 8, t, { pins: S.pf(1, w(1, 'small kitchen') - .05, 2.6, a_lin), huts: true });
      const uf = w(1, 'close'), up = S.pf(1, uf, .6);
      A_USERS.forEach(([city, col], i) => {
        const c = A_CITIES.find(c => c[0] === city), [x, y, z] = proj(c[1], c[2]);
        if (z <= .1 || y < gy - 60) return;
        const d = Math.hypot(x - gx, y - gy) || 1, ux = gx + (x - gx) / d * (R + 62), uy = gy + (y - gy) / d * (R + 62);
        alpha(up * clamp01(z * 3), () => {
          line(ux, uy, x, y, C.cfL, 4, [6, 8]);
          node(ux, uy, 26, '', { fill: '#fff', stroke: col, lw: 3 }); icon('user', ux, uy + 3, 15, col);
          const k = ((t - S.at(1, uf)) * .8 + i * .27) % 1;
          if (up >= 1) { packet(ux, uy, x, y, k < .5 ? k * 2 : 0, C.cf, 8); packet(x, y, ux, uy, k >= .5 ? (k - .5) * 2 : 0, C.green, 8); }
        });
      });
      fade(S.pf(1, w(1, 'hundreds'), .5), () => text('hundreds of cities', gx, 832, { size: 28, weight: 700, color: C.soft, align: 'center' }), 10);
      fade(S.pf(1, w(1, 'most of'), .6), () => {
        card(1010, 250, 800, 540, { r: 28 });
        text('Made in-house', 1410, 310, { size: 38, weight: 600, fam: SERIF, align: 'center' });
        A_SHELF.forEach((row, r) => {
          const y = 430 + r * 130;
          rr(1050, y + 30, 720, 14, 7); ctx.fillStyle = '#C9A77E'; ctx.fill();
          row.forEach((name, c) => {
            const x = 1230 + c * 360, p = S.pf(1, w(1, 'ingredients') - .05 + (r * 2 + c) * .025, .45);
            pop(x, y, p, () => pill(name, x, y, { size: 26, fill: C.cfL, stroke: C.cf, color: PV.cf.ink, shadow: false }));
          });
        });
      });
    });
    // line 2: Vercel, the designer kitchen
    alpha(S.p(2) * S.out(3), () => {
      fade(S.p(2, .05), () => a_head('vc', 'Vercel: the designer kitchen'));
      const sf = w(2, 'shipping');
      fade(S.p(2, .2), () => {
        card(160, 250, 740, 540, { r: 28, fill: '#FAFAFA' });
        rr(190, 610, 680, 26, 10); ctx.fillStyle = '#E4E4E4'; ctx.fill();
        rr(210, 636, 640, 130, [0, 0, 16, 16]); ctx.fillStyle = '#1B1B1B'; ctx.fill();
        ctx.fillStyle = '#555'; for (let i = 0; i < 3; i++) ctx.fillRect(250 + i * 210, 670, 140, 6);
        const press = S.pf(2, sf - .02, .2) * (1 - S.pf(2, sf + .04, .3)), glow = .5 + .5 * Math.sin(t * 3);
        const s = 1 - .08 * press, bx = 530, by = 470;
        ctx.save(); ctx.translate(bx, by); ctx.scale(s, s);
        ctx.save(); ctx.shadowColor = `rgba(0,0,0,${.18 + .12 * glow})`; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
        rr(-180, -58, 360, 116, 58); ctx.fillStyle = PV.vc.col; ctx.fill(); ctx.restore();
        ctx.beginPath(); ctx.moveTo(-100, -26); ctx.lineTo(-70, 24); ctx.lineTo(-130, 24); ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill();
        text('Deploy', 20, 2, { size: 46, weight: 800, color: '#fff', align: 'center' });
        ctx.restore();
        const rp = S.pf(2, sf, .9, a_lin);
        if (rp > 0 && rp < 1) { ctx.save(); ctx.globalAlpha *= 1 - rp; rr(bx - 180 - rp * 60, by - 58 - rp * 60, 360 + rp * 120, 116 + rp * 120, 58 + rp * 60); ctx.strokeStyle = PV.vc.col; ctx.lineWidth = 4; ctx.stroke(); ctx.restore(); }
      });
      [['Next.js', 'Next.js', 380], ['AI SDK', 'AI SDK', 680]].forEach(([name, word, x]) => pop(x, 320, S.pf(2, w(2, word), .5), () => pill(name, x, 320, { size: 30, fill: '#F2F2F2', stroke: PV.vc.col, color: PV.vc.col })));
      // git push becomes a live URL
      fade(S.pf(2, sf - .04, .4), () => {
        card(1040, 280, 720, 100, { r: 20, fill: C.code });
        const cmd = '$ git push', n = Math.floor(cmd.length * S.pf(2, sf, .7, a_lin));
        text(cmd.slice(0, n), 1080, 331, { size: 36, weight: 600, fam: MONO, color: CODE.text });
      });
      arrow(1400, 392, 1400, 458, S.pf(2, sf + .08, .4), { color: C.muted });
      pop(1400, 620, S.pf(2, sf + .12, .6), () => {
        card(1040, 470, 720, 310, { r: 22, stroke: C.line, lw: 2 });
        rr(1040, 470, 720, 64, [22, 22, 0, 0]); ctx.fillStyle = '#F2F2F2'; ctx.fill();
        ['#F0715F', '#F2C14E', '#5DC26A'].forEach((c, i) => { ctx.beginPath(); ctx.arc(1074 + i * 26, 502, 8, 0, 7); ctx.fillStyle = c; ctx.fill(); });
        rr(1170, 484, 560, 36, 18); ctx.fillStyle = '#fff'; ctx.fill();
        icon('lock', 1196, 502, 12, C.green);
        text('atlas.vercel.app', 1220, 503, { size: 24, weight: 600, fam: MONO, color: C.soft });
        node(1190, 660, 48, '', { fill: C.greenL, stroke: C.green, lw: 4 }); check(1190, 660, 44, C.green, S.pf(2, sf + .2, .5));
        text('Live', 1265, 660, { size: 52, weight: 800, color: C.green });
        atlas(1610, 670, 1.1, t, { mood: 'happy' });
      });
    });
    // line 3: AWS, the giant warehouse
    alpha(S.p(3) * S.out(4), () => {
      fade(S.p(3, .05), () => a_head('aws', 'AWS: the giant warehouse'));
      const bp = S.p(3, .2, .6), boxes = S.p(3, .5, 3, a_lin);
      fade(bp, () => {
        ctx.beginPath(); ctx.moveTo(110, 262); ctx.lineTo(710, 212); ctx.lineTo(1310, 262); ctx.closePath(); ctx.fillStyle = PV.aws.col; ctx.fill();
        card(130, 258, 1160, 560, { r: 14, fill: '#fff', stroke: C.line, lw: 2.5 });
        for (let rack = 0; rack < 4; rack++) {
          const rx = 170 + rack * 272;
          ctx.fillStyle = C.muted; ctx.fillRect(rx, 290, 6, 510); ctx.fillRect(rx + 250, 290, 6, 510);
          for (let lv = 0; lv < 5; lv++) {
            const sy = A_WHY(lv);
            ctx.fillStyle = '#C9A77E'; ctx.fillRect(rx, sy + 16, 256, 7);
            for (let sl = 0; sl < 7; sl++) {
              const i = (lv * 4 + rack) * 7 + sl, a = clamp01(boxes * 150 - i);
              if (a <= 0) continue;
              const x = A_WHX(rack, sl), h = 26 + ((i * 7) % 3) * 6;
              alpha(a, () => { rr(x - 14, sy + 16 - h, 28, h, 4); ctx.fillStyle = i % 3 ? PV.aws.light : '#F6D9A8'; ctx.fill(); ctx.strokeStyle = '#B9C4D4'; ctx.lineWidth = 1.5; ctx.stroke(); });
            }
          }
        }
      });
      const tf = w(3, 'almost'), af = w(3, 'assemble');
      A_TAGS.forEach(([name, rack, lv, sl], i) => {
        const x = A_WHX(rack, sl), y = A_WHY(lv) - 36, flown = A_BUILD.includes(name) ? S.pf(3, af - .06 + A_BUILD.indexOf(name) * .04, .2) : 0;
        pop(x, y, S.pf(3, tf - .04 + i * .035, .45) * (1 - flown), () => { ctx.fillStyle = PV.aws.smile; rr(x - 16, y + 22, 32, 30, 5); ctx.fill(); pill(name, x, y - 8, { size: 24, fill: PV.aws.col, color: '#fff', shadow: false }); });
      });
      pop(1470, 600, S.pf(3, .42, .6), () => a_builder(1470, 600 + Math.sin(t * 3) * 3, 1.4));
      A_BUILD.forEach((name, k) => {
        const tag = A_TAGS.find(g => g[0] === name), p = S.pf(3, af - .06 + k * .04, .8, eIO);
        if (p <= 0) return;
        const x0 = A_WHX(tag[1], tag[3]), y0 = A_WHY(tag[2]) - 44;
        const x = lerp(x0, 1700, p), y = lerp(y0, 760 - k * 62, p) - Math.sin(p * Math.PI) * 120;
        a_block(name, x, y);
      });
      fade(S.pf(3, af + .02, .5), () => text('you assemble it', 1700, 540, { size: 28, weight: 800, color: PV.aws.col, align: 'center' }), 10);
      fade(S.pf(3, w(3, 'Hundreds'), .5), () => text('hundreds of services', 710, 842, { size: 26, weight: 700, color: C.soft, align: 'center' }), 0);
    });
    // line 4: how, how much, how easy
    alpha(S.p(4), () => {
      fade(S.p(4, .05), () => a_title('All three can run a serious agent'));
      const tags = ['small kitchens everywhere', 'the designer kitchen', 'the giant warehouse'];
      PROVS.forEach((k, i) => {
        const cx = 460 + i * 500;
        pop(cx, 400, S.p(4, .1 + i * .12), () => {
          card(cx - 210, 250, 420, 300, { r: 26 });
          rr(cx - 210, 250, 420, 100, [26, 26, 0, 0]); ctx.fillStyle = k === 'vc' ? '#F2F2F2' : PV[k].light; ctx.fill();
          const nw = measure(PV[k].name, 36, 800);
          logo(k, cx - nw / 2 - 30, 300, k === 'cf' ? .62 : .5);
          text(PV[k].name, cx - nw / 2 + 24, 301, { size: 36, weight: 800, color: PV[k].ink });
          text(tags[i], cx, 400, { size: 26, weight: 600, color: C.soft, align: 'center' });
          const ck = S.pf(4, w(4, 'serious') - .05 + i * .04, .5);
          pop(cx, 480, ck, () => { rr(cx - 130, 454, 260, 52, 26); ctx.fillStyle = C.greenL; ctx.fill(); check(cx - 90, 480, 28, C.green); text('agent-ready', cx + 16, 481, { size: 26, weight: 800, color: C.green, align: 'center' }); });
        });
      });
      A_HOW.forEach(([s, word, ic], i) => {
        const x = 540 + i * 420, p = S.pf(4, w(4, word), .5), bob = Math.sin(t * 2.4 + i) * 4;
        pop(x, 690, p, () => a_iconPill(s, ic, x, 690 + bob, { size: 40, fill: C.accL, stroke: C.acc, color: C.acc }));
      });
    });
  },
};

// ===================== agent: refresher =====================
const A_LOOP = [['Think', 'brain', C.purple, 'think'], ['Act', 'hand', C.cf, 'act,'], ['Observe', 'eye', C.blue, 'look']];
const A_NEEDS = [['body', 'Body', 1, 'body'], ['code', 'Code', 1, 'code'], ['brain', 'Brain', 1, 'brain'], ['memory', 'Memory', 1, 'memory'], ['clock', 'Time', 1, 'time'], ['hand', 'Hands', 1, 'hands'], ['ear', 'Senses', 1, 'senses'],
  ['shield', 'Safety', 2, 'safety'], ['coin', 'Money', 2, 'pay'], ['eye', 'Shipping', 2, 'ship'], ['doc', 'The bill', 2, 'bill']];
SCN.agent = {
  chapter: null,
  draw(S, t) {
    const w = (j, s) => wordAt('agent', j, s), split = w(0, 'An agent');
    // line 0, first half: a chatbot answers and stops
    alpha(1 - S.pf(0, split - .03, .45, eIO), () => {
      fade(S.p(0, .05), () => a_title('Chatbot'));
      fade(S.pf(0, w(0, 'A chatbot') - .02), () => bubble("What's the capital of Portugal?", 560, 290, 560, { size: 32, tail: 'left' }));
      fade(S.pf(0, w(0, 'answers'), .5), () => bubble('Lisbon.', 1000, 430, 300, { size: 32, tail: 'right', fill: C.peach }));
      pop(960, 640, S.pf(0, w(0, 'stops'), .5), () => { rr(860, 600, 200, 80, 40); ctx.fillStyle = C.redL; ctx.fill(); text('stops.', 960, 641, { size: 34, weight: 700, color: C.red, align: 'center' }); });
    });
    // line 0, second half: the agent loop
    alpha(S.pf(0, split, .5) * S.out(1), () => {
      a_title('Agent');
      const cx = 960, cy = 500, R = 230;
      ctx.save(); ctx.strokeStyle = C.line; ctx.lineWidth = 10; ctx.setLineDash([2, 22]); ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke(); ctx.restore();
      pop(cx, cy, S.pf(0, w(0, 'goal') - .02, .5), () => { rr(cx - 120, cy - 44, 240, 88, 44); ctx.fillStyle = C.accL; ctx.fill(); text('Goal', cx, cy - 8, { size: 34, weight: 800, color: C.acc, align: 'center' }); text('plan a trip', cx, cy + 24, { size: 24, weight: 600, color: C.soft, align: 'center' }); });
      A_LOOP.forEach(([name, ic, col, word], i) => {
        const ang = -Math.PI / 2 + i * Math.PI * 2 / 3, x = cx + Math.cos(ang) * R, y = cy + Math.sin(ang) * R;
        pop(x, y, S.pf(0, w(0, word) - .01, .4), () => { node(x, y, 74, '', { fill: '#fff', stroke: col, lw: 5 }); icon(ic, x, y - 12, 26, col); text(name, x, y + 34, { size: 24, weight: 800, color: col, align: 'center' }); });
      });
      const lf = w(0, 'loop');
      if (S.pf(0, lf, .1) > 0) { const ang = -Math.PI / 2 + (t - S.at(0, lf)) * .6 * Math.PI * 2; ctx.beginPath(); ctx.arc(cx + Math.cos(ang) * R, cy + Math.sin(ang) * R, 16, 0, 7); ctx.fillStyle = C.acc; ctx.fill(); }
      pop(1410, 500, S.pf(0, w(0, 'done') - .02, .5), () => { rr(1300, 460, 220, 80, 40); ctx.fillStyle = C.greenL; ctx.fill(); check(1352, 500, 34); text('done!', 1435, 501, { size: 34, weight: 800, color: C.green, align: 'center' }); });
    });
    // lines 1-2: what Atlas needs = our chapters
    alpha(S.p(1, 0, .6), () => {
      fade(S.p(1, .05), () => a_title('What an agent needs'));
      const cx = 960, cy = 520, badges = w(2, 'chapters');
      atlas(cx, cy, 1.6, t, { mood: S.p(2) > 0 ? 'happy' : 'ok' });
      A_NEEDS.forEach(([ic, name, j, word], i) => {
        const ang = i / A_NEEDS.length * Math.PI * 2, x = cx + Math.sin(ang) * 590, y = cy - Math.cos(ang) * 262;
        const p = S.pf(j, w(j, word) - .02, .45);
        if (p > 0) line(cx + Math.sin(ang) * 120, cy - Math.cos(ang) * 100, lerp(cx, x, .78), lerp(cy, y, .78), C.line, 4, [3, 10]);
        pop(x, y, p, () => {
          node(x, y, 68, '', { fill: '#fff', stroke: j === 2 ? C.acc : C.line, lw: 4 });
          icon(ic, x, y - 16, 22, C.ink);
          text(name, x, y + 22, { size: 24, weight: 800, color: C.soft, align: 'center' });
          pop(x + 52, y - 52, S.pf(2, badges - .06 + i * .012, .4), () => node(x + 52, y - 52, 22, i + 1, { fill: C.acc, stroke: '#fff', color: '#fff', size: 24 }));
        });
      });
      pop(cx, 645, S.pf(2, badges - .04, .5), () => pill('= our 11 chapters', cx, 645, { size: 30, fill: C.accL, color: C.acc }));
    });
  },
};

// ===================== atlas: the running example =====================
const A_TASKS = [['Search flights', 'search flights'], ['Compare hotels', 'compare'], ['Remember preferences', 'remember'], ['Wait for prices to drop', 'wait'], ['Book things', 'book'], ['Keep the traveller updated', 'keep']];
SCN.atlas = {
  chapter: null,
  guide: (S, t) => ({ hops: [S.ls(0) + .6] }),
  draw(S, t) {
    const w = (j, s) => wordAt('atlas', j, s);
    alpha(S.out(3, 0, .6), () => {
      const mv = S.p(1, 0, .9, eIO), ax = lerp(960, 520, mv), ay = lerp(440, 400, mv);
      pop(ax, ay, S.p(0, .1, .8), () => atlas(ax, ay, 2.4, t, { mood: S.p(2) > 0 ? 'think' : 'happy' }));
      fade(S.p(0, .7), () => { text('Atlas', ax, ay + 170, { size: 60, weight: 600, fam: SERIF, align: 'center' }); text('a trip-planning agent', ax, ay + 222, { size: 30, weight: 600, color: C.soft, align: 'center' }); });
      fade(S.p(1, .2), () => phone(1350, 430, 1.7, (x, y, pw, ph) => {
        ctx.fillStyle = C.bg; ctx.fillRect(x, y, pw, ph);
        text('Atlas', x + pw / 2, y + 26, { size: 22, weight: 800, color: C.blue, align: 'center' });
        const msg = 'Plan me 5 days in Lisbon in October, under $2,000';
        const n = Math.floor(msg.length * S.pf(1, .18, 3, a_lin));
        if (n > 0) bubble(msg.slice(0, n), x + 12, y + 60, pw - 24, { size: 24, fill: C.accL, stroke: C.accL });
      }), 40);
      A_TASKS.forEach(([task, word], i) => {
        const p = S.pf(2, w(2, word) - .02, .45), x = 330 + (i % 3) * 430, y = 740 + Math.floor(i / 3) * 72;
        fade(p, () => { card(x, y - 29, 400, 58, { r: 29, shadow: false, fill: '#fff', stroke: C.line, lw: 2 }); node(x + 30, y, 14, '', { fill: C.blueL, stroke: C.blue, lw: 3 }); text(task, x + 56, y + 1, { size: 24, weight: 700 }); }, 16);
      });
    });
    // line 3: three Atlases on three clouds, and an empty scorecard
    alpha(S.p(3, 0, .6), () => {
      fade(S.p(3, .05), () => a_title('One Atlas, three clouds'));
      const sp = S.pf(3, w(3, 'three times') - .04, .9, eIO), lg = w(3, 'once on each');
      PROVS.forEach((k, i) => {
        const x = lerp(720, 320 + i * 400, sp);
        if (i !== 1 && sp <= 0) return;
        pop(x, 690, S.pf(3, lg + i * .05, .5), () => {
          ctx.beginPath(); ctx.moveTo(x - 110, 640); ctx.lineTo(x + 110, 640); ctx.lineTo(x + 135, 770); ctx.lineTo(x - 135, 770); ctx.closePath();
          ctx.save(); ctx.shadowColor = 'rgba(70,45,20,0.13)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 8; ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore();
          rr(x - 120, 628, 240, 22, 8); ctx.fillStyle = k === 'vc' ? '#DADADA' : PV[k].light; ctx.fill();
          logo(k, x, 704, k === 'cf' ? .7 : .55);
          text(PV[k].name, x, 808, { size: 28, weight: 800, color: PV[k].ink, align: 'center' });
        });
        alpha(i === 1 ? 1 : clamp01(sp * 3), () => atlas(x, 572, 1.3, t, { mood: 'happy' }));
      });
      const sc = w(3, 'scorecard');
      pop(1600, 520, S.pf(3, sc - .04, .6), () => {
        card(1410, 250, 380, 560, { r: 20 });
        text('Scorecard', 1600, 305, { size: 36, weight: 600, fam: SERIF, align: 'center' });
        PROVS.forEach((k, i) => logo(k, 1545 + i * 80, 370, k === 'cf' ? .38 : .3));
        for (let r = 0; r < 7; r++) { const y = 420 + r * 52; line(1440, y, 1760, y, C.line, 2); rr(1440, y + 10, 70, 18, 9); ctx.fillStyle = C.idle; ctx.fill(); }
        ctx.save(); ctx.translate(1700 + Math.sin(t * 2.2) * 14, 610 + Math.cos(t * 3.1) * 8); ctx.rotate(.7);
        rr(-12, -110, 24, 110, 4); ctx.fillStyle = '#F2C14E'; ctx.fill();
        ctx.fillStyle = '#F0A4A0'; ctx.fillRect(-12, -128, 24, 18);
        ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(12, 0); ctx.lineTo(0, 26); ctx.closePath(); ctx.fillStyle = '#F3D9B1'; ctx.fill();
        ctx.beginPath(); ctx.moveTo(-4, 17); ctx.lineTo(4, 17); ctx.lineTo(0, 26); ctx.closePath(); ctx.fillStyle = C.ink; ctx.fill();
        ctx.restore();
      });
    });
  },
};

// ===================== body: chapter opener =====================
const A_WAITS = [[1, 'model thinking', 'brain', 'model'], [3, 'website loading', 'browser', 'website'], [5, 'human reply', 'user', 'human']];
SCN.body = {
  chapter: CH.body,
  draw(S, t) {
    const w = (j, s) => wordAt('body', j, s);
    chapterTitle(S, 1, 'The body', 'body');
    // line 1: Atlas's minute is mostly waiting
    alpha(S.p(1) * S.out(2), () => {
      const tw = measure("Atlas's minute", 54, 600, SERIF);
      fade(S.p(1, .05), () => { a_title("Atlas's minute"); a_hourglass(960 + tw / 2 + 60, 158, .8, t); });
      const bx = 160, bw = 1600, by = 450, bh = 90, rf = w(1, 'spent waiting');
      const rv = S.pf(1, rf - .05, 1.4, a_lin), lp = a_loop(t, S.at(1, rf) + 1.2, 7);
      a_strip(bx, by, bw, bh, { reveal: rv, u: rv >= 1 ? lp.u : undefined });
      const on = rv >= 1 && a_cpu(lp.u).on;
      fade(S.p(1, .3), () => atlas(bx + (rv >= 1 ? lp.u : 0) * bw, by - 80, .6, t, { mood: on ? 'happy' : 'think' }), 0);
      A_WAITS.forEach(([seg, label, ic, word]) => {
        const [a, b] = a_seg(seg), x = bx + (a + b) / 2 * bw;
        pop(x, 610, S.pf(1, w(1, word) - .02, .45), () => { line(x, by + bh + 4, x, 580, C.idle, 4); a_iconPill(label, ic, x, 616, { size: 26, color: C.soft }); });
      });
      fade(S.pf(1, rf, .5), () => {
        rr(560, 718, 34, 34, 8); ctx.fillStyle = C.cf; ctx.fill(); text('computing', 610, 736, { size: 28, weight: 700, color: PV.cf.ink });
        rr(1060, 718, 34, 34, 8); ctx.fillStyle = C.idle; ctx.fill(); text('waiting', 1110, 736, { size: 28, weight: 700, color: C.soft });
      }, 10);
    });
    // line 2: two questions for every cloud
    alpha(S.p(2), () => {
      fade(S.p(2, .05), () => a_title('Two questions for each cloud'));
      [['How does it run my agent?', 'body', 'how does'], ['Do I pay while it waits?', 'coin', 'do I pay']].forEach(([q, ic, word], i) => {
        const x = 200 + i * 820, p = S.pf(2, w(2, word) - .03, .6), bob = Math.sin(t * 2 + i * 2) * 4;
        pop(x + 350, 470, p, () => {
          card(x, 300 + bob, 700, 330, { r: 30, stroke: C.acc, lw: 3 });
          node(x + 350, 390 + bob, 56, '', { fill: C.accL, stroke: C.accL }); icon(ic, x + 350, 390 + bob, 30, C.acc);
          node(x + 50, 350 + bob, 24, i + 1, { fill: C.acc, stroke: C.acc, color: '#fff', size: 26 });
          text(q, x + 350, 530 + bob, { size: 44, weight: 600, fam: SERIF, align: 'center' });
          if (i === 1) a_hourglass(x + 470, 390 + bob, .6, t);
        });
      });
      PROVS.forEach((k, i) => {
        const x = 610 + i * 320, p = S.pf(2, w(2, 'each cloud') + i * .04, .45);
        pop(x, 740, p, () => { const cw = measure(PV[k].name, 26, 800) + 26 * 2.9; provChip(k, x - cw / 2, 740, { size: 26 }); });
      });
    });
  },
};

// ===================== body_cf =====================
SCN.body_cf = {
  chapter: CH.body,
  draw(S, t) {
    const w = (j, s) => wordAt('body_cf', j, s);
    // line 0: a Worker starts in milliseconds, in hundreds of cities
    alpha(S.out(1), () => {
      fade(S.p(0, .05), () => a_head('cf', 'Atlas runs as a Worker'));
      const hf = w(0, 'hundreds'), mf = w(0, 'milliseconds');
      a_globe(600, 510, 290, 10 + (t - S.ls(0)) * 7, t, { pins: .15 + .85 * S.pf(0, hf - .05, 1.6, a_lin), flash: S.pf(0, mf - .02, .3) * (1 - S.pf(0, mf + .2, .5)) });
      pop(1410, 360, S.p(0, .5), () => {
        card(1080, 290, 660, 140, { r: 28, fill: C.cf });
        node(1160, 360, 42, '', { fill: '#fff', stroke: '#fff' }); icon('bolt', 1160, 360, 30, C.cf);
        text('Worker', 1230, 340, { size: 48, weight: 800, color: '#fff' });
        text('a small function', 1230, 390, { size: 26, weight: 600, color: '#fff' });
      });
      pop(1410, 540, S.pf(0, mf - .03, .5), () => a_iconPill('starts in milliseconds', 'bolt', 1410, 540, { size: 32, color: PV.cf.ink, stroke: C.cf }));
      pop(1410, 670, S.pf(0, hf - .03, .5), () => a_iconPill('in hundreds of cities', 'globe', 1410, 670, { size: 32, color: PV.cf.ink, stroke: C.cf }));
    });
    // line 1: one Durable Object per traveller, sleeps and wakes where it left off
    alpha(S.p(1) * S.out(2), () => {
      fade(S.p(1, .05), () => a_title('Durable Objects: one per traveller'));
      const sl = w(1, 'sleeps') - .03, ex = w(1, 'exactly');
      const awake = S.pf(1, ex - .02, .5), asleep = S.pf(1, sl, .6) * (1 - awake);
      [C.teal, C.purple, C.orange].forEach((col, i) => {
        const cx = 420 + i * 540, bx = cx - 190, by = 400, mid = i === 1;
        pop(cx, 540, S.pf(1, w(1, 'Durable') + i * .03, .6), () => {
          a_house(bx, by, 380, 290, {
            roofH: 110, name: 'Durable Object', dim: mid ? asleep * .9 : 0, inner: () => {
              person(cx - 95, 520, .8, col);
              pop(cx + 85, 470, S.pf(1, w(1, 'memory') - .02 + i * .02, .45), () => { icon('doc', cx + 85, 462, 26, C.cf); text('memory', cx + 85, 506, { size: 24, weight: 700, color: C.soft, align: 'center' }); });
              pop(cx + 85, 590, S.pf(1, w(1, 'database') - .02 + i * .02, .45), () => { icon('db', cx + 85, 584, 24, C.cf); text('database', cx + 85, 630, { size: 24, weight: 700, color: C.soft, align: 'center' }); });
              if (mid) pop(cx - 95, 640, S.pf(1, .3, .5), () => pill('Lisbon, Oct', cx - 95, 648, { size: 22, fill: C.blueL, color: C.blue, shadow: false }));
            },
          });
          if (mid && asleep > .5) a_zzz(cx - 40, 480, t, asleep);
        });
      });
      pop(960, 780, S.pf(1, sl, .5), () => {
        if (awake > .5) pill('wakes exactly where it left off', 960, 780, { size: 30, fill: C.greenL, color: C.green });
        else pill('sleeps when idle', 960, 780, { size: 30, fill: C.blueL, color: C.blue });
      });
      if (awake > 0 && awake < 1) confetti(t, S.at(1, ex), 11, 960, 520, 30, .6);
    });
    // line 2: the Agents SDK wraps it into one Agent class, one instance per traveller
    alpha(S.p(2) * S.out(3), () => {
      fade(S.p(2, .05), () => a_title('Agents SDK: one Agent class'));
      const cx = 430, cy = 500, of = w(2, 'One class'), inf = w(2, 'one instance');
      pop(cx, cy, S.pf(2, w(2, 'one Agent') - .12, .6), () => {
        card(cx - 210, cy - 180, 420, 360, { r: 24, stroke: C.cf, lw: 4 });
        rr(cx - 210, cy - 180, 420, 70, [24, 24, 0, 0]); ctx.fillStyle = C.code; ctx.fill();
        text('class', cx - 16, cy - 144, { size: 34, weight: 500, color: CODE.kw, align: 'right', fam: MONO });
        text('Agent', cx + 4, cy - 144, { size: 34, weight: 700, color: CODE.type, fam: MONO });
        atlas(cx, cy + 50, 1.4, t, { mood: 'ok' });
      });
      ['Worker', 'Durable Object'].forEach((name, i) => {
        const p = S.pf(2, .08 + i * .06, .5), m = S.pf(2, w(2, 'one Agent') - .08 + i * .03, .7, eIO), y = 380 + i * 140;
        alpha(p * (1 - clamp01(m * 1.4 - .4)), () => pill(name, lerp(1250, cx, m), lerp(y, cy, m), { size: 32, fill: C.cfL, stroke: C.cf, color: PV.cf.ink }));
      });
      pop(cx, 760, S.pf(2, of, .5), () => pill('one class', cx, 760, { size: 30, fill: C.cfL, color: PV.cf.ink }));
      [C.teal, C.purple, C.orange].forEach((col, i) => {
        const y = 320 + i * 190, p = S.pf(2, inf + i * .06, .5);
        arrow(cx + 220, cy, 1130, y, p, { color: C.cf, lw: 5 });
        pop(1230, y, S.pf(2, inf + .04 + i * .06, .5), () => {
          atlas(1230, y + 6, .85, t, { mood: 'happy' });
          line(1310, y, 1420, y, C.line, 4, [4, 10]);
          person(1490, y - 16, .62, col);
        });
      });
      fade(S.pf(2, inf + .1, .5), () => text('one instance per traveller', 1360, 820, { size: 30, weight: 800, color: PV.cf.ink, align: 'center' }), 10);
    });
    // line 3: billed for CPU time, not waiting time; idle agents hibernate
    alpha(S.p(3), () => {
      fade(S.p(3, .05), () => a_title('Billed for CPU time, not waiting'));
      const lp = a_loop(t, S.ls(3) + .6, 6);
      fade(S.p(3, .2), () => a_strip(160, 280, 1600, 70, { u: lp.u, labels: 1 }));
      const on = a_cpu(lp.u).on;
      pop(560, 520, S.pf(3, w(3, 'CPU time') - .03, .5), () => a_meter(560, 460, a_cpuVal(lp), on));
      fade(S.pf(3, w(3, 'CPU time'), .5), () => text('billed: CPU time', 560, 690, { size: 32, weight: 800, color: PV.cf.ink, align: 'center' }), 10);
      const hb = w(3, 'hibernate');
      pop(1370, 580, S.pf(3, hb - .04, .6), () => {
        a_house(1180, 470, 380, 230, { roofH: 90, dim: .8, inner: () => atlas(1370, 600, 1.2, t, { mood: 'sleep' }) });
        a_zzz(1500, 510, t, 1);
      });
      pop(1370, 770, S.pf(3, hb, .5), () => pill('hibernating', 1370, 770, { size: 30, fill: C.blueL, color: C.blue }));
      pop(560, 780, S.pf(3, w(3, 'cheap') - .03, .5), () => pill('mostly waiting = cheap', 560, 780, { size: 30, fill: C.greenL, color: C.green }));
    });
  },
};

// ===================== body_vc =====================
SCN.body_vc = {
  chapter: CH.body,
  draw(S, t) {
    const w = (j, s) => wordAt('body_vc', j, s);
    // line 0: Vercel Functions on Fluid compute
    alpha(S.out(1), () => {
      fade(S.p(0, .05), () => a_head('vc', 'Atlas runs as Vercel Functions'));
      const ff = w(0, 'Fluid'), lv = .25 * S.p(0, .5, 1) + .75 * S.pf(0, ff - .05, 1.6, eIO);
      pop(960, 470, S.p(0, .3), () => {
        card(610, 290, 700, 360, { r: 30, stroke: PV.vc.col, lw: 4 });
        logo('vc', 690, 350, .45);
        text('Vercel Function', 740, 352, { size: 44, weight: 800 });
        ctx.save(); rr(650, 410, 620, 200, 20); ctx.clip();
        ctx.fillStyle = '#F4F4F4'; ctx.fillRect(650, 410, 620, 200);
        for (const [k, col] of [[0, 'rgba(76,123,217,.35)'], [1, 'rgba(76,123,217,.6)']]) {
          const top = 610 - lv * (150 - k * 20);
          ctx.beginPath(); ctx.moveTo(650, 610);
          for (let x = 650; x <= 1270; x += 10) ctx.lineTo(x, top + Math.sin(x * .02 + t * (2.4 + k) + k * 2) * 10);
          ctx.lineTo(1270, 610); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
        }
        ctx.restore();
        rr(650, 410, 620, 200, 20); ctx.strokeStyle = C.line; ctx.lineWidth = 3; ctx.stroke();
      });
      pop(960, 740, S.pf(0, ff, .5), () => pill('Fluid compute', 960, 740, { size: 34, fill: C.blueL, color: C.blue }));
    });
    // line 1: one instance, many requests; while A waits, it works on B, then C
    alpha(S.p(1) * S.out(2), () => {
      fade(S.p(1, .05), () => a_title('One instance, many requests'));
      const wf = w(1, 'While'), hf = w(1, 'the same instance');
      const cols = [C.teal, C.purple, C.orange], names = ['A', 'B', 'C'];
      const aWait = S.pf(1, wf + .05, .3), bOn = S.pf(1, hf, .3), cOn = S.pf(1, hf + .14, .3);
      pop(960, 500, S.p(1, .15), () => {
        card(740, 300, 440, 400, { r: 30, stroke: PV.vc.col, lw: 4 });
        logo('vc', 800, 350, .35);
        text('one instance', 840, 352, { size: 32, weight: 800 });
      });
      names.forEach((n, i) => {
        const ty = 350 + i * 150, sy = 440 + i * 80, ap = S.pf(1, .08 + i * .07, .5);
        fade(ap, () => { person(290, ty, .7, cols[i]); node(360, ty - 34, 22, n, { fill: cols[i], stroke: '#fff', color: '#fff', size: 24 }); }, 0);
        packet(380, ty + 10, 760, sy, S.pf(1, .12 + i * .07, .7, a_lin), cols[i], 10);
        if (ap < 1) return;
        // slot inside the instance
        const state = i === 0 ? (aWait > .5 ? 'wait' : 'run') : i === 1 ? (cOn > .5 ? 'done' : bOn > .5 ? 'run' : 'queue') : (cOn > .5 ? 'run' : 'queue');
        rr(780, sy - 30, 360, 60, 30); ctx.fillStyle = state === 'run' ? cols[i] + '33' : '#F5F2EC'; ctx.fill();
        if (state === 'run') { ctx.strokeStyle = cols[i]; ctx.lineWidth = 3; ctx.stroke(); }
        node(812, sy, 20, n, { fill: cols[i], stroke: cols[i], color: '#fff', size: 22 });
        const lab = { run: 'working', wait: 'waiting on model', done: 'answered', queue: 'queued' }[state];
        text(lab, 850, sy + 1, { size: 26, weight: 700, color: state === 'run' ? C.ink : C.soft });
        if (state === 'run') { ctx.save(); ctx.translate(1110, sy); ctx.rotate(t * 3); icon('gear', 0, 0, 18, cols[i]); ctx.restore(); }
        if (state === 'wait') a_hourglass(1110, sy, .42, t);
        if (state === 'done') check(1110, sy, 26, C.green);
      });
      // A's request goes to the model and waits
      pop(1560, 500, S.pf(1, wf - .03, .5), () => { node(1560, 500, 70, '', { fill: C.purpleL, stroke: C.purple, lw: 4 }); icon('brain', 1560, 494, 32, C.purple); text('model', 1560, 600, { size: 28, weight: 800, color: C.purple, align: 'center' }); });
      if (aWait > 0) { line(1180, 440, 1490, 500, C.tealL, 4, [6, 8]); packet(1180, 440, 1490, 500, ((t - S.at(1, wf)) * .6) % 1, C.teal, 9); }
      pop(1560, 680, S.pf(1, hf, .5), () => pill('helps someone else meanwhile', 1560, 680, { size: 24, fill: C.greenL, color: C.green, shadow: false }));
    });
    // line 2: Active CPU plus reserved memory
    alpha(S.p(2) * S.out(3), () => {
      fade(S.p(2, .05), () => a_title('The bill: two meters'));
      const cf = w(2, 'Active CPU'), mf = w(2, 'plus the memory');
      const lp = a_loop(t, S.at(2, cf), 5.5), on = a_cpu(lp.u).on;
      fade(S.p(2, .15), () => {
        card(420, 230, 1080, 540, { r: 28 });
        logo('vc', 490, 290, .35); text('Vercel bill', 530, 292, { size: 32, weight: 800 });
        a_strip(480, 340, 960, 56, { u: S.pf(2, cf, .1) > 0 ? lp.u : undefined });
      });
      fade(S.pf(2, cf - .03, .5), () => {
        text('Active CPU', 480, 470, { size: 36, weight: 800, color: on ? PV.cf.ink : C.ink });
        text('only while code runs', 1440, 472, { size: 26, weight: 600, color: C.soft, align: 'right' });
        rr(480, 505, 960, 50, 25); ctx.fillStyle = '#F2EEE7'; ctx.fill();
        const f = a_cpu(lp.u).used / A_MIN_CPU;
        rr(480, 505, Math.max(50, 960 * f * .9), 50, 25); ctx.fillStyle = on ? C.cf : '#F2B37A'; ctx.fill();
        if (!on) text('paused', 500 + Math.max(50, 960 * f * .9), 531, { size: 24, weight: 700, color: C.muted });
      });
      fade(S.pf(2, mf - .02, .5), () => {
        text('Memory reserved', 480, 640, { size: 36, weight: 800 });
        text('kept while the instance is up', 1440, 642, { size: 26, weight: 600, color: C.soft, align: 'right' });
        ctx.save(); rr(480, 675, 960, 50, 25); ctx.clip();
        ctx.fillStyle = C.blueL; ctx.fillRect(480, 675, 960, 50);
        ctx.fillStyle = 'rgba(76,123,217,.28)'; for (let x = -60; x < 1000; x += 40) { const sx = 480 + x + (t * 40) % 40; ctx.beginPath(); ctx.moveTo(sx, 725); ctx.lineTo(sx + 20, 725); ctx.lineTo(sx + 45, 675); ctx.lineTo(sx + 25, 675); ctx.closePath(); ctx.fill(); }
        ctx.restore();
      });
    });
    // line 3: the catch is time: 800 s on Pro, 30 min in beta
    alpha(S.p(3) * S.out(4), () => {
      fade(S.p(3, .05), () => a_title('The catch: time'));
      const cx = 640, cy = 530, r = 220, cap = 800 / 1800, pf8 = w(3, '800'), pb = w(3, '30 minutes');
      const sweep = S.pf(3, pf8 - .3, 2.2, eIO) * cap, hit = S.pf(3, pf8 + .1, .4), ext = S.pf(3, pb, 1.2, eIO);
      pop(cx, cy, S.p(3, .2), () => {
        a_stopwatch(cx, cy, r);
        const a0 = -Math.PI / 2;
        ctx.lineCap = 'butt';
        ctx.beginPath(); ctx.arc(cx, cy, r - 44, a0, a0 + sweep * Math.PI * 2); ctx.strokeStyle = C.redL; ctx.lineWidth = 36; ctx.stroke();
        if (ext > 0) { ctx.save(); ctx.setLineDash([10, 10]); ctx.beginPath(); ctx.arc(cx, cy, r - 44, a0 + cap * Math.PI * 2, a0 + (cap + (1 - cap) * ext) * Math.PI * 2); ctx.strokeStyle = C.purple; ctx.lineWidth = 12; ctx.stroke(); ctx.restore(); }
        const capA = a0 + cap * Math.PI * 2;
        line(cx + Math.cos(capA) * (r - 70), cy + Math.sin(capA) * (r - 70), cx + Math.cos(capA) * (r + 30), cy + Math.sin(capA) * (r + 30), C.red, 8);
        const ha = a0 + (ext > 0 ? cap + (1 - cap) * ext : sweep) * Math.PI * 2;
        ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ha) * (r - 30), cy + Math.sin(ha) * (r - 30)); ctx.stroke(); ctx.restore();
        ctx.beginPath(); ctx.arc(cx, cy, 14, 0, 7); ctx.fillStyle = C.ink; ctx.fill();
        if (hit > 0 && hit < 1) { ctx.save(); ctx.globalAlpha *= 1 - hit; ctx.beginPath(); ctx.arc(cx, cy, r + 18 + hit * 50, 0, 7); ctx.strokeStyle = C.red; ctx.lineWidth = 8; ctx.stroke(); ctx.restore(); }
      });
      pop(1340, 380, S.pf(3, pf8 - .02, .5), () => {
        card(1040, 310, 600, 140, { r: 26, stroke: C.red, lw: 4 });
        text('800 s', 1080, 380, { size: 60, weight: 800, color: C.red });
        text('cap on the Pro plan', 1270, 382, { size: 28, weight: 700, color: C.soft });
      });
      pop(1340, 580, S.pf(3, pb - .02, .5), () => {
        card(1040, 510, 600, 140, { r: 26, stroke: C.purple, lw: 3 });
        text('30 min', 1080, 580, { size: 60, weight: 800, color: C.purple });
        badge('beta', 1100 + measure('30 min', 60, 800), 563, { size: 24 });
      });
      pop(1340, 740, S.pf(3, pf8 + .1, .5), () => pill('per function call', 1340, 740, { size: 28, fill: '#fff', color: C.soft }));
    });
    // line 4: no built-in per-traveller object; state goes to a database or a workflow
    alpha(S.p(4), () => {
      fade(S.p(4, .05), () => a_title('Where does Atlas keep state?'));
      const gf = w(4, "Vercel's own"), df = w(4, 'database');
      alpha(S.p(4, .2) * (1 - S.pf(4, gf - .02, .5)), () => {
        ctx.save(); ctx.setLineDash([12, 10]);
        ctx.strokeStyle = C.muted; ctx.lineWidth = 4;
        rr(770, 400, 380, 280, 12); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(754, 404); ctx.lineTo(960, 300); ctx.lineTo(1166, 404); ctx.stroke(); ctx.restore();
        text('one object per traveller?', 960, 720, { size: 30, weight: 700, color: C.soft, align: 'center' });
        person(960, 520, .9, C.idle);
        pop(960, 540, S.pf(4, w(4, 'no built-in'), .5), () => { node(1110, 440, 40, '', { fill: C.redL, stroke: C.red, lw: 4 }); cross(1110, 440, 34, C.red, S.pf(4, w(4, 'no built-in'), .5)); });
      });
      pop(960, 320, S.pf(4, gf - .02, .6), () => {
        card(420, 230, 1080, 170, { r: 26, stroke: PV.vc.col, lw: 3 });
        text('“', 470, 290, { size: 90, weight: 700, fam: SERIF, color: C.muted });
        text('Durable Objects: no direct Vercel equivalent', 520, 300, { size: 38, weight: 600, fam: SERIF });
        logo('vc', 540, 356, .25);
        text("Vercel's own guide", 565, 358, { size: 26, weight: 700, color: C.soft });
      });
      const cols = [C.teal, C.purple, C.orange];
      cols.forEach((col, i) => {
        const y = 510 + i * 110, p = S.pf(4, gf + .08 + i * .04, .5);
        fade(p, () => person(430, y - 10, .6, col), 0);
        const toFlow = i === 2, ap = S.pf(4, (toFlow ? df + .08 : df - .02) + i * .02, .5);
        arrow(490, y, toFlow ? 1040 : 1050, toFlow ? 730 : 520 + i * 20, ap, { color: col, lw: 5, head: 16 });
      });
      pop(1150, 530, S.pf(4, df - .03, .5), () => a_cyl(1150, 510, 1, C.blue, 'database'));
      pop(1150, 730, S.pf(4, df + .06, .5), () => {
        card(1060, 690, 300, 84, { r: 20, stroke: C.acc, lw: 3 });
        icon('queue', 1110, 732, 22, C.acc);
        text('workflow', 1150, 733, { size: 30, weight: 800, color: C.acc });
      });
    });
  },
};

// ===================== body_aws =====================
SCN.body_aws = {
  chapter: CH.body,
  draw(S, t) {
    const w = (j, s) => wordAt('body_aws', j, s);
    // line 0: Amazon Bedrock AgentCore Runtime
    alpha(S.out(1), () => {
      fade(S.p(0, .05), () => a_head('aws', 'The home for agents on AWS'));
      const nf = w(0, 'Amazon');
      pop(960, 460, S.p(0, .5, .6), () => {
        card(380, 330, 1160, 260, { r: 32, stroke: PV.aws.col, lw: 4 });
        rr(380, 330, 250, 260, [32, 0, 0, 32]); ctx.fillStyle = PV.aws.light; ctx.fill();
        logo('aws', 505, 450, 1.2);
        text('Amazon Bedrock', 680, 410, { size: 36, weight: 700, color: C.soft });
        text('AgentCore Runtime', 680, 490, { size: 64, weight: 600, fam: SERIF, color: PV.aws.col });
        const sh = Math.max(0, (t - S.ls(0)) * .5) % 1;
        a_sparkle(1500, 350, 18 + 8 * Math.sin(t * 5), PV.aws.smile);
        alpha(1 - sh, () => a_sparkle(420 + sh * 1100, 600, 12, PV.aws.smile));
      });
      pop(960, 720, S.pf(0, nf, .6), () => atlas(960, 720, .9, t, { mood: 'happy' }));
      fade(S.pf(0, nf, .5), () => text('← Atlas lives here', 1040, 722, { size: 28, weight: 700, color: C.soft }), 0);
    });
    // line 1: each session gets its own isolated microVM, wiped when it ends
    alpha(S.p(1) * S.out(2), () => {
      fade(S.p(1, .05), () => a_title('Each session: its own microVM'));
      const iso = w(1, 'isolated'), wf = w(1, 'wiped');
      const wipe = S.pf(1, wf - .02, 1.2, a_lin), gone = clamp01(wipe * 1.6);
      [C.teal, C.purple, C.orange].forEach((col, i) => {
        const cx = 460 + i * 500, bx = cx - 160, by = 300, last = i === 2;
        pop(cx, 460, S.pf(1, .08 + i * .06, .6), () => {
          a_glass(bx, by, 320, 320, () => { if (!last || gone < 1) alpha(last ? 1 - gone : 1, () => atlas(cx, by + 170, 1.1, t, { mood: 'happy' })); });
          pop(bx + 290, by + 30, S.pf(1, iso + i * .03, .4), () => { node(bx + 290, by + 30, 30, '', { fill: '#fff', stroke: '#9DB7D8', lw: 3 }); icon('lock', bx + 290, by + 30, 18, PV.aws.col); });
          text('microVM', cx, by + 290, { size: 26, weight: 800, color: '#5C7BA3', align: 'center' });
          alpha(last ? 1 - gone * .7 : 1, () => { line(cx, by + 336, cx, 700, C.line, 4, [4, 8]); person(cx, 730, .6, col); });
        });
      });
      if (wipe > 0 && wipe < 1) a_broom(1300 + wipe * 330, 560, .9, -.5 + Math.sin(wipe * 18) * .25);
      alpha(S.pf(1, wf + .08, .4) * (1 - S.pf(1, wf + .3, .6)), () => { for (let k = 0; k < 5; k++) a_sparkle(1350 + k * 55, 380 + (k % 2) * 90 + Math.sin(t * 6 + k) * 8, 16, C.cfY); });
      pop(1460, 460, S.pf(1, wf + .12, .5), () => pill('wiped clean', 1460, 460, { size: 30, fill: C.accL, color: C.acc }));
    });
    // line 2: sessions up to 8 hours, Instances up to 14 days
    alpha(S.p(2) * S.out(3), () => {
      fade(S.p(2, .05), () => a_title('How long can Atlas run?'));
      const rows = [['Session', 'up to 8 hours', 8, 1, 'h', w(2, 'eight')], ['Instances', 'up to 14 days', 14, 2, 'd', w(2, 'fourteen')]];
      rows.forEach(([name, lab, n, step, unit, word], r) => {
        const y = 400 + r * 230, x0 = 520, x1 = 1640, p = S.pf(2, word - .15, 1.2, eIO), show = S.pf(2, r ? w(2, 'Instances') - .03 : .05, .5);
        fade(show, () => {
          text(name, 180, y + 30, { size: 38, weight: 800, color: PV.aws.col });
          rr(x0, y, x1 - x0, 60, 30); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = C.line; ctx.lineWidth = 3; ctx.stroke();
          if (p > 0) { rr(x0, y, Math.max(60, (x1 - x0) * p), 60, 30); ctx.fillStyle = r ? PV.aws.smile : PV.aws.col; ctx.fill(); }
          for (let k = 0; k <= n; k += step) { const x = lerp(x0 + 30, x1 - 30, k / n); text(k + unit, x, y + 94, { size: 24, weight: 700, color: C.muted, align: 'center' }); }
          if (p > 0) { const hx = x0 + Math.max(60, (x1 - x0) * p) - 30; node(hx, y + 30, 24, '', { fill: '#fff', stroke: '#fff' }); icon('clock', hx, y + 30, 18, r ? PV.aws.smile : PV.aws.col); }
          pop(x1, y - 36, S.pf(2, word, .5), () => text(lab, x1, y - 34, { size: 34, weight: 800, color: r ? '#B96A00' : PV.aws.col, align: 'right' }));
        }, 10);
      });
    });
    // line 3: bills active usage per second; CPU not charged while waiting
    alpha(S.p(3) * S.out(4), () => {
      fade(S.p(3, .05), () => a_title('Billed by the second, when active'));
      const lp = a_loop(t, S.ls(3) + .6, 6), on = a_cpu(lp.u).on;
      fade(S.p(3, .2), () => a_strip(160, 280, 1600, 70, { u: lp.u, labels: 1 }));
      pop(560, 520, S.pf(3, w(3, 'bills') - .03, .5), () => a_meter(560, 460, a_cpuVal(lp), on));
      fade(S.pf(3, w(3, 'by the second'), .5), () => text('active CPU & memory, per second', 560, 690, { size: 30, weight: 800, color: PV.aws.col, align: 'center' }), 10);
      // Atlas waits on the model
      const mf = w(3, 'waits');
      fade(S.pf(3, .15, .5), () => {
        atlas(1180, 560, 1.2, t, { mood: on ? 'happy' : 'think' });
        node(1600, 560, 70, '', { fill: C.purpleL, stroke: C.purple, lw: 4 }); icon('brain', 1600, 554, 32, C.purple);
        text('model', 1600, 660, { size: 28, weight: 800, color: C.purple, align: 'center' });
        line(1260, 560, 1520, 560, C.line, 4, [6, 8]);
        if (!on) { packet(1260, 560, 1520, 560, (t * .7) % 1, C.purple, 9); a_hourglass(1390, 470, .6, t); }
      });
      pop(1390, 780, S.pf(3, mf - .1, .5), () => pill('CPU not charged while waiting', 1390, 780, { size: 28, fill: C.greenL, color: C.green }));
    });
    // line 4: startup race, Worker in milliseconds vs AgentCore session ~2 s
    alpha(S.p(4) * S.out(5), () => {
      fade(S.p(4, .05), () => a_title('The trade-off: startup time'));
      const go = S.at(4, w(4, 'A fresh')), x0 = 560, x1 = 1560;
      [['cf', 'Worker', .12, 'milliseconds', C.green], ['aws', 'AgentCore session', 2, '~2 s', PV.aws.col]].forEach(([k, name, dur, res, col], i) => {
        const y = 390 + i * 230, p = clamp01((t - go) / dur);
        fade(S.p(4, .2 + i * .15), () => {
          provChip(k, 150, y - 24, { size: 24 });
          text(name, 150, y + 34, { size: 30, weight: 800 });
          rr(x0, y - 36, x1 - x0, 72, 36); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = C.line; ctx.lineWidth = 3; ctx.stroke();
          if (p > 0) { rr(x0, y - 36, Math.max(72, (x1 - x0) * p), 72, 36); ctx.fillStyle = k === 'cf' ? C.cf : PV.aws.col; ctx.fill(); }
          if (i === 1 && p > 0 && p < 1) text('booting…', x0 + 40, y + 1, { size: 28, weight: 700, color: '#fff' });
          ctx.fillStyle = C.ink; for (let r2 = 0; r2 < 4; r2++) for (let c = 0; c < 2; c++) if ((r2 + c) % 2 === 0) ctx.fillRect(x1 + 10 + c * 12, y - 36 + r2 * 18, 12, 18);
        });
        pop(x1 + 150, y, p >= 1 ? clamp01((t - go - dur) / .5) : 0, () => {
          text(res, x1 + 60, y + 2, { size: 38, weight: 800, color: col });
        });
      });
      pop(960, 800, S.pf(4, w(4, 'milliseconds'), .5), () => pill('Worker: milliseconds  ·  AgentCore: ~2 s', 960, 800, { size: 28, fill: '#fff', color: C.soft }));
    });
    // line 5: classic Lambda, 15 min cap, billed the whole time
    alpha(S.p(5), () => {
      fade(S.p(5, .05), () => a_title('Classic AWS Lambda'));
      const lp = a_loop(t, S.ls(5) + .4, 5), on = a_cpu(lp.u).on, bf = w(5, 'bills'), gf = w(5, 'great');
      pop(470, 420, S.p(5, .2), () => {
        card(190, 260, 560, 320, { r: 28, stroke: PV.aws.col, lw: 3 });
        rr(230, 300, 110, 110, 22); ctx.fillStyle = PV.aws.smile; ctx.fill();
        text('λ', 285, 358, { size: 76, weight: 700, color: '#fff', align: 'center' });
        text('AWS Lambda', 370, 355, { size: 44, weight: 800, color: PV.aws.col });
        pop(470, 490, S.pf(5, w(5, 'fifteen') - .02, .5), () => a_iconPill('up to 15 min', 'clock', 470, 490, { size: 32, color: PV.aws.col, stroke: PV.aws.col }));
      });
      pop(470, 680, S.pf(5, gf - .02, .5), () => pill('great for short jobs', 470, 680, { size: 30, fill: C.greenL, color: C.green }));
      fade(S.pf(5, bf - .1, .5), () => a_strip(880, 290, 880, 60, { u: lp.u, labels: 1 }));
      pop(1320, 520, S.pf(5, bf - .06, .5), () => a_meter(1320, 470, a_wallVal(lp), true));
      fade(S.pf(5, bf, .5), () => text('billed the whole time', 1320, 700, { size: 34, weight: 800, color: C.red, align: 'center' }), 10);
      pop(1320, 780, S.pf(5, w(5, 'waiting included'), .5), () => pill('waiting included', 1320, 780, { size: 28, fill: C.redL, color: C.red }));
      if (!on && S.pf(5, bf, .1) > 0) alpha(.8, () => text('still ticking', 1530, 560, { size: 26, weight: 800, color: C.red }));
    });
  },
};
