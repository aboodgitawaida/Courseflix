import type { CSSProperties } from "react";

const PARTICLES = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2;
  const dist = 34 + (i % 3) * 10;
  return {
    x: Math.cos(angle) * dist,
    y: Math.sin(angle) * dist,
    hue: i % 2 ? "var(--brand)" : "var(--brand-2)",
  };
});

/** A one-shot particle burst. Change `trigger` to replay it; 0 renders nothing. */
export function Burst({ trigger }: { trigger: number }) {
  if (!trigger) return null;
  return (
    <span
      key={trigger}
      aria-hidden="true"
      className="burst pointer-events-none absolute left-1/2 top-1/2 z-20"
    >
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="burst-dot"
          style={{ "--bx": `${p.x}px`, "--by": `${p.y}px`, background: p.hue } as CSSProperties}
        />
      ))}
      <span className="burst-ring" />
    </span>
  );
}
