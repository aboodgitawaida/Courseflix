"""Build the Study Eagle sprite sheets in public/ from the source art in assets/eagle-src/.

  sleeping-eagle-source.jpg   the 4-frame sleeping eagle (a blurry JPEG of ~7.5px art pixels)
  pixellab-awake-edit.png     PixelLab edit of sleep frame 1 with the eyes opened (80x80)
  pixellab-idle.png           PixelLab animation from the awake frame: blink + head turn (8 x 80x80)
  pixellab-celebrate.png      PixelLab animation from the awake frame: wing-flap (8 x 80x80)
  pixellab-pet.png            PixelLab animation from the awake frame: happy head-bob (8 x 80x80)

Outputs share one frame size, transparent with crisp pixels and one palette. The
branch is identical in every frame and the sheets are mirrored so the branch's
cut end sits against the right edge of the screen:
  public/eagle-awake.png      8 frames (idle loop)
  public/eagle-sleep.png      4 frames
  public/eagle-celebrate.png  8 frames (played once)
  public/eagle-pet.png        8 frames (played once per tap)

The animated frames get one consistent eye drawn in (fix_eye), because the
animation model's eyes sat under a low, slanted brow that looked sad.

Run: python3 scripts/build-eagle-sprites.py
"""
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC, OUT = ROOT / "assets" / "eagle-src", ROOT / "public"

# ---------- 1. recover native pixels from the sleeping JPEG ----------
BOXES = [(0, 60, 448, 600), (448, 60, 896, 600), (0, 620, 448, 1193), (448, 620, 896, 1193)]


def grid(sig, lo=7.3, hi=7.7):
    """Pixel period and first cell boundary of an upscaled pixel-art signal."""
    n = np.arange(len(sig)); best = None
    for p in np.arange(lo, hi, 0.002):
        z = (sig * np.exp(-2j * np.pi * n / p)).sum()
        if best is None or abs(z) > best[0]: best = (abs(z), p, np.angle(z))
    _, p, ph = best
    return p, ((-ph / (2 * np.pi) * p) % p) + 0.5


