import { useEffect, useRef, useState } from "react";
import { ChevronDown, Feather, Flame } from "lucide-react";
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

/** What the pill is based on, in plain words. Only built from real data. */
function HowWeKnow({ info, code }: { info: CourseRarity; code?: string }) {
  const { signal } = info;
  const name = code ?? "this course";
  if (info.source === "Reddit" && signal) {
    const easyShare = (100 * signal.easy) / signal.votes;
    return (
      <>
        <p>
          We collected every Reddit comment that mentioned <b>{name}</b>. Out of{" "}
          <b>{signal.votes}</b> people who said whether it was easy or hard,{" "}
          <b>{signal.percent}%</b> said it was <b>{signal.kind}</b>.
        </p>
        <div
          className="reddit-says-bar"
          role="img"
          aria-label={`${signal.easy} comments said easy, ${signal.hard} said hard`}
        >
          <span className="reddit-says-bar-easy" style={{ width: `${easyShare}%` }} />
          <span className="reddit-says-bar-hard" style={{ width: `${100 - easyShare}%` }} />
        </div>
        <div className="reddit-says-counts">
          <span>{signal.easy} said easy</span>
          <span>{signal.hard} said hard</span>
        </div>
        <p className="reddit-says-note">
          Based on the comments read so far. A computer program labels each one, so a few can be
          wrong.
        </p>
      </>
    );
  }
  return (
    <>
      <p>
        <b>{info.birdMentions}</b> reviews written by CourseFlix students call <b>{name}</b> a bird
        course.
      </p>
      <p className="reddit-says-note">
        We count reviews that use the words &ldquo;bird course&rdquo; in the comment.
      </p>
    </>
  );
}

/**
 * "Reddit says: easy" pill, styled for the tier. Renders nothing without real data.
 * Click it and it grows a panel that shows where the verdict comes from.
 */
export function RedditSays({
  info,
  size = "sm",
  className = "",
  code,
}: {
  info: CourseRarity;
  size?: "sm" | "lg";
  className?: string;
  code?: string;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLSpanElement>(null);

  // Close on Escape or a click anywhere else. Escape is caught on the way down so it closes
  // only this panel, not the course preview around it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      setOpen(false);
    };
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey, true);
    document.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  if (!info.rarity || !info.verdict) return null;
  const Icon = info.rarity === "gold" ? Feather : Flame;
  return (
    // The pill sits inside clickable cards, so clicks and keys stop here instead of opening
    // the course preview.
    <span
      ref={root}
      className={`reddit-says-wrap ${className}`}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-label={`${info.source} says ${info.verdict}. How we find this out`}
        onClick={() => setOpen((v) => !v)}
        className={`reddit-says reddit-says-btn reddit-says-${info.rarity} reddit-says-${size}`}
      >
        <Icon className="reddit-says-icon" aria-hidden="true" />
        <span className="reddit-says-source">{info.source} says</span>
        <span className="reddit-says-verdict">{info.verdict}</span>
        {info.signal && info.source === "Reddit" && (
          <span className="reddit-says-meta">
            {info.signal.percent}%<span className="sr-only"> of {info.signal.votes} opinions</span>
          </span>
        )}
        <ChevronDown
          className={`reddit-says-chevron ${open ? "is-open" : ""}`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div
          className={`reddit-says-panel reddit-says-panel-${info.rarity} reddit-says-panel-${size}`}
        >
          <div className="reddit-says-panel-title">How we find this out</div>
          <HowWeKnow info={info} code={code} />
        </div>
      )}
    </span>
  );
}
