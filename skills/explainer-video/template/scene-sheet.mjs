// Usage: node scene-sheet.mjs <scene> [framesPerLine=3]  -> build/sheets/<scene>.png (contact sheet: rows = lines, cols = samples)
// Also fails loudly on any page error.
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const dir = path.dirname(fileURLToPath(import.meta.url));
const [scene, perArg] = process.argv.slice(2); const per = Number(perArg || 3);
const b = await chromium.launch({ args: ['--allow-file-access-from-files'] }); const page = await b.newPage({ viewport: { width: 1920, height: 1080 } });
page.on('pageerror', e => { console.error('PAGE ERROR', e.message); process.exit(1); });
await page.goto('file://' + path.join(dir, 'index.html'));
await page.evaluate(() => window.READY);
const lines = await page.evaluate(n => window.TIMELINE.lines.filter(l => l.scene === n).map(l => [l.start, l.end]), scene);
if (!lines.length) { console.error('no such scene', scene); process.exit(1); }
const tmp = path.join(dir, 'build/sheets/tmp-' + scene); rmSync(tmp, { recursive: true, force: true }); mkdirSync(tmp, { recursive: true });
const files = [];
for (const [i, [s, e]] of lines.entries()) for (let k = 0; k < per; k++) {
  const t = s + (e - s) * (per === 1 ? .6 : .15 + .85 * k / (per - 1));
  const b64 = await page.evaluate(t => { window.renderAt(t); return document.getElementById('c').toDataURL('image/png').split(',')[1]; }, t);
  const f = path.join(tmp, `${i}_${k}.png`); writeFileSync(f, Buffer.from(b64, 'base64')); files.push(f);
}
await b.close();
const out = path.join(dir, `build/sheets/${scene}.png`);
const n = files.length, W = 640, H = 360;
const filter = files.map((_, i) => `[${i}]scale=${W}:${H}[s${i}];`).join('') + files.map((_, i) => `[s${i}]`).join('') + `xstack=inputs=${n}:layout=` + files.map((_, i) => `${(i % per) * W}_${Math.floor(i / per) * H}`).join('|');
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...files.flatMap(f => ['-i', f]), '-filter_complex', filter, out]);
console.log('wrote', out, `(${lines.length} lines x ${per}); full-res frames in`, tmp);
