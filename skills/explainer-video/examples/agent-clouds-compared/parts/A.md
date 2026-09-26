# Part A: prefix `a_`. Scenes: meet, agent, atlas, body, body_cf, body_vc, body_aws

## meet (chapter: null). The three kitchens
- L0 "Let's meet the contenders...": title "Meet the contenders". Three kitchen doors or shop-fronts pop in, each with a provider logo.
- L1, Cloudflare: a map or globe with many small orange kitchens (huts) dotted over cities, and packets flowing to nearby users. A shelf of "made in-house" ingredient chips: Workers, Durable Objects, Workers AI, R2, Vectorize, Workflows.
- L2, Vercel: a sleek designer kitchen or counter with one big "Deploy" button. Next.js and AI SDK chips. A `git push` turns into a live URL.
- L3, AWS: a giant warehouse with tall shelves of many small service boxes (label a few: Lambda, S3, Bedrock, DynamoDB, SQS, IAM...) and a builder assembling pieces.
- L4: three compact cards side by side. Three pills pop in, synced to the words: "how", "how much", "how easy".

## agent (chapter: null). Refresher
- Adapt the reference `SCN.agent` (reference `scenes.js`).
- L0: chatbot answers and stops, then the agent loop (think → act → observe) with a "done!" pop. Both happen within this one line: split it at the word "agent".
- L1: Atlas in the center, with chapter "needs" nodes popping around him: Body, Code, Brain, Memory, Time, Hands, Senses. Use icons body, code, brain, memory, clock, hand, ear.
- L2: add Safety, Money, Shipping, The bill (icons shield, coin, eye, doc). Then all 11 nodes get small number badges 1–11, meaning "our chapters".

## atlas (chapter: null). The running example
- Adapt the reference `SCN.atlas`.
- L0: Atlas appears with the label "a trip-planning agent".
- L1: a phone types the request.
- L2: six task pills pop in: Search flights, Compare hotels, Remember preferences, Wait for prices to drop, Book things, Keep the traveller updated.
- L3: Atlas splits into three copies, each standing on a pedestal with a provider logo (Cloudflare, Vercel, AWS), plus an empty scorecard sheet with a pencil.

## body (CH.body). Chapter opener
- L0: `chapterTitle(S, 1, 'The body', 'body')`.
- L1: "Atlas's minute": a horizontal timeline bar that is mostly grey "waiting" segments, labelled model thinking / website loading / human reply, with tiny orange "computing" slivers. An hourglass animates.
- L2: two big question cards pop in: "How does it run my agent?" and "Do I pay while it waits?"

## body_cf (CH.body)
Facts: a Worker starts in milliseconds in hundreds of cities. Each traveller gets a Durable Object with its own memory and SQL database, which hibernates when idle. The Agents SDK `Agent` class gives one instance per traveller. Workers bill CPU time, not waiting time.
- L0: globe with pins (copy the reference `globe` as `a_globe`). A "Worker" chip with a lightning bolt and "starts in ms".
- L1: a row of small houses (Durable Objects), each with a traveller avatar inside plus memory and database icons. One sleeps (zzz), then wakes "exactly where it left off".
- L2: an `Agent` class card stamps out one instance per traveller (arrows to three mini Atlases).
- L3: a taxi-style meter that only ticks during orange CPU slivers and stays frozen during grey waiting. Label "billed: CPU time". A sleeping agent shows "hibernating".

## body_vc (CH.body)
Facts: Vercel Functions on Fluid compute. One instance serves many concurrent requests. Active CPU pricing plus provisioned memory. Max duration 800 s on Pro, or 1800 s (30 min) in beta. No Durable Objects equivalent, and Vercel's own guide says so.
- L0: a Vercel logo, a "Vercel Function" box, and a "Fluid compute" label with a flowing-liquid fill.
- L1: one instance juggling requests A, B and C. While A waits (hourglass), the instance works on B, then C.
- L2: a bill with two meters. "Active CPU" moves only while code runs; "Memory reserved" is a steady band.
- L3: a stopwatch capped at "800 s (Pro)", with a second marker "30 min" and `badge('beta')`. Use C.red for the cap.
- L4: travellers' state arrows go into a database cylinder and a "workflow" box. A quote card: "Durable Objects: no direct Vercel equivalent", attributed "Vercel's own guide".

## body_aws (CH.body)
Facts: Amazon Bedrock AgentCore Runtime. Each session runs in its own isolated microVM, wiped when the session ends. Sessions last up to 8 h; the Instances option runs up to 14 days. It bills active CPU and memory per second, and CPU is typically not billed during I/O wait. A new session boots in ~2 s (Runtime V2, P75), versus milliseconds for Workers. Lambda caps at 15 min and bills the whole duration, waiting included.
- L0: AWS logo with an "Amazon Bedrock AgentCore Runtime" title card.
- L1: travellers each get a sealed glass box (microVM) with a mini Atlas inside. When a session ends, a box is wiped with a sparkle and a broom.
- L2: two bars: "Session: up to 8 hours" and "Instances: up to 14 days".
- L3: the same meter idea as body_cf, pausing during waiting, labelled "active CPU & memory, per second".
- L4: a startup race. "Worker: milliseconds" finishes instantly; "AgentCore session: ~2 s" fills a boot progress bar.
- L5: a Lambda card: "up to 15 min". Its meter keeps running through grey waiting, labelled "billed the whole time" in C.red.
