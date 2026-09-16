import { useCallback, useEffect, useRef, useState } from "react";

const INTRO_MS = 2500;

export function CinematicIntro() {
  const [visible, setVisible] = useState(true);
  const finishedRef = useRef(false);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setVisible(false);
  }, []);

  useEffect(() => {
    const hideTimer = window.setTimeout(finish, INTRO_MS);
    return () => window.clearTimeout(hideTimer);
  }, [finish]);

  if (!visible) return null;

  return (
    <div
      role="presentation"
      className="cinematic-overlay fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black"
      onClick={finish}
    >
      <div className="cinematic-ambient pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-950/40 via-black to-black" />

      <div className="cinematic-logo relative z-10 overflow-hidden">
        <h1 className="text-4xl font-black tracking-wider text-white drop-shadow-[0_0_30px_rgba(229,9,20,0.6)] md:text-6xl">
          COURSEFLIX
        </h1>
        <div className="cinematic-sheen pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/35 to-transparent" />
      </div>

      <button
        type="button"
        className="absolute bottom-8 right-8 z-20 text-xs text-neutral-400 transition-colors hover:text-white"
        onClick={(e) => {
          e.stopPropagation();
          finish();
        }}
      >
        Skip
      </button>
    </div>
  );
}
