# Model-directed review video

Capture first; edit from observed events. The agent chooses the plan based on what proves the change. Use 1x for short important results, about 2x for ordinary actions, 4x for navigation, and 8–40x for generation/idle waits. These are starting points, not fixed presets; the helper accepts 0.1–100x. Preserve every source interval in order, including relevant errors and setup failures. Use the original for timing claims.

Use gentle zooms around the target and its result, then return to full-frame context. Prefer about 1.2–1.5x; the helper caps zoom at 2x. Keep surrounding errors and related state visible. Use visible click rings for measured actions because native accessibility clicks may leave the physical cursor stationary. Ensure each important click highlight lasts at least 0.5 seconds in the output: slow that interval if acceleration would make the existing 1.4-source-second ring flash too briefly. Inspect ring placement on the rendered frame. Click rings use measured event coordinates; separately logged native/extension click centers must be labeled in source telemetry. Do not zoom merely because a click occurred.

Captions describe observed steps, not unproved outcomes. Keep them short, readable and clear of the result. They are explanatory step captions, not a verbatim speech transcript. Plan a minimum readable output duration for important captions; fast waits can use a short repeated “Waiting for generation” caption. Optional speed labels help distinguish variable-speed sections.

## Tools and plan

The helper requires FFmpeg/ffprobe, Pillow and OpenScreen. Tested baseline: OpenScreen 1.11.0 from [the official releases](https://github.com/getopenscreen/openscreen/releases/tag/v1.11.0). Use an existing installation or unpack that official macOS release into a task/tool directory; pass its `Contents/MacOS/Openscreen` executable explicitly. Do not infer the CLI schema from a newer documentation page; check its installed help when changing versions.

Write a JSON plan covering the source's full measured duration in seconds:

```json
[
  {"start":0,"end":6,"speed":2,"caption":"Submit the export request"},
  {"start":6,"end":26,"speed":10,"caption":"Waiting for generation"},
  {"start":26,"end":34,"speed":1,"caption":"All three download controls appear",
   "focus":{"x":0.6,"y":0.65,"zoom":1.4}},
  {"start":34,"end":40,"speed":2,"caption":"Reload: the files remain available"}
]
```

Replace every example time and coordinate with observed values. Focus coordinates are normalized against the unedited source window, not its page viewport. For screenshots, inspect `frames.ndjson` and the final capture time before authoring the plan; the helper assembles a 10fps timestamped source and reports the actual capture FPS separately. Small frame changes/popups are padded rather than stretched.

From this skill directory, render into a new output directory:

```bash
uv run --script scripts/render-video.py --frames <capture-directory> --output <new-edit-directory> --plan <plan.json> --clicks <browser-run/clicks.ndjson> --openscreen <Openscreen-binary> --speed-labels
```

For a native silent recording, replace `--frames` with `--source <original.mp4>`; supply `--capture-start-ms <wall-clock-origin>` when passing click telemetry. Omit `--clicks` when no synchronized coordinates are available. The helper preserves input media, creates an aspect-correct 1920×1080 source with click highlights, writes an editable `.openscreen` project, renders its smooth zooms/captions/speeds, and produces `review.mp4`, `mapping.json` and `transcript.srt`. The original is retained until successful review and cleanup. Audio-bearing source is rejected so it cannot be silently lost; use an explicitly audio-aware edit path for that case.

The OpenScreen CLI is launched without inherited `ELECTRON_RUN_AS_NODE`. Framing is normalized before rendering to avoid stretching non-16:9 browser windows. All encoding is local; the helper invokes no model. Agent planning/review tokens are separate.

## Inspect and hand off

The helper limits FFmpeg decoder, filter and encoder worker pools to two threads each to reduce CPU contention during video preparation. Processing can take longer; the existing compression quality, output frame rate and delivery format are preserved. These limits do not constrain OpenScreen's internal worker pools.

The helper checks duration against the plan and decodes the whole MP4. Before delivery, inspect representative frames around zoom-in/out transitions, click highlights, every important result, errors and the end. Verify circular geometry, caption readability, source-to-output timing and that crops retain the evidence. Encoding success is not visual approval.

Compare the intended action with its visible state and independent assertions. Confirm the actual player can seek when available. Deliver the reviewed `review.mp4` and a small `report.md`. Transfer essential assertions, timing/capture limits and the final video hash into the report, then follow [evidence cleanup](evidence.md). The renderer intentionally keeps working files until the agent completes visual review; encoding success alone must not trigger deletion. Report capture limitations such as low FPS or transient popup capture; a 60fps export does not upgrade a 5fps source into native 60fps capture.

## Enforced local editing on macOS

`render-video.py` now re-executes itself through `offline-exec.py` before processing media. The macOS sandbox denies all network operations for the render process and its descendants, including OpenScreen and FFmpeg. The launcher verifies denial and removes inherited credentials from the environment. It fails instead of falling back to unrestricted rendering. Install dependencies separately before the offline run. Keep AI-provider features disabled and use local assets.

OpenScreen 1.11.0 needs `--no-sandbox` under this outer sandbox because Electron cannot initialize its nested sandbox. The outer network-denial policy remains active. This is network isolation for trusted local verification media, not a filesystem sandbox or a general untrusted-project viewer. Opening the app outside this helper does not inherit these restrictions. The approved agent/model connection is separate.
