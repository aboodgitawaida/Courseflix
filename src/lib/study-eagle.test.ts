import { beforeEach, describe, expect, it, vi } from "vitest";
import { EAGLE_LINES, EAGLE_LINE_COOLDOWN_MS } from "./eagle-lines";
import { celebrateEagle, pickEagleLine, resetEagleLines, sayEagle } from "./study-eagle";

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

  it("never repeats a line, within a pool or across pools", () => {
    const seen = new Map<string, string>();
    for (const [event, pool] of Object.entries(EAGLE_LINES)) {
      for (const line of pool) {
        const key = line
          .toLowerCase()
          .replace(/[^a-z0-9{}]+/g, " ")
          .trim();
        expect(seen.get(key), `"${line}" in ${event} also in ${seen.get(key)}`).toBeUndefined();
        seen.set(key, event);
      }
    }
  });

  it("gives every event enough lines to stay fresh", () => {
    for (const [event, pool] of Object.entries(EAGLE_LINES)) {
      expect(pool.length, event).toBeGreaterThanOrEqual(5);
    }
  });

  it("keeps every line short", () => {
    for (const pool of Object.values(EAGLE_LINES)) {
      expect(pool.length).toBeGreaterThan(0);
      for (const line of pool) expect(line.length).toBeLessThanOrEqual(100);
    }
  });
});

describe("celebrateEagle", () => {
  it("asks for the trophy animation when told to, and the cheer otherwise", () => {
    const heard: Array<{ message?: string; animation?: string }> = [];
    const listener = (e: Event) => heard.push((e as CustomEvent).detail);
    vi.stubGlobal("window", new EventTarget());
    window.addEventListener("study-eagle-celebrate", listener);
    celebrateEagle(null, "trophy");
    celebrateEagle("Nice");
    window.removeEventListener("study-eagle-celebrate", listener);
    vi.unstubAllGlobals();
    expect(heard).toEqual([
      { message: undefined, animation: "trophy" },
      { message: "Nice", animation: undefined },
    ]);
  });
});

describe("sayEagle", () => {
  beforeEach(() => resetEagleLines());

  it("says a line without celebrating, and respects the cooldown", () => {
    const heard: Array<{ message?: string }> = [];
    const listener = (e: Event) => heard.push((e as CustomEvent).detail);
    vi.stubGlobal("window", new EventTarget());
    window.addEventListener("study-eagle-say", listener);
    sayEagle("courseRemoved", { code: "CSC108H5" });
    sayEagle("courseRemoved", { code: "CSC108H5" }); // inside the cooldown: stays quiet
    window.removeEventListener("study-eagle-say", listener);
    vi.unstubAllGlobals();
    expect(heard).toHaveLength(1);
    expect(heard[0].message).not.toMatch(/[{}]/);
  });
});
