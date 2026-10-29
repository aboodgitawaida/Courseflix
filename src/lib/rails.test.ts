import { describe, expect, it } from "vitest";
import { FILTERS, getCourse, getRailsForMajor, matchesFilter } from "./courses";
import { MAJORS } from "./majors";

// The home page is built from these rows, so they are the core of what the site recommends.
const PROGRAMS = [null, ...MAJORS.map((m) => m.id)];

describe("getRailsForMajor", () => {
  it("gives every program, and no program, at least one row of real, distinct courses", () => {
    for (const id of PROGRAMS) {
      const rails = getRailsForMajor(id);
      expect(rails.length, String(id)).toBeGreaterThan(0);
      for (const rail of rails) {
        expect(rail.codes.length, `${id}: ${rail.title}`).toBeGreaterThan(0);
        expect(rail.codes.length, `${id}: ${rail.title}`).toBeLessThanOrEqual(14);
        expect(new Set(rail.codes).size, `${id}: ${rail.title}`).toBe(rail.codes.length);
        for (const code of rail.codes) expect(getCourse(code), `${id}: ${code}`).toBeDefined();
      }
    }
  });

  it("puts only the right year levels in the year-based rows", () => {
    const levelOf = (code: string) => getCourse(code)!.level;
    for (const id of MAJORS.map((m) => m.id)) {
      const rails = getRailsForMajor(id);
      const row = (title: string) => rails.find((r) => r.title.includes(title))?.codes ?? [];
      for (const code of row("Start here")) expect(levelOf(code), code).toBeLessThanOrEqual(200);
      for (const code of row("Upper-year picks"))
        expect(levelOf(code), code).toBeGreaterThanOrEqual(300);
      for (const code of row("Seminars")) expect(levelOf(code), code).toBeGreaterThanOrEqual(400);
    }
  });

  it("only shows courses that match the active filter", () => {
    for (const { id: filter } of FILTERS) {
      for (const id of [null, MAJORS[0].id]) {
        for (const rail of getRailsForMajor(id, filter)) {
          for (const code of rail.codes) {
            expect(matchesFilter(getCourse(code)!, filter), `${filter} ${id} ${code}`).toBe(true);
          }
        }
      }
    }
  });

  it("treats an unknown program like no program, and is deterministic", () => {
    expect(getRailsForMajor("not-a-program")).toEqual(getRailsForMajor(null));
    for (const id of PROGRAMS) expect(getRailsForMajor(id)).toEqual(getRailsForMajor(id));
  });
});
