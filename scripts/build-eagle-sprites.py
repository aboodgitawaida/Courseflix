"""Build the Study Eagle sprite sheets in public/ from the source art in assets/eagle-src/.

  sleeping-eagle-source.jpg   the 4-frame sleeping eagle (a blurry JPEG of ~7.5px art pixels)
  pixellab-awake-edit.png     PixelLab edit of sleep frame 1 with the eyes opened (80x80)
  pixellab-idle.png           PixelLab animation from the awake frame: blink + head turn (8 x 80x80)
  pixellab-celebrate.png      PixelLab animation from the awake frame: wing-flap (8 x 80x80); no longer
                              shown, but still part of the shared palette and frame size
  pixellab-celebrate-cheer.png PixelLab animation from the awake frame: victory cheer, wings flung up (10 x 80x80)
  pixellab-trophy.png         PixelLab animation from the awake frame: lifts a gold trophy (11 x 80x80;
                              variant E, seed 322, of pixellab-trophy-{a,b,c}_N.png)
  pixellab-pet.png            PixelLab animation from the awake frame: happy head-bob (8 x 80x80)
  pixellab-golden.png         PixelLab animation from the awake frame: super saiyan power-up pose (11 x 80x80; variant C,
                              seed 703); the gold effects are added by the build, see section 'golden'
  pixellab-map.png            PixelLab animation from the awake frame: unfolds a map and traces the route (12 x 80x80;
                              variant A, seed 601, of pixellab-map-{a,b}_N.png)
  pixellab-annoyed.png        PixelLab animation from the awake frame: fed up with being petted, head turns
                              away, feathers ruffle (11 x 80x80; variant B, seed 502, of pixellab-annoyed-{a,b,c}_N.png)
  pixellab-fallasleep.png     PixelLab animation, awake frame -> sleep frame 1: a yawn, then the head sinks (8 x 80x80)
  pixellab-wakeup.png         PixelLab animation, sleep frame 1 -> awake frame: head up, wing stretch (8 x 80x80)
  pixellab-reading.png        PixelLab animation from the awake frame: takes out a book and reads it (12 x 80x80)
  pixellab-startled.png       PixelLab animation, sleep frame 1 -> awake frame: jolts awake, shock marks (8 x 80x80)
  pixellab-compare.png        PixelLab animation from the awake frame: takes out a balance scale (12 x 80x80)
  pixellab-quill.png          PixelLab animation from the awake frame: takes out a quill and scroll and writes (12 x 80x80)
  pixellab-search.png         PixelLab animation from the awake frame: takes out a magnifying glass and peers (12 x 80x80)
  pixellab-grind.png          PixelLab animation from the awake frame: takes out a notepad and scribbles (12 x 80x80)

Outputs share one frame size, transparent with crisp pixels and one palette. The
branch is identical in every frame and the sheets are mirrored so the branch's
cut end sits against the right edge of the screen:
  public/eagle-awake.png      8 frames (idle loop)
  public/eagle-sleep.png      4 frames
  public/eagle-celebrate.png  10 frames (played once): the victory cheer
  public/eagle-trophy.png     11 frames (played once, on a new achievement): raises the trophy
  public/eagle-pet.png        8 frames (played once per tap)
  public/eagle-map-open.png   6 frames (played once: unfolds the map; played backwards to put it away)
  public/eagle-map.png        6 frames (loop: studying the map while the prerequisite map is on screen)
  public/eagle-annoyed.png    11 frames (played once, after petting him too much in a row)
  public/eagle-golden.png     17 frames (played once, for a bird course: a super saiyan power-up)
  public/eagle-fallasleep.png 8 frames (played once, awake -> sleeping)
  public/eagle-wakeup.png     8 frames (played once, sleeping -> awake)
  public/eagle-reading-open.png 6 frames (played once: takes out the book and opens it)
  public/eagle-reading.png    6 frames (loop: reading the open book)
  public/eagle-grind.png      6 frames (loop: scribbling in the notepad)
  public/eagle-grind-open.png 6 frames (taking the notepad out; played backwards to put it away)
  public/eagle-startled.png   8 frames (played once: tapped while asleep)
  public/eagle-search-open.png 6 frames (played once: takes out the magnifying glass)
  public/eagle-search.png     6 frames (loop: peering through it while search is open)
  public/eagle-compare-open.png 6 frames (played once: takes out the balance scale)
  public/eagle-compare.png    8 frames (loop: the pans see-saw while courses are compared)
  public/eagle-quill-open.png 6 frames (played once: takes out the quill and scroll)
  public/eagle-quill.png      6 frames (loop: writing while a review box has focus)

The animated frames get one consistent eye drawn in (fix_eye), because the
animation model's eyes sat under a low, slanted brow that looked sad. The beak and
eye colours get their own slice of the palette so they keep their shading.

Run: python3 -I scripts/build-eagle-sprites.py

Making new eagle animations (PixelLab, see scripts/pixellab.py):
  1. The request bodies live in assets/eagle-src/requests/. Every animation starts and
     ends on pixellab-base-awake.png and/or pixellab-base-sleep.png (80x80, branch in the
     same place), so the branch can be locked and the frames line up with the others.
  2. python3 -I scripts/pixellab.py call animate-with-text-v3 assets/eagle-src/requests/<name>.json /tmp/<name>
     One generation per call; one job at a time. Frame 0 of the output is the input
     frame, so keep frames 1-8 and save them side by side as assets/eagle-src/pixellab-<name>.png.
  3. Add <name> to pixellab_frames(...) below and follow how fallasleep80 is handled
     (specks, branch lock, palette snap, fix_eye, crop box, output), then add its CSS
     class and timing in src/styles.css and src/components/StudyEagle.tsx.
"""
import math
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
idle80, celebrate80, pet80, fallasleep80, wakeup80, reading80, grind80 = (
    pixellab_frames(n)
    for n in ("idle", "celebrate", "pet", "fallasleep", "wakeup", "reading", "grind"))
