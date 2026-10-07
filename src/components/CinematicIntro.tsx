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
      className={`cinematic-overlay fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black ${
        !visible ? "pointer-events-none" : ""
      }`}
      onClick={finish}
    >
      <div className="cinematic-ambient pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-950/40 via-black to-black" />

      <div className="relative z-10 flex flex-col items-center">
        <div aria-label="Courseflix" className="wordmark text-6xl leading-none md:text-9xl">
          {"COURSEFLIX".split("").map((ch, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="intro-letter"
              style={{ animationDelay: `${0.15 + i * 0.05}s` }}
            >
              {ch}
            </span>
          ))}
        </div>
        <div className="intro-streak mt-4 h-[2px] w-[min(70vw,560px)] bg-gradient-to-r from-transparent via-brand to-transparent shadow-[0_0_24px_4px_rgba(229,9,20,0.55)]" />
        <div className="mt-5 text-[10px] font-semibold uppercase tracking-[0.5em] text-neutral-500 opacity-0 animate-fade-in-up [animation-delay:1s]">
          UTM · Course discovery
        </div>
      </div>

      <button
        type="button"
        className="absolute bottom-8 right-8 z-20 rounded-full border border-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400 transition-colors hover:border-white/40 hover:text-white"
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
