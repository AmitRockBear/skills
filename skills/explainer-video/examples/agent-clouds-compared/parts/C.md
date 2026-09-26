# Part C: prefix `c_`. Scenes: zdr, byok, memory, memory_cf, memory_vc, memory_aws, quiz1

## zdr (CH.brain). Is my data kept?
Facts:
- **Cloudflare**
  - Workers AI does not train on customer content.
  - For third-party models billed through Cloudflare (Unified Billing), ZDR is set per model; many models are ZDR, not all.
  - AI Gateway logs full requests by default. Logging can be turned off per gateway, or per request with the header `cf-aig-collect-log: false`.
- **Vercel**
  - AI Gateway does not retain prompts or outputs, only metadata (model, tokens, cost, latency).
  - The team-wide or per-request ZDR option (Pro/Enterprise) routes only to ZDR providers. If none serves the model, the request fails instead of falling back.
- **AWS**
  - Bedrock doesn't store prompts or outputs by default.
  - A data retention mode (`none`) can be enforced org-wide.
- **Caveat:** some of the newest frontier models retain data up to 30 days for safety or abuse checks. Check each model.

Visuals:
- L0: a big question card "Is my data kept?" with a document and a question mark.
- L1: definition. A prompt goes into the model and an answer comes out; then both drop into a shredder or fade to nothing. A label pops: "ZDR = nothing stored after the request".
- L2: Cloudflare logo. A "Workers AI: no training on your data" pill. A list of 4–5 generic model cards (Model A, Model B...), each with a ZDR check or a grey dash, labelled "marked model by model".
- L3: a filing cabinet "AI Gateway logs: ON by default", drawn in C.red. A toggle switches OFF, with pills "per gateway" and "per request".
- L4: Vercel logo. A gateway log card shows only metadata rows: model, tokens, cost. The prompt text row is crossed out.
  - A "ZDR" switch flips on, with a small "Pro / Enterprise" badge.
  - Routes to non-ZDR providers get blocked; one path shows "fails, doesn't fall back".
- L5: AWS logo. A "Bedrock: not stored by default" pill. An org tree (company → teams → accounts) with a lock over the whole tree, labelled "retention mode: none, company-wide".
- L6: a warning card: "Newest frontier models: up to 30 days for safety checks". Three model cards get a "30 days" tag. Final pill: "check the model, not just the cloud".

## byok (CH.brain). Bring your own key
Facts:
- **Cloudflare**
  - AI Gateway BYOK stores provider keys (Secrets Store), with no fee.
  - If no key is found, the request silently bills Unified Billing credits, unless the gateway setting "Require provider credentials" is on.
- **Vercel**
  - BYOK works per team or per request, with no markup.
  - It requires purchased credits.
  - A failed BYOK request automatically retries on Vercel's system credentials.
- **AWS**
  - Bedrock bills through the AWS account, so there is no key to bring.
  - AgentCore Identity's token vault stores OpenAI, Gemini or Anthropic keys; the agent never sees the raw key.
- **Buying through the cloud:** Cloudflare adds 5% on credit purchases. Vercel adds no markup. Bedrock bills its own published prices on the AWS bill.

Visuals:
- L0: a key labelled "your Anthropic / OpenAI contract" travels through a cloud router box to a provider box.
- L1: Cloudflare column. The key drops into an "AI Gateway: provider keys" slot, with a "no fee" pill.
  - Gotcha animation: the key slot is empty, so a coin flows to "Cloudflare credits" (C.red, "silently").
  - Then a toggle "Require provider credentials" flips on and the coin path is blocked.
- L2: Vercel column. A key with "per team / per request" and a "0% markup" pill; a "needs purchased credits" note.
  - The key fails (red X) and an arrow reroutes to "Vercel's keys" ("automatic retry").
- L3: AWS column. An "AWS bill" card: "Bedrock: no key needed".
  - A vault (AgentCore Identity) with OpenAI, Gemini and Anthropic key tags inside.
  - Atlas outside the vault, with a "never sees the key" pill.
- L4: a fee comparison row using the three logos: "+5% on credits", "0% markup", "Bedrock list prices".

## memory (CH.memory)
- L0: `chapterTitle(S, 4, 'Memory', 'memory')`.
- L1: four props pop in synced to the words:
  - desk: "the chat";
  - filing cabinet: "preferences";
  - warehouse: "files";
  - library: "search by meaning".

## memory_cf (CH.memory)
Facts: every agent has its own SQL database inside its Durable Object. KV is for fast lookups, D1 for shared SQL tables, R2 for files with no egress (download) fees. Vectorize and AI Search find things by meaning. Agent Memory is in private beta.
- L0: a Durable Object house with a SQL table inside and chat bubbles stored next to the Atlas code.
- L1: three cards (KV, D1, R2). R2 gets a "free downloads" tag.
- L2: a "map of meaning" (dots clustering; adapt the reference Vectorize scene) with Vectorize and AI Search labels, plus "Agent Memory" with `badge('private beta')` remembering "prefers window seats".

## memory_vc (CH.memory)
Facts: Vercel Blob is for files. Global Config (formerly Edge Config) holds small settings, 1 MB per store. The Vercel Marketplace offers one-click Postgres from Neon and Supabase, and Redis and Vector from Upstash, billed through Vercel. Mem0 joined the Marketplace in Sep 2026. Vercel has no first-party database or vector store.
- L0: Vercel logo with two cards: "Vercel Blob: files" and "Global Config (formerly Edge Config): small settings".
- L1: a Marketplace storefront with one-click install buttons for "Neon: Postgres", "Supabase: Postgres", "Upstash: Redis & Vector", plus a "billed through Vercel" receipt.
- L2: a "Mem0: agent memory" card joins with a "new" sparkle. A note in C.soft: "partners' products: no Vercel database or vector store".

## memory_aws (CH.memory)
Facts: AgentCore Memory keeps short-term events and extracts long-term memories. S3 is for files, DynamoDB for fast records, S3 Vectors for embeddings inside S3. Bedrock Knowledge Bases give managed search over documents, with connectors (SharePoint, Confluence, and more).
- L0: AWS logo. A stream of chat events flows into "AgentCore Memory"; a sticky note pops out: "prefers window seats" (long-term).
- L1: three cards: S3 (files), DynamoDB (fast records), S3 Vectors (embeddings).
- L2: "Bedrock Knowledge Bases": documents flow in from connector chips (SharePoint, Confluence, "+ more") and a search box returns an answer.
- L3: a wiring diagram joining Atlas to 5–6 service boxes, each with its own little "bill" tag. Pill "powerful, but more wiring".

## quiz1 (CH.memory)
- Copy the reference quiz layout (`SCN.quiz1` in the reference `scenes_B.js`), including the countdown during the hold after line 0.
- Question: "Atlas runs on Vercel and needs a Postgres database for bookings. Where does it come from?"
- Answers:
  - A "Global Config" (small settings)
  - B "Vercel Blob" (files)
  - C "Marketplace" (Neon, Supabase), **correct**
  - D "Runtime Cache" (temporary cache)
- The use-labels appear during line 1.
- `guide`: happy eyes plus a hop at the start of line 1.