# no drop_specks here: the little shock marks around his head are small on purpose
startled80 = pixellab_frames("startled")
search80 = pixellab_frames("search")
quill80 = pixellab_frames("quill")
map80 = pixellab_frames("map")


# The balance scale: PixelLab drew him taking it out, but its pans barely move, and
# asking it to see-saw them made them swing together instead. So the loop is made
# here from one clean frame: each pan (strings and bowl) is cut out and moved
# opposite the other, the strings stretching or shrinking so the pans stay hung
# from the beam. Coordinates are in the raw 80x80 PixelLab frame.
SCALE_LOOP_BASE = 7                          # a frame with the scale held steady
PAN_TOP, PAN_BOWL, PAN_BOTTOM = 37, 44, 52   # strings start under the beam; bowl rows
PAN_COLUMNS = ((48, 57), (59, 72))           # left pan, right pan
PAN_SWING = 3                                # pixels up and down
SCALE_LOOP_FRAMES = 8


def hang_pan(frame, x0, x1, d):
    region = frame[PAN_TOP:PAN_BOTTOM, x0:x1].copy()
    strings, bowl = region[:PAN_BOWL - PAN_TOP], region[PAN_BOWL - PAN_TOP:]
    rows = np.round(np.linspace(0, len(strings) - 1, max(1, len(strings) + d))).astype(int)
    moved = np.concatenate([strings[rows], bowl])
    frame[PAN_TOP:PAN_BOTTOM + PAN_SWING, x0:x1] = 0
    frame[PAN_TOP:PAN_TOP + len(moved), x0:x1] = moved


