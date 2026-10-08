import { Star, Plus, Check, GitCompare } from "lucide-react";
import { toast } from "sonner";
import { memo, useRef, useState } from "react";
import { getArt, getBadges, getProgramMatch, type Course } from "@/lib/courses";
import { FALLBACK_SUBJECT_IMAGE, getCourseImage } from "@/lib/subject-images";
import { useCourseUI } from "@/hooks/use-course-ui";
import { useMajor } from "@/hooks/use-major";
import { useAuth } from "@/hooks/use-auth";
import { useCourseStats, useShortlist, useToggleShortlist } from "@/lib/ratings";
import { useSound } from "@/hooks/use-sound";
import { Burst } from "@/components/Burst";

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
      style={{
        backgroundImage: `radial-gradient(circle at 30% 25%, ${accent}44, transparent 55%)`,
      }}
    />
  );
}

export const CourseCard = memo(function CourseCard({
  course,
  size = "md",
}: {
  course: Course;
  size?: "md" | "lg";
}) {
  const w = size === "lg" ? "w-[300px] md:w-[340px]" : "w-[240px] md:w-[280px]";
  const art = getArt(course.subject);
  const [imageSrc, setImageSrc] = useState(() => getCourseImage(course.subject));
  const badges = getBadges(course);
  const { openPreview, compare, toggleCompare } = useCourseUI();
  const { major } = useMajor();
  const match = getProgramMatch(course, major);
  const { signedIn } = useAuth();
  const { data: saved = [] } = useShortlist();
  const toggle = useToggleShortlist();
  const { data: stats } = useCourseStats(course.code);
  const displayRating = stats?.rating_count ? stats.avg_rating : null;
  const inList = (saved as string[]).includes(course.code);
  const inCompare = compare.includes(course.code);
  const cardRef = useRef<HTMLElement>(null);
  const frame = useRef(0);
  const lastTick = useRef(0);
  const [burst, setBurst] = useState(0);
  const { play } = useSound();

  function onPointerEnter(e: React.PointerEvent<HTMLElement>) {
    if (e.pointerType !== "mouse") return;
    const now = performance.now();
    const activated = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } })
      .userActivation?.hasBeenActive;
    if (activated && now - lastTick.current > 90) {
      lastTick.current = now;
      play("tick");
    }
  }

  function onPointerMove(e: React.PointerEvent<HTMLElement>) {
    if (e.pointerType !== "mouse") return;
    const el = cardRef.current;
    if (!el) return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const px = (clientX - r.left) / r.width;
      const py = (clientY - r.top) / r.height;
      el.classList.add("is-tilting");
      el.style.setProperty("--ry", `${(px - 0.5) * 10}deg`);
      el.style.setProperty("--rx", `${(0.5 - py) * 8}deg`);
      el.style.setProperty("--gx", `${px * 100}%`);
      el.style.setProperty("--gy", `${py * 100}%`);
    });
  }

  function onPointerLeave() {
    const el = cardRef.current;
    if (!el) return;
    cancelAnimationFrame(frame.current);
    el.classList.remove("is-tilting");
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }

  async function onAdd(e: React.MouseEvent) {
    e.stopPropagation();
    if (!signedIn) {
      toast.error("Sign in to save courses");
      return;
    }
    try {
      await toggle.mutateAsync({ code: course.code, saved: inList });
      if (!inList) setBurst((n) => n + 1);
      toast.success(
        inList
          ? `${course.code} removed from your shortlist`
          : `${course.code} added to your shortlist`,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update shortlist");
    }
  }

  return (
    <article
      ref={cardRef}
      onPointerEnter={onPointerEnter}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      role="button"
      tabIndex={0}
      aria-label={`${course.code}, ${course.title}${displayRating === null ? ", no student rating yet" : `, rated ${displayRating.toFixed(1)} out of 5`}`}
      onClick={() => openPreview(course.code)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openPreview(course.code);
        }
      }}
      className={`tilt-card group relative shrink-0 ${w} cursor-pointer rounded-[20px] border border-white/[0.08] bg-surface overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70`}
    >
      <div className="tilt-glare" aria-hidden="true" />
      <div className={`course-card-art relative aspect-video bg-gradient-to-br ${art.gradient}`}>
        <img
          src={imageSrc}
          alt={`${course.subject} department`}
          loading="lazy"
          decoding="async"
          onError={() => setImageSrc(FALLBACK_SUBJECT_IMAGE)}
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <Motif motif={art.motif} accent={art.accent} />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        <div className="absolute top-2 left-2 rounded-lg border border-white/[0.12] bg-white/[0.08] backdrop-blur-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/80">
          {course.area}
        </div>

        <div className="absolute top-2 right-2 flex items-center gap-1.5 transition lg:opacity-0 lg:group-hover:opacity-100 lg:focus-within:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleCompare(course.code);
            }}
            aria-label={`${inCompare ? "Remove" : "Add"} ${course.code} ${inCompare ? "from" : "to"} comparison`}
            className={`grid h-10 w-10 place-items-center rounded-full border lg:h-7 lg:w-7 border-white/[0.12] bg-white/[0.08] backdrop-blur-md transition active:scale-[0.95] ${inCompare ? "bg-brand text-primary-foreground" : "hover:bg-white/[0.12]"}`}
          >
            <GitCompare className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onAdd}
            disabled={toggle.isPending}
            aria-label={`${inList ? "Remove" : "Add"} ${course.code} ${inList ? "from" : "to"} shortlist`}
            aria-busy={toggle.isPending}
            className={`relative grid h-10 w-10 place-items-center rounded-full border lg:h-7 lg:w-7 border-white/[0.12] bg-white/[0.08] backdrop-blur-md transition active:scale-[0.95] disabled:cursor-wait disabled:opacity-60 ${inList ? "bg-brand text-primary-foreground" : "hover:bg-white/[0.12]"}`}
          >
            {inList ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            <Burst trigger={burst} />
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-3">
          <div className="font-mega text-2xl font-extrabold leading-none tracking-tight text-white">
            {course.code}
          </div>
          <div className="mt-1 line-clamp-1 text-xs font-medium text-white/80">{course.title}</div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <span className="flex items-center gap-1 text-xs font-semibold text-brand">
          <Star className="h-3 w-3 fill-current" />{" "}
          {displayRating === null ? "—" : displayRating.toFixed(1)}
        </span>
        {match !== null && (
          <span className="rounded-lg border border-white/[0.12] bg-white/[0.08] backdrop-blur-md px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
            {match}
          </span>
        )}
        <span className="rounded-lg border border-white/[0.12] bg-white/[0.08] backdrop-blur-md px-1.5 py-0.5 text-[10px] text-muted-foreground">
          {course.credits} cr
        </span>
      </div>

      <div className="flex flex-wrap gap-1 px-3 pb-3">
        {badges.map((b) => (
          <span
            key={b.label}
            className="rounded-lg border border-white/[0.12] bg-white/[0.08] backdrop-blur-md px-1.5 py-0.5 text-[10px] text-white/80"
          >
            {b.emoji} {b.label}
          </span>
        ))}
        {badges.length === 0 &&
          course.tags.slice(0, 2).map((t) => (
            <span
              key={t}
              className="rounded-lg border border-white/[0.12] bg-white/[0.08] backdrop-blur-md px-1.5 py-0.5 text-[10px] text-white/70"
            >
              {t}
            </span>
          ))}
      </div>
    </article>
  );
});
