import { createFileRoute } from "@tanstack/react-router";
import { TopNav } from "@/components/TopNav";
import { Hero } from "@/components/Hero";
import { CourseRail } from "@/components/CourseRail";
import { CreatorSection } from "@/components/CreatorSection";
import { MemorialSection } from "@/components/MemorialSection";
import { FilterChips } from "@/components/FilterChips";
import { CinematicIntro } from "@/components/CinematicIntro";
import { Spotlight } from "@/components/Spotlight";
import { Marquee } from "@/components/Marquee";
import { FeatureBento } from "@/components/FeatureBento";
import { Link } from "@tanstack/react-router";
import { getRailsForMajor, getFeaturedForMajor, type FilterId } from "@/lib/courses";
import { getMajor } from "@/lib/majors";
import { siteUrl } from "@/lib/site";
import { useMajor } from "@/hooks/use-major";
import { useEffect, useState, useMemo } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Courseflix" },
      {
        name: "description",
        content:
          "Browse every UTM course like Netflix. Pick your major, get curated rows, save a shortlist and share it with friends.",
      },
      { property: "og:title", content: "Courseflix" },
      {
        property: "og:description",
        content:
          "Browse every UTM course like Netflix. Curated rows, bird courses, ratings and a shareable shortlist.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Courseflix" },
      { property: "og:url", content: siteUrl() },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Courseflix" },
      {
        name: "twitter:description",
        content:
          "Browse every UTM course like Netflix. Curated rows, bird courses, ratings and a shareable shortlist.",
      },
    ],
    links: [{ rel: "canonical", href: siteUrl() }],
  }),
  component: Home,
});

export function Home() {
  const { major, setMajor, hydrated } = useMajor();
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
  const featured = useMemo(() => getFeaturedForMajor(major), [major]);
  const inMajorCount = rails[0]?.codes.length ?? 0;

  return (
    <div className="relative min-h-screen overflow-x-clip text-foreground">
      <CinematicIntro />
      <Spotlight />
      <TopNav />
      <Hero featured={featured} major={currentMajor?.name ?? "your program"} />
      <Marquee />

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
              onClick={() => setMajor(null)}
              className="text-xs font-semibold text-brand hover:text-brand-glow underline underline-offset-4"
            >
              Change major
            </button>
          </div>
        </div>
      )}

      <main className="relative mt-8 space-y-12 pb-24 md:space-y-16">
        {rails.length === 0 && (
          <p className="px-6 md:px-10 text-sm text-muted-foreground">
            No courses match this filter for your program yet — try another chip.
          </p>
        )}
        {rails.map((r, index) => (
          <CourseRail key={r.title} rail={r} index={index} />
        ))}
      </main>

      <FeatureBento />
      <CreatorSection />
      <MemorialSection />

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
            Course data from the UTM Academic Calendar. Estimated ratings until students rate. Not
            affiliated with UofT or Netflix.
          </span>
        </div>
      </footer>
    </div>
  );
}
