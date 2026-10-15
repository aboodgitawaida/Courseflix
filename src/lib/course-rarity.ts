import { BIRD_COURSE_THRESHOLD, useBirdMentions } from "@/lib/ratings";
import { getRedditSignal, getRedditTake, type RedditSignal } from "@/lib/reddit-signals";

export type Rarity = "gold" | "red";

export type CourseRarity = {
  rarity: Rarity | null;
  signal: RedditSignal | null;
  birdMentions: number;
  /** Short pill text, e.g. "easy" or a curated take. Only built from real data. */
  verdict: string | null;
  /** Who said it: Reddit or CourseFlix students. */
  source: "Reddit" | "Students";
  /** Evidence line for tooltips and screen readers. */
  detail: string | null;
};

// Gold = Reddit mostly calls it easy or enough students tagged it a bird course;
// red = Reddit mostly calls it hard. Shared by the card, the preview and the course page.
export function useCourseRarity(code: string): CourseRarity {
  const { data: birdMentions = 0 } = useBirdMentions(code);
  const signal = getRedditSignal(code);
  const isGold = birdMentions >= BIRD_COURSE_THRESHOLD || signal?.kind === "easy";
  const isRed = !isGold && signal?.kind === "hard";
  const rarity: Rarity | null = isGold ? "gold" : isRed ? "red" : null;
  const take = getRedditTake(code);

  if (!rarity)
    return { rarity, signal, birdMentions, verdict: null, source: "Reddit", detail: null };
  if (signal && signal.kind === (isGold ? "easy" : "hard")) {
    return {
      rarity,
      signal,
      birdMentions,
      verdict: take ?? (isGold ? "easy" : "hard"),
      source: "Reddit",
      detail: `${signal.percent}% of ${signal.votes} Reddit opinions call this ${signal.kind}`,
    };
  }
  return {
    rarity,
    signal,
    birdMentions,
    verdict: "bird course",
    source: "Students",
    detail: `${birdMentions} students call this a bird course`,
  };
}
