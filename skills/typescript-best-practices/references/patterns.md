# TypeScript patterns

Code examples for each rule in `SKILL.md`. The underlying principles are language-agnostic; see the **type-system-discipline** and [boundary-discipline](../../boundary-discipline/SKILL.md) principle skills.

## Branded types

Brand primitives when accidental interchange is a concrete risk. Validate once at creation; downstream code reuses that invariant.

```ts
type AgentId = string & { readonly __brand: "AgentId" };

function parseAgentId(input: string): AgentId {
  if (!isUUID(input)) throw new Error(`Invalid agent id: ${input}`);
  return input as AgentId;
}

function focusAgent(id: AgentId): void {
  /* input is trusted */
}
```

Reuse the repository’s branding convention; the example illustrates one convention.

## Discriminated unions

If a bug forces the question "wait, can this combination actually happen?", the type is too loose. Model variants with a literal discriminant: every variant shares the field name and each variant's value is unique, so impossible combos can't be represented.

```ts
// Don't. Boolean + optionals lets contradictory states exist.
type DiffState = { loading: boolean; diff?: GitDiff; error?: string };

// Do. Only valid states exist.
type DiffState =
  | { kind: "loading" }
  | { kind: "ready"; diff: GitDiff }
  | { kind: "error"; error: string };
```

Pick one discriminant name (`kind`, `type`, `tag`) and stick to it.

## Constructive modeling

Build the type from parts that are all legal instead of restricting a loose type with runtime checks. Adding is easier than subtracting.

Non-empty, via a variadic tuple:

```ts
type NonEmpty<T> = [T, ...T[]];

// Don't: T[] plus a length check every caller must repeat
function pickWinner(entries: string[]): string {
  if (entries.length === 0) throw new Error("no entries");
  return entries[Math.floor(Math.random() * entries.length)];
}

// Do: an empty value of the type can't exist
function pickWinner(entries: NonEmpty<string>): string {
  return entries[Math.floor(Math.random() * entries.length)];
}
```

Where a plain `T[]` arrives, narrow once with a guard. The fact then travels in the type:

```ts
const isNonEmpty = <T>(arr: T[]): arr is NonEmpty<T> => arr.length > 0;
```

Even length, as pairs. TypeScript has no refinement types (no `arr.length % 2 === 0` at the type level); you don't need one:

```ts
type Pairs<T> = [T, T][];
```

## Simplest total type

Don't strengthen everything. Keep `T[]` when every operation on it is total:

```ts
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0); // [] is 0, fine
```

Strengthen when the loose type forces a lie at a use site. The tells are `!`, `arr[0] as T`, and a "should never happen" throw:

```ts
// Don't: partiality smuggled past the compiler
function newestSession(sessions: Session[]): Session {
  return sessions.at(0)!;
}

// Do: strengthen the input; the assertion disappears
function newestSession(sessions: NonEmpty<Session>): Session {
  return sessions[0];
}
```

Weakening the result to `Session | undefined` is the other total signature. Either way the empty case lands at the call site, the one place that knows what empty means.

## `unknown` over `any`

`any` disables type checking for everything it touches. External data is always `unknown`. Narrow before use.

```ts
// Don't
function handle(input: any) {
  return input.foo.bar;
}

// Do
function handle(input: unknown) {
  if (typeof input === "object" && input !== null && "foo" in input) {
    // narrowed; compiler verifies access
  }
}
```

External sources include RPC payloads, `JSON.parse`, `postMessage`, IPC, file contents, environment variables, database results.

## Assertions and parsing

Prefer narrowing and schema parsing. Keep necessary assertions local to a proven invariant.

```ts
import { z } from "zod";

const userSchema = z.object({ id: z.string(), name: z.string() });
type User = z.infer<typeof userSchema>;

function parseUser(data: unknown): User {
  return userSchema.parse(data);
}
```

Use discriminants to narrow variants and schemas to validate external input. Retain a local assertion only when the established invariant cannot be expressed through inference or narrowing.

## Narrowing hierarchy

From best to last-resort:

1. **Discriminated union switch / if.** Compiler narrows automatically.
2. **`in` operator.** `"key" in obj` narrows to variants containing that key.
3. **`typeof` / `instanceof`.** For primitives and class instances.
4. **User-defined type guard.** When the above aren't enough.
5. **`as` cast.** Only after validation.

```ts
function area(s: Shape): number {
  if ("radius" in s) return Math.PI * s.radius ** 2; // narrowed to circle
  return s.width * s.height; // narrowed to rect
}
```

## Type guards

A guard must actually verify the claim. A lying guard is worse than `as` because the bug hides behind a name that says it's safe.

```ts
function isCircle(s: Shape): s is Shape & { kind: "circle" } {
  return s.kind === "circle";
}
```

Prefer discriminant narrowing when possible. The guard adds a layer the reader has to follow.

## Exhaustiveness

In default arms, assign the discriminant to a `never`-typed local. The compiler errors if a new variant is added without handling.

```ts
// Value-returning switch
function area(s: Shape): number {
  switch (s.kind) {
    case "circle":
      return Math.PI * s.radius ** 2;
    case "rect":
      return s.width * s.height;
    default: {
      const _exhaustive: never = s;
      return _exhaustive;
    }
  }
}

// Void switch
function handle(s: Shape): void {
  switch (s.kind) {
    case "circle":
      drawCircle(s);
      break;
    case "rect":
      drawRect(s);
      break;
    default: {
      const _exhaustive: never = s;
      void _exhaustive;
    }
  }
}
```

Return-style in value-returning switches; void-style in statement switches.

## `satisfies` over `as`

Use `satisfies` to check compatibility while retaining the expression’s inferred type.

```ts
type Config = { theme: "dark" | "light"; cols: number };
const config = { theme: "dark", cols: 3 } satisfies Config;
```

Here `config.theme` is inferred as `"dark"`; literal preservation depends on the expression and its context.

## Boundary validation

Validate once where data crosses in; trust types inside. See the [boundary-discipline](../../boundary-discipline/SKILL.md) principle skill.

- **Wire formats:** choose unknown-field handling according to the protocol’s compatibility contract.
- **Persisted JSON:** versioned blob with a try/catch around the parse.
- **Don't re-validate** deep in call chains.

## Schema-derived types

When a `.proto`, OpenAPI spec, GraphQL schema, or database migration already defines a shape, derive from the generated types instead of duplicating them.

```ts
// Don't. Duplicate shape, drifts when the schema changes.
type CheckSummary = {
  totalCount: number;
  checks: { name: string; status: string }[];
};
function renderChecks(s: CheckSummary) {
  /* ... */
}

// Do. Derive from the generated schema type.
import type { ChecksMessage } from "<generated module>";
function renderChecks(s: Pick<ChecksMessage, "totalCount" | "checks">) {
  /* ... */
}
```

Reach for `Pick`, `Omit`, `Parameters`, `ReturnType`, `Awaited`, `typeof` before writing a new interface.

## Object args

Prefer named fields when positional arguments would be easy to confuse. Follow existing APIs and avoid changing signatures solely for this convention.

```ts
function selectRange(range: { startLine: number; endLine: number }) {
  return range.endLine - range.startLine;
}
```