compare_raw = np.asarray(Image.open(SRC / "pixellab-compare.png").convert("RGBA"))
compare_raw = [compare_raw[:, 80 * i:80 * i + 80].copy() for i in range(compare_raw.shape[1] // 80)]
weighing_raw = []
for i in range(SCALE_LOOP_FRAMES):
    d = round(PAN_SWING * math.sin(2 * math.pi * i / SCALE_LOOP_FRAMES))
    f = compare_raw[SCALE_LOOP_BASE].copy()
    (lx0, lx1), (rx0, rx1) = PAN_COLUMNS
    hang_pan(f, lx0, lx1, d)
    hang_pan(f, rx0, rx1, -d)
    weighing_raw.append(f)
compare80 = [shift(f) for f in compare_raw[:6]]
weighing80 = [shift(f) for f in weighing_raw]


def mossy(f):
    rgb = f[..., :3].astype(int)
    return (f[..., 3] > 0) & (rgb[..., 1] > rgb[..., 0] + 8) & (rgb[..., 1] > rgb[..., 2] + 8)


def onto_branch(f):
    """The model lifts the branch with the eagle when he jumps; move the whole frame
    so its branch sits on the real one, or locking the branch would draw it twice."""
    by, bx = best_shift(mossy(awake80), mossy(f), 10)
    out = np.zeros_like(f)
    h, w = f.shape[:2]
    out[max(by, 0):h + min(by, 0), max(bx, 0):w + min(bx, 0)] = \
        f[max(-by, 0):h + min(-by, 0), max(-bx, 0):w + min(-bx, 0)]
    return out


startled80 = [onto_branch(f) for f in startled80]


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
fallasleep80 = [drop_specks(f) for f in fallasleep80]
wakeup80 = [drop_specks(f) for f in wakeup80]
reading80 = [drop_specks(f) for f in reading80]
grind80 = [drop_specks(f) for f in grind80]

# lock the branch (and tail) below the feet to the awake frame, so it never flickers
LOCK = 61 + dy
for f in (idle80 + celebrate80 + pet80 + fallasleep80 + wakeup80 + reading80 + grind80 + startled80
          + search80 + compare80 + weighing80 + quill80 + map80 + sleep80):
    f[LOCK:] = awake80[LOCK:]

# one shared palette for all four art sources. The beak and eyes (warm oranges and
# yellows) get their own share of colours, so a few hundred beak pixels are not
# outvoted by thousands of feather pixels and flattened into one orange.
def is_warm(rgb):
    rgb = rgb.astype(int)
    return (rgb[..., 0] > rgb[..., 2] + 60) & (rgb[..., 1] > rgb[..., 2] + 20)


def kmeans(px, k, seed):
    cent = px[np.random.default_rng(seed).choice(len(px), k, replace=False)]
    for _ in range(30):
        lab = ((px[:, None] - cent[None]) ** 2).sum(2).argmin(1)
        cent = np.array([px[lab == j].mean(0) if (lab == j).any() else cent[j] for j in range(k)])
    return cent.round().clip(0, 255).astype(np.uint8)


everything = sleep80 + [awake80] + idle80 + celebrate80 + pet80
opaque = np.concatenate([f[f[..., 3] > 0][:, :3].astype(float) for f in everything])
warm_px = is_warm(opaque)
cent2 = np.concatenate([kmeans(opaque[~warm_px], 40, 2), kmeans(opaque[warm_px], 12, 2)])


# moss greens only belong on the branch: above it, a feather may never snap to green
c2 = cent2.astype(int)
GREEN = (c2[:, 1] > c2[:, 0] + 8) & (c2[:, 1] > c2[:, 2] + 8)
WARM = np.arange(len(cent2)) >= 40


def snap2(f):
    f = f.copy(); a = f[..., 3] > 0
    d = ((f[..., None, :3].astype(int) - c2[None, None]) ** 2).sum(-1)
    rows = np.arange(80)[:, None, None]
    d = np.where((rows < LOCK - 2) & GREEN[None, None], 1 << 30, d)
    d = np.where(is_warm(f[..., :3])[..., None] != WARM[None, None], 1 << 30, d)
    f[a, :3] = cent2[d.argmin(-1)][a]
    f[..., 3] = np.where(a, 255, 0)
    return f


# (the sleep/wake transitions came later; they snap to the same palette rather than
# re-running it, so adding them left the other sheets unchanged)
sleep80, idle80, celebrate80, pet80, fallasleep80, wakeup80 = (
    [snap2(f) for f in group]
    for group in (sleep80, idle80, celebrate80, pet80, fallasleep80, wakeup80))

# The reading animation brings a book (red cover, cream pages) the eagle palette has
# no colours for. It gets a few extra colours of its own, taken from just its
# off-palette pixels, so the book keeps its colour and the other sheets don't change.
def snap_extra(frames, k=8, far=900):
    px = np.concatenate([f[f[..., 3] > 0][:, :3].astype(float) for f in frames])
    nearest = ((px[:, None] - c2[None]) ** 2).sum(2).min(1)
    far_px = px[nearest > far]
    k = min(k, len(far_px))  # a sheet with no props can have almost no off-palette pixels
    extra = kmeans(far_px, k, 2).astype(int) if k else np.zeros((0, 3), int)
    pal = np.concatenate([c2, extra])
    out = []
    for f in frames:
        f = f.copy(); a = f[..., 3] > 0
        d = ((f[..., None, :3].astype(int) - pal[None, None]) ** 2).sum(-1)
        rows = np.arange(80)[:, None, None]
        green = np.concatenate([GREEN, np.zeros(len(extra), bool)])
        d = np.where((rows < LOCK - 2) & green[None, None], 1 << 30, d)
        f[a, :3] = pal[d.argmin(-1)][a]
        f[..., 3] = np.where(a, 255, 0)
        out.append(f)
    return out


reading80 = snap_extra(reading80)
grind80 = snap_extra(grind80)
startled80 = snap_extra(startled80)
search80 = snap_extra(search80)
quill80 = snap_extra(quill80)
map80 = snap_extra(map80)
compare80, weighing80 = (lambda both: (both[:6], both[6:]))(snap_extra(compare80 + weighing80))


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


def fix_eye(f, blink=False, reopen=False, tidy_brow=False):
    """Redraw the open eye: round yellow eye, dark pupil, glint, and a curved brow
    (an arch above the eye instead of a low slanted line). Blinks and closed eyes are
    left alone, unless reopen is set: the celebration's mid wing-flap frame, where the
    model squeezed the eye shut, gets an open eye placed from the two old brow marks
    that sit above it in every frame. tidy_brow also whitens stray grey marks left
    just above and behind the new brow (the celebration's old brow streaks)."""
    if blink:
        return f
    f = f.copy(); rgb = f[..., :3].astype(int)
    clusters = eye_clusters(f)
    dark = lambda c: sum(1 for y, x in c if rgb[y, x].sum() < 120)
    eyes = [c for c in clusters if dark(c) > 0 and len(c) <= 24]   # eye, sometimes joined to its brow
    if not eyes and not reopen:
        return f
    if eyes:
        eye = max(eyes, key=dark)
        dk = [(y, x) for y, x in eye if rgb[y, x].sum() < 120]
        py = min(y for y, x in dk); px = round(np.mean([x for y, x in dk]))
    else:
        marks = [c for c in clusters if len(c) == 2 and c[0][0] == c[1][0]]
        top = min(c[0][0] for c in marks)
        xs = [x for c in marks if c[0][0] == top for y, x in c]
        py, px = top + 3, round(np.mean(xs))
        eye = [(py + dy, px + dx) for dy in (0, 1) for dx in (-1, 0, 1)]
    ey = [y for y, x in eye]; ex = [x for y, x in eye]
    # clear the old eye, the slanted brow mark above it and the grey streak behind it
    for c in clusters:
        cy = [y for y, x in c]; cx = [x for y, x in c]
        brow = max(cy) <= max(ey) and min(cy) >= min(ey) - 5 and min(cx) >= min(ex) - 5 and max(cx) <= max(ex) + 3
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
    if tidy_brow:
        stamped = {(py + 1 + dy, px + dx) for dy, dx in stamp}
        rgb = f[..., :3].astype(int)
        whiteish = lambda y, x: f[y, x, 3] and rgb[y, x].min() >= 195
        changed = True
        while changed:                # repeat so a streak is eaten in from its ends
            changed = False
            for y in range(py - 4, py + 1):
                for x in range(px - 4, px + 4):
                    if (y, x) in stamped or not f[y, x, 3] or whiteish(y, x):
                        continue
                    c = rgb[y, x]
                    if c.max() - c.min() > 15 or c.sum() < 200:
                        continue      # coloured or dark: beak, outline, pupil
                    nbrs = [(y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)]
                    if all(f[ny, nx, 3] for ny, nx in nbrs) and sum(whiteish(ny, nx) for ny, nx in nbrs) >= 2:
                        f[y, x, :3] = HEAD_WHITE; rgb[y, x] = HEAD_WHITE; changed = True
    return f


idle80 = [fix_eye(f, blink=i == 0) for i, f in enumerate(idle80)]   # idle frame 0 is the blink
celebrate80 = [fix_eye(f, reopen=True, tidy_brow=True) for f in celebrate80]
pet80, wakeup80 = ([fix_eye(f) for f in group] for group in (pet80, wakeup80))
# falling asleep: eyes open through the start of the yawn, then sleepy and shut (keep those)
fallasleep80 = [fix_eye(f, blink=i >= 4) for i, f in enumerate(fallasleep80)]

# one shared frame: starts at the branch's cut end (wing tips past it go "off screen")
STUB_X = 16 + 1
al = np.any([f[..., 3] > 0 for f in sleep80 + idle80 + celebrate80 + pet80 + fallasleep80 + wakeup80
             + reading80 + grind80 + startled80], axis=0)
ys, xs = np.nonzero(al)
y0, y1, x1 = ys.min(), ys.max() + 1, xs.max() + 1
# The magnifying glass pokes a pixel past the shared frame; trim it rather than
# grow every sheet.
for f in search80 + compare80 + weighing80 + quill80 + map80:
    f[:y0] = 0; f[y1:] = 0; f[:, x1:] = 0


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


# ---------- 7. reading: takes the book out once, then loops the reading part ----------
READING_OPEN = 6   # frames 0-5: takes out the book and opens it; 6-11: reads it
Image.fromarray(finish(reading80[:READING_OPEN]), "RGBA").save(OUT / "eagle-reading-open.png", optimize=True)
Image.fromarray(finish(reading80[READING_OPEN:]), "RGBA").save(OUT / "eagle-reading.png", optimize=True)

# ---------- 8. grind: only the scribbling half loops, so cramming starts at once ----------
GRIND_LOOP = 6   # frames 0-5 take the notepad out; 6-11 scribble
GRIND_STREAK_FROM = 46  # the model drops a white streak below the notepad; nothing white belongs there
grind = finish(grind80[GRIND_LOOP:])
low = grind[GRIND_STREAK_FROM:]
low[(low[..., 3] > 0) & (low[..., :3].min(2) >= 200)] = 0
Image.fromarray(grind, "RGBA").save(OUT / "eagle-grind.png", optimize=True)
grind_open = finish(grind80[:GRIND_LOOP])
low = grind_open[GRIND_STREAK_FROM:]
low[(low[..., 3] > 0) & (low[..., :3].min(2) >= 200)] = 0
Image.fromarray(grind_open, "RGBA").save(OUT / "eagle-grind-open.png", optimize=True)

# ---------- 9. startled: tapped while asleep ----------
Image.fromarray(finish(startled80), "RGBA").save(OUT / "eagle-startled.png", optimize=True)

# ---------- 10. search: takes out a magnifying glass once, then peers through it ----------
# Kept exactly as PixelLab drew it (no speck removal, no eye redraw, no frames
# dropped): only the branch lock, palette, trim and mirror every sheet gets.
SEARCH_OPEN = (0, 1, 2, 3, 4, 5)
SEARCH_LOOP = (6, 7, 8, 9, 10, 11)
SECOND_LENS_FRAME, SECOND_LENS_BOX = 2, (29, 43, 0, 9)   # frame 3: a stray second lens, bottom left


def tidy_search(sheet, frames, second_lens=False):
    """Fixes in the finished (mirrored) frames: remove the stray second lens, and turn
    the lens's mint highlight back to head colours wherever it landed on his head."""
    W = sheet.shape[1] // frames
    for i in range(frames):
        f = sheet[:, W * i:W * (i + 1)]
        if second_lens and i == SECOND_LENS_FRAME:
            t, b, l, r = SECOND_LENS_BOX
            f[t:b, l:r] = 0
        rgb = f[..., :3].astype(int)
        opaque = f[..., 3] > 0
        lens = opaque & (rgb[..., 2] > rgb[..., 0] + 25) & (rgb[..., 2] > 110)
        near_lens = lens.copy()
        for _ in range(1):   # the glare sits right against the glass
            g = near_lens.copy()
            g[1:] |= near_lens[:-1]; g[:-1] |= near_lens[1:]; g[:, 1:] |= near_lens[:, :-1]; g[:, :-1] |= near_lens[:, 1:]
            near_lens = g
        mint = opaque & (rgb[..., 1] > rgb[..., 0] + 20) & (rgb[..., 1] > 140) & (rgb[..., 2] > rgb[..., 0])
        stray = mint & ~near_lens
        if stray.any():
            d = ((rgb[stray][:, None] - c2[None]) ** 2).sum(-1)
            f[stray, :3] = cent2[d.argmin(1)]
    return sheet


Image.fromarray(tidy_search(finish([search80[i] for i in SEARCH_OPEN]), len(SEARCH_OPEN), True), "RGBA").save(
    OUT / "eagle-search-open.png", optimize=True)
Image.fromarray(tidy_search(finish([search80[i] for i in SEARCH_LOOP]), len(SEARCH_LOOP)), "RGBA").save(
    OUT / "eagle-search.png", optimize=True)

# The celebration is the victory cheer, kept exactly as PixelLab drew it. The old wing-flap above stays in the palette
# and frame-size calculations so no other sheet changes.
cheer80 = [shift(f) for f in (lambda sheet: [sheet[:, 80 * i:80 * i + 80].copy()
              for i in range(sheet.shape[1] // 80)])(
                  np.asarray(Image.open(SRC / "pixellab-celebrate-cheer.png").convert("RGBA")))]
for f in cheer80:
    f[LOCK:] = awake80[LOCK:]
cheer80 = snap_extra(cheer80)
for f in cheer80:
    f[:y0] = 0; f[y1:] = 0; f[:, x1:] = 0
celebrate80 = cheer80

BRANCH_TOP = 55


def is_foot_px(f):
    rgb = f[..., :3].astype(int)
    return (f[..., 3] > 0) & (rgb[..., 0] > 150) & (rgb[..., 1] > 90) & (rgb[..., 2] < 90) & (rgb[..., 0] > rgb[..., 1] + 25)


_fx = np.nonzero(is_foot_px(awake80)[BRANCH_TOP - 4:].any(0))[0]
FOOT = (_fx.min(), _fx.max())


# The achievement trophy (PixelLab variant E), kept as drawn. PixelLab washed the whole
# eagle lighter and the moss lime green in the middle frames (a lighting shift), so the
# eagle and branch snap to the shared eagle palette like every other sheet, and only the
# gold of the trophy and its sparkles gets extra colours of its own. The branch below the
# feet is the awake frame's, as for the other sheets.
def trophy_gold(f):
    """Bright, saturated gold: the trophy and its sparkles (not lit feathers or the beak)."""
    rgb = f[..., :3].astype(int)
    return (f[..., 3] > 0) & (rgb[..., 0] > 200) & (rgb[..., 1] > 172) & (rgb[..., 2] < 120)


def brown_mask(f):
    rgb = f[..., :3].astype(int)
    warm_gold = (rgb[..., 0] > 180) & (rgb[..., 1] > 110) & (rgb[..., 2] < 150)
    green = (rgb[..., 1] > rgb[..., 0] + 8) & (rgb[..., 1] > rgb[..., 2] + 8)
    brown = (rgb[..., 0] - rgb[..., 2] > 12)      # not the grey of the head's shading
    return (f[..., 3] > 0) & (rgb.max(-1) < 170) & ~warm_gold & ~green & brown


def match_brightness(f, ref_lum):
    """Undo PixelLab's lighting shift: give the frame's brown feathers and wood the same
    brightness distribution as the awake eagle (a rank match; the shading stays as drawn)."""
    f = f.copy(); m = brown_mask(f)
    rgb = f[m][:, :3].astype(float)
    lum = rgb @ np.array([0.299, 0.587, 0.114])
    order = lum.argsort()
    target = np.interp(np.linspace(0, 1, len(lum)), np.linspace(0, 1, len(ref_lum)), ref_lum)
    new = np.empty_like(lum); new[order] = target
    f[m, :3] = (rgb * (new / np.maximum(lum, 1))[:, None]).clip(0, 255).round().astype(np.uint8)
    return f


def head_mask(f):
    """The white head: the biggest blob of near-white pixels in the top of the frame."""
    rgb = f[..., :3].astype(int)
    white = (f[..., 3] > 0) & (rgb.min(-1) > 195)
    white[48:] = False
    seen = np.zeros_like(white); best = []
    for y, x in zip(*np.nonzero(white)):
        if seen[y, x]: continue
        comp, q = [], deque([(y, x)]); seen[y, x] = True
        while q:
            cy, cx = q.popleft(); comp.append((cy, cx))
            for ny in (cy - 1, cy, cy + 1):
                for nx in (cx - 1, cx, cx + 1):
                    if 0 <= ny < 80 and 0 <= nx < 80 and white[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True; q.append((ny, nx))
        if len(comp) > len(best): best = comp
    m = np.zeros_like(white)
    for cy, cx in best: m[cy, cx] = True
    return m


def beak_zone(f):
    """Where the beak is: just in front of and below the middle of the white head."""
    ys, xs = np.nonzero(head_mask(f))
    z = np.zeros(f.shape[:2], bool)
    z[int(ys.mean()) - 3:ys.max() + 4, xs.max() - 4:xs.max() + 8] = True
    return z


def match_head(f, ref_rgb):
    """PixelLab drew the head pure white (a glow) in the lifting frames; give it back the
    awake head's tones, by rank so the shading stays as drawn."""
    f = f.copy(); m = head_mask(f)
    lum = f[m][:, :3].astype(float) @ np.array([0.299, 0.587, 0.114])
    order = lum.argsort()
    idx = np.interp(np.linspace(0, 1, len(lum)), np.linspace(0, 1, len(ref_rgb)), np.arange(len(ref_rgb))).round().astype(int)
    new = np.empty((len(lum), 3), np.uint8); new[order] = ref_rgb[idx]
    f[m, :3] = new
    return f


LUM = np.array([0.299, 0.587, 0.114])


def rank_recolour(f, mask, ref_rgb):
    """Give the masked pixels the reference colours, assigned by brightness rank. Any tint
    PixelLab added (amber highlights, a yellow wash) goes; the shading stays as drawn."""
    if mask.sum() == 0 or len(ref_rgb) == 0:
        return
    lum = f[mask][:, :3].astype(float) @ LUM
    order = lum.argsort()
    # only the reference's main tones: its rare tints would scatter as speckles
    cols, counts = np.unique(ref_rgb, axis=0, return_counts=True)
    ref_rgb = np.repeat(cols[counts >= max(1, 0.03 * len(ref_rgb))], counts[counts >= max(1, 0.03 * len(ref_rgb))], axis=0)
    ref = ref_rgb[(ref_rgb.astype(float) @ LUM).argsort(kind="stable")]
    idx = np.interp(np.linspace(0, 1, len(lum)), np.linspace(0, 1, len(ref)), np.arange(len(ref))).round().astype(int)
    new = np.empty((len(lum), 3), np.uint8); new[order] = ref[idx]
    f[mask, :3] = new


def eagle_regions(f):
    """Masks for the parts of the eagle whose colour must match the awake frame."""
    head = head_mask(f)
    rgb = f[..., :3].astype(int)
    warm = (f[..., 3] > 0) & (rgb[..., 0] > 190) & (rgb[..., 1] > 100) & (rgb[..., 2] < 110) & (rgb[..., 0] > rgb[..., 1] + 25)
    beak = warm & beak_zone(f) & ~trophy_gold(f)
    feet = is_foot_px(f) & ~beak
    feet[:BRANCH_TOP - 4] = False; feet[:, :FOOT[0] - 3] = False; feet[:, FOOT[1] + 4:] = False
    body = brown_mask(f) & ~head & ~beak & ~feet
    return {"body": body, "head": head, "beak": beak, "feet": feet}


AWAKE_REGIONS = None


def grade_to_awake(f):
    """Re-colour the eagle (not the trophy) from the awake frame's own colours."""
    global AWAKE_REGIONS
    if AWAKE_REGIONS is None:
        AWAKE_REGIONS = {k: awake80[m][:, :3] for k, m in eagle_regions(awake80).items()}
    f = f.copy()
    for name, mask in eagle_regions(f).items():
        rank_recolour(f, mask, AWAKE_REGIONS[name])
    return f


def snap_trophy(frames, k=8):
    zones = [beak_zone(f) for f in frames]      # measured before the eagle is re-coloured
    frames = [grade_to_awake(f) for f in frames]
    gold = trophy_gold
    px = np.concatenate([f[gold(f) & ~z][:, :3].astype(float) for f, z in zip(frames, zones)])
    nearest = ((px[:, None] - c2[None]) ** 2).sum(2).min(1)
    extra = kmeans(px[nearest > 900], k, 2).astype(int)
    out = []
    for f, z in zip(frames, zones):
        f = f.copy(); a = f[..., 3] > 0; g = gold(f) & ~z   # the beak snaps to the eagle palette
        rows = np.arange(80)[:, None, None]
        base_d = ((f[..., None, :3].astype(int) - c2[None, None]) ** 2).sum(-1)
        base_d = np.where((rows < LOCK - 2) & GREEN[None, None], 1 << 30, base_d)
        body = c2[base_d.argmin(-1)]
        pal = np.concatenate([c2, extra])
        gd = ((f[..., None, :3].astype(int) - pal[None, None]) ** 2).sum(-1)
        f[..., :3] = np.where(g[..., None], pal[gd.argmin(-1)], body)
        f[..., 3] = np.where(a, 255, 0)
        out.append(f)
    return out


# Variant E (seed 322), kept exactly as PixelLab drew it, same treatment as the cheer.
trophy80 = [shift(f) for f in (lambda sheet: [sheet[:, 80 * i:80 * i + 80].copy()
              for i in range(sheet.shape[1] // 80)])(
                  np.asarray(Image.open(SRC / "pixellab-trophy.png").convert("RGBA")))]
for f in trophy80:
    f[LOCK:] = awake80[LOCK:]
trophy80 = snap_extra(trophy80)
for f in trophy80:
    f[:y0] = 0; f[y1:] = 0; f[:, x1:] = 0
Image.fromarray(finish(trophy80), "RGBA").save(OUT / "eagle-trophy.png", optimize=True)

# Fed up with being petted, also kept exactly as PixelLab drew it (same treatment as the trophy).
annoyed80 = [shift(f) for f in (lambda sheet: [sheet[:, 80 * i:80 * i + 80].copy()
              for i in range(sheet.shape[1] // 80)])(
                  np.asarray(Image.open(SRC / "pixellab-annoyed.png").convert("RGBA")))]
for f in annoyed80:
    f[LOCK:] = awake80[LOCK:]
annoyed80 = snap_extra(annoyed80)
for f in annoyed80:
    f[:y0] = 0; f[y1:] = 0; f[:, x1:] = 0
Image.fromarray(finish(annoyed80), "RGBA").save(OUT / "eagle-annoyed.png", optimize=True)

# ---------- golden: powers up into a super saiyan, then back ----------
# PixelLab drew the pose (variant C, seed 703, of pixellab-goldup-{a,b,c}_N.png): the scream,
# flared wings and a flame outline. Its flame came out orange and red, which read as "on
# fire", so the effects below are done here: the aura is recoloured to pale gold, the white
# head turns gold and spikes up, the eyes glow teal, lightning crackles, and he wears
# Goku's orange pants and blue sash while it lasts.
golden80 = pixellab_frames("golden")
for f in golden80:
    f[LOCK:] = awake80[LOCK:]
golden80 = snap_extra(golden80)
POWER = range(2, 9)       # frames where the aura is at full strength
AURA = range(1, 10)       # frames that have any flame at all
GOLD = (252, 208, 66)
GOLD_PALE = (255, 244, 150)


def lum(rgb):
    return rgb @ np.array([0.299, 0.587, 0.114])


def recolor_aura(f):
    rgb = f[..., :3].astype(int); a = f[..., 3] > 0
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    flame = a & (((r >= 238) & (g >= 140) & (g <= 190) & (b <= 70)) | ((r > 150) & (g < 90) & (b < 90)))
    f[flame, :3] = GOLD
    low = a & (r >= 225) & (g >= 60) & (g < 140) & (b < 80)   # leftover fire near the feet
    low[:LOCK - 16] = False
    f[low & ~flame, :3] = GOLD
    pale = a & (r >= 245) & (g >= 240) & (b < 200) & ~flame
    f[pale, :3] = GOLD_PALE


def gold_head(f):
    """The white head and its shading, as a gold ramp; spikes up like Goku's hair; teal eyes."""
    rgb = f[..., :3].astype(int)
    seed = head_mask(f)
    if not seed.any():
        return
    gray = (f[..., 3] > 0) & (rgb.max(-1) - rgb.min(-1) < 24) & (lum(rgb) > 85)
    gray[44:] = False
    head = seed.copy(); q = deque(zip(*np.nonzero(seed)))
    while q:
        cy, cx = q.popleft()
        for ny in (cy - 1, cy, cy + 1):
            for nx in (cx - 1, cx, cx + 1):
                if 0 <= ny < 80 and 0 <= nx < 80 and gray[ny, nx] and not head[ny, nx]:
                    head[ny, nx] = True; q.append((ny, nx))
    ys, xs = np.nonzero(head)
    ty, cx = ys.min(), int(xs.mean())
    # the pupil: dark pixels in the upper head with the head all around them
    eye_rows = range(ty + 2, ty + 2 + (ys.max() - ty) * 6 // 10)
    for y, x in zip(*np.nonzero(f[..., 3] > 0)):
        if y in eye_rows and not head[y, x] and lum(rgb[y, x]) < 50 \
                and head[max(y - 2, 0):y + 3, max(x - 2, 0):x + 3].sum() >= 14:
            f[y, x, :3] = (40, 235, 220)
    level = lum(rgb)
    ramp = ((215, (255, 238, 120)), (185, (250, 208, 70)), (140, (228, 170, 40)), (0, (150, 100, 25)))
    for y, x in zip(*np.nonzero(head)):
        f[y, x, :3] = next(col for t, col in ramp if level[y, x] > t)
    # spikes: gold triangles up from the top of the head
    for dx, h in ((-7, 5), (-3, 8), (1, 9), (5, 6)):
        for k in range(h):
            width = max(3 - (3 * k) // h, 1)
            for w in range(width):
                y, x = ty - 1 - k, cx + dx + w - width // 2
                if 0 <= y < 80 and 0 <= x < 80 and not head[y, x]:
                    f[y, x] = (*((255, 238, 120) if w == width // 2 else (250, 208, 70)), 255)


def pants(f):
    """Goku's orange gi pants and blue sash over the lower body (only the brown body is painted)."""
    rgb = f[..., :3].astype(int)
    body = (f[..., 3] > 0) & (lum(rgb) <= 100) & (rgb[..., 0] >= rgb[..., 2]) & ~(rgb[..., 1] > rgb[..., 0] + 8)
    cols = np.nonzero(body[LOCK - 8:LOCK - 2].any(0))[0]
    if not len(cols):
        return
    xc = int(cols.mean())
    sash_top, pants_top = LOCK - 14, LOCK - 10
    orange = ((50, (214, 96, 14)), (70, (240, 128, 26)), (90, (252, 158, 44)), (101, (255, 184, 66)))
    blue = ((45, (30, 56, 140)), (65, (44, 86, 200)), (85, (70, 118, 225)), (101, (110, 160, 240)))
    level = lum(rgb)
    for y in range(sash_top, LOCK - 2):
        ramp = blue if y < pants_top else orange
        for x in range(xc - 12, xc + 13):
            if not (0 <= x < 80 and body[y, x]) or level[y, x] < 30:
                continue
            if y >= LOCK - 4 and x % 3 == 0:   # torn hem
                continue
            f[y, x, :3] = next(col for t, col in ramp if level[y, x] < t)
    for y in range(sash_top, sash_top + 7):     # the sash tail, fluttering at his side
        for x in (xc + 10, xc + 11):
            f[y, x] = (36 if x == xc + 10 else 22, 64 if x == xc + 10 else 40, 160 if x == xc + 10 else 105, 255)


def line(f, pts, color=(255, 255, 255), glow=GOLD_PALE):
    for (y0_, x0_), (y1_, x1_) in zip(pts, pts[1:]):
        n = max(abs(y1_ - y0_), abs(x1_ - x0_), 1)
        for i in range(n + 1):
            y = round(y0_ + (y1_ - y0_) * i / n); x = round(x0_ + (x1_ - x0_) * i / n)
            for gx in (-1, 1):
                if 0 <= y < 80 and 0 <= x + gx < 80 and f[y, x + gx, 3] == 0:
                    f[y, x + gx] = (*glow, 255)
            if 0 <= y < 80 and 0 <= x < 80:
                f[y, x] = (*color, 255)


BOLTS = (
    ((8, 24), (13, 28), (17, 23), (22, 28), (27, 23), (33, 27)),
    ((8, 66), (13, 62), (18, 67), (23, 62), (29, 66)),
    ((36, 21), (40, 25), (44, 20), (49, 25)),
    ((34, 69), (38, 65), (43, 70), (48, 65)),
)
def flash(f):
    """The moment he powers up: everything blows out towards white, in a pale halo."""
    a = f[..., 3] > 0
    halo = a.copy()
    for _ in range(3):
        halo = halo | np.roll(halo, 1, 0) | np.roll(halo, -1, 0) | np.roll(halo, 1, 1) | np.roll(halo, -1, 1)
    f[halo & ~a] = (*GOLD_PALE, 255)
    f[a, :3] = (f[a, :3] * 0.4 + 255 * 0.6).astype(np.uint8)


def spikes(f, k, strength):
    """Tall jagged aura spikes standing up from the top of his silhouette, different every frame."""
    rng = np.random.default_rng(900 + k)
    a = f[..., 3] > 0
    top = np.where(a.any(0), a.argmax(0), -1)
    heights = np.zeros(80, int)
    x = 18
    while x < 74:
        half = int(rng.integers(2, 4))
        peak = int(round(rng.integers(5, 12) * strength))
        centre = x + half
        for dx in range(-half, half + 1):
            if 0 <= centre + dx < 80:
                heights[centre + dx] = max(heights[centre + dx], round(peak * (1 - abs(dx) / (half + 1))))
        x += 2 * half + int(rng.integers(0, 2))
    for x in range(80):
        if top[x] < 0:
            continue
        for j in range(1, heights[x] + 1):
            y = top[x] - j
            if y < 0 or a[y, x]:
                continue
            tip = j >= heights[x] - 1
            f[y, x] = (*((255, 252, 215) if tip else GOLD_PALE if j % 3 else GOLD), 255)


# the pose frames of variant C in order, held and flickered so he stays powered up for a while
SEQUENCE = (0, 1, 2, "flash", 3, 4, 5, 6, 7, 8, 6, 7, 5, 8, 6, 9, 10)
STRENGTH = {2: 0.35, "flash": 0.0, 3: 0.6, 4: 0.9, 9: 0.4, 1: 0.0, 0: 0.0, 10: 0.0}
out = []
for k, step in enumerate(SEQUENCE):
    base = 2 if step == "flash" else step
    f = golden80[base].copy()
    if base in AURA:
        recolor_aura(f)
    if base in POWER:
        gold_head(f)
        pants(f)
    if step == "flash":
        flash(f)
    else:
        strength = STRENGTH.get(step, 1.0)
        if strength:
            spikes(f, k, strength)
        if base in POWER and 4 <= k <= 14:
            for n, bolt in enumerate(BOLTS):
                if (k + n) % 2 == 0:       # the bolts flicker, a different pair each frame
                    line(f, bolt)
    out.append(f)
golden80 = out
for f in golden80:
    f[:y0] = 0; f[y1:] = 0; f[:, x1:] = 0
Image.fromarray(finish(golden80), "RGBA").save(OUT / "eagle-golden.png", optimize=True)

for name, frames in (("eagle-awake", idle80), ("eagle-sleep", sleep80), ("eagle-celebrate", celebrate80),
                     ("eagle-pet", pet80), ("eagle-fallasleep", fallasleep80), ("eagle-wakeup", wakeup80)):
    Image.fromarray(finish(frames), "RGBA").save(OUT / f"{name}.png", optimize=True)
# ---------- 11. compare: takes out a balance scale once, then the pans see-saw ----------
Image.fromarray(finish(compare80), "RGBA").save(OUT / "eagle-compare-open.png", optimize=True)
Image.fromarray(finish(weighing80), "RGBA").save(OUT / "eagle-compare.png", optimize=True)

# ---------- 12. quill: takes out a quill and scroll once, then writes ----------
# Kept exactly as PixelLab drew it: only the branch lock, palette, trim and
# mirror every sheet gets.
QUILL_OPEN, QUILL_LOOP = range(0, 6), range(6, 12)
Image.fromarray(finish([quill80[i] for i in QUILL_OPEN]), "RGBA").save(OUT / "eagle-quill-open.png", optimize=True)
Image.fromarray(finish([quill80[i] for i in QUILL_LOOP]), "RGBA").save(OUT / "eagle-quill.png", optimize=True)

# ---------- 13. map: unfolds the prerequisite map once, then traces the route ----------
# Kept as PixelLab drew it (variant A, seed 601, of pixellab-map-{a,b}_N.png).
MAP_OPEN, MAP_LOOP = range(0, 6), range(6, 12)
Image.fromarray(finish([map80[i] for i in MAP_OPEN]), "RGBA").save(OUT / "eagle-map-open.png", optimize=True)
Image.fromarray(finish([map80[i] for i in MAP_LOOP]), "RGBA").save(OUT / "eagle-map.png", optimize=True)

print("frame size", x1 - STUB_X, "x", y1 - y0, "| wrote eagle-awake, -sleep, -celebrate, -trophy, -annoyed, -golden, -pet, -fallasleep, -wakeup, -reading-open, -reading, -grind, -grind-open, -startled, -search-open, -search, -compare-open, -compare, -quill-open, -quill, -map-open, -map")
