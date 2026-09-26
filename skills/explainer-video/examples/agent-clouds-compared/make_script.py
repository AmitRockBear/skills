"""Writes script.json. Each line: (scene, caption[, hold]). The spoken text is derived from the caption by SAY."""
import json, re
from pathlib import Path

# spoken forms for acronyms and symbols (applied with word boundaries, longest first)
SAY = {
    "APIs": "A P Is", "API": "A P I", "AWS": "A W S", "ZDR": "Z D R", "BYOK": "B Y O K", "MCP": "M C P",
    "KV": "K V", "D1": "D one", "R2": "R two", "S3": "S three", "SQS": "S Q S", "SES": "S E S", "IAM": "I am",
    "OIDC": "O I D C", "CDK": "C D K", "VPC": "V P C", "WAF": "waff", "x402": "x four oh two", "Next.js": "Next J S",
    "GPT": "G P T", "SQL": "sequel", "microVM": "micro V M", "microVMs": "micro V Ms", "Mem0": "mem zero",
    "GLM": "G L M", "BotID": "bot I D", "AI": "A I", "SDK": "S D K", "CPU": "C P U", "GPUs": "G P Us",
    "OAuth": "O Auth", "DynamoDB": "Dynamo D B", "Qwen": "Kwen", "IPs": "I Ps", "URL": "U R L",
    "$2,000": "two thousand dollars", "$5": "five dollars", "5%": "five percent", "npm": "N P M",
}
_keys = sorted(SAY, key=len, reverse=True)
_re = re.compile("|".join(r"(?<![\w$])" + re.escape(k) + r"(?![\w])" for k in _keys))


def say(cap: str) -> str:
    return _re.sub(lambda m: SAY[m.group(0)], cap).replace('"', "")


