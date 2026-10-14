import { describe, expect, it } from "vitest";
import { COURSES, getCourse } from "./courses";
import { courseSummary, lighterOptions, prereqSentence, statsSentence } from "./eagle-chat";
import type { RatingStatsRow } from "./ratings";

const stats = (count: number, workload = 3, rating = 4): RatingStatsRow => ({
  rating_count: count,
  avg_rating: rating,
  avg_difficulty: 3,
  avg_workload: workload,
  pct_would_take_again: 80,
});

describe("eagle chat", () => {
  it("only quotes averages with enough reviews", () => {
    expect(statsSentence(null)).toMatch(/No reviews yet/);
    expect(statsSentence(stats(1))).toMatch(/Only 1 review so far/);
    expect(statsSentence(stats(12, 2.25, 4.04))).toBe(
      "12 students rate it 4.0/5, workload 2.3/5, and 80% would take it again.",
    );
  });

  it("puts the course first in the summary", () => {
    expect(courseSummary("CSC108H5", "an intro to Python.", null)).toMatch(/^CSC108H5: an intro/);
  });

  it("names the prerequisites", () => {
    const course = COURSES.find((c) => c.prereqs.some((p) => getCourse(p)))!;
    expect(prereqSentence(course)).toContain(course.code);
    const entry = COURSES.find((c) => c.prereqs.length === 0)!;
    expect(prereqSentence(entry)).toMatch(/no course prerequisites/);
  });

  it("suggests lighter courses in the same subject, lightest first", () => {
    const course = COURSES.find((c) => c.subject === "CSC")!;
    const others = COURSES.filter((c) => c.subject === "CSC" && c.code !== course.code).slice(0, 4);
    const map = new Map<string, RatingStatsRow>([
      [course.code, stats(10, 3.5)],
      [others[0].code, stats(10, 4)], // heavier: left out
      [others[1].code, stats(10, 2)],
      [others[2].code, stats(10, 1.5)],
      [others[3].code, stats(1, 1)], // too few reviews
    ]);
    expect(lighterOptions(course, COURSES, map).map((c) => c.code)).toEqual([
      others[2].code,
      others[1].code,
    ]);
  });
});

describe("typewriter pacing", () => {
  it("pauses a beat after commas and full stops", async () => {
    const { wordTimes } = await import("@/hooks/use-typewriter");
    const t = wordTimes(["Hi,", "there.", "Next"], 36);
    expect(t[0]).toBe(0);
    expect(t[1]).toBeGreaterThan(36); // comma pause
    expect(t[2] - t[1]).toBeGreaterThan(t[1] - t[0]); // sentence pause is longer
  });
});
