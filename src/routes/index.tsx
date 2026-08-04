import { createFileRoute } from "@tanstack/react-router";
import { TopNav } from "@/components/TopNav";
import { Hero } from "@/components/Hero";
import { CourseRail } from "@/components/CourseRail";
import { MajorPicker } from "@/components/MajorPicker";
import { CreatorSection } from "@/components/CreatorSection";
import { FilterChips } from "@/components/FilterChips";
import { getRailsForMajor, getFeaturedForMajor, type FilterId } from "@/lib/courses";
import { getMajor } from "@/lib/majors";
import { useMajor } from "@/hooks/use-major";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Courseflix — UTM" },
      { name: "description", content: "Browse every UTM course like Netflix. Pick your major, get curated rows, save a shortlist and share it with friends." },
      { property: "og:title", content: "Courseflix — UTM" },
      { property: "og:description", content: "Browse every UTM course like Netflix. Curated rows, bird courses, ratings and a shareable shortlist." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Courseflix" },
      { property: "og:url", content: "https://courseflix-utm.lovable.app/" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Courseflix — UTM" },
      { name: "twitter:description", content: "Browse every UTM course like Netflix. Curated rows, bird courses, ratings and a shareable shortlist." },
    ],
    links: [{ rel: "canonical", href: "https://courseflix-utm.lovable.app/" }],
  }),
  component: Home,
});

function Home() {
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

  if (hydrated && !currentMajor) {
    return <MajorPicker onPick={setMajor} />;
  }

  const rails = getRailsForMajor(major, filter);
  const featured = getFeaturedForMajor(major);
  const inMajorCount = getRailsForMajor(major)[0]?.codes.length ?? 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />
      <Hero featured={featured} major={currentMajor?.name ?? "your program"} />
      <FilterChips value={filter} onChange={setFilter} />

      {currentMajor && inMajorCount < 3 && (
        <div className="mx-6 md:mx-10 mt-6 rounded-2xl border border-brand/30 bg-brand/5 p-5 md:p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-xs font-semibold tracking-widest text-brand uppercase mb-1">
                {currentMajor.emoji} {currentMajor.name}
              </div>
              <h3 className="font-display text-xl md:text-2xl font-bold">
                We're still seeding the full {currentMajor.name} catalog.
              </h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                A few core courses are in — plus universally-loved breadth picks below so you can still browse.
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

      <main className="space-y-8 md:space-y-12 pb-16 mt-6">
        {rails.length === 0 && (
          <p className="px-6 md:px-10 text-sm text-muted-foreground">
            No courses match this filter for your program yet — try another chip.
          </p>
        )}
        {rails.map((r) => (
          <CourseRail key={r.title} rail={r} />
        ))}
      </main>

      <CreatorSection />

      <footer className="border-t border-border/40 px-6 md:px-10 py-8 text-xs text-muted-foreground flex flex-wrap gap-2 justify-between">
        <span>Courseflix · unofficial · built by Abood Awaida</span>
        <span>Course data from the UTM Academic Calendar. Estimated ratings until students rate. Not affiliated with UofT or Netflix.</span>
      </footer>
    </div>
  );
}
