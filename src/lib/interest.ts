import { toast } from "sonner";
import { readMajor, saveMajor } from "@/hooks/use-major";
import { programForSubject } from "@/lib/majors";
import { announce } from "@/lib/a11y";

// Counts how often a visitor without a program engages with each subject, and
// offers a one-tap program suggestion once a subject clearly stands out.
const KEY = "courseflix.subjectInterest";
const SUGGESTED_KEY = "courseflix.programSuggested";
const THRESHOLD = 3;

type Counts = Record<string, number>;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Interest tracking is a nicety; skip it when storage is unavailable.
  }
}

/** Records a view or save of a course in `subject`. Weight 2 for saves. */
export function recordSubjectInterest(subject: string, weight = 1) {
  if (typeof window === "undefined" || !subject || readMajor()) return;

  const counts = read<Counts>(KEY, {});
  counts[subject] = (counts[subject] ?? 0) + weight;
  write(KEY, counts);

  const suggested = read<string[]>(SUGGESTED_KEY, []);
  if (counts[subject] < THRESHOLD || suggested.includes(subject)) return;

  const program = programForSubject(subject);
  if (!program) return;
  write(SUGGESTED_KEY, [...suggested, subject]);

  toast(`${program.emoji} Into ${subject}?`, {
    description: `Set ${program.name} as your program to tune your feed.`,
    duration: 10_000,
    action: {
      label: "Set program",
      onClick: () => {
        saveMajor(program.id);
        toast.success(`${program.emoji} Your feed is now tuned for ${program.name}.`);
        announce(`Your feed is now tuned for ${program.name}.`);
      },
    },
  });
}
