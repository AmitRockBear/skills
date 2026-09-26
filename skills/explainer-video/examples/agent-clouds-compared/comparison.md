# AI agent infrastructure: Cloudflare vs Vercel vs AWS (as of 2026-09-26)

This is the companion sheet for the video `ai-agent-clouds-compared.mp4`. Status tags: GA, beta, preview.

| Need | Cloudflare | Vercel | AWS |
|---|---|---|---|
| **Body (runtime)** | **Workers:** V8 isolates in hundreds of cities, starting in ms, billed on CPU time. **Durable Objects:** one stateful instance per agent, with its own SQLite, that hibernates when idle | **Vercel Functions on Fluid compute:** many requests per instance. Billed on Active CPU + provisioned memory. Max duration 800 s on Pro, 1800 s in beta. No Durable Objects equivalent (Vercel KB) | **Bedrock AgentCore Runtime:** a microVM per session. Sessions up to 8 h; the Instances option runs up to 14 days. Billed per second on active CPU and memory. V2 cold start about 2 s (P75). **Lambda:** 15 min max, billed on full duration |
| **Code (framework)** | Agents SDK (`agents`): `Agent` class, state, schedule, WebSockets | AI SDK 7 (`ai`): `ToolLoopAgent`, MCP client, `useChat`. eve framework (preview) | Strands Agents (Python v1.57, TS v1.19). AgentCore harness (GA, config-only) |
| **Brain (models)** | **Workers AI:** open models on Cloudflare GPUs. **AI Gateway:** cache, rate limit, fallback, logs. Both share one `env.AI` binding and one wallet (Aug 2026) | **AI Gateway:** about 370 models from about 60 providers. Zero token markup, failover, works from any cloud. No first-party models | **Amazon Bedrock:** Claude, GPT-6/5.x, Nova 2, Llama, Mistral, DeepSeek, Qwen and more. Converse API plus OpenAI/Anthropic-compatible APIs. Batch −50%, Flex tier, prompt caching. AgentCore Gateway can call outside models (Jul 2026) |
| **ZDR** | Workers AI doesn't train on your data. For Unified Billing, ZDR is set **per model** (Opus 5.x and Fable are not ZDR). AI Gateway logs full payloads **by default**; turn off with `collect_logs` or the `cf-aig-collect-log: false` header | Gateway keeps metadata only, no prompts. ZDR routing via `providerOptions.gateway.zeroDataRetention` or a team toggle (Pro/Ent; team-wide costs $0.10 per 1k requests). With ZDR, requests fail instead of falling back to a non-ZDR provider | No storage by default (ZDR/ZOA design), and providers can't see prompts. `data_retention_mode: none` can be enforced org-wide with SCPs. Fable 5.x requires `aws_review` mode (30-day retention) |
| **BYOK** | Yes: stored keys (Secrets Store, beta) or per-request keys. No fee documented. It silently falls back to Unified Billing credits unless **Require provider credentials** (`byok_only`) or the `cf-aig-no-wholesale` header is set | Yes, team-level or per request via `providerOptions.gateway.byok`, with no markup. Requires purchased credits. Failed BYOK requests **auto-retry on Vercel keys**, and no off switch is documented | Bedrock takes no provider keys; everything is billed through AWS. The AgentCore Identity token vault holds OpenAI, Gemini and Anthropic keys for harness, Gateway inference targets and Strands |
| **Buying through the cloud** | 5% fee on Unified Billing credit purchases, no per-token markup | 0% markup | Bedrock's own published prices (OpenAI models priced the same as direct) |
| **Memory** | Per-agent SQLite, KV, D1, R2 (no egress fees), Vectorize, AI Search (beta), Agent Memory (private beta) | Blob, Global Config (formerly Edge Config, 1 MB), Runtime Cache. Marketplace: Neon, Supabase, Upstash, Mem0 and others. No first-party database or vector store | AgentCore Memory (short- and long-term), S3, DynamoDB, S3 Vectors (GA), Bedrock Knowledge Bases, managed Knowledge Base |
| **Time** | `schedule` / `scheduleEvery`, Queues, Workflows (`step.do`, `step.waitForEvent`) | Vercel Workflows / Workflow SDK (`'use workflow'`, `'use step'`, `sleep`, `createHook`); runs have no duration limit. Queues (beta), Cron | Step Functions (with AgentCore harness integration), Lambda durable functions (up to 1 year, no charge while waiting), SQS, EventBridge Scheduler |
| **Hands** | Remote MCP (`createMcpHandler`), Cloudflare MCP server (`search` / `execute`), Code Mode, Browser Run, Sandboxes/Containers | `mcp-handler`, AI SDK MCP client. Sandbox (Firecracker, 24 h sessions, firewall credential brokering). Vercel Connect (GA). No managed browser (Browserbase via Marketplace) | AgentCore Gateway (APIs and Lambda → MCP), Code Interpreter, Browser (Web Bot Auth preview), Nova Act, AWS MCP Server (15k+ APIs, free) |
| **Senses** | WebSockets with hibernation, Email Service (beta), voice agents (beta) | Streaming, WebSockets (beta, bound by function duration), Chat SDK (Slack, Teams, WhatsApp and more), realtime voice via Gateway. No email product | AgentCore WebSocket (60 min), Nova 2 Sonic, Transcribe/Polly, SES + Mail Manager, Connect |
| **Safety** | Workers VPC, MCP server portals, Access OAuth, Web Bot Auth / signed agents, AI Crawl Control | BotID, Firewall (AI bot rules, rate limits), OIDC federation, Secure Compute (Enterprise), Deployment Protection | AgentCore Identity, AgentCore Policy (Cedar), Bedrock Guardrails (incl. Automated Reasoning), IAM/SCP/PrivateLink, WAF Bot Control with Web Bot Auth verification |
| **Money** | x402 in the Agents SDK, pay-per-crawl for sites | x402-mcp experiment (2025, appears unmaintained). No payment product | AgentCore payments (GA Aug 2026: x402 + MPP, Coinbase/Privy wallets, spend limits). WAF AI traffic monetization (402) |
| **Shipping** | `wrangler deploy`, Worker Previews, Agents tracing (beta) | Preview per git push, instant rollback, rolling releases, Observability, Always-on Tracing (beta) | AgentCore Observability (CloudWatch/OTel), Evaluations, Optimization. CDK L2 constructs, AgentCore CLI |
| **Bill** | CPU time, paid plan from $5/mo. R2 has no egress fees | Active CPU $0.128/CPU-hr + memory $0.0106/GB-hr (iad1). Free Hobby tier | Runtime V2: $0.1276/vCPU-hr + $0.0169/GB-hr. Lambda $0.0000166667/GB-s. Separate meters for Memory, Gateway, Evals and more |

