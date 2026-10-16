/**
 * What makes the Study Eagle feel like a companion instead of a mascot: he
 * remembers when you were last here and notices how long you've been around.
 * Pure rules, so they can be tested; the timing and the bubble live in
 * use-eagle-companion.ts. Everything is kept in this browser only.
 */

export type CompanionMemory = {
  /** When he last saw you (ms since epoch), or null the first time. */
  lastVisit: number | null;
  /** The local calendar day of that visit, "YYYY-MM-DD". */
  lastDay: string | null;
  /** Days in a row you've dropped by. */
  streak: number;
  /** Local day and count of the unprompted lines he has said, for the daily cap. */
  spokenDay: string | null;
  spokenCount: number;
  lastSpoken: number | null;
};

export const EMPTY_MEMORY: CompanionMemory = {
  lastVisit: null,
  lastDay: null,
  streak: 0,
  spokenDay: null,
  spokenCount: 0,
  lastSpoken: null,
};

/** He says at most this many unprompted lines a day, and never two within the gap. */
export const COMPANION_DAILY_CAP = 6;
export const COMPANION_MIN_GAP_MS = 90_000;
/** A new visit only counts after this long away (a quick tab switch doesn't). */
export const NEW_VISIT_AFTER_MS = 2 * 60 * 60 * 1000;
/** Away from the tab this long, and he greets you when you're back. */
export const AWAY_BACK_AFTER_MS = 15 * 60 * 1000;
/** Time spent on the site (minutes) when he suggests a break. */
export const BREAK_MILESTONES_MIN = [45, 90, 135] as const;
/** Late and still here: the second nudge comes after this many minutes. */
export const LATE_LONG_AFTER_MIN = 40;
/** Course previews opened in one sitting before he comments. */
export const MANY_PREVIEWS = 6;

export type Arrival =
  | { kind: "first" }
  | { kind: "later" }
  | { kind: "tomorrow" }
  | { kind: "streak"; days: number }
  | { kind: "fewDays"; days: number }
  | { kind: "longAway"; days: number }
  | null;

export function dayKey(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function dayNumber(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86_400_000);
}

/** How he greets you for this visit, or null when it's the same visit as before. */
export function arrival(memory: CompanionMemory, now: Date): Arrival {
  if (memory.lastVisit === null || memory.lastDay === null) return { kind: "first" };
  if (now.getTime() - memory.lastVisit < NEW_VISIT_AFTER_MS) return null;
  const days = dayNumber(dayKey(now)) - dayNumber(memory.lastDay);
  if (days <= 0) return { kind: "later" };
  if (days === 1) {
    return memory.streak + 1 >= 3
      ? { kind: "streak", days: memory.streak + 1 }
      : { kind: "tomorrow" };
  }
  if (days < 7) return { kind: "fewDays", days };
  return { kind: "longAway", days };
}

/** Remember this visit and keep the day streak up to date. */
export function recordVisit(memory: CompanionMemory, now: Date): CompanionMemory {
  const today = dayKey(now);
  let streak = memory.streak;
  if (memory.lastDay === null) streak = 1;
  else {
    const days = dayNumber(today) - dayNumber(memory.lastDay);
    if (days === 1) streak += 1;
    else if (days > 1) streak = 1;
    else streak = Math.max(streak, 1);
  }
  return { ...memory, lastVisit: now.getTime(), lastDay: today, streak };
}

/** Whether he may say something unprompted right now (daily cap and minimum gap). */
export function canSpeak(memory: CompanionMemory, now: Date): boolean {
  const spokenToday = memory.spokenDay === dayKey(now) ? memory.spokenCount : 0;
  if (spokenToday >= COMPANION_DAILY_CAP) return false;
  return memory.lastSpoken === null || now.getTime() - memory.lastSpoken >= COMPANION_MIN_GAP_MS;
}

export function recordSpoken(memory: CompanionMemory, now: Date): CompanionMemory {
  const today = dayKey(now);
  const count = memory.spokenDay === today ? memory.spokenCount : 0;
  return { ...memory, spokenDay: today, spokenCount: count + 1, lastSpoken: now.getTime() };
}

/** 11pm onwards is "getting late"; midnight to 5am is properly late. */
export function lateness(hour: number): "gettingLate" | "late" | null {
  if (hour < 5) return "late";
  if (hour >= 23) return "gettingLate";
  return null;
}

/** The next break milestone you've reached and he hasn't mentioned yet. */
export function nextBreakMilestone(minutes: number, said: readonly number[]): number | null {
  return BREAK_MILESTONES_MIN.find((m) => minutes >= m && !said.includes(m)) ?? null;
}

const KEY = "courseflix.eagle.companion";

export function loadMemory(): CompanionMemory {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY_MEMORY };
    return { ...EMPTY_MEMORY, ...(JSON.parse(raw) as Partial<CompanionMemory>) };
  } catch {
    return { ...EMPTY_MEMORY };
  }
}

export function saveMemory(memory: CompanionMemory) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(memory));
  } catch {
    // Private mode or a full disk: he just forgets, which is fine.
  }
}
