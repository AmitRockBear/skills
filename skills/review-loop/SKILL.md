---
name: review-loop
description: "Use when the user asks you to do a review loop for a PR."
disable-model-invocation: true
---

Input: PR URL or number and any accepted requirements.

1. One coordinator owns the review loop, fixes and pushes. Run [babysit-pr](../babysit-pr/SKILL.md) alongside review: provide the PR and agreed scope, track findings through fixes or reasoned dismissals, and keep monitoring through the final review round. Treat its 15-minute completion window as final only after all planned reviews finish.
2. Review spec correctness, then clean code, using [pr-spec-review](../pr-spec-review/SKILL.md) and [pr-clean-code-review](../pr-clean-code-review/SKILL.md). Use the global reviewer model/effort mapping unless the user overrides it, For clean code review, use opus 5 on medium effort. Give each reviewer a task-owned read-only worktree at the recorded PR head, the intended base, requirements, and the skill. Request findings with priority, location, scenario, impact and suggested correction; return findings to the coordinator for validation and disposition.
3. After each review, finish disposition of its findings before selecting the next head. Repeat that review only when validated P0/P1 findings required fixes, up to three iterations per review type. Refresh the review worktree after its reader finishes; remove only clean worktrees owned by this run. Preserve unresolved blockers in the handoff.
4. Read and apply [html-communication](../html-communication/SKILL.md), supplying reviewed heads, finding titles, dispositions and brief dismissal reasons. Maintain one report at `./outputs/<task>/review-loop.html` throughout the loop. Finish with the PR status, remaining blockers and report link. Merge only with explicit user authorization.
