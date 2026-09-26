---
name: babysit-pr
description: Use when the user asks to monitor, watch, subscribe or babysit a PR.
---

# Babysit PR

Monitor the repository’s configured CI and reviewers; validate automated findings against the current code.

If your harness offers tools to monitor a PR, use them so you can respond when comments arrive. Otherwise, poll the PR for new comments and checks.

Track unresolved findings across pushes and re-read updated review-summary comments. Evaluate findings against the current code and check CI/review completion for the latest head. Verify every bot finding against the source before changing code. Fix real findings and CI failures, distinguish repository failures from infrastructure flakes, reply with a written reason for every comment worth addressing or that you decided to dismiss, and resolve the comment.

If the PR has a "Codex Review Summary" comment, keep babysitting until the "Code Review" and "Security Review" rows, when present, each show ✅ **Completed** for the current head. If the "Security Review" row is completed with no findings listed and "Codex Security Review Gate" CI failed, rerun that CI check.

If the PR has conflicts with the base branch, rebase when needed. If an overlapping PR makes this one obsolete, stop monitoring, report it to the user, and ask before closing the PR unless closure was explicitly authorized.

Format comments left on the user's behalf as:

```md
**[MODEL-SLUG] RESPONDING ON BEHALF OF [USER]**
[actual reply]
```

For each review comment, check:
- Is it valid and necessary for the user's original PR goal, or would addressing it introduce scope creep?
- Does its benefit justify the added complexity?
- Does this protect an agreed behavior through a small, concrete fix?

Carry forward accepted scope, tradeoffs and reasoned dismissals; reopen decisions when new evidence changes their consequences.

Address worthwhile issues. Dismiss low-value suggestions and edge cases that do not justify their complexity. Resolve routine uncertainty through inspection. Ask about findings requiring a material product or scope decision.

When reviews stop producing worthwhile findings, report diminishing returns. Continue resolving clearly actionable findings within scope.

Babysit stacked PRs one at a time, from the root PR upward. Once a PR meets the completion criteria, update the next PR onto its current parent if needed, then babysit it. Rebase descendants only when their turn begins. If an earlier PR changes again, finish it before continuing upward.

Stay quiet while nothing changes. Run focused checks during fixes. Once bots and required CI are green on the latest commit for 15 minutes, you can stop babysitting the PR. Write to the user a bullet point list of all the comments that were addressed, dismissed, include a simple explanation for each, include examples when the comment is relatively complex, group the bullet point list by the review round.

Merge only when explicitly authorized by the user; babysitting alone does not authorize merging.

Start additional review rounds or browser verification only when the user requests them.
