import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { COURSES, type Rail } from "@/lib/courses";
import { CourseCard } from "./CourseCard";

export function CourseRail({ rail }: { rail: Rail }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    ref.current?.scrollBy({ left: dir * (ref.current.clientWidth * 0.8), behavior: "smooth" });
  };
  const courses = rail.codes.map((c) => COURSES.find((x) => x.code === c)).filter(Boolean) as typeof COURSES;

  return (
    <section className="relative">
      <div className="flex items-end justify-between px-6 md:px-10 mb-3">
        <div>
          <h2 className="font-display text-xl md:text-2xl font-bold">{rail.title}</h2>
          {rail.blurb && <p className="text-sm text-muted-foreground mt-0.5">{rail.blurb}</p>}
        </div>
        <div className="hidden md:flex gap-2">
          <button
            onClick={() => scroll(-1)}
            className="h-9 w-9 rounded-full bg-surface hover:bg-surface-2 border border-border/50 flex items-center justify-center transition"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll(1)}
            className="h-9 w-9 rounded-full bg-surface hover:bg-surface-2 border border-border/50 flex items-center justify-center transition"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div
        ref={ref}
        className="scroll-rail flex gap-4 overflow-x-auto px-6 md:px-10 pb-4 pt-2"
      >
        {courses.map((c) => (
          <CourseCard key={c.code} course={c} />
        ))}
      </div>
    </section>
  );
}
