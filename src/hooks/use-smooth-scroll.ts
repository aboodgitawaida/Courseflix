import { useEffect } from "react";
import { hasFinePointer, prefersReducedMotion } from "@/hooks/use-reveal";

function scrollsInside(start: EventTarget | null, dy: number) {
  let el = start instanceof Element ? start : null;
  while (el && el !== document.body && el !== document.documentElement) {
    const { overflowY } = getComputedStyle(el);
    if ((overflowY === "auto" || overflowY === "scroll") && el.scrollHeight > el.clientHeight) {
      if (dy > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : el.scrollTop > 0)
        return true;
    }
    el = el.parentElement;
  }
  return false;
}

/**
 * Eases notched mouse-wheel scrolling on desktop. Trackpads (small, frequent deltas),
 * touch, nested scroll areas, locked bodies and reduced-motion users keep native scrolling.
 */
export function useSmoothScroll() {
  useEffect(() => {
    if (!hasFinePointer() || prefersReducedMotion()) return;

    let target = window.scrollY;
    let current = window.scrollY;
    let running = false;
    let frame = 0;

    const max = () => document.documentElement.scrollHeight - window.innerHeight;

    const step = () => {
      // Someone else (keyboard, scrollbar, router) moved the page: hand control back.
      if (Math.abs(window.scrollY - Math.round(current)) > 3) {
        running = false;
        return;
      }
      current += (target - current) * 0.14;
      if (Math.abs(target - current) < 0.5) {
        current = target;
        running = false;
      }
      window.scrollTo(0, current);
      if (running) frame = requestAnimationFrame(step);
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey || e.defaultPrevented) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      const dy =
        e.deltaMode === 1
          ? e.deltaY * 40
          : e.deltaMode === 2
            ? e.deltaY * window.innerHeight
            : e.deltaY;
      if (Math.abs(dy) < 50) return; // trackpad-style input
      const body = document.body;
      if (body.hasAttribute("data-scroll-locked") || getComputedStyle(body).overflow === "hidden")
        return;
      if (scrollsInside(e.target, dy)) return;

      e.preventDefault();
      if (!running) {
        current = window.scrollY;
        target = window.scrollY;
      }
      target = Math.max(0, Math.min(max(), target + dy));
      if (!running) {
        running = true;
        frame = requestAnimationFrame(step);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("wheel", onWheel);
    };
  }, []);
}
