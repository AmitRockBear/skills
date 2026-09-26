# Scene-worker brief: "AI Agent Clouds, compared: Cloudflare vs Vercel vs AWS"

## Goal
You are implementing animated scenes for a ~23-minute 2D explainer video. The video compares what Cloudflare, Vercel and AWS offer for building AI agents. The audience is a beginner, so teach at a gentle pace.

- The narrator is a custom cartoon character. The engine draws the character and the captions; you never draw them.
- The running example is **Atlas, a trip-planning agent** ("Plan me 5 days in Lisbon in October, under $2,000").
- Every chapter builds one piece of Atlas three times, once per cloud, and then fills in a scorecard.

## How the video works
- **Narration is fixed.**
  - `script.json` holds each caption (`cap`) and its scene.
  - `timeline.js` holds the exact start and end time of every line.
  - Read your scenes' lines with: `node -e "const L=require('./script.json');L.forEach((l,i)=>console.log(i,l.scene,'|',l.cap))"`.
- **Rendering.** `renderAt(t)` draws each frame on a 1920x1080 canvas and must be deterministic:
  - Draw purely as a function of `t`.
  - Keep no state between frames.
  - Never use `Math.random`; use `rng(seed)` instead.
- **Load order:**
  1. `core.js`: helpers, palette `C`, the `SCN` registry.
  2. `figure.js`: the narrator.
  3. `kit.js`: the shared visual kit.
  4. `scenes.js`: chapter map `CH`, intro, scorecard scenes.
  5. `scenes_<PART>.js`: **your file**.
  6. `main.js`: the engine.
- **Registering a scene:**
  ```js
  SCN.<name> = { chapter: CH.<key>, draw(S, t) { ... }, guide?: (S, t) => ({ ... }) };
  ```
  - `CH` keys: `body code brain memory time hands senses safety money ship bill verdict`.
  - Scenes before chapter 1 (`meet`, `agent`, `atlas`) use `chapter: null`.
- **Staging.** The engine draws your scene at 0.86 scale, shifted right, so the narrator has a reserved column on the left. **Lay out in normal 1920x1080 scene coordinates.**
  - Content area: x 60–1860, y 110–850.
  - Don't place content below y 850.
  - The chapter chip and progress bar are drawn by the engine.
- **Timeline helpers on `S`.** `j` is the line index *within the scene*, starting at 0.

  | Helper | What it gives you |
  |---|---|
  | `S.p(j, off=0, dur=.6, ease)` | Eased 0→1 progress, starting at line j's start + `off` seconds |
  | `S.pf(j, frac, dur)` | Same, but starting a fraction of the way through line j. Use it to hit a word mid-line |
  | `S.out(j, off, dur)` | 1→0 at line j. Multiply it in to retire an earlier visual |
  | `S.ls(j)`, `S.le(j)`, `S.at(j, frac)` | Raw times |
  | `S.cur()` | Current line index |
  | `wordAt(scene, j, 'word')` (in `scenes.js`) | The fraction of line j where that word is spoken. Use it with `S.pf` to sync a visual to a provider name |

- **Drawing helpers.**
  - `core.js`: `text`, `measure`, `card`, `rr`, `pop`, `fade`, `alpha`, `wrap`, `pill`, `arrow`, `check`, `cross`, `node`, `shield`, `bug`, `confetti`, `codeBlock` (typing reveal + line highlight), `chars`, and the easings `eOut`, `eIO`, `back`.
  - `kit.js`, general:
    - `cloud` and `atlas(x, y, s, t, {mood: ok|think|happy|sleep})`
    - `serviceCard`, `badge('beta')`, `icon(kind, x, y, s, color)` (the kind list is in the file)
    - `person`, `phone`, `laptop`, `server`, `bubble`, `packet`, `line`
    - `chapterTitle(S, n, title, iconKind)` and `countdown`
  - `kit.js`, comparison helpers:
    - `PV[k]` gives provider colors (`col`, `light`, `ink`, `name`). `PROVS = ['cf','vc','aws']`.
    - `logo(k, x, y, s)` draws a brand glyph. `provTile(k, x, y, r)` draws the logo in a tile with the name. `provChip(k, x, y)` draws a small inline chip.
    - `triCards(cols, p, o)` draws three side-by-side comparison cards.
    - `scoreGrid(o)` and `SCORE`: the running scorecard. It is already used by the `*_score` scenes, so don't re-implement it.

