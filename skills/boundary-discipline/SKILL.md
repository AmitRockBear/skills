---
name: principle-boundary-discipline
description: Use when wiring validation, error handling or framework adapters.
disable-model-invocation: true
---

1. Validate external data at entry points such as CLI arguments, configuration, network requests and stored data. Parse it into the types the system uses.
2. Reuse established invariants internally; check domain preconditions where operations can invalidate them. Propagate errors to the boundary that can handle them.
3. Keep framework adapters thin. Extract pure business logic when it clarifies responsibilities or supports focused checks.
4. Expose domain types where the public contract differs from transport or storage; reuse authoritative types when the contracts match.
