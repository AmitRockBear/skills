import * as fs from 'node:fs/promises';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

export async function captureBatch(app, directory, seconds = 40) {
  if (!(seconds > 0 && seconds <= 45)) throw new Error('Capture batches must be at most 45 seconds');
  await fs.mkdir(directory, { recursive: true, mode: 0o700 });
  const rootFile = path.join(directory, 'root.json');
  let root;
  try {
    root = JSON.parse(await fs.readFile(rootFile, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    root = { captureStartMs: Date.now(), source: 'OpenAI native app window capture', timestamp: 'screenshot request time' };
    await fs.writeFile(rootFile, JSON.stringify(root, null, 2));
  }
  const indexPath = path.join(directory, 'frames.ndjson');
  let count = 0;
  let nextCaptureAt = 0;
  try {
    const frames = (await fs.readFile(indexPath, 'utf8')).trim().split('\n').filter(Boolean);
    count = frames.length;
    if (count) nextCaptureAt = root.captureStartMs + JSON.parse(frames.at(-1)).timeMs + 200;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const deadline = Date.now() + seconds * 1000;
  let stopped = false;
  while (Date.now() < deadline) {
    // Cap fallback recording at five screenshots/second, including across batches.
    if (nextCaptureAt > Date.now()) await delay(Math.min(nextCaptureAt, deadline) - Date.now());
    if (Date.now() >= deadline) break;
    try { await fs.access(path.join(directory, 'STOP')); stopped = true; break; }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    const requested = Date.now();
    nextCaptureAt = requested + 200;
    try {
      const bytes = await app.getScreenshot({ emit: false });
      const returned = Date.now();
      const extension = bytes[0] === 0xff && bytes[1] === 0xd8 ? 'jpg' :
        bytes[0] === 0x89 && bytes[1] === 0x50 ? 'png' : null;
      if (!extension) throw new Error('Unsupported capture image format');
      const filename = `${String(count++).padStart(6, '0')}.${extension}`;
      await fs.writeFile(path.join(directory, filename), bytes);
      await fs.appendFile(indexPath, JSON.stringify({ filename, timeMs: requested - root.captureStartMs,
        captureLatencyMs: returned - requested }) + '\n');
    } catch (error) {
      await fs.appendFile(path.join(directory, 'errors.ndjson'), JSON.stringify({ at: Date.now(), error: String(error) }) + '\n');
      throw error;
    }
  }
  if (stopped) {
    root.captureEndMs = Date.now();
    await fs.writeFile(rootFile, JSON.stringify(root, null, 2));
  }
  return { frames: count, elapsedMs: Date.now() - root.captureStartMs, stopped };
}
