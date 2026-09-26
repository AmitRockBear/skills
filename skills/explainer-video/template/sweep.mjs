// Calls renderAt for every frame of the video to catch runtime errors fast (no encoding).
// Also fails on script load errors and on scenes in the script that no scene file implements.
import { chromium } from 'playwright';
import path from 'node:path';
const dir = path.dirname(new URL(import.meta.url).pathname);
const b = await chromium.launch({ args: ['--allow-file-access-from-files'] }); const page = await b.newPage({ viewport: { width: 1920, height: 1080 } });
const loadErrs = [];
page.on('pageerror', e => loadErrs.push('load error: ' + e.message));
await page.goto('file://' + path.join(dir, 'index.html'));
await page.evaluate(() => window.READY);
const errs = await page.evaluate(() => {
  const out = [...new Set(window.TIMELINE.lines.map(l => l.scene))].filter(n => !SCN[n]).map(n => 'missing scene: ' + n);
  const n = Math.ceil(window.DURATION * window.FPS);
  for (let i = 0; i < n; i++) { try { window.renderAt(i / window.FPS); } catch (e) { out.push([+(i / window.FPS).toFixed(2), e.message, (e.stack || '').split('\n')[1]].join(' | ')); if (out.length > 40) break; } }
  return out;
});
await b.close();
const all = [...loadErrs, ...errs];
console.log(all.length ? all.join('\n') : 'no errors across all frames');
process.exit(all.length ? 1 : 0);
