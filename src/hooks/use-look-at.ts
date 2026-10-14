import { useEffect, useState, type RefObject } from "react";

export type LookDirection = "ahead" | "up" | "down";

/** Angle (degrees from level) where he switches to looking up or down, and back. */
const TURN_AT = 28;
const TURN_BACK_AT = 18;
/** With the cursor still for this long he looks ahead again. */
const SETTLE_MS = 2_500;

/**
 * Where the eagle should look: up, ahead or down toward the cursor. He sits on
 * the right edge facing the page, so left/right never changes. Pointer moves
 * are sampled once per frame and this only re-renders when the direction
 * changes, never per move. Touch has no hover, so phones always get "ahead".
 */
export function lookDirection(
  cursor: { x: number; y: number },
  head: { x: number; y: number },
  current: LookDirection,
): LookDirection {
  const dx = Math.max(head.x - cursor.x, 1); // the cursor is always to his left
  const angle = (Math.atan2(cursor.y - head.y, dx) * 180) / Math.PI; // + is below
  const threshold = (dir: LookDirection) => (current === dir ? TURN_BACK_AT : TURN_AT);
  if (angle <= -threshold("up")) return "up";
  if (angle >= threshold("down")) return "down";
  return "ahead";
}

export function useLookAt(target: RefObject<HTMLElement | null>, active: boolean) {
  const [direction, setDirection] = useState<LookDirection>("ahead");

  useEffect(() => {
    if (!active || !window.matchMedia?.("(hover: hover)").matches) {
      setDirection("ahead");
      return;
    }
    let current: LookDirection = "ahead";
    let frame = 0;
    let settle = 0;
    let last = { x: 0, y: 0 };
    const update = (next: LookDirection) => {
      if (next === current) return;
      current = next;
      setDirection(next);
    };
    const sample = () => {
      frame = 0;
      const el = target.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      // His head is in the upper third of the sprite, toward the page side.
      update(
        lookDirection(last, { x: r.left + r.width * 0.35, y: r.top + r.height * 0.3 }, current),
      );
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      last = { x: event.clientX, y: event.clientY };
      if (!frame) frame = window.requestAnimationFrame(sample);
      window.clearTimeout(settle);
      settle = window.setTimeout(() => update("ahead"), SETTLE_MS);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(settle);
      window.removeEventListener("pointermove", onMove);
    };
  }, [active, target]);

  return direction;
}
