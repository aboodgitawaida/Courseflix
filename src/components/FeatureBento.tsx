import { Bookmark, GitBranch, Search, Star, Users } from "lucide-react";
import type { ReactNode } from "react";
import { SUBJECTS } from "@/lib/courses";
import { ADVERTISED_COURSE_COUNT } from "@/lib/site";
import { useCourseUI } from "@/hooks/use-course-ui";
import { useReveal } from "@/hooks/use-reveal";

function Tile({
  className = "",
  children,
  onClick,
  label,
}: {
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  label?: string;
}) {
  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
  };
  const cls = `bento-tile glass rounded-3xl p-6 text-left md:p-7 ${className}`;
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        onPointerMove={onPointerMove}
        aria-label={label}
        className={`${cls} transition active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60`}
      >
        {children}
      </button>
    );
  }
  return (
    <div onPointerMove={onPointerMove} className={cls}>
      {children}
    </div>
  );
}

function Eyebrow({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">
      {icon}
      {children}
    </div>
  );
}

export function FeatureBento() {
  const { setSearchOpen } = useCourseUI();
  const ref = useReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      aria-labelledby="why-title"
      className="reveal relative px-6 pb-24 pt-8 md:px-10 md:pb-32"
    >
      <div className="mb-10 flex flex-col gap-4 md:mb-14 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Why Courseflix
          </p>
          <h2
            id="why-title"
            className="mt-3 max-w-3xl font-mega text-4xl font-extrabold leading-[0.95] md:text-6xl"
          >
            Not another{" "}
            <span className="font-serif-accent text-gradient-brand text-[1.15em]">
              course catalog.
            </span>
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          Everything you used to dig through Reddit, the calendar and rating sites for — in one feed
          that actually looks like it was made this decade.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-6">
        <Tile className="md:col-span-4 md:row-span-2 flex min-h-[320px] flex-col justify-between">
          <Eyebrow icon={<Star className="h-3.5 w-3.5" />}>The whole catalog</Eyebrow>
          <div>
            <div className="font-mega text-7xl font-black leading-none tracking-tighter md:text-[9rem]">
              <span className="text-gradient-brand">
                {ADVERTISED_COURSE_COUNT.toLocaleString("en-CA")}+
              </span>
            </div>
            <p className="mt-3 max-w-md text-lg font-medium text-foreground/85 md:text-xl">
              UTM courses across {SUBJECTS.length} subjects, sorted into rows built for your
              program.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {SUBJECTS.slice(0, 14).map((s) => (
              <span
                key={s}
                className="rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1 text-xs font-semibold text-muted-foreground"
              >
                {s}
              </span>
            ))}
            <span className="rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
              +{Math.max(SUBJECTS.length - 14, 0)} more
            </span>
          </div>
        </Tile>

        <Tile
          className="md:col-span-2 flex min-h-[200px] flex-col justify-between"
          onClick={() => setSearchOpen(true)}
          label="Open course search"
        >
          <Eyebrow icon={<Search className="h-3.5 w-3.5" />}>Instant search</Eyebrow>
          <div className="flex items-center gap-2">
            <kbd className="glow-ring grid h-16 w-16 place-items-center rounded-2xl bg-surface-2 font-mega text-2xl font-bold">
              ⌘
            </kbd>
            <kbd className="grid h-16 w-16 place-items-center rounded-2xl border border-white/[0.1] bg-surface-2 font-mega text-2xl font-bold">
              K
            </kbd>
          </div>
          <p className="text-sm text-muted-foreground">Any course, code or vibe. Try it →</p>
        </Tile>

        <Tile className="md:col-span-2 flex min-h-[200px] flex-col justify-between">
          <Eyebrow icon={<span aria-hidden="true">🦅</span>}>Bird radar</Eyebrow>
          <p className="font-mega text-2xl font-bold leading-tight">
            Light-workload signals, flagged.
          </p>
          <p className="text-sm text-muted-foreground">
            Know which electives won't eat your semester.
          </p>
        </Tile>

        <Tile className="md:col-span-2 flex min-h-[200px] flex-col justify-between">
          <Eyebrow icon={<GitBranch className="h-3.5 w-3.5" />}>Prereq trees</Eyebrow>
          <p className="font-mega text-2xl font-bold leading-tight">See what unlocks what.</p>
          <p className="text-sm text-muted-foreground">
            Plan two years ahead without a spreadsheet.
          </p>
        </Tile>

        <Tile className="md:col-span-2 flex min-h-[200px] flex-col justify-between">
          <Eyebrow icon={<Star className="h-3.5 w-3.5" />}>Student ratings</Eyebrow>
          <div className="flex gap-1 text-brand" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-6 w-6 fill-current" />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Rated by students, for students. Add yours.
          </p>
        </Tile>

        <Tile className="md:col-span-2 flex min-h-[200px] flex-col justify-between">
          <Eyebrow icon={<Bookmark className="h-3.5 w-3.5" />}>Shortlist</Eyebrow>
          <p className="font-mega text-2xl font-bold leading-tight">
            Save it. <span className="text-brand">Share it.</span>
          </p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" /> Compare picks with friends.
          </p>
        </Tile>
      </div>
    </section>
  );
}