def native_frames(path):
    im = np.asarray(Image.open(path).convert("RGB")).astype(float)
    frames = []
    for x0, y0, x1, y1 in BOXES:
        cell = im[y0:y1, x0:x1]; g = cell.sum(2)
        px, ox = grid(np.abs(np.diff(g, axis=1)).sum(0))
        py, oy = grid(np.abs(np.diff(g, axis=0)).sum(1))
        nx, ny = int((cell.shape[1] - ox) // px), int((cell.shape[0] - oy) // py)
        nat = np.zeros((ny, nx, 3))
        for j in range(ny):
            for k in range(nx):
                a, b = int(oy + (j + 0.5) * py - 1.5), int(ox + (k + 0.5) * px - 1.5)
                nat[j, k] = np.median(cell[a:a + 4, b:b + 4].reshape(-1, 3), axis=0)
        frames.append(nat)
    return frames


def background(f):
    """Near-white pixels connected to the frame border."""
    h, w, _ = f.shape
    white = (f.min(2) > 222) & ((f.max(2) - f.min(2)) < 30)
    bg = np.zeros((h, w), bool); q = deque()
    for y in range(h):
        for x in range(w):
            if (y in (0, h - 1) or x in (0, w - 1)) and white[y, x]: bg[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and not bg[ny, nx] and white[ny, nx]:
                bg[ny, nx] = True; q.append((ny, nx))
    return bg


def best_shift(ref, mov, r=8):
    best = None
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            m = np.roll(np.roll(mov, dy, 0), dx, 1)
            h, w = min(ref.shape[0], m.shape[0]), min(ref.shape[1], m.shape[1])
            s = (ref[:h, :w] & m[:h, :w]).sum() - 0.5 * (ref[:h, :w] ^ m[:h, :w]).sum()
            if best is None or s > best[0]: best = (s, dy, dx)
    return best[1:]


frames = native_frames(SRC / "sleeping-eagle-source.jpg")
alphas = [~background(f) for f in frames]

# one shared 34-colour palette snaps away the JPEG noise
px = np.concatenate([f[a] for f, a in zip(frames, alphas)])
rng = np.random.default_rng(1)
cent = px[rng.choice(len(px), 34, replace=False)]
for _ in range(40):
    lab = ((px[:, None] - cent[None]) ** 2).sum(2).argmin(1)
    cent = np.array([px[lab == k].mean(0) if (lab == k).any() else cent[k] for k in range(len(cent))])
cent = cent.round().clip(0, 255)

canvas = []
for f, a in zip(frames, alphas):
    out = np.zeros(f.shape[:2] + (4,), np.uint8)
    out[a, :3] = cent[((f[a][:, None] - cent[None]) ** 2).sum(2).argmin(1)]; out[a, 3] = 255
    c = np.zeros((90, 75, 4), np.uint8)
    c[10:10 + out.shape[0], 10:10 + out.shape[1]] = out[:80, :65]
    canvas.append(c)
ref = canvas[0][..., 3] > 0
sleep = [canvas[0]] + [np.roll(np.roll(c, dy, 0), dx, 1) for c in canvas[1:]
                       for dy, dx in [best_shift(ref, c[..., 3] > 0)]]

# the source cuts the branch off at its left edge: saw it into a short stub
CUT = 14
for f in sleep:
    f[:, :CUT] = 0
    rows = np.nonzero(f[:, CUT, 3] > 0)[0]
    if len(rows):
        wood = f[rows, CUT + 2, :3].astype(int)
        f[rows, CUT, :3] = np.clip(wood[wood.sum(1).argmin()] * 0.8, 0, 255).astype(np.uint8)
        f[rows.min(), CUT] = 0; f[rows.max(), CUT] = 0
sleep = [f[11:72, 13:60] for f in sleep]          # 47x61 frames

# ---------- 2. awake frame: PixelLab edit, eye opened by hand, mirrored back ----------
awake = np.asarray(Image.open(SRC / "pixellab-awake-edit.png").convert("RGBA")).copy()


def put(x, y, hexrgb):
    awake[y, x] = (int(hexrgb[0:2], 16), int(hexrgb[2:4], 16), int(hexrgb[4:6], 16), 255)


# the edit left a sleepy slash for an eye: open it (gold iris, pupil, glint, brow)
put(33, 26, "e2e5e7")
for x in (30, 31, 32, 33): put(x, 26, "838489")
put(30, 27, "e3ad2b"); put(31, 27, "0a0001"); put(32, 27, "ffffff")
put(30, 28, "e3ad2b"); put(31, 28, "0a0001"); put(32, 28, "0a0001")
awake = np.asarray(ImageOps.mirror(Image.fromarray(awake, "RGBA"))).copy()   # face the sleep frames' way

# ---------- 3. put everything on one 80x80 canvas in the sleep frames' coordinates ----------
def on_canvas(frame47):
    c = np.zeros((80, 80, 4), np.uint8); c[15:76, 16:63] = frame47; return c


sleep80 = [on_canvas(f) for f in sleep]
dy, dx = best_shift((sleep80[0][..., 3] > 0)[45:], (awake[..., 3] > 0)[45:], 6)
shift = lambda f: np.roll(np.roll(f, dy, 0), dx, 1)


def pixellab_frames(name):
    sheet = np.asarray(Image.open(SRC / f"pixellab-{name}.png").convert("RGBA"))
    return [shift(sheet[:, 80 * i:80 * i + 80].copy()) for i in range(sheet.shape[1] // 80)]


awake80 = shift(awake)
idle80, celebrate80, pet80 = (pixellab_frames(n) for n in ("idle", "celebrate", "pet"))


def drop_specks(f, min_size=40):
    """Remove loose clusters of pixels the animation model leaves floating around."""
    al = f[..., 3] > 0; seen = np.zeros_like(al)
    for y, x in zip(*np.nonzero(al)):
        if seen[y, x]: continue
        comp, q = [], deque([(y, x)]); seen[y, x] = True
        while q:
            cy, cx = q.popleft(); comp.append((cy, cx))
            for ny in (cy - 1, cy, cy + 1):
                for nx in (cx - 1, cx, cx + 1):
                    if 0 <= ny < 80 and 0 <= nx < 80 and al[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True; q.append((ny, nx))
        if len(comp) < min_size:
            for cy, cx in comp: f[cy, cx] = 0
    return f


idle80 = [drop_specks(f) for f in idle80]
celebrate80 = [drop_specks(f) for f in celebrate80]
pet80 = [drop_specks(f) for f in pet80]

# lock the branch (and tail) below the feet to the awake frame, so it never flickers
LOCK = 61 + dy
for f in idle80 + celebrate80 + pet80 + sleep80:
    f[LOCK:] = awake80[LOCK:]

# one shared palette for all four art sources
everything = sleep80 + [awake80] + idle80 + celebrate80 + pet80
opaque = np.concatenate([f[f[..., 3] > 0][:, :3].astype(float) for f in everything])
cent2 = opaque[np.random.default_rng(2).choice(len(opaque), 40, replace=False)]
for _ in range(30):
    lab = ((opaque[:, None] - cent2[None]) ** 2).sum(2).argmin(1)
    cent2 = np.array([opaque[lab == k].mean(0) if (lab == k).any() else cent2[k] for k in range(len(cent2))])
cent2 = cent2.round().clip(0, 255).astype(np.uint8)


# moss greens only belong on the branch: above it, a feather may never snap to green
c2 = cent2.astype(int)
GREEN = (c2[:, 1] > c2[:, 0] + 8) & (c2[:, 1] > c2[:, 2] + 8)


def snap2(f):
    f = f.copy(); a = f[..., 3] > 0
    d = ((f[..., None, :3].astype(int) - c2[None, None]) ** 2).sum(-1)
    rows = np.arange(80)[:, None, None]
    d = np.where((rows < LOCK - 2) & GREEN[None, None], 1 << 30, d)
    f[a, :3] = cent2[d.argmin(-1)][a]
    f[..., 3] = np.where(a, 255, 0)
    return f


sleep80, idle80, celebrate80, pet80 = (
    [snap2(f) for f in group] for group in (sleep80, idle80, celebrate80, pet80))


# ---------- 4. one friendly eye for every animated frame ----------
HEAD_WHITE, BROW, IRIS, PUPIL, GLINT = (229, 232, 234), (171, 170, 170), (227, 173, 43), (10, 0, 1), (255, 255, 255)


def eye_clusters(f):
    """Clusters of non-white pixels enclosed by the white head (eye, brow marks, shading)."""
    rgb, a = f[..., :3].astype(int), f[..., 3] > 0
    white = a & (rgb.min(2) >= 195)
    cand = np.zeros_like(a)
    for y in range(8, 45):
        for x in range(20, 75):
            if (a[y, x] and not white[y, x] and white[y, max(0, x - 3):x].any()
                    and white[y, x + 1:x + 4].any() and white[max(0, y - 3):y, x].any()):
                cand[y, x] = True
    seen = np.zeros_like(cand); out = []
    for y, x in zip(*np.nonzero(cand)):
        if seen[y, x]: continue
        comp, q = [], deque([(y, x)]); seen[y, x] = True
        while q:
            cy, cx = q.popleft(); comp.append((cy, cx))
            for ny in (cy - 1, cy, cy + 1):
                for nx in (cx - 1, cx, cx + 1):
                    if 0 <= ny < 80 and 0 <= nx < 80 and cand[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True; q.append((ny, nx))
        out.append(comp)
    return out


def fix_eye(f):
    """Redraw the open eye: round yellow eye, dark pupil, glint, and a curved brow
    (an arch above the eye instead of a low slanted line). Closed eyes are left alone."""
    f = f.copy(); rgb = f[..., :3].astype(int)
    clusters = eye_clusters(f)
    dark = lambda c: sum(1 for y, x in c if rgb[y, x].sum() < 120)
    eyes = [c for c in clusters if dark(c) > 0 and len(c) <= 24]   # eye, sometimes joined to its brow
    if not eyes:
        return f                                   # blink / squint frame
    eye = max(eyes, key=dark)
    ey = [y for y, x in eye]; ex = [x for y, x in eye]
    dk = [(y, x) for y, x in eye if rgb[y, x].sum() < 120]
    py = min(y for y, x in dk); px = round(np.mean([x for y, x in dk]))
    # clear the old eye, the slanted brow mark above it and the grey streak behind it
    for c in clusters:
        cy = [y for y, x in c]; cx = [x for y, x in c]
        brow = max(cy) <= max(ey) and min(cy) >= min(ey) - 5 and min(cx) >= min(ex) - 5 and max(cx) <= max(ex) + 1
        cheek = max(cx) < min(ex) and min(cx) >= min(ex) - 10 and min(ey) - 2 <= min(cy) <= max(ey) + 3
        if c is eye or (dark(c) == 0 and (brow or cheek)):
            for y, x in c: f[y, x, :3] = HEAD_WHITE
    for y in range(py - 2, py + 3):                # wipe the patch so nothing old survives
        for x in range(px - 2, px + 4):
            if f[y, x, 3]: f[y, x, :3] = HEAD_WHITE
    # beak is on the right in these (pre-mirror) frames
    stamp = {(-3, 0): BROW, (-3, 1): BROW, (-2, -1): BROW, (-2, 2): BROW,
             (-1, -1): IRIS, (-1, 0): PUPIL, (-1, 1): GLINT, (-1, 2): IRIS,
             (0, -1): IRIS, (0, 0): PUPIL, (0, 1): PUPIL, (0, 2): IRIS}
    for (dy, dx), col in stamp.items():
        f[py + 1 + dy, px + dx] = (*col, 255)
    return f


idle80, celebrate80, pet80 = ([fix_eye(f) for f in group] for group in (idle80, celebrate80, pet80))

# one shared frame: starts at the branch's cut end (wing tips past it go "off screen")
STUB_X = 16 + 1
al = np.any([f[..., 3] > 0 for f in sleep80 + idle80 + celebrate80 + pet80], axis=0)
ys, xs = np.nonzero(al)
y0, y1, x1 = ys.min(), ys.max() + 1, xs.max() + 1


def small_parts(f, max_size=40):
    """Bounding boxes of small detached pixel clusters (the floating Z letters)."""
    al = f[..., 3] > 0; seen = np.zeros_like(al); boxes = []
    for y, x in zip(*np.nonzero(al)):
        if seen[y, x]: continue
        comp, q = [], deque([(y, x)]); seen[y, x] = True
        while q:
            cy, cx = q.popleft(); comp.append((cy, cx))
            for ny in (cy - 1, cy, cy + 1):
                for nx in (cx - 1, cx, cx + 1):
                    if 0 <= ny < f.shape[0] and 0 <= nx < f.shape[1] and al[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True; q.append((ny, nx))
        if len(comp) <= max_size:
            ys_, xs_ = zip(*comp); boxes.append((min(ys_), max(ys_) + 1, min(xs_), max(xs_) + 1))
    return boxes


def finish(frames):
    """Crop to the shared frame and mirror so the branch grows out of the right edge.
    Letters (the sleeping Z) are flipped back so they still read the right way."""
    out = []
    for f in frames:
        m = f[y0:y1, STUB_X:x1][:, ::-1].copy()
        for t, b, l, r in small_parts(m):
            m[t:b, l:r] = m[t:b, l:r][:, ::-1]
        out.append(m)
    return np.concatenate(out, 1)


for name, frames in (("eagle-awake", idle80), ("eagle-sleep", sleep80), ("eagle-celebrate", celebrate80),
                     ("eagle-pet", pet80)):
    Image.fromarray(finish(frames), "RGBA").save(OUT / f"{name}.png", optimize=True)
print("frame size", x1 - STUB_X, "x", y1 - y0, "| wrote eagle-awake, eagle-sleep, eagle-celebrate, eagle-pet")
