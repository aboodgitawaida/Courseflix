import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { TopNav } from "@/components/TopNav";
import { CourseCard } from "@/components/CourseCard";
import { RatingSection } from "@/components/RatingSection";
import { PrereqTree } from "@/components/PrereqTree";
import { COURSES, getCourse } from "@/lib/courses";
import { useAuth } from "@/hooks/use-auth";
import { useCourseStats, useShortlist, useToggleShortlist } from "@/lib/ratings";
import { FALLBACK_SUBJECT_IMAGE, getCourseImage } from "@/lib/subject-images";
import { toast } from "sonner";
import { ArrowLeft, Plus, Check, Share2, Star, GraduationCap, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { siteUrl } from "@/lib/site";

export const Route = createFileRoute("/course/$code")({
  loader: ({ params }) => {
    const course = getCourse(params.code);
    if (!course) throw notFound();
    return { course };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.course.code} — ${loaderData.course.title} · courseflix`
          : "courseflix",
      },
      { name: "description", content: loaderData?.course.description ?? "UTM course details" },
      {
        property: "og:title",
        content: loaderData
          ? `${loaderData.course.code} · ${loaderData.course.title}`
          : "courseflix",
      },
      { property: "og:description", content: loaderData?.course.description ?? "" },
      { property: "og:type", content: "article" },
      {
        property: "og:url",
        content: loaderData ? siteUrl(`/course/${loaderData.course.code}`) : siteUrl(),
      },
      { name: "twitter:card", content: "summary_large_image" },
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
  const { course } = Route.useLoaderData() as { course: import("@/lib/courses").Course };
  const [c1, c2] = course.poster;
  const [imageSrc, setImageSrc] = useState(() => getCourseImage(course.subject));
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
      toast.success(saved ? "Removed from your shortlist" : "Saved to your shortlist");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update shortlist");
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />

      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)` }}
        />
        <img
          src={imageSrc}
          alt=""
          aria-hidden="true"
          onError={() => setImageSrc(FALLBACK_SUBJECT_IMAGE)}
          className="absolute inset-0 h-full w-full object-cover opacity-55 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/75 to-background/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/65 to-background/15" />

        <div className="relative px-6 md:px-10 pt-8 pb-14 max-w-6xl">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white mb-8"
          >
            <ArrowLeft className="h-4 w-4" /> Browse
          </Link>
          <div className="text-xs font-semibold tracking-widest text-brand uppercase">
            {course.area} · {course.credits} credit
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-black mt-2 leading-[0.95]">
            {course.code}
          </h1>
          <p className="font-display text-2xl md:text-3xl font-semibold mt-2 text-white/90">
            {course.title}
          </p>
          <p className="mt-4 max-w-2xl text-lg text-white/80">
            {course.area} · {course.credits} credit{course.credits === 1 ? "" : "s"}
            {course.hours ? ` · ${course.hours}` : ""}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {course.tags.map((t) => (
              <span
                key={t}
                className="text-xs px-2.5 py-1 rounded-full bg-black/40 backdrop-blur border border-white/20 font-medium"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={onShortlist}
              className="inline-flex items-center gap-2 rounded-full bg-brand text-primary-foreground px-6 py-3 font-semibold text-sm hover:bg-brand-glow transition brand-glow"
            >
              {saved ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {saved ? "In your shortlist" : "Add to shortlist"}
            </button>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                toast.success("Link copied");
              }}
              className="inline-flex items-center gap-2 rounded-full bg-surface/80 backdrop-blur border border-border/50 px-6 py-3 font-semibold text-sm hover:bg-surface-2 transition"
            >
              <Share2 className="h-4 w-4" /> Share
            </button>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 md:px-10 max-w-6xl -mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="Overall"
            value={hasReal ? stats!.avg_rating : course.rating}
            suffix="/5"
            accent
          />
          <StatCard
            label="Difficulty"
            value={hasReal ? stats!.avg_difficulty : course.difficulty}
            suffix="/5"
          />
          <StatCard
            label="Workload"
            value={hasReal ? stats!.avg_workload : course.workload}
            suffix="/5"
          />
          <StatCard
            label="Would take again"
            value={hasReal ? stats!.pct_would_take_again : course.wouldTakeAgain}
            suffix="%"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {hasReal
            ? `From ${stats!.rating_count} student rating${stats!.rating_count === 1 ? "" : "s"}.`
            : "Estimated from course level and contact hours — no student ratings yet. Add yours below."}
        </p>
      </section>

      <section className="px-6 md:px-10 max-w-6xl mt-12 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div>
            <h2 className="font-display text-2xl font-bold mb-3">About this course</h2>
            <p className="text-muted-foreground leading-relaxed">{course.description}</p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold mb-3">Prerequisite path</h2>
            <PrereqTree code={course.code} />
            {course.prereqRaw && (
              <p className="mt-3 text-xs text-muted-foreground">{course.prereqRaw}</p>
            )}
          </div>

          <RatingSection code={course.code} />
        </div>

        <aside className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="h-5 w-5 text-brand" />
              <h3 className="font-display text-xl font-bold">Top profs</h3>
            </div>
            <div className="space-y-2">
              {course.topProfs.length === 0 && (
                <div className="rounded-xl bg-surface border border-border/40 p-4 text-muted-foreground text-sm">
                  Instructor ratings aren't wired up yet.
                </div>
              )}
              {course.topProfs.map((p) => (
                <div key={p.name} className="rounded-xl bg-surface border border-border/40 p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{p.name}</div>
                    <div className="flex items-center gap-1 text-brand font-semibold text-sm">
                      <Star className="h-3.5 w-3.5 fill-current" /> {p.rmp.toFixed(1)}
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-brand/10 text-brand border border-brand/20"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display text-xl font-bold mb-3">Quick links</h3>
            <div className="space-y-2">
              {[
                {
                  label: "View on UTM Academic Calendar",
                  href: `https://utm.calendar.utoronto.ca/search-courses?course_search=${encodeURIComponent(course.code)}`,
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
                  className="flex items-center justify-between gap-2 rounded-xl bg-surface border border-border/40 p-3.5 text-sm font-medium hover:border-brand/50 hover:text-brand transition"
                >
                  {l.label}
                  <ExternalLink className="h-4 w-4 shrink-0" />
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
                    className="text-sm px-3 py-1.5 rounded-full bg-surface border border-border/50 hover:border-brand/50 hover:text-brand transition"
                  >
                    {p}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </section>

      <section className="mt-16 pb-24">
        <div className="px-6 md:px-10 mb-3">
          <h2 className="font-display text-2xl font-bold">More {course.area} courses</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Because you're looking at {course.code}
          </p>
        </div>
        <div className="scroll-rail flex gap-4 overflow-x-auto px-6 md:px-10 pb-4 pt-2">
          {related.map((c) => (
            <CourseCard key={c.code} course={c} />
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  suffix,
  accent,
}: {
  label: string;
  value: number;
  suffix: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${accent ? "bg-brand/10 border-brand/30" : "bg-surface border-border/40"}`}
    >
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div
        className={`font-display text-3xl font-black mt-1 ${accent ? "text-brand" : "text-foreground"}`}
      >
        {value}
        <span className="text-base font-semibold text-muted-foreground ml-0.5">{suffix}</span>
      </div>
    </div>
  );
}
