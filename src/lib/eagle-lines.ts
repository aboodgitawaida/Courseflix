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
    "Left a bit. No, my other left.",
    "Bold of you to approach a raptor.",
    "Mm. Behind the beak, if you're offering.",
    "Is this a study break? It feels like a study break.",
  ],
  /** Tapped again and again (3 to 5 pets in a few seconds): a warning before he snaps. */
  petWarn: [
    "Easy there. I have feathers, not buttons.",
    "Still tickles. Slightly less each time.",
    "I'm starting to feel like a doorbell.",
    "Is there a point to this, or just vibes?",
    "My patience is molting.",
    "You know I can count, right?",
  ],
  /** Petted too many times in a row: fed up. */
  petSpam: [
    "Okay. That's enough.",
    "I'm a bird, not a stress ball.",
    "Hands off the feathers. Please.",
    "You've had your turn. Study.",
    "Personal space. It's a thing.",
    "Do I look like a fidget spinner?",
    "My patience has left the branch.",
    "One more and I'm napping out of spite.",
  ],
  /** Nodding off after a while with nothing happening. */
  fallAsleep: [
    "Time for a study break.",
    "Resting my eyes. Not sleeping.",
    "Wake me when it's midterm season.",
    "Five more minutes…",
    "Power nap. Very scholarly.",
    "Reading week started early for me.",
    "Eyes closed. Quality control.",
    "Nap now. Panic later.",
  ],
  /** Tapped while asleep: groggy. */
  wokenUp: [
    "Back already?",
    "Mm? I was reviewing. With my eyes closed.",
    "Huh. Who moved the syllabus?",
    "I'm up. Mostly.",
    "Coffee first. Then questions.",
    "Ten more minutes. Kidding. Hi.",
    "Whoa. Is it exam season already?",
    "Who's tapping? Oh. Hi.",
  ],
  /** One achievement unlocked. */
  achievement: [
    "Unlocked: {name}!",
    "{name}. Put that on the fridge.",
    "Badge acquired: {name}. Very official.",
    "{name}! I'd clap, but wings.",
    "Look at you. {name}.",
    "{name} is yours now. Wear it proudly.",
    "New badge: {name}. I'm only a little jealous.",
  ],
  /** Several achievements unlocked at once. */
  achievements: [
    "{count} achievements unlocked!",
    "{count} badges at once? Show-off.",
    "{count} new badges. The shelf is filling up.",
    "{count} at once. Where did you find the time?",
    "Badge haul: {count}. I need a bigger trophy case.",
  ],
  /** A course added to the shortlist. */
  courseAdded: [
    "Nice pick!",
    "{code} is on the list. Bold.",
    "Shortlisted. Future you says thanks.",
    "{code}? Good eye. Mine are better, but good.",
    "Added. Check the prereqs before you get attached.",
    "{code} saved. Now read what students said.",
    "Another one for the list. I respect the ambition.",
    "{code}, noted. Don't forget it exists.",
  ],
  /** A course taken off the shortlist. */
  courseRemoved: [
    "{code} is off the list. No hard feelings.",
    "Cut. Probably wise.",
    "Changed your mind? Allowed.",
    "Out it goes. Fewer decisions later.",
    "Removed. The list is lighter now.",
    "{code}, so long. It was a short relationship.",
  ],
  /** First review of a course posted. */
  reviewPosted: [
    "Thanks for the review!",
    "Future students owe you one.",
    "Honest reviews make this place work. Thank you.",
    "Review posted. Everyone else is better informed.",
    "Noted, filed, appreciated.",
    "One real student's take beats a hundred guesses.",
  ],
  /** An existing review edited. */
  reviewUpdated: [
    "Review updated. Second thoughts are allowed.",
    "Edited. Accuracy over ego.",
    "Fresh take saved.",
    "Revised and resubmitted. Very academic.",
    "Updated. Honest reviews can change their mind.",
  ],
  /** A friend request accepted. */
  friendAdded: [
    "A new study buddy!",
    "Two heads, fewer all-nighters.",
    "Friend added. Compare shortlists, not grades.",
    "The flock grows.",
    "Good call. Group chats survive midterms.",
    "New friend. Swap notes, not panic.",
  ],
  /** Profile filled in for the first time. */
  profileComplete: [
    "Profile complete!",
    "Profile done. Looking sharp.",
    "All set. Now people know who to thank for reviews.",
    "Fully fledged. Get it?",
    "Profile finished. You're easy to find now.",
  ],
  /** Local time between midnight and 5am, once per session. */
  lateNight: [
    "It's late. The readings will still be there tomorrow.",
    "Night owl? Wrong bird, but I get it.",
    "Past midnight. Drink some water.",
    "Sleep is a study strategy too.",
    "Still here? Then let's make it count.",
    "Even owls rest. Occasionally.",
    "Bed is undefeated. Just saying.",
  ],
  /** Answers in the chat panel. */
  tips: [
    "Try the course preview first, then shortlist anything that still feels like a good fit.",
    "A good study plan starts with your prerequisites. Follow the path on the full course page.",
    "Compare workload and difficulty together. A high rating is not always an easy semester.",
    "Put two courses in the compare drawer to weigh them side by side.",
    "Only a couple of reviews is a hint, not a verdict. Look for courses with more.",
    "Pair a heavy course with a lighter one. Your calendar will thank you.",
    "On a course page, Lighter options shows easier picks in the same subject.",
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
  courseRemoved: 10_000,
  reviewUpdated: 10_000,
};
