# When a run gives no report

Read `$CODEX_RUNLOG` before you report a failure. The cause is in the last lines, not in the exit
code, because codex can exit 0 after it fails. Look for:

- `No space left on device (os error 28)` — the disk is full. Report it to the user. Flag
  runs, retries, and model changes do not help.
- `failed to load models cache: missing field ...` — the models cache is stale against the
  installed build. Run codex with a `CODEX_HOME` that symlinks every entry of `~/.codex`
  except `models_cache.json`.
- If the log stops without an explanation, inspect the owned process status. Report the cause as unknown when evidence is insufficient.

Report the log line to the user. Do not guess a cause. A small smoke test that passes proves
only that codex starts; it does not prove that a long run can complete.
