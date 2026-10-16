import data from "./reddit-signals.json";

// Gold = Reddit mostly calls the course easy, red = mostly hard. Counts are [easy, hard]
// opinions from classified Reddit comments, so a course needs enough opinions to count.
export const REDDIT_MIN_VOTES = 10;
export const REDDIT_EASY_SHARE = 0.85;
export const REDDIT_HARD_SHARE = 0.8;

export type RedditSignal = { kind: "easy" | "hard"; percent: number; votes: number };

const COUNTS = data.courses as unknown as Record<string, [number, number]>;

// Catalog codes end in the credit weight and campus (PHY100H5, PSY100Y5); Reddit says PHY100.
const shortCode = (code: string) => code.replace(/[HY]\d$/, "");

export function getRedditSignal(code: string): RedditSignal | null {
  const counts = COUNTS[shortCode(code)];
  if (!counts) return null;
  const [easy, hard] = counts;
  const votes = easy + hard;
  if (votes < REDDIT_MIN_VOTES) return null;
  if (easy / votes >= REDDIT_EASY_SHARE)
    return { kind: "easy", percent: Math.round((100 * easy) / votes), votes };
  if (hard / votes >= REDDIT_HARD_SHARE)
    return { kind: "hard", percent: Math.round((100 * hard) / votes), votes };
  return null;
}

// Optional hand-written take on *why* Reddit calls a course easy or hard ("light weekly
// quizzes", "brutal problem sets"). The scraped data only has easy/hard counts, so this
// starts empty: add an entry only when it paraphrases real r/UTM threads, never made up.
// Keys use the short Reddit code (MAT102, not MAT102H5).
export const REDDIT_TAKES: Partial<Record<string, string>> = {};

export function getRedditTake(code: string): string | null {
  return REDDIT_TAKES[shortCode(code)] ?? null;
}
