/**
 * The Study Eagle's animation states and the rules for moving between them.
 * Pure, so the rules can be tested without rendering anything.
 *
 * Priority: what the user does (a pet) beats scripted reactions (grind, waking
 * up), which beat ambient states (idle, sleep, reading along with a preview).
 * A celebration (the cheer, or the trophy for an achievement) is the one exception: it
 * is never cut short, not even by a pet.
 * A request with lower priority than the current state is dropped, not queued.
 */
export const EAGLE_MODES = [
  "awake",
  "fallingAsleep",
  "sleeping",
  "wakingUp",
  "startled",
  "celebrating",
  "trophy",
  "petting",
  "annoyed",
  "golden",
  "openingBook",
  "reading",
  "openingGlass",
  "searching",
  "openingScale",
  "weighing",
  "openingQuill",
  "writing",
  "openingMap",
  "mapping",
  "grinding",
  // Putting each prop away: its take-out animation played backwards.
  "closingBook",
  "closingGlass",
  "closingScale",
  "closingQuill",
  "closingMap",
  "closingNotepad",
] as const;
export type EagleMode = (typeof EAGLE_MODES)[number];

export const MODE_PRIORITY: Record<EagleMode, number> = {
  awake: 0,
  fallingAsleep: 0,
  sleeping: 0,
  openingBook: 0,
  reading: 0,
  openingGlass: 0,
  searching: 0,
  openingScale: 0,
  weighing: 0,
  openingQuill: 0,
  writing: 0,
  openingMap: 0,
  mapping: 0,
  grinding: 1,
  closingBook: 0,
  closingGlass: 0,
  closingScale: 0,
  closingQuill: 0,
  closingMap: 0,
  closingNotepad: 0,
  wakingUp: 2,
  startled: 2,
  petting: 2,
  // Ignores further pets while he sulks, but a celebration can still cut in.
  annoyed: 3,
  // Powering up into gold for a bird course: a pet does not cut it short.
  golden: 3,
  celebrating: 3,
  trophy: 3,
};

/** States that play once and then settle. Must match the animations in styles.css. */
export const MODE_DURATION_MS: Partial<Record<EagleMode, number>> = {
  fallingAsleep: 2_000, // 8-frame yawn
  wakingUp: 1_200, // 8-frame stretch
  startled: 1_000, // 8-frame jolt awake
  celebrating: 1_400, // 10-frame victory cheer
  trophy: 2_000, // 11-frame trophy lift, for a new achievement
  petting: 900, // 8-frame head-bob
  annoyed: 1_200, // 11-frame huff and ruffle, after being petted too much in a row
  golden: 1_500, // 11-frame power-up into gold, for a bird course
  openingBook: 900, // 6 frames: takes out the book
  openingGlass: 900, // 6 frames: takes out the magnifying glass
  openingScale: 900, // 6 frames: takes out the balance scale
  openingQuill: 900, // 6 frames: takes out the quill and scroll
  openingMap: 900, // 6 frames: unfolds the map
  closingBook: 900, // the take-out animations, backwards
  closingGlass: 900,
  closingScale: 900,
  closingQuill: 900,
  closingMap: 900,
  closingNotepad: 900,
};

/** What's going on around the eagle that decides where he settles. */
export type EagleContext = {
  /** A course preview is open: he reads along. */
  reading: boolean;
  /** The search box is open: he searches through a magnifying glass. */
  searching: boolean;
  /** The user is typing or clicking fast: he crams along. */
  grinding: boolean;
  /** Two or more courses are in the compare drawer: he weighs them on a scale. */
  comparing: boolean;
  /** The review box has focus: he writes along with a quill. */
  writing: boolean;
  /** The prerequisite map is on screen: he studies a map of his own. */
  mapping: boolean;
};

/** Prop animations: a one-shot "take it out" state, then the loop it settles into. */
const OPENING_TO_LOOP: Partial<Record<EagleMode, EagleMode>> = {
  openingBook: "reading",
  openingGlass: "searching",
  openingScale: "weighing",
  openingQuill: "writing",
  openingMap: "mapping",
};

/** Putting a prop away, from its take-out state or its loop. */
const PUT_AWAY: Partial<Record<EagleMode, EagleMode>> = {
  openingBook: "closingBook",
  reading: "closingBook",
  openingGlass: "closingGlass",
  searching: "closingGlass",
  openingScale: "closingScale",
  weighing: "closingScale",
  openingQuill: "closingQuill",
  writing: "closingQuill",
  openingMap: "closingMap",
  mapping: "closingMap",
  grinding: "closingNotepad",
};

/** Petting him this many times within PET_SPAM_WINDOW_MS gets a warning, then (at PET_SPAM_COUNT) annoyed. */
export const PET_WARN_COUNT = 3;
export const PET_SPAM_COUNT = 6;
export const PET_SPAM_WINDOW_MS = 5_000;

/** The pets still inside the spam window, with the one at `now` added. */
export function recentPets(times: number[], now: number): number[] {
  return [...times.filter((t) => now - t < PET_SPAM_WINDOW_MS), now];
}

export function isPetWarning(times: number[]) {
  return times.length >= PET_WARN_COUNT && times.length < PET_SPAM_COUNT;
}

export function isPetSpam(times: number[]) {
  return times.length >= PET_SPAM_COUNT;
}

export function isCelebration(mode: EagleMode) {
  return mode === "celebrating" || mode === "trophy";
}

export function isDozing(mode: EagleMode) {
  return mode === "sleeping" || mode === "fallingAsleep";
}

/**
 * The resting state for the current context. Writing a review and searching
 * win (typing there is writing or searching, not cramming), then grinding,
 * then reading a preview, then comparing (the drawer stays open in the
 * background).
 */
export function restingMode(ctx: EagleContext): EagleMode {
  if (ctx.writing) return "openingQuill";
  if (ctx.searching) return "openingGlass";
  if (ctx.mapping) return "openingMap";
  if (ctx.grinding) return "grinding";
  if (ctx.reading) return "openingBook";
  if (ctx.comparing) return "openingScale";
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
  if ((current === "wakingUp" || current === "startled") && isCelebration(wanted)) {
    return { mode: current, queued: wanted };
  }
  if (MODE_PRIORITY[wanted] < MODE_PRIORITY[current]) return null;
  return { mode: wanted };
}

/**
 * The ambient state for a context change while nothing scripted is playing:
 * take out the book, glass, scale, quill or notepad from idle, and put it away
 * first when the context changes (then settle() picks what comes next).
 * Returns null when nothing should change.
 */
export function ambient(current: EagleMode, ctx: EagleContext): EagleMode | null {
  const resting = restingMode(ctx);
  if (current === "awake") return resting === "awake" ? null : resting;
  const putAway = PUT_AWAY[current];
  if (!putAway) return null; // one-shots and putting-away finish on their own
  const stillWanted =
    resting === current || // grinding
    resting === (OPENING_TO_LOOP[current] ? current : openingFor(current));
  return stillWanted ? null : putAway;
}

function openingFor(loop: EagleMode) {
  return (Object.keys(OPENING_TO_LOOP) as EagleMode[]).find((key) => OPENING_TO_LOOP[key] === loop);
}
