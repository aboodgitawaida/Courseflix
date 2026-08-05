import { ExternalLink, GraduationCap, Star } from "lucide-react";
import { useCourseRatings } from "@/lib/ratings";
import { rmpSearchLink } from "@/lib/links";

export function ProfSection({ code }: { code: string }) {
  const { data: ratings = [] } = useCourseRatings(code);

  const byProf = new Map<string, { total: number; count: number }>();
  for (const r of ratings) {
    const name = r.prof_name?.trim();
    if (!name) continue;
    const cur = byProf.get(name) ?? { total: 0, count: 0 };
    byProf.set(name, { total: cur.total + r.rating, count: cur.count + 1 });
  }
  const profs = [...byProf.entries()]
    .map(([name, v]) => ({ name, avg: v.total / v.count, count: v.count }))
    .sort((a, b) => b.count - a.count || b.avg - a.avg)
    .slice(0, 5);

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <GraduationCap className="h-5 w-5 text-brand" />
        <h3 className="font-display text-xl font-bold">Professors</h3>
      </div>
      <div className="space-y-2">
        {profs.length === 0 ? (
          <div className="rounded-xl border border-border/40 bg-surface p-4 text-sm text-muted-foreground">
            No professor named in a student rating yet. Add the prof when you rate this course and they'll
            show up here for everyone.
          </div>
        ) : (
          profs.map((p) => (
            <div key={p.name} className="rounded-xl border border-border/40 bg-surface p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="truncate font-semibold">{p.name}</div>
                <div className="flex items-center gap-1 text-sm font-semibold text-brand">
                  <Star className="h-3.5 w-3.5 fill-current" /> {p.avg.toFixed(1)}
                </div>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">
                  {p.count} student rating{p.count === 1 ? "" : "s"}
                </span>
                <a
                  href={rmpSearchLink(p.name)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
                >
                  RateMyProfessors <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))
        )}
        <a
          href={rmpSearchLink()}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between gap-2 rounded-xl border border-border/40 bg-surface p-3.5 text-sm font-medium transition hover:border-brand/50 hover:text-brand"
        >
          Find UTM profs on RateMyProfessors
          <ExternalLink className="h-4 w-4 shrink-0" />
        </a>
      </div>
    </div>
  );
}
