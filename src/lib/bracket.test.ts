import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  ACTIVE_BRACKET_ID,
  bracketPhase,
  buildBracket,
  champion,
  formatTimeLeft,
  pickHardestSeeds,
  roundWindow,
  type BracketConfig,
  type Tally,
} from "./bracket";
import { COURSES } from "./courses";

const HOUR = 60 * 60 * 1000;
const start = new Date("2026-10-20T16:00:00Z");
const seeds = Array.from({ length: 16 }, (_, i) => `SEED${i + 1}`);
const config: BracketConfig = { id: "t", title: "Test", startsAt: start, roundHours: 48, seeds };
const at = (hours: number) => new Date(start.getTime() + hours * HOUR);

describe("bracket schedule", () => {
  it("runs each round back to back", () => {
    expect(roundWindow(config, 1)).toEqual({ opens: start, closes: at(48) });
    expect(roundWindow(config, 4)).toEqual({ opens: at(144), closes: at(192) });
  });

  it("reports the phase at each point in time", () => {
    expect(bracketPhase(config, at(-1))).toEqual({ kind: "upcoming", opensAt: start });
    expect(bracketPhase(config, at(0))).toMatchObject({ kind: "open", round: 1 });
    expect(bracketPhase(config, at(47.9))).toMatchObject({ kind: "open", round: 1 });
    expect(bracketPhase(config, at(48))).toMatchObject({ kind: "open", round: 2 });
    expect(bracketPhase(config, at(191))).toMatchObject({ kind: "open", round: 4 });
    expect(bracketPhase(config, at(192))).toEqual({ kind: "finished", endedAt: at(192) });
  });
});

describe("buildBracket", () => {
  it("pairs 1v16, 8v9 ... 2v15 in the first round", () => {
    const [first] = buildBracket(config, [], at(1));
    expect(first!.map((m) => [m.a?.seed, m.b?.seed])).toEqual([
      [1, 16],
      [8, 9],
      [5, 12],
      [4, 13],
      [6, 11],
      [3, 14],
      [7, 10],
      [2, 15],
    ]);
    expect(first!.every((m) => m.status === "open" && m.winner === null)).toBe(true);
  });

  it("leaves later rounds empty until earlier rounds close", () => {
    const rounds = buildBracket(config, [], at(1));
    expect(rounds[1]!.every((m) => m.a === null && m.b === null && m.status === "waiting")).toBe(
      true,
    );
  });

  it("advances the vote winner, and the higher seed on a tie", () => {
    const tallies: Tally[] = [
      { round: 1, matchup: 0, course_code: "SEED16", votes: 5 },
      { round: 1, matchup: 0, course_code: "SEED1", votes: 3 },
      { round: 1, matchup: 1, course_code: "SEED8", votes: 2 },
      { round: 1, matchup: 1, course_code: "SEED9", votes: 2 },
    ];
    const rounds = buildBracket(config, tallies, at(50));
    expect(rounds[0]![0]!.winner?.code).toBe("SEED16");
    expect(rounds[0]![1]!.winner?.code).toBe("SEED8");
    expect(rounds[1]![0]).toMatchObject({
      a: { code: "SEED16", seed: 16 },
      b: { code: "SEED8", seed: 8 },
      status: "open",
    });
  });

  it("ignores votes for courses that are not in the matchup", () => {
    const tallies: Tally[] = [{ round: 1, matchup: 0, course_code: "SEED2", votes: 99 }];
    const [first] = buildBracket(config, tallies, at(1));
    expect(first![0]).toMatchObject({ votesA: 0, votesB: 0 });
  });

  it("crowns a champion once the final closes", () => {
    expect(champion(buildBracket(config, [], at(191)))).toBeNull();
    // With no votes the top seed wins every match.
    expect(champion(buildBracket(config, [], at(192)))).toEqual({ code: "SEED1", seed: 1 });
  });
});

describe("hardest-course seeds", () => {
  const picked = pickHardestSeeds(COURSES.map((c) => c.code));

  it("picks 16 distinct catalog courses", () => {
    expect(picked).toHaveLength(16);
    expect(new Set(picked).size).toBe(16);
  });

  // The seeds are frozen in the migration on purpose, so a later Reddit update must not change
  // them mid-vote. That means this cannot compare them with a fresh pick from the live data.
  it("keeps 16 distinct catalog courses frozen in the migration", () => {
    const sql = readFileSync(
      new URL("../../supabase/migrations/20261016120000_course_brackets.sql", import.meta.url),
      "utf8",
    );
    expect(sql).toContain(`'${ACTIVE_BRACKET_ID}'`);
    const frozen = [...sql.matchAll(/'([A-Z]{3}\d{3}[HY]\d)'/g)].map((m) => m[1]);
    expect(frozen).toHaveLength(16);
    expect(new Set(frozen).size).toBe(16);
    const catalog = new Set(COURSES.map((c) => c.code));
    expect(frozen.filter((code) => !catalog.has(code))).toEqual([]);
  });
});

describe("formatTimeLeft", () => {
  it("shows the two largest units", () => {
    expect(formatTimeLeft(26 * HOUR + 5 * 60_000)).toBe("1d 2h");
    expect(formatTimeLeft(3 * HOUR + 7 * 60_000)).toBe("3h 7m");
    expect(formatTimeLeft(20_000)).toBe("1m");
    expect(formatTimeLeft(0)).toBe("closing now");
  });
});
