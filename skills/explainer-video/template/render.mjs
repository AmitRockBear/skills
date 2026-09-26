// Usage: node render.mjs                  -> <project-folder-name>.mp4 (1080p30, loudness-normalized to -16 LUFS)
//        node render.mjs --stills 10,55.5  -> build/stills/*.png
import { chromium } from 'playwright';
import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dir = path.dirname(fileURLToPath(import.meta.url));
const stillsArg = process.argv.indexOf('--stills');
const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.on('pageerror', e => { console.error('PAGE ERROR', e); process.exit(1); });
await page.goto('file://' + path.join(dir, 'index.html'));
await page.evaluate(() => window.READY);
const { duration, fps } = await page.evaluate(() => ({ duration: window.DURATION, fps: window.FPS }));

const grab = (times, type) => page.evaluate(({ times, type }) => times.map(t => { window.renderAt(t); return document.getElementById('c').toDataURL(type, 0.94).split(',')[1]; }), { times, type });

if (stillsArg > 0) {
  mkdirSync(path.join(dir, 'build/stills'), { recursive: true });
  const times = process.argv[stillsArg + 1].split(',').map(Number);
  const imgs = await grab(times, 'image/png');
  imgs.forEach((b, i) => writeFileSync(path.join(dir, `build/stills/t${times[i].toFixed(1)}.png`), Buffer.from(b, 'base64')));
  console.log('wrote', times.length, 'stills');
} else {
  const raw = path.join(dir, 'build/raw.mp4'), out = path.join(dir, path.basename(dir) + '.mp4');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-i', path.join(dir, 'build/audio.wav'),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', raw], { stdio: ['pipe', 'inherit', 'inherit'] });
  const total = Math.ceil(duration * fps), batch = 10;
  for (let i = 0; i < total; i += batch) {
    const times = Array.from({ length: Math.min(batch, total - i) }, (_, k) => (i + k) / fps);
    for (const b of await grab(times, 'image/jpeg')) if (!ff.stdin.write(Buffer.from(b, 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
    if (i % (fps * 15) === 0) console.log(`${(i / fps).toFixed(0)}s / ${duration.toFixed(0)}s`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', raw, '-c:v', 'copy', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out]);
  console.log('wrote', out);
}
await browser.close();
