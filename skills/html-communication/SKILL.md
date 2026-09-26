---
name: html-communication
description: Use this skill when the user wants a plan, spec, write-up, findings, summary, report, comparison, or set of UI mocks presented as readable HTML. Do not use it for HTML that ships as part of a product.
---

# Guidelines for non UI Mocks

Write for a reader with fresh context, using plain language and only sections relevant to the task. Use consistent names across prose, examples and diagrams. Explain consequences concretely, using real symbols and values where relevant.

1. Lead with the problem, outcome, one short end-to-end example and core decisions; put detailed file/schema accounting afterward. Distinguish agreed decisions, recommendations and open questions.
2. Explain changes with one concrete scenario and labeled Before/After diagrams. For complex flows, start with the visible effect and introduce one component at a time in small diagrams before explaining symbols, storage details and exceptions. When comparing approaches, illustrate each meaningful alternative.
3. For implementation plans, cover scope, relevant components and data contracts, implementation order, and a short Verification section with concrete actions and expected observable results.
4. When decisions change, reconcile all affected prose, diagrams, and values into one current plan. Keep every section consistent with the latest agreed design.

Create one self-contained HTML file, capped at 512 KB.

- Use a compact spec layout: a centered reading column, short sections, system fonts, and minimal CSS. Place Before/After diagrams side by side on wide screens and stack them on mobile. Use tables for comparisons.
- Use palette: background `#1f1a24`, surfaces `#29232d`, text `#f9f8fb`, secondary text `#e7d0dd`, links/code `#d8c3ef`, and accent fills `#a3004c` with text `#fbd0e8`. Keep accents sparse.
- Make it mobile-readable with a responsive viewport and no fixed-width layout.
- Use semantic HTML, inline CSS, inline SVG, and HTTPS or data-URL images.
- Use an inline classic script only when interactivity materially helps. Keep scripted pages useful without JavaScript; the sandbox blocks storage, fetch, workers, frames, forms, and popups.
- In script-free files, give external links `target="_blank"` and `rel="noopener noreferrer"`. If any script exists, omit `target="_blank"`.

Never include external or module scripts, inline event handlers, `javascript:` URLs, forms, frames, embeds, objects, applets, meta refresh, linked stylesheets, secrets, private URLs, or local filesystem paths.

## Guidelines for UI Mocks

When the user asks for UI mocks or variants for a component.

Design <component>. Generate multiple artifacts for the component, consider the following guidelines:

- Render real styled variants, not descriptions.
- Label them `A`, `B`, `C`... for easy selection.
- Lay them out for direct comparison.
- Use the repo's existing design system: prefer the shared components we already have and the configured Tailwind colors over new ones whenever they fit. Introduce something new only when what you are designing is genuinely unlike anything in the codebase, and say so.
- Every prototype must render all the states the component actually has — empty, loading, error, success, disabled, and any significant edge cases — visible and labeled on the page.
- Use the real copy for labels, buttons, empty states, and errors.
- When known, consider feature requirements, target route or screen, and relevant existing components.
- Note which parts reuse existing components and which are new.
