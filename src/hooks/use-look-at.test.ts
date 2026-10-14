import { describe, expect, it } from "vitest";
import { lookDirection } from "./use-look-at";

const head = { x: 1200, y: 400 };

describe("eagle look direction", () => {
  it("looks ahead at a cursor roughly level with his head", () => {
    expect(lookDirection({ x: 600, y: 420 }, head, "ahead")).toBe("ahead");
  });

  it("looks up and down at a cursor well above or below", () => {
    expect(lookDirection({ x: 900, y: 100 }, head, "ahead")).toBe("up");
    expect(lookDirection({ x: 900, y: 750 }, head, "ahead")).toBe("down");
  });

  it("doesn't flicker at the edge of a turn", () => {
    // ~23 degrees below: not enough to start looking down, enough to keep looking down
    const cursor = { x: 900, y: 400 + Math.tan((23 * Math.PI) / 180) * 300 };
    expect(lookDirection(cursor, head, "ahead")).toBe("ahead");
    expect(lookDirection(cursor, head, "down")).toBe("down");
  });

  it("handles a cursor right next to him", () => {
    expect(lookDirection({ x: 1200, y: 300 }, head, "ahead")).toBe("up");
  });
});
