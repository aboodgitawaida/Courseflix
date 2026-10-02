import { ExternalLink, ShieldCheck } from "lucide-react";
import { getCourseResearch } from "@/lib/course-research";
import type { Course } from "@/lib/courses";

const statusCopy = {
  confirmed: "Confirmed",
  "not-verified": "Not verified",
  "student-reported": "Student-reported",
} as const;

export function CourseResearchPanel({ course }: { course: Course }) {
  const research = getCourseResearch(course);
  if (!research) return null;

  return (
    <section className="rounded-2xl border border-border/50 bg-surface p-5 md:p-6">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
        <div>
          <h2 className="font-display text-2xl font-bold">Evidence & current offering</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Research pilot · {research.term} · checked {research.verifiedAt}
          </p>
        </div>
      </div>

      <div className="mt-5 divide-y divide-border/40">
        {research.evidence.map((item) => (
          <div key={item.label} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="font-semibold">{item.label}</div>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.detail}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:pl-4">
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  item.status === "confirmed"
                    ? "bg-emerald-500/10 text-emerald-500"
                    : item.status === "student-reported"
                      ? "bg-amber-500/10 text-amber-500"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {statusCopy[item.status]}
              </span>
              {item.href && (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open source for ${item.label}`}
                  className="rounded-sm text-muted-foreground hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

