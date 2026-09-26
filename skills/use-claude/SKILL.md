---
name: use-claude
description: Use when the user asks Claude, Opus or Fable for a task, including follow-ups to an existing Claude task.
---

1. Resolve the model (`claude-fable-5-1` for Fable, `claude-opus-5-5` for Opus or unspecified Claude) and requested effort. When effort is unspecified, default to `high` for all models. Use the assigned worktree for implementation or repository for read-only work. Run with full access using `--dangerously-skip-permissions` on every turn; keep the requested edit scope in the prompt.
2. Keep one Claude session per task. Resume its recorded session ID for follow-ups; start fresh for unrelated work or when requested. Run one turn at a time per session. In a task-local `session.json`, retain the session ID, working directory, model, effort, authorized scope, and latest run directory, process handle and status. Include this record's path in continuation summaries.
3. For the first turn, supply a self-contained goal, success criteria, context, assigned paths, edit scope, constraints, verification and expected output. Claude receives the supplied prompt, not the parent's conversation. For follow-ups, supply the new request, decisions and changes since the previous turn, and ask Claude to inspect current source where relevant. Carry forward authorization and preserve unrelated changes; commits, pushes, deployment and global configuration changes require explicit user authorization.
4. Run the command below through a harness-owned background task or process session. Record its handle immediately, monitor that handle and wait for completion while doing independent work. Save the emitted `session_id` into `session.json`. Use the owned handle for status or cancellation; after cancellation, inspect any edits before continuing. Each turn gets separate logs and a report.
5. Inspect exit status, events and stderr together. Save the final `result` event's `result` text as `report.md`; check `is_error` and any reported permission denials before declaring success. For missing results, diagnose from the logs and process status, stating uncertainty when needed. Validate findings against source and verify implementations proportionately. Return the outcome, material limits, report path and session ID.
6. When the user wants to continue directly in Claude Code, wait for the active turn to stop, then provide `claude --dangerously-skip-permissions --resume <session-id>` from the recorded working directory. This continues the Claude conversation created here.

## Command

Fill every placeholder. Use the requested output directory, otherwise `./outputs/<task>`. Keep the task directory across follow-ups and create a new run directory each turn. Set `CLAUDE_SESSION_ID` to the recorded ID when resuming, or an empty string for a fresh task. Pass the prompt through stdin because `--add-dir` can consume a trailing prompt argument.

```bash
CLAUDE_TASK_DIR="<absolute task output directory>"
CLAUDE_WORK_DIR="<assigned worktree or repository>"
CLAUDE_MODEL="<resolved model>"
CLAUDE_EFFORT="<resolved effort>"
CLAUDE_SESSION_ID=""
mkdir -p "$CLAUDE_TASK_DIR"
CLAUDE_RUN_DIR="$(mktemp -d "$CLAUDE_TASK_DIR/claude.XXXXXX")"
cat > "$CLAUDE_RUN_DIR/prompt.txt" <<'PROMPT'
<Initial task context or follow-up request, including current scope and expected output.>
Return your final findings or implementation report in the final response.
PROMPT
CLAUDE_ARGS=(-p --model "$CLAUDE_MODEL" --effort "$CLAUDE_EFFORT"
  --dangerously-skip-permissions --output-format stream-json --verbose)
if [ -n "$CLAUDE_SESSION_ID" ]; then
  CLAUDE_ARGS+=(--resume "$CLAUDE_SESSION_ID")
fi
CLAUDE_ARGS+=(--add-dir "$CLAUDE_RUN_DIR")
(cd "$CLAUDE_WORK_DIR" && claude "${CLAUDE_ARGS[@]}" \
  < "$CLAUDE_RUN_DIR/prompt.txt" \
  > "$CLAUDE_RUN_DIR/events.jsonl" 2> "$CLAUDE_RUN_DIR/stderr.log")
```

For authorized artifact creation, include the resolved run directory in the prompt; read-only reviewers return findings in their final response. The saved session ID identifies the conversation; the process handle identifies only the current run.

Example: “Ask Fable to investigate the timeout” starts a session. “Have it check the retry hypothesis” resumes that ID with the hypothesis and new evidence. “Now implement the agreed fix” resumes it in the assigned worktree with the updated edit scope.
