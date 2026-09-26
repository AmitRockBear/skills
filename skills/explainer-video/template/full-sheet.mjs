// One frame per narration line across the whole video -> build/sheets/full-<n>.png (24 frames per sheet)
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
const dir = path.dirname(new URL(import.meta.url).pathname);
const b = await chromium.launch({ args: ['--allow-file-access-from-files'] }); const page = await b.newPage({ viewport: { width: 1920, height: 1080 } });
page.on('pageerror', e => { console.error('PAGE ERROR', e.message); process.exit(1); });
await page.goto('file://' + path.join(dir, 'index.html'));
await page.evaluate(() => window.READY);
const lines = await page.evaluate(() => window.TIMELINE.lines.map(l => [l.start, l.end]));
const tmp = path.join(dir, 'build/sheets/full'); mkdirSync(tmp, { recursive: true });
const files = [];
for (const [i, [s, e]] of lines.entries()) {
  const t = s + (e - s) * .75;
  const b64 = await page.evaluate(t => { window.renderAt(t); return document.getElementById('c').toDataURL('image/jpeg', .85).split(',')[1]; }, t);
  const f = path.join(tmp, `${String(i).padStart(3, '0')}.jpg`); writeFileSync(f, Buffer.from(b64, 'base64')); files.push(f);
}
await b.close();
for (let k = 0; k * 24 < files.length; k++) {
  const fs = files.slice(k * 24, k * 24 + 24), n = fs.length;
  const filter = fs.map((_, i) => `[${i}]scale=480:270[s${i}];`).join('') + fs.map((_, i) => `[s${i}]`).join('') + `xstack=inputs=${n}:layout=` + fs.map((_, i) => `${(i % 4) * 480}_${Math.floor(i / 4) * 270}`).join('|') + ':fill=black';
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...fs.flatMap(f => ['-i', f]), '-filter_complex', filter, path.join(dir, `build/sheets/full-${k}.png`)]);
}
console.log('frames', files.length);
