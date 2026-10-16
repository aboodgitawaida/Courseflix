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
}
