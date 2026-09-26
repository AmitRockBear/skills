# Browser verification example

Recorded on 2026-09-26 at [TodoMVC React](https://todomvc.com/examples/react/dist/). This is a demonstration against an existing public website, with no implementation or base/head comparison.

| Check | Observation | Result |
| --- | --- | --- |
| Create task | “Review the verification demo” appeared; one item remained. | Verified |
| Complete task | Completed styling appeared and count changed to zero. | Verified |
| Active filter | Completed task disappeared from the active list. | Verified |
| Completed filter | Task appeared briefly before navigation. | Observed; too brief for strong video evidence |
| Full navigation | Task was absent after navigation. | Persistence unverified |

Browser snapshots supported the visible task and counter assertions. The navigation result does not establish a website defect: browser context/storage behavior was not isolated. Pre-existing host preload diagnostics and an aborted analytics request were not attributed to application code. No login or private data was used.

The silent source was 29.278 seconds; the edited output is 18.333 seconds. The [edit plan](plan.json) preserves source intervals in order, accelerates the first two sections 2×, and leaves the final result at 1×. Captions and zooms are explanatory edits; no synthetic click coordinates were added. Export is 30 fps; source capture cadence is host-controlled, and export rate does not establish source frame rate. This recording does not prove timing, backend persistence, authorization, or a before/after fix.

The output passed full decoding and duration validation. Representative frames were reviewed for readable captions and visible results. Raw recording and edit intermediates remain outside this repository for local review.

- Source SHA-256: `1875dc7beef81248e93f7ab1690e7a9e00eaa08ffa2a7762f4cf20ecb6f5a5c1`
- Output SHA-256: `fcd0c33637c1abd6321e9263bb00b2ba7e1597d23919effcbc403267da9aa4d4`

This historical demonstration was edited with the FFmpeg/Pillow renderer used during repository preparation. The skill now uses its original OpenScreen/macOS editing stack; this example is not an execution test of that restored renderer.
