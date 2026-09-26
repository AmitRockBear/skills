# Scene-worker brief

## Goal
You implement animated scenes for a 2D canvas explainer video.
- The audience is a beginner, so teach at a gentle pace.
- A cartoon mascot narrates. The engine draws the mascot and captions; you never draw them.
- Your scenes, facts and snippets are in `parts/<PART>.md`.

## How the video works
- **Narration is fixed.** `script.json` holds each caption (`cap`) and its scene. `timeline.js` holds every line's exact start and end. List your lines with:
  ```
  node -e "const L=require('./script.json');L.forEach((l,i)=>console.log(i,l.scene,'|',l.cap))"
  ```
- **Rendering.** `renderAt(t)` draws each frame on a 1920x1080 canvas and must be deterministic:
  - draw purely as a function of `t`;
  - keep no state between frames;
  - never use `Math.random` (use `rng(seed)`).
- **Load order:**
  1. `core.js` (helpers, palette `C`, the `SCN` registry)
  2. `mascot/`
  3. `kit.js` (shared visual kit)
  4. `scenes.js` (chapter map `CH`, intro, `quizScene`, outro)
  5. `scenes_<PART>.js` (**your file**)
  6. `main.js` (engine)
- **Registering a scene:**
  ```js
  SCN.<name> = { chapter: CH.<key> | null, draw(S, t) { ... }, guide?: (S, t) => ({ ... }) };
  ```
  Quizzes: `SCN.quiz1 = quizScene(CH.x, { question, answers: [[name, iconKind, use]], right })`.
- **Staging.** The engine draws scenes at 0.86 scale beside the narrator's column. Lay out in normal scene coordinates:
  - content area: x 60–1860, y 110–850;
  - nothing below y 850;
  - the engine draws the chapter chip and progress bar.
- **Timeline helpers on `S`** (`j` is the line index *within the scene*):
  - `S.p(j, off=0, dur=.6, ease)`: eased 0→1 progress, starting at line j's start + `off` seconds.
  - `S.pf(j, frac, dur)`: the same, but starting a fraction of the way through line j.
  - `S.out(j, off, dur)`: 1→0 at line j. Multiply it in to retire an earlier visual.
  - `S.ls(j)`, `S.le(j)`, `S.at(j, frac)`: raw times.
  - `S.cur()`: current line index.
  - `wordAt(scene, j, 'word')` (in `scenes.js`): the fraction of line j where a word is spoken. Use it with `S.pf` to hit a word.
- **Drawing helpers:**
  - `core.js`:
    - text and layout: `text`, `measure`, `wrap`, `card`, `rr`, `pill`, `node`;
    - animation: `pop`, `fade`, `alpha`, `confetti`, and the easings `eOut`, `eIO`, `back`;
    - glyphs: `arrow`, `check`, `cross`, `shield`, `bug`;
    - code: `codeBlock` (typing reveal + line highlight), `chars`.
  - `kit.js`:
    - props: `cloud`, `serviceCard`, `badge('beta')`, `icon(kind, x, y, s, color)` (kinds listed in the file);
    - devices: `person`, `phone`, `laptop`, `server`;
    - `bubble`, `packet`, `line`, `chapterTitle(S, n, title, iconKind)`, `countdown`, `scoreGrid(cols, rows, o)`.

## Reference video
`<skill-dir>/examples/agent-clouds-compared/` is a finished 23-minute video in this engine. It is read-only. Copy and adapt from it:
- its scene files;
- its kit additions (provider logos, three-column cards, scorecard);
- its `parts/*.md` briefs.

If you copy a helper, rename it with your part's prefix (e.g. `a_globe`).

## Style rules
- **Titles:** at y ≈ 150–170, `SERIF` 54px, centered at x 960.
- **Sizes:** labels ≥ 24px, code 28–34px.
- **Colors:**
  - `C.acc` is the video's accent;
  - `C.green` for good, `C.red` for a limit or catch;
  - `C.purple` for beta or preview;
  - `C.ink` and `C.soft` for text.
- **Status badges:** put a `badge('beta')` next to a product when the narration says beta or preview.
- **One visual at a time:** retire each visual before the next arrives (`S.p(j) * S.out(j+1)`). No overlapping text.

## Quality bar
- **Motion:**
  - Every narration line visibly changes the screen, in sync with its words.
  - Nothing sits static for more than ~3 seconds. Use gentle motion such as flowing packets, pulses, bobbing or ticking meters.
- **Metaphors:** show the ones the narration uses, and show the running example whenever it fits.
- **Code:** only show the snippets listed in your part, in a `codeBlock` with a typing reveal and the key line highlighted.
- **Numbers and claims:** show only what the narration or your part's facts say.
- **Narrator staging (optional):** `guide: (S, t) => ({ look: [{t0, t1, v}], happy: 0|1, hops: [t0] })`.
  - `look` is a glance at the material; a default glance already happens on every line.
  - `happy` gives ^^ eyes.
  - `hops` is a happy hop in place.

## Constraints
- Edit only `scenes_<PART>.js`, and define helpers inside it with your prefix.
- Don't change narration, timing or shared files.

## Verification (required)
1. For each of your scenes, run `node scene-sheet.mjs <scene> 3`.
   - It writes `build/sheets/<scene>.png` (3 frames per line) and fails on JS errors.
   - Full-size frames go to `build/sheets/tmp-<scene>/`.
2. Open each sheet as an image and fix what you find:
   - overlaps;
   - text below y 850 or off-canvas;
   - static moments;
   - illegible sizes;
   - visuals that don't match the words.
   Repeat until clean.
3. Run `node sweep.mjs`. It must print "no errors across all frames".

## Output
Your final message lists:
- the scenes;
- a one-line visual summary per narration line;
- any helpers you defined;
- anything you're unsure about.
