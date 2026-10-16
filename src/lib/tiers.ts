import { COURSES, type Course } from "@/lib/courses";
import { BIRD_COURSE_THRESHOLD } from "@/lib/ratings";
import { getRedditSignal } from "@/lib/reddit-signals";

export type Tiers = { birds: Course[]; danger: Course[] };

// The same rule as the gold and red cards (see course-rarity.ts): a course is a bird course when
// Reddit mostly calls it easy or enough students tagged it one, and in the danger zone when Reddit
// mostly calls it hard. Courses with the most opinions behind them come first.
export function getTiers(birdMentions?: ReadonlyMap<string, number>): Tiers {
  const birds: Array<{ course: Course; weight: number }> = [];
  const danger: Array<{ course: Course; weight: number }> = [];
  for (const course of COURSES) {
    const signal = getRedditSignal(course.code);
    const students = birdMentions?.get(course.code) ?? 0;
    const weight = (signal?.votes ?? 0) + students;
    if (students >= BIRD_COURSE_THRESHOLD || signal?.kind === "easy")
      birds.push({ course, weight });
    else if (signal?.kind === "hard") danger.push({ course, weight });
  }
  const byWeight = (a: { weight: number }, b: { weight: number }) => b.weight - a.weight;
  return {
    birds: birds.sort(byWeight).map((x) => x.course),
    danger: danger.sort(byWeight).map((x) => x.course),
  };
}
