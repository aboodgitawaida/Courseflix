import { getCourse, type Course } from "@/lib/courses";
import type { RatingStatsRow } from "@/lib/ratings";

/** Reviews needed before the eagle quotes a course's averages. */
export const MIN_REVIEWS_TO_QUOTE = 3;

/** One sentence about what students said, from the review averages. */
export function statsSentence(stats: RatingStatsRow | null | undefined): string {
  const count = stats?.rating_count ?? 0;
  if (!stats || count === 0) return "No reviews yet. Be the first?";
  if (count < MIN_REVIEWS_TO_QUOTE) {
    return `Only ${count} review${count === 1 ? "" : "s"} so far, too few to call.`;
  }
  return (
    `${count} students rate it ${fmt(stats.avg_rating)}/5, ` +
    `workload ${fmt(stats.avg_workload)}/5, ` +
    `and ${Math.round(stats.pct_would_take_again)}% would take it again.`
  );
}

/** The summary the main chat streams: what the course is, then what students said. */
export function courseSummary(code: string, about: string, stats?: RatingStatsRow | null) {
  return `${code}: ${about} ${statsSentence(stats)}`;
}

/** What you need before this course, in one line. */
export function prereqSentence(course: Course): string {
  const prereqs = course.prereqs.filter((code) => getCourse(code));
  if (prereqs.length === 0) return `${course.code} has no course prerequisites. Jump right in.`;
  return `${course.code} needs ${listOr(prereqs.slice(0, 4))} first. The path is highlighted.`;
}

/**
 * Up to `n` courses in the same subject that students found lighter: enough
 * reviews to trust, and a lower average workload than this course (or simply
 * the lightest, if this course has no reviews yet).
 */
export function lighterOptions(
  course: Course,
  courses: Course[],
  stats: Map<string, RatingStatsRow>,
  n = 3,
): Course[] {
  const own = stats.get(course.code);
  const ceiling =
    own && own.rating_count >= MIN_REVIEWS_TO_QUOTE ? own.avg_workload : Number.POSITIVE_INFINITY;
  return courses
    .filter((c) => c.subject === course.subject && c.code !== course.code)
    .map((c) => ({ c, s: stats.get(c.code) }))
    .filter(
      (x): x is { c: Course; s: RatingStatsRow } =>
        !!x.s && x.s.rating_count >= MIN_REVIEWS_TO_QUOTE && x.s.avg_workload < ceiling,
    )
    .sort((a, b) => a.s.avg_workload - b.s.avg_workload || b.s.avg_rating - a.s.avg_rating)
    .slice(0, n)
    .map((x) => x.c);
}

function fmt(value: number) {
  return (Math.round(value * 10) / 10).toFixed(1);
}

function listOr(items: string[]) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} or ${items[items.length - 1]}`;
}
