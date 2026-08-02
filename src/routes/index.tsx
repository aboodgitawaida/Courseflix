import { createFileRoute } from "@tanstack/react-router";
import { TopNav } from "@/components/TopNav";
import { Hero } from "@/components/Hero";
import { CourseRail } from "@/components/CourseRail";
import { MajorPicker } from "@/components/MajorPicker";
import { CreatorSection } from "@/components/CreatorSection";
import { getRailsForMajor, getFeaturedForMajor } from "@/lib/courses";
import { getMajor } from "@/lib/majors";
import { useMajor } from "@/hooks/use-major";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "courseflix — Netflix for UofT courses" },
      { name: "description", content: "Discover UofT courses like Netflix. Ratings, prof vibes, Reddit reviews, and personalized picks for your major." },
      { property: "og:title", content: "courseflix — Netflix for UofT courses" },
      { property: "og:description", content: "Browse, rate, and shortlist UofT courses. Real prof scores + Reddit vibes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const { major, setMajor, hydrated } = useMajor();
  const currentMajor = getMajor(major);

  if (hydrated && !currentMajor) {
    return <MajorPicker onPick={setMajor} />;
  }

  const rails = getRailsForMajor(major);
  const featured = getFeaturedForMajor(major);
  const inMajorCount = rails[0]?.codes.length ?? 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav major={currentMajor} onChangeMajor={() => setMajor(null)} />
      <Hero featured={featured} major={currentMajor?.name ?? "your program"} />

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

      <div className="space-y-10 md:space-y-14 pb-16 mt-6">
        {rails.map((r) => (
          <CourseRail key={r.title} rail={r} />
        ))}
      </div>

      <CreatorSection />

      <footer className="border-t border-border/40 px-6 md:px-10 py-8 text-xs text-muted-foreground flex flex-wrap gap-2 justify-between">
        <span>Courseflix · unofficial · built by Abood Awaida</span>
        <span>Course data from the UTM Academic Calendar. Estimated ratings until students rate. Not affiliated with UofT or Netflix.</span>
      </footer>
    </div>
  );
}
