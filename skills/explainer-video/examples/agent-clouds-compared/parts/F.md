# Part F: prefix `f_`. Scenes: ship, bill, scoreboard, pick, quiz3, outro

## ship (CH.ship)
Facts:
- **Vercel:** a preview deployment per git push, instant rollback, rolling releases (gradual rollouts).
- **Cloudflare:** worldwide deploy in seconds with one command, Worker Previews (Sep 2026), Agents tracing (beta).
- **AWS:** AgentCore Observability in CloudWatch (OpenTelemetry traces) and AgentCore Evaluations (LLM-as-judge on traces). Infrastructure is usually defined as code with the CDK.

Visuals:
- L0: `chapterTitle(S, 10, 'Shipping it', 'eye')`.
- L1: Vercel logo. A `git push` makes a branch that becomes a preview-URL card (e.g. `atlas-git-feature.vercel.app`). Then a "rollback" button with a rewind arrow, and a rollout slider moving 10% → 50% → 100%.
- L2: Cloudflare logo. A terminal `npx wrangler deploy` makes pins light up worldwide in a quick wave, with a "Worker Previews" chip. Then an "Agents tracing" step timeline (think → tool → answer) with `badge('beta')`.
- L3: AWS logo. A CloudWatch-style dashboard with trace spans, and an "Evaluations" judge robot grading Atlas's answer (4/5 stars).
- L4: a CDK code-ish card listing construct boxes (Runtime, Gateway, Memory, IAM role) wired together, with the pill "powerful, but more to learn".

## bill (CH.bill)
Facts:
- **Cloudflare:** Workers bill CPU time only; paid plans start at $5/month; R2 downloads (egress) are free.
- **Vercel:** Active CPU plus provisioned memory; free Hobby tier.
- **AWS:** AgentCore bills active CPU and memory per second. Lambda bills the full duration. Extras (memory events, tool calls, logs) each have their own meter.
- **Tokens:** model tokens usually dominate.
- **No numbers** beyond these facts and the illustrative "2 s of 60 s".

Visuals:
- L0: `chapterTitle(S, 11, 'The bill', 'doc')`.
- L1: a 60-second timeline for one trip plan. It is mostly grey "waiting on the model", with orange computing slivers totalling "~2 s".
- L2: Cloudflare logo. A meter that counts only the slivers ("CPU time: ~2 s"), plus pills "from $5 / month" and "R2 downloads: free".
- L3: Vercel logo. A meter counting the slivers plus a thin steady "memory reserved" band, plus a "free Hobby tier" pill.
- L4: AWS logo, two rows:
  - "AgentCore: active CPU & memory, per second" (counts the slivers plus a memory band);
  - "Lambda: the whole 60 s" (the full bar fills, C.red).
  - Then 3–4 small extra meters pop in: memory, tool calls, logs.
- L5: a giant "model tokens" bar towers over three tiny compute bars. Pills pop in: "gateways", "caching", "cheaper models".

## scoreboard (CH.verdict)
- Use `scoreGrid` from kit.js. All rows are filled except money, ship and bill.
- L0: the money, ship and bill rows fill in (cells pop one provider after another across the line).
- L1–L4: highlight the rows the narration talks about, and dim the others (`hi`, `dim`):
  - L1: body + code
  - L2: brain + keys + memory
  - L3: time + hands
  - L4: safety + money
- As each provider is named in the line (use `wordAt`), briefly pulse that provider's column header or a light column band behind its cells. You can draw this band yourself behind `scoreGrid`, using the grid geometry: x0 70, label width 290, three columns across 1780 px, header y 160–214, rows from y 232, 51 px each.
- Gentle confetti at the end of L4.

## pick (CH.verdict)
- L0: title "Which one should you pick?" with three empty persona cards.
- L1: persona "Your agent lives in a Next.js app · ship fast" → Vercel logo (card fills).
- L2: persona "Millions of always-on agents · own state · close to users · low cost" → Cloudflare logo.
- L3: persona "Company on AWS · strict compliance & data rules" → AWS logo, with "AgentCore + Bedrock" chips.
- L4: "Mix and match". Three logos in a triangle, with labelled links:
  - "AI SDK runs on Workers" (Vercel → Cloudflare);
  - "Vercel AI Gateway → Bedrock" (Vercel → AWS);
  - an "MCP" ring connecting all three.

## quiz3 (CH.verdict)
- Copy the reference quiz layout (reference `scenes_B.js` `SCN.quiz1`), with the countdown during the hold.
- Question: "A bank on AWS wants every tool call checked against strict rules, outside the model. Which service?"
- Answers:
  - A "Bedrock Guardrails" (content filters)
  - B "AgentCore Policy" (Cedar rules on tool calls), **correct**
  - C "AgentCore Memory" (remembers users)
  - D "CloudWatch" (logs & traces)
- `guide`: happy eyes plus a hop at the start of line 1.

## outro (chapter null)
- Adapt the reference outro.
- `guide`: as in the reference, switch to `spot: 'big'` for line 2, with happy eyes and a hop.
- L0: one "Atlas agent code" box hops between the three logos (a portable-code visual), with the pill "keep your agent code portable".
- L1: three doc cards with logos:
  - developers.cloudflare.com/agents
  - ai-sdk.dev · vercel.com/docs
  - aws.amazon.com/bedrock/agentcore
- L2: "Thanks for learning!" on the right side (x ≈ 1350, like the reference), with Atlas happy and three small logos, and the line "Product names & statuses as of September 26, 2026". Confetti.
