import { describe, expect, it } from "vitest";
import { COURSES, getFeaturedForMajor } from "./courses";
import { MAJORS } from "./majors";
import { DESCRIPTIONS } from "./course-descriptions";
import { FEATURED_DESCRIPTIONS } from "./featured-descriptions";

describe("course descriptions", () => {
  it("has a description entry for every catalog course", () => {
    const missing = COURSES.filter((c) => !(c.code in DESCRIPTIONS)).map((c) => c.code);
    expect(missing).toEqual([]);
  });

  it("bundles the description of every course the home page can feature", () => {
    const featured = [null, ...MAJORS.map((m) => m.id)].map((id) => getFeaturedForMajor(id).code);
    for (const code of featured) {
      expect(FEATURED_DESCRIPTIONS[code], code).toBe(DESCRIPTIONS[code]);
    }
  });
});
