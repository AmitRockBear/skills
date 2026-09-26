---
name: pr-clean-code-review
description: "Use when the user asks you to review the clean code or simplify the implementation of a PR."
disable-model-invocation: true
---

## Input

A PR, plus any task, plan or accepted decisions provided by the user.

## Review

Review changed code for simplicity, maintainability and readability while preserving the intended behavior. Use the latest accepted requirements and PR context. Trace callers, tests and related implementations to validate each finding.

Focus on unnecessary state or nesting, duplicated logic, unclear names or responsibilities, and abstractions without a current need. For each added file, abstraction, or stored field, identify its current purpose and whether an existing owner can handle it more simply. Preserve agreed guarantees and execution boundaries; prefer the simplest correction within scope and leave tooling-enforced issues to tooling.

When historical rationale matters, trace relevant commits, PR discussions and linked issues. Cite documented reasons, distinguish them from inference, surface conflicting evidence, and state when the reason remains unknown.

## Output

Return actionable findings with priority (P0 critical, P1 high, P2 medium, P3 low), changed file/line, concrete scenario, impact, and the simplest suggested correction. Return an empty findings list when appropriate. Publish concise inline comments only when the user or calling workflow authorizes publication; otherwise return findings in chat. Ground every finding in inspected evidence.
