import { useMemo, useState } from "react";
import { MAJORS, MAJOR_CATEGORIES, type Major } from "@/lib/majors";
import { Search, Sparkles, ArrowRight } from "lucide-react";

export function MajorPicker({ onPick }: { onPick: (id: string) => void }) {
  const [q, setQ] = useState("");
  const [hover, setHover] = useState<Major | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return MAJORS;
    return MAJORS.filter(
      (m) => m.name.toLowerCase().includes(s) || m.category.toLowerCase().includes(s),
    );
  }, [q]);

  const grouped = useMemo(() => {
    const map = new Map<string, Major[]>();
    for (const cat of MAJOR_CATEGORIES) map.set(cat, []);
    for (const m of filtered) map.get(m.category)?.push(m);
    return [...map.entries()].filter(([, list]) => list.length > 0);
  }, [filtered]);

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-brand/20 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-brand/10 blur-[120px]" />

      <div className="relative max-w-5xl mx-auto px-6 md:px-10 py-12 md:py-20">
        <div className="flex items-center gap-2 mb-8">
          <div className="h-9 w-9 rounded-lg bg-brand flex items-center justify-center brand-glow">
            <span className="font-display font-black text-background text-lg leading-none">C</span>
          </div>
          <span className="font-display font-bold text-lg tracking-tight">
            course<span className="text-brand">flix</span>
          </span>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand mb-5">
          <Sparkles className="h-3 w-3" /> LET'S GET YOU SET UP
        </div>
        <h1 className="font-display text-4xl md:text-6xl font-black leading-[1.02] tracking-tight max-w-3xl">
          First things first —<br />
          <span className="text-brand">what's your major?</span>
        </h1>
        <p className="mt-4 text-muted-foreground max-w-xl">
          Pick your program at UofT. We'll tune every rail, recommendation, and rating for you.
          You can change it anytime.
        </p>

        <div className="mt-8 relative max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search majors — try 'psych', 'commerce', 'CS'…"
            className="w-full rounded-full bg-surface border border-border/50 pl-11 pr-4 py-3.5 text-sm outline-none focus:border-brand/60 focus:brand-glow transition"
          />
        </div>

        <div className="mt-10 space-y-10 pb-16">
          {grouped.map(([cat, list]) => (
            <div key={cat}>
              <h2 className="font-display text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">
                {cat}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {list.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => onPick(m.id)}
                    onMouseEnter={() => setHover(m)}
                    onMouseLeave={() => setHover(null)}
                    className="group relative text-left rounded-xl bg-surface border border-border/40 p-3.5 hover:border-brand/60 hover:bg-surface-2 hover:brand-glow transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xl">{m.emoji}</div>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-brand transition" />
                    </div>
                    <div className="mt-2 font-semibold text-sm leading-tight">{m.name}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
          {grouped.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              No majors match "{q}". Try a different spelling.
            </div>
          )}
        </div>
      </div>
      {hover && <span className="sr-only">{hover.name}</span>}
    </div>
  );
}