## Key sources
- **Cloudflare**
  - ZDR: https://developers.cloudflare.com/ai-gateway/features/unified-billing/#zero-data-retention-zdr
  - BYOK: https://developers.cloudflare.com/ai-gateway/configuration/bring-your-own-keys/
  - Logging: https://developers.cloudflare.com/ai-gateway/observability/logging/
  - Pricing: https://developers.cloudflare.com/ai-gateway/reference/pricing/
  - Workers AI data use: https://developers.cloudflare.com/workers-ai/platform/data-usage/
- **Vercel**
  - Fluid compute: https://vercel.com/docs/fluid-compute
  - Function limits: https://vercel.com/docs/functions/limitations
  - AI Gateway: https://vercel.com/docs/ai-gateway
  - ZDR: https://vercel.com/docs/ai-gateway/security-and-compliance/zdr
  - BYOK: https://vercel.com/docs/ai-gateway/authentication-and-byok/byok
  - Workflows: https://vercel.com/docs/workflows
  - Sandbox: https://vercel.com/docs/sandbox
  - Next.js on Vercel vs Cloudflare (no Durable Objects equivalent): https://vercel.com/kb/guide/next-js-on-vercel-vs-cloudflare
- **AWS**
  - AgentCore quotas: https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/bedrock-agentcore-limits.html
  - AgentCore pricing: https://aws.amazon.com/bedrock/agentcore/pricing/
  - Runtime V2: https://aws.amazon.com/about-aws/whats-new/2026/09/new-agentcore-runtime-generally-available/
  - Data retention: https://docs.aws.amazon.com/bedrock/latest/userguide/data-retention.html
  - Abuse detection: https://docs.aws.amazon.com/bedrock/latest/userguide/abuse-detection.html
  - Harness models (BYOK): https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/harness-models.html
  - Lambda durable functions: https://docs.aws.amazon.com/lambda/latest/dg/durable-basic-concepts.html
  - AgentCore payments: https://aws.amazon.com/about-aws/whats-new/2026/08/bedrock-agentcore-payments-ga/

## Unverified or moving
- Whether Cloudflare's `cf-aig-zdr` header and dashboard ZDR toggle still work (both were removed from the docs on 2026-09-23; the API field remains).
- Whether Vercel's BYOK → system-key fallback can be disabled.
- Whether eve is GA or beta (Vercel's own pages disagree).
