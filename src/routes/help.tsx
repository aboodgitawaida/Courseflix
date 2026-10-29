import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, MessageCircle, NotebookPen, Video } from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { PageBackdrop } from "@/components/PageBackdrop";
import { siteUrl } from "@/lib/site";
import { CREATOR_EMAIL, UTM_LINKS } from "@/lib/links";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help centre — CourseFlix UTM" },
      {
        name: "description",
        content:
          "Questions about CourseFlix ratings, shortlists, privacy or friends? Read the basics or email the creator directly.",
      },
      { property: "og:title", content: "Help centre — CourseFlix UTM" },
      {
        property: "og:description",
        content: "How CourseFlix ratings, shortlists and privacy work, plus how to get in touch.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: siteUrl("/help") }],
  }),
  component: HelpPage,
});

const FAQ = [
  {
    q: "Where do the ratings come from?",
    a: "Course titles, descriptions, prerequisites and listed hours come from the UTM Academic Calendar. Ratings, difficulty and workload scores come only from reviews students submit on CourseFlix; a course with no reviews shows no score. Light-workload and essay/project signals are based on the calendar's listed hours and description. Two other things are shown separately and never mixed into those scores: the gold and red “Reddit says” pill (see below) and professors' overall Rate My Professors ratings, which are not specific to a course.",
  },
  {
    q: "What does the “Reddit says” pill mean?",
    a: "We read public comments on r/UTM and r/UofT that mention a course and a program labels each one as calling the course easy or hard. When enough comments agree (at least 10 opinions), the course gets a gold (easy) or red (hard) pill. It is based on the comments we've read so far, a few labels can be wrong, and it is not a review by a CourseFlix student. CourseFlix is not affiliated with or endorsed by Reddit.",
  },
  {
    q: "Why can't I post a review?",
    a: "Reviews need a confirmed email so nobody can post under someone else's address. Google sign-ins count automatically. If you signed up with email and password, use the prompt on any course page to send yourself a one-time link; it works for 24 hours.",
  },
  {
    q: "Is my shortlist private?",
    a: "You control it in Account settings. A private account means only accepted friends can see your shortlist. A public account means any signed-in student can. Shared links you generate yourself always work for anyone with the link.",
  },
  {
    q: "What do you do with my data?",
    a: "Only what's needed to run the site: your account, profile, saved courses, reviews and friends. Reviews are shown without your name, nothing is sold, and you can delete your account and all of it from Settings. The full details are in the Privacy Policy at courseflix.ca/privacy.",
  },
  {
    q: "How do I report a review?",
    a: "Use the Report review link under any review. New reviews are checked automatically, and only threats, hate, sexual harassment, someone's private information or spam are held back; harsh but honest opinions about a course or instructor are always allowed. Reported reviews that break those rules are removed, usually within 48 hours.",
  },
  {
    q: "Why is a course missing?",
    a: "CourseFlix only covers UTM courses (codes ending in H5 or Y5) from the current Academic Calendar. Courses offered only at St. George or Scarborough are intentionally left out.",
  },
  {
    q: "Can I rate a course I haven't taken?",
    a: "Please don't. Ratings are only useful if they come from people who actually sat through the course.",
  },
];

function HelpPage() {
  return (
    <div className="relative min-h-screen overflow-x-clip text-foreground">
      <PageBackdrop />
      <TopNav />
      <div className="mx-auto max-w-3xl px-6 pb-24 pt-10 md:px-10">
        <h1 className="font-mega text-[clamp(2.6rem,7vw,5.5rem)] font-black leading-[0.92] tracking-[-0.05em] animate-fade-in-up">
          Help{" "}
          <span className="font-serif-accent text-gradient-brand pr-[0.05em] text-[1.12em] font-normal">
            centre.
          </span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Everything about how CourseFlix works.</p>

        <div className="mt-8 space-y-3">
          {FAQ.map((f) => (
            <details key={f.q} className="rounded-3xl glass p-5">
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
            href={`mailto:${CREATOR_EMAIL}?subject=${encodeURIComponent("CourseFlix launch feedback")}`}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-brand-glow"
          >
            <Mail className="h-4 w-4" /> Send launch feedback
          </a>
        </section>

        <section className="mt-6 rounded-3xl glass p-6">
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
