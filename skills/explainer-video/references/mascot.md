# Mascots

A mascot pack is a folder the engine copies into each project's `mascot/`.

## Choosing and saving
| What | Where |
|---|---|
| Default mascot | `mascots/presenter/`: the original plum-sweater presenter; see its [source and license](../mascots/presenter/SOURCE.md) |
| Custom mascot starter | Copy `mascots/code-example/` and edit `mascot.js` |
| The user's saved mascot | `~/.config/explainer-video/mascot/`, or `$EXPLAINER_VIDEO_CONFIG/mascot/` if set |

- `scripts/new-project.sh <project-dir> [mascot-dir|--default]` uses an explicit pack, then the saved pack, then the presenter mascot.
- Pass `--default` when the user declines a personal mascot; this bypasses the saved pack without replacing it.
- `scripts/save-mascot.sh <mascot-dir>` validates a pack and saves it as the user's mascot, replacing the previously saved one.

## Contract
Every mascot defines two things:
- `figure(x, y, height, t, o)`: draws the narrator.
  - `x, y` is the point between the feet on the floor; `height` is the on-screen height.
  - `o = { talk 0..1, look -1..1, happy 0..1, hop 0..1 }`. `talk` follows the voice loudness, `look` is a glance toward the content on the right, `happy` gives ^^ eyes, and `hop` is the progress of a hop.
- `window.READY`: a Promise that resolves once assets are loaded.

A mascot may also set `window.MASCOT_SPOTS = { big: {x, y, h}, corner: {x, y, h} }`. Use this when the default spots don't fit its shape; a wide mascot needs a smaller `h`, for example.

## Pack types
| Type | Files | Result |
|---|---|---|
| Image, animated face | `figure.png` + `meta.js` with `eyes` | Blinks, glances, happy eyes, and a capsule mouth that opens with the voice (set `mouth: false` in `meta.js` to hide it). The body breathes, sways, stretches while talking, and hops between spots |
| Image, static face | `figure.png` + `meta.js` without `eyes` | The same body motion; the face stays as painted |
| Code | `mascot.js` (plus any assets it loads from `mascot/`); start from `mascots/code-example/` | Anything you draw |

## Preparing an image the user already has
Use this when the user has a full-body character image with a transparent background, roughly 1024x1536.

1. Run the prep script:
   ```
   "${EXPLAINER_VIDEO_CACHE:-$HOME/.cache/explainer-video}/venv/bin/python" <skill-dir>/scripts/prep_mascot.py <image.png> <pack-dir>
   ```
   - It finds two dark eyes inside a lighter face and erases them, so the engine can redraw them.
   - It writes `<pack-dir>/figure.png` and `<pack-dir>/meta.js`.
   - If it can't find exactly two eyes, it keeps the face static and says so.
   - Pass `--static` to skip eye detection.
2. Check the result: create a project and render a still (`node render.mjs --stills 2,5`), then look at the face.
   - If the redrawn eyes sit wrong, correct `eyes` (`cx, cy, len, wid, ang` in image pixels) in `meta.js`.
   - If the mouth sits wrong, set `mouthDrop` (default 0.36, a fraction of the eye gap).

## Creating a mascot from a photo or a character image

1. Use an image the user owns or has permission to adapt. Ask for their preferred outfit or style only when it changes the requested result.
2. Generate 2–3 character candidates directly from that image with the prompt below and let the user choose. When image generation is unavailable, give the user the prompt and wait for the resulting image.
3. Prepare the selected image with `scripts/prep_mascot.py`, inspect a rendered still, and save the pack with `scripts/save-mascot.sh <pack-dir>` when the user wants it reused.

Character prompt (fill in the user’s preferences):

```text
Create a friendly illustrated presenter using the attached image as the reference for the person’s appearance.
Draw an original, simplified full-body character with a clear silhouette, expressive eyes, and a relaxed standing pose.
Use a coherent flat-color illustration style with an outfit matching <user preference or the reference image>.
Keep the face upright, arms relaxed, and the entire body visible with space around the head and feet.
Use a transparent background without a ground shadow, text, logos, or decorative framing.
Make the image 1024 by 1536 pixels. Keep the eyes clearly separated so they can be animated later.
```
