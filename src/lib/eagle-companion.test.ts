import { describe, expect, it } from "vitest";
import {
  COMPANION_DAILY_CAP,
  COMPANION_MIN_GAP_MS,
  EMPTY_MEMORY,
  arrival,
  canSpeak,
  dayKey,
  lateness,
  nextBreakMilestone,
  recordSpoken,
  recordVisit,
  type CompanionMemory,
} from "./eagle-companion";

const at = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h, 0, 0);

function visited(...days: Date[]): CompanionMemory {
  return days.reduce((memory, day) => recordVisit(memory, day), EMPTY_MEMORY);
}

describe("arrival", () => {
  it("knows the first visit", () => {
    expect(arrival(EMPTY_MEMORY, at(2026, 10, 1))).toEqual({ kind: "first" });
  });

  it("stays quiet for a quick return", () => {
    const memory = visited(at(2026, 10, 1, 10));
    expect(arrival(memory, at(2026, 10, 1, 11))).toBeNull();
  });

  it("notices a return later the same day", () => {
    const memory = visited(at(2026, 10, 1, 8));
    expect(arrival(memory, at(2026, 10, 1, 20))).toEqual({ kind: "later" });
  });

  it("notices the next day, then a streak from the third day", () => {
    const memory = visited(at(2026, 10, 1));
    expect(arrival(memory, at(2026, 10, 2))).toEqual({ kind: "tomorrow" });
    const twoDays = visited(at(2026, 10, 1), at(2026, 10, 2));
    expect(arrival(twoDays, at(2026, 10, 3))).toEqual({ kind: "streak", days: 3 });
  });

  it("counts days away, a few or a week or more", () => {
    const memory = visited(at(2026, 10, 1));
    expect(arrival(memory, at(2026, 10, 5))).toEqual({ kind: "fewDays", days: 4 });
    expect(arrival(memory, at(2026, 10, 15))).toEqual({ kind: "longAway", days: 14 });
  });

  it("counts calendar days across a month end", () => {
    const memory = visited(at(2026, 10, 31, 23));
    expect(arrival(memory, at(2026, 11, 1, 9))).toEqual({ kind: "tomorrow" });
  });
});

describe("streak", () => {
  it("grows by day, holds within a day and resets after a gap", () => {
    expect(visited(at(2026, 10, 1), at(2026, 10, 2), at(2026, 10, 3)).streak).toBe(3);
    expect(visited(at(2026, 10, 1, 8), at(2026, 10, 1, 20)).streak).toBe(1);
    expect(visited(at(2026, 10, 1), at(2026, 10, 2), at(2026, 10, 6)).streak).toBe(1);
  });
});

describe("canSpeak", () => {
  it("spaces his lines out", () => {
    const now = at(2026, 10, 1, 12);
    const memory = recordSpoken(EMPTY_MEMORY, now);
    expect(canSpeak(memory, new Date(now.getTime() + COMPANION_MIN_GAP_MS - 1))).toBe(false);
    expect(canSpeak(memory, new Date(now.getTime() + COMPANION_MIN_GAP_MS))).toBe(true);
  });

  it("stops at the daily cap and starts over the next day", () => {
    let memory = EMPTY_MEMORY;
    const start = at(2026, 10, 1, 8).getTime();
    for (let i = 0; i < COMPANION_DAILY_CAP; i++) {
      memory = recordSpoken(memory, new Date(start + i * 10 * 60_000));
    }
    expect(canSpeak(memory, new Date(start + 5 * 3_600_000))).toBe(false);
    expect(canSpeak(memory, at(2026, 10, 2, 8))).toBe(true);
    expect(dayKey(at(2026, 10, 2))).toBe("2026-10-02");
  });
});

describe("lateness and breaks", () => {
  it("splits the night into getting late and properly late", () => {
    expect(lateness(12)).toBeNull();
    expect(lateness(22)).toBeNull();
    expect(lateness(23)).toBe("gettingLate");
    expect(lateness(0)).toBe("late");
    expect(lateness(4)).toBe("late");
    expect(lateness(5)).toBeNull();
  });

  it("suggests each break once, in order", () => {
    expect(nextBreakMilestone(30, [])).toBeNull();
    expect(nextBreakMilestone(46, [])).toBe(45);
    expect(nextBreakMilestone(46, [45])).toBeNull();
    expect(nextBreakMilestone(95, [45])).toBe(90);
  });
});
