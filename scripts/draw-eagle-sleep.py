"""Draw the sleeping Study Eagle on the sprite sheet's 40x40 art-pixel grid.

Run: python3 scripts/draw-eagle-sleep.py public/eagle-sleep-spritesheet-hq.png /tmp/eagle-sleep.txt
Writes the 3-frame sheet (480x160, 160x160 per frame) plus the frames as text matrices.
"""
import sys
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

N = 40
PAL = {  # sampled from the side-view frames of eagle-spritesheet-hq.png
    ".": (0, 0, 0, 0),
    "K": (40, 20, 14, 255),    # body/beak outline
    "D": (58, 36, 25, 255),    # deepest feather shadow
    "B": (77, 55, 36, 255),    # dark brown streak
    "M": (94, 69, 47, 255),    # mid brown (back)
    "t": (108, 91, 63, 255),   # tan, shaded
    "T": (114, 97, 71, 255),   # tan (main wing/body)
    "W": (233, 231, 232, 255), # head white
    "G": (200, 200, 198, 255), # head shade / head outline
    "S": (152, 152, 150, 255), # deep head shade
    "Y": (207, 136, 18, 255),  # beak / feet
    "O": (179, 106, 4, 255),   # beak shade
    "R": (142, 77, 0, 255),    # beak hook
}

def mask(fn):
    im = Image.new("L", (N, N), 0); fn(ImageDraw.Draw(im)); return np.asarray(im) > 0

def edge(m):
    """Pixels of m that touch the outside (4-neighbour)."""
    inner = m.copy()
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        inner &= np.roll(m, (dy, dx), (0, 1))
    return m & ~inner

def frame(rise, chest, shade):
    g = np.full((N, N), ".", dtype="<U1")
    top = 17 - rise
    body = mask(lambda d: d.ellipse((12 - chest, top, 30, 35), fill=1)); body[32:] = False
    tail = mask(lambda d: d.polygon([(26, 27), (33, 28), (34, 30), (32, 31), (26, 31)], fill=1))
    wing = mask(lambda d: d.ellipse((16, top + 2, 33, 32), fill=1)) & (body | tail)
    head = mask(lambda d: d.ellipse((6, 18, 15, 26), fill=1))

    # body: tan belly, darker back along the top edge
    g[body] = "T"
    for y, x in zip(*np.nonzero(body)):
        if y <= top + 1 + (abs(x - 21) // 4): g[y, x] = "M"
        if y >= 30: g[y, x] = "t"
    g[tail] = "B"
    # folded wing: rows of overlapping covert feathers, each row ending in a
    # dark scalloped tip line (gap every 4px so the tips read as separate feathers)
    wt = top + 2
    for y, x in zip(*np.nonzero(wing)):
        r = (y - wt) % 3
        band = (y - wt) // 3
        phase = (x + 2 * band + shade) % 4
        if (r == 2 and phase in (1, 2, 3)) or (r == 1 and phase == 0): g[y, x] = "B"
        elif r == 0 and phase == 2: g[y, x] = "t"
        else: g[y, x] = "T"
    # wing edge where it overlaps the body: a dark line so the fold reads
    rim = edge(wing) & body & ~edge(body)
    g[rim] = "B"
    # primaries: long feathers sweeping back over the tail
    for y, x in zip(*np.nonzero(wing | tail)):
        if x >= 27 and y >= 24:
            g[y, x] = "D" if (x - y + shade) % 3 == 0 else ("B" if (x - y) % 3 == 1 else "M")
    # mottling on the back like the reference
    for y, x in [(top + 1, 19), (top + 2, 23), (top + 1, 26), (top + 2, 16)]:
        if body[y, x]: g[y, x] = "B"
    # chest flecks
    for y, x in [(27, 14 - chest), (29, 15 - chest), (25, 16 - chest), (30, 13 - chest)]:
        if body[y, x] and not wing[y, x]: g[y, x] = "t"

    g[head] = "W"
    for y, x in [(24, 14), (25, 13), (25, 12), (23, 15), (22, 15), (25, 11)]:
        if head[y, x]: g[y, x] = "G"
    for y, x in [(25, 14), (24, 15)]:
        g[y, x] = "S"
    # white neck feathers spilling over the shoulder
    for y, x in [(19, 15), (20, 16), (21, 16), (22, 16)]:
        g[y, x] = "W"
    g[23, 16] = "G"
    head_all = head.copy()
    for y, x in [(19, 15), (20, 16), (21, 16), (22, 16), (23, 16)]: head_all[y, x] = True

    # beak: small, hooked, pointing gently down
    beak = {(22, 6): "Y", (22, 5): "Y", (23, 5): "Y", (23, 6): "O", (23, 4): "Y",
            (24, 4): "O", (24, 5): "O", (25, 4): "R"}
    for (y, x), c in beak.items(): g[y, x] = c
    # feet tucked under the belly
    for (y, x), c in {(32, 17): "Y", (32, 18): "O", (32, 22): "Y", (32, 23): "O"}.items():
        g[y, x] = c
    # closed eye: a soft horizontal lid line with one lash at the back
    for (y, x), c in {(21, 8): "K", (21, 9): "K", (21, 10): "K", (22, 11): "S", (22, 9): "G"}.items():
        g[y, x] = c

    filled = g != "."
    ring = np.zeros_like(filled)
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        ring |= np.roll(filled, (dy, dx), (0, 1))
    ring &= ~filled
    # outline colour follows what it borders: grey next to the white head, dark elsewhere
    near_head = np.zeros_like(filled)
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        near_head |= np.roll(head_all & (g == "W") | (g == "G"), (dy, dx), (0, 1))
    beak_px = np.zeros_like(filled)
    for (y, x) in beak: beak_px[y, x] = True
    near_beak = np.zeros_like(filled)
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        near_beak |= np.roll(beak_px, (dy, dx), (0, 1))
    g[ring] = "K"
    g[ring & near_head & ~near_beak] = "G"
    return g

def render(g, soft=0.6):
    rgba = np.array([[PAL[c] for c in row] for row in g], np.uint8).repeat(4, 0).repeat(4, 1)
    a = rgba[..., 3] > 0
    # light halo like the reference sheet's 1-2px edge, then soften like the source
    halo = np.zeros_like(a)
    for dy in (-2, -1, 0, 1, 2):
        for dx in (-2, -1, 0, 1, 2):
            if abs(dy) + abs(dx) <= 2: halo |= np.roll(a, (dy, dx), (0, 1))
    halo &= ~a
    rgba[halo] = (236, 232, 228, 255)
    f = rgba.astype(float); f[..., :3] *= f[..., 3:4] / 255
    im = Image.fromarray(f.astype(np.uint8), "RGBA").filter(ImageFilter.GaussianBlur(soft))
    o = np.asarray(im).astype(float)
    o[..., :3] = np.where(o[..., 3:4] > 0, o[..., :3] * 255 / np.maximum(o[..., 3:4], 1), 0)
    o[..., 3] = np.where(rgba[..., 3] > 0, 255, 0)
    return o.clip(0, 255).astype(np.uint8)

FRAMES = [(0, 0, 0), (1, 0, 0), (1, 1, 1)]  # rest, inhale start, inhale peak

if __name__ == "__main__":
    grids = [frame(*p) for p in FRAMES]
    Image.fromarray(np.concatenate([render(g) for g in grids], 1), "RGBA").save(sys.argv[1])
    with open(sys.argv[2], "w") as fh:
        for i, g in enumerate(grids):
            fh.write(f"frame {i + 1}\n" + "\n".join("".join(r) for r in g[14:36, 0:40]) + "\n\n")
