# Evidence and delivery

## Local evidence

Use a unique task directory in the configured task output directory (default `./outputs/<task>`). Keep a concise `report.md` with status, expected/observed behavior, tested and assessed revisions, fresh/reused/untested checks, baseline availability and limits. Record the reason for reused proof. Missing runtime proof means partial verification or a blocker.

Include exact, sanitized request/response, job/trace or command/output excerpts that prove the behavior, including relevant persistence, file contents and errors. Retain separate result files only when needed to substantiate the outcome. Record relevant identity/routing, fixtures and feature gates. For reviewed media, include hashes, capture/output durations and FPS, and timing or capture limits. Presentation alone does not establish correctness.

If token accounting is requested, use recorded counters, deduplicate cumulative totals, separate agent and application-model usage, and label missing data. Rendering is not a model call.

## PR comment

When publication is authorized, follow the **Validation:** format in [create-pr](../../create-pr/SKILL.md), extended to API, worker and CLI checks: short live checks and outcomes, then `Before:` / `After:` with images/videos or a short fenced log/trace. Use `None` for missing checks or evidence. Mention tests/lint only when requested; they do not replace runtime proof. Include tested revisions and material limits when needed to interpret the evidence.

Post one new comment per verification run, preserving the PR description and earlier comments:

```bash
gh pr comment <pr-url> --body-file <comment.md> --attach <review.mp4>
```

Write the comment under the task output directory. Reference local media in standalone `![](<path>)` paragraphs; repeat `--attach` for each image/video so `gh` rewrites the references to hosted URLs. Omit `--attach` for text-only evidence. Inspect and redact before sharing. Read back the comment to confirm text and attachments, and save its URL in `report.md`. Reconcile uncertain or partial publication before retrying to avoid duplicates; report delivery failures separately from verification.

### Example comment

````md
**Validation:**
- UI: refreshed the task; completed status remained visible.
- Worker: processed the task; stored the expected result.

Before: None

After:

![](/path/to/review.mp4)

```text
worker task-123 → completed
GET /tasks/task-123 → 200 {"status":"completed"}
```
````

## Retention and cleanup

Keep `report.md` plus reviewed videos/images for UI runs; API/worker/CLI runs need only the report with proof excerpts and any essential result files. Mixed runs keep both. Preserve requested artifacts and user-provided inputs.

After verification, evidence review and any requested publication succeed, summarize essential proof in the report, then delete only this run's intermediates: raw recordings, frames, temporary encodes, edit plans/projects, maps, transcripts, telemetry and raw logs. For videos, require full decoding and visual review before cleanup; record that original footage was deleted and original-timing inspection or re-editing requires a rerun. Verify retained files remain readable and media hashes match.

Retain working evidence on failure or interruption. Regardless of outcome, stop owned capture/browser/runtime processes, release owned sandboxes and slots, restore local gates and remove ephemeral credentials. Preserve shared services, user browser sessions, reusable tools/caches and other runs. Report cleanup failures.
