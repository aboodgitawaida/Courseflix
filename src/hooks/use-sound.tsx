import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type SoundName = "add" | "remove" | "toggle" | "pop" | "tick";

const KEY = "courseflix.muted";

const TONES: Record<
  SoundName,
  { freq: number; to: number; dur: number; type: OscillatorType; gain?: number }
> = {
  add: { freq: 520, to: 880, dur: 0.16, type: "sine" },
  remove: { freq: 420, to: 220, dur: 0.16, type: "sine" },
  toggle: { freq: 300, to: 620, dur: 0.12, type: "triangle" },
  pop: { freq: 660, to: 660, dur: 0.08, type: "square" },
  tick: { freq: 1500, to: 950, dur: 0.035, type: "sine", gain: 0.018 },
};

const SoundContext = createContext<{
  muted: boolean;
  toggleMuted: () => void;
  play: (n: SoundName) => void;
}>({
  muted: false,
  toggleMuted: () => {},
  play: () => {},
});

export function SoundProvider({ children }: { children: ReactNode }) {
  const [muted, setMuted] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    setMuted(window.localStorage.getItem(KEY) === "1");
  }, []);

  const play = useCallback(
    (name: SoundName) => {
      if (muted || typeof window === "undefined") return;
      try {
        const Ctor =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctor) return;
        const ctx = ctxRef.current ?? new Ctor();
        ctxRef.current = ctx;
        if (ctx.state === "suspended") void ctx.resume();
        const cfg = TONES[name];
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = cfg.type;
        osc.frequency.setValueAtTime(cfg.freq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(cfg.to, ctx.currentTime + cfg.dur);
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(
          cfg.gain ?? 0.09,
          ctx.currentTime + Math.min(0.02, cfg.dur / 3),
        );
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + cfg.dur);
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + cfg.dur + 0.02);
      } catch {
        return;
      }
    },
    [muted],
  );

  const toggleMuted = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      window.localStorage.setItem(KEY, next ? "1" : "0");
      return next;
    });
  }, []);

  return (
    <SoundContext.Provider value={{ muted, toggleMuted, play }}>{children}</SoundContext.Provider>
  );
}

export const useSound = () => useContext(SoundContext);
