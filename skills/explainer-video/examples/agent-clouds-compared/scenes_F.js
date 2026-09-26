// Part F scenes (see parts/F.md): ship, bill, scoreboard, pick, quiz3, outro
// Helpers are prefixed f_ to avoid collisions with other parts.

// ---------- part-F helpers ----------
// Scene title centered at x 960, with an optional provider logo on its left and a status badge on its right.
function f_title(s, k, b, y = 160) {
  const size = 54, w = measure(s, size, 600, SERIF), lw = k ? 92 : 0, x0 = W / 2 - (w + lw) / 2;
  if (k) logo(k, x0 + 36, y + (k === 'aws' ? 4 : 0), .6);
  text(s, x0 + lw + w / 2, y, { size, weight: 600, fam: SERIF, align: 'center' });
  if (b) badge(b, x0 + lw + w + 18, y - 16);
}
function f_iconPill(s, ic, cx, cy, o = {}) {
  const size = o.size || 30, tw = measure(s, size, 700), w = tw + size * 2.6, h = size * 1.9;
  card(cx - w / 2, cy - h / 2, w, h, { r: h / 2, fill: o.fill || '#fff', stroke: o.stroke || C.line, lw: 3, shadow: o.shadow });
  icon(ic, cx - w / 2 + size * 1.05, cy, size * .5, o.color || C.ink);
  text(s, cx - w / 2 + size * 1.9, cy + 1, { size, weight: 700, color: o.color || C.ink });
  return w;
}
function f_bezPts(x1, y1, c1x, c1y, c2x, c2y, x2, y2, n = 30) {
  const out = [];
  for (let i = 0; i <= n; i++) { const p = i / n, u = 1 - p; out.push([u * u * u * x1 + 3 * u * u * p * c1x + 3 * u * p * p * c2x + p * p * p * x2, u * u * u * y1 + 3 * u * u * p * c1y + 3 * u * p * p * c2y + p * p * p * y2]); }
  return out;
}
function f_at(pts, p) {
  const n = (pts.length - 1) * clamp01(p), k = Math.min(pts.length - 2, Math.floor(n)), f = n - k;
  return [lerp(pts[k][0], pts[k + 1][0], f), lerp(pts[k][1], pts[k + 1][1], f)];
}
function f_poly(pts, p = 1, color = C.line, lw = 4, dash) {
  if (p <= 0) return;
  const n = (pts.length - 1) * clamp01(p), k = Math.floor(n);
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i <= k; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  if (k < pts.length - 1) { const [x, y] = f_at(pts, p); ctx.lineTo(x, y); }
  ctx.stroke(); ctx.restore();
}
function f_dot(x, y, color = C.acc, r = 10) {
  ctx.beginPath(); ctx.arc(x, y, r * 1.8, 0, 7); ctx.fillStyle = color + '33'; ctx.fill();
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = color; ctx.fill();
}
// rewind glyph: two left-pointing triangles
function f_rewind(x, y, s, color) {
  ctx.fillStyle = color;
  for (const dx of [-s * .45, s * .35]) { ctx.beginPath(); ctx.moveTo(x + dx + s * .4, y - s * .5); ctx.lineTo(x + dx - s * .4, y); ctx.lineTo(x + dx + s * .4, y + s * .5); ctx.closePath(); ctx.fill(); }
}
// Globe of dots with Cloudflare pins that light up in a wave (wave 0..1) spreading from Lisbon.
const F_PINS = (() => { const r = rng(26), out = []; for (let i = 0; i < 140; i++) out.push([-40 + r() * 100, -180 + r() * 360]); return out; })();
function f_globe(cx, cy, R, lon0, wave) {
  const tilt = .35, rad = Math.PI / 180;
  const proj = (lat, lon) => {
    const la = lat * rad, lo = (lon - lon0) * rad;
    const x = Math.cos(la) * Math.sin(lo), y0 = Math.sin(la), z0 = Math.cos(la) * Math.cos(lo);
    return [cx + x * R, cy - (y0 * Math.cos(tilt) - z0 * Math.sin(tilt)) * R, y0 * Math.sin(tilt) + z0 * Math.cos(tilt)];
  };
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.strokeStyle = C.line; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#D9CDBB';
  for (let lat = -80; lat <= 80; lat += 10) for (let lon = -180; lon < 180; lon += 10) { const [x, y, z] = proj(lat, lon); if (z > 0) { ctx.beginPath(); ctx.arc(x, y, 3 * (.4 + .6 * z), 0, 7); ctx.fill(); } }
  const oLa = 38.7 * rad, oLo = -9.1 * rad;
  F_PINS.forEach(([lat, lon]) => {
    const [x, y, z] = proj(lat, lon); if (z <= .05) return;
    const d = Math.acos(Math.max(-1, Math.min(1, Math.sin(oLa) * Math.sin(lat * rad) + Math.cos(oLa) * Math.cos(lat * rad) * Math.cos(lon * rad - oLo)))) / Math.PI;
    const lit = clamp01((wave - d * .85) / .12), sz = .5 + .5 * z;
    ctx.beginPath(); ctx.arc(x, y, (lit > 0 ? 7 : 5) * sz, 0, 7); ctx.fillStyle = lit > 0 ? C.cf : '#C9BBA6'; ctx.fill();
    if (lit > 0 && lit < 1) { ctx.beginPath(); ctx.arc(x, y, (8 + lit * 22) * sz, 0, 7); ctx.strokeStyle = `rgba(243,128,32,${1 - lit})`; ctx.lineWidth = 3; ctx.stroke(); }
  });
}
// A friendly judge robot (AWS navy) with a mortarboard hat.
function f_judge(x, y, s, t) {
  ctx.save(); ctx.translate(x, y + Math.sin(t * 2.2) * 3 * s);
  rr(-s * 50, s * 46, s * 100, s * 46, s * 14); ctx.fillStyle = PV.aws.col; ctx.fill();
  rr(-s * 62, -s * 44, s * 124, s * 88, s * 24); ctx.fillStyle = PV.aws.col; ctx.fill();
  rr(-s * 48, -s * 30, s * 96, s * 56, s * 16); ctx.fillStyle = '#EEF2F8'; ctx.fill();
  ctx.fillStyle = C.ink; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(sx * s * 20, -s * 6, s * 7, 0, 7); ctx.fill(); }
  ctx.strokeStyle = C.ink; ctx.lineWidth = 3.5 * s; ctx.beginPath(); ctx.moveTo(-s * 12, s * 12); ctx.lineTo(s * 12, s * 12); ctx.stroke();
  // mortarboard
  ctx.fillStyle = '#2B2A28'; rr(-s * 34, -s * 62, s * 68, s * 20, s * 4); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-s * 70, -s * 66); ctx.lineTo(0, -s * 88); ctx.lineTo(s * 70, -s * 66); ctx.lineTo(0, -s * 46); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = PV.aws.smile; ctx.lineWidth = 4 * s; ctx.beginPath(); ctx.moveTo(0, -s * 66); ctx.lineTo(s * 52, -s * 58); ctx.lineTo(s * 54 + Math.sin(t * 3) * 3 * s, -s * 30); ctx.stroke();
  ctx.restore();
}
// A bank building
function f_bank(x, y, s, color) {
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(-s * 90, -s * 40); ctx.lineTo(0, -s * 90); ctx.lineTo(s * 90, -s * 40); ctx.closePath(); ctx.fill();
  for (let i = 0; i < 4; i++) { rr(-s * 70 + i * s * 42, -s * 30, s * 18, s * 80, s * 4); ctx.fill(); }
  rr(-s * 90, s * 56, s * 180, s * 20, s * 5); ctx.fill();
  ctx.restore();
}
// small taxi-meter style dial; v 0..1
function f_dial(x, y, r, v, color) {
  ctx.save(); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(x, y, r, Math.PI, 0); ctx.strokeStyle = C.line; ctx.lineWidth = r * .2; ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y, r, Math.PI, Math.PI + Math.PI * clamp01(v)); ctx.strokeStyle = color; ctx.stroke();
  const a = Math.PI + Math.PI * clamp01(v); ctx.strokeStyle = C.ink; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * r * .8, y + Math.sin(a) * r * .8); ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y, 8, 0, 7); ctx.fillStyle = C.ink; ctx.fill();
  ctx.restore();
}

