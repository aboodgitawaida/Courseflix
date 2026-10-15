import { describe, expect, it } from "vitest";
import { getRedditSignal } from "./reddit-signals";

describe("getRedditSignal", () => {
  it("marks mostly-easy courses with enough opinions", () => {
    expect(getRedditSignal("PHY100")).toEqual({ kind: "easy", percent: 100, votes: 67 });
  });
  it("marks mostly-hard courses with enough opinions", () => {
    expect(getRedditSignal("MAT102")?.kind).toBe("hard");
  });
  it("matches catalog codes that end in H5 or Y5", () => {
    expect(getRedditSignal("PHY100H5")?.kind).toBe("easy");
    expect(getRedditSignal("PSY100Y5")?.kind).toBe("hard");
    expect(getRedditSignal("MAT102H5")?.kind).toBe("hard");
  });
  it("ignores split opinions, thin evidence and unknown courses", () => {
    expect(getRedditSignal("MAT135")).toBeNull();
    expect(getRedditSignal("ENG101")).toBeNull();
    expect(getRedditSignal("XXX999")).toBeNull();
  });
});
