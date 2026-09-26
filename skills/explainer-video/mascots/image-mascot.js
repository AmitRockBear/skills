// Image mascot: one full-body PNG (mascot/figure.png) animated in code.
// mascot/meta.js sets window.FIGURE_META = { size: [w, h], feet: [x, y], top, eyes?: [{cx, cy, len, wid, ang}, {..}], mouth? }
// With `eyes`, the painted eyes were erased by prep_mascot.py and are redrawn here (blink, glance, happy ^^, optional
// capsule mouth that opens with the voice). Without `eyes`, the image stays as-is and only the body moves.
// Motion stays planted, like a cartoon narrator: breathing, sway, a stretch while speaking, and a hop between spots.
const FIG = { img: null, meta: window.FIGURE_META };
window.READY = new Promise((res, rej) => {
  const im = new Image(); im.onload = () => { FIG.img = im; res(); }; im.onerror = () => rej(new Error('missing mascot/figure.png')); im.src = 'mascot/figure.png';
});
const INK = '#1C1817';

// x, y: point between the feet on the floor; height: on-screen height. o: { talk 0..1, look -1..1, happy 0..1, hop 0..1 }
function figure(x, y, height, t, o = {}) {
  const M = FIG.meta, tall = M.feet[1] - M.top, k = height / tall, talk = o.talk || 0;
  // hop: an arc with squash before take-off and on landing
  const hp = clamp01(o.hop || 0), air = Math.sin(hp * Math.PI);
  const lift = air * height * .16;
  const squashHop = hp > 0 && hp < 1 ? (hp < .12 ? 1 - hp / .12 * .12 : hp > .88 ? .88 + (hp - .88) / .12 * .12 : 1.06) : 1;
  const breathe = 1 + .008 * Math.sin(t * 2.2) + .022 * talk;
  const sy = breathe * squashHop, sx = 1 / Math.sqrt(sy);
  const sway = (Math.sin(t * 1.2) * .7 + talk * Math.sin(t * 5.7) * .6) * Math.PI / 180;
  // shadow shrinks while in the air
  ctx.save(); ctx.globalAlpha *= .14 * (1 - air * .6); ctx.fillStyle = '#3a2a1a';
  ctx.beginPath(); ctx.ellipse(x, y + 2, height * .2 * (1 - air * .3), height * .026, 0, 0, 7); ctx.fill(); ctx.restore();
  ctx.save();
  ctx.translate(x, y - lift); ctx.rotate(sway); ctx.scale(sx, sy); ctx.scale(k, k);
  ctx.translate(-M.feet[0], -M.feet[1]);
  ctx.drawImage(FIG.img, 0, 0);
  if (M.eyes && M.eyes.length === 2) figureFace(M, t, o);
  ctx.restore();
}

function figureFace(M, t, o) {
  const [e0, e1] = M.eyes, tilt = Math.atan2(e1.cy - e0.cy, e1.cx - e0.cx);
  const gap = Math.hypot(e1.cx - e0.cx, e1.cy - e0.cy);
  const look = (o.look || 0) * gap * .09;
  const cyc = (t + .4) % 3.9, blinkA = cyc < .15 ? Math.sin(cyc / .15 * Math.PI) : 0;
  const blink = Math.max(blinkA, o.blink || 0), happy = clamp01(o.happy || 0);
  ctx.fillStyle = M.ink || INK; ctx.strokeStyle = M.ink || INK; ctx.lineCap = 'round';
  for (const e of [e0, e1]) {
    ctx.save();
    ctx.translate(e.cx + Math.cos(tilt) * look, e.cy + Math.sin(tilt) * look);
    if (happy > .5) {
      ctx.rotate(tilt); ctx.lineWidth = e.wid * .6;
      ctx.beginPath(); ctx.arc(0, e.len * .14, e.len * .32, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
    } else {
      ctx.rotate(e.ang * Math.PI / 180);
      const L = e.len * (1 - .86 * blink), Wd = e.wid;
      ctx.beginPath(); ctx.roundRect(-L / 2, -Wd / 2, L, Wd, Math.min(L, Wd) / 2); ctx.fill();
    }
    ctx.restore();
  }
  if (M.mouth !== false) {
    // mouth in the eyes' own shape: a small capsule below the eyes that opens taller with the voice
    const open = clamp01((o.talk || 0) * 1.3), ew = e0.wid;
    const w = ew * (1.3 - .3 * open), h = ew * (.62 + .68 * open);
    ctx.save();
    ctx.translate((e0.cx + e1.cx) / 2 + Math.cos(tilt) * look * .8, (e0.cy + e1.cy) / 2 + gap * (M.mouthDrop ?? .36)); ctx.rotate(tilt);
    ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, Math.min(w, h) / 2); ctx.fill();
    ctx.restore();
  }
}
