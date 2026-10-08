import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { TopNav } from "@/components/TopNav";
import { CourseCard } from "@/components/CourseCard";
import { RatingSection } from "@/components/RatingSection";
import { PrereqTree } from "@/components/PrereqTree";
import { COURSES, getCourse } from "@/lib/courses";
import { useAuth } from "@/hooks/use-auth";
import { useCourseStats, useShortlist, useToggleShortlist } from "@/lib/ratings";
import { FALLBACK_SUBJECT_IMAGE, getCourseImage } from "@/lib/subject-images";
import { calendarUrl } from "@/lib/links";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Check,
  Share2,
  GraduationCap,
  Star,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";
import { Spotlight } from "@/components/Spotlight";
import { useReveal } from "@/hooks/use-reveal";
import { ShareStoryButton } from "@/components/ShareStoryButton";
import { Burst } from "@/components/Burst";
import { renderCourseStory } from "@/lib/story-card";
import { useEffect, useState } from "react";
import { siteUrl } from "@/lib/site";
import { rmpTorontoSearchUrl, rmpUtmSearchUrl, timetableUrl } from "@/lib/links";
import { getProfessorRating } from "@/lib/professor-ratings";
import { PUBLISHED_INSTRUCTORS } from "@/lib/course-instructors";
import { loadDescriptions } from "@/lib/course-description";

