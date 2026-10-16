import { useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, Feather, Skull, Sparkles } from "lucide-react";
import type { Course } from "@/lib/courses";
import { useBirdCourses } from "@/lib/ratings";
import { getTiers } from "@/lib/tiers";
import { CourseCard } from "@/components/CourseCard";
import { useReveal } from "@/hooks/use-reveal";

const SPARKLE_SPOTS = [6, 20, 34, 52, 68, 82, 93];
const EMBER_SPOTS = [4, 15, 27, 41, 58, 71, 86, 95];

function TierScroller({ courses, label }: { courses: Course[]; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  return (
    <div className="relative">
      <button
        onClick={() => scroll(-1)}
        aria-label={`Scroll ${label} left`}
        className="glass absolute left-3 top-1/2 z-[var(--z-rail)] hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full md:grid hover:bg-brand hover:text-primary-foreground"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => scroll(1)}
        aria-label={`Scroll ${label} right`}
        className="glass absolute right-3 top-1/2 z-[var(--z-rail)] hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full md:grid hover:bg-brand hover:text-primary-foreground"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
      <div
        ref={ref}
        className="scroll-rail rail-fade flex gap-4 overflow-x-auto overflow-y-visible px-6 py-6 md:px-10"
      >
        {courses.map((c) => (
          <CourseCard key={c.code} course={c} />
        ))}
      </div>
    </div>
  );
}

function BirdTier({ courses }: { courses: Course[] }) {
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} className="reveal tier tier-bird" aria-label="Bird courses">
      <div className="tier-bg" aria-hidden="true">
        {SPARKLE_SPOTS.map((x, i) => (
          <span
            key={x}
            className="tier-mote"
            style={{ left: `${x}%`, animationDelay: `${i * 0.7}s` }}
          />
        ))}
      </div>
      <div className="relative px-6 md:px-10">
        <p className="tier-eyebrow">
          <Sparkles className="h-4 w-4" aria-hidden="true" /> Easy marks, per Reddit and students
        </p>
        <h3 className="tier-title tier-title-bird">
          <Feather className="tier-title-icon" aria-hidden="true" />
          Bird courses
        </h3>
        <p className="tier-count">
          {courses.length} course{courses.length === 1 ? "" : "s"}
        </p>
      </div>
      {courses.length ? (
        <TierScroller courses={courses} label="bird courses" />
      ) : (
        <p className="relative px-6 py-8 text-sm text-neutral-400 md:px-10">
          No course has enough opinions yet.
        </p>
      )}
    </section>
  );
}

function DangerTier({ courses }: { courses: Course[] }) {
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} className="reveal tier tier-danger" aria-label="Danger zone">
      <div className="tier-bg" aria-hidden="true">
        {EMBER_SPOTS.map((x, i) => (
          <span
            key={x}
            className="tier-ember"
            style={{ left: `${x}%`, animationDelay: `${i * 0.45}s` }}
          />
        ))}
      </div>
      <div className="hazard-tape" aria-hidden="true">
        <span>{"DANGER ✕ ".repeat(24)}</span>
      </div>
      <div className="relative px-6 pt-6 md:px-10">
        <p className="tier-eyebrow">
          <Skull className="h-4 w-4" aria-hidden="true" /> Enter at your own risk
        </p>
        <h3 className="tier-title tier-title-danger" data-text="Danger zone">
          Danger zone
        </h3>
        <p className="tier-count">
          {courses.length} course{courses.length === 1 ? "" : "s"} students warn about
        </p>
      </div>
      {courses.length ? (
        <TierScroller courses={courses} label="danger zone" />
      ) : (
        <p className="relative px-6 py-8 text-sm text-neutral-400 md:px-10">
          No course has enough opinions yet.
        </p>
      )}
    </section>
  );
}

/** A gold "Bird courses" row and a red "Danger zone" row, across every year. */
export function TierSections() {
  const { data: birdMentions } = useBirdCourses();
  const tiers = useMemo(() => getTiers(birdMentions), [birdMentions]);

  return (
    <section className="relative mt-10 space-y-14 md:mt-14 md:space-y-20" aria-label="Verdict">
      <div className="px-6 md:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          The verdict
        </p>
        <h2 className="mt-3 font-mega text-4xl font-extrabold leading-[0.95] md:text-6xl">
          Easy marks or{" "}
          <span className="font-serif-accent text-gradient-brand text-[1.15em]">danger?</span>
        </h2>
      </div>
      <BirdTier courses={tiers.birds} />
      <DangerTier courses={tiers.danger} />
    </section>
  );
}
