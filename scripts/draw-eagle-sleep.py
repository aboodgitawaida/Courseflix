"""Sleeping Study Eagle sheet (3 frames, 160x160 each, rest / inhale / peak).

Uses the real side-view head from eagle-spritesheet-hq.png (eye closed, tilted
down) on a painted resting body in the sheet's palette, outline and halo.

Run: python3 scripts/draw-eagle-sleep.py public/eagle-spritesheet-hq.png public/eagle-sleep-spritesheet-hq.png
"""
import os
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from eagle_paint import (  # noqa: E402
    DARK, MID, OUTLINE, TAN, H, W, add_head, dilate, erode, feet, finish, load_ref,
    make_head, make_noise, paint_region, premul_rotate, shape_mask,
)

SHEET, OUT = sys.argv[1], sys.argv[2]
P = dict(a.split("=") for a in sys.argv[3:])
TILT = float(P.get("tilt", 14))
NOISE = make_noise(int(P.get("seed", 3)))

head_rot = premul_rotate(make_head(load_ref(SHEET), eye="sleep"), TILT)


def frame(back_rise, chest, shade):
    img = np.zeros((H, W, 4), np.uint8)
    br = back_rise
    # hunched body: shoulders rise behind the head, belly rests low, tail down-right
    def body_fn(d, s):
        d.ellipse(((44 - chest) * s, (76 - br) * s, 118 * s, 134 * s), fill=255)     # rounded body
        d.ellipse((52 * s, (70 - br) * s, 98 * s, 102 * s), fill=255)                # hunched shoulders
    body = shape_mask(body_fn)
    body[133:] = False                                                                 # resting flat on the perch
    tail = shape_mask(lambda d, s: d.polygon([(106 * s, 108 * s), (134 * s, 117 * s), (136 * s, 124 * s), (106 * s, 130 * s)], fill=255))
    sil = body | tail
    paint_region(img, sil, TAN, NOISE)
    paint_region(img, tail & ~body, MID, NOISE, edge_band=6, dark_bias=0.5, silhouette=sil)
    # folded wing laid over the body, tips ending in jagged dark primaries
    wing = shape_mask(lambda d, s: d.polygon([
        (64 * s, (82 - br) * s), (86 * s, (76 - br) * s), (104 * s, (84 - br) * s), (116 * s, 100 * s),
        (132 * s, 112 * s), (140 * s, 118 * s), (132 * s, 119 * s), (138 * s, 124 * s), (122 * s, 123 * s),
        (126 * s, 127 * s), (104 * s, 124 * s), (80 * s, 120 * s), (62 * s, 110 * s), (58 * s, 96 * s)], fill=255))
    wing &= dilate(sil, 1)
    paint_region(img, wing, TAN, NOISE, edge_band=4, shade_shift=shade, silhouette=sil)
    # primaries: a couple of soft dark separations toward the tips
    inner = erode(wing, 3)
    for k, (yo, xs) in enumerate([(108, 100), (114, 104)]):
        for x in range(xs, 136):
            y = int(round(yo + (x - xs) * 0.2 + (shade > 0)))
            if inner[y, x] and (x + 2 * k) % 7: img[y:y + 2, x, :3] = DARK
    feet(img, (68, 86))
    return img


frames = [add_head(finish(frame(*p)), head_rot, 62, 20) for p in [(0, 0, 0.0), (2, 0, 0.0), (2, 2, 0.35)]]
Image.fromarray(np.concatenate(frames, 1), "RGBA").save(OUT)
