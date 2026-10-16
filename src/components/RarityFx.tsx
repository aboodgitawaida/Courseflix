import { Feather, Flame, Info } from "lucide-react";
import type { CourseRarity, Rarity } from "@/lib/course-rarity";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
      <div className="space-y-4 text-sm leading-relaxed text-white/80">
        <p>
          We collected every Reddit comment that mentioned <b className="text-white">{name}</b> and
          read what each one said about the course.
        </p>
        <p>
          Out of <b className="text-white">{signal.votes}</b> comments that said whether it was easy
          or hard, <b className="text-white">{signal.percent}%</b> said it was{" "}
          <b className="text-white">{signal.kind}</b>.
        </p>
        <div>
          <div
            className="flex h-2.5 overflow-hidden rounded-full bg-white/10"
            role="img"
            aria-label={`${signal.easy} comments said easy, ${signal.hard} said hard`}
          >
            <div className="bg-amber-400" style={{ width: `${easyShare}%` }} />
            <div className="bg-red-500" style={{ width: `${100 - easyShare}%` }} />
          </div>
          <div className="mt-1.5 flex justify-between text-xs tabular-nums text-white/70">
            <span>{signal.easy} said easy</span>
            <span>{signal.hard} said hard</span>
          </div>
        </div>
        <p className="text-xs text-white/50">
          Based on the Reddit comments read so far. A computer program labels each comment, so a few
          labels can be wrong.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-4 text-sm leading-relaxed text-white/80">
      <p>
        <b className="text-white">{info.birdMentions}</b> reviews written by CourseFlix students
        call <b className="text-white">{name}</b> a bird course.
      </p>
      <p className="text-xs text-white/50">
        We count reviews that use the words &ldquo;bird course&rdquo; in the comment.
      </p>
    </div>
  );
}

/**
 * "Reddit says: easy" pill, styled for the tier. Renders nothing without real data.
 * Click it for a short explanation of where the verdict comes from.
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
  if (!info.rarity || !info.verdict) return null;
  const Icon = info.rarity === "gold" ? Feather : Flame;
  return (
    // The pill sits inside clickable cards. Stop clicks and keys here, including those that
    // bubble up from the portal-rendered dialog, so they do not open the course preview.
    <span
      className={`inline-flex ${className}`}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <Dialog>
        <DialogTrigger asChild>
          <button
            type="button"
            title={info.detail ?? undefined}
            aria-label={`${info.source} says ${info.verdict}. How we find this out`}
            className={`reddit-says reddit-says-btn reddit-says-${info.rarity} reddit-says-${size}`}
          >
            <Icon className="reddit-says-icon" aria-hidden="true" />
            <span className="reddit-says-source">{info.source} says</span>
            <span className="reddit-says-verdict">{info.verdict}</span>
            {info.signal && info.source === "Reddit" && (
              <span className="reddit-says-meta">
                {info.signal.percent}%
                <span className="sr-only"> of {info.signal.votes} opinions</span>
              </span>
            )}
            <Info className="reddit-says-info" aria-hidden="true" />
          </button>
        </DialogTrigger>
        <DialogContent
          className={`max-w-md border-2 bg-[#121216] text-white ${info.rarity === "gold" ? "border-amber-400/60" : "border-red-500/60"}`}
        >
          <DialogHeader>
            <DialogTitle className="font-mega text-2xl tracking-[-0.04em]">
              How we find this out
            </DialogTitle>
            <DialogDescription className="text-white/60">
              {code ? `${code}: ` : ""}
              {info.source} says {info.verdict}
            </DialogDescription>
          </DialogHeader>
          <HowWeKnow info={info} code={code} />
        </DialogContent>
      </Dialog>
    </span>
  );
}
