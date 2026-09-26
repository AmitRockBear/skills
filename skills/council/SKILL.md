---
name: council
description: Use when the user explicitly asks for a council or independent model-family perspectives on a decision.
disable-model-invocation: true
---

Inputs are the decision, accepted requirements, available evidence and evaluation criteria. Output is one recommendation with decisive evidence, material disagreements, unresolved facts and the actual participant roster. An explicit council request authorizes the participant consultations within that scope; findings do not authorize implementation.

## Default roster

| Family | Model | Effort | Execution route |
|---|---|---|---|
| OpenAI | Astra (`gpt-6-astra`) | `medium` | Native Codex subagent when supported; otherwise [use-codex](../use-codex/SKILL.md) |
| Anthropic | Claude Opus (`claude-opus-5-5`, as resolved by the host skill) | `high` | [use-claude](../use-claude/SKILL.md) |
| xAI | Grok 4.7 (`grok-4.7-high`) | `high` | [use-cursor](../use-cursor/SKILL.md) |

1. Honor explicit roster overrides and verify each requested model/effort is supported by its route before launching it. Report an unavailable participant or effort and ask how to proceed; preserve completed results and await the user's choice rather than silently substituting or declaring a reduced roster complete.
2. Prepare one self-contained brief with the decision, success criteria, accepted constraints, relevant repository paths, evidence, alternatives, non-goals and read-only scope. Ask each participant for its recommendation, strongest objection, assumptions and evidence that would change its answer. Supply the same substantive brief to all participants and collect independent answers before sharing their conclusions.
3. Use the host skills' session, process and output contracts. Read host-specific wrappers from their shared source when they are not exposed in the current host. For a native Codex participant, explicitly set model `gpt-6-astra`, effort `medium` and `fork_turns: none`. Give each participant its own output location; participants inspect source read-only, return their findings, and do not create further delegates. Honor a single-threaded request by consulting the roster sequentially when compatible with the user's requested execution method.
4. Record the actual model, effort, status and report/session reference for each participant. Wait for their results and surface failures or incomplete work. Resume the same participant session for a needed clarification using the relevant host contract.
5. Compare the reasoning against the agreed criteria and verify decisive factual claims through source inspection or a proportionate authorized experiment. Treat agreement as an opinion signal, not proof; resolve differences when evidence permits and state what remains uncertain.
6. Return one coherent recommendation, its tradeoffs, material dissent, supporting evidence and the fact or experiment that would settle each consequential unknown. Save the brief and results under the configured task outputs directory. Continue into implementation only when the user has authorized it.

## Example

"Use council to compare shared versus separate task sandboxes against our accepted latency, isolation and complexity requirements. Use the default roster; recommend an approach without implementing."

The three families independently evaluate the same brief. The coordinator checks decisive claims and recommends one design, explaining which tradeoff determines the choice.
