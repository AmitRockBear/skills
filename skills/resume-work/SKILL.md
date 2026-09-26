---
name: resume-work
description: Use when the user explicitly asks to resume or hand off an existing task across sessions or agent hosts.
disable-model-invocation: true
---

Inputs are the task identifier and available handoff, task report, session reference or PR. Output is one current task record and, for a resume request, continuation of authorized pending work.

1. Read the supplied handoff and latest accepted requirements. If information is missing, search only relevant ~/.codex/ or ~/.claude/ sessions for that task; distinguish user decisions from agent proposals.
2. Reconcile the goal, scope, accepted decisions and permissions with the actual worktree, branch, base/head revisions, PR state and current files. Preserve rejected approaches only when their rationale prevents repetition. Resolve routine discrepancies through inspection and ask only about consequential unresolved conflicts.
3. Update the existing handoff or task report with the goal, accepted constraints, completed work, tested and assessed revisions, evidence links, unresolved work and the exact next action. If none exists, create one task record under the configured outputs directory. For a stack, include each PR's link, base/head, readiness and next action.
4. Reference existing host-session metadata and task-owned resource handles when available; check that a resource still belongs to this task before using it. Preserve other tasks' work and resources.
5. For handoff-only requests, return the record and a self-contained continuation prompt. For resume requests, continue authorized pending work using the applicable existing skills; reuse unaffected evidence with a reason and repeat changed or uncertain checks. Require explicit authorization for actions such as merge that already require it.
