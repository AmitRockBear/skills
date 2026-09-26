# Part D: prefix `d_`. Scenes: time, time_cf, time_vc, time_aws, hands, hands_cf, hands_vc, hands_aws, quiz2

## time (CH.time)
- L0: `chapterTitle(S, 5, 'Time', 'clock')`.
- L1: a week-long calendar strip. A price chart drifts down, and "check every morning" suns appear each day. A "waiting for approval" pause spans days. A lightning crash hits mid-way, and the job continues ("survives crashes").

## time_cf (CH.time)
Facts: an agent can schedule itself (`this.schedule`). Queues buffer bursts. Workflows run multi-step jobs that retry each step, and can wait for an event such as an approval, for days.
- L0: Cloudflare logo. An alarm clock "tomorrow 9:00" and a mini Atlas asleep, then waking.
- L1: a Queue conveyor smoothing a burst of boxes into a steady flow, plus Workflow step cards where one step fails (red) and then retries successfully (green).
- L2: codeBlock (file `workflow.ts`). Highlight `waitForEvent`:
```
await step.do("search flights", () => searchFlights());
await step.waitForEvent("wait for approval",
  { type: "approved", timeout: "3 days" });
```
  - Next to it, a phone with an "Approve" button that gets tapped after a "days pass" animation.

## time_vc (CH.time)
Facts: Vercel Workflows is built on the open-source Workflow SDK. Mark functions with `"use workflow"` and `"use step"`. Steps retry, and runs survive crashes and redeploys. `sleep` can last days or months, and runs have no time limit, but each step is still bound by the function max duration. Vercel Queues are in public beta. Cron jobs run the daily check.
- L0: Vercel logo, "Vercel Workflows", and an "open-source Workflow SDK" pill.
- L1: codeBlock (file `plan-trip.ts`). Highlight `"use workflow"`, then `"use step"`. Then a crash bolt hits and a "resumes where it left off" pill appears:
```
export async function planTrip(goal) {
  "use workflow";
  const flights = await searchFlights(goal);
  await sleep("1 day");
  return await bookBest(flights);
}
async function searchFlights(goal) {
  "use step";   // retried automatically
}
```
- L2: a sun and moon cycling over "days… months" for `sleep`. Pills: "run: no time limit" (green) and "each step ≤ function limit" (C.red, small stopwatch).
- L3: "Vercel Queues" with `badge('beta')`, plus a "cron: every morning" calendar chip.

## time_aws (CH.time)
Facts: Step Functions draws workflows as state diagrams, and can run AgentCore agents with human approval steps. Lambda durable functions (since Dec 2025) let you write workflows as code with steps and waits. A run lasts up to 1 year, with no charge while waiting. SQS queues and EventBridge schedules complete the picture.
- L0: AWS logo. A Step Functions diagram builds node by node: Start → "AgentCore agent: plan trip" → "Human approval" (a person icon with ✓) → "Book" → End.
- L1: codeBlock (file `handler.ts`). Highlight a `ctx.step` line:
```
export const handler = withDurableExecution(async (event, ctx) => {
  const flights = await ctx.step(() => searchFlights(event));
  // ...wait for a price drop: no charge while waiting
  return ctx.step(() => bookBest(flights));
});
```
- L2: a timeline "up to 1 year", with a paused meter (C.green) during the wait. SQS and EventBridge chips pop in.

## hands (CH.hands)
- L0: `chapterTitle(S, 6, 'Hands', 'hand')`.
- L1: a universal "MCP" plug connecting Atlas to tool boxes (airline API, hotel website, code runner). The three provider logos each get a "speaks MCP" check.

## hands_cf (CH.hands)
Facts: Cloudflare hosts MCP servers on Workers. Its own MCP server covers its entire API (2,500+ endpoints) with just two tools, `search()` and `execute()`. Code Mode lets the model write code instead of making one tool call at a time, saving huge numbers of tokens. Browser Run is a real browser with a Live View that lets a human step in. Sandboxes run full Linux containers.
- L0: Cloudflare logo. An "MCP server on Workers" card, then a big API cloud of 2,500+ endpoint dots funneling into two buttons: `search()` and `execute()`.
- L1: Code Mode (adapt the reference scene). Many tool-call ping-pongs versus one small code block, with a token counter dropping sharply.
- L2: a Browser Run window with a "Live View" eye and a human hand stepping in, plus a "Sandbox: Linux container" terminal box.

## hands_vc (CH.hands)
Facts: Vercel hosts MCP servers with the `mcp-handler` package. The AI SDK has an MCP client. Vercel Sandbox runs code in Firecracker microVMs, with sessions up to 24 h (Pro). Its firewall injects credentials into outgoing requests, so secrets never enter the VM. There's no managed browser: run one in Sandbox, or use Browserbase from the Marketplace. Vercel Connect gives agents short-lived tokens for Slack, GitHub and 100+ providers.
- L0: Vercel logo, an "mcp-handler" server card, and an "AI SDK → any MCP server" arrow.
- L1: a "Vercel Sandbox" microVM box labelled "Firecracker microVM" with code running inside, and a stopwatch pill "up to 24 h per session".
- L2: the sandbox wall. Outgoing requests pass a firewall gate, where a key is attached *outside* the VM ("secret injected at the firewall"). Inside, a "no keys here" empty key slot.
- L3: a "no managed browser" dashed card, with arrows to "browser inside Sandbox" and "Browserbase (Marketplace)". A "Vercel Connect" card hands out short-lived token chips to Slack, GitHub and "+100".

## hands_aws (CH.hands)
Facts: AgentCore Gateway turns existing APIs and Lambda functions into MCP tools, with semantic tool search. AgentCore Code Interpreter runs Python and JavaScript in a sandbox. AgentCore Browser is a managed Chrome. Nova Act is an agent specialized in UI and browser automation. The AWS MCP Server gives access to 15,000+ AWS APIs, free.
- L0: AWS logo. API and Lambda boxes flow into an "AgentCore Gateway" and come out as MCP tool chips. A search box finds one tool among hundreds.
- L1: two cards: "Code Interpreter" (Python, JS) with a terminal, and "AgentCore Browser" (managed Chrome) with a browser window.
- L2: a "Nova Act" cursor clicking through a hotel website form, and an "AWS MCP Server" card with "15,000+ APIs" and a "free" tag.

## quiz2 (CH.hands)
- Copy the reference quiz layout (reference `scenes_B.js` `SCN.quiz1`) with the countdown during the hold.
- Question: "On Vercel, Atlas must safely run a Python script the model just wrote. Which service?"
- Answers:
  - A "Vercel Blob" (files)
  - B "Vercel Sandbox" (isolated microVM), **correct**
  - C "Global Config" (settings)
  - D "Cron Jobs" (schedules)
- On line 1, also show two small chips: "Cloudflare: Sandboxes" and "AWS: Code Interpreter".
- `guide`: happy eyes plus a hop at the start of line 1.
