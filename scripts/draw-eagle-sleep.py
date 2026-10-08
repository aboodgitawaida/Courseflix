"""Sleeping Study Eagle sheet (3 frames, 160x160 each, rest / inhale / peak).

Uses the real side-view head from eagle-spritesheet-hq.png (eye closed, tilted
down) on a painted resting body in the sheet's palette, outline and halo.

Run: python3 scripts/draw-eagle-sleep.py public/eagle-spritesheet-hq.png public/eagle-sleep-spritesheet-hq.png
"""
import sys
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

SHEET = sys.argv[1]
OUT = sys.argv[2]
P = dict(a.split("=") for a in sys.argv[3:])
TILT = float(P.get("tilt", 14))
SEED = int(P.get("seed", 3))

sheet = Image.open(SHEET).convert("RGBA")
ref = np.asarray(sheet.crop((160, 160, 320, 320))).astype(int)  # fly-left, middle frame
H = W = 160
YY, XX = np.mgrid[0:H, 0:W]

def dilate(m, n=1):
    for _ in range(n):
        o = m.copy()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            o |= np.roll(m, (dy, dx), (0, 1))
        m = o
    return m

def erode(m, n=1):
    return ~dilate(~m, n)

# ---------- head (real pixels) ----------
r, g, b, a = (ref[..., i] for i in range(4))
op = a > 0
light = np.minimum(np.minimum(r, g), b) > 140
orange = (r > 130) & (r - b > 70) & (g > 50)
blue = (b > r + 8) & (b > 110)
head = op & (XX < 70) & (YY >= 34) & (YY < 70) & (light | orange | blue)
# keep the beak's own dark outline and the grey shading inside the head
near = dilate(head & (orange | blue | light), 2)
head |= op & near & (XX < 46) & (YY >= 34) & (YY < 70)
head &= ~(op & (XX >= 46) & ~light)          # nothing brown from behind the head
# largest blob only
head_img = np.zeros((H, W, 4), np.uint8); head_img[head] = ref[head]
# close the eye: blue becomes head white, then a soft lid line in outline brown
eye = head & blue
ey, ex = np.nonzero(eye)
white = np.array([233, 231, 232, 255])
head_img[dilate(eye, 1) & head & ~orange] = white
cy, x0, x1 = int(round(ey.mean())), ex.min() - 1, ex.max() + 1
for x in range(x0, x1 + 1):
    t = (x - x0) / max(1, x1 - x0)
    y = cy + int(round(1.2 * (1 - (2 * t - 1) ** 2)))   # gentle downward arc
    head_img[y, x] = (52, 32, 24, 255)
    head_img[y + 1, x] = (120, 110, 104, 255)            # soft lower edge of the lid line
    head_img[y - 1, x] = (186, 184, 182, 255)            # lid shading above the line
