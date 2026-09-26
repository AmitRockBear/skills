---
name: measure-change
description: Use when the user explicitly asks to measure or compare a change in performance, resource use or another observable metric.
disable-model-invocation: true
---

Inputs are the reported problem, target workflow, requested metric and authorized scope. Output is a reproducible before/after comparison with correctness checks, tradeoffs and limits, saved in the existing task report or configured outputs directory.

1. Reproduce the complaint with a representative, bounded workload. Record the metric, units, command, relevant environment, revision and correctness criteria; separate suspected causes from observed facts.
2. Establish a baseline and repeat measurements enough to expose ordinary variation. Keep inputs and relevant conditions comparable; report sample count and variation rather than presenting a single noisy run as proof.
3. Investigate one hypothesis at a time. For diagnosis-only requests, report the evidence and proposed next step. When fixing is authorized, make the smallest justified change in the assigned isolated worktree and repeat the same workload and correctness checks.
4. Compare the result with the baseline, including quality, latency, resource use or other relevant tradeoffs. Keep a change only when evidence supports the requested outcome; revert only this task's unsuccessful changes while preserving unrelated work. Treat inconclusive results as inconclusive and explain the next useful experiment.
5. Use [verify-change](../verify-change/SKILL.md) when verifying an implemented change; pass the accepted behavior, tested revisions, workload and collected evidence so it can reuse valid proof. Follow its runtime ownership and explicit UI-authorization rules. Bound local resource use and preserve unrelated processes.
6. Save the reproducible commands, workload, before/after observations, correctness results, tested revisions and limits. Stop when the requested outcome is established or further progress needs a concrete missing input; propose the next step rather than running an unbounded optimization loop.

## Example

"Use measure-change to reduce recording CPU usage while preserving readable output. Compare the same recording workload before and after."

Record CPU usage and output-quality checks on the baseline, test one justified encoding change, then repeat the workload and inspect the resulting artifact. Report any quality or file-size tradeoff; a plausible encoding explanation alone is not an improvement measurement.
