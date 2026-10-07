import type { Course } from "@/lib/courses";
import { getCourseImage } from "@/lib/subject-images";

/** Renders 1080×1920 Instagram-story PNGs of a shortlist or a single course, entirely client-side. */

const W = 1080;
const H = 1920;
const PAD = 84;
const BRAND = "#E50914";
const BRAND_2 = "#ff5a36";
const MUTED = "rgba(255,255,255,0.62)";

const MEGA = '"Unbounded", "Inter Tight", system-ui, sans-serif';
const SERIF = '"Instrument Serif", Georgia, serif';
const SANS = '"Inter Tight", "Inter", system-ui, sans-serif';
const WORDMARK = '"Bebas Neue", "Inter Tight", system-ui, sans-serif';

type Ctx = CanvasRenderingContext2D;

async function loadFonts() {
  if (typeof document === "undefined" || !document.fonts) return;
  await Promise.allSettled([
    document.fonts.load(`900 100px ${MEGA}`),
    document.fonts.load(`800 100px ${MEGA}`),
    document.fonts.load(`italic 400 100px ${SERIF}`),
    document.fonts.load(`500 40px ${SANS}`),
    document.fonts.load(`600 40px ${SANS}`),
    document.fonts.load(`400 60px ${WORDMARK}`),
  ]);
}

function loadImage(src: string, timeoutMs = 4000): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    const timer = window.setTimeout(() => resolve(null), timeoutMs);
    img.onload = () => {
      window.clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      window.clearTimeout(timer);
      resolve(null);
    };
    img.src = src.replace("w=400", "w=900");
  });
}

function setSpacing(ctx: Ctx, px: number) {
  // letterSpacing is supported in Chromium/Safari; harmless no-op elsewhere.
  (ctx as Ctx & { letterSpacing?: string }).letterSpacing = `${px}px`;
}

function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function ellipsize(ctx: Ctx, text: string, maxWidth: number) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxWidth) t = t.slice(0, -1);
  return `${t.trimEnd()}…`;
}

function wrap(ctx: Ctx, text: string, maxWidth: number, maxLines: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = ellipsize(
      ctx,
      `${kept[maxLines - 1]} ${lines.slice(maxLines).join(" ")}`,
      maxWidth,
    );
    return kept;
  }
  return lines;
}

/** Shrinks the font until `text` fits `maxWidth`. Returns the chosen size. */
function fitFont(
  ctx: Ctx,
  text: string,
  weight: string,
  family: string,
  start: number,
  maxWidth: number,
) {
  let size = start;
  ctx.font = `${weight} ${size}px ${family}`;
  while (size > 24 && ctx.measureText(text).width > maxWidth) {
    size -= 4;
    ctx.font = `${weight} ${size}px ${family}`;
  }
  return size;
}

function brandGradient(ctx: Ctx, x: number, w: number) {
  const g = ctx.createLinearGradient(x, 0, x + w, 0);
  g.addColorStop(0, "#ffc2c5");
  g.addColorStop(0.45, BRAND);
  g.addColorStop(1, BRAND_2);
  return g;
}

function drawBackdrop(ctx: Ctx) {
  ctx.fillStyle = "#060607";
  ctx.fillRect(0, 0, W, H);

  const glow = (x: number, y: number, r: number, color: string) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(6,6,7,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  };
  glow(120, 260, 900, "rgba(229,9,20,0.38)");
  glow(1000, 1650, 800, "rgba(255,90,54,0.22)");
  glow(900, 700, 600, "rgba(139,92,246,0.10)");

  // Film grain
  const tile = document.createElement("canvas");
  tile.width = tile.height = 160;
  const tctx = tile.getContext("2d");
  if (tctx) {
    const data = tctx.createImageData(160, 160);
    for (let i = 0; i < data.data.length; i += 4) {
      const v = Math.random() * 255;
      data.data[i] = data.data[i + 1] = data.data[i + 2] = v;
      data.data[i + 3] = 14;
    }
    tctx.putImageData(data, 0, 0);
    const pattern = ctx.createPattern(tile, "repeat");
    if (pattern) {
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, W, H);
    }
  }
}

function drawWordmark(ctx: Ctx, y: number) {
  ctx.save();
  ctx.font = `400 64px ${WORDMARK}`;
  setSpacing(ctx, 5);
  ctx.fillStyle = BRAND;
  ctx.shadowColor = "rgba(229,9,20,0.6)";
  ctx.shadowBlur = 30;
  ctx.textBaseline = "alphabetic";
  ctx.fillText("COURSEFLIX", PAD, y);
  ctx.restore();
}

