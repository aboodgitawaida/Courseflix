"""Backflip Study Eagle sheet (10 frames, 160x160 each), built only from the
real frames of eagle-spritesheet-hq.png: no repainting.

  0      crouch       front hover, wings down
  1..8   flip         side view (fly-left), rotated backwards in 45deg steps
                      around its own centre: head goes up and over the back
  9      land         front hover, wings spread for balance

The jump arc (rise and fall) is CSS motion on the button; the sheet only
carries the pose and rotation.

Run: python3 scripts/draw-eagle-backflip.py public/eagle-spritesheet-hq.png public/eagle-backflip-spritesheet-hq.png
"""
import sys

import numpy as np
from PIL import Image

SHEET, OUT = sys.argv[1], sys.argv[2]
CELL = 160
sheet = Image.open(SHEET).convert("RGBA")


def cell(col, row):
    return sheet.crop((col * CELL, row * CELL, (col + 1) * CELL, (row + 1) * CELL))


def centred(im):
    """Move the eagle so its bounding-box centre sits at the frame centre."""
    a = np.asarray(im)[..., 3] > 0
    ys, xs = np.nonzero(a)
    dx = round(CELL / 2 - (xs.min() + xs.max() + 1) / 2)
    dy = round(CELL / 2 - (ys.min() + ys.max() + 1) / 2)
    out = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
    out.alpha_composite(im, (dx, dy))
    return out


def rotate(im, deg):
    """Rotate about the frame centre without colour fringes, keeping hard alpha.

    PIL angles are counter-clockwise; the side view faces left, so a backflip
    (head up and back over the shoulders) is a clockwise turn: negative angles.
    """
    a = np.asarray(im).astype(float)
    a[..., :3] *= a[..., 3:4] / 255                      # premultiply
    big = Image.fromarray(a.astype(np.uint8), "RGBA").resize((CELL * 4, CELL * 4), Image.NEAREST)
    rot = big.rotate(deg, resample=Image.BICUBIC).resize((CELL, CELL), Image.BOX)
    o = np.asarray(rot).astype(float)
    al = o[..., 3:4]
    o[..., :3] = np.where(al > 0, o[..., :3] * 255 / np.maximum(al, 1), 0)
    o[..., 3] = np.where(al[..., 0] > 110, 255, 0)
    o = o.clip(0, 255).astype(np.uint8)
    # Rotation breaks the sheet's thin light halo into specks; close it with a
    # 1px ring in the halo's own colour so the edge reads like the source frames.
    solid = o[..., 3] > 0
    ring = np.zeros_like(solid)
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        ring |= np.roll(solid, (dy, dx), (0, 1))
    o[ring & ~solid] = (236, 231, 226, 255)
    return Image.fromarray(o, "RGBA")


FRONT_DOWN, FRONT_SPREAD = cell(0, 0), cell(2, 0)
# fly-left poses: 0 mid, 1 wings swept back (most compact = tucked), 2 wings up
SIDE = [centred(cell(c, 1)) for c in range(3)]

# launch with wings up, tuck through the top of the flip, open the wings again
# on the way round to spot the landing
FLIP = [(SIDE[2], 0), (SIDE[1], -45), (SIDE[1], -90), (SIDE[1], -135),
        (SIDE[1], -180), (SIDE[1], -225), (SIDE[0], -270), (SIDE[2], -315)]

frames = [FRONT_DOWN] + [rotate(im, deg) if deg else im for im, deg in FLIP] + [FRONT_SPREAD]
out = Image.new("RGBA", (CELL * len(frames), CELL), (0, 0, 0, 0))
for i, f in enumerate(frames):
    out.alpha_composite(f, (i * CELL, 0))
out.save(OUT, optimize=True)
