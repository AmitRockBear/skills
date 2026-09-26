# Background browser on macOS

Use this macOS integration by default for ordinary pages and real extension sidebars when its dependencies are installed. Follow the host’s tool-selection rules; report unavailable dependencies or isolation limits. A virtual display hides the window; native accessibility controls provide ordinary page, browser chrome and extension-sidebar interaction. This is not a separate macOS input session.

## Start

1. Create a private task directory in the configured task output directory. Record the current foreground app, display IDs/bounds and pointer position. Preserve existing displays and browser sessions. Select the pinned Chromium app and a fresh task profile. Confirm native computer-use controls can identify this owned app/window unambiguously.
2. Select a locally installed SimpleDisplay build whose source and version you have reviewed; the original integration used v1.6.6, commit `ea8fb24193d297ae3a8171525d23dfef7e537e1a`. Supply its app path explicitly. Launch its binary through `python3 scripts/offline-exec.py <SimpleDisplay.app/Contents/MacOS/SimpleDisplay>` and retain its PID. This helper requires macOS and refuses unrestricted fallback. If another instance makes ownership ambiguous, resolve that before creating a display.
3. Send `open -g -a <SimpleDisplay.app> 'simpledisplay://create?width=1920&height=1080&name=<unique-run-name>&hidpi=true'` only to that already-running, sandboxed process. Read the resulting display ID and actual bounds. The tested mode has 1920×1080 logical points and 3840×2160 backing pixels. Keep recording coordinates in the correct scale.
4. Launch with `open -g -n -a <Chromium.app> --args --user-data-dir=<fresh-profile> --no-first-run --no-default-browser-check --window-position=<x>,<y> --window-size=1440,900 <assigned-local-url>`, choosing a position wholly within the new display. For an extension, add `--disable-extensions-except=<unpacked-build>` and `--load-extension=<unpacked-build>`. For multiple required extensions, use comma-separated absolute paths. Ordinary Playwright launch previously took focus; use this background LaunchServices entry point instead.
5. Record the exact browser PID, profile, executable/version, window title and bounds in `<browser-run>/browser.json`. Confirm the window is on the owned display. Direct launch does not run `browser-session.py` or automatically produce its telemetry/download manifests. If a Playwright connection is needed, add a loopback-only debugging port at launch, attach only to that owned instance, and verify saved download bytes and observer installation explicitly.

## Check focus and drive

Record foreground application transitions with timestamps and action phases through a read-only macOS probe during the check. Check both foreground app and pointer before and after each action; a final snapshot alone can miss a transient switch.

Open the real extension panel when required. Opening the extension menu may bring Chromium forward; this brief opening interruption is accepted for this workflow. After opening, restore the previously foreground application once, provided the user has not switched elsewhere in the meantime. Keep the sidebar open for the run.

With the other application foreground, use the active native computer-use accessibility controls to click a harmless panel control, type into a safe field, exercise a needed keyboard shortcut, and inspect the resulting panel state. Confirm both successful input and preserved foreground focus. Repeat after reopening the panel. Use the same native focus check for ordinary page controls. Treat focus inside Chromium's accessibility tree separately from macOS foreground-app focus.

For ordinary pages and extension sidebars, prefer the tested accessibility click/setValue/typeText/pressKey path. Physical-coordinate mouse input may move the shared pointer or activate the browser; test it separately before relying on it. If ongoing controls repeatedly steal focus, report the failed isolation check and use an available isolated runtime for those steps; do not describe the run as non-interrupting.

Authenticate with capture off, then record the owned browser window including its real sidebar using [capture](capture.md). Log measured full-window click targets and add noticeable click highlights in the edited video; accessibility actions need not move the physical cursor. Continue with the existing captions, intent-based speeds, zooms, local offline rendering and evidence workflow.

## Clean up

Stop the owned recorder and browser, retain evidence/downloads, and delete the ephemeral profile. Send `open -g -a <SimpleDisplay.app> 'simpledisplay://remove?name=<unique-run-name>'` to the owned running process, then stop that process. Verify the original display topology remains. Preserve other apps and displays; install no login item or global service.

## Limits

Virtual displays share the operating system’s input session. Check foreground focus and pointer behavior on the actual machine; a hidden window alone does not prove isolation. Report capture and sampling limits.
