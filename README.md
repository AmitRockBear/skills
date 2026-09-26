# Skills

The skills I use to plan changes, write code, review PRs, and check that the result works. I prefer simple solutions, focused changes, and evidence I can inspect.

Each folder has a `SKILL.md` with the instructions, plus any scripts and references it needs. Use the ones that fit how you work.

## Skills

| Skill | What it does | Example request |
| --- | --- | --- |
| [babysit-pr](skills/babysit-pr/SKILL.md) | Watches CI and reviews, checks findings against the code, and fixes issues within the agreed scope. | "Watch this PR until reviews and CI settle." |
| [boundary-discipline](skills/boundary-discipline/SKILL.md) | Checks where data enters the system and where validation belongs. | "Review where this service validates input." |
| [council](skills/council/SKILL.md) | Asks different model families to review a decision, then compares their reasoning. | "Get a council review of this design." |
| [create-pr](skills/create-pr/SKILL.md) | Opens a PR that explains the problem, the change, and how it was verified. | "Open a PR for this change." |
| [explainer-video](skills/explainer-video/SKILL.md) | Turns a subject or document into an animated video with narration. | "Explain this architecture in a five-minute video." |
| [grilling](skills/grilling/SKILL.md) | Asks focused questions to resolve a design before implementation. | "Grill me on this feature plan." |
| [html-communication](skills/html-communication/SKILL.md) | Writes HTML reports, comparisons, plans, and mocks. | "Present these findings as an HTML report." |
| [measure-change](skills/measure-change/SKILL.md) | Compares a change against a baseline and reports the measurements. | "Measure whether this optimization helps." |
| [pr-clean-code-review](skills/pr-clean-code-review/SKILL.md) | Looks for unnecessary complexity, duplication, and unclear contracts. | "Review this PR for unnecessary complexity." |
| [pr-spec-review](skills/pr-spec-review/SKILL.md) | Checks whether a PR meets the requirements. | "Does this PR satisfy the issue?" |
| [pr-walkthrough](skills/pr-walkthrough/SKILL.md) | Explains what a PR changes through concrete before-and-after examples. | "Walk me through this PR." |
| [resume-work](skills/resume-work/SKILL.md) | Recovers the decisions and current state of an interrupted task. | "Resume this interrupted task." |
| [review-loop](skills/review-loop/SKILL.md) | Runs spec and code reviews, handles findings, and monitors the PR. | "Run a review loop on this PR." |
| [type-system-discipline](skills/type-system-discipline/SKILL.md) | Uses types to represent valid states and make invalid ones harder to construct. | "Review this domain model." |
| [typescript-best-practices](skills/typescript-best-practices/SKILL.md) | Guides TypeScript inference, runtime validation, and type design. | "Apply these rules to this TypeScript change." |
| [use-claude](skills/use-claude/SKILL.md) | Runs tasks through Claude CLI and resumes the same session for follow-ups. | "Ask Claude to review this implementation." |
| [use-codex](skills/use-codex/SKILL.md) | Runs tasks through Codex CLI and keeps the reports and session context. | "Have Codex investigate this failure." |
| [use-cursor](skills/use-cursor/SKILL.md) | Runs tasks through Cursor CLI with the requested model and a resumable session. | "Ask Cursor for a second opinion." |
| [verify-change](skills/verify-change/SKILL.md) | Exercises the running API, worker, CLI, or requested browser flow and records the results. | "Verify this change and record the browser flow." |
| [write-skill](skills/write-skill/SKILL.md) | Turns a workflow into a skill with concise instructions and supporting references. | "Turn this workflow into a reusable skill." |

## Examples

### Explainer video

[![AI agent clouds compared](examples/explainer-video/poster.jpg)](examples/explainer-video/ai-agent-clouds-compared.mp4)

[Watch the full explainer](examples/explainer-video/ai-agent-clouds-compared.mp4). It runs for about 23 minutes. The repository copy is 720p to keep the file size down; the original is 1080p. The [scene sources and briefs](skills/explainer-video/examples/agent-clouds-compared/) are included.

This shows what the skill produces. Product details reflect the date in the video and may have changed.

### Verify change

[![TodoMVC verification demo](examples/verify-change/poster.jpg)](examples/verify-change/review.mp4)

[Watch the 18-second demo](examples/verify-change/review.mp4). The agent creates a task, completes it, and checks the filters on TodoMVC. No application code changed in this example. Persistence after navigation was not verified. The [report](examples/verify-change/report.md) records the observations and limits.

Download the MP4 if your viewer cannot play it inline.

### Why edit the recording?

I want to see what the agent did without sitting through every loading screen. The skill speeds up waits, zooms in on relevant controls, and adds captions that explain each step. It adds click highlights when it has measured click coordinates.

The edit keeps the source footage in order, including errors. Speed labels show which sections were accelerated. A timing map connects the edit to the original recording.

`transcript.srt` contains the timed step captions so you can read them or load them as subtitles. It does not transcribe speech. The captions describe observed results, and the report calls out anything the agent could not verify. See the [video workflow](skills/verify-change/references/video.md).

### Keep the agent out of your way

I want to keep working while the agent verifies a change on the same computer. Browser automation can steal focus while I'm typing, move the pointer, or type into my active document.

The [macOS virtual-display setup](skills/verify-change/references/local-display-test.md) puts the test browser on another display. The agent uses accessibility controls directed at its own browser window and checks whether my foreground app and pointer stay unchanged.

The virtual display still shares the computer's input session. It does not provide a separate keyboard and mouse. Opening an extension panel can briefly take focus. If controls keep interrupting the user, the skill tells the agent to report that and use an available separate desktop session or VM for those steps.

## Use

Copy the skill folders you want into your agent's skills directory. Keep their scripts and references with them. Related skills need to stay in sibling folders so their links work.

- `review-loop` uses both PR review skills, `babysit-pr`, and `html-communication`.
- `council` uses the CLI wrappers.
- `verify-change` references `create-pr`.
- The TypeScript skills reference the principle skills.

Read the instructions before enabling a skill. Give the agent your project's setup, authentication, fixtures, output directory, and permission rules. The CLI wrappers default to full access. Browser verification runs only when requested.

## Requirements

Most of the skills are Markdown instructions. PR workflows need Git and an authenticated GitHub CLI. The model wrappers need their respective CLIs and access to the selected models.

`explainer-video` uses Bash, Node.js, Python, FFmpeg, Playwright with Chromium, and Kokoro narration. Its setup script downloads the dependencies and voice assets. Cache and configuration paths have environment-variable overrides. The scripts use Bash; native Windows support is untested.

`verify-change` uses native computer-use controls, Playwright for browser setup and telemetry, a virtual display, and OpenScreen for editing. Python, Pillow, and FFmpeg support the recording workflow. The bundled renderer requires macOS, its network-denial sandbox, and a supplied OpenScreen executable. API and CLI checks do not need a virtual display. Agents must follow their host's tool-selection rules.

## License and credits

Original skills and scripts use [MIT](LICENSE). Third-party notices and exclusions are listed in [LICENSING.md](LICENSING.md). The `babysit-pr` wording still has an unresolved upstream license and remains outside the root MIT grant.

`grilling` is adapted from Matt Pocock's skills. `boundary-discipline`, `type-system-discipline`, and `typescript-best-practices` are adapted from Lauren Tan's pstack. Their folders retain the upstream MIT licenses and source references.

`babysit-pr` and `html-communication` are inspired by Theo's own skills shared in his t3.gg livestreams.

The default presenter is included under MIT. Example videos and posters are excluded.