// ======================= ship =======================
const F_TRACE = [['think', 'brain', C.purple], ['tool', 'tool', C.cf], ['answer', 'chat', C.green]];
const F_SPANS = [['agent', 0, 4, PV.aws.col], ['model', .15, 1.6, C.purple], ['tool', 1.7, 2.6, PV.aws.smile], ['model', 2.7, 3.85, C.purple]];
const F_CDK = [['Runtime', 'body', 640, 390], ['Gateway', 'tool', 1280, 390], ['Memory', 'memory', 640, 580], ['IAM role', 'key', 1280, 580]];
SCN.ship = {
  chapter: CH.ship,
  draw(S, t) {
    chapterTitle(S, 10, 'Shipping it', 'eye');
    // line 0 (after the title): deploy it, then watch it
    alpha(S.p(0, 3.0, .5) * S.out(1, 0, .4), () => {
      atlas(960, 480, 1.5, t, { mood: 'happy' });
      pop(600, 480, S.p(0, 3.1, .5), () => f_iconPill('deploy', 'globe', 600, 480, { color: C.acc }));
      pop(1320, 480, S.p(0, 3.4, .5), () => f_iconPill('watch', 'eye', 1320, 480, { color: C.acc }));
    });

    // line 1: Vercel previews, rollback, rolling release
    alpha(S.p(1, 0, .5) * S.out(2, 0, .4), () => {
      f_title('Vercel: every push gets a preview', 'vc');
      const gp = S.pf(1, .05, .8), bp = S.pf(1, .27, .7), up = S.pf(1, .45, .5);
      // git graph
      const ym = 470, br = f_bezPts(240, ym, 330, ym, 330, 330, 440, 330, 20).concat([[700, 330]]);
      f_poly([[120, ym], [800, ym]], gp, C.soft, 8);
      alpha(gp, () => text('main', 120, ym + 38, { size: 24, weight: 800, color: C.soft }));
      [200, 520, 740].forEach((x, i) => { if (gp > (x - 120) / 680) node(x, ym, 13, '', { fill: '#fff', stroke: C.soft, lw: 5 }); });
      f_poly(br, bp, C.ink, 8);
      if (bp >= 1) {
        node(700, 330, 16, '', { fill: C.ink, stroke: C.ink });
        text('feature', 480, 300, { size: 24, weight: 800, color: C.ink });
      }
      pop(350, 250, S.pf(1, .25, .5), () => { card(210, 222, 290, 58, { r: 16, fill: C.code, shadow: false }); text('$ git push', 355, 252, { size: 28, weight: 600, fam: MONO, color: CODE.text, align: 'center' }); });
      if (up > 0) { line(720, 330, 900, 360, C.line, 4, [6, 8]); packet(720, 330, 900, 360, (t * .9) % 1, C.ink, 8); }
      // preview card
      pop(1340, 380, up, () => {
        card(900, 240, 880, 280, { r: 22, stroke: C.ink, lw: 3 });
        rr(920, 258, 840, 52, 26); ctx.fillStyle = C.bg; ctx.fill();
        icon('lock', 950, 284, 13, C.green);
        const url = 'atlas-git-feature.vercel.app', n = Math.floor(url.length * S.pf(1, .5, .8, x => x));
        text(url.slice(0, n), 975, 284, { size: 26, weight: 600, fam: MONO });
        atlas(1010, 420, .75, t, { mood: 'happy' });
        text('Preview', 1100, 400, { size: 36, weight: 800 });
        text('its own link, per push', 1100, 446, { size: 26, weight: 600, color: C.soft });
        pill('ready', 1680, 420, { size: 24, fill: C.greenL, color: C.green, shadow: false });
      });
      // rollback
      const rb = S.pf(1, .62, .5), back = S.pf(1, .7, .6, eIO);
      fade(rb, () => {
        card(120, 580, 700, 240, { r: 24 });
        rr(150, 610, 250, 64, 32); ctx.fillStyle = C.ink; ctx.fill();
        f_rewind(190, 642, 26, '#fff');
        text('rollback', 300, 643, { size: 28, weight: 800, color: '#fff', align: 'center' });
        text('instant', 430, 643, { size: 28, weight: 700, color: C.soft });
        const vx = [260, 470, 680], lx = lerp(vx[2], vx[1], back);
        line(vx[0], 750, vx[2], 750, C.line, 5);
        vx.forEach((x, i) => { node(x, 750, 16, '', { fill: '#fff', stroke: C.soft, lw: 4 }); text('v' + (i + 1), x, 790, { size: 22, weight: 700, color: C.soft, align: 'center' }); });
        ctx.beginPath(); ctx.arc(lx, 750, 22, 0, 7); ctx.fillStyle = C.green; ctx.fill();
        text('live', lx, 712, { size: 22, weight: 800, color: C.green, align: 'center' });
      }, 16);
      // rolling release slider 10% -> 50% -> 100%
      const s0 = S.at(1, .8), st = [P(t, s0, .35), P(t, s0 + .55, .35), P(t, s0 + 1.1, .35)];
      const pct = st[2] > 0 ? lerp(50, 100, st[2]) : st[1] > 0 ? lerp(10, 50, st[1]) : 10 * st[0];
      fade(S.pf(1, .78, .5), () => {
        card(880, 580, 900, 240, { r: 24 });
        text('Rolling release', 920, 630, { size: 32, weight: 800 });
        text(Math.round(pct) + '% of users', 1740, 630, { size: 32, weight: 800, color: C.green, align: 'right' });
        const x0 = 940, x1 = 1720, y = 730, x = lerp(x0, x1, pct / 100);
        rr(x0, y - 9, x1 - x0, 18, 9); ctx.fillStyle = C.line; ctx.fill();
        rr(x0, y - 9, x - x0, 18, 9); ctx.fillStyle = C.green; ctx.fill();
        [10, 50, 100].forEach(v => text(v + '%', lerp(x0, x1, v / 100), y + 48, { size: 22, weight: 700, color: C.soft, align: 'center' }));
        ctx.beginPath(); ctx.arc(x, y, 20, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = C.green; ctx.stroke();
      }, 16);
    });

    // line 2a: Cloudflare, one command, worldwide + Worker Previews
    const fAg = wordAt('ship', 2, 'Agents');
    alpha(S.p(2, .3, .5) * (1 - S.pf(2, fAg - .04, .4, eIO)), () => {
      f_title('Cloudflare: one command, worldwide', 'cf');
      const cmd = ['$ npx wrangler deploy'];
      codeBlock(100, 280, 720, cmd, { size: 34, file: 'terminal', reveal: chars(cmd) * S.pf(2, .08, 1.3, x => x), cursor: true, hl: [S.pf(2, .25, .4)] });
      const wave = S.pf(2, .28, 1.8, x => x);
      if (wave > 0 && wave < 1) packet(830, 350, 1030, 460, clamp01(wave * 3), C.cf, 10);
      alpha(S.pf(2, .24, .5), () => f_globe(1340, 510, 290, -20 + t * 8, wave));
      pop(450, 520, S.pf(2, .3, .5), () => f_iconPill('live worldwide in seconds', 'bolt', 450, 520, { size: 28, color: C.cf, fill: C.cfL, stroke: C.cfL }));
      pop(450, 660, S.pf(2, .47, .5), () => f_iconPill('Worker Previews', 'browser', 450, 660, { size: 32, stroke: C.cf }));
    });
    // line 2b: Agents tracing, every step
    alpha(S.pf(2, fAg, .5) * S.out(3, 0, .4), () => {
      f_title('Agents tracing', 'cf', 'beta');
      atlas(220, 470, 1.1, t, { mood: S.pf(2, .9) > 0 ? 'happy' : 'think' });
      F_TRACE.forEach(([nm, ic, col], i) => {
        const x = 480 + i * 450, p = S.pf(2, fAg + .06 + i * .07, .5);
        if (i) arrow(x - 100, 470, x - 20, 470, p, { color: C.line, lw: 5 });
        pop(x + 160, 470, p, () => {
          card(x, 400, 320, 140, { r: 24, stroke: col, lw: 3 });
          node(x + 62, 470, 38, '', { fill: col + '22', stroke: 'transparent' });
          icon(ic, x + 62, 470, 22, col);
          text(nm, x + 120, 471, { size: 34, weight: 800 });
          const cp = S.pf(2, fAg + .1 + i * .07, .4);
          if (cp > 0) { node(x + 290, 404, 18, '', { fill: C.green, stroke: '#fff', lw: 3 }); check(x + 290, 404, 17, '#fff', cp); }
        });
      });
      // the recorded trace, with a playhead
      fade(S.pf(2, fAg + .2, .5), () => {
        const x0 = 480, x1 = 1780, y = 650;
        rr(x0, y - 24, x1 - x0, 48, 12); ctx.fillStyle = '#fff'; ctx.fill();
        F_TRACE.forEach(([nm, , col], i) => { const a = x0 + [0, .38, .7][i] * (x1 - x0), b = x0 + [.36, .68, 1][i] * (x1 - x0); rr(a + 4, y - 18, b - a - 8, 36, 10); ctx.fillStyle = col; ctx.fill(); text(nm, (a + b) / 2, y + 1, { size: 22, weight: 800, color: '#fff', align: 'center' }); });
        const ph = x0 + ((t * .35) % 1) * (x1 - x0);
        line(ph, y - 40, ph, y + 40, C.ink, 3);
        text('every step Atlas took', 960, 740, { size: 28, weight: 700, color: C.soft, align: 'center' });
      }, 14);
    });

    // line 3: AWS Observability in CloudWatch + Evaluations
    alpha(S.p(3, 0, .5) * S.out(4, 0, .4), () => {
      f_title('AgentCore Observability & Evaluations', 'aws');
      fade(S.pf(3, .08, .6), () => {
        card(100, 240, 900, 570, { r: 24 });
        rr(100, 240, 900, 70, [24, 24, 0, 0]); ctx.fillStyle = PV.aws.col; ctx.fill();
        icon('eye', 140, 275, 18, PV.aws.smile);
        text('CloudWatch', 175, 276, { size: 30, weight: 800, color: '#fff' });
        text('OpenTelemetry traces', 970, 276, { size: 22, weight: 600, color: '#C8D2E0', align: 'right' });
        // live request chart
        ctx.save(); ctx.beginPath(); ctx.rect(130, 330, 840, 120); ctx.clip();
        ctx.strokeStyle = PV.aws.smile; ctx.lineWidth = 4; ctx.beginPath();
        for (let x = 130; x <= 970; x += 12) { const v = Math.sin(x * .02 + t * 1.6) * .5 + Math.sin(x * .053 - t * 2.3) * .3; ctx.lineTo(x, 395 - v * 40); }
        ctx.stroke(); ctx.restore();
        line(130, 460, 970, 460, C.line, 2);
      }, 16);
      F_SPANS.forEach(([nm, a, b, col], i) => {
        const y = 510 + i * 70, p = S.pf(3, .2 + i * .06, .5), x1 = 330 + a * 160, x2 = 330 + b * 160;
        fade(p, () => {
          text(nm, 140, y, { size: 26, weight: 700, fam: MONO, color: C.soft });
          rr(x1, y - 18, (x2 - x1) * eOut(p), 36, 10); ctx.fillStyle = col; ctx.fill();
        }, 0);
      });
      if (S.pf(3, .45) > 0) { const ph = 330 + ((t * .3) % 1) * 640; line(ph, 480, ph, 790, C.ink, 3); }
      // Evaluations: a judge model grades Atlas's answer
      const ev = S.pf(3, .5, .6);
      fade(ev, () => {
        card(1060, 240, 740, 570, { r: 24, stroke: PV.aws.col, lw: 3 });
        text('AgentCore Evaluations', 1430, 290, { size: 32, weight: 800, align: 'center' });
        text('another model grades the answer', 1430, 332, { size: 24, weight: 600, color: C.soft, align: 'center' });
        f_judge(1200, 500, 1, t);
        text('judge model', 1200, 616, { size: 24, weight: 800, color: PV.aws.col, align: 'center' });
        atlas(1640, 420, .7, t, { mood: S.pf(3, .9) > 0 ? 'happy' : 'ok' });
        bubble("Atlas's answer: Lisbon, 5 days", 1360, 490, 400, { size: 24, tail: 'none', fill: C.blueL, stroke: C.blueL, color: C.blue, weight: 700 });
        if (S.pf(3, .7) > 0) { const k = ((t - S.at(3, .7)) * .9) % 1; packet(1300, 500, 1370, 520, k, PV.aws.smile, 7); }
      }, 16);
      for (let i = 0; i < 5; i++) {
        const sp = S.pf(3, .8 + i * .03, .4);
        pop(1260 + i * 72, 720, ev, () => icon('star', 1260 + i * 72, 720, 30, i < 4 && sp > 0 ? PV.aws.smile : C.line));
        if (i < 4 && sp > 0 && sp < 1) pop(1260 + i * 72, 720, sp, () => icon('star', 1260 + i * 72, 720, 30, PV.aws.smile));
      }
      alpha(S.pf(3, .93, .4), () => text('4 / 5', 1650, 722, { size: 34, weight: 800, color: PV.aws.col }));
    });

    // line 4: the CDK, infrastructure as code
    alpha(S.p(4, 0, .5), () => {
      f_title('The whole setup as code: the CDK', 'aws');
      fade(S.p(4, .1, .6), () => {
        card(300, 240, 1320, 460, { r: 24, fill: C.code });
        ['#F0715F', '#F2C14E', '#5DC26A'].forEach((c, i) => { ctx.beginPath(); ctx.arc(330 + i * 26, 268, 8, 0, 7); ctx.fillStyle = c; ctx.fill(); });
        text('AtlasStack · CDK', 960, 269, { size: 22, weight: 500, fam: MONO, color: '#A59C8F', align: 'center' });
      }, 16);
      const wires = [[0, 1, .38], [0, 2, .42], [3, 0, .46], [3, 1, .5]];
      wires.forEach(([a, b, f], i) => {
        const [, , ax, ay] = F_CDK[a], [, , bx, by] = F_CDK[b], p = S.pf(4, f, .5);
        if (p > 0) { line(ax, ay, lerp(ax, bx, p), lerp(ay, by, p), '#6B6258', 4); if (p >= 1) packet(ax, ay, bx, by, (t * .6 + i * .27) % 1, PV.aws.smile, 7); }
      });
      F_CDK.forEach(([nm, ic, x, y], i) => pop(x, y, S.pf(4, .06 + i * .07, .5), () => {
        card(x - 170, y - 50, 340, 100, { r: 18, fill: '#2E2B27', stroke: PV.aws.smile, lw: 3, shadow: false });
        icon(ic, x - 115, y, 20, PV.aws.smile);
        text(nm, x + 20, y + 1, { size: 32, weight: 700, color: '#fff', align: 'center' });
      }));
      pop(960, 780, S.pf(4, .7, .5), () => f_iconPill('powerful, but more to learn', 'gear', 960, 780, { size: 32, fill: C.peach, stroke: C.orangeL, color: C.orangeD }));
    });
  },
};

// ======================= bill =======================
// One trip plan: 60 s, of which ~2 s is computing (five 0.4 s slivers). Illustrative only.
const F_SLIV = [1, 9.5, 22, 38, 52], F_SW = .4;
const F_BX = 320, F_BW = 1380, f_bx = s => F_BX + s / 60 * F_BW, F_SPX = 14;
// seconds of computing inside [0, sim]
const f_cpu = sim => F_SLIV.reduce((a, s) => a + clamp01((sim - s) / F_SW) * F_SW, 0);
// the 60-second timeline bar; prog 0..1 of the minute revealed
function f_minute(y, h, prog, t) {
  const px = f_bx(60 * prog);
  rr(F_BX, y - h / 2, F_BW, h, 12); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = C.line; ctx.lineWidth = 3; ctx.stroke();
  if (prog > 0) {
    ctx.save(); rr(F_BX, y - h / 2, F_BW, h, 12); ctx.clip();
    ctx.fillStyle = C.idle; ctx.fillRect(F_BX, y - h / 2, px - F_BX, h);
    F_SLIV.forEach(s => { if (s < 60 * prog) { ctx.fillStyle = C.orange; ctx.fillRect(f_bx(s), y - h / 2, Math.min(px - f_bx(s), F_SPX), h); } });
    ctx.restore();
    F_SLIV.forEach(s => { const k = (60 * prog - s) / 3; if (k > 0 && k < 1) { ctx.beginPath(); ctx.arc(f_bx(s + .2), y, h * .4 + k * 30, 0, 7); ctx.strokeStyle = `rgba(217,119,87,${1 - k})`; ctx.lineWidth = 4; ctx.stroke(); } });
    if (prog < 1) line(px, y - h / 2 - 14, px, y + h / 2 + 14, C.ink, 4);
  }
  text('0 s', F_BX, y + h / 2 + 24, { size: 22, weight: 700, color: C.soft, align: 'center' });
  text('60 s', F_BX + F_BW, y + h / 2 + 24, { size: 22, weight: 700, color: C.soft, align: 'center' });
}
// a billing track aligned with the minute: cpu slivers, a thin memory band, or the whole duration
function f_track(y, h, sim, o = {}) {
  const px = f_bx(sim);
  ctx.save(); ctx.setLineDash([6, 8]); rr(F_BX, y - h / 2, F_BW, h, 10); ctx.strokeStyle = C.line; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore();
  ctx.save(); rr(F_BX, y - h / 2, F_BW, h, 10); ctx.clip();
  if (o.full) { ctx.fillStyle = o.full; ctx.fillRect(F_BX, y - h / 2, px - F_BX, h); }
  if (o.mem) { ctx.fillStyle = o.mem; ctx.fillRect(F_BX, y + h / 2 - h * .28, px - F_BX, h * .28); }
  if (o.cpu) F_SLIV.forEach(s => { if (s < sim) { ctx.fillStyle = C.orange; ctx.fillRect(f_bx(s), y - h / 2, Math.min(px - f_bx(s), F_SPX), h * (o.mem ? .72 : 1)); } });
  ctx.restore();
  if (sim > 0 && sim < 60) line(px, y - h / 2 - 8, px, y + h / 2 + 8, C.ink, 3);
}
function f_meter(x, y, label, val, color, o = {}) {
  const w = o.w || 620, h = 150;
  card(x - w / 2, y - h / 2, w, h, { r: 28, stroke: color, lw: 4 });
  f_dial(x - w / 2 + 80, y + 24, 44, o.v ?? 0, color);
  text(label, x - w / 2 + 150, y + 1, { size: 36, weight: 800, color: C.ink });
  rr(x + w / 2 - 230, y - 42, 200, 84, 16); ctx.fillStyle = C.code; ctx.fill();
  text(val, x + w / 2 - 130, y + 2, { size: 42, weight: 700, fam: MONO, color: '#F2A47F', align: 'center' });
}
const F_EXTRA = [['memory', 'memory', 'memory, tool'], ['tool calls', 'tool', 'tool calls'], ['logs', 'doc', 'logs']];
const F_TIPS = [['gateways', 'gear', 'gateways'], ['caching', 'db', 'caching'], ['cheaper models', 'coin', 'cheaper']];
SCN.bill = {
  chapter: CH.bill,
  draw(S, t) {
    chapterTitle(S, 11, 'The bill', 'doc');
    // line 0 (after the title): who charges what?
    alpha(S.p(0, 3.0, .5) * S.out(1, 0, .4), () => {
      atlas(700, 490, 1.4, t, { mood: 'think' });
      pop(1150, 480, S.p(0, 3.1, .5), () => {
        card(960, 270, 380, 420, { r: 20 });
        text('Bill', 1150, 320, { size: 36, weight: 700, fam: SERIF, align: 'center' });
        PROVS.forEach((k, i) => { const y = 410 + i * 90; logo(k, 1030, y, .45); text('$ ?', 1290, y + 2, { size: 32, weight: 800, color: C.soft, align: 'right' }); line(1000, y + 45, 1300, y + 45, C.line, 2, [4, 6]); });
      });
    });

    // the minute: big in line 1, then docked at the top for lines 2-4
    const dock = S.p(2, 0, .6, eIO), my = lerp(430, 270, dock), mh = lerp(90, 50, dock);
    const sweep = j => S.pf(j, .12, 4.2, x => x), cur = Math.min(S.cur(), 4);
    alpha(S.p(1, 0, .5) * S.out(5, 0, .4), () => {
      alpha(1 - dock, () => { f_title('One trip plan, one minute'); atlas(190, 430, .8, t, { mood: 'think' }); });
      f_minute(my, mh, S.p(2) > 0 ? 1 : S.pf(1, .08, 4.2, x => x), t);
      // docked: a playhead follows the billing sweep below
      const sw = sweep(cur);
      if (cur >= 2 && sw > 0 && sw < 1) line(f_bx(60 * sw), my - mh / 2 - 12, f_bx(60 * sw), my + mh / 2 + 12, C.ink, 4);
    });
    // line 1: slivers gather into ~2 s of computing; the rest is waiting
    alpha(S.p(1, 0, .5) * S.out(2, 0, .4), () => {
      const g = S.pf(1, .6, 1.0, eIO);
      F_SLIV.forEach((s, i) => {
        if (g <= 0) return;
        const x = lerp(f_bx(s), 460 + i * F_SPX, g), y = lerp(430 - 45, 590, g);
        ctx.fillStyle = C.orange; ctx.fillRect(x, y, F_SPX, lerp(90, 60, g));
      });
      fade(S.pf(1, .7, .5), () => {
        text('real computing', 700, 621, { size: 30, weight: 800, color: C.orangeD });
        pill('~2 s', 1000, 621, { size: 30, fill: C.peach, color: C.orangeD, shadow: false });
      }, 10);
      fade(S.pf(1, .84, .5), () => {
        rr(460, 690, 200, 60, 10); ctx.fillStyle = C.idle; ctx.fill();
        text('the rest: waiting on the model', 700, 721, { size: 30, weight: 800, color: C.soft });
        atlas(1330, 715, .55, t, { mood: 'sleep' });
      }, 10);
    });
    // line 2: Cloudflare Workers, CPU time only
    alpha(S.p(2, .2, .5) * S.out(3, 0, .4), () => {
      f_title('Cloudflare Workers: CPU time only', 'cf');
      const sim = 60 * sweep(2), cpu = f_cpu(sim);
      text('billed', F_BX - 24, 390, { size: 26, weight: 800, color: C.soft, align: 'right' });
      f_track(390, 56, sim, { cpu: true });
      pop(960, 560, S.pf(2, .15, .5), () => f_meter(960, 560, 'CPU time', sim >= 60 ? '~2 s' : cpu.toFixed(1) + ' s', C.cf, { v: cpu / 2 }));
      pop(700, 750, S.pf(2, .58, .5), () => f_iconPill('from $5 / month', 'coin', 700, 750, { size: 32, fill: C.cfL, stroke: C.cfL, color: PV.cf.ink }));
      pop(1230, 750, S.pf(2, .88, .5), () => f_iconPill('R2 downloads: free', 'box', 1230, 750, { size: 32, fill: C.greenL, stroke: C.greenL, color: C.green }));
    });
    // line 3: Vercel, Active CPU + reserved memory
    alpha(S.p(3, 0, .5) * S.out(4, 0, .4), () => {
      f_title('Vercel: Active CPU + reserved memory', 'vc');
      const sim = 60 * sweep(3), cpu = f_cpu(sim), mem = S.pf(3, .3, .5);
      text('billed', F_BX - 24, 390, { size: 26, weight: 800, color: C.soft, align: 'right' });
      f_track(390, 56, sim, { cpu: true, mem: mem > 0 ? C.blue : null });
      alpha(mem, () => { rr(F_BX, 444, 40, 14, 4); ctx.fillStyle = C.blue; ctx.fill(); text('memory reserved (the whole time)', F_BX + 54, 452, { size: 26, weight: 700, color: C.blue }); rr(F_BX + 520, 444, F_SPX, 14, 3); ctx.fillStyle = C.orange; ctx.fill(); text('Active CPU', F_BX + 544, 452, { size: 26, weight: 700, color: C.orangeD }); });
      pop(960, 590, S.pf(3, .15, .5), () => f_meter(960, 590, 'Active CPU', sim >= 60 ? '~2 s' : cpu.toFixed(1) + ' s', C.ink, { v: cpu / 2 }));
      pop(960, 770, S.pf(3, .72, .5), () => f_iconPill('free Hobby tier', 'star', 960, 770, { size: 32, fill: C.greenL, stroke: C.greenL, color: C.green }));
    });
    // line 4: AWS AgentCore per second vs Lambda the whole minute, plus extra meters
    alpha(S.p(4, 0, .5) * S.out(5, 0, .4), () => {
      f_title('AWS: per second, and many meters', 'aws');
      const simA = 60 * sweep(4), fL = wordAt('bill', 4, 'Lambda'), simB = 60 * S.pf(4, fL, 2.4, x => x);
      fade(S.p(4, .1, .5), () => {
        text('AgentCore: active CPU & memory, per second', F_BX, 378, { size: 26, weight: 800 });
        f_track(420, 44, simA, { cpu: true, mem: C.blue });
      }, 10);
      fade(S.pf(4, fL, .5), () => {
        text('Lambda: the whole 60 s', F_BX, 490, { size: 26, weight: 800, color: C.red });
        f_track(532, 44, simB, { full: C.red });
      }, 10);
      F_EXTRA.forEach(([nm, ic, w], i) => {
        const x = 620 + i * 340, y = 715, p = S.pf(4, wordAt('bill', 4, w), .5);
        pop(x, y, p, () => {
          card(x - 150, y - 90, 300, 180, { r: 22, stroke: PV.aws.smile, lw: 3 });
          f_dial(x, y + 20, 56, .15 + ((t - S.at(4, wordAt('bill', 4, w))) * .18) % .8, PV.aws.smile);
          icon(ic, x - 110, y - 56, 15, PV.aws.col);
          text(nm, x - 86, y - 55, { size: 26, weight: 800, color: PV.aws.col });
        });
      });
    });
    // line 5: model tokens dwarf compute
    alpha(S.p(5, 0, .5), () => {
      f_title('Model tokens usually dwarf all of this');
      const base = 770, th = 470 * S.p(5, .2, 1.2, eIO);
      line(200, base, 1120, base, C.soft, 4);
      rr(280, base - th, 240, th, [18, 18, 0, 0]); ctx.fillStyle = C.redL; ctx.fill(); ctx.strokeStyle = C.red; ctx.lineWidth = 4; ctx.stroke();
      if (th > 60) {
        ctx.save(); rr(280, base - th, 240, th, [18, 18, 0, 0]); ctx.clip();
        for (let i = 0; i < 9; i++) { const k = ((t * .35 + i / 9) % 1); f_dot(330 + (i % 3) * 70, base - k * th, C.red, 9); }
        ctx.restore();
        alpha(clamp01((th - 60) / 100), () => text('model tokens', 400, base - th - 30, { size: 30, weight: 800, color: C.red, align: 'center' }));
      }
      PROVS.forEach((k, i) => {
        const x = 640 + i * 160, p = S.p(5, .5 + i * .15, .5);
        pop(x + 50, base - 20, p, () => {
          rr(x, base - 28, 100, 28, [8, 8, 0, 0]); ctx.fillStyle = C.orange; ctx.fill();
          logo(k, x + 50, base + 38, .36);
        });
      });
      alpha(S.p(5, .9, .5), () => text('compute', 880, base - 62, { size: 26, weight: 800, color: C.orangeD, align: 'center' }));
      alpha(S.pf(5, .45, .5), () => text('what matters most', 1500, 330, { size: 32, weight: 700, fam: SERIF, color: C.soft, align: 'center' }));
      F_TIPS.forEach(([nm, ic, w], i) => pop(1500, 430 + i * 120, S.pf(5, wordAt('bill', 5, w), .5), () => f_iconPill(nm, ic, 1500, 430 + i * 120, { size: 32, fill: C.accL, stroke: C.accL, color: C.acc })));
    });
  },
};

// ======================= scoreboard =======================
const F_SB_ROWS = [null, ['body', 'code'], ['brain', 'keys', 'memory'], ['time', 'hands'], ['safety', 'money']];
const F_SB_FRESH = ['money', 'ship', 'bill'];
SCN.scoreboard = {
  chapter: CH.verdict,
  draw(S, t) {
    const fresh = F_SB_FRESH.map(k => SCORE_ROW[k]);
    const cell = (i, k) => {
      if (DONE.includes(SCORE[i].k)) return 1;
      const r = fresh.indexOf(i); if (r < 0) return 0;
      return S.pf(0, .02 + (r * 3 + PROVS.indexOf(k)) * .09, .45);
    };
    // weight of each talking line (1..4), cross-fading between lines
    const wj = j => S.p(j, 0, .4) * S.out(j + 1, 0, .4);
    const hi = i => { let v = S.cur() === 0 && fresh.includes(i) ? S.p(0, .1, .4) * S.out(1, 0, .4) : 0; for (let j = 1; j <= 4; j++) if (F_SB_ROWS[j].includes(SCORE[i].k)) v += wj(j); return clamp01(v) * (.75 + .25 * Math.sin(t * 3)); };
    const dim = i => { let v = 0; for (let j = 1; j <= 4; j++) if (!F_SB_ROWS[j].includes(SCORE[i].k)) v += wj(j); return clamp01(v) * .75; };
    scoreGrid({ cell, hi, dim });
    // pulse a provider's column as it is named
    const x0 = 70, lw = 290, cw = (1780 - lw) / 3;
    const pulse = (j, f) => { const t0 = S.at(j, f); return P(t, t0 - .1, .3) * (1 - P(t, t0 + 1.8, .6, eIO)); };
    PROVS.forEach((k, c) => {
      let a = 0;
      for (let j = 1; j <= 4; j++) {
        const f = wordAt('scoreboard', j, PV[k].name);
        if (lineCap('scoreboard', j).includes(PV[k].name)) a = Math.max(a, pulse(j, f));
      }
      a = Math.max(a, .6 * pulse(3, wordAt('scoreboard', 3, 'all three')));
      if (a <= 0) return;
      const x = x0 + lw + cw * c + 6;
      alpha(a, () => {
        rr(x, 152, cw - 12, 696, 20); ctx.fillStyle = PV[k].col + '14'; ctx.fill();
        ctx.lineWidth = 4; ctx.strokeStyle = PV[k].col + 'AA'; ctx.stroke();
      });
    });
    confetti(t, S.at(4, .82), 52, 960, 480, 80);
  },
};

// ======================= pick =======================
const F_PERSONA = [
  ['vc', 'Your agent lives in a Next.js app · ship fast', C.purple],
  ['cf', 'Millions of always-on agents · own state · close to users · low cost', C.teal],
  ['aws', 'Company on AWS · strict compliance & data rules', C.blue],
];
SCN.pick = {
  chapter: CH.verdict,
  draw(S, t) {
    alpha(S.out(4, 0, .5), () => {
      fade(S.p(0, 0, .6), () => f_title('Which one should you pick?'), 16);
      F_PERSONA.forEach(([k, who, shirt], i) => {
        const x = 110 + i * 580, w = 520, y0 = 240, cx = x + w / 2, fill = S.p(i + 1, .1, .6), on = S.cur() === i + 1 ? S.p(i + 1, 0, .4) : 0;
        pop(cx, 530, S.p(0, .4 + i * .2, .5), () => {
          ctx.save(); ctx.setLineDash([10, 10]); rr(x, y0, w, 595, 28); ctx.strokeStyle = C.muted; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
          alpha(1 - fill, () => text('?', cx, 530, { size: 120, weight: 700, fam: SERIF, color: C.idle, align: 'center' }));
          fade(fill, () => {
            card(x, y0, w, 595, { r: 28, stroke: on > 0 ? PV[k].col : C.line, lw: 3 + 3 * on });
            person(cx, y0 + 72, .95, shirt);
            let ly = y0 + 190;
            who.split(' · ').forEach((ln, j) => {
              const p = S.pf(i + 1, .1 + j * .12, .4);
              wrap(ln, w - 40, 29, 700).forEach(l2 => { alpha(p, () => text(l2, cx, ly, { size: 29, weight: 700, color: j ? C.soft : C.ink, align: 'center' })); ly += 40; });
            });
            const lp = S.pf(i + 1, .55, .5);
            arrow(cx, 584, cx, 584 + 30 * lp, lp, { color: C.muted, lw: 4, head: 12 });
            pop(cx, 672, lp, () => provTile(k, cx, 672, 52));
            if (k === 'aws') ['AgentCore', 'Bedrock'].forEach((c, m) => pop(cx - 95 + m * 190, 796, S.pf(3, .72 + m * .08, .5), () => pill(c, cx - 95 + m * 190, 796, { size: 26, fill: PV.aws.light, color: PV.aws.ink, shadow: false })));
          }, 0);
        });
      });
    });
    // line 4: mix and match
    alpha(S.p(4, .2, .6), () => {
      f_title('Mix and match');
      const ex = 960, ey = 530, rx = 460, ry = 245, pos = { vc: [960, 285], cf: [ex - rx * .866, ey + ry * .5], aws: [ex + rx * .866, ey + ry * .5] };
      const mp = S.pf(4, wordAt('pick', 4, 'MCP'), 1.0, eIO);
      if (mp > 0) {
        ctx.save(); ctx.setLineDash([10, 12]); ctx.lineDashOffset = -t * 30; ctx.strokeStyle = C.acc; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.ellipse(ex, ey, rx, ry, 0, Math.PI / 2, Math.PI / 2 + Math.PI * 2 * mp); ctx.stroke(); ctx.restore();
        if (mp >= 1) for (let i = 0; i < 3; i++) { const a = t * .6 + i * Math.PI * 2 / 3; f_dot(ex + Math.cos(a) * rx, ey + Math.sin(a) * ry, C.acc, 9); }
      }
      [['cf', 'AI SDK runs on Workers', wordAt('pick', 4, 'AI SDK')], ['aws', 'Vercel AI Gateway → Bedrock', wordAt('pick', 4, 'gateway')]].forEach(([k, lbl, f]) => {
        const [x1, y1] = pos.vc, [x2, y2] = pos[k], p = S.pf(4, f, .6), a = Math.atan2(y2 - y1, x2 - x1);
        arrow(x1 + Math.cos(a) * 80, y1 + Math.sin(a) * 80, x2 - Math.cos(a) * 90, y2 - Math.sin(a) * 90, p, { color: C.soft, lw: 5 });
        const mx = lerp(x1, x2, .6), my = lerp(y1, y2, .6);
        pop(mx, my, S.pf(4, f + .05, .5), () => pill(lbl, mx, my, { size: 27, fill: '#fff', stroke: C.soft }));
      });
      PROVS.forEach((k, i) => { const [x, y] = pos[k]; pop(x, y, S.p(4, .3 + i * .15, .5), () => provTile(k, x, y + Math.sin(t * 1.8 + i * 2) * 4, 64)); });
      pop(ex, ey + ry, mp, () => f_iconPill('MCP connects them all', 'hand', ex, ey + ry, { size: 28, fill: C.accL, stroke: C.acc, color: C.acc }));
    });
  },
};

// ======================= quiz3 =======================
const F_QUIZ = [['Bedrock', 'Guardrails', 'shield', 'content filters'], ['AgentCore', 'Policy', 'lock', 'Cedar rules on tool calls'], ['AgentCore', 'Memory', 'memory', 'remembers users'], ['CloudWatch', '', 'eye', 'logs & traces']];
SCN.quiz3 = {
  chapter: CH.verdict,
  guide: (S, t) => ({ look: [{ t0: S.ls(0), t1: S.le(1) }], happy: S.p(1, .1) > 0 ? 1 : 0, hops: [S.ls(1) + .1] }),
  draw(S, t) {
    pop(960, 160, S.p(0, .05, .7), () => {
      card(640, 108, 640, 104, { r: 52, fill: C.acc });
      text('Last quick check!', 960, 162, { size: 56, weight: 700, fam: SERIF, color: '#fff', align: 'center' });
      for (const [x, y, s, ph] of [[600, 130, 22, 0], [1320, 190, 26, 1.5], [1350, 115, 16, 3]]) { ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 2 + ph) * .3); icon('star', 0, 0, s, C.cfY); ctx.restore(); }
    });
    fade(S.pf(0, .08, .6), () => {
      f_bank(300, 300, .75, PV.aws.col);
      logo('aws', 300, 378, .5);
      text('A bank on AWS wants every tool call checked', 440, 272, { size: 36, weight: 600 });
      text('against strict rules, outside the model.', 440, 322, { size: 36, weight: 600 });
    }, 14);
    fade(S.pf(0, .88, .5), () => text('Which service?', 440, 376, { size: 36, weight: 800, color: C.acc }), 10);
    const win = S.p(1, 0, .5);
    F_QUIZ.forEach(([n1, n2, ic, use], i) => {
      const x = 150 + i * 420, y = 440 + Math.sin(t * 2 + i) * 3, right = i === 1;
      pop(x + 180, y + 130, S.pf(0, .5 + i * .08, .5), () => {
        alpha(right ? 1 : 1 - .3 * win, () => {
          card(x, y, 360, 260, { r: 28, fill: right && win > 0 ? C.greenL : '#fff', stroke: right && win > 0 ? C.green : C.line, lw: right ? 3 + 3 * win : 3 });
          node(x + 38, y + 38, 20, 'ABCD'[i], { fill: C.bg, stroke: C.line, size: 20, color: C.soft });
          node(x + 180, y + 72, 44, '', { fill: right && win > 0 ? '#fff' : PV.aws.light, stroke: 'transparent' });
          icon(ic, x + 180, y + 72, 26, right && win > 0 ? C.green : PV.aws.col);
          if (n2) { text(n1, x + 180, y + 146, { size: 34, weight: 800, align: 'center' }); text(n2, x + 180, y + 186, { size: 34, weight: 800, align: 'center' }); }
          else text(n1, x + 180, y + 164, { size: 34, weight: 800, align: 'center' });
          fade(S.pf(1, right ? .12 : .4 + i * .08, .5), () => text(use, x + 180, y + 230, { size: 25, weight: 700, color: right ? C.green : C.soft, align: 'center' }), 8);
        });
        if (right) pop(x + 330, y + 30, win, () => { node(x + 330, y + 30, 34, '', { fill: C.green, stroke: '#fff', lw: 4 }); check(x + 330, y + 30, 34, '#fff'); });
      });
    });
    confetti(t, S.ls(1), 61, 150 + 420 + 180, 440, 90);
    // countdown during the hold after line 0
    const cs = S.le(0), ce = S.ls(1) - .1, cp = (t - cs) / (ce - cs);
    pop(960, 790, P(t, cs - .2, .4) * (1 - P(t, S.ls(1), .3)), () => countdown(960, 790, 52, cp));
    pop(960, 790, S.pf(1, .5, .5), () => f_iconPill('every tool call  →  Cedar rules at the gateway', 'lock', 960, 790, { size: 28, fill: C.greenL, stroke: C.green, color: C.green }));
  },
};

