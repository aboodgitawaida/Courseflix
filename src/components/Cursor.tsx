import { useEffect, useRef, useState } from "react";
import { hasFinePointer, prefersReducedMotion } from "@/hooks/use-reveal";

/** Decorative trailing cursor for mouse users. The native cursor stays visible. */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEnabled(hasFinePointer() && !prefersReducedMotion());
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mx = -100;
    let my = -100;
    let rx = mx;
    let ry = my;
    let frame = 0;

    const tick = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      dot.classList.remove("cursor-hidden");
      ring.classList.remove("cursor-hidden");
      const target = e.target instanceof Element ? e.target : null;
      const card = target?.closest(".tilt-card");
      const link = target?.closest("a, button, [role=button], select, label, input, textarea");
      ring.classList.toggle("is-card", !!card);
      ring.classList.toggle("is-link", !card && !!link);
    };
    const onLeave = () => {
      dot.classList.add("cursor-hidden");
      ring.classList.add("cursor-hidden");
    };
    const onDown = () => ring.classList.add("is-down");
    const onUp = () => ring.classList.remove("is-down");

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <>
      <div ref={ringRef} className="cursor-ring cursor-hidden" aria-hidden="true">
        <span>View</span>
      </div>
      <div ref={dotRef} className="cursor-dot cursor-hidden" aria-hidden="true" />
    </>
  );
}
