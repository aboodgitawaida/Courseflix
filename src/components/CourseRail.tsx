import { useRef, useState, memo, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { COURSES, type Rail } from "@/lib/courses";
import { CourseCard } from "./CourseCard";
import { CourseCardSkeleton } from "./CourseCardSkeleton";
import { useReveal } from "@/hooks/use-reveal";
import { useScrollVelocity } from "@/hooks/use-scroll-velocity";

export const CourseRail = memo(function CourseRail({
  rail,
  loading = false,
  index = 0,
}: {
  rail: Rail;
  loading?: boolean;
  index?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);
  const scroll = (dir: 1 | -1) => {
    ref.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };
  const courses = useMemo(
    () =>
      rail.codes.map((c) => COURSES.find((x) => x.code === c)).filter(Boolean) as typeof COURSES,
    [rail.codes],
  );

  const revealRef = useReveal<HTMLElement>();
  useScrollVelocity(ref);
  const number = String(index + 1).padStart(2, "0");

  return (
    <section
      ref={revealRef}
      className="reveal relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="mb-1 flex items-end gap-4 px-6 md:gap-6 md:px-10">
        <span
          aria-hidden="true"
          className="text-outline hidden font-mega text-5xl font-black leading-[0.8] sm:block md:text-7xl"
        >
          {number}
        </span>
        <div className="min-w-0 flex-1 border-b border-white/[0.08] pb-3">
          <h2 className="font-display text-xl font-bold tracking-tight text-white md:text-3xl">
            {rail.title}
          </h2>
          {rail.blurb && <p className="mt-1 text-sm text-neutral-500">{rail.blurb}</p>}
        </div>
        <span className="hidden shrink-0 pb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground md:block">
          {courses.length} courses
        </span>
      </div>

      <div className="relative">
        <button
          onClick={() => scroll(-1)}
          aria-label={`Scroll ${rail.title} left`}
          className={`glass absolute left-3 top-1/2 z-40 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full transition duration-300 md:grid ${hover ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"} hover:bg-brand hover:text-primary-foreground`}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => scroll(1)}
          aria-label={`Scroll ${rail.title} right`}
          className={`glass absolute right-3 top-1/2 z-40 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full transition duration-300 md:grid ${hover ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"} hover:bg-brand hover:text-primary-foreground`}
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div
          ref={ref}
          className="rail-velocity scroll-rail rail-fade flex gap-4 overflow-x-auto overflow-y-visible px-6 py-6 md:px-10"
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <CourseCardSkeleton key={`skeleton-${i}`} />)
            : courses.map((c) => (
                // The wrapper takes the velocity skew so the card keeps its own tilt transform.
                <div key={c.code} className="rail-item shrink-0">
                  <CourseCard course={c} />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
});
