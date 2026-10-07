import { useEffect, useRef } from "react";
import { hasFinePointer, prefersReducedMotion } from "@/hooks/use-reveal";

/** Page-level cursor glow plus film grain. Purely decorative. */
export function Spotlight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !hasFinePointer() || prefersReducedMotion()) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.style.setProperty("--mx", `${e.clientX}px`);
        el.style.setProperty("--my", `${e.clientY}px`);
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <>
      <div ref={ref} className="spotlight-layer" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
    </>
  );
}
