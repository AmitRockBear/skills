# Recording and capture

Prefer the owned browser window, including browser chrome and the actual extension sidebar. Ordinary page video does not include those surfaces. Check capture permission and source availability before the feature run. Use an already installed OpenScreen CLI when available:

```bash
env -u ELECTRON_RUN_AS_NODE <Openscreen-binary> sources --json
env -u ELECTRON_RUN_AS_NODE <Openscreen-binary> record --window <unique-window-title> --cursor system --project <run/capture.openscreen> --json
```

Use the CLI's installed help to confirm flags. Keep the window title stable while selecting its source; check the selected window belongs to this run. End with SIGINT to that owned recorder, await finalization, and copy the referenced source media into evidence. `system` cursor capture is useful only if it follows the automation: verify a test click, then use logged action highlights where needed. Do not claim the physical cursor was recorded when the displayed cursor is a computer-use overlay.

## OpenAI capture fallback

If direct capture is unavailable, use the existing signed OpenAI app's window screenshots after login. This is a lower-frame-rate fallback, not native 60fps video. Capture a visible state change through a test control and confirm the recording updates before starting the feature run.

Continuous screenshot recording requires one capture worker while the main agent drives UI. Delegate only this bounded capture task: exact app bundle, new capture directory, start after login, write frames only there, no UI actions, 40-second awaited batches until STOP, report errors and final counts. The main agent owns browser controls and evidence. Give the worker this procedure:

1. Select the exact app with the `cua_repl` `js` tool's `cua.getApp` entry point, reading its API documentation first.
2. In a subsequent invocation, import the local helper and await a batch:

```javascript
var captureHelper = await import('file://<absolute-skill-directory>/scripts/capture.mjs');
nodeRepl.write(await captureHelper.captureBatch(verificationApp, '<new-capture-directory>', 40));
```

3. Await each `js` call with a timeout of 60,000ms; repeat until the returned `stopped` flag is true. The parent creates `<capture-directory>/STOP`. Suppress images and full accessibility output during capture. Report only progress counts when needed, errors immediately, and final counts on completion.

Unawaited loops do not survive the computer-use REPL invocation; never launch capture with a detached Promise. Keep one capture worker per window. `root.json` records wall-clock origin; `frames.ndjson` records source timestamps and request-to-return latency. The helper detects JPEG/PNG signatures and uses the correct suffix. Preserve all frames through review and record gaps/errors; remove working capture files only under the successful-review cleanup policy in [evidence](evidence.md).

The screenshot helper limits capture requests to five per second, including across batches; slower captures do not trigger catch-up bursts. Use native recording when transient UI behavior requires a higher frame rate.

Use `render-video.py --frames <capture-directory>` to assemble a timestamped normal-speed source before editing. Smaller popup frames are padded without stretching, retained, and listed in provenance. Inspect that they do not hide a required result. Capture gaps hold the prior frame and are not fresh observations; precise latency claims require stronger timing evidence.
