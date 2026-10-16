import { describe, expect, it } from "vitest";
import { getYearTiers } from "./year-tiers";

describe("getYearTiers", () => {
  it("puts easy courses in birds and hard ones in danger, by year", () => {
    const first = getYearTiers(1);
    expect(first.birds.map((c) => c.code)).toContain("PHY100H5");
    expect(first.danger.map((c) => c.code)).toContain("MAT102H5");
    expect(first.birds.every((c) => c.level === 100)).toBe(true);
    expect(first.danger.every((c) => c.level === 100)).toBe(true);
    const second = getYearTiers(2);
    expect(second.danger.map((c) => c.code)).toContain("STA256H5");
    expect(second.birds.every((c) => c.level === 200)).toBe(true);
  });

  it("never lists a course in both", () => {
    for (const year of [1, 2] as const) {
      const { birds, danger } = getYearTiers(year);
      const codes = new Set(birds.map((c) => c.code));
      expect(danger.some((c) => codes.has(c.code))).toBe(false);
    }
  });

  it("adds courses that enough students call bird courses", () => {
    const base = getYearTiers(2).birds.map((c) => c.code);
    const code = "MAT240H5";
    expect(base).not.toContain(code);
    const withStudents = getYearTiers(2, new Map([[code, 5]]));
    expect(withStudents.birds.map((c) => c.code)).toContain(code);
    expect(withStudents.danger.map((c) => c.code)).not.toContain(code);
  });

  it("puts the courses with the most opinions first", () => {
    const { birds } = getYearTiers(1);
    expect(birds[0].code).toBe("RLG101H5");
  });
});
