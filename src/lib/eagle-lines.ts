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
  /** The first time he sees you on this device. */
  welcomeFirst: [
    "Hi. I'm the Study Eagle. Tap me whenever you like.",
    "New face! I live here. Rent is head scratches.",
    "Welcome. I read the course pages so you don't have to.",
    "First time? I'll keep the perch warm.",
    "Hello! Ask me about a course. Or just pet me.",
  ],
  /** Back later the same day. */
  welcomeLater: [
    "Back again. Good.",
    "Oh, you're back. I saved your spot.",
    "Round two. Let's go.",
    "There you are. Missed me?",
    "Welcome back. Where were we?",
  ],
  /** Back the next day. */
  welcomeTomorrow: [
    "Morning, if it's morning. Hi.",
    "A new day, a clean slate.",
    "You came back. I'm touched.",
    "Day two. The plan survives.",
    "Welcome back. Slept well? I did. Constantly.",
  ],
  /** Back after a few days. */
  welcomeFewDays: [
    "{days} days! I was starting to worry.",
    "Look who's back after {days} days.",
    "{days} days without you. The perch got dusty.",
    "It's been {days} days. I'll pretend I wasn't counting.",
    "Back after {days} days. Shall we catch up?",
  ],
  /** Back after a week or more. */
  welcomeLongAway: [
    "{days} days! I nearly filed a missing-student report.",
    "It's been {days} days. I kept the syllabus warm.",
    "Long time. {days} days. Did you miss me? I'll say yes.",
    "You're back after {days} days. The perch has a new coat of moss.",
    "{days} days away. Welcome home.",
  ],
  /** Three or more days in a row. */
  welcomeStreak: [
    "{days} days in a row. Look at you.",
    "Day {days}. That's a streak. I'm impressed.",
    "{days} days straight. Consistency looks good on you.",
    "{days} in a row. I'd say I'm not counting, but I am.",
    "Day {days} together. This is basically a partnership.",
  ],
  /** From 11pm: getting late. */
  gettingLate: [
    "It's getting late. Maybe wrap up soon?",
    "Past eleven. Tomorrow-you will want that sleep.",
    "Late-ish. One more course, then bed?",
    "The night's young, but you might not be. Just saying.",
    "Eleven already. Time flies when you're browsing.",
  ],
  /** Still here well after midnight, a while after the first nudge. */
  lateLong: [
    "We've been up a while now. Water, then bed.",
    "Okay. Final answer: sleep is also productive.",
    "I'll keep your shortlist safe. Go rest.",
    "Still going? Brave. Also tired. Both can be true.",
    "The course list isn't going anywhere. You should.",
  ],
  /** A long stretch on the site: time to move. */
  breakNudge: [
    "You've been at it a while. Stretch break?",
    "Time for water and a stretch. I'll hold the perch.",
    "Look away from the screen for twenty seconds. Doctor's orders.",
    "A long session. Your eyes deserve a minute.",
    "Break time. The courses will wait.",
  ],
  /** Back to the tab after being away a while. */
  awayBack: [
    "Welcome back. I kept your spot.",
    "Oh, you're back. I wasn't peeking at your tabs.",
    "There you are. Ready to continue?",
    "You vanished. I assume snacks.",
    "Back at it. I only dozed a little.",
  ],
  /** Lots of course previews in one sitting. */
  manyPreviews: [
    "That's {count} previews. Want to compare a couple?",
    "{count} courses peeked at. Anything catching your eye?",
    "Lots of browsing. Shortlist the ones you'd actually take.",
    "{count} previews in. Decision fatigue is real.",
    "You've looked at {count}. Try Lighter options on your favourite.",
  ],
  /** A round number of courses on the shortlist. */
  shortlistMilestone: [
    "{count} on your shortlist. Time to compare?",
    "Shortlist: {count}. That's a real plan taking shape.",
    "{count} saved. Check your workload balance.",
    "{count} courses in. Might be time to trim.",
    "Your list is up to {count}. Impressive.",
  ],
  /** Opening the achievements shelf while signed out. */
  achievementsSignedOut: [
    "Sign in and I'll keep your badges safe.",
    "The shelf fills up once you sign in.",
    "Badges are saved to your account. Sign in to start collecting.",
    "No account, no badges. Sign in and let's begin.",
    "Sign in to start earning achievements.",
  ],
  /** Achievements shelf, signed in, nothing earned yet. */
  achievementsNone: [
    "Nothing on the shelf yet. Let's fix that.",
    "Empty shelf. Review a course, shortlist a few, and watch it fill.",
    "You should go collect some badges. I'll cheer.",
    "Zero badges. Everyone starts there. Go get one.",
    "The shelf is bare. Write a review and I'll lift the trophy for you.",
  ],
  /** Achievements shelf, under half earned. */
  achievementsFew: [
    "{unlocked} of {total} so far. A good start.",
    "{unlocked} down, {total} to go. Keep collecting.",
    "Nice, {unlocked} badges. The rest are within reach.",
    "{unlocked}/{total}. The shelf has room, hint hint.",
    "Off to a start: {unlocked} of {total}. More to find.",
  ],
  /** Achievements shelf, half or more earned. */
  achievementsMany: [
    "Look at all those achievements! {unlocked} of {total}.",
    "{unlocked} badges. That shelf is looking serious.",
    "{unlocked}/{total}. Show-off, but I'm proud.",
    "Halfway and beyond: {unlocked} of {total}.",
    "That's {unlocked} of {total}. I need to polish the trophy.",
  ],
  /** Achievements shelf, every badge earned. */
  achievementsAll: [
    "All {total}. You did the whole shelf!",
    "Every badge collected. I'm out of things to lift.",
    "{total} out of {total}. Legend.",
    "Full shelf. Frame it.",
    "You got them all. Now what, overachiever?",
  ],
  /** Shortlist page, signed in, nothing saved. */
  shortlistEmpty: [
    "Your shortlist is empty. Go find something that sounds good.",
    "Nothing saved yet. Tap the bookmark on any course.",
    "An empty list. A blank slate, my favourite kind.",
    "No courses yet. Try the search, I'll wait.",
    "Start with one course you're curious about.",
  ],
  /** Shortlist page with a long list. */
  shortlistBig: [
    "{count} courses? That's a lot of semester.",
    "Ambitious: {count} on the list. Compare the workloads.",
    "{count} on the list. Don't let them all become assignments.",
    "{count} courses is a lot of reading. Check the workload ratings.",
    "Big list: {count} courses. Start with the ones you can't skip.",
  ],
  /** Friends page with no friends yet. */
  friendsNone: [
    "No friends here yet. Studying is easier with a buddy.",
    "Search a name above and send a request. I'll wait.",
    "Add a friend and you'll see what they shortlist.",
    "A flock of one. Let's grow it.",
    "Friends make the hard courses feel lighter. Find some.",
  ],
  /** Friends page with requests waiting. {what} is e.g. '2 friend requests'. */
  friendsRequests: [
    "{what} waiting for you. Rude to ignore.",
    "Someone wants to be your friend: {what}, to be exact.",
    "{what} in your inbox. Go say hi.",
    "Popular! {what} waiting.",
    "Don't leave them hanging: {what}.",
  ],
  /** A course page a friend has shortlisted. {who} is a name or '2 friends'. */
  courseFriends: [
    "{who} shortlisted this. Great minds.",
    "Peer pressure alert: {who} shortlisted this.",
    "Your circle likes this one. {who} shortlisted it.",
    "{who} already saved this. Ask how they found it.",
    "Friends have taste. {who} shortlisted this.",
  ],
  /** New notifications waiting at the start of a session. {what} is e.g. '3 new notifications'. */
  unreadNotifications: [
    "You have {what}. The bell is waiting.",
    "{what}. Peek at the bell.",
    "Psst. {what} for you.",
    "{what} since you were last here. Check the bell.",
    "Something happened while you were away: {what}.",
  ],
  /** Monday morning. */
  dayMonday: [
    "Monday. Gentle start, strong finish.",
    "New week. Fresh syllabus energy.",
    "Monday! The perch and I are ready.",
    "Start the week with one small task. Then another.",
    "Monday motivation, delivered by bird.",
  ],
  /** Friday afternoon. */
  dayFriday: [
    "Friday! Finish strong, then rest.",
    "Almost the weekend. One more push.",
    "Friday afternoon. Brain at 40%. Aim low, finish something.",
    "Friday. Future you wants a plan for Monday.",
    "Weekend loading. Wrap up the small stuff.",
  ],
  /** Sunday evening. */
  daySundayNight: [
    "Sunday night. Lay out Monday's plan now.",
    "Sunday scaries? Plan one thing and it shrinks.",
    "Last night of the weekend. Pack tomorrow's to-do.",
    "Sunday evening: a fine time to check your shortlist.",
    "One more Sunday hour? Then bed.",
  ],
  /** Saturday, or Sunday before the evening. */
  dayWeekend: [
    "Weekend studying? Respect. Snacks recommended.",
    "It's the weekend. A little browsing, then go outside.",
    "Weekend mode. No pressure, just peeking.",
    "Weekend and you're here. Dedicated. Or bored. Either's fine.",
    "Weekend plan: one course page, one walk.",
  ],
  /** January 1st. */
  holidayNewYear: [
    "Happy New Year! Fresh term energy.",
    "New year, new shortlist.",
    "Jan 1 and you're studying? Resolution already in motion.",
    "Happy New Year from the perch.",
    "New year. Same bird. Better plans.",
  ],
  /** February 14th. */
  holidayValentine: [
    "Happy Valentine's Day. Be kind to yourself too.",
    "Love is in the air. So is exam stress. Breathe.",
    "Valentine's Day. My heart belongs to the syllabus.",
    "Roses are red, deadlines are due. I'm just a bird, but I'm rooting for you.",
    "Happy Valentine's. A shortlist is a love letter to future you.",
  ],
  /** October 31st. */
  holidayHalloween: [
    "Happy Halloween! The scariest thing is the syllabus.",
    "Boo! Did I scare you? Just a bird in costume.",
    "Halloween. I'm dressed as a very studious eagle.",
    "Trick or treat: finish one task, get one snack.",
    "Spooky season. Prereqs are the real monsters.",
  ],
  /** December 24th and 25th. */
  holidayChristmas: [
    "Merry Christmas! Even birds take the day off.",
    "It's the holidays. Studying is optional today.",
    "Happy holidays from the perch.",
    "Holiday mode: cocoa first, courses later.",
    "Merry everything. See you after the break.",
  ],
  /** December 31st. */
  holidayNewYearsEve: [
    "New Year's Eve! Go celebrate. The courses can wait.",
    "Last day of the year. Make a tiny plan, then party.",
    "Happy New Year's Eve. I'll hold down the perch.",
    "Cheers to the year! Shortlist for the new one tomorrow.",
    "Year's almost over. You did well. Go have fun.",
  ],
  /** Opening a gold (bird) course: he powers up into gold. */
  birdCourse: [
    "Fellow bird. Respect.",
    "A bird course. Time to go gold.",
    "Gold standard. Literally.",
    "Now that's a course after my own heart.",
    "Powering up. Easy courses bring out my best.",
  ],
  /** Opening the bird section: the whole shelf is gold. */
  birdSection: [
    "Welcome to the aviary.",
    "Bird courses. My people.",
    "Go gold or go home.",
    "The gold section. Handle with shine.",
    "All gold, all the time.",
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
