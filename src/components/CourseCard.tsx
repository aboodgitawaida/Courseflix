import { Link } from "@tanstack/react-router";
import type { Course } from "@/lib/courses";
import { Star } from "lucide-react";

export function CourseCard({ course, size = "md" }: { course: Course; size?: "md" | "lg" }) {
  const w = size === "lg" ? "w-[280px] md:w-[320px]" : "w-[220px] md:w-[240px]";
  const h = size === "lg" ? "h-[380px] md:h-[420px]" : "h-[300px] md:h-[320px]";
  const [c1, c2] = course.poster;

  return (
    <Link
      to="/course/$code"
      params={{ code: course.code }}
      className={`group relative shrink-0 ${w} ${h} rounded-2xl overflow-hidden border border-border/40 bg-surface transition-all duration-300 hover:scale-[1.04] hover:brand-glow hover:border-brand/60 hover:z-10`}
    >
      {/* Poster gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
        }}
      />
      {/* Grain overlay */}
      <div className="absolute inset-0 opacity-30 mix-blend-overlay"
           style={{ backgroundImage: "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.4), transparent 50%)" }} />

      {/* Rating pill */}
      <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/50 backdrop-blur px-2.5 py-1 text-xs font-semibold text-brand border border-brand/30">
        <Star className="h-3 w-3 fill-current" /> {course.rating.toFixed(1)}
      </div>

      {/* Area tag */}
      <div className="absolute top-3 left-3 rounded-md bg-black/40 backdrop-blur px-2 py-0.5 text-[10px] font-medium tracking-wider uppercase text-white/90">
        {course.area}
      </div>

      {/* Bottom gradient + content */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <div className="font-display text-2xl font-bold text-white leading-none">{course.code}</div>
        <div className="mt-1 text-sm font-medium text-white/85 line-clamp-2">{course.title}</div>
        <div className="mt-2 flex flex-wrap gap-1">
          {course.tags.slice(0, 2).map((t) => (
            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/80 border border-white/10">
              {t}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
