# Behavior review

Use this reference for shared-code changes, refactors and lint migrations. Inputs are the accepted requirements, inspected base/head diff, affected callers and available verification evidence; output is a compact table in the existing [evidence report](evidence.md).

1. Trace changed contracts to affected entry points, including indirect consumers, and identify the assumption that makes each change safe.
2. Group equivalent paths; give distinct rows to paths with different behavior, identities, flag states or side effects. Scale coverage to the actual change.
3. For each row, state the expected effect, distinguishing preserved behavior from an approved behavior change; name the relevant invariant and observable result.
4. Compare matching base/head scenarios through the relevant running entry point. Use the parent skill's authorization, runtime, UI, identity and revision rules; label missing baselines and code-only conclusions.
5. Record proof or a precise gap for each row. Reuse the report's tested/assessed revisions and fresh/reused/untested categories; explain reuse and rerun changed or uncertain behavior when code, dependencies, base or environment changes.

| Affected entry point / invariant | Expected effect | Before/after evidence | Remaining limit |
|---|---|---|---|
| Example: valid extension preview uses the changed validator | Existing valid input still succeeds | Reference matching requests and results at tested base/head | Name an untested caller or missing baseline |

This row is an example, not verification evidence. A UI row requires an explicit UI-check request; otherwise record its coverage limit and continue authorized checks.