## Reference scenes
This example's own `scenes.js` and `scenes_A..F.js` (in the same folder as this brief) contain polished scenes you may **copy and adapt**: provider tiles, the globe, microVM boxes, the AI Gateway control tower, storage cards, workflows, MCP, sandboxes, the quiz layout, Web Bot Auth, x402 and the scorecard.
- If you copy a helper, rename it with your part's prefix (e.g. `a_globe`) so it can't collide with other parts.
- Watch the style there: cards, soft shadows, pills, and visuals that retire before the next arrives.

## Layout and style rules
- **Type sizes:** scene titles at y ≈ 150–170, `SERIF` 54px, centered at x 960. Labels ≥ 24px. Code 28–34px.
- **Provider colors:** Cloudflare `PV.cf`, Vercel `PV.vc` (black), AWS `PV.aws` (navy, with an orange smile in the logo). Use the logos (`logo`, `provTile`, `provChip`) to label whose piece is on screen, every time a provider is introduced.
- **Other colors:**
  - `C.blue` for Atlas.
  - `C.green` for good and `C.red` for a limit or catch.
  - `C.purple` for beta or preview.
  - `C.acc` (teal) as the neutral accent of this video.
- **Status badges:** put a `badge('beta')` or `badge('private beta')` next to a product when the narration says beta or preview.
- **One visual at a time:** retire each visual before the next takes its place (`S.p(j) * S.out(j+1)`). No overlapping text.

## Teaching and animation quality bar
- **Motion:**
  - Every narration line must visibly change the screen, in sync with its words (use `S.pf` with `wordAt` for key words).
  - Nothing should sit static for more than about 3 seconds; use gentle motion such as packets flowing, pulses, bobbing or meters ticking.
- **Metaphors:** show the ones the narration uses, for example kitchens, a warehouse, a taxi meter, a stopwatch, a vault, a passport, a control tower or a shredder. Show Atlas doing the trip example whenever it fits.
- **Code:** only show snippets listed in your part, in a `codeBlock` with a typing reveal and the key line highlighted. Don't invent APIs.
- **Numbers and claims:** show only what the narration says, or the facts in your part's notes. Don't add new ones.
- **Narrator staging (optional):** a scene may add `guide: (S, t) => ({ look: [{t0, t1, v}], happy: 0|1, hops: [t0] })`.
  - `look` makes the narrator glance at the material. A default glance already happens on every line.
  - `happy` gives ^^ eyes; `hops` is a happy hop in place.
  - Quiz answer lines should use `happy` and `hops`, like `SCN.quiz2` in the reference `scenes_C.js`.

## Constraints
- Edit **only** `scenes_<PART>.js` in your directory. Don't modify shared files.
- Define any helper inside your file, with your prefix.
- Don't change narration or timing.
- No network access or new dependencies are needed.

## Verification (required)
- For each of your scenes, run `node scene-sheet.mjs <scene> 3` from your directory.
  - It renders 3 samples per line into `build/sheets/<scene>.png` and fails on JS errors.
  - Full-resolution frames go to `build/sheets/tmp-<scene>/`.
- Open the PNGs with the Read tool and inspect them. Check for:
  - overlaps;
  - text below y 850 or running off-canvas;
  - empty or static moments;
  - illegible sizes;
  - visuals that don't match the words.
- Iterate until every scene is clean.
- Finally run `node sweep.mjs`. The only allowed output is errors coming from other parts' missing scenes (these render as TODO, not errors), so it should print "no errors across all frames".

## Output
Your final message should include:
- the scenes you implemented;
- a one-line visual summary per narration line;
- any helper you defined;
- anything you're unsure about.