# crop head to its bbox and tilt it beak-down around the neck
hy, hx = np.nonzero(head_img[..., 3])
hb = (hx.min(), hy.min(), hx.max() + 1, hy.max() + 1)
head_crop = Image.fromarray(head_img).crop(hb)
def premul_rotate(im, deg):
    a = np.asarray(im).astype(float); a[..., :3] *= a[..., 3:4] / 255
    big = Image.fromarray(a.astype(np.uint8), "RGBA").resize((im.width * 4, im.height * 4), Image.NEAREST)
    rot = big.rotate(deg, resample=Image.BICUBIC, expand=True)
    rot = rot.resize((rot.width // 4, rot.height // 4), Image.BOX)
    o = np.asarray(rot).astype(float)
    al = o[..., 3:4]
    o[..., :3] = np.where(al > 0, o[..., :3] * 255 / np.maximum(al, 1), 0)
    o[..., 3] = np.where(al[..., 0] > 110, 255, 0)
    return o.clip(0, 255).astype(np.uint8)
head_rot = premul_rotate(head_crop, TILT)
_hr = head_rot[..., :3].astype(int)
head_rot[(head_rot[..., 3] > 0) & (_hr[..., 2] > _hr[..., 0] + 8) & (_hr.min(2) > 90)] = (233, 231, 232, 255)  # no blue eye left  # PIL: positive = counter-clockwise; beak on the left tips down

# ---------- palette sampled from the sheet's side frames ----------
OUTLINE = np.array([40, 22, 16]); DEEP = np.array([58, 38, 27]); DARK = np.array([77, 56, 38])
MID = np.array([94, 70, 48]); TAN = np.array([113, 97, 71]); TAN2 = np.array([106, 90, 63])
HALO = np.array([236, 231, 226])

rng = np.random.default_rng(SEED)
def smooth_noise(sigma, shape=(H, W)):
    n = rng.random(shape)
    im = Image.fromarray((n * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(sigma))
    v = np.asarray(im).astype(float); v = (v - v.mean()) / (v.std() + 1e-6)
    return v
NOISE_A = smooth_noise(2.2); NOISE_B = smooth_noise(1.2)

def shape_mask(fn, scale=4):
    im = Image.new("L", (W * scale, H * scale), 0); fn(ImageDraw.Draw(im), scale)
    m = np.asarray(im.resize((W // 4, H // 4), Image.BOX)) > 110     # silhouette on the 4px step grid
    return m.repeat(4, 0).repeat(4, 1)

def dist_inside(m, maxd=14):
    d = np.zeros(m.shape, int); cur = m.copy()
    for k in range(1, maxd + 1):
        cur = erode(cur, 1); d += cur
    return d

def paint_region(img, m, inner, edge_band=8, dark_bias=0.0, shade_shift=0.0, silhouette=None):
    d = dist_inside(m)
    n = NOISE_A + 0.5 * NOISE_B
    outer = None if silhouette is None else (silhouette & ~erode(silhouette, 3))
    for y, x in zip(*np.nonzero(m)):
        dd = d[y, x]; nv = n[y, x] + dark_bias
        if dd < 3 and (outer is None or outer[y, x]): c = OUTLINE
        elif dd < edge_band + 2 * nv:            # rim width wobbles with the noise
            c = DEEP if nv > 0.7 else DARK
        else:
            v = nv + shade_shift
            c = DARK if v > 1.6 else MID if v > 0.9 else inner if v > -1.1 else TAN2
        img[y, x, :3] = c; img[y, x, 3] = 255

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
    paint_region(img, sil, TAN)
    paint_region(img, tail & ~body, MID, edge_band=6, dark_bias=0.5, silhouette=sil)
    # folded wing laid over the body, tips ending in jagged dark primaries
    wing = shape_mask(lambda d, s: d.polygon([
        (64 * s, (82 - br) * s), (86 * s, (76 - br) * s), (104 * s, (84 - br) * s), (116 * s, 100 * s),
        (132 * s, 112 * s), (140 * s, 118 * s), (132 * s, 119 * s), (138 * s, 124 * s), (122 * s, 123 * s),
        (126 * s, 127 * s), (104 * s, 124 * s), (80 * s, 120 * s), (62 * s, 110 * s), (58 * s, 96 * s)], fill=255))
    wing &= dilate(sil, 1)
    paint_region(img, wing, TAN, edge_band=4, shade_shift=shade, silhouette=sil)
    # primaries: a couple of soft dark separations toward the tips
    inner = erode(wing, 3)
    for k, (yo, xs) in enumerate([(108, 100), (114, 104)]):
        for x in range(xs, 136):
            y = int(round(yo + (x - xs) * 0.2 + (shade > 0)))
            if inner[y, x] and (x + 2 * k) % 7: img[y:y + 2, x, :3] = DARK
    # feet: two yellow toes peeking under the belly
    for fx in (68, 86):
        img[130:134, fx:fx + 8, :3] = (207, 136, 18); img[130:134, fx:fx + 8, 3] = 255
        img[132:134, fx + 4:fx + 8, :3] = (179, 106, 4)
        img[134:136, fx:fx + 8, :3] = OUTLINE; img[134:136, fx:fx + 8, 3] = 255
    return img

def finish(img):
    a = img[..., 3] > 0
    halo = dilate(a, 2) & ~a
    img = img.copy(); img[halo] = (*HALO, 255)
    f = img.astype(float); f[..., :3] *= f[..., 3:4] / 255
    blur = np.asarray(Image.fromarray(f.astype(np.uint8), "RGBA").filter(ImageFilter.GaussianBlur(0.9))).astype(float)
    al = blur[..., 3:4]
    blur[..., :3] = np.where(al > 0, blur[..., :3] * 255 / np.maximum(al, 1), 0)
    blur[..., 3] = np.where(img[..., 3] > 0, 255, 0)
    return blur.clip(0, 255).astype(np.uint8)

def add_head(img):
    """Real head, unblurred, tucked into the chest with jagged white neck feathers."""
    img = img.copy()
    hh, hw = head_rot.shape[:2]
    oy, ox = 62, 20
    m = head_rot[..., 3] > 0
    sub = img[oy:oy + hh, ox:ox + hw]
    body_px = sub[..., 3] > 0
    # Where the head overlaps the body, its back edge (the source's light halo)
    # gives way to the body so white meets brown directly, as on the reference.
    back_edge = m & ~erode(m, 3) & body_px & (XX[:hh, :hw] > hw * 0.5)
    m = m & ~back_edge
    sub[m] = head_rot[m]
    return img

frames = [add_head(finish(frame(0, 0, 0.0))), add_head(finish(frame(2, 0, 0.0))), add_head(finish(frame(2, 2, 0.35)))]
Image.fromarray(np.concatenate(frames, 1), "RGBA").save(OUT)