function drawFooter(ctx: Ctx, cta: string) {
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(PAD, H - 200);
  ctx.lineTo(W - PAD, H - 200);
  ctx.stroke();

  ctx.font = `800 44px ${MEGA}`;
  setSpacing(ctx, -1);
  ctx.fillStyle = "#fff";
  ctx.fillText("courseflix.ca", PAD, H - 112);

  ctx.font = `600 30px ${SANS}`;
  setSpacing(ctx, 0);
  const w = ctx.measureText(cta).width + 64;
  roundRect(ctx, W - PAD - w, H - 160, w, 72, 36);
  ctx.fillStyle = BRAND;
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.fillText(cta, W - PAD - w / 2, H - 113);
  ctx.restore();
}

function drawThumb(
  ctx: Ctx,
  course: Course,
  img: HTMLImageElement | null,
  x: number,
  y: number,
  s: number,
  r: number,
) {
  ctx.save();
  roundRect(ctx, x, y, s, s, r);
  ctx.clip();
  const [c1, c2] = course.poster;
  const g = ctx.createLinearGradient(x, y, x + s, y + s);
  g.addColorStop(0, c1);
  g.addColorStop(1, c2);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, s, s);
  if (img) {
    const scale = Math.max(s / img.width, s / img.height);
    const iw = img.width * scale;
    const ih = img.height * scale;
    ctx.globalAlpha = 0.75;
    ctx.drawImage(img, x + (s - iw) / 2, y + (s - ih) / 2, iw, ih);
    ctx.globalAlpha = 1;
  }
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(x, y, s, s);
  ctx.font = `800 26px ${MEGA}`;
  setSpacing(ctx, 0);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.fillText(course.subject, x + s / 2, y + s / 2 + 10);
  ctx.restore();
}

async function imagesFor(courses: Course[]) {
  const subjects = [...new Set(courses.map((c) => c.subject))];
  const loaded = await Promise.all(subjects.map((s) => loadImage(getCourseImage(s))));
  return new Map(subjects.map((s, i) => [s, loaded[i] ?? null]));
}

function toBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not create image"))),
      "image/png",
    );
  });
}

function makeCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser");
  return { canvas, ctx };
}

export async function renderShortlistStory(courses: Course[], opts: { shared?: boolean } = {}) {
  await loadFonts();
  const shown = courses.slice(0, 6);
  const images = await imagesFor(shown);
  const { canvas, ctx } = makeCanvas();

  drawBackdrop(ctx);
  drawWordmark(ctx, 170);

  ctx.font = `600 28px ${SANS}`;
  setSpacing(ctx, 8);
  ctx.fillStyle = MUTED;
  ctx.fillText(opts.shared ? "A FRIEND'S UTM LINEUP" : "MY UTM COURSE LINEUP", PAD, 300);

  ctx.font = `900 170px ${MEGA}`;
  setSpacing(ctx, -8);
  ctx.fillStyle = "#fff";
  ctx.fillText("My", PAD, 470);
  const myW = ctx.measureText("My ").width;
  ctx.font = `italic 400 210px ${SERIF}`;
  setSpacing(ctx, -2);
  const lw = ctx.measureText("lineup.").width;
  ctx.fillStyle = brandGradient(ctx, PAD + myW, lw);
  ctx.fillText("lineup.", PAD + myW, 470);

  const rowH = 158;
  const gap = 18;
  let y = 550;
  shown.forEach((course, i) => {
    roundRect(ctx, PAD, y, W - PAD * 2, rowH, 36);
    ctx.fillStyle = "rgba(255,255,255,0.045)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.10)";
    ctx.lineWidth = 2;
    ctx.stroke();

    drawThumb(ctx, course, images.get(course.subject) ?? null, PAD + 20, y + 20, rowH - 40, 24);

    const tx = PAD + rowH + 10;
    const maxW = W - PAD * 2 - rowH - 200;
    ctx.textAlign = "left";
    fitFont(ctx, course.code, "800", MEGA, 58, maxW);
    setSpacing(ctx, -2);
    ctx.fillStyle = "#fff";
    ctx.fillText(course.code, tx, y + 84);
    ctx.font = `500 30px ${SANS}`;
    setSpacing(ctx, 0);
    ctx.fillStyle = MUTED;
    ctx.fillText(ellipsize(ctx, course.title, maxW), tx, y + 130);

    ctx.font = `900 64px ${MEGA}`;
    ctx.textAlign = "right";
    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.lineWidth = 2;
    ctx.strokeText(String(i + 1).padStart(2, "0"), W - PAD - 34, y + rowH / 2 + 24);
    ctx.textAlign = "left";

    y += rowH + gap;
  });

  if (courses.length > shown.length) {
    ctx.font = `italic 400 64px ${SERIF}`;
    ctx.fillStyle = brandGradient(ctx, PAD, 400);
    ctx.fillText(`+${courses.length - shown.length} more`, PAD + 8, y + 50);
  }

  drawFooter(ctx, "Build yours →");
  return toBlob(canvas);
}

