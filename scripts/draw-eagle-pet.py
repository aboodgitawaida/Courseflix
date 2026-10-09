"""Petted Study Eagle sheet (3 frames, 160x160 each, lean in / deeper / peak).

The real side-view head from eagle-spritesheet-hq.png, eyes squeezed happily
shut and tilted beak-up as if pushing into the hand, on an upright, fluffed
body with the folded wing tips lifting.

Run: python3 scripts/draw-eagle-pet.py public/eagle-spritesheet-hq.png public/eagle-pet-spritesheet-hq.png
"""
import os
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from eagle_paint import (  # noqa: E402
    DARK, MID, TAN, H, W, add_head, dilate, erode, feet, finish, load_ref,
    make_head, make_noise, paint_region, premul_rotate, shape_mask,
)

SHEET, OUT = sys.argv[1], sys.argv[2]
P = dict(a.split("=") for a in sys.argv[3:])
NOISE = make_noise(int(P.get("seed", 5)))
HEAD = make_head(load_ref(SHEET), eye="happy")

# (head tilt in degrees, beak-up negative; head lift px; fluff px; wing-tip lift px)
FRAMES = [(-6, 0, 0, 0), (-12, 2, 1, 2), (-18, 4, 2, 4)]


def frame(fluff, lift, shade):
    img = np.zeros((H, W, 4), np.uint8)
    f = fluff

    def body_fn(d, s):
        d.ellipse(((56 - f) * s, 70 * s, (114 + f) * s, 134 * s), fill=255)        # upright body, chest low and full
        d.ellipse((64 * s, (60 - f) * s, 106 * s, 100 * s), fill=255)               # raised shoulders
        # fluffed feathers: a few small tufts along the chest and back
        for cx, cy in [(57, 100), (58, 116), (112, 84), (115, 100)]:
            dx = -f if cx < 80 else f
            d.ellipse(((cx + dx - 4) * s, (cy - 4) * s, (cx + dx + 4) * s, (cy + 4) * s), fill=255)
    body = shape_mask(body_fn)
    body[133:] = False                                                                # sitting on the perch
    tail = shape_mask(lambda d, s: d.polygon([(104 * s, 112 * s), (130 * s, 120 * s), (131 * s, 127 * s), (104 * s, 131 * s)], fill=255))
    sil = body | tail
    paint_region(img, sil, TAN, NOISE)
    paint_region(img, tail & ~body, MID, NOISE, edge_band=6, dark_bias=0.5, silhouette=sil)
    # folded wing on the side, tips lifting a little with the happy shiver
    wing = shape_mask(lambda d, s: d.polygon([
        (70 * s, 70 * s), (92 * s, 64 * s), (108 * s, 72 * s), (118 * s, 90 * s),
        (128 * s, (106 - lift) * s), (134 * s, (112 - lift) * s), (126 * s, (113 - lift) * s),
        (130 * s, (118 - lift) * s), (114 * s, (118 - lift) * s), (90 * s, 116 * s), (70 * s, 104 * s), (64 * s, 86 * s)], fill=255))
    wing &= dilate(sil, 1)
    paint_region(img, wing, TAN, NOISE, edge_band=4, shade_shift=shade, silhouette=sil)
    # primaries: soft dark separations toward the tips
    inner = erode(wing, 3)
    for k, (yo, xs) in enumerate([(100, 96), (106, 100)]):
        for x in range(xs, 130):
            y = int(round(yo - lift + (x - xs) * 0.2))
            if inner[y, x] and (x + 2 * k) % 7: img[y:y + 2, x, :3] = DARK
    feet(img, (70, 88))
    return img


frames = []
for i, (tilt, head_lift, fluff, wing_lift) in enumerate(FRAMES):
    head_rot = premul_rotate(HEAD, tilt)
    hh, hw = head_rot.shape[:2]
    # keep the neck anchored at the chest while the beak tips up
    oy, ox = 94 - hh - head_lift, 38
    frames.append(add_head(finish(frame(fluff, wing_lift, 0.3 * i)), head_rot, oy, ox, trim_light_edges=True))
Image.fromarray(np.concatenate(frames, 1), "RGBA").save(OUT)
