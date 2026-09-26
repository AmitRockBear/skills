// Usage: node strip.mjs <t0> <t1> <n> <x> <y> <w> <h> <out>  -> consecutive frames, cropped, side by side
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
const dir = path.dirname(new URL(import.meta.url).pathname);
const [t0, t1, n, x, y, w, h] = process.argv.slice(2, 9).map(Number), out = process.argv[9];
const b = await chromium.launch({ args: ['--allow-file-access-from-files'] }); const page = await b.newPage({ viewport: { width: 1920, height: 1080 } });
page.on('pageerror', e => { console.error('PAGE ERROR', e.message); process.exit(1); });
await page.goto('file://' + path.join(dir, 'index.html')); await page.evaluate(() => window.READY);
const tmp = path.join(dir, 'build/strip'); mkdirSync(tmp, { recursive: true }); const files = [];
for (let i = 0; i < n; i++) {
  const t = t0 + (t1 - t0) * i / (n - 1);
  const b64 = await page.evaluate(({ t, x, y, w, h }) => { window.renderAt(t); const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(document.getElementById('c'), x, y, w, h, 0, 0, w, h); c.getContext('2d').fillStyle = '#000'; c.getContext('2d').font = '20px Menlo'; c.getContext('2d').fillText(t.toFixed(2), 6, 22); return c.toDataURL('image/png').split(',')[1]; }, { t, x, y, w, h });
  const f = path.join(tmp, `${i}.png`); writeFileSync(f, Buffer.from(b64, 'base64')); files.push(f);
}
await b.close();
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...files.flatMap(f => ['-i', f]), '-filter_complex', files.map((_, i) => `[${i}]`).join('') + `xstack=inputs=${n}:layout=` + files.map((_, i) => `${(i % 4) * w}_${Math.floor(i / 4) * h}`).join('|') + ':fill=white', out]);
console.log('wrote', out);
