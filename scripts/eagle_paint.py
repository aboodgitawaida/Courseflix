"""Shared painting helpers for the Study Eagle pose sheets (sleep, pet).

Every pose keeps the real side-view head from eagle-spritesheet-hq.png and
paints a body around it in the sheet's palette, wide mottled outline and
light halo, on 160x160 frames.
"""
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

H = W = 160
YY, XX = np.mgrid[0:H, 0:W]

# Palette sampled from the sheet's side-view frames.
OUTLINE = np.array([40, 22, 16]); DEEP = np.array([58, 38, 27]); DARK = np.array([77, 56, 38])
MID = np.array([94, 70, 48]); TAN = np.array([113, 97, 71]); TAN2 = np.array([106, 90, 63])
HALO = np.array([236, 231, 226])
HEAD_WHITE = (233, 231, 232, 255)


def dilate(m, n=1):
    for _ in range(n):
        o = m.copy()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            o |= np.roll(m, (dy, dx), (0, 1))
        m = o
    return m


def erode(m, n=1):
    return ~dilate(~m, n)


def load_ref(sheet_path):
    """Fly-left middle frame, whose head is the cleanest side view on the sheet."""
    sheet = Image.open(sheet_path).convert("RGBA")
    return np.asarray(sheet.crop((160, 160, 320, 320))).astype(int)


def make_head(ref, eye="sleep"):
    """Cut the real head out of the reference frame and close its eye.

    eye="sleep": a gentle downward lid arc. eye="happy": an upward ^ arc with
    the cheek pushed up under it.
    """
    r, g, b, a = (ref[..., i] for i in range(4))
    op = a > 0
    light = np.minimum(np.minimum(r, g), b) > 140
    orange = (r > 130) & (r - b > 70) & (g > 50)
    blue = (b > r + 8) & (b > 110)
    head = op & (XX < 70) & (YY >= 34) & (YY < 70) & (light | orange | blue)
    # keep the beak's own dark outline and the grey shading inside the head
    near = dilate(head & (orange | blue | light), 2)
    head |= op & near & (XX < 46) & (YY >= 34) & (YY < 70)
    head &= ~(op & (XX >= 46) & ~light)  # nothing brown from behind the head
    head_img = np.zeros((H, W, 4), np.uint8); head_img[head] = ref[head]
    # close the eye: blue becomes head white, then a lid line in outline brown
    eye_px = head & blue
    ey, ex = np.nonzero(eye_px)
    head_img[dilate(eye_px, 1) & head & ~orange] = HEAD_WHITE
    cy, x0, x1 = int(round(ey.mean())), ex.min() - 1, ex.max() + 1
    for x in range(x0, x1 + 1):
        t = (x - x0) / max(1, x1 - x0)
        bump = 1 - (2 * t - 1) ** 2
        if eye == "happy":
            y = cy - int(round(1.6 * bump))                  # ^ arc
            head_img[y, x] = (52, 32, 24, 255)
            head_img[y - 1, x] = (120, 110, 104, 255)        # soft upper edge of the line
            head_img[y + 1, x] = (200, 199, 197, 255)        # cheek pushed up under the eye
        else:
            y = cy + int(round(1.2 * bump))                  # gentle downward arc
            head_img[y, x] = (52, 32, 24, 255)
            head_img[y + 1, x] = (120, 110, 104, 255)        # soft lower edge of the lid line
            head_img[y - 1, x] = (186, 184, 182, 255)        # lid shading above the line
    hy, hx = np.nonzero(head_img[..., 3])
    return Image.fromarray(head_img).crop((hx.min(), hy.min(), hx.max() + 1, hy.max() + 1))


