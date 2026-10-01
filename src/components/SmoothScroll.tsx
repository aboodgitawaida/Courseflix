import { useEffect } from "react";
import { useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import Lenis from "lenis";

export function SmoothScroll() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: false,
      smoothWheel: true,
    });
    lenisRef.current = lenis;
    let frame = 0;

    const raf = (time: number) => {
      lenis.raf(time);
      frame = window.requestAnimationFrame(raf);
    };

    frame = window.requestAnimationFrame(raf);
    return () => {
      window.cancelAnimationFrame(frame);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return null;
}
