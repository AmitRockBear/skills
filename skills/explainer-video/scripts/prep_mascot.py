"""Turn a full-body mascot image into an image mascot pack: figure.png + meta.js.

Usage: <cache>/venv/bin/python prep_mascot.py <image.png> <pack-dir> [--static]

Needs a transparent background. Finds two solid dark eyes surrounded by lighter, opaque face; erases them with the
surrounding color so the engine can redraw them (blink, glance, happy, talking mouth). If it can't find exactly two
eyes, or with --static, the image is kept as-is and the mascot only moves its body.
"""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage

args = [a for a in sys.argv[1:] if not a.startswith('--')]
src, out, static = Path(args[0]), Path(args[1]), '--static' in sys.argv
im = np.array(Image.open(src).convert('RGBA')).astype(np.float32)
if im[..., 3].min() > 0:
    sys.exit('image has no transparent background; remove the background first')
im[..., 3] = np.clip((im[..., 3] - 20) * 255 / 215, 0, 255)       # drop faint glow, make the body fully opaque
im[im[..., 3] == 0] = 0
rgb, al = im[..., :3], im[..., 3]
eyes = []
if not static:
    # eyes: near-black blobs completely surrounded by a light, opaque face (dark shoes/hair touch transparency or darker areas)
    dark = (rgb.max(-1) < 90) & (al > 250)
    lab, n = ndimage.label(dark)
    area = al.shape[0] * al.shape[1]
    for i in range(1, n + 1):
        blob = lab == i
        ys, xs = np.nonzero(blob)
        if not (area * 6e-5 < len(xs) < area * .03): continue
        ring = ndimage.binary_dilation(blob, iterations=7) & ~ndimage.binary_dilation(blob, iterations=3)
        if al[ring].min() < 250 or rgb[ring].mean() < 150: continue
        cx, cy = xs.mean(), ys.mean()
        _, evec = np.linalg.eigh(np.cov(np.vstack([xs - cx, ys - cy])))
        major = evec[:, 1]
        proj = (xs - cx) * major[0] + (ys - cy) * major[1]
        projm = (xs - cx) * -major[1] + (ys - cy) * major[0]
        eyes.append(dict(cx=float(cx), cy=float(cy), len=float(np.ptp(proj) + 2), wid=float(np.ptp(projm) + 2),
                         ang=float(np.degrees(np.arctan2(major[1], major[0]))), blob=blob))
    eyes.sort(key=lambda e: e['cx'])
    if len(eyes) != 2:
        print(f'found {len(eyes)} eye candidates instead of 2: keeping the image as-is (static face)')
        eyes = []
for e in eyes:  # erase: fill the grown eye with the local face color (median of a ring), feather the rim
    grow = ndimage.binary_dilation(e['blob'], iterations=4)
    ring = ndimage.binary_dilation(e['blob'], iterations=12) & ~ndimage.binary_dilation(e['blob'], iterations=7)
    skin = np.median(rgb[ring], axis=0)
    im[grow, :3] = skin
    edge = ndimage.binary_dilation(grow, iterations=2) & ~grow
    im[edge, :3] = (im[edge, :3] + skin) / 2
out.mkdir(parents=True, exist_ok=True)
Image.fromarray(np.clip(im, 0, 255).astype(np.uint8)).save(out / 'figure.png', optimize=True)
ys, xs = np.nonzero(al > 128)
bottom = ys.max()
meta = dict(size=[im.shape[1], im.shape[0]], feet=[float(xs[ys > bottom - 60].mean()), float(bottom)], top=float(ys.min()))
if eyes:
    meta['eyes'] = [{k: v for k, v in e.items() if k != 'blob'} for e in eyes]
(out / 'meta.js').write_text('window.FIGURE_META = ' + json.dumps(meta) + ';\n')
print('wrote', out / 'figure.png', out / 'meta.js', '(animated face)' if eyes else '(static face)')