LINES = [
    # ---------------- intro ----------------
    ("intro", "Hi there! I'm back, and today we're doing something bigger."),
    ("intro", "We're comparing three clouds for building AI agents: Cloudflare, Vercel and AWS."),
    ("intro", "No background needed. We'll build the same agent on all three, piece by piece, and see who does what best.", .6),

    ("meet", "Let's meet the contenders. Think of them as three very different kitchens."),
    ("meet", "Cloudflare is a chain with a small kitchen in hundreds of cities. Your code runs close to every user, and most of the ingredients are made in-house."),
    ("meet", "Vercel is the designer kitchen. It's the home of Next.js and the AI SDK, built so that shipping an app feels effortless."),
    ("meet", "AWS is the giant warehouse. Hundreds of services, almost every tool you can imagine, but you assemble more of it yourself."),
    ("meet", "All three can run a serious agent. The differences are in how, how much, and how easy.", .6),

    ("agent", "Quick refresher. A chatbot answers and stops. An agent gets a goal and works in a loop: think, act, look at the result, and repeat until the job is done."),
    ("agent", "To do that, it needs a body to live in, code for the loop, a brain, memory, a sense of time, hands for tools, and senses for talking to people."),
    ("agent", "Plus safety rules, a way to pay, a way to ship it, and a bill at the end. Those are our chapters.", .5),

    ("atlas", "Our running example is Atlas, a trip-planning agent."),
    ("atlas", "A traveller types: \"Plan me five days in Lisbon in October, under $2,000.\""),
    ("atlas", "Atlas has to search flights, compare hotels, remember preferences, wait for prices to drop, book things, and keep the traveller updated."),
    ("atlas", "In every chapter we'll build one piece of Atlas three times, once on each cloud, and then fill in a scorecard.", .6),

    # ---------------- 1. body ----------------
    ("body", "Chapter one: the body. Where does Atlas actually run?"),
    ("body", "Here's a surprising fact about agents: most of their time is spent waiting. Waiting for the model to think, for a website to load, for a human to reply."),
    ("body", "So for each cloud we'll ask two questions: how does it run my agent, and do I pay while it waits?", .5),

    ("body_cf", "On Cloudflare, Atlas runs as a Worker: a small function that starts in milliseconds, in hundreds of cities."),
    ("body_cf", "Each traveller gets their own Durable Object: a tiny computer with its own memory and its own database, that sleeps when idle and wakes up exactly where it left off."),
    ("body_cf", "The Agents SDK wraps all of this into one Agent class. One class, one instance per traveller."),
    ("body_cf", "Workers bill for CPU time, not waiting time, and idle agents hibernate. So an agent that's mostly waiting stays cheap.", .4),

    ("body_vc", "On Vercel, Atlas runs as Vercel Functions, on something called Fluid compute."),
    ("body_vc", "With Fluid compute, one instance serves many requests at once. While one traveller's request waits for the model, the same instance helps someone else."),
    ("body_vc", "You pay for Active CPU, meaning only while your code is actually running, plus the memory the instance keeps reserved."),
    ("body_vc", "The catch is time. A single function call is capped at 800 seconds on the Pro plan, or 30 minutes in beta."),
    ("body_vc", "And there's no built-in object that remembers each traveller. Vercel's own guide says Durable Objects have no direct equivalent, so Atlas keeps its state in a database or a workflow.", .4),

    ("body_aws", "On AWS, the home for agents is Amazon Bedrock AgentCore Runtime."),
    ("body_aws", "Each traveller's session gets its own isolated micro virtual machine, which is wiped clean when the session ends."),
    ("body_aws", "A session can last up to eight hours, and a newer Instances option keeps an agent running for up to fourteen days."),
    ("body_aws", "AgentCore bills active usage by the second, so CPU is typically not charged while Atlas waits on the model."),
    ("body_aws", "The trade-off is startup time. A fresh session takes about two seconds to boot, versus milliseconds for a Worker."),
    ("body_aws", "And classic AWS Lambda is still great for short jobs, up to fifteen minutes each, but it bills the whole time, waiting included.", .4),

    ("body_score", "Let's fill in the first row of our scorecard."),
    ("body_score", "Cloudflare: the fastest start, and a built-in home that remembers each agent. Vercel: the smoothest path when Atlas lives inside a web app. AWS: the strongest isolation and the longest sessions."),
    ("body_score", "And notice the trend: all three now offer a way to avoid paying for CPU while an agent waits.", .6),

    # ---------------- 2. code ----------------
    ("code", "Chapter two: the code. Each cloud has its own open-source toolkit for writing the agent loop."),
    ("code", "Cloudflare has the Agents SDK. Atlas extends the Agent class, and gets state, scheduling, and a live connection to the browser, built in."),
    ("code", "Here, Atlas saves the traveller's goal, and asks to be woken up tomorrow to check prices.", .3),

    ("code_vc", "Vercel has the AI SDK, the most popular TypeScript toolkit for AI apps."),
    ("code_vc", "You give a ToolLoopAgent a model, instructions and tools, and it runs the think, act, observe loop for you.", .3),

    ("code_aws", "AWS has Strands Agents, for Python and TypeScript."),
    ("code_aws", "You create an Agent, hand it a list of tools, and the model decides which tools to call, and when.", .3),

    ("code_mix", "Here's the good news: these toolkits aren't locked in. The AI SDK runs happily on Cloudflare Workers, and Strands runs anywhere Python runs."),
    ("code_mix", "And if you'd rather not write the loop at all, AWS offers the AgentCore harness, and Vercel offers eve, which is still in beta. Both build agents from configuration instead of code.", .6),

    # ---------------- 3. brain ----------------
    ("brain", "Chapter three: the brain. Atlas needs a language model. Which models can each cloud reach, and how?"),
    ("brain", "There are two big ideas here. Hosting models yourself, and a gateway: a control tower that routes calls to many model providers.", .4),

    ("brain_cf", "Cloudflare does both. Workers AI runs open models, like Gemma and GLM, on GPUs across its network."),
    ("brain_cf", "AI Gateway sits in front of Anthropic, OpenAI, Google and others, adding caching, rate limits, fallbacks and cost logs."),
    ("brain_cf", "And since August, Workers AI and AI Gateway share one binding and one wallet, so one line of code can reach almost any model.", .4),

    ("brain_vc", "Vercel doesn't host its own models. Instead, its AI Gateway is one endpoint in front of about 370 models from dozens of providers."),
    ("brain_vc", "It adds no markup on tokens, fails over between providers automatically, and works from any cloud, not just Vercel."),
    ("brain_vc", "With the AI SDK, switching from one model to another is just changing a string.", .4),

    ("brain_aws", "AWS has Amazon Bedrock, a huge model catalog running inside AWS: Claude, OpenAI's GPT models, Amazon's own Nova, Llama, Mistral, DeepSeek, Qwen and many more."),
    ("brain_aws", "Model providers run in AWS-owned accounts they can't access, so your prompts stay inside AWS."),
    ("brain_aws", "You call it with the Converse API, or with OpenAI and Anthropic compatible APIs, and you can cut costs with batch jobs, a cheaper Flex tier, and prompt caching."),
    ("brain_aws", "And since July, AgentCore Gateway can also route calls to models outside AWS.", .4),

    ("zdr", "Now, two questions every company asks before sending data to a model. First: is my data kept?"),
    ("zdr", "Zero data retention, or ZDR, means nobody stores your prompts or the model's answers once the request is done."),
    ("zdr", "Cloudflare: Workers AI doesn't train on your data. For outside models paid through Cloudflare, ZDR routing covers many of them, marked model by model."),
    ("zdr", "But AI Gateway logs full requests by default. For true zero retention, turn logging off, for the whole gateway or per request."),
    ("zdr", "Vercel: its AI Gateway keeps no prompts or answers, only metadata. On Pro and Enterprise, one switch routes only to providers with zero retention, and fails rather than falling back."),
    ("zdr", "AWS: Bedrock doesn't store prompts or answers by default, and a data retention mode can enforce zero retention across your whole company."),
    ("zdr", "One caveat on all three: some of the newest frontier models keep data for up to thirty days for safety checks. So always check the model, not just the cloud.", .5),

    ("byok", "Second question: can I bring my own key? BYOK means using your own contract with Anthropic or OpenAI, while the cloud just routes the calls."),
    ("byok", "Cloudflare: yes. Store your provider keys in AI Gateway, with no extra fee. One gotcha: if no key is found, it quietly bills your Cloudflare credits, unless you turn on \"require provider credentials\"."),
    ("byok", "Vercel: yes, per team or even per request, with no markup. But it requires purchased credits, and if your key fails, it automatically retries with Vercel's own keys."),
    ("byok", "AWS: Bedrock bills everything through your AWS account, so there's no key to bring. But AgentCore can keep your OpenAI, Gemini or Anthropic keys in a vault, so the agent never sees them."),
    ("byok", "And if you buy models through the cloud instead: Cloudflare adds a 5% fee on credits, Vercel adds no markup, and Bedrock bills its own published prices on your AWS bill.", .5),

    ("brain_score", "Time for the scorecard."),
    ("brain_score", "Cloudflare: open models on its own GPUs, plus a gateway. Vercel: the simplest gateway, with ZDR and BYOK switches. AWS: the biggest catalog, inside one private boundary, with strict retention controls.", .6),

    # ---------------- 4. memory ----------------
    ("memory", "Chapter four: memory. Atlas must remember the chat, the traveller's preferences, files like tickets, and facts it can search by meaning."),
    ("memory", "Think of it as a desk, a filing cabinet, a warehouse and a library.", .4),

    ("memory_cf", "Cloudflare builds almost all of it in. Every agent has its own SQL database inside its Durable Object, so the chat lives right next to the code."),
    ("memory_cf", "KV handles fast lookups, D1 holds shared SQL tables, and R2 stores files, with no fees for downloading them."),
    ("memory_cf", "Vectorize and AI Search find things by meaning, and Agent Memory, in private beta, remembers facts about each user.", .4),

    ("memory_vc", "Vercel makes fewer of these pieces itself. Vercel Blob stores files, and Global Config, formerly Edge Config, holds small settings."),
    ("memory_vc", "For databases, Vercel has its Marketplace: one-click Postgres from Neon or Supabase, Redis and vectors from Upstash, all billed through Vercel."),
    ("memory_vc", "For agent memory, Mem0 just joined the Marketplace too. Convenient, but these are partners' products: Vercel has no database or vector store of its own.", .4),

    ("memory_aws", "AWS has the deepest shelf. AgentCore Memory keeps the short-term conversation, and pulls out long-term memories, like \"prefers window seats\"."),
    ("memory_aws", "S3 stores files, DynamoDB stores fast records, and S3 Vectors keeps embeddings cheaply, right inside S3."),
    ("memory_aws", "Bedrock Knowledge Bases give you managed search over your documents, with connectors for SharePoint, Confluence and more."),
    ("memory_aws", "Powerful, but that's several services, each with its own setup and its own bill.", .4),

    ("quiz1", "Quick check! Atlas runs on Vercel and needs a Postgres database for bookings. Where does it come from?", 2.6),
    ("quiz1", "The Vercel Marketplace! Vercel doesn't make its own database, so you add Neon, Supabase or another partner in one click.", .6),

    ("memory_score", "Scorecard time."),
    ("memory_score", "Cloudflare: everything built in, from per-agent SQL to vectors. Vercel: files plus one-click partners. AWS: the deepest set of memory services, with the most wiring.", .6),

    # ---------------- 5. time ----------------
    ("time", "Chapter five: time. Atlas needs to wait for prices to drop, check back every morning, and pause for days until the traveller approves a booking."),
    ("time", "That's a job that must survive crashes and long waits. Let's see how each cloud keeps a promise over time.", .4),

    ("time_cf", "On Cloudflare, an agent can simply schedule itself: wake me up tomorrow at nine."),
    ("time_cf", "Queues soak up bursts of work, and Workflows run multi-step jobs that retry each step on failure."),
    ("time_cf", "A workflow can even wait for an event, like the traveller tapping \"approve\", for days.", .4),

    ("time_vc", "Vercel's answer is Vercel Workflows, built on the open-source Workflow SDK."),
    ("time_vc", "You mark a function with \"use workflow\", and each step with \"use step\". Steps retry, and the whole run survives crashes and redeploys."),
    ("time_vc", "A workflow can sleep for days or months, and a run has no time limit, though each single step still fits inside a function's limit."),
    ("time_vc", "Vercel Queues are in public beta, and cron jobs handle the daily price check.", .4),

    ("time_aws", "AWS has two answers. Step Functions draws the workflow as a diagram of states, and can now run AgentCore agents with human approval steps."),
    ("time_aws", "And Lambda durable functions, new since December, let you write the workflow as plain code: do a step, then wait."),
    ("time_aws", "A durable run can last up to a year, and you're not billed while it waits. SQS queues and EventBridge schedules fill in the rest.", .4),

    ("time_score", "Scorecard."),
    ("time_score", "All three now have real durable workflows. Cloudflare's live right next to the agent, Vercel's feel like plain TypeScript, and AWS gives you both diagrams and code.", .6),

    # ---------------- 6. hands ----------------
    ("hands", "Chapter six: hands. Atlas needs tools: call airline APIs, browse a hotel website, and run code to crunch prices."),
    ("hands", "The universal plug for tools is MCP, the Model Context Protocol. All three clouds speak it.", .4),

    ("hands_cf", "Cloudflare hosts MCP servers on Workers, and its own MCP server covers its entire API with just two tools: search and execute."),
    ("hands_cf", "Code Mode lets the model write a little code instead of calling tools one by one, which saves a huge number of tokens."),
    ("hands_cf", "Browser Run gives Atlas a real browser, with a live view so a human can step in, and Sandboxes run full Linux containers for code.", .4),

    ("hands_vc", "Vercel hosts MCP servers with its mcp-handler package, and the AI SDK can connect to any MCP server."),
    ("hands_vc", "Vercel Sandbox runs untrusted code in Firecracker microVMs, for up to 24 hours per session."),
    ("hands_vc", "A neat trick: its firewall injects secrets into outgoing requests, so the API key never even enters the sandbox."),
    ("hands_vc", "There's no managed browser product, so you run one inside Sandbox, or add Browserbase. And Vercel Connect hands agents short-lived tokens for Slack, GitHub and a hundred more.", .4),

    ("hands_aws", "AWS has AgentCore Gateway, which turns your existing APIs and Lambda functions into MCP tools, with search for when you have hundreds of them."),
    ("hands_aws", "AgentCore Code Interpreter runs Python and JavaScript in a sandbox, and AgentCore Browser gives Atlas a managed Chrome."),
    ("hands_aws", "Nova Act is an agent specialized in clicking through websites, and the AWS MCP Server lets an agent call over fifteen thousand AWS APIs, for free.", .4),

    ("quiz2", "Quick check! On Vercel, Atlas must safely run a Python script that the model just wrote. Which service?", 2.6),
    ("quiz2", "Vercel Sandbox! AI-written code runs isolated in its own microVM. On Cloudflare you'd reach for Sandboxes, and on AWS, Code Interpreter.", .6),

    ("hands_score", "Scorecard."),
    ("hands_score", "Cloudflare: MCP plus Code Mode, browsers and sandboxes. Vercel: the best-guarded sandbox, plus Connect for app tokens. AWS: the most managed tools, all behind one gateway.", .6),

    # ---------------- 7. senses ----------------
    ("senses", "Chapter seven: senses. How does Atlas talk to people? Through chat, voice and email."),
    ("senses", "Chat works everywhere, but live connections differ. Cloudflare agents keep WebSockets open and hibernate between messages, for as long as they like."),
    ("senses", "Vercel's WebSockets are in beta and bound by the function time limit, while AgentCore streams over WebSockets for up to an hour."),
    ("senses", "To reach people in Slack, Teams or WhatsApp, Vercel's Chat SDK is the easiest: write one bot, run it in many apps.", .4),

    ("senses_2", "For voice, Cloudflare has voice agents in beta, Vercel's gateway offers realtime speech models, and AWS has Nova 2 Sonic, a speech-to-speech model."),
    ("senses_2", "For email, Cloudflare Email Service lets an agent receive and send mail, in beta. AWS has SES. Vercel has no email product, so you'd use a partner like Resend.", .4),

    ("senses_score", "Scorecard."),
    ("senses_score", "Cloudflare: long-lived connections, plus email and voice. Vercel: the easiest multi-app chat bots. AWS: the most mature voice and email services.", .6),

    # ---------------- 8. safety ----------------
    ("safety", "Chapter eight: safety and identity. Atlas holds personal data and can spend money, so we need locks, IDs and rules."),
    ("safety", "Three questions: who can talk to the agent, what can the agent touch, and can websites trust it?", .4),

    ("safety_cf", "Cloudflare: Workers VPC lets Atlas reach private systems without exposing them to the internet, and MCP server portals put company tools behind one secure door."),
    ("safety_cf", "Web Bot Auth gives Atlas a signed passport, so websites can verify it's a real, well-behaved agent. And AI Crawl Control lets sites choose which bots get in.", .4),

    ("safety_vc", "Vercel: BotID stops bots on important pages, the firewall has AI bot rules and rate limits, and OIDC gives functions short-lived cloud credentials instead of stored secrets."),
    ("safety_vc", "Enterprise plans add Secure Compute, a private network with static IPs. It protects the web app well, but there's no signed-agent passport like Web Bot Auth.", .4),

    ("safety_aws", "AWS has the most tools here. AgentCore Identity gives each agent its own identity, and keeps OAuth tokens and API keys in a vault."),
    ("safety_aws", "AgentCore Policy checks every tool call against rules written in a language called Cedar. The rules live outside the model, so a confused agent can't talk its way past them."),
    ("safety_aws", "Bedrock Guardrails filter harmful content and personal data, and AWS WAF can verify Web Bot Auth signatures too.", .4),

    ("safety_score", "Scorecard."),
    ("safety_score", "Cloudflare: private networking and verifiable bots. Vercel: strong protection for the web app. AWS: the deepest identity, policy and guardrails.", .6),

    # ---------------- 9. money ----------------
    ("money", "Chapter nine: money. Soon, agents will pay for things on their own, like a paid flight-price API."),
    ("money", "The shared idea is x402. A website answers \"payment required\", the agent pays a tiny amount, and gets the data."),
    ("money", "Cloudflare built x402 into its Agents SDK, and lets websites charge AI crawlers for access."),
    ("money", "AWS went furthest. AgentCore payments, available since August, gives agents wallets with spending limits, and AWS WAF lets websites charge bots."),
    ("money", "Vercel had an early x402 experiment for MCP tools, but no payment product today.", .6),

    # ---------------- 10. ship ----------------
    ("ship", "Chapter ten: shipping it. How do you deploy Atlas, and watch what it's doing?"),
    ("ship", "Vercel is famous for this. Every git push gets its own preview link, with instant rollbacks and gradual rollouts."),
    ("ship", "Cloudflare deploys worldwide in seconds with one command, now with Worker Previews, and Agents tracing, in beta, shows every step Atlas took."),
    ("ship", "AWS has AgentCore Observability in CloudWatch, plus AgentCore Evaluations, where another model grades Atlas's answers."),
    ("ship", "On AWS you'll usually describe the whole setup as code with the CDK. Powerful, but more to learn.", .6),

    # ---------------- 11. bill ----------------
    ("bill", "Chapter eleven: the bill. How does each cloud charge for an agent like Atlas?"),
    ("bill", "Say Atlas spends one minute planning a trip, but only a couple of seconds of that is real computing. The rest is waiting on the model."),
    ("bill", "Cloudflare Workers charge CPU time only, with paid plans starting at $5 a month, and downloading files from R2 is free."),
    ("bill", "Vercel charges Active CPU, plus the memory it keeps reserved, and has a free Hobby tier for experiments."),
    ("bill", "AWS AgentCore charges active CPU and memory by the second, while classic Lambda charges the whole minute. And every extra, like memory, tool calls and logs, has its own meter."),
    ("bill", "Model tokens usually dwarf all of this, which is why gateways, caching and cheaper models matter most.", .6),

    # ---------------- 12. verdict ----------------
    ("scoreboard", "Let's put the whole scorecard together."),
    ("scoreboard", "Body and code: Cloudflare for instant agents that remember, Vercel for agents inside web apps, and AWS for long, isolated sessions."),
    ("scoreboard", "Brain and memory: Cloudflare hosts open models with storage built in, Vercel has the simplest gateway with partners for storage, and AWS has the biggest catalog and the deepest memory."),
    ("scoreboard", "Time and hands: all three have durable workflows and sandboxes. AWS manages the most tools for you, Cloudflare runs them most efficiently, and Vercel makes them feel easiest."),
    ("scoreboard", "Safety and money: AWS leads on identity, policy and payments, and Cloudflare leads on proving an agent is trustworthy.", .8),

    ("pick", "So which one should you pick? It depends on who you are."),
    ("pick", "If your agent lives inside a Next.js app and you want to ship fast, start with Vercel."),
    ("pick", "If you want millions of always-on agents, each with its own state, running close to users at low cost, pick Cloudflare."),
    ("pick", "If your company already runs on AWS, with strict compliance and data rules, AgentCore and Bedrock fit right in."),
    ("pick", "And you can mix: the AI SDK runs on Cloudflare, Vercel's gateway can reach Bedrock, and MCP connects them all.", .6),

    ("quiz3", "Last quick check! A bank on AWS wants every tool call its agent makes checked against strict rules, outside the model. Which service?", 2.6),
    ("quiz3", "AgentCore Policy! Its Cedar rules check every tool call at the gateway, no matter what the model says.", .6),

    ("outro", "You don't have to choose forever. Start with the cloud that fits your team, keep your agent code portable, and swap pieces as you grow."),
    ("outro", "Product names and statuses change fast, so check each provider's docs before you build."),
    ("outro", "Thanks for learning with me. Now go build an agent, on any cloud!", 2.0),
]


def main():
    out = []
    for ln in LINES:
        scene, cap, hold = ln[0], ln[1], (ln[2] if len(ln) > 2 else 0)
        d = {"scene": scene, "cap": cap}
        s = say(cap)
        if s != cap:
            d["say"] = s
        if hold:
            d["hold"] = hold
        out.append(d)
    Path(__file__).with_name("script.json").write_text(json.dumps(out, indent=1, ensure_ascii=False))
    scenes = []
    for d in out:
        if not scenes or scenes[-1] != d["scene"]:
            scenes.append(d["scene"])
    print(len(out), "lines,", len(scenes), "scenes")


if __name__ == "__main__":
    main()
