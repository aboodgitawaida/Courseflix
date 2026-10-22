import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Check, Copy, ExternalLink, Plus, Star } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getArt, getBadges, getCourse, getProgramMatch } from "@/lib/courses";
import { useCourseUI } from "@/hooks/use-course-ui";
import { useMajor } from "@/hooks/use-major";
import { getMajor } from "@/lib/majors";
import { useAuth } from "@/hooks/use-auth";
import { useCourseStats, useShortlist, useToggleShortlist } from "@/lib/ratings";
import { useCourseDescription } from "@/lib/course-description";
import { OFFLINE_SUBJECT_IMAGE, getCourseImage } from "@/lib/subject-images";
import { PrereqTree } from "./PrereqTree";
import { useEffect, useState } from "react";
import { calendarUrl } from "@/lib/links";
import { recordSubjectInterest } from "@/lib/interest";
import { useCourseRarity } from "@/lib/course-rarity";
import { goldenEagle } from "@/lib/study-eagle";
import { RarityFx, RedditSays } from "./RarityFx";

export function CoursePreviewModal() {
  const { previewCode, closePreview } = useCourseUI();
  const { major } = useMajor();
  const { signedIn } = useAuth();
  const { data: saved = [] } = useShortlist();
  const toggle = useToggleShortlist();

  const course = previewCode ? getCourse(previewCode) : undefined;
  const description = useCourseDescription(course?.code);
  const { data: stats } = useCourseStats(course?.code ?? "");
  const open = !!course;
  const art = getArt(course?.subject ?? "");
  const [imageSrc, setImageSrc] = useState(() => getCourseImage(course?.subject ?? ""));
  const inList = course ? (saved as string[]).includes(course.code) : false;
  const match = course ? getProgramMatch(course, major) : null;
  const hasStudentData = Boolean(stats?.rating_count);
  const displayRating = hasStudentData ? stats!.avg_rating.toFixed(1) : "—";
  const displayDifficulty = hasStudentData ? stats!.avg_difficulty.toFixed(1) : "—";
  const displayWorkload = hasStudentData ? stats!.avg_workload.toFixed(1) : "—";
  const majorName = getMajor(major)?.name;
  const rarityInfo = useCourseRarity(course?.code ?? "");
  const { rarity } = rarityInfo;
  // A gold (bird) course makes him go gold, once per course per session.
  const goldCode = course?.code;
  useEffect(() => {
    if (rarity === "gold" && goldCode) goldenEagle("birdCourse", {}, { once: `gold-${goldCode}` });
  }, [rarity, goldCode]);

  useEffect(() => {
    setImageSrc(getCourseImage(course?.subject ?? ""));
  }, [course?.subject]);

  useEffect(() => {
    if (course) recordSubjectInterest(course.subject);
  }, [course]);

  async function onShortlist() {
    if (!course) return;
    if (!signedIn) {
      toast.error("Sign in to save courses");
      return;
    }
    try {
      await toggle.mutateAsync({ code: course.code, saved: inList });
      toast.success(inList ? `${course.code} removed` : `${course.code} added to your shortlist`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update shortlist");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && closePreview()}>
      <DialogContent
        className="max-w-3xl overflow-hidden border-white/10 bg-[#121216] p-0 shadow-2xl shadow-brand/10 sm:rounded-[2rem]"
        // The Study Eagle sits above the preview with a summary of this course;
        // tapping it shouldn't count as a click outside that closes the preview.
        onInteractOutside={(event) => {
          if (
            (event.target as Element | null)?.closest?.(
              ".study-eagle, .study-eagle-tuck, .study-eagle-panel",
            )
          ) {
            event.preventDefault();
          }
        }}
        // Esc inside the eagle's chat closes the chat, not the preview.
        onEscapeKeyDown={(event) => {
          if (document.activeElement?.closest?.(".study-eagle-panel")) event.preventDefault();
        }}
      >
        {course && (
          <div className="max-h-[85vh] overflow-y-auto">
            <div
              className={`relative aspect-[16/7] bg-gradient-to-br ${art.gradient} ${rarity ? `rarity-${rarity}` : ""}`}
            >
              <img
                src={imageSrc}
                alt={`${course.subject} department`}
                loading="lazy"
                decoding="async"
                onError={() => setImageSrc(OFFLINE_SUBJECT_IMAGE)}
                className="absolute inset-0 h-full w-full object-cover opacity-35"
              />
              {rarity && (
                <div className="rfx-flat absolute inset-0">
                  <RarityFx rarity={rarity} />
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 z-[5] h-2/3 bg-gradient-to-t from-[#121216] via-[#121216]/70 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 z-[5] p-6">
                <RedditSays info={rarityInfo} code={course.code} size="lg" className="mb-3" />
                <DialogTitle
                  className={`font-mega text-4xl font-black tracking-[-0.05em] md:text-6xl ${rarity ? "rarity-title" : ""}`}
                >
                  {course.code}
                </DialogTitle>
                <DialogDescription className="mt-1 text-base font-medium text-white/85">
                  {course.title}
                </DialogDescription>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                  {match !== null && (
                    <span className="font-semibold text-emerald-400">
                      {match}
                      {majorName ? ` · ${majorName}` : ""}
                    </span>
                  )}
                  <span className="rounded border border-white/15 bg-black/40 px-2 py-0.5">
                    {course.area}
                  </span>
                  <span className="text-white/70">
                    {hasStudentData
                      ? `${stats!.pct_would_take_again}% would retake`
                      : "No student data yet"}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-brand">
                    <Star className="h-3 w-3 fill-current" /> {displayRating}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6 p-6">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={onShortlist}
                  className="shine inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-brand/30 transition hover:bg-brand-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#121216]"
                >
                  {inList ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {inList ? "In your shortlist" : "Add to Shortlist"}
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(course.code);
                    toast.success(`${course.code} copied for ACORN`);
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold transition hover:border-brand/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#121216]"
                >
                  <Copy className="h-4 w-4" /> Copy ACORN Code
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {getBadges(course).map((b) => (
                  <span
                    key={b.label}
                    className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs"
                  >
                    {b.emoji} {b.label}
                  </span>
                ))}
                {course.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <p className="min-h-[3lh] text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Stat label="Rating" value={hasStudentData ? `${displayRating}/5` : "No data"} />
                <Stat
                  label="Difficulty"
                  value={hasStudentData ? `${displayDifficulty}/5` : "No data"}
                />
                <Stat
                  label="Workload"
                  value={hasStudentData ? `${displayWorkload}/5` : "No data"}
                />
                <Stat label="Assessment data" value="Not verified" />
              </div>

              <div>
                <h3 className="font-display text-lg font-bold">Contact hours</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {course.hours || "Hours not listed"} · {course.credits} credit
                  {course.credits === 1 ? "" : "s"}
                </p>
              </div>

              <div>
                <h3 className="font-display text-lg font-bold">Prerequisite path</h3>
                <div className="mt-3">
                  <PrereqTree code={course.code} />
                </div>
                {course.prereqRaw && (
                  <p className="mt-3 text-xs text-muted-foreground">{course.prereqRaw}</p>
                )}
              </div>

              <div className="flex flex-wrap gap-3 border-t border-white/10 pt-4 text-sm">
                <Link
                  to="/course/$code"
                  params={{ code: course.code }}
                  onClick={closePreview}
                  className="rounded-sm font-semibold text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70"
                >
                  Full course page →
                </Link>
                <a
                  href={calendarUrl(course.code)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70"
                >
                  Syllabus / calendar entry <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display text-xl font-bold">{value}</div>
    </div>
  );
}