// ======================= outro =======================
const F_DOCS = [['cf', 'developers.cloudflare.com/agents'], ['vc', 'ai-sdk.dev  ·  vercel.com/docs'], ['aws', 'aws.amazon.com/bedrock/agentcore']];
SCN.outro = {
  chapter: null,
  guide: (S, t) => t >= S.ls(2) - .3
    ? { spot: 'big', happy: S.pf(2, .5) > 0 ? 1 : 0, hops: [S.at(2, .5)] }
    : { look: [{ t0: S.at(0, .3), t1: S.at(0, .8) }, { t0: S.at(1, .2), t1: S.le(1) }] },
  draw(S, t) {
    // line 0: one portable agent codebase hops between clouds
    alpha(S.out(1, 0, .6), () => {
      f_title("You don't have to choose forever");
      const xs = [560, 960, 1360], ty = 560;
      PROVS.forEach((k, i) => pop(xs[i], ty, S.p(0, .3 + i * .15, .5), () => provTile(k, xs[i], ty, 76)));
      const T0 = S.at(0, wordAt('outro', 0, 'keep')), per = 1.5, seq = [0, 1, 2];
      let bx = xs[0], by = 360, land = 0;
      if (t > T0) {
        const k = Math.floor((t - T0) / per), ph = clamp01(((t - T0) % per) / .6), e = eIO(ph);
        const a = xs[seq[k % 3]], b = xs[seq[(k + 1) % 3]];
        bx = lerp(a, b, e); by = 360 - Math.sin(Math.PI * e) * 110; land = ph >= 1 ? 1 - clamp01(((t - T0) % per - .6) / .5) : 0;
      }
      const cur = t > T0 ? Math.round((bx - xs[0]) / 400) : 0;
      if (land > 0) { ctx.beginPath(); ctx.arc(xs[cur], ty, 86 + (1 - land) * 22, 0, 7); ctx.strokeStyle = `rgba(42,157,143,${land})`; ctx.lineWidth = 5; ctx.stroke(); }
      pop(bx, by, S.pf(0, .25, .5), () => {
        card(bx - 185, by - 50, 370, 100, { r: 22, fill: C.code });
        icon('code', bx - 140, by, 22, CODE.fn);
        text('Atlas agent code', bx + 28, by + 1, { size: 30, weight: 700, color: '#fff', align: 'center' });
        line(bx, by + 50, bx, ty - 82, C.acc, 3, [4, 8]);
      });
      pop(960, 740, S.pf(0, wordAt('outro', 0, 'portable') - .02, .5), () => pill('keep your agent code portable', 960, 740, { size: 32, fill: C.accL, color: C.acc }));
      alpha(S.pf(0, wordAt('outro', 0, 'swap'), .5), () => text('swap pieces as you grow', 960, 812, { size: 28, weight: 700, color: C.soft, align: 'center' }));
    });
    // line 1: check the docs
    alpha(S.p(1, 0, .6) * S.out(2, 0, .5), () => {
      f_title('Things change fast: check the docs');
      F_DOCS.forEach(([k, url], i) => {
        const y = 330 + i * 160, p = S.pf(1, .08 + i * .12, .5);
        fade(p, () => {
          card(360, y - 62, 1200, 124, { r: 26, stroke: S.pf(1, .7) > 0 ? PV[k].col : C.line, lw: 3 });
          rr(384, y - 44, 88, 88, 20); ctx.fillStyle = k === 'vc' ? '#F2F2F2' : PV[k].light; ctx.fill();
          logo(k, 428, y, .55);
          icon('doc', 520, y, 18, C.soft);
          text(url, 555, y + 1, { size: 34, weight: 600, fam: MONO, color: C.ink });
        }, 18);
      });
      pop(1560, 222, S.pf(1, .12, .5), () => { ctx.save(); ctx.translate(1560, 222); ctx.rotate(.12 + Math.sin(t * 2) * .04); pill('updated often', 0, 0, { size: 24, fill: C.purpleL, color: C.purple, shadow: false }); ctx.restore(); });
    });
    // line 2: thanks
    alpha(S.p(2, 0, .6), () => {
      text('Thanks for learning!', 1350, 300, { size: 72, weight: 600, fam: SERIF, align: 'center' });
      atlas(1350, 490, 1.3, t, { mood: 'happy' });
      PROVS.forEach((k, i) => pop(1170 + i * 180, 650, S.pf(2, .1 + i * .1, .5), () => logo(k, 1170 + i * 180, 650 + Math.sin(t * 2 + i) * 3, .6)));
      text('Product names & statuses as of September 26, 2026', 1350, 760, { size: 24, weight: 500, color: C.soft, align: 'center' });
    });
    confetti(t, S.at(2, .5), 66, 1150, 480, 90);
  },
};
