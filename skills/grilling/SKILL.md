---
disable-model-invocation: true
name: grilling
description: Use when the user asks to grill or stress-test a plan, decision or idea.
---

Stress-test the requested decision until its material tradeoffs and dependencies are settled. Reuse accepted decisions and map unresolved choices as a **design tree**: each decision branches into the choices that depend on it.

Work the tree in **rounds**. The **frontier** is every decision whose prerequisites are already settled: the questions you can ask _now_ without guessing at answers you haven't heard yet. Ask the whole frontier in one round: number each question and give your recommended answer. Then wait for the user's answers before the next round.

Format a round like so:

```
❓ **Q1** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>

---

❓ **Q2** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>
```

Each round the user answers reshapes the tree: settled decisions push the frontier outward and unblock questions that depended on them. Recompute the frontier and ask the next round. A question whose answer depends on another question still open in this round belongs to a _later_ round, not this one.

Look up facts through inspection. Delegate substantial independent investigation under the active host’s delegation policy; continue questions that do not depend on its result. Ask the user about unresolved product or architecture choices and handle routine details using accepted decisions.

Finish when the requested decision’s material tradeoffs and dependencies are settled; summarize the agreed design and remaining assumptions. Wait for the user’s confirmation before implementation.
