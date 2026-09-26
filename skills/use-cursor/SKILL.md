---
name: use-cursor
description: Use when the user asks to run a model fable-5-1 or opus-5-5 through Cursor, Grok, including follow-ups to an existing Cursor task.
---

1. Default to Grok 4.7 at `high` effort; for Fable 5.1 default to `medium`; for Opus 5.5 default to `high`. Honor requested effort using the regular slugs below. Confirm the resolved slug with `cursor-agent models`; if unavailable, report it and ask for an alternative. Use the assigned worktree for implementation or repository for read-only work.

   | Model | Regular CLI slug | Supported effort |
   | --- | --- | --- |
   | Grok 4.7 (default) | `cursor-grok-4.7-<effort>` | `low`, `medium`, `high`, `xhigh` |
   | Fable 5.1 | `claude-fable-5-1-<effort>` | `low`, `medium`, `high`, `xhigh`, `max` |
   | Opus 5.5 | `claude-opus-5-5-<effort>` | `low`, `medium`, `high`, `xhigh`, `max` |

2. Keep one Cursor chat per task. Resume its recorded session ID for follow-ups; start fresh for unrelated work or when requested. Run one turn at a time per chat. In a task-local `session.json`, retain the session ID, working directory, model slug, authorized scope, and latest run directory, process handle and status. Include this record's path in continuation summaries.
3. For the first turn, supply a self-contained goal, success criteria, context, assigned paths, edit scope, constraints, verification and expected output. Cursor receives the supplied prompt, not the parent's conversation. For follow-ups, supply the new request, decisions and changes since the previous turn, and ask Cursor to inspect current source where relevant. Carry forward authorization and preserve unrelated changes; commits, pushes, deployment and global configuration changes require explicit user authorization.
4. Run the command below through a harness-owned background task or process session. Record its handle immediately, monitor that handle and wait for completion while doing independent work. Save the emitted `session_id` into `session.json`. Use the owned handle for status or cancellation; after cancellation, inspect any edits before continuing. Each turn gets separate logs and a report.
5. Inspect exit status, events and stderr together. Save the final `result` event's `result` text as `report.md`; check for errors, denied tools and incomplete work before declaring success. Diagnose missing results from the logs and process status, stating uncertainty when needed. If Cursor requires a data-policy acknowledgment, report the requirement for the user to resolve in Cursor. Validate findings against source and verify implementations proportionately. Return the outcome, material limits, report path and session ID.
6. For interactive handoff, wait for the active turn to stop, then provide `cursor-agent --force --sandbox disabled --workspace <working-directory> --model <resolved-slug> --resume <session-id>`.

## Command

Fill every placeholder. Use the requested output directory, otherwise `./outputs/<task>`. Keep the task directory across follow-ups and create a new run directory each turn. Set `CURSOR_SESSION_ID` to the recorded ID when resuming, or an empty string for a fresh task. Run with full access using `--force --sandbox disabled` on every turn; keep the requested edit scope in the prompt. Cursor still honors explicitly denied commands; report any that block required work.

```bash
CURSOR_TASK_DIR="<absolute task output directory>"
CURSOR_WORK_DIR="<assigned worktree or repository>"
CURSOR_MODEL="<resolved regular model slug>"
CURSOR_SESSION_ID=""
mkdir -p "$CURSOR_TASK_DIR"
CURSOR_RUN_DIR="$(mktemp -d "$CURSOR_TASK_DIR/cursor.XXXXXX")"
cat > "$CURSOR_RUN_DIR/prompt.txt" <<'PROMPT'
<Initial task context or follow-up request, including current scope and expected output.>
Return your final findings or implementation report in the final response.
PROMPT
CURSOR_ARGS=(-p --model "$CURSOR_MODEL" --workspace "$CURSOR_WORK_DIR"
  --output-format stream-json --force --sandbox disabled)
if [ -n "$CURSOR_SESSION_ID" ]; then
  CURSOR_ARGS+=(--resume "$CURSOR_SESSION_ID")
fi
cursor-agent "${CURSOR_ARGS[@]}" < "$CURSOR_RUN_DIR/prompt.txt" \
  > "$CURSOR_RUN_DIR/events.jsonl" 2> "$CURSOR_RUN_DIR/stderr.log"
```

For a known, authorized workspace that requires a trust prompt, add `--trust`. The saved session ID identifies the conversation; the process handle identifies only the current run.

Example: “Ask Grok to investigate the timeout” starts a chat with `cursor-grok-4.7-high`. “Have it check the retry hypothesis” resumes that ID with new evidence. “Use Fable through Cursor at medium effort” selects `claude-fable-5-1-medium`.
