import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Check, Copy, ExternalLink, Plus, Star } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getArt, getBadges, getCourse, getMatchScore, examWeight } from "@/lib/courses";
import { useCourseUI } from "@/hooks/use-course-ui";
import { useMajor } from "@/hooks/use-major";
import { getMajor } from "@/lib/majors";
import { useAuth } from "@/hooks/use-auth";
import { useShortlist, useToggleShortlist } from "@/lib/ratings";
import { PrereqTree } from "./PrereqTree";

export function CoursePreviewModal() {
  const { previewCode, closePreview } = useCourseUI();
  const { major } = useMajor();
  const { signedIn } = useAuth();
  const { data: saved = [] } = useShortlist();
  const toggle = useToggleShortlist();

  const course = previewCode ? getCourse(previewCode) : undefined;
  const open = !!course;
  const art = getArt(course?.subject ?? "");
  const inList = course ? (saved as string[]).includes(course.code) : false;
  const match = course ? getMatchScore(course, major) : null;
  const majorName = getMajor(major)?.name;

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
      <DialogContent className="max-w-3xl overflow-hidden border-white/10 bg-[#121216] p-0 sm:rounded-2xl">
        {course && (
          <div className="max-h-[85vh] overflow-y-auto">
            <div className={`relative aspect-[16/7] bg-gradient-to-br ${art.gradient}`}>
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#121216] via-[#121216]/70 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <DialogTitle className="font-display text-4xl font-black md:text-5xl">{course.code}</DialogTitle>
                <DialogDescription className="mt-1 text-base font-medium text-white/85">
                  {course.title}
                </DialogDescription>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                  {match !== null && (
                    <span className="font-semibold text-emerald-400">
                      {match}% match{majorName ? ` for ${majorName}` : ""}
                    </span>
                  )}
                  <span className="rounded border border-white/15 bg-black/40 px-2 py-0.5">{course.area}</span>
                  <span className="text-white/70">{course.wouldTakeAgain}% would retake</span>
                  <span className="flex items-center gap-1 font-semibold text-brand">
                    <Star className="h-3 w-3 fill-current" /> {course.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6 p-6">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={onShortlist}
                  className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-brand-glow"
                >
                  {inList ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {inList ? "In your shortlist" : "Add to Shortlist"}
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(course.code);
                    toast.success(`${course.code} copied for ACORN`);
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold transition hover:border-brand/50"
                >
                  <Copy className="h-4 w-4" /> Copy ACORN Code
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {getBadges(course).map((b) => (
                  <span key={b.label} className="rounded border border-white/10 bg-white/5 px-2 py-1 text-xs">
                    {b.emoji} {b.label}
                  </span>
                ))}
                {course.tags.map((t) => (
                  <span key={t} className="rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-muted-foreground">
                    {t}
                  </span>
                ))}
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground">{course.description}</p>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Stat label="Rating" value={`${course.rating.toFixed(1)}/5`} />
                <Stat label="Difficulty" value={`${course.difficulty.toFixed(1)}/5`} />
                <Stat label="Workload" value={`${course.workload.toFixed(1)}/5`} />
                <Stat label="Exam weight" value={`${examWeight(course)}%`} />
              </div>

              <div>
                <h3 className="font-display text-lg font-bold">Contact hours</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {course.hours || "Hours not listed"} · {course.credits} credit{course.credits === 1 ? "" : "s"}
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
                  className="font-semibold text-brand hover:underline"
                >
                  Full course page →
                </Link>
                <a
                  href={`https://utm.calendar.utoronto.ca/search-courses?course_search=${encodeURIComponent(course.code)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
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
