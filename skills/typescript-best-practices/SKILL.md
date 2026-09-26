---
name: typescript-best-practices
description: Use when reading or editing any .ts or .tsx file.
---

# TypeScript best practices

Read [type-system-discipline](../type-system-discipline/SKILL.md) for type-design principles; apply the TypeScript rules below to the code being inspected or changed.

| Rule | Summary |
|------|---------|
| Discriminated unions | Model variants with a `kind` literal discriminant so impossible states can't be represented. No optional-field bags. |
| Branded types | Brand primitives when accidental interchange is a concrete risk. Reuse the repository’s convention and validate at creation. |
| Constructive modeling | Use `[T, ...T[]]` for non-empty sequences and `[T, T][]` for pairs when required by the operations. |
| Simplest total type | Keep `T[]` while every operation on it stays total. Strengthen to `NonEmpty<T>` only where the loose type forces `!`, a cast, or a "should never happen" throw. |
| `unknown` over `any` | External data is `unknown`. `any` disables type checking everywhere it touches. |
| Assertions | Prefer narrowing and schema parsing; keep necessary assertions local to a proven invariant. |
| Narrowing hierarchy | Discriminant switch > `in` operator > `typeof`/`instanceof` > user-defined type guard > `as`. |
| Type guards | Must verify the claim. A lying guard is worse than `as` because the bug hides behind a name that says it's safe. Name them `isX` or `hasX`. |
| Exhaustiveness | Inline `const _exhaustive: never = x;` in default arms so the compiler errors when a new variant is added. |
| `satisfies` over `as` | Checks compatibility while retaining the expression’s inferred type. |
| Boundary validation | Parse where data crosses in, into a named domain type. `Record<string, unknown>` (however spelled) stops at that parse. Trust types inside. |
| Schema-derived types | Reach for `Pick`/`Omit`/`Parameters`/`ReturnType`/`Awaited`/`typeof` before declaring a new interface. |
| Object args | Prefer object arguments when names prevent ambiguous call sites; follow existing APIs. |
| Real tests | For implementation changes, use focused checks for changed behavior and the repository’s test conventions. |
| Structured telemetry | Prefer structured logger diagnostics with enough context to debug from an id. No `console.log` in shipped code. |

Read [patterns](references/patterns.md) when a rule needs a concrete example; adapt it to the repository’s types and conventions.
