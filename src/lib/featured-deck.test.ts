import { describe, expect, it } from "vitest";
import { getFeaturedDeckForMajor, getFeaturedForMajor } from "./courses";
import { MAJORS } from "./majors";

describe("featured deck", () => {
  const ids = [null, "not-a-program", ...MAJORS.map((m) => m.id)];

  it("leads with the featured course, so its bundled description shows first", () => {
    for (const id of ids) {
      expect(getFeaturedDeckForMajor(id)[0]?.code, String(id)).toBe(getFeaturedForMajor(id).code);
    }
  });

  it("returns up to n distinct courses and never an empty deck", () => {
    for (const id of ids) {
      const deck = getFeaturedDeckForMajor(id, 5);
      expect(deck.length, String(id)).toBeGreaterThan(0);
      expect(deck.length, String(id)).toBeLessThanOrEqual(5);
      expect(new Set(deck.map((c) => c.code)).size, String(id)).toBe(deck.length);
    }
  });

  it("falls back to the starter courses without a program", () => {
    expect(getFeaturedDeckForMajor(null)).toEqual(getFeaturedDeckForMajor("not-a-program"));
    expect(getFeaturedDeckForMajor(null)).toHaveLength(5);
  });
});