export const Route = createFileRoute("/course/$code")({
  loader: async ({ params }) => {
    const course = getCourse(params.code);
    if (!course) throw notFound();
    const descriptions = await loadDescriptions();
    return { course, description: descriptions[course.code] ?? "" };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.course.code} — ${loaderData.course.title} · courseflix`
          : "courseflix",
      },
      { name: "description", content: loaderData?.description || "UTM course details" },
      {
        property: "og:title",
        content: loaderData
          ? `${loaderData.course.code} · ${loaderData.course.title}`
          : "courseflix",
      },
      { property: "og:description", content: loaderData?.description ?? "" },
      { property: "og:type", content: "article" },
      {
        property: "og:url",
        content: loaderData ? siteUrl(`/course/${loaderData.course.code}`) : siteUrl(),
      },
      { property: "og:image", content: siteUrl("/og-image.png") },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: siteUrl("/og-image.png") },
    ],
    links: loaderData
      ? [{ rel: "canonical", href: siteUrl(`/course/${loaderData.course.code}`) }]
      : [],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />
      <div className="px-10 py-24 text-center">
        <h1 className="font-display text-4xl">Course not found</h1>
        <Link to="/" className="text-brand mt-4 inline-block">
          ← Back to browse
        </Link>
      </div>
    </div>
  ),
  component: CoursePage,
});

function CoursePage() {
  const { course, description } = Route.useLoaderData();
  const publishedInstructors = PUBLISHED_INSTRUCTORS[course.code] ?? [];
  const [c1, c2] = course.poster;
  const [imageSrc, setImageSrc] = useState(() =>
    getCourseImage(course.subject).replace("w=400", "w=1200"),
  );
  const bodyRef = useReveal<HTMLElement>();
  const relatedRef = useReveal<HTMLElement>();
  const related = COURSES.filter((c) => c.area === course.area && c.code !== course.code).slice(
    0,
    6,
  );

  const navigate = useNavigate();
  const { signedIn } = useAuth();
  const { data: stats } = useCourseStats(course.code);
  const { data: shortlist = [] } = useShortlist();
  const toggle = useToggleShortlist();
  const saved = shortlist.includes(course.code);
  const hasReal = !!stats && stats.rating_count > 0;
  const [burst, setBurst] = useState(0);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("study-eagle-summarize", { detail: { course, context: "page" } }),
    );
  }, [course]);

  async function onShortlist() {
    if (!signedIn) {
      navigate({ to: "/auth", search: { redirect: `/course/${course.code}` } });
      return;
    }
    try {
      await toggle.mutateAsync({ code: course.code, saved });
      if (!saved) setBurst((n) => n + 1);
      toast.success(saved ? "Removed from your shortlist" : "Saved to your shortlist");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update shortlist");
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-clip text-foreground">
      <Spotlight />
      <TopNav />

      <section className="relative isolate -mt-[4.25rem] overflow-hidden pt-[4.25rem]">
        <div
          className="absolute inset-0 -z-10 opacity-60"
          style={{ background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)` }}
        />
        <img
          src={imageSrc}
          alt=""
          aria-hidden="true"
          onError={() => setImageSrc(FALLBACK_SUBJECT_IMAGE)}
          className="hero-course-image absolute inset-0 -z-10 h-full w-full scale-105 object-cover opacity-40 blur-[2px]"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/80 to-background/30" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/40 to-background/20" />
        <div
          aria-hidden="true"
          className="mesh-blob -right-32 top-10 -z-10 h-[420px] w-[420px] bg-brand/20"
        />
        <div
          aria-hidden="true"
          className="text-outline pointer-events-none absolute -bottom-4 left-0 -z-10 select-none whitespace-nowrap font-mega text-[18vw] font-black leading-none"
        >
          {course.code}
        </div>

        <div className="relative px-6 pb-24 pt-10 md:px-10 md:pb-32 md:pt-14">
          <Link
            to="/"
            className="glass mb-10 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-foreground/80 transition hover:-translate-x-0.5 hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Browse
          </Link>
          <div className="flex flex-wrap items-center gap-2 animate-fade-in-up">
            <span className="rounded-full bg-brand px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-foreground">
              {course.subject}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/70">
              {course.area} · {course.credits} credit{course.credits === 1 ? "" : "s"}
              {course.hours ? ` · ${course.hours}` : ""}
            </span>
          </div>
          <h1 className="mt-5 font-mega text-[clamp(2.8rem,9vw,8rem)] font-black leading-[0.9] tracking-[-0.05em]">
            <span className="word-mask">
              <span className="word-in" style={{ animationDelay: "0.1s" }}>
                {course.code}
              </span>
            </span>
          </h1>
          <p className="mt-4 max-w-3xl font-serif-accent text-3xl leading-tight text-foreground/90 animate-fade-in-up opacity-0 [animation-delay:0.3s] md:text-5xl">
            {course.title}
          </p>

          <div className="mt-7 flex flex-wrap gap-2 animate-fade-in-up opacity-0 [animation-delay:0.45s]">
            {course.tags.map((t) => (
              <span key={t} className="glass rounded-full px-3 py-1 text-xs font-medium">
                {t}
              </span>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap gap-3 animate-fade-in-up opacity-0 [animation-delay:0.55s]">
            <span className="relative inline-flex">
              <button
                onClick={onShortlist}
                aria-pressed={saved}
                className="shine inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-2xl shadow-brand/40 transition hover:bg-brand-glow active:scale-[0.98]"
              >
                {saved ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {saved ? "In your shortlist" : "Add to shortlist"}
              </button>
              <Burst trigger={burst} />
            </span>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                toast.success("Link copied");
              }}
              className="glass inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition hover:border-brand/50 active:scale-[0.98]"
            >
              <Share2 className="h-4 w-4" /> Share
            </button>
            <ShareStoryButton
              render={() =>
                renderCourseStory(
                  course,
                  hasReal ? { avg: stats!.avg_rating, count: stats!.rating_count } : null,
                )
              }
              fileName={`courseflix-${course.code}.png`}
              className="py-3.5 px-6"
            />
          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-12 px-6 md:px-10">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard
            label="Overall"
            value={hasReal ? stats!.avg_rating.toFixed(1) : "No data"}
            suffix={hasReal ? "/5" : ""}
            fill={hasReal ? stats!.avg_rating / 5 : 0}
            accent
          />
          <StatCard
            label="Difficulty"
            value={hasReal ? stats!.avg_difficulty.toFixed(1) : "No data"}
            suffix={hasReal ? "/5" : ""}
            fill={hasReal ? stats!.avg_difficulty / 5 : 0}
          />
          <StatCard
            label="Workload"
            value={hasReal ? stats!.avg_workload.toFixed(1) : "No data"}
            suffix={hasReal ? "/5" : ""}
            fill={hasReal ? stats!.avg_workload / 5 : 0}
          />
          <StatCard
            label="Would take again"
            value={hasReal ? stats!.pct_would_take_again : "No data"}
            suffix={hasReal ? "%" : ""}
            fill={hasReal ? Number(stats!.pct_would_take_again) / 100 : 0}
          />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {hasReal
            ? `From ${stats!.rating_count} student rating${stats!.rating_count === 1 ? "" : "s"}.`
            : "No student ratings yet. These metrics will appear after students submit reviews."}
        </p>
      </section>

      <section
        ref={bodyRef}
        className="reveal mt-16 grid gap-10 px-6 md:mt-20 md:grid-cols-3 md:px-10"
      >
        <div className="space-y-14 md:col-span-2">
          <div>
            <SectionLabel n="01">About this course</SectionLabel>
            <p className="text-lg leading-relaxed text-foreground/80">{description}</p>
          </div>

          <div>
            <SectionLabel n="02">Prerequisite path</SectionLabel>
            <PrereqTree code={course.code} />
            {course.prereqRaw && (
              <p className="mt-3 text-xs text-muted-foreground">{course.prereqRaw}</p>
            )}
          </div>

          <RatingSection code={course.code} />
        </div>

        <aside className="space-y-8 md:sticky md:top-24 md:self-start">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="h-5 w-5 text-brand" />
              <h3 className="font-display text-xl font-bold">Published instructors</h3>
            </div>
            <div className="space-y-2">
              {publishedInstructors.length === 0 && (
                <div className="glass rounded-2xl p-4 text-muted-foreground text-sm">
                  UTM has not published an instructor for this course in the retrieved timetable.
                </div>
              )}
              {publishedInstructors.map((p) => (
                <div key={`${p.term}-${p.name}`} className="glass rounded-2xl p-4">
                  {(() => {
                    const rating = getProfessorRating(p.name);
                    return (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="font-semibold">{p.name}</div>
                          <div className="flex items-center gap-2 text-xs font-semibold">
                            <span className="text-brand">{p.term}</span>
                            {rating && (
                              <span
                                className="flex items-center gap-1 text-amber-500"
                                title={`${rating.rating.toFixed(1)} out of 5`}
                              >
                                <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                                {rating.rating.toFixed(1)}/5 RMP
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Published for {p.sections.join(", ")} by the UTM Timetable Builder.
                        </div>
                        {rating ? (
                          <div className="mt-2 space-y-1">
                            <div className="text-xs text-muted-foreground">
                              {rating.institution}
                            </div>
                            <a
                              href={rating.profileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex text-xs text-brand hover:underline"
                            >
                              {rating.reviewCount} Rate My Professors reviews · retrieved{" "}
                              {rating.retrievedAt}
                            </a>
                          </div>
                        ) : (
                          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                            <a
                              href={rmpUtmSearchUrl(p.name)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-brand hover:underline"
                            >
                              Search UTM RMP
                            </a>
                            <a
                              href={rmpTorontoSearchUrl(p.name)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-brand hover:underline"
                            >
                              Search University of Toronto RMP
                            </a>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              ))}
              {publishedInstructors.length > 0 && (
                <a
                  href={timetableUrl(course.code)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-brand hover:underline"
                >
                  Verify current timetable <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-display text-xl font-bold mb-3">Quick links</h3>
            <div className="space-y-2">
              {[
                {
                  label: "View on UTM Academic Calendar",
                  href: calendarUrl(course.code),
                },
                {
                  label: "Check Timetable Builder availability",
                  href: `https://ttb.utoronto.ca/?courseCode=${encodeURIComponent(course.code)}`,
                },
                {
                  label: `Search r/UTM for ${course.code}`,
                  href: `https://www.reddit.com/r/UTM/search/?q=${encodeURIComponent(course.code)}&restrict_sr=1`,
                },
              ].map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass group flex items-center justify-between gap-2 rounded-2xl p-4 text-sm font-medium transition hover:border-brand/50 hover:text-brand"
                >
                  {l.label}
                  <ArrowUpRight className="h-4 w-4 shrink-0 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              ))}
            </div>
          </div>

          {course.prereqs.length > 0 && (
            <div>
              <h3 className="font-display text-xl font-bold mb-3">Prereqs</h3>
              <div className="flex flex-wrap gap-2">
                {course.prereqs.map((p) => (
                  <Link
                    key={p}
                    to="/course/$code"
                    params={{ code: p }}
                    className="glass rounded-full px-3.5 py-1.5 font-mega text-xs font-bold transition hover:border-brand/60 hover:text-brand"
                  >
                    {p}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </section>

      <section ref={relatedRef} className="reveal mt-24 pb-28">
        <div className="mb-2 px-6 md:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Because you're looking at {course.code}
          </p>
          <h2 className="mt-3 font-mega text-3xl font-extrabold leading-[0.95] md:text-5xl">
            More{" "}
            <span className="font-serif-accent text-gradient-brand text-[1.15em]">
              {course.area}
            </span>
          </h2>
        </div>
        <div className="scroll-rail rail-fade flex gap-4 overflow-x-auto px-6 pb-4 pt-6 md:px-10">
          {related.map((c) => (
            <CourseCard key={c.code} course={c} />
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionLabel({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-end gap-4 border-b border-white/[0.08] pb-3">
      <span aria-hidden="true" className="text-outline font-mega text-4xl font-black leading-[0.8]">
        {n}
      </span>
      <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">{children}</h2>
    </div>
  );
}

function StatCard({
  label,
  value,
  suffix,
  fill,
  accent,
}: {
  label: string;
  value: number | string;
  suffix: string;
  fill: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`glass relative overflow-hidden rounded-3xl p-5 ${accent ? "border-brand/40" : ""}`}
    >
      {accent && (
        <div
          aria-hidden="true"
          className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand/25 blur-2xl"
        />
      )}
      <div className="relative text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`relative mt-2 font-mega text-3xl font-black md:text-4xl ${accent ? "text-brand" : "text-foreground"}`}
      >
        {value === "No data" ? (
          <span className="font-serif-accent text-2xl text-muted-foreground md:text-3xl">
            no data yet
          </span>
        ) : (
          <>
            {value}
            <span className="ml-0.5 font-sans text-base font-semibold text-muted-foreground">
              {suffix}
            </span>
          </>
        )}
      </div>
      <div className="relative mt-4 h-1 overflow-hidden rounded-full bg-white/[0.08]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand to-brand-2"
          style={{ width: `${Math.max(0, Math.min(1, fill)) * 100}%` }}
        />
      </div>
    </div>
  );
}
