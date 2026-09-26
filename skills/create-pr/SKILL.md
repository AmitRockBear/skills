---
name: create-pr
description: Use when the user asks to file, open, or create a PR.
---

# Create PR

Before filing, check whether a PR for this branch already exists. Review the diff locally against the intended PR base (the parent branch for a stack, normally `origin/main` otherwise) to make sure its contents match the goal.

## PR title

- If during the conversation an issue or ticket ID was mentioned, use the following prefix in the PR title: `<ticket_id>: ` (e.g. `TASK-1234: `)
- Prefer a concise, human-readable title that explains why the change matters.

BAD

> ❌ negotiate permessage-deflate on the websocket

GOOD

> ✅ TASK-1234: cut websocket frame size by 70%+ with gzipping

## PR description

- Open the description with a simple explanation of the problem based on the user's original prompt, then briefly explain the solution. Do not lead with an implementation inventory. Then, have in bold `Changes:` and then a list of bullet points that describe the changes made in the PR on a high level (dont mention the files or lines that were changed, nor that tests were added or modified).
- Add **Validation:** with brief live UI/API checks and outcomes, followed by `**Before:**` / `**After:**` evidence: uploaded images/videos, or a short fenced API/server log proving the behavior. Use `None` for missing checks or evidence. Tests/lint do not count as evidence.
- Document deployment dependencies using the repository’s convention, with links to the prerequisite pull requests.
- Add a blurb to the end of the PR description about what model is making the changes.

### Example

Save the description as `body.md`. Pass each referenced local image/video path as `--attach`; `gh` replaces it with a hosted URL. Verify the published body contains hosted evidence URLs, or report the upload failure.

````md
Refreshing a thread hid its running indicator. The list now preserves live status after refresh.

**Changes:**
- Include the current running state in thread summaries

**Validation:**
- UI: refreshed a running thread; indicator stayed visible.
- API: fetched thread summaries; running state was present.

**Before:** None

**After:**

![](./refresh.mp4)

```text
GET /threads → 200
{"id":"thread-123","sidebarIndicator":"running"}
```

Made with <model>.
````

### Create/Edit a PR

To create a PR from the directory containing `body.md` and `refresh.mp4`, run:

```bash
gh pr create --title "Preserve running status after refresh" --base "<base>" --head "<branch>" --body-file body.md --attach ./refresh.mp4
gh pr view "<PR URL>" --json body --jq .body
```

For an existing PR, use `gh pr edit "<PR URL>" --body-file body.md --attach ./refresh.mp4` with its updated body.

Open a real PR rather than a draft so review bots run. If the user also asked to babysit it, continue with the `babysit-pr` skill.
