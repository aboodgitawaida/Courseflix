import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { COURSES, type Rail } from "@/lib/courses";
import { CourseCard } from "./CourseCard";

export function CourseRail({ rail }: { rail: Rail }) {
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
          <h2 className="font-display text-xl font-bold md:text-2xl">{rail.title}</h2>
          {rail.blurb && <p className="mt-0.5 text-sm text-muted-foreground">{rail.blurb}</p>}
        </div>
      </div>

      <div className="relative">
        <button
          onClick={() => scroll(-1)}
          aria-label={`Scroll ${rail.title} left`}
          className={`absolute left-1 top-1/2 z-40 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-black/70 backdrop-blur transition md:grid ${hover ? "opacity-100" : "opacity-0"} hover:bg-black`}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => scroll(1)}
          aria-label={`Scroll ${rail.title} right`}
          className={`absolute right-1 top-1/2 z-40 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-black/70 backdrop-blur transition md:grid ${hover ? "opacity-100" : "opacity-0"} hover:bg-black`}
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div
          ref={ref}
          className="scroll-rail flex gap-4 overflow-x-auto overflow-y-visible px-6 py-4 md:px-10"
        >
          {courses.map((c) => (
            <CourseCard key={c.code} course={c} />
          ))}
        </div>
      </div>
    </section>
  );
}