export async function renderCourseStory(
  course: Course,
  rating?: { avg: number; count: number } | null,
) {
  await loadFonts();
  const img = await loadImage(getCourseImage(course.subject));
  const { canvas, ctx } = makeCanvas();

  drawBackdrop(ctx);

  // Poster image on its own layer, alpha-faded so it melts into the backdrop.
  const posterH = 1050;
  const layer = document.createElement("canvas");
  layer.width = W;
  layer.height = posterH;
  const lctx = layer.getContext("2d");
  if (lctx) {
    const [c1, c2] = course.poster;
    const pg = lctx.createLinearGradient(0, 0, W, posterH);
    pg.addColorStop(0, c1);
    pg.addColorStop(1, c2);
    lctx.fillStyle = pg;
    lctx.fillRect(0, 0, W, posterH);
    if (img) {
      const scale = Math.max(W / img.width, posterH / img.height);
      lctx.globalAlpha = 0.85;
      lctx.drawImage(
        img,
        (W - img.width * scale) / 2,
        (posterH - img.height * scale) / 2,
        img.width * scale,
        img.height * scale,
      );
      lctx.globalAlpha = 1;
    }
    // Giant outlined subject code, so the poster never looks empty.
    lctx.font = `900 400px ${MEGA}`;
    setSpacing(lctx, -20);
    lctx.strokeStyle = "rgba(255,255,255,0.14)";
    lctx.lineWidth = 3;
    lctx.strokeText(course.subject, 40, 640);
    const mask = lctx.createLinearGradient(0, 0, 0, posterH);
    mask.addColorStop(0, "rgba(0,0,0,0.6)");
    mask.addColorStop(0.55, "rgba(0,0,0,0.45)");
    mask.addColorStop(1, "rgba(0,0,0,0)");
    lctx.globalCompositeOperation = "destination-in";
    lctx.fillStyle = mask;
    lctx.fillRect(0, 0, W, posterH);
    ctx.drawImage(layer, 0, 0);
  }

  drawWordmark(ctx, 170);

  // Subject pill
  ctx.font = `700 26px ${SANS}`;
  setSpacing(ctx, 6);
  const pill = `${course.subject} · ${course.area.toUpperCase()}`;
  const pw = ctx.measureText(pill).width + 56;
  roundRect(ctx, PAD, 820, pw, 60, 30);
  ctx.fillStyle = BRAND;
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.fillText(pill, PAD + 28, 860);

  // Giant code
  const size = fitFont(ctx, course.code, "900", MEGA, 210, W - PAD * 2);
  setSpacing(ctx, -size * 0.05);
  ctx.fillStyle = "#fff";
  ctx.fillText(course.code, PAD - 6, 900 + size);

  // Serif title
  ctx.font = `italic 400 92px ${SERIF}`;
  setSpacing(ctx, -1);
  const lines = wrap(ctx, course.title, W - PAD * 2, 3);
  let ty = 900 + size + 120;
  for (const line of lines) {
    ctx.fillStyle = brandGradient(ctx, PAD, ctx.measureText(line).width);
    ctx.fillText(line, PAD, ty);
    ty += 96;
  }

  // Meta chips
  ty += 30;
  ctx.font = `600 30px ${SANS}`;
  setSpacing(ctx, 0);
  const chips = [
    `${course.credits} credit${course.credits === 1 ? "" : "s"}`,
    `${course.level}-level`,
    rating && rating.count > 0 ? `★ ${rating.avg.toFixed(1)} / 5` : "Rate it on Courseflix",
  ];
  let cx = PAD;
  for (const chip of chips) {
    const cw = ctx.measureText(chip).width + 52;
    if (cx + cw > W - PAD) break;
    roundRect(ctx, cx, ty, cw, 68, 34);
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.14)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.fillText(chip, cx + 26, ty + 45);
    cx += cw + 14;
  }

  drawFooter(ctx, "See the full breakdown →");
  return toBlob(canvas);
}
