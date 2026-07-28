import { createFileRoute } from "@tanstack/react-router";
import { TopNav } from "@/components/TopNav";
import { Hero } from "@/components/Hero";
import { CourseRail } from "@/components/CourseRail";
import { MajorPicker } from "@/components/MajorPicker";
import { RAILS } from "@/lib/courses";
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

  // Onboarding gate: no major picked yet
  if (hydrated && !currentMajor) {
    return <MajorPicker onPick={setMajor} />;
  }

  const isCS = major === "cs";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav major={currentMajor} onChangeMajor={() => setMajor(null)} />
      <Hero />

      {!isCS && currentMajor && (
        <div className="mx-6 md:mx-10 mt-6 rounded-2xl border border-mint/30 bg-mint/5 p-5 md:p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-xs font-semibold tracking-widest text-mint uppercase mb-1">
                {currentMajor.emoji} {currentMajor.name}
              </div>
              <h3 className="font-display text-xl md:text-2xl font-bold">
                Full {currentMajor.name} catalog is loading in soon.
              </h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                We're seeding UofT CS first while we import the rest. Browse below to see the vibe —
                every rail, rating, and Reddit review will work the same for your program.
              </p>
            </div>
            <button
              onClick={() => setMajor(null)}
              className="text-xs font-semibold text-mint hover:text-mint-glow underline underline-offset-4"
            >
              Change major
            </button>
          </div>
        </div>
      )}

      <div className="space-y-10 md:space-y-14 pb-24 mt-6">
        {RAILS.map((r) => (
          <CourseRail key={r.title} rail={r} />
        ))}
      </div>
      <footer className="border-t border-border/40 px-6 md:px-10 py-8 text-xs text-muted-foreground flex flex-wrap gap-2 justify-between">
        <span>courseflix · unofficial · built by a fed-up UofT student</span>
        <span>Ratings seeded from public reviews. Not affiliated with UofT.</span>
      </footer>
    </div>
  );
}
