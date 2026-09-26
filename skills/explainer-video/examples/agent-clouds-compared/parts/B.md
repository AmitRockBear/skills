# Part B: prefix `b_`. Scenes: code, code_vc, code_aws, code_mix, brain, brain_cf, brain_vc, brain_aws

## code (CH.code)
- L0: `chapterTitle(S, 2, 'The code', 'code')`.
- L1: Cloudflare logo and an "Agents SDK" card. Three feature pills pop in synced to the words: "state", "scheduling", "live connection to the browser".
- L2: codeBlock (file `atlas.ts`). Highlight the `schedule` line:
```
import { Agent } from "agents";

export class Atlas extends Agent {
  async plan(goal) {
    this.setState({ goal });
    await this.schedule(86400, "checkPrices");
  }
}
```
  - Beside it, a small alarm-clock "tomorrow" pill.

## code_vc (CH.code)
- L0: Vercel logo and an "AI SDK" card (npm package `ai`), labelled "TypeScript toolkit for AI apps".
- L1: codeBlock (file `atlas.ts`). Highlight the `tools` line, then the `generate` line:
```
import { ToolLoopAgent } from "ai";

const atlas = new ToolLoopAgent({
  model: "anthropic/claude-sonnet-4.6",
  instructions: "You plan trips.",
  tools: { searchFlights, findHotels },
});
const result = await atlas.generate({ prompt });
```
  - A small think → act → observe loop spins next to it.

## code_aws (CH.code)
- L0: AWS logo and a "Strands Agents" card with "Python" and "TypeScript" pills.
- L1: codeBlock (file `atlas.py`), then a visual of the model picking one tool from a list (an arrow lights up `search_flights`):
```
from strands import Agent

atlas = Agent(tools=[search_flights, find_hotels])
atlas("Plan 5 days in Lisbon under $2,000")
```

## code_mix (CH.code)
- L0: "Not locked in". An "AI SDK" box slides onto a Cloudflare cloud ("runs on Workers"). A "Strands" box fans out to a laptop, a server and a cloud ("anywhere Python runs").
- L1: "Or skip the loop code". Two cards:
  - AWS "AgentCore harness", labelled "config → agent".
  - Vercel "eve" with `badge('beta')` and a mini folder tree: `agent.ts`, `instructions.md`, `tools/`, `skills/`.

## brain (CH.brain)
- L0: `chapterTitle(S, 3, 'The brain', 'brain')`.
- L1: two ideas side by side. "Host models": a GPU box with a model inside. "Gateway": a control tower routing arrows to many provider boxes.

## brain_cf (CH.brain)
Facts: Workers AI runs open models (e.g. Gemma, GLM) on GPUs across Cloudflare's network. AI Gateway fronts Anthropic, OpenAI, Google and others, adding caching, rate limiting, fallbacks and cost logs. Since Aug 2026, Workers AI and AI Gateway share one `env.AI` binding and one wallet.
- L0: Cloudflare logo and "Workers AI". GPU chips light up across a map. Model chips: Gemma, GLM, "+ open models".
- L1: the AI Gateway control tower (adapt the reference gateway scene) between Atlas and provider boxes (Anthropic, OpenAI, Google), with four feature pills: cache, rate limit, fallback, cost logs.
- L2: one plug labelled `env.AI` and one wallet icon, with arrows fanning out to "almost any model". Pill: "since Aug 2026".

## brain_vc (CH.brain)
Facts: Vercel hosts no models of its own. AI Gateway is one endpoint in front of about 370 models from dozens of providers, with zero token markup and automatic provider failover, and it works from any cloud.
- L0: Vercel logo, an "AI Gateway" hub, and a dense grid of model dots with a counter ticking up to "~370 models".
- L1: a "0% markup" tag. Failover: a provider box turns red ("down") and the packet reroutes to another. "Works from any cloud": arrows from small Cloudflare, AWS and laptop icons into the gateway.
- L2: a model-string swap. A codeBlock line `model: "anthropic/claude-sonnet-4.6"` retypes itself to `model: "openai/gpt-5.5"`, with a pill "change one string".

## brain_aws (CH.brain)
Facts: Amazon Bedrock hosts Claude, OpenAI GPT models, Amazon Nova, Llama, Mistral, DeepSeek, Qwen and more inside AWS. Model providers run in AWS-owned accounts they can't access, so prompts stay inside AWS. Access is through the Converse API or OpenAI/Anthropic-compatible APIs. Cost levers: batch (−50%), a cheaper Flex tier, prompt caching. Since Jul 2026, AgentCore Gateway can route to models outside AWS.
- L0: AWS logo and "Amazon Bedrock", with a catalog shelf of model chips: Claude, GPT, Nova, Llama, Mistral, DeepSeek, Qwen, "+ many more".
- L1: an AWS boundary box. Provider boxes sit inside it, each locked ("provider can't access"). Atlas's prompt packets stay inside the boundary.
- L2: API pills: "Converse API", "OpenAI-compatible", "Anthropic-compatible". Then cost-lever pills: "Batch −50%", "Flex tier", "Prompt caching".
- L3: an "AgentCore Gateway" gate on the boundary, with an arrow going out to an "outside model" box. Pill "since July 2026".
