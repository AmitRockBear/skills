// For each narration line (3 samples), render without the narrator/captions and find the lowest content pixel
// inside the corner column (x 40..300, y 110..870). Prints lines whose content reaches below LIMIT (the narrator's head).
import { chromium } from 'playwright';
import path from 'node:path';
const dir = path.dirname(new URL(import.meta.url).pathname);
const LIMIT = Number(process.argv[2] || 760);
const b = await chromium.launch({ args: ['--allow-file-access-from-files'] }); const page = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto('file://' + path.join(dir, 'index.html')); await page.evaluate(() => window.READY);
const res = await page.evaluate((LIMIT) => {
  window.HIDE_GUIDE = true;
  const out = [];
  const bg = bgCanvas.getContext('2d').getImageData(40, 0, 260, 1080).data;
  window.TIMELINE.lines.forEach((l, i) => {
    let low = 0;
    for (const f of [.2, .6, .95]) {
      window.renderAt(l.start + (l.end - l.start) * f);
      const d = ctx.getImageData(40, 0, 260, 1080).data;
      for (let y = 870; y > 110 && y > low; y--) for (let x = 0; x < 260; x++) { const k = (y * 260 + x) * 4; if (Math.abs(d[k] - bg[k]) + Math.abs(d[k + 1] - bg[k + 1]) + Math.abs(d[k + 2] - bg[k + 2]) > 40) { low = y; break; } }
    }
    out.push([i, l.scene, low]);
  });
  return out;
}, LIMIT);
await b.close();
const bad = res.filter(r => r[2] > LIMIT);
console.log(bad.map(r => r.join(' ')).join('\n') || 'none');
