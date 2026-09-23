import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, MessageCircle, NotebookPen, Video } from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { CREATOR_EMAIL, UTM_LINKS } from "@/lib/links";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help centre — Courseflix UTM" },
      {
        name: "description",
        content:
          "Questions about Courseflix ratings, shortlists, privacy or friends? Read the basics or email the creator directly.",
      },
      { property: "og:title", content: "Help centre — Courseflix UTM" },
      {
        property: "og:description",
        content: "How Courseflix ratings, shortlists and privacy work, plus how to get in touch.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HelpPage,
});

const FAQ = [
  {
    q: "Where do the ratings come from?",
    a: "Course info comes straight from the UTM Academic Calendar. Star ratings start as estimates based on course level, workload and what students commonly say on r/UTM and RateMyProfessors. As soon as real students rate a course here, their ratings take over from the estimate.",
  },
  {
    q: "Is my shortlist private?",
    a: "You control it in Account settings. A private shortlist is visible only to accepted friends, while a public shortlist is visible to any signed-in student. Public does not auto-accept friend requests: students still send requests, and you choose whether to accept them. Shared links you generate yourself always work for anyone with the link.",
  },
  {
    q: "Why is a course missing?",
    a: "Courseflix only covers UTM courses (codes ending in H5 or Y5) from the current Academic Calendar. Courses offered only at St. George or Scarborough are intentionally left out.",
  },
  {
    q: "Can I rate a course I haven't taken?",
    a: "Please don't. Ratings are only useful if they come from people who actually sat through the course.",
  },
];

function HelpPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />
      <div className="mx-auto max-w-3xl px-6 pb-24 pt-10 md:px-10">
        <h1 className="font-display text-4xl font-black md:text-5xl">Help centre</h1>
        <p className="mt-2 text-sm text-muted-foreground">Everything about how Courseflix works.</p>

        <div className="mt-8 space-y-3">
          {FAQ.map((f) => (
            <details key={f.q} className="rounded-2xl border border-border/50 bg-surface p-5">
              <summary className="cursor-pointer text-sm font-semibold">{f.q}</summary>
              <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>

        <section className="mt-8 rounded-2xl border border-brand/30 bg-brand/5 p-6">
          <h2 className="font-display text-2xl">Still stuck?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Found a bug, missing course, inaccurate estimate, or confusing screen? Email the
            creator, Abood Awaida, and include what you expected to happen.
          </p>
          <a
            href={`mailto:${CREATOR_EMAIL}?subject=${encodeURIComponent("Courseflix launch feedback")}`}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-brand-glow"
          >
            <Mail className="h-4 w-4" /> Send launch feedback
          </a>
        </section>

        <section className="mt-6 rounded-2xl border border-border/50 bg-surface p-6">
          <h2 className="font-display text-2xl">Coming soon: Student hub</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A shared space for course notes and recorded lectures, contributed by UTM students.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border/50 bg-surface-2 p-4">
              <NotebookPen className="h-5 w-5 text-brand" />
              <div className="mt-2 text-sm font-semibold">Shared notes</div>
              <p className="text-xs text-muted-foreground">Upload and browse notes per course.</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-surface-2 p-4">
              <Video className="h-5 w-5 text-brand" />
              <div className="mt-2 text-sm font-semibold">Recorded lectures</div>
              <p className="text-xs text-muted-foreground">Links to publicly shared recordings.</p>
            </div>
          </div>
        </section>

        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          <a
            href={UTM_LINKS.calendar}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-border/60 bg-surface-2 px-4 py-2 font-semibold transition hover:border-brand/50"
          >
            UTM Academic Calendar
          </a>
          <a
            href={UTM_LINKS.timetable}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-border/60 bg-surface-2 px-4 py-2 font-semibold transition hover:border-brand/50"
          >
            Timetable Builder
          </a>
          <a
            href={UTM_LINKS.reddit}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface-2 px-4 py-2 font-semibold transition hover:border-brand/50"
          >
            <MessageCircle className="h-4 w-4" /> r/UTM
          </a>
          <Link
            to="/"
            className="rounded-full border border-border/60 bg-surface-2 px-4 py-2 font-semibold transition hover:border-brand/50"
          >
            Back to browsing
          </Link>
        </div>
      </div>
    </div>
  );
}
