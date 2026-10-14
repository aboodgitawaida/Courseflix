import { describe, expect, it } from "vitest";
import { choosePanelSpot, overlapArea } from "./eagle-layout";

const viewport = { width: 1280, height: 800 };
const panel = { width: 300, height: 220 };
// The perched eagle at the right edge (112x136 at 2x).
const eagleAt = (top: number) => ({ left: 1280 - 112, top, width: 112, height: 136 });

describe("eagle panel placement", () => {
  it("opens below a high perch and above a low one when nothing is in the way", () => {
    expect(choosePanelSpot(viewport, eagleAt(100), panel, []).spot?.name).toBe("below");
    expect(choosePanelSpot(viewport, eagleAt(500), panel, []).spot?.name).toBe("above");
  });

  it("moves off the prerequisite tree", () => {
    // A tree on the right half, under where "above" would go.
    const tree = { left: 700, top: 120, width: 560, height: 280 };
    const { spot } = choosePanelSpot(viewport, eagleAt(500), panel, [tree]);
    expect(spot).not.toBeNull();
    const box = { left: spot!.left, top: spot!.top, ...panel };
    expect(overlapArea(box, tree)).toBe(0);
  });

  it("gives up when every spot covers the tree, but offers the least-bad one", () => {
    const tree = { left: 0, top: 0, width: 1280, height: 800 };
    const { spot, fallback } = choosePanelSpot(viewport, eagleAt(300), panel, [tree]);
    expect(spot).toBeNull();
    expect(fallback).toBeDefined();
  });

  it("never picks a spot that runs off screen", () => {
    const { spot } = choosePanelSpot({ width: 1280, height: 420 }, eagleAt(140), panel, []);
    if (spot) {
      expect(spot.top).toBeGreaterThanOrEqual(72);
      expect(spot.top + panel.height).toBeLessThanOrEqual(420);
    }
  });
});
