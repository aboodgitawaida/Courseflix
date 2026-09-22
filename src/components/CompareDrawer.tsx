import { X } from "lucide-react";
import { getCourse, examWeight, isBird, type Course } from "@/lib/courses";
import { useCourseUI } from "@/hooks/use-course-ui";

const ROWS: Array<{ label: string; render: (c: Course) => string }> = [
  { label: "Course", render: (c) => c.title },
  { label: "Distribution", render: (c) => c.area },
  { label: "Bird rating", render: (c) => (isBird(c) ? "🦅 Bird course" : `${c.difficulty.toFixed(1)}/5 difficulty`) },
  { label: "Exam weight", render: (c) => `${examWeight(c)}%` },
  { label: "Workload", render: (c) => `${c.workload.toFixed(1)}/5 · ${c.hours || "hours n/a"}` },
  { label: "Satisfaction", render: (c) => `${c.wouldTakeAgain}% would retake` },
];

export function CompareDrawer() {
  const { compare, toggleCompare, clearCompare, openPreview } = useCourseUI();
  const courses = compare.map((c) => getCourse(c)).filter(Boolean) as Course[];
  if (courses.length < 2) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#121216]/95 backdrop-blur-md">
      <div className="mx-auto max-w-5xl px-4 py-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Compare {courses.length} courses</h2>
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
                <th className="w-32 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Metric</th>
                {courses.map((c) => (
                  <th key={c.code} className="pb-2">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openPreview(c.code)} className="rounded-sm font-display text-base hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70">
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
                  <td className="py-2 pr-3 text-xs uppercase tracking-wider text-muted-foreground">{r.label}</td>
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
