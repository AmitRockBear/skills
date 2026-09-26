// Example code mascot: a round blob drawn entirely in code. Copy this folder to start your own.
// Contract: define figure(x, y, height, t, o) and window.READY (see references/mascot.md).
window.READY = Promise.resolve();
window.MASCOT_SPOTS = { big: { x: 330, y: 1000, h: 420 }, corner: { x: 160, y: 1040, h: 260 } };
function figure(x, y, height, t, o = {}) {
  const talk = o.talk || 0, hp = clamp01(o.hop || 0), air = Math.sin(hp * Math.PI);
  const r = height * .42, lift = air * height * .2, sq = 1 + .03 * Math.sin(t * 2.2) + .05 * talk;
  ctx.save(); ctx.globalAlpha *= .14 * (1 - air * .6); ctx.fillStyle = '#3a2a1a';
  ctx.beginPath(); ctx.ellipse(x, y + 2, r * .9, r * .12, 0, 0, 7); ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(x, y - lift - r * sq); ctx.scale(1 / Math.sqrt(sq), sq);
  ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fillStyle = C.acc; ctx.fill();
  const lx = (o.look || 0) * r * .12, blink = ((t + .4) % 3.9) < .15;
  ctx.fillStyle = C.ink; ctx.strokeStyle = C.ink; ctx.lineWidth = r * .08; ctx.lineCap = 'round';
  for (const sx of [-1, 1]) {
    ctx.beginPath();
    if (o.happy > .5) { ctx.arc(sx * r * .32 + lx, -r * .05, r * .12, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); }
    else { ctx.ellipse(sx * r * .32 + lx, -r * .12, r * .08, blink ? r * .02 : r * .14, 0, 0, 7); ctx.fill(); }
  }
  ctx.beginPath(); ctx.ellipse(lx * .8, r * .28, r * .12, r * (.04 + .12 * clamp01(talk * 1.3)), 0, 0, 7); ctx.fill();
  ctx.restore();
}
