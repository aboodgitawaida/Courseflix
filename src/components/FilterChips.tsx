import { useLayoutEffect, useRef, useState } from "react";
import { FILTERS, type FilterId } from "@/lib/courses";

export function FilterChips({
  value,
  onChange,
}: {
  value: FilterId;
  onChange: (v: FilterId) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => {
      const active = track.querySelector<HTMLButtonElement>(`[data-filter="${value}"]`);
      if (active) setIndicator({ left: active.offsetLeft, width: active.offsetWidth });
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    return () => ro.disconnect();
  }, [value]);

  return (
    <div className="sticky top-[4.75rem] z-30 px-3 py-2 md:px-6">
      <div className="glass mx-auto max-w-max overflow-hidden rounded-full p-1">
        <div ref={trackRef} className="scroll-rail relative flex gap-1 overflow-x-auto">
          {indicator && (
            <span
              aria-hidden="true"
              className="absolute inset-y-0 rounded-full bg-brand shadow-lg shadow-brand/40 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ left: indicator.left, width: indicator.width }}
            />
          )}
          {FILTERS.map((f) => {
            const active = f.id === value;
            return (
              <button
                key={f.id}
                data-filter={f.id}
                onClick={() => onChange(f.id)}
                aria-pressed={active}
                className={`relative z-10 shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors duration-300 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${
                  active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                } ${active && !indicator ? "bg-brand" : ""}`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
