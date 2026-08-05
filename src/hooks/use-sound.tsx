import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

export type Cue = "add" | "remove" | "toggle" | "hover" | "open";

type SoundCtx = { muted: boolean; toggleMuted: () => void; play: (cue: Cue) => void };

const Ctx = createContext<SoundCtx | null>(null);

const KEY = "courseflix.muted";

const RECIPES: Record<Cue, { freq: number[]; dur: number; gain: number; type: OscillatorType }> = {
  add: { freq: [523.25, 783.99], dur: 0.13, gain: 0.06, type: "sine" },
  remove: { freq: [392, 261.63], dur: 0.13, gain: 0.05, type: "sine" },
  toggle: { freq: [660, 880], dur: 0.09, gain: 0.04, type: "triangle" },
  hover: { freq: [1320], dur: 0.04, gain: 0.018, type: "sine" },
  open: { freq: [440, 660], dur: 0.1, gain: 0.035, type: "triangle" },
};

export function SoundProvider({ children }: { children: ReactNode }) {
  const [muted, setMuted] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    setMuted(window.localStorage.getItem(KEY) === "1");
  }, []);

  const toggleMuted = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      window.localStorage.setItem(KEY, next ? "1" : "0");
      return next;
    });
  }, []);

  const play = useCallback(
    (cue: Cue) => {
      if (muted || typeof window === "undefined") return;
      const AudioCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtor) return;
      try {
        const ctx = ctxRef.current ?? new AudioCtor();
        ctxRef.current = ctx;
        if (ctx.state === "suspended") void ctx.resume();
        const recipe = RECIPES[cue];
        recipe.freq.forEach((f, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const start = ctx.currentTime + i * recipe.dur * 0.55;
          osc.type = recipe.type;
          osc.frequency.setValueAtTime(f, start);
          gain.gain.setValueAtTime(0.0001, start);
          gain.gain.exponentialRampToValueAtTime(recipe.gain, start + 0.012);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + recipe.dur);
          osc.connect(gain).connect(ctx.destination);
          osc.start(start);
          osc.stop(start + recipe.dur + 0.02);
        });
      } catch {
        // audio is a nice-to-have; ignore failures
      }
    },
    [muted],
  );

  return <Ctx.Provider value={{ muted, toggleMuted, play }}>{children}</Ctx.Provider>;
}

export function useSound() {
  const ctx = useContext(Ctx);
  if (!ctx) return { muted: true, toggleMuted: () => {}, play: () => {} } as SoundCtx;
  return ctx;
}