def premul_rotate(im, deg):
    """Rotate a head crop (PIL: positive = counter-clockwise, so the left-facing
    beak tips down) without colour fringes, keeping the sheet's hard alpha."""
    a = np.asarray(im).astype(float); a[..., :3] *= a[..., 3:4] / 255
    big = Image.fromarray(a.astype(np.uint8), "RGBA").resize((im.width * 4, im.height * 4), Image.NEAREST)
    rot = big.rotate(deg, resample=Image.BICUBIC, expand=True)
    rot = rot.resize((rot.width // 4, rot.height // 4), Image.BOX)
    o = np.asarray(rot).astype(float)
    al = o[..., 3:4]
    o[..., :3] = np.where(al > 0, o[..., :3] * 255 / np.maximum(al, 1), 0)
    o[..., 3] = np.where(al[..., 0] > 110, 255, 0)
    o = o.clip(0, 255).astype(np.uint8)
    rgb = o[..., :3].astype(int)
    o[(o[..., 3] > 0) & (rgb[..., 2] > rgb[..., 0] + 8) & (rgb.min(2) > 90)] = HEAD_WHITE  # no blue eye left
    return o


def make_noise(seed):
    """Two smooth noise fields (coarse, fine) that drive the feather mottling."""
    rng = np.random.default_rng(seed)

    def smooth_noise(sigma):
        n = rng.random((H, W))
        im = Image.fromarray((n * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(sigma))
        v = np.asarray(im).astype(float)
        return (v - v.mean()) / (v.std() + 1e-6)

    coarse = smooth_noise(2.2)
    fine = smooth_noise(1.2)
    return coarse + 0.5 * fine


def shape_mask(fn, scale=4):
    """Rasterise shapes drawn by fn(draw, scale) onto the sheet's 4px silhouette steps."""
    im = Image.new("L", (W * scale, H * scale), 0); fn(ImageDraw.Draw(im), scale)
    m = np.asarray(im.resize((W // 4, H // 4), Image.BOX)) > 110
    return m.repeat(4, 0).repeat(4, 1)


def dist_inside(m, maxd=14):
    d = np.zeros(m.shape, int); cur = m.copy()
    for _ in range(1, maxd + 1):
        cur = erode(cur, 1); d += cur
    return d


def paint_region(img, m, inner, noise, edge_band=8, dark_bias=0.0, shade_shift=0.0, silhouette=None):
    """Fill m with a mottled dark rim (outline only on the silhouette) and a tan interior."""
    d = dist_inside(m)
    outer = None if silhouette is None else (silhouette & ~erode(silhouette, 3))
    for y, x in zip(*np.nonzero(m)):
        dd = d[y, x]; nv = noise[y, x] + dark_bias
        if dd < 3 and (outer is None or outer[y, x]): c = OUTLINE
        elif dd < edge_band + 2 * nv:  # rim width wobbles with the noise
            c = DEEP if nv > 0.7 else DARK
        else:
            v = nv + shade_shift
            c = DARK if v > 1.6 else MID if v > 0.9 else inner if v > -1.1 else TAN2
        img[y, x, :3] = c; img[y, x, 3] = 255


def finish(img):
    """Light halo around the silhouette, then soften colours like the source sheet."""
    a = img[..., 3] > 0
    halo = dilate(a, 2) & ~a
    img = img.copy(); img[halo] = (*HALO, 255)
    f = img.astype(float); f[..., :3] *= f[..., 3:4] / 255
    blur = np.asarray(Image.fromarray(f.astype(np.uint8), "RGBA").filter(ImageFilter.GaussianBlur(0.9))).astype(float)
    al = blur[..., 3:4]
    blur[..., :3] = np.where(al > 0, blur[..., :3] * 255 / np.maximum(al, 1), 0)
    blur[..., 3] = np.where(img[..., 3] > 0, 255, 0)
    return blur.clip(0, 255).astype(np.uint8)


def add_head(img, head_rot, oy, ox, trim_light_edges=False):
    """Paste the real head, unblurred, with its top-left corner at (ox, oy).

    trim_light_edges also drops the head's pale halo pixels wherever its edge
    overlaps the body (e.g. under a raised chin), not only at the back.
    """
    img = img.copy()
    hh, hw = head_rot.shape[:2]
    m = head_rot[..., 3] > 0
    sub = img[oy:oy + hh, ox:ox + hw]
    body_px = sub[..., 3] > 0
    # Where the head overlaps the body, its back edge (the source's light halo)
    # gives way to the body so white meets brown directly, as on the reference.
    back_edge = m & ~erode(m, 3) & body_px & (XX[:hh, :hw] > hw * 0.5)
    if trim_light_edges:
        edge = m & ~erode(m, 3) & body_px
        back_edge |= edge & (head_rot[..., :3].min(2) > 200)
    m = m & ~back_edge
    sub[m] = head_rot[m]
    return img


def feet(img, xs, top=130):
    """Two yellow toes peeking under the belly."""
    for fx in xs:
        img[top:top + 4, fx:fx + 8, :3] = (207, 136, 18); img[top:top + 4, fx:fx + 8, 3] = 255
        img[top + 2:top + 4, fx + 4:fx + 8, :3] = (179, 106, 4)
        img[top + 4:top + 6, fx:fx + 8, :3] = OUTLINE; img[top + 4:top + 6, fx:fx + 8, 3] = 255
