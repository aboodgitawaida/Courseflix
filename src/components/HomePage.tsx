import { TopNav } from "@/components/TopNav";
import { Hero } from "@/components/Hero";
import { ProgramPromptCard } from "@/components/ProgramPicker";
import { openProgramPicker } from "@/lib/program-picker";
import { CourseRail } from "@/components/CourseRail";
import { CreatorSection } from "@/components/CreatorSection";
import { FilterChips } from "@/components/FilterChips";
import { CinematicIntro } from "@/components/CinematicIntro";
import { Spotlight } from "@/components/Spotlight";
import { Marquee } from "@/components/Marquee";
import { FeatureBento } from "@/components/FeatureBento";
import { TierView } from "@/components/TierView";
import { Link } from "@tanstack/react-router";
import { BIRD_COURSE_THRESHOLD, useBirdCourses } from "@/lib/ratings";
import { COURSES, getRailsForMajor, getFeaturedDeckForMajor, type FilterId } from "@/lib/courses";
import { getMajor } from "@/lib/majors";
import { useMajor } from "@/hooks/use-major";
import { Fragment, useEffect, useState, useMemo } from "react";

export function HomePage() {
  const { major, hydrated } = useMajor();
  const currentMajor = getMajor(major);
  const [filter, setFilter] = useState<FilterId>("all");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash !== "#creator") return;
    const t = setTimeout(() => {
      document.getElementById("creator")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
    return () => clearTimeout(t);
  }, [hydrated, currentMajor]);

  const rails = useMemo(() => getRailsForMajor(major, filter), [major, filter]);
  const deck = useMemo(() => getFeaturedDeckForMajor(major), [major]);
  const { data: birdMentions } = useBirdCourses();
  const studentBirds = useMemo(() => {
    const known = new Set(COURSES.map((c) => c.code));
    const codes = [...(birdMentions ?? [])]
      .filter(([code, n]) => n >= BIRD_COURSE_THRESHOLD && known.has(code))
      .sort((a, b) => b[1] - a[1])
      .map(([code]) => code);
    return codes.length === 0
      ? null
      : {
          title: "🪶 Students call these bird courses",
          blurb: "Courses that reviewers say are easy marks, based on what students wrote",
          codes,
        };
  }, [birdMentions]);
  const inMajorCount = rails[0]?.codes.length ?? 0;

  return (
    <div className="relative min-h-screen overflow-x-clip text-foreground">
      <CinematicIntro />
      <Spotlight />
      <TopNav />
      <Hero deck={deck} major={currentMajor?.name ?? "your program"} />
      <div className="hidden md:block">
        <Marquee />
      </div>

      <div className="px-6 pt-6 md:px-10 md:pt-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Your feed
        </p>
        <h2 className="mt-3 font-mega text-4xl font-extrabold leading-[0.95] md:text-6xl">
          Tonight's{" "}
          <span className="font-serif-accent text-gradient-brand text-[1.15em]">lineup.</span>
        </h2>
      </div>
      <FilterChips value={filter} onChange={setFilter} />

      {currentMajor && inMajorCount < 3 && (
        <div className="glass mx-6 mt-6 rounded-3xl border-brand/30 p-5 md:mx-10 md:p-7">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-xs font-semibold tracking-widest text-brand uppercase mb-1">
                {currentMajor.emoji} {currentMajor.name}
              </div>
              <h3 className="font-display text-xl md:text-2xl font-bold">
                We're still seeding the full {currentMajor.name} catalog.
              </h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                A few core courses are in — plus universally-loved breadth picks below so you can
                still browse.
              </p>
            </div>
            <button
              onClick={openProgramPicker}
              className="text-xs font-semibold text-brand hover:text-brand-glow underline underline-offset-4"
            >
              Change program
            </button>
          </div>
        </div>
      )}

      <main className="relative mt-8 space-y-12 pb-24 md:space-y-16">
        {(filter === "bird" || filter === "danger") && <TierView kind={filter} />}
        {filter !== "bird" && filter !== "danger" && rails.length === 0 && (
          <p className="px-6 md:px-10 text-sm text-muted-foreground">
            No courses match this filter for your program yet — try another chip.
          </p>
        )}
        {filter !== "bird" && filter !== "danger" && (
          <>
            {studentBirds && <CourseRail rail={studentBirds} index={0} gold />}
            {rails.map((r, index) => (
              <Fragment key={r.title}>
                <CourseRail rail={r} index={index} />
                {index === 0 && <ProgramPromptCard />}
              </Fragment>
            ))}
          </>
        )}
      </main>

      <FeatureBento />
      <CreatorSection />

      <footer className="relative overflow-hidden border-t border-white/[0.08] px-6 pt-14 md:px-10 md:pt-20">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div className="max-w-sm">
            <p className="font-mega text-2xl font-bold leading-tight">
              Stop guessing. <span className="text-brand">Start watching</span> your degree come
              together.
            </p>
          </div>
          <nav
            aria-label="Footer"
            className="grid content-start gap-2 text-sm text-muted-foreground"
          >
            <span className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/60">
              Explore
            </span>
            <Link to="/" className="transition hover:text-foreground">
              Browse
            </Link>
            <Link to="/list" className="transition hover:text-foreground">
              My shortlist
            </Link>
            <Link to="/friends" className="transition hover:text-foreground">
              Friends
            </Link>
            <Link to="/achievements" className="transition hover:text-foreground">
              Achievements
            </Link>
          </nav>
          <nav
            aria-label="Support"
            className="grid content-start gap-2 text-sm text-muted-foreground"
          >
            <span className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/60">
              Info
            </span>
            <Link to="/help" className="transition hover:text-foreground">
              Help
            </Link>
            <Link to="/terms" className="transition hover:text-foreground">
              Terms
            </Link>
            <Link to="/privacy" className="transition hover:text-foreground">
              Privacy
            </Link>
            <Link to="/settings" className="transition hover:text-foreground">
              Settings
            </Link>
          </nav>
        </div>

        <div
          aria-hidden="true"
          className="footer-wordmark mt-14 select-none whitespace-nowrap text-center text-[15.5vw] md:mt-20"
        >
          COURSEFLIX
        </div>

        <div className="flex flex-wrap justify-between gap-2 border-t border-white/[0.08] py-6 text-xs text-neutral-500">
          <span>Courseflix · unofficial · built by Abood Awaida</span>
          <span>
            Course data from the UTM Academic Calendar. Ratings come only from student reviews. Not
            affiliated with UofT or Netflix.
          </span>
        </div>
      </footer>
    </div>
  );
}
