# Script rules

The script is `LINES` in the project's `make_script.py`. Each entry is `(scene, caption[, hold])`. One caption is one narrated line and one on-screen caption.

## Structure
1. **`intro`** (2–3 lines). The mascot greets, names the subject, and promises "no background needed, one example built piece by piece".
2. **Basics** (3–5 lines). Explain the core idea the rest depends on. Example: "what is an AI agent" before any product.
3. **Running example** (3–4 lines). Introduce one concrete, relatable example that every chapter builds on. Example: Atlas, a trip-planning agent: "Plan me five days in Lisbon in October, under $2,000."
4. **Chapters.** Open each with a chapter scene whose first line is "Chapter N: <title>." plus the example's concrete need. Then give one scene per concept, each plugging the concept into the running example.
5. **Quizzes.** Add one every 4–6 minutes as a `quizN` scene with two lines:
   - line 0: the question, with `hold` 2.6 (this is the countdown);
   - line 1: the answer, which also explains the wrong options.
6. **Recap or scorecard.** Put the example back together from all the pieces.
7. **`outro`** (2–3 lines): how to start small, where to learn more (official docs), and a goodbye as the last line.

## Comparison videos ("X vs Y vs Z")
- Build each chapter as: need → option X → option Y → option Z → scorecard row.
- Keep a running scorecard (`scoreGrid` in `kit.js`), one row per chapter.
- End with a full scorecard, a "which one should you pick" guide by persona, and how to mix the options.
- Cover every criterion the user asked about in its own chapter or scene. Example: ZDR and BYOK.

## Document videos (explaining a given text, HTML or plan file)
- Follow the document's own structure: one chapter per major section, in the document's order, with the chapter titles taken from its headings.
- Use the document's central scenario as the running example. For a plan, that is the change it makes; for a spec, the main user flow; for a report, its key finding. When the document has no scenario, pick one of its concrete cases.
- Start with a "what this document is and why it exists" scene: its goal, who it is for, and the decision or outcome it drives.
- Explain what the document says, in plain words. Claims come from the document; background comes from `sources.md` entries marked as background.
- For a plan, cover the problem, the chosen approach, the steps, the risks and open questions, and what happens next. For each step, show what changes and why.
- Show code, commands, tables and diagrams from the document as on-screen visuals when they carry the idea, quoting them exactly.
- End with a recap of the document's key decisions or takeaways, and point the outro at the document itself as the place to read more.

## Lines
- Keep one idea per line, under ~180 characters, in plain words a beginner knows.
- Use a metaphor for each abstract idea, and reuse it visually. Examples: control tower, warehouse, taxi meter, passport, sticky notes.
- State numbers, limits, prices and statuses (GA, beta, preview) only when they come from `sources.md` or the source document. Say "in beta" when true.
- Add `hold` 0.4–0.6 on the last line of a scene, and 2.0 on the final goodbye.
- Add a `SAY` entry for every acronym, symbol and tricky name. Examples: `"AWS": "A W S"`, `"x402": "x four oh two"`, `"$2,000": "two thousand dollars"`.
- Stamp the outro with "as of <today's date>" when the subject changes fast.

## Length
- A line averages ~7.5 s of narration: 130 lines ≈ 16 minutes, 170 lines ≈ 23 minutes.
- Let length follow the subject: spend lines where a concept deserves them, and cut lines that only repeat.
