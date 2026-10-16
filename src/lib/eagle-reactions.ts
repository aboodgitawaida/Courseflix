import type { EagleLineEvent } from "@/lib/eagle-lines";

/**
 * How the Study Eagle reacts to what is on a page: which line pool fits the
 * numbers the page already has. Pure, so the choices can be tested.
 */

/** "1 friend request", "3 friend requests". */
export function countPhrase(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

/** The achievements shelf: nothing yet, a few, over half, or all of them. */
export function achievementsEvent(opts: {
  signedIn: boolean;
  unlocked: number;
  total: number;
}): EagleLineEvent {
  const { signedIn, unlocked, total } = opts;
  if (!signedIn) return "achievementsSignedOut";
  if (unlocked <= 0) return "achievementsNone";
  if (total > 0 && unlocked >= total) return "achievementsAll";
  if (unlocked * 2 >= total) return "achievementsMany";
  return "achievementsFew";
}

/** An empty shortlist, or a long one. Anything in between he leaves alone. */
export const BIG_SHORTLIST = 8;
export function shortlistEvent(count: number): EagleLineEvent | null {
  if (count === 0) return "shortlistEmpty";
  if (count >= BIG_SHORTLIST) return "shortlistBig";
  return null;
}

/** Friend requests waiting win; otherwise an empty friends list gets a nudge. */
export function friendsEvent(opts: { friends: number; incoming: number }): EagleLineEvent | null {
  if (opts.incoming > 0) return "friendsRequests";
  if (opts.friends === 0) return "friendsNone";
  return null;
}

/** Who shortlisted this course: one friend by name, several as a count. */
export function whoPhrase(names: string[]): string {
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names[0]} and ${names.length - 1} other friends`;
}
