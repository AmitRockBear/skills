import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { setTimeout as delay } from 'node:timers/promises';
import { captureBatch } from './capture.mjs';

async function directory(t) {
  const value = await fs.mkdtemp(path.join(os.tmpdir(), 'verification-capture-'));
  t.after(() => fs.rm(value, { recursive: true, force: true }));
  return value;
}

test('capture cadence spans batches and retains bytes and timestamps', async t => {
  const target = await directory(t);
  const bytes = Buffer.from([0xff, 0xd8, 0xff, 0xd9]);
  const app = { getScreenshot: async () => bytes };
  await captureBatch(app, target, .45);
  const result = await captureBatch(app, target, .45);
  const frames = (await fs.readFile(path.join(target, 'frames.ndjson'), 'utf8')).trim().split('\n').map(JSON.parse);
  assert.equal(result.frames, frames.length);
  assert.ok(frames.length >= 2 && frames.length <= 5);
  for (let i = 1; i < frames.length; i++) assert.ok(frames[i].timeMs - frames[i - 1].timeMs >= 195);
  for (const frame of frames) assert.deepEqual(await fs.readFile(path.join(target, frame.filename)), bytes);
});

test('stop marker ends recording without taking another screenshot', async t => {
  const target = await directory(t);
  await fs.writeFile(path.join(target, 'STOP'), '');
  const result = await captureBatch({ getScreenshot: () => assert.fail('capture after STOP') }, target, .5);
  assert.equal(result.stopped, true);
  assert.equal(result.frames, 0);
  const root = JSON.parse(await fs.readFile(path.join(target, 'root.json'), 'utf8'));
  assert.ok(root.captureEndMs >= root.captureStartMs);
});

test('slow screenshots stay serial without catch-up bursts', async t => {
  const target = await directory(t);
  const starts = [];
  await captureBatch({ getScreenshot: async () => {
    starts.push(Date.now());
    await delay(250);
    return Buffer.from([0x89, 0x50]);
  } }, target, .65);
  assert.ok(starts.length <= 3);
  for (let i = 1; i < starts.length; i++) assert.ok(starts[i] - starts[i - 1] >= 245);
});

test('stop during cadence wait prevents a second screenshot', async t => {
  const target = await directory(t);
  let stop;
  const result = await captureBatch({ getScreenshot: async () => {
    assert.equal(stop, undefined);
    stop = delay(50).then(() => fs.writeFile(path.join(target, 'STOP'), ''));
    return Buffer.from([0xff, 0xd8]);
  } }, target, .5);
  await stop;
  assert.equal(result.stopped, true);
  assert.equal(result.frames, 1);
  const root = JSON.parse(await fs.readFile(path.join(target, 'root.json'), 'utf8'));
  assert.ok(root.captureEndMs >= root.captureStartMs);
});

test('capture failures remain visible to the caller and error log', async t => {
  const target = await directory(t);
  await assert.rejects(captureBatch({ getScreenshot: async () => { throw new Error('capture failed'); } }, target, .5), /capture failed/);
  assert.match(await fs.readFile(path.join(target, 'errors.ndjson'), 'utf8'), /capture failed/);
});
