import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, Search, Sparkles, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useMajor } from "@/hooks/use-major";
import { CATEGORY_META, MAJOR_CATEGORIES, MAJORS, getMajor, type Major } from "@/lib/majors";
import { announce } from "@/lib/a11y";
import { OPEN_PROGRAM_PICKER_EVENT, openProgramPicker } from "@/lib/program-picker";

const PROMPT_DISMISSED_KEY = "courseflix.programPromptDismissed";

function usePickProgram() {
  const { setMajor } = useMajor();
  return (major: Major | null) => {
    setMajor(major?.id ?? null);
    const message = major
      ? `Your feed is now tuned for ${major.name}.`
      : "Showing courses from all of UTM.";
    toast.success(major ? `${major.emoji} ${message}` : message);
    announce(message);
  };
}

function ProgramChip({
  major,
  active,
  onPick,
}: {
  major: Major;
  active?: boolean;
  onPick: (major: Major) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onPick(major)}
      aria-pressed={active}
      className={`flex items-center gap-2 rounded-2xl border px-3.5 py-2.5 text-left text-sm font-semibold transition active:scale-[0.97] ${
        active
          ? "border-brand bg-brand/15 text-foreground"
          : "border-white/[0.08] bg-white/[0.04] hover:border-brand/50 hover:bg-white/[0.07]"
      }`}
    >
      <span aria-hidden className="text-base leading-none">
        {major.emoji}
      </span>
      <span>{major.name}</span>
    </button>
  );
}

/** Top-bar button showing the current program; opens the picker sheet. */
export function ProgramButton() {
  const { major } = useMajor();
  const current = getMajor(major);
  return (
    <button
      type="button"
      onClick={openProgramPicker}
      aria-label={current ? `Program: ${current.name}. Change program` : "Pick your program"}
      className="flex h-9 min-w-0 max-w-[200px] items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 text-xs font-semibold backdrop-blur-md transition hover:border-brand/50 hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-white/30"
    >
      <span aria-hidden className="text-sm leading-none">
        {current?.emoji ?? "✨"}
      </span>
      {!current && <span className="sm:hidden">Program</span>}
      <span className="hidden min-w-0 truncate sm:block">
        {current?.name ?? "Pick your program"}
      </span>
      <ChevronDown aria-hidden className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
    </button>
  );
}

/** Searchable program sheet, mounted once in the root layout. */
export function ProgramPickerSheet() {
  const { major } = useMajor();
  const pick = usePickProgram();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_PROGRAM_PICKER_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_PROGRAM_PICKER_EVENT, onOpen);
  }, []);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MAJOR_CATEGORIES.map((category) => ({
      category,
      majors: MAJORS.filter(
        (m) =>
          m.category === category &&
          (!q ||
            m.name.toLowerCase().includes(q) ||
            category.toLowerCase().includes(q) ||
            m.core.some((s) => s.toLowerCase() === q)),
      ),
    })).filter((g) => g.majors.length > 0);
  }, [query]);

  function choose(next: Major | null) {
    pick(next);
    setOpen(false);
    setQuery("");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) setQuery("");
      }}
    >
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden rounded-3xl border-white/[0.08] p-0 sm:max-w-2xl">
        <div className="border-b border-white/[0.06] p-5 pb-4">
          <DialogTitle className="font-display text-2xl font-bold">
            What are you studying?
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-muted-foreground">
            We'll tune your feed around your program. You can change it anytime.
          </DialogDescription>
          <label className="mt-4 flex h-11 items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3 focus-within:border-brand/60">
            <Search aria-hidden className="h-4 w-4 text-muted-foreground" />
            <span className="sr-only">Search programs</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search programs, e.g. Psychology or CSC"
              className="h-full flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </label>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {groups.length === 0 && (
            <p className="text-sm text-muted-foreground">No programs match "{query}".</p>
          )}
          {groups.map(({ category, majors }) => (
            <section key={category}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {CATEGORY_META[category].emoji} {category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {majors.map((m) => (
                  <ProgramChip key={m.id} major={m} active={m.id === major} onPick={choose} />
                ))}
              </div>
            </section>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] p-4">
          <span className="text-xs text-muted-foreground">Not sure yet? Browse everything.</span>
          <button
            type="button"
            onClick={() => choose(null)}
            className="rounded-full border border-white/[0.1] px-4 py-2 text-xs font-semibold transition hover:border-brand/50"
          >
            {major ? "Clear program" : "Just browsing"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function readDismissed() {
  try {
    return localStorage.getItem(PROMPT_DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Inline "make this feed yours" card for visitors without a program. Sits
 * inside the feed so new users see courses first and are never blocked.
 */
export function ProgramPromptCard() {
  const { major, hydrated } = useMajor();
  const pick = usePickProgram();
  const [dismissed, setDismissed] = useState(true);
  const [category, setCategory] = useState<Major["category"] | null>(null);

  useEffect(() => setDismissed(readDismissed()), []);

  if (!hydrated || major || dismissed) return null;

  function dismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(PROMPT_DISMISSED_KEY, "1");
    } catch {
      // Dismissal only lasts this visit when storage is unavailable.
    }
  }

  const programs = category ? MAJORS.filter((m) => m.category === category) : [];

  return (
    <section
      aria-labelledby="program-prompt-title"
      className="glass relative mx-6 rounded-3xl border-brand/30 p-5 animate-fade-in-up md:mx-10 md:p-7"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-brand">
        <Sparkles aria-hidden className="h-3.5 w-3.5" /> Make this feed yours
      </p>
      <h3
        id="program-prompt-title"
        className="mt-2 pr-8 font-display text-2xl font-bold md:text-3xl"
      >
        {category ? `${CATEGORY_META[category].emoji} Which one?` : "What are you studying?"}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {category
          ? "Tap your program and every row below re-tunes around it."
          : "One tap and your rows, top pick and prerequisites follow your program."}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {category ? (
          <>
            {programs.map((m) => (
              <ProgramChip key={m.id} major={m} onPick={pick} />
            ))}
            <button
              type="button"
              onClick={() => setCategory(null)}
              className="rounded-2xl px-3.5 py-2.5 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
            >
              ← Back
            </button>
          </>
        ) : (
          <>
            {MAJOR_CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-sm font-semibold transition hover:border-brand/50 hover:bg-white/[0.07] active:scale-[0.97]"
              >
                <span aria-hidden className="text-base leading-none">
                  {CATEGORY_META[c].emoji}
                </span>
                {CATEGORY_META[c].short}
              </button>
            ))}
            <button
              type="button"
              onClick={openProgramPicker}
              className="rounded-2xl px-3.5 py-2.5 text-sm font-semibold text-brand transition hover:text-brand-glow"
            >
              Search all programs →
            </button>
          </>
        )}
      </div>
    </section>
  );
}
