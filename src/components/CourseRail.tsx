import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { COURSES, type Rail } from "@/lib/courses";
import { CourseCard } from "./CourseCard";
import { CourseCardSkeleton } from "./CourseCardSkeleton";

export function CourseRail({ rail, loading = false }: { rail: Rail; loading?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);
  const scroll = (dir: 1 | -1) => {
    ref.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };
  const courses = rail.codes.map((c) => COURSES.find((x) => x.code === c)).filter(Boolean) as typeof COURSES;

  return (
    <section
      className="relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="mb-2 flex items-end justify-between px-6 md:px-10">
        <div>
          <h2 className="font-display text-xl font-bold md:text-2xl text-white tracking-tight">{rail.title}</h2>
          {rail.blurb && <p className="mt-0.5 text-sm text-neutral-400">{rail.blurb}</p>}
        </div>
      </div>

      <div className="relative">
        <button
          onClick={() => scroll(-1)}
          aria-label={`Scroll ${rail.title} left`}
          className={`absolute left-1 top-1/2 z-40 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-white/10 backdrop-blur-md transition md:grid ${hover ? "opacity-100" : "opacity-0"} hover:bg-white/20`}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => scroll(1)}
          aria-label={`Scroll ${rail.title} right`}
          className={`absolute right-1 top-1/2 z-40 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-white/10 backdrop-blur-md transition md:grid ${hover ? "opacity-100" : "opacity-0"} hover:bg-white/20`}
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div
          ref={ref}
          className="scroll-rail flex gap-4 overflow-x-auto overflow-y-visible px-6 py-4 md:px-10"
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <CourseCardSkeleton key={`skeleton-${i}`} />)
            : courses.map((c) => <CourseCard key={c.code} course={c} />)
          }
        </div>
      </div>
    </section>
  );
}
