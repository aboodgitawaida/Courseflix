import { FILTERS, type FilterId } from "@/lib/courses";

export function FilterChips({
  value,
  onChange,
}: {
  value: FilterId;
  onChange: (v: FilterId) => void;
}) {
  return (
    <div className="sticky top-16 z-30 border-b border-white/[0.08] bg-background/70 backdrop-blur-xl">
      <div className="scroll-rail flex gap-2 overflow-x-auto px-6 py-3 md:px-10">
        {FILTERS.map((f) => {
          const active = f.id === value;
          return (
            <button
              key={f.id}
              onClick={() => onChange(f.id)}
              aria-pressed={active}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition-all duration-200 ease-out active:scale-[0.98] ${
                active
                  ? "border-brand bg-brand text-primary-foreground shadow-lg shadow-red-900/30"
                  : "border-white/[0.12] bg-white/[0.04] text-muted-foreground hover:border-brand/50 hover:text-foreground hover:bg-white/[0.08]"
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
