---
name: pr-spec-review
description: "Use when the user asks you to review the implementation of a task."
disable-model-invocation: true
---

## Input

One or more PRs, plus any task, plan or accepted decisions provided by the user.

## Review

Read the PR description and any linked issues or requirements, including their acceptance criteria, and review against both. Use the latest user-approved requirements when descriptions conflict; identify unresolved contradictions. If a linked issue cannot be read, state the resulting review limit.

Reconstruct the changed behavior through callers, contracts, tests and related implementations. Validate findings against that context. Look for claimed behavior implemented incorrectly, gaps preventing the stated outcome, and changes outside the agreed scope. Consider simpler approaches when they resolve a requirement gap.

When historical rationale matters, trace relevant commits, PR discussions and linked issues. Cite documented reasons, distinguish them from inference, surface conflicting evidence, and state when the reason remains unknown.

## Output

Return actionable findings with priority (P0 critical, P1 high, P2 medium, P3 low), changed file/line, concrete scenario, impact, and the simplest suggested correction. Return an empty findings list when appropriate. Publish concise inline comments only when the user or calling workflow authorizes publication; otherwise return findings in chat. Ground every finding in inspected evidence.
