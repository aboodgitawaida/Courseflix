import { FILTERS, type FilterId } from "@/lib/courses";

export function FilterChips({
  value,
  onChange,
}: {
  value: FilterId;
  onChange: (v: FilterId) => void;
}) {
  return (
    <div className="sticky top-16 z-30 border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="scroll-rail flex gap-2 overflow-x-auto px-6 py-3 md:px-10">
        {FILTERS.map((f) => {
          const active = f.id === value;
          return (
            <button
              key={f.id}
              onClick={() => onChange(f.id)}
              aria-pressed={active}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                active
                  ? "border-brand bg-brand text-primary-foreground"
                  : "border-white/15 bg-white/5 text-muted-foreground hover:border-brand/50 hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
