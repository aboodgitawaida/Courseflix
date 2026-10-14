import { GitCompare, X } from "lucide-react";
import { getCourse, isBird, type Course } from "@/lib/courses";
import { useCourseUI } from "@/hooks/use-course-ui";

const ROWS: Array<{ label: string; render: (c: Course) => string }> = [
  { label: "Course", render: (c) => c.title },
  { label: "Distribution", render: (c) => c.area },
  {
    label: "Workload signal",
    render: (c) => (isBird(c) ? "Light estimate" : "No verified estimate"),
  },
  { label: "Assessment data", render: () => "Not verified" },
  { label: "Contact hours", render: (c) => c.hours || "Not listed" },
  { label: "Student data", render: () => "Open course page to see reviews" },
];

export function CompareDrawer() {
  const { compare, toggleCompare, clearCompare, openPreview } = useCourseUI();
  const courses = compare.map((c) => getCourse(c)).filter(Boolean) as Course[];
  if (courses.length === 0) return null;

  // One course picked: a slim bar confirming it, so the first tap visibly did something.
  if (courses.length === 1) {
    const [only] = courses;
    return (
      <div
        role="status"
        className="above-tabbar glass fixed bottom-3 left-1/2 z-[var(--z-nav)] flex w-[min(calc(100%-1.5rem),32rem)] -translate-x-1/2 items-center gap-3 rounded-full bg-[#121216]/90 py-2 pl-2 pr-3 animate-fade-in-up"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand py-1.5 pl-3 pr-1.5 text-xs font-bold text-primary-foreground">
          <GitCompare className="h-3.5 w-3.5" />
          {only!.code}
          <button
            onClick={() => toggleCompare(only!.code)}
            aria-label={`Remove ${only!.code} from comparison`}
            className="grid h-5 w-5 place-items-center rounded-full bg-black/20 hover:bg-black/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
        <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
          Pick 1 or 2 more courses to compare
        </span>
      </div>
    );
  }

  return (
    <div className="above-tabbar glass fixed inset-x-3 bottom-3 z-[var(--z-nav)] rounded-3xl bg-[#121216]/90 md:inset-x-6">
      <div className="mx-auto max-w-5xl px-4 py-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-mega text-lg font-bold tracking-tight">
            Compare {courses.length} courses
          </h2>
          <button
            onClick={clearCompare}
            className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold hover:border-brand/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70"
          >
            Clear
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr>
                <th className="w-32 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Metric
                </th>
                {courses.map((c) => (
                  <th key={c.code} className="pb-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openPreview(c.code)}
                        className="rounded-sm font-display text-base hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70"
                      >
                        {c.code}
                      </button>
                      <button
                        onClick={() => toggleCompare(c.code)}
                        aria-label={`Remove ${c.code} from comparison`}
                        className="grid h-5 w-5 place-items-center rounded-full border border-white/15 hover:border-brand/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.label} className="border-t border-white/5">
                  <td className="py-2 pr-3 text-xs uppercase tracking-wider text-muted-foreground">
                    {r.label}
                  </td>
                  {courses.map((c) => (
                    <td key={c.code} className="py-2 pr-3 align-top text-muted-foreground">
                      {r.render(c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
