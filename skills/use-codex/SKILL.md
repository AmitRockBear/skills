---
name: use-codex
description: Use when the user asks to use Codex, GPT, Sol, Luna or Astra.
---

1. Resolve the model: `gpt-6-sol`, `gpt-6-luna` or `gpt-6-astra` according to the request; default to Astra. Use the requested effort (`low`, `medium`, `high`, `xhigh`, `max`), default `medium` for the all models. Select the assigned worktree for implementation or repository for read-only work; run with full access using `--dangerously-bypass-approvals-and-sandbox` on every invocation; keep the requested edit scope in the prompt.
2. Check available disk space on the task output volume using the operating system’s disk-usage tool or Python’s `shutil.disk_usage`. If less than 10 GiB is free, notify the user before starting and leave deletion decisions to them. Session logs under `~/.codex/sessions` can be large; inspect before attributing disk use.
3. Fill every placeholder below. Write a self-contained prompt with the goal, success criteria, context, assigned paths, read-only/edit scope, constraints, verification and expected output. Tell Codex to preserve unrelated changes and include existing authorization for commits, pushes, deployment or global configuration changes; those actions require explicit authorization. Codex does not inherit Claude’s context.

```bash
CODEX_TASK_DIR="<absolute task output directory>"
CODEX_WORK_DIR="<assigned worktree or repository>"
mkdir -p "$CODEX_TASK_DIR"
CODEX_RUN_DIR="$(mktemp -d "$CODEX_TASK_DIR/codex.XXXXXX")"
CODEX_ARTIFACT_DIR="$CODEX_RUN_DIR/artifacts"
CODEX_REPORT="$CODEX_RUN_DIR/report.md"
CODEX_RUNLOG="$CODEX_RUN_DIR/run.log"
CODEX_PROMPT="$CODEX_RUN_DIR/prompt.txt"
mkdir -p "$CODEX_ARTIFACT_DIR"
cat > "$CODEX_PROMPT" <<'PROMPT'
<Complete task prompt, including scope, constraints and expected output.>
Return your final report in the final response; the caller saves it.
PROMPT
codex exec --skip-git-repo-check \
  -m "<codex_model>" \
  -c 'model_reasoning_effort="<codex_effort>"' \
  -C "$CODEX_WORK_DIR" \
  --add-dir "$CODEX_ARTIFACT_DIR" \
  --dangerously-bypass-approvals-and-sandbox \
  -o "$CODEX_REPORT" \
  - < "$CODEX_PROMPT" > "$CODEX_RUNLOG" 2>&1
```

Use the requested output directory, otherwise `./outputs/<task>`. Let `-o` write the final report. For authorized artifact creation, put the resolved `$CODEX_ARTIFACT_DIR` path in the prompt; read-only reviewers return findings in their final response.

4. Start the command through Bash `run_in_background: true` or an equivalent harness-owned process session. Keep its task handle/PID and wait for completion before returning; continue independent work meanwhile. Use only that handle for monitoring or stopping the run. Capture stderr and inspect the report and log as well as exit status. For a missing report, read [troubleshooting](references/troubleshooting.md) with the owned process status and log to identify a supported cause or report uncertainty.
5. Validate review findings against the source and verify implementations with proportionate checks. Report the outcome and material limits.

## Claude workflow wrapper

Use a thin Claude wrapper when delegating Codex through Claude’s subagent tools: `model: 'sonnet', effort: 'low'`. Give it the self-contained task, assigned worktree, edit scope and unique run paths. Its job is to run Codex and return the completed report; it must retain the background task until completion. Label it `<codex_model>(<codex_effort>):<task>` and request structured report/status output through the harness schema when available. Reuse the user’s requested model restrictions when choosing the wrapper.
