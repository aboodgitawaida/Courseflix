import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { searchCourses } from "@/lib/courses";

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQ("");
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
    return;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const results = useMemo(() => searchCourses(q), [q]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 pt-10 pb-20">
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-3 rounded-full border border-border/60 bg-surface px-5 h-14">
            <Search className="h-5 w-5 text-muted-foreground" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search any UTM course — ANT222H5, psychology, calculus…"
              className="flex-1 bg-transparent outline-none text-base placeholder:text-muted-foreground"
            />
          </div>
          <button
            onClick={onClose}
            aria-label="Close search"
            className="h-11 w-11 shrink-0 rounded-full bg-surface border border-border/50 flex items-center justify-center hover:bg-surface-2 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {q.trim() && (
          <p className="mt-4 text-xs text-muted-foreground">
            {results.length === 0 ? "No courses matched." : `${results.length} result${results.length === 1 ? "" : "s"}`}
          </p>
        )}

        <div className="mt-4 space-y-2">
          {results.map((c) => (
            <Link
              key={c.code}
              to="/course/$code"
              params={{ code: c.code }}
              onClick={onClose}
              className="block rounded-xl border border-border/40 bg-surface hover:border-brand/50 hover:bg-surface-2 transition p-4"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-display text-xl">{c.code}</span>
                <span className="text-xs text-muted-foreground shrink-0">{c.area}</span>
              </div>
              <div className="text-sm font-medium mt-0.5">{c.title}</div>
              <div className="text-xs text-muted-foreground mt-1 line-clamp-1">{c.description}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
