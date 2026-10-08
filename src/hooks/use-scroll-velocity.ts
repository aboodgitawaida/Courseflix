import { useEffect, type RefObject } from "react";
import { prefersReducedMotion } from "./use-reveal";

// Scroll speed → a small, eased skew (in degrees) written to a CSS variable, so the
// feed feels like it has weight. Mouse/trackpad only: phones keep their battery.
const MAX_DEG = 6;
// Degrees per px/ms of scroll speed, and how quickly the skew follows it (ms).
const GAIN = 2.5;
const TAU_MS = 140;

const clamp = (v: number) => Math.max(-MAX_DEG, Math.min(MAX_DEG, v));

function enabled() {
  return (
    typeof window !== "undefined" &&
    !prefersReducedMotion() &&
    !window.matchMedia?.("(pointer: coarse)").matches
  );
}

/** On scroll, runs an rAF loop that eases the written value toward the scroll speed, then stops once settled. */
function track(read: () => number, write: (v: number) => void) {
  let last = read();
  let lastT = 0;
  let value = 0;
  let frame = 0;
  // Time-based so it feels the same at 60Hz, 120Hz or a throttled frame rate.
  const tick = (t: number) => {
    const dt = lastT ? Math.max(t - lastT, 1) : 16;
    lastT = t;
    const pos = read();
    const target = clamp(((pos - last) / dt) * GAIN);
    last = pos;
    value += (target - value) * (1 - Math.exp(-dt / TAU_MS));
    if (Math.abs(value) < 0.01 && target === 0) {
      value = 0;
      lastT = 0;
      write(0);
      frame = 0;
      return;
    }
    write(value);
    frame = requestAnimationFrame(tick);
  };
  return {
    onScroll() {
      if (!frame) frame = requestAnimationFrame(tick);
    },
    stop() {
      cancelAnimationFrame(frame);
      frame = 0;
      write(0);
    },
  };
}

// The page-level listener is shared by every rail.
let pageUsers = 0;
let pageStop: (() => void) | undefined;

function usePageVelocity() {
  useEffect(() => {
    if (!enabled()) return;
    if (pageUsers++ === 0) {
      const root = document.documentElement;
      const t = track(
        () => window.scrollY,
        (v) => root.style.setProperty("--page-skew", v.toFixed(3)),
      );
      window.addEventListener("scroll", t.onScroll, { passive: true });
      pageStop = () => {
        window.removeEventListener("scroll", t.onScroll);
        t.stop();
      };
    }
    return () => {
      if (--pageUsers === 0) pageStop?.();
    };
  }, []);
}

/** Writes `--rail-skew` on the scroller (horizontal speed) and `--page-skew` on the root (vertical). */
export function useScrollVelocity(ref: RefObject<HTMLElement | null>) {
  usePageVelocity();
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled()) return;
    const t = track(
      () => el.scrollLeft,
      (v) => el.style.setProperty("--rail-skew", v.toFixed(3)),
    );
    el.addEventListener("scroll", t.onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", t.onScroll);
      t.stop();
    };
  }, [ref]);
}
