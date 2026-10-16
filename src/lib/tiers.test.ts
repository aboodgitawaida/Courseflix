import { describe, expect, it } from "vitest";
import { getTiers } from "./tiers";

describe("getTiers", () => {
  it("puts easy courses in birds and hard ones in danger", () => {
    const { birds, danger } = getTiers();
    expect(birds.map((c) => c.code)).toContain("PHY100H5");
    expect(danger.map((c) => c.code)).toContain("MAT102H5");
  });

  it("covers every year, not just the first", () => {
    const { birds, danger } = getTiers();
    expect(new Set(birds.map((c) => c.level)).size).toBeGreaterThan(1);
    expect(danger.some((c) => c.level >= 300)).toBe(true);
  });

  it("never lists a course in both", () => {
    const { birds, danger } = getTiers();
    const codes = new Set(birds.map((c) => c.code));
    expect(danger.some((c) => codes.has(c.code))).toBe(false);
  });

  it("adds courses that enough students call bird courses", () => {
    const code = "MAT240H5";
    expect(getTiers().birds.map((c) => c.code)).not.toContain(code);
    const withStudents = getTiers(new Map([[code, 5]]));
    expect(withStudents.birds.map((c) => c.code)).toContain(code);
    expect(withStudents.danger.map((c) => c.code)).not.toContain(code);
  });

  it("puts the courses with the most opinions first", () => {
    expect(getTiers().birds[0].code).toBe("RLG101H5");
  });
});
