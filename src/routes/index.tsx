import { createFileRoute } from "@tanstack/react-router";
import { TopNav } from "@/components/TopNav";
import { Hero } from "@/components/Hero";
import { CourseRail } from "@/components/CourseRail";
import { RAILS } from "@/lib/courses";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "courseflix — Netflix for UofT courses" },
      { name: "description", content: "Discover UofT courses like Netflix. Ratings, prof vibes, Reddit reviews, and personalized picks — all in one place." },
      { property: "og:title", content: "courseflix — Netflix for UofT courses" },
      { property: "og:description", content: "Browse, rate, and shortlist UofT courses. Real prof scores + Reddit vibes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />
      <Hero />
      <div className="space-y-10 md:space-y-14 pb-24 -mt-4">
        {RAILS.map((r) => (
          <CourseRail key={r.title} rail={r} />
        ))}
      </div>
      <footer className="border-t border-border/40 px-6 md:px-10 py-8 text-xs text-muted-foreground flex flex-wrap gap-2 justify-between">
        <span>courseflix · unofficial · built by a fed-up UofT CS student</span>
        <span>Ratings seeded from public reviews. Not affiliated with UofT.</span>
      </footer>
    </div>
  );
}
