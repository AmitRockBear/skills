---
name: write-skill
description: Use when creating, modifying or reviewing skills based on recurring corrections.
disable-model-invocation: true
---

1. Keep shared skills in the user’s selected collection and repository-owned skills in their repository. Install or link selected skills and their companion dependencies into the active host’s configured skills directory.
2. Keep the skill's description clear and concise, describing only when the model should invoke it, not what it does.
3. Link referenced skills/files by path and define their inputs, expected behavior and outputs. When behavior changes, update the existing rule, examples and caller contracts together.
4. Use concise, actionable instructions, preferably one line per rule, describing what the agent should do.
5. Make each instruction unambiguous: name the actor, put conditions before actions, and use consistent names for the same thing. Keep words needed for clarity. When a rule is easy to misinterpret, include one small example showing the intended result.
6. If the user requests invocation only when explicitly asked, set `disable-model-invocation: true` in the skill's YAML frontmatter and ensure `agents/openai.yaml` contains:

   ```yaml
   policy:
     allow_implicit_invocation: false
   ```

7. When reviewing skills from session history or recurring corrections, follow [reflection](references/reflection.md); use the supplied evidence and current instructions to propose the smallest justified change within the requested scope.
