import { createFileRoute, Link } from "@tanstack/react-router";
import { LifeBuoy, Mail } from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { SUPPORT_EMAIL, CALENDAR_HOME, TIMETABLE_HOME } from "@/lib/links";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help Centre — Courseflix UTM" },
      { name: "description", content: "Answers about ratings, shortlists, friends and privacy on Courseflix, plus how to reach the creator for support." },
      { property: "og:title", content: "Help Centre — Courseflix UTM" },
      { property: "og:description", content: "How Courseflix ratings, shortlists and friends work — and how to get support." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HelpPage,
});

const FAQ = [
  {
    q: "Where do the ratings come from?",
    a: "Every course starts with an estimated baseline built from its level, contact hours and known reputation. As soon as students rate a course, the real student average replaces the estimate everywhere on the site.",
  },
  {
    q: "Can I delete a rating I posted?",
    a: "Yes. Open the course, scroll to Student ratings, and delete your own rating at any time.",
  },
  {
    q: "Who can see my shortlist?",
    a: "That's up to you. Public profiles are visible to any signed-in student; private profiles are visible only to accepted friends. Change it in Settings.",
  },
  {
    q: "Is this an official University of Toronto site?",
    a: "No. Courseflix is a student project. Always confirm course details on the UTM Academic Calendar and the official timetable before enrolling.",
  },
];

function HelpPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />
      <div className="mx-auto max-w-3xl px-6 pb-24 pt-10 md:px-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
          <LifeBuoy className="h-3 w-3" /> HELP CENTRE
        </div>
        <h1 className="font-display mt-3 text-4xl font-black md:text-6xl">How can we help?</h1>

        <div className="mt-8 space-y-3">
          {FAQ.map((f) => (
            <details key={f.q} className="rounded-2xl border border-border/50 bg-surface p-5">
              <summary className="cursor-pointer font-semibold">{f.q}</summary>
              <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-brand/30 bg-brand/5 p-6">
          <h2 className="font-display text-2xl">Still stuck?</h2>
          <p className="mt-1 text-sm text-muted-foreground">Email the creator directly and you'll get a reply.</p>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-brand-glow"
          >
            <Mail className="h-4 w-4" /> {SUPPORT_EMAIL}
          </a>
        </div>

        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          <a href={CALENDAR_HOME} target="_blank" rel="noreferrer" className="rounded-full border border-border/60 bg-surface-2 px-4 py-2 font-semibold transition hover:border-brand/50">
            UTM Academic Calendar
          </a>
          <a href={TIMETABLE_HOME} target="_blank" rel="noreferrer" className="rounded-full border border-border/60 bg-surface-2 px-4 py-2 font-semibold transition hover:border-brand/50">
            UTM Timetable
          </a>
          <Link to="/" className="rounded-full border border-border/60 bg-surface-2 px-4 py-2 font-semibold transition hover:border-brand/50">
            Back to browse
          </Link>
        </div>
      </div>
    </div>
  );
}
