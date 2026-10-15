import { Feather, Flame } from "lucide-react";
import type { CourseRarity, Rarity } from "@/lib/course-rarity";

// Each tier has its own particle field: gold twinkles in place, red embers rise and fade.
// Positions are fixed so server and client render the same markup.
const GOLD_SPARKLES = [
  { x: 12, y: 22, d: 0, s: 1 },
  { x: 78, y: 14, d: 1.3, s: 0.7 },
  { x: 34, y: 58, d: 2.1, s: 0.85 },
  { x: 88, y: 46, d: 0.6, s: 1.1 },
  { x: 56, y: 30, d: 3.2, s: 0.6 },
  { x: 22, y: 78, d: 1.8, s: 0.75 },
  { x: 66, y: 70, d: 2.7, s: 0.9 },
];
const RED_EMBERS = [
  { x: 8, d: 0, t: 3.1 },
  { x: 23, d: 1.7, t: 2.6 },
  { x: 41, d: 0.8, t: 3.4 },
  { x: 57, d: 2.4, t: 2.9 },
  { x: 72, d: 0.3, t: 3.7 },
  { x: 86, d: 1.2, t: 2.4 },
  { x: 95, d: 2.9, t: 3.2 },
];

/** Decorative effect layer. Fills its positioned parent and clips to its border-radius. */
export function RarityFx({ rarity, particles = true }: { rarity: Rarity; particles?: boolean }) {
  return (
    <div className={`rfx rfx-${rarity}`} aria-hidden="true">
      <div className="rfx-surface" />
      <div className="rfx-sweep" />
      {particles &&
        (rarity === "gold"
          ? GOLD_SPARKLES.map((p, i) => (
              <span
                key={i}
                className="rfx-sparkle"
                style={
                  {
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    animationDelay: `${p.d}s`,
                    "--s": p.s,
                  } as React.CSSProperties
                }
              />
            ))
          : RED_EMBERS.map((p, i) => (
              <span
                key={i}
                className="rfx-ember"
                style={
                  {
                    left: `${p.x}%`,
                    animationDelay: `${p.d}s`,
                    animationDuration: `${p.t}s`,
                    "--drift": `${i % 2 ? 10 : -8}px`,
                  } as React.CSSProperties
                }
              />
            )))}
      <div className="rfx-border" />
    </div>
  );
}

/** "Reddit says: easy" pill, styled for the tier. Renders nothing without real data. */
export function RedditSays({
  info,
  size = "sm",
  className = "",
}: {
  info: CourseRarity;
  size?: "sm" | "lg";
  className?: string;
}) {
  if (!info.rarity || !info.verdict) return null;
  const Icon = info.rarity === "gold" ? Feather : Flame;
  return (
    <span
      title={info.detail ?? undefined}
      className={`reddit-says reddit-says-${info.rarity} reddit-says-${size} ${className}`}
    >
      <Icon className="reddit-says-icon" aria-hidden="true" />
      <span className="reddit-says-source">{info.source} says</span>
      <span className="reddit-says-verdict">{info.verdict}</span>
      {info.signal && info.source === "Reddit" && (
        <span className="reddit-says-meta">
          {info.signal.percent}%<span className="sr-only"> of {info.signal.votes} opinions</span>
        </span>
      )}
    </span>
  );
}
