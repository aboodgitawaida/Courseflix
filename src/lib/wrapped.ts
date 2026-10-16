import { getCourse, type Course } from "@/lib/courses";
import { BIRD_COURSE_THRESHOLD } from "@/lib/ratings";
import { getRedditSignal } from "@/lib/reddit-signals";

/**
 * "Course Wrapped": a Spotify Wrapped-style summary of a shortlist. Everything is
 * worked out from the saved course codes plus real review and Reddit data, so the
 * same link always gives the same result and nothing is made up.
 */

export type Persona = {
  id: "boss" | "bird" | "strategist" | "explorer" | "specialist" | "main";
  emoji: string;
  name: string;
  tagline: string;
};

export type BossFight = { course: Course; percent: number; votes: number };

export type Wrapped = {
  courses: Course[];
  subjects: Array<{ subject: string; count: number }>;
  topSubject: string | null;
  /** Gold courses: Reddit mostly calls them easy, or students call them a bird course. */
  birds: Course[];
  /** Red courses: Reddit mostly calls them hard. */
  bosses: Course[];
  /** The pick with the highest share of Reddit "hard" opinions. */
  hardest: BossFight | null;
  credits: number;
  persona: Persona;
};

export function isGoldCourse(code: string, birdMentions: ReadonlyMap<string, number>) {
  return (
    (birdMentions.get(code) ?? 0) >= BIRD_COURSE_THRESHOLD || getRedditSignal(code)?.kind === "easy"
  );
}

export function isRedCourse(code: string, birdMentions: ReadonlyMap<string, number>) {
  return !isGoldCourse(code, birdMentions) && getRedditSignal(code)?.kind === "hard";
}

export function pickPersona(stats: {
  total: number;
  birds: number;
  bosses: number;
  subjects: number;
  topSubject: string | null;
  topSubjectCount: number;
}): Persona {
  const { total, birds, bosses, subjects, topSubject, topSubjectCount } = stats;
  if (bosses >= 2 && bosses / total >= 0.4)
    return {
      id: "boss",
      emoji: "💀",
      name: "The Final Boss",
      tagline: "You saw the courses r/UTM warns about and saved them anyway.",
    };
  if (birds >= 2 && birds / total >= 0.4)
    return {
      id: "bird",
      emoji: "🪶",
      name: "The Bird Watcher",
      tagline: "GPA first, suffering later. Respect.",
    };
  if (bosses >= 1 && birds >= 1 && total >= 4)
    return {
      id: "strategist",
      emoji: "♟️",
      name: "The Strategist",
      tagline: "One boss fight, one bird course. Perfectly balanced.",
    };
  if (subjects >= 4)
    return {
      id: "explorer",
      emoji: "🧭",
      name: "The Explorer",
      tagline: `${subjects} subjects deep and still browsing.`,
    };
  if (topSubject && total >= 3 && topSubjectCount / total >= 0.6)
    return {
      id: "specialist",
      emoji: "🎯",
      name: "The Specialist",
      tagline: `All in on ${topSubject}. No distractions.`,
    };
  return {
    id: "main",
    emoji: "🍿",
    name: "The Main Character",
    tagline: "Your lineup, your rules.",
  };
}

export function buildWrapped(
  codes: readonly string[],
  birdMentions: ReadonlyMap<string, number> = new Map(),
): Wrapped | null {
  const seen = new Set<string>();
  const courses: Course[] = [];
  for (const code of codes) {
    const course = getCourse(code);
    if (!course || seen.has(course.code)) continue;
    seen.add(course.code);
    courses.push(course);
  }
  if (courses.length === 0) return null;

  const counts = new Map<string, number>();
  for (const c of courses) counts.set(c.subject, (counts.get(c.subject) ?? 0) + 1);
  const subjects = [...counts]
    .map(([subject, count]) => ({ subject, count }))
    .sort((a, b) => b.count - a.count || a.subject.localeCompare(b.subject));
  const top = subjects[0] ?? null;

  const birds = courses.filter((c) => isGoldCourse(c.code, birdMentions));
  const bosses = courses.filter((c) => isRedCourse(c.code, birdMentions));

  let hardest: BossFight | null = null;
  for (const course of bosses) {
    const signal = getRedditSignal(course.code);
    if (!signal) continue;
    if (
      !hardest ||
      signal.percent > hardest.percent ||
      (signal.percent === hardest.percent && signal.votes > hardest.votes)
    ) {
      hardest = { course, percent: signal.percent, votes: signal.votes };
    }
  }

  return {
    courses,
    subjects,
    topSubject: top?.subject ?? null,
    birds,
    bosses,
    hardest,
    credits: courses.reduce((sum, c) => sum + c.credits, 0),
    persona: pickPersona({
      total: courses.length,
      birds: birds.length,
      bosses: bosses.length,
      subjects: subjects.length,
      topSubject: top?.subject ?? null,
      topSubjectCount: top?.count ?? 0,
    }),
  };
}
