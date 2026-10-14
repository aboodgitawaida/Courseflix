/**
 * Everything the Study Eagle says, in one place so the copy can be edited
 * without touching any logic. Lines are picked at random from each pool
 * (never the same line twice in a row), see pickEagleLine in study-eagle.ts.
 *
 * Voice: warm, a little dry, short. One sentence, two at most.
 * Placeholders in braces ({code}, {name}, {count}) are filled in by the caller.
 */
export const EAGLE_LINES = {
  /** Tapped while awake. */
  pet: [
    "Krrr! That tickles.",
    "You got me.",
    "Okay, one more. Then flashcards.",
    "Feathers: ruffled. Morale: up.",
    "I accept payment in head scratches.",
    "Careful. I'm very majestic.",
  ],
  /** Nodding off after a while with nothing happening. */
  fallAsleep: [
    "Time for a study break.",
    "Resting my eyes. Not sleeping.",
    "Wake me when it's midterm season.",
    "Five more minutes…",
    "Power nap. Very scholarly.",
  ],
  /** Tapped while asleep: groggy. */
  wokenUp: [
    "Back already?",
    "Mm? I was reviewing. With my eyes closed.",
    "Huh. Who moved the syllabus?",
    "I'm up. Mostly.",
    "Coffee first. Then questions.",
  ],
  /** One achievement unlocked. */
  achievement: [
    "Unlocked: {name}!",
    "{name}. Put that on the fridge.",
    "Badge acquired: {name}. Very official.",
    "{name}! I'd clap, but wings.",
    "Look at you. {name}.",
  ],
  /** Several achievements unlocked at once. */
  achievements: [
    "{count} achievements unlocked!",
    "{count} badges at once? Show-off.",
    "{count} new badges. I'm running out of fridge.",
  ],
  /** A course added to the shortlist. */
  courseAdded: [
    "Nice pick!",
    "{code} is on the list. Bold.",
    "Shortlisted. Future you says thanks.",
    "{code}? Good eye. Mine are better, but good.",
    "Added. Check the prereqs before you get attached.",
  ],
  /** First review of a course posted. */
  reviewPosted: [
    "Thanks for the review!",
    "Future students owe you one.",
    "Honest reviews make this place work. Thank you.",
    "Review posted. The flock is better informed.",
    "Noted, filed, appreciated.",
  ],
  /** A friend request accepted. */
  friendAdded: [
    "A new study buddy!",
    "Two heads, fewer all-nighters.",
    "Friend added. Compare shortlists, not grades.",
    "The flock grows.",
    "Good call. Group chats survive midterms.",
  ],
  /** Profile filled in for the first time. */
  profileComplete: [
    "Profile complete!",
    "Profile done. Looking sharp.",
    "All set. Now people know who to thank for reviews.",
  ],
  /** Local time between midnight and 5am, once per session. */
  lateNight: [
    "It's late. The readings will still be there tomorrow.",
    "Night owl? Wrong bird, but I get it.",
    "Past midnight. Drink some water.",
    "Sleep is a study strategy too.",
    "Still here? Then let's make it count.",
  ],
  /** Answers in the chat panel. */
  tips: [
    "Try the course preview first, then shortlist anything that still feels like a good fit.",
    "A good study plan starts with your prerequisites. Follow the path on the full course page.",
    "Compare workload and difficulty together. A high rating is not always an easy semester.",
  ],
} as const satisfies Record<string, readonly string[]>;

export type EagleLineEvent = keyof typeof EAGLE_LINES;

/**
 * Minimum time between two lines for the same event, so a burst of actions
 * (say, shortlisting five courses) doesn't make the eagle repeat himself.
 * The animation still plays; only the line is skipped.
 */
export const EAGLE_LINE_COOLDOWN_MS: Partial<Record<EagleLineEvent, number>> = {
  fallAsleep: 60_000,
  wokenUp: 60_000,
  courseAdded: 10_000,
};
