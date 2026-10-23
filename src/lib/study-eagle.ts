import { EAGLE_LINES, EAGLE_LINE_COOLDOWN_MS, type EagleLineEvent } from "@/lib/eagle-lines";

/**
 * Ask the Study Eagle to celebrate: a wing-flap and a short line in its status
 * bubble. Safe to call anywhere; it does nothing on the server or when the
 * eagle is turned off (nothing is listening). With no message it only flaps.
 * Pass "trophy" to lift the gold trophy instead of the cheer (new achievements).
 */
export function celebrateEagle(message?: string | null, animation?: "trophy") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("study-eagle-celebrate", {
      detail: { message: message ?? undefined, animation },
    }),
  );
}

/** Celebrate with a line from one of the pools in eagle-lines.ts. */
export function celebrateEagleWith(
  event: EagleLineEvent,
  vars: Record<string, string | number> = {},
  animation?: "trophy",
) {
  celebrateEagle(pickEagleLine(event, vars), animation);
}

/**
 * Have the Study Eagle say a line from one of the pools in eagle-lines.ts in his
 * status bubble without celebrating (no cheer). A sleeping eagle wakes up to say it.
 * Does nothing on the server, while the event is cooling down, or when the eagle is
 * turned off.
 */
export function sayEagle(event: EagleLineEvent, vars: Record<string, string | number> = {}) {
  if (typeof window === "undefined") return;
  const message = pickEagleLine(event, vars);
  if (!message) return;
  window.dispatchEvent(new CustomEvent("study-eagle-say", { detail: { message } }));
}

const REACTED_PREFIX = "courseflix.eagle.reacted.";

/** True the first time a key is seen in this browser session, false after that. */
export function firstThisSession(key: string): boolean {
  try {
    if (window.sessionStorage.getItem(REACTED_PREFIX + key)) return false;
    window.sessionStorage.setItem(REACTED_PREFIX + key, "1");
  } catch {
    return false; // storage blocked: stay quiet rather than repeat himself
  }
  return true;
}

/**
 * A reaction to what is on a page ("look at all those achievements"). Says it once
 * per session for the key (default: the event), so going back and forth between
 * pages doesn't make him repeat himself. With an animation it also celebrates.
 */
export function reactEagle(
  event: EagleLineEvent,
  vars: Record<string, string | number> = {},
  options: { once?: string; animation?: "trophy" } = {},
) {
  if (typeof window === "undefined") return;
  if (!firstThisSession(options.once ?? event)) return;
  const message = pickEagleLine(event, vars);
  if (!message) return;
  if (options.animation) celebrateEagle(message, options.animation);
  else window.dispatchEvent(new CustomEvent("study-eagle-say", { detail: { message } }));
}

/** He goes gold at most this often, so flicking through bird courses doesn't strobe him. */
export const GOLDEN_GAP_MS = 8_000;
let lastGolden = Number.NEGATIVE_INFINITY;

/**
 * Have the Study Eagle power up into gold for a moment (opening a bird course or the
 * bird section), with a line from the pool. Does nothing on the server, or within
 * GOLDEN_GAP_MS of the last time.
 */
export function goldenEagle(
  event: "birdCourse" | "birdSection",
  vars: Record<string, string | number> = {},
  now = Date.now(),
) {
  if (typeof window === "undefined") return;
  if (now - lastGolden < GOLDEN_GAP_MS) return;
  lastGolden = now;
  const message = pickEagleLine(event, vars, now) ?? undefined;
  window.dispatchEvent(new CustomEvent("study-eagle-golden", { detail: { message } }));
}

const lastIndex = new Map<EagleLineEvent, number>();
const lastShown = new Map<EagleLineEvent, number>();

/**
 * A random line for the event, never the same one twice in a row. Returns
 * null while the event is cooling down (see EAGLE_LINE_COOLDOWN_MS).
 */
export function pickEagleLine(
  event: EagleLineEvent,
  vars: Record<string, string | number> = {},
  now = Date.now(),
  random = Math.random,
): string | null {
  const cooldown = EAGLE_LINE_COOLDOWN_MS[event] ?? 0;
  const shown = lastShown.get(event);
  if (shown !== undefined && now - shown < cooldown) return null;

  const pool = EAGLE_LINES[event];
  const previous = lastIndex.get(event);
  let index = Math.floor(random() * pool.length);
  // Skip over the previous line by picking from the others.
  if (pool.length > 1 && previous !== undefined) {
    index = Math.floor(random() * (pool.length - 1));
    if (index >= previous) index += 1;
  }
  lastIndex.set(event, index);
  lastShown.set(event, now);
  return pool[index].replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}

const LATE_NIGHT_KEY = "courseflix.eagle.lateNight";

/**
 * The late-night line, if it's between midnight and 5am local time and it
 * hasn't been said yet this session. Marks it as said.
 */
export function takeLateNightLine(date = new Date()): string | null {
  if (date.getHours() >= 5) return null;
  try {
    if (window.sessionStorage.getItem(LATE_NIGHT_KEY)) return null;
    window.sessionStorage.setItem(LATE_NIGHT_KEY, "1");
  } catch {
    return null;
  }
  return pickEagleLine("lateNight");
}

/** For tests: forget which lines were shown. */
export function resetEagleLines() {
  lastIndex.clear();
  lastShown.clear();
  lastGolden = Number.NEGATIVE_INFINITY;
}
