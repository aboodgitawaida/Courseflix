import { Star, Plus, Check, GitCompare } from "lucide-react";
import { toast } from "sonner";
import { memo, useState } from "react";
import { getArt, getBadges, getMatchScore, type Course } from "@/lib/courses";
import { FALLBACK_MAJOR_IMAGE } from "@/lib/major-images";
import { getCourseImage } from "@/lib/course-images";
import { useCourseUI } from "@/hooks/use-course-ui";
import { useMajor } from "@/hooks/use-major";
import { useAuth } from "@/hooks/use-auth";
import { useCourseStats, useShortlist, useToggleShortlist } from "@/lib/ratings";

function Motif({ motif, accent }: { motif: string; accent: string }) {
  if (motif === "grid")
    return (
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `linear-gradient(${accent}22 1px, transparent 1px), linear-gradient(90deg, ${accent}22 1px, transparent 1px)`,
          backgroundSize: "22px 22px",
        }}
      />
    );
  if (motif === "neural")
    return (
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 35%, ${accent}55, transparent 45%), radial-gradient(circle at 75% 65%, ${accent}33, transparent 40%)`,
        }}
      />
    );
  if (motif === "columns")
    return (
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: `repeating-linear-gradient(90deg, ${accent}44 0 6px, transparent 6px 34px)`,
        }}
      />
    );
  if (motif === "geometry")
    return (
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, ${accent}33 0 1px, transparent 1px 18px), repeating-linear-gradient(-45deg, ${accent}22 0 1px, transparent 1px 18px)`,
        }}
      />
    );
  if (motif === "cells")
    return (
      <div
        className="absolute inset-0 opacity-35"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, ${accent}44 0 8px, transparent 9px), radial-gradient(circle at 60% 70%, ${accent}33 0 12px, transparent 13px), radial-gradient(circle at 85% 25%, ${accent}33 0 6px, transparent 7px)`,
        }}
      />
    );
  if (motif === "finance")
    return (
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `linear-gradient(115deg, transparent 40%, ${accent}44 50%, transparent 60%), repeating-linear-gradient(0deg, ${accent}18 0 1px, transparent 1px 20px)`,
        }}
      />
    );
  if (motif === "books")
    return (
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `repeating-linear-gradient(90deg, ${accent}33 0 10px, transparent 10px 16px, ${accent}22 16px 22px, transparent 22px 30px)`,
        }}
      />
    );
  return (
    <div
      className="absolute inset-0 opacity-30"
      style={{ backgroundImage: `radial-gradient(circle at 30% 25%, ${accent}44, transparent 55%)` }}
    />
  );
}

export const CourseCard = memo(function CourseCard({ course, size = "md" }: { course: Course; size?: "md" | "lg" }) {
  const w = size === "lg" ? "w-[300px] md:w-[340px]" : "w-[240px] md:w-[280px]";
  const art = getArt(course.subject);
  const [imageSrc, setImageSrc] = useState(() => getCourseImage(course.subject));
  const badges = getBadges(course);
  const { openPreview, compare, toggleCompare } = useCourseUI();
  const { major } = useMajor();
  const match = getMatchScore(course, major);
  const { signedIn } = useAuth();
  const { data: saved = [] } = useShortlist();
  const toggle = useToggleShortlist();
  const { data: stats } = useCourseStats(course.code);
  const displayRating = stats?.rating_count ? stats.avg_rating : course.rating;
  const inList = (saved as string[]).includes(course.code);
  const inCompare = compare.includes(course.code);

  async function onAdd(e: React.MouseEvent) {
    e.stopPropagation();
    if (!signedIn) {
      toast.error("Sign in to save courses");
      return;
    }
    try {
      await toggle.mutateAsync({ code: course.code, saved: inList });
      toast.success(inList ? `${course.code} removed from your shortlist` : `${course.code} added to your shortlist`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update shortlist");
    }
  }

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`${course.code}, ${course.title}, rated ${displayRating.toFixed(1)} out of 5`}
      onClick={() => openPreview(course.code)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openPreview(course.code);
        }
      }}
      className={`group relative shrink-0 ${w} cursor-pointer rounded-2xl border border-white/[0.08] bg-surface overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl hover:shadow-red-900/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30`}
    >
      <div className={`relative aspect-video bg-gradient-to-br ${art.gradient}`}>
        <img
          src={imageSrc}
          alt=""
          loading="lazy"
          decoding="async"
          width={800}
          height={450}
          className="absolute inset-0 h-full w-full object-cover opacity-75 transition-transform duration-500 group-hover:scale-105"
          onError={() => {
            if (imageSrc !== FALLBACK_MAJOR_IMAGE) setImageSrc(FALLBACK_MAJOR_IMAGE);
          }}
        />
        <div className="absolute inset-0 bg-black/35" />
        <Motif motif={art.motif} accent={art.accent} />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        <div className="absolute top-2 left-2 rounded-lg border border-white/[0.12] bg-white/[0.08] backdrop-blur-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/80">
          {course.area}
        </div>

        <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleCompare(course.code);
            }}
            aria-label={`${inCompare ? "Remove" : "Add"} ${course.code} ${inCompare ? "from" : "to"} comparison`}
            className={`grid h-7 w-7 place-items-center rounded-full border border-white/[0.12] bg-white/[0.08] backdrop-blur-md transition active:scale-[0.95] ${inCompare ? "bg-brand text-primary-foreground" : "hover:bg-white/[0.12]"}`}
          >
            <GitCompare className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onAdd}
            disabled={toggle.isPending}
            aria-label={`${inList ? "Remove" : "Add"} ${course.code} ${inList ? "from" : "to"} shortlist`}
            aria-busy={toggle.isPending}
            className={`grid h-7 w-7 place-items-center rounded-full border border-white/[0.12] bg-white/[0.08] backdrop-blur-md transition active:scale-[0.95] disabled:cursor-wait disabled:opacity-60 ${inList ? "bg-brand text-primary-foreground" : "hover:bg-white/[0.12]"}`}
          >
            {inList ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-3">
          <div className="font-display text-2xl font-bold leading-none text-white">{course.code}</div>
          <div className="mt-1 line-clamp-1 text-xs font-medium text-white/80">{course.title}</div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <span className="flex items-center gap-1 text-xs font-semibold text-brand">
          <Star className="h-3 w-3 fill-current" /> {displayRating.toFixed(1)}
        </span>
        {match !== null && (
          <span className="rounded-lg border border-white/[0.12] bg-white/[0.08] backdrop-blur-md px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">{match}% match</span>
        )}
        <span className="rounded-lg border border-white/[0.12] bg-white/[0.08] backdrop-blur-md px-1.5 py-0.5 text-[10px] text-muted-foreground">{course.credits} cr</span>
      </div>

      <div className="flex flex-wrap gap-1 px-3 pb-3">
        {badges.map((b) => (
          <span key={b.label} className="rounded-lg border border-white/[0.12] bg-white/[0.08] backdrop-blur-md px-1.5 py-0.5 text-[10px] text-white/80">
            {b.emoji} {b.label}
          </span>
        ))}
        {badges.length === 0 &&
          course.tags.slice(0, 2).map((t) => (
            <span key={t} className="rounded-lg border border-white/[0.12] bg-white/[0.08] backdrop-blur-md px-1.5 py-0.5 text-[10px] text-white/70">
              {t}
            </span>
          ))}
      </div>
    </article>
  );
});
