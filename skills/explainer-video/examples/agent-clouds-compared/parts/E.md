# Part E: prefix `e_`. Scenes: senses, senses_2, safety, safety_cf, safety_vc, safety_aws, money

## senses (CH.senses)
Facts:
- Cloudflare agents keep WebSockets open and hibernate between messages.
- Vercel WebSockets are in public beta, bounded by the function max duration.
- AgentCore Runtime WebSocket streaming lasts up to 60 minutes.
- Vercel Chat SDK: one bot codebase for Slack, Teams, Google Chat, Discord, Telegram, WhatsApp and more.

Visuals:
- L0: `chapterTitle(S, 7, 'Senses', 'ear')`. After it, three channel icons: chat, voice (mic), email.
- L1: Cloudflare logo. A traveller's phone with a WebSocket line to Atlas that stays open. Between messages Atlas sleeps (zzz) and wakes instantly when a message arrives. An "∞ as long as they like" pill.
- L2: two rows.
  - Vercel: a WebSocket line with `badge('beta')` and a timer running down to "function time limit" (C.red).
  - AWS: a WebSocket line with a timer "up to 60 min".
- L3: Vercel logo. "Chat SDK": one bot card fans out to app chips (Slack, Teams, WhatsApp, Discord, Telegram). Pill "write one bot, run it in many apps".

## senses_2 (CH.senses)
Facts: Cloudflare voice agents are in beta. Vercel AI Gateway offers realtime speech models. AWS Nova 2 Sonic is a speech-to-speech model. Cloudflare Email Service (receive and send) is in beta. AWS has SES. Vercel has no email product; use a partner such as Resend.
- L0: three voice columns, each with its logo and an animated waveform:
  - "Voice agents" with `badge('beta')`;
  - "Realtime speech via AI Gateway";
  - "Nova 2 Sonic: speech-to-speech".
- L1: three email columns:
  - "Email Service" with `badge('beta')`, envelopes in and out;
  - Vercel "no email product → Resend (partner)" as a dashed card;
  - "Amazon SES".

## safety (CH.safety)
- L0: `chapterTitle(S, 8, 'Safety & identity', 'shield')`.
- L1: three question cards pop in synced to the words:
  - "Who can talk to the agent?" (door);
  - "What can it touch?" (hand/lock);
  - "Can websites trust it?" (passport).

## safety_cf (CH.safety)
Facts: Workers VPC reaches private systems without exposing them publicly. MCP server portals put company MCP tools behind one secure door. Web Bot Auth signs agent requests so sites can verify them. AI Crawl Control lets sites choose which bots get in.
- L0: Cloudflare logo. A tunnel from Atlas into a private-network box (database, internal API), with the public internet crossed out. Then a single "MCP portal" door leading to several company tool boxes.
- L1: Atlas gets a signed passport ("Web Bot Auth") and a website checks it (✓). Then an "AI Crawl Control" gate lets one bot in and turns another away.

## safety_vc (CH.safety)
Facts: BotID blocks bots on high-value pages. The Vercel Firewall has AI Bots rules and rate limits. OIDC gives functions short-lived cloud credentials instead of stored secrets. Secure Compute (Enterprise) provides a private network with static IPs. There is no signed-agent verification like Web Bot Auth.
- L0: Vercel logo. A "checkout" page where BotID stops a bot; firewall rule chips "AI bots" and "rate limit". Then a stored-secret key gets crossed out and replaced by an "OIDC: short-lived token" chip with a ticking timer.
- L1: a "Secure Compute" card with `badge('enterprise')` (make its fill neutral) showing a private network and a static IP. Then a dashed empty passport slot: "no signed-agent passport".

## safety_aws (CH.safety)
Facts: AgentCore Identity gives agents their own identities and holds OAuth tokens and API keys in a token vault. AgentCore Policy evaluates every agent-to-tool call against Cedar rules at the gateway, outside the model. Bedrock Guardrails filter harmful content and PII. AWS WAF verifies Web Bot Auth signatures.
- L0: AWS logo. Atlas gets an ID badge ("AgentCore Identity") and a vault with OAuth token and API key tags.
- L1: a tool call walks through a checkpoint gate with a Cedar rule card. A confused-agent bubble ("but I really need to book the $900 suite!") bounces off.
  - Show this codeBlock (file `policy.cedar`, and note "simplified" under it):
```
permit(principal, action == Action::"book_hotel", resource)
when { context.input.price <= 300 };
```
- L2: "Bedrock Guardrails": a filter screen stopping a harmful-content card and blurring a PII card. Then a "WAF verifies Web Bot Auth" chip with a passport check.

## money (CH.money)
Facts: x402 is HTTP 402 "Payment Required": the agent pays a tiny amount (stablecoin) and gets the data. Cloudflare has x402 in the Agents SDK and lets sites charge AI crawlers. AWS AgentCore payments has been GA since Aug 2026, with wallets (Coinbase, Stripe Privy) and spending limits, and AWS WAF lets sites charge bots (402). Vercel had an x402 experiment for MCP tools (x402-mcp, 2025) but no payment product today.
- L0: `chapterTitle(S, 9, 'Money', 'coin')`. After it, Atlas and a "flight-price API" box.
- L1: the x402 sequence animates:
  1. Atlas sends a request.
  2. The API answers "402 Payment Required".
  3. Atlas pays "$0.01" (coin packet).
  4. The data comes back (✓).
- L2: Cloudflare logo with an "x402 in the Agents SDK" chip, plus a website charging a crawler bot at a tollbooth.
- L3: AWS logo. An "AgentCore payments" wallet with a spending-limit bar filling to a cap, and a "GA · Aug 2026" pill. Then "AWS WAF: charge bots" as a mini tollbooth.
- L4: Vercel logo. A dashed "x402 experiment (2025)" card and a "no payment product today" pill.
