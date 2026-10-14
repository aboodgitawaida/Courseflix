/**
 * The Study Eagle's animation states and the rules for moving between them.
 * Pure, so the rules can be tested without rendering anything.
 *
 * Priority: what the user does (a pet) beats scripted reactions (grind, waking
 * up), which beat ambient states (idle, sleep, reading along with a preview).
 * A celebration is the one exception: it is never cut short, not even by a pet.
 * A request with lower priority than the current state is dropped, not queued.
 */
export const EAGLE_MODES = [
  "awake",
  "drowsy",
  "fallingAsleep",
  "sleeping",
  "wakingUp",
  "startled",
  "celebrating",
  "petting",
  "openingBook",
  "reading",
  "openingGlass",
  "searching",
  "grinding",
] as const;
export type EagleMode = (typeof EAGLE_MODES)[number];

export const MODE_PRIORITY: Record<EagleMode, number> = {
  awake: 0,
  drowsy: 0,
  fallingAsleep: 0,
  sleeping: 0,
  openingBook: 0,
  reading: 0,
  openingGlass: 0,
  searching: 0,
  grinding: 1,
  wakingUp: 2,
  startled: 2,
  petting: 2,
  celebrating: 3,
};

/** States that play once and then settle. Must match the animations in styles.css. */
export const MODE_DURATION_MS: Partial<Record<EagleMode, number>> = {
  fallingAsleep: 2_000, // 8-frame yawn
  wakingUp: 1_200, // 8-frame stretch
  startled: 1_000, // 8-frame jolt awake
  celebrating: 1_100, // 8-frame wing-flap
  petting: 900, // 8-frame head-bob
  openingBook: 900, // 6 frames: takes out the book
  openingGlass: 750, // 5 frames: takes out the magnifying glass
};

/** What's going on around the eagle that decides where he settles. */
export type EagleContext = {
  /** A course preview is open: he reads along. */
  reading: boolean;
  /** The search box is open: he searches through a magnifying glass. */
  searching: boolean;
  /** The user is typing or clicking fast: he crams along. */
  grinding: boolean;
};

/** Prop animations: a one-shot "take it out" state, then the loop it settles into. */
const OPENING_TO_LOOP: Partial<Record<EagleMode, EagleMode>> = {
  openingBook: "reading",
  openingGlass: "searching",
};

export function isDozing(mode: EagleMode) {
  return mode === "sleeping" || mode === "fallingAsleep";
}

/**
 * The resting state for the current context. Searching wins (typing in the
 * search box is searching, not cramming), then grinding, then reading.
 */
export function restingMode(ctx: EagleContext): EagleMode {
  if (ctx.searching) return "openingGlass";
  if (ctx.grinding) return "grinding";
  if (ctx.reading) return "openingBook";
  return "awake";
}

/** Where a one-shot state goes when it finishes. */
export function settle(mode: EagleMode, ctx: EagleContext, queued?: EagleMode | null): EagleMode {
  if (mode === "fallingAsleep") return "sleeping";
  const loop = OPENING_TO_LOOP[mode];
  if (loop) {
    const resting = restingMode(ctx);
    return resting === mode ? loop : resting;
  }
  return queued ?? restingMode(ctx);
}

/**
 * Ask for a new state. Returns the state to show now and, optionally, one to
 * play right after it (a celebration that arrives while he's still waking).
 * Returns null when the request is dropped.
 */
export function request(
  current: EagleMode,
  wanted: EagleMode,
): { mode: EagleMode; queued?: EagleMode } | null {
  // Anything that needs him awake wakes him first. Tapping a sleeping eagle
  // startles him awake (and that's all it does); anything else gets the stretch.
  if (isDozing(current) && MODE_PRIORITY[wanted] > 0) {
    if (wanted === "petting") return { mode: "startled" };
    return wanted === "wakingUp" ? { mode: "wakingUp" } : { mode: "wakingUp", queued: wanted };
  }
  // A celebration during the wake-up waits for it to finish.
  if ((current === "wakingUp" || current === "startled") && wanted === "celebrating") {
    return { mode: current, queued: "celebrating" };
  }
  if (MODE_PRIORITY[wanted] < MODE_PRIORITY[current]) return null;
  return { mode: wanted };
}

/**
 * The ambient state for a context change while nothing scripted is playing:
 * take out the book, glass or pencil from idle, and put it away (or swap it)
 * when the context changes. Returns null when nothing should change.
 */
export function ambient(current: EagleMode, ctx: EagleContext): EagleMode | null {
  const resting = restingMode(ctx);
  if (current === "awake" || current === "drowsy") return resting === "awake" ? null : resting;
  if (current === "grinding" || OPENING_TO_LOOP[current]) {
    return resting === current ? null : resting;
  }
  const opening = (Object.keys(OPENING_TO_LOOP) as EagleMode[]).find(
    (key) => OPENING_TO_LOOP[key] === current,
  );
  if (opening) return resting === opening ? null : resting;
  return null;
}
