import { beforeEach, describe, expect, it } from "vitest";
import { EAGLE_LINES, EAGLE_LINE_COOLDOWN_MS } from "./eagle-lines";
import { pickEagleLine, resetEagleLines } from "./study-eagle";

describe("eagle lines", () => {
  beforeEach(() => resetEagleLines());

  it("never says the same line twice in a row", () => {
    let previous: string | null = null;
    for (let i = 0; i < 200; i++) {
      const line = pickEagleLine("pet", {}, i);
      expect(line).not.toBe(previous);
      previous = line;
    }
  });

  it("still repeats nothing when the random source is stuck", () => {
    const first = pickEagleLine("pet", {}, 0, () => 0);
    const second = pickEagleLine("pet", {}, 1, () => 0);
    expect(second).not.toBe(first);
  });

  it("stays quiet while an event cools down", () => {
    const cooldown = EAGLE_LINE_COOLDOWN_MS.courseAdded!;
    expect(pickEagleLine("courseAdded", { code: "CSC108H5" }, 1_000)).not.toBeNull();
    expect(pickEagleLine("courseAdded", { code: "CSC108H5" }, 1_000 + cooldown - 1)).toBeNull();
    expect(pickEagleLine("courseAdded", { code: "CSC108H5" }, 1_000 + cooldown)).not.toBeNull();
  });

  it("fills in placeholders", () => {
    for (let i = 0; i < 20; i++) {
      const line = pickEagleLine("achievement", { name: "First Review" }, i)!;
      expect(line).toContain("First Review");
      expect(line).not.toMatch(/[{}]/);
    }
  });

  it("keeps every line short", () => {
    for (const pool of Object.values(EAGLE_LINES)) {
      expect(pool.length).toBeGreaterThan(0);
      for (const line of pool) expect(line.length).toBeLessThanOrEqual(100);
    }
  });
});
