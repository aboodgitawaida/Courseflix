/**
 * Where the Study Eagle's chat panel goes on desktop. Elements marked with
 * `data-eagle-avoid` (the prerequisite tree) must never be covered: the panel
 * tries a few spots around the perched eagle and takes the first one that is
 * fully on screen and clear of all of them.
 */
export const EAGLE_AVOID_SELECTOR = "[data-eagle-avoid]";

export type Box = { left: number; top: number; width: number; height: number };

export type PanelSpot = {
  name: "below" | "above" | "beside" | "left-edge";
  left: number;
  top: number;
};

const GAP = 8;
const MARGIN = 16;
const HEADER = 72;

export function panelSpots(
  viewport: { width: number; height: number },
  eagle: Box,
  panel: { width: number; height: number },
): PanelSpot[] {
  const right = viewport.width - panel.width; // flush with the eagle's edge
  const besideTop = clamp(eagle.top, HEADER, viewport.height - panel.height - MARGIN);
  const below: PanelSpot = { name: "below", left: right, top: eagle.top + eagle.height + GAP };
  const above: PanelSpot = { name: "above", left: right, top: eagle.top - GAP - panel.height };
  // Open away from the nearest screen edge first, like before.
  const vertical = eagle.top < viewport.height / 2 ? [below, above] : [above, below];
  return [
    ...vertical,
    { name: "beside", left: eagle.left - GAP - panel.width, top: besideTop },
    { name: "left-edge", left: MARGIN, top: besideTop },
  ];
}

export function overlapArea(a: Box, b: Box) {
  const w = Math.min(a.left + a.width, b.left + b.width) - Math.max(a.left, b.left);
  const h = Math.min(a.top + a.height, b.top + b.height) - Math.max(a.top, b.top);
  return w > 0 && h > 0 ? w * h : 0;
}

/**
 * The first spot that is on screen and covers nothing in `avoid`, or null if
 * there is none. `fallback` is the on-screen spot that covers the least, for
 * when the user asked for the panel and it has to go somewhere.
 */
export function choosePanelSpot(
  viewport: { width: number; height: number },
  eagle: Box,
  panel: { width: number; height: number },
  avoid: Box[],
): { spot: PanelSpot | null; fallback: PanelSpot } {
  const spots = panelSpots(viewport, eagle, panel);
  const scored = spots.map((spot) => {
    const box = { left: spot.left, top: spot.top, width: panel.width, height: panel.height };
    const onScreen =
      box.left >= 0 &&
      box.top >= HEADER &&
      box.left + box.width <= viewport.width &&
      box.top + box.height <= viewport.height - MARGIN / 2;
    const covered = avoid.reduce((sum, rect) => sum + overlapArea(box, rect), 0);
    return { spot, onScreen, covered };
  });
  const clear = scored.find((s) => s.onScreen && s.covered === 0);
  const visible = scored.filter((s) => s.onScreen);
  const fallback = (visible.length ? visible : scored).reduce((best, s) =>
    s.covered < best.covered ? s : best,
  ).spot;
  return { spot: clear?.spot ?? null, fallback };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
