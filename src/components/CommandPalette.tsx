import { useEffect, useMemo, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { searchCourses, COURSES } from "@/lib/courses";
import { useCourseUI } from "@/hooks/use-course-ui";
import { useCourseStats } from "@/lib/ratings";

function SearchResult({
  course,
  onSelect,
}: {
  course: (typeof COURSES)[number];
  onSelect: (code: string) => void;
}) {
  const { data: stats } = useCourseStats(course.code);
  const displayRating = stats?.rating_count ? stats.avg_rating : null;

  return (
    <CommandItem
      value={`${course.code} ${course.title} ${course.subject} ${course.area} ${course.tags.join(" ")}`}
      onSelect={() => onSelect(course.code)}
    >
      <span className="font-mega text-sm font-bold tracking-tight">{course.code}</span>
      <span className="ml-2 flex-1 truncate text-sm text-muted-foreground">{course.title}</span>
      <span className="ml-2 shrink-0 text-xs text-brand">
        {displayRating === null ? "No rating" : displayRating.toFixed(1)}
      </span>
    </CommandItem>
  );
}

export function CommandPalette() {
  const { searchOpen, setSearchOpen, openPreview } = useCourseUI();
  const [q, setQ] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen, setSearchOpen]);

  const results = useMemo(() => (q.trim() ? searchCourses(q, 25) : COURSES.slice(0, 8)), [q]);

  return (
    <CommandDialog
      open={searchOpen}
      onOpenChange={(v) => {
        setSearchOpen(v);
        if (!v) setQ("");
      }}
    >
      <CommandInput
        value={q}
        onValueChange={setQ}
        placeholder="Search courses, codes, departments or tags — e.g. ANT222H5"
      />
      <CommandList>
        <p className="sr-only" role="status" aria-live="polite">
          {q.trim() ? `${results.length} course search results` : "Popular courses loaded"}
        </p>
        <CommandEmpty>
          <div className="space-y-2 px-3 py-2">
            <p>No courses matched.</p>
            <button
              type="button"
              onClick={() => {
                setSearchOpen(false);
                setQ("");
                window.location.assign("/");
              }}
              className="rounded-full border border-brand/40 bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand transition hover:bg-brand/15"
            >
              Browse courses
            </button>
          </div>
        </CommandEmpty>
        <CommandGroup heading={q.trim() ? "Results" : "Popular right now"}>
          {results.map((c) => (
            <SearchResult
              key={c.code}
              course={c}
              onSelect={(code) => {
                setSearchOpen(false);
                setQ("");
                openPreview(code);
              }}
            />
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
