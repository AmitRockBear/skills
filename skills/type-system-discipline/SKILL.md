---
name: principle-type-system-discipline
description: Use when designing types, reviewing function signatures, or writing statically typed code.
disable-model-invocation: true
---

1. Model variants so invalid combinations cannot be constructed. For example, use `{ kind: 'open' } | { kind: 'done'; at: Date }` instead of a completion flag plus an optional timestamp.
2. Choose useful representations: a head plus a rest for a non-empty list, or pairs for an even-length sequence. Keep the simplest type that makes the required operations total; an optional result can model an absent value.
3. Brand primitives when accidental interchange is a concrete risk. Follow the repository’s convention and validate at construction.
4. Read [boundary-discipline](../boundary-discipline/SKILL.md) for where to parse external data and maintain invariants. Use its validated types internally.
5. Prefer inference, narrowing and validated construction. Keep necessary assertions local and make their invariant explicit.
6. Handle variants exhaustively so adding one exposes missing cases at compile time.
7. Derive types from authoritative schemas instead of maintaining duplicate shapes.
