# Study Eagle overhaul: checklist

Nothing here is built yet. Items marked **DECIDE** need an answer from the owner first.

## What exists today (from the code)

- `src/components/StudyEagle.tsx` is one component with one chat panel. It opens from a small button on the eagle, or automatically on desktop when a course preview or course page fires `study-eagle-summarize`.
- The panel shows the course summary, or a canned reply. The 3 chips (Study tip / Help me choose / Plan a semester) only swap in 3 hard-coded sentences.
- The summary is built by `makeCourseSummary`, which trims the course description. It is not real analysis.
- The small status bubble (`showStatus`) already exists, but it only says a few things: pet ("Krrr! That tickles."), wake ("Back already?"), sleep ("Time for a study break.") and the `celebrateEagle(message)` lines from reviews, shortlist, profile and achievements.
- Sprite sheets: awake (idle), sleep, fallasleep, wakeup, pet, celebrate. Built by `scripts/build-eagle-sprites.py` from `assets/eagle-src/`.
- The site already has a bird-course signal: `isBird()` in `src/lib/courses.ts`, a `BIRD_BLOCKLIST`, a "Light workload signal" badge and a bird filter. Those are inferred from data, not verified by students.

## 1. Chat structure: one chat or two? (DECIDE)

Recommendation: **keep two layers, but make each one clearly different, and merge the 3 chips into the big one.**

- **Mini bubble (automatic, ambient)**: short, reacts to events, disappears by itself. This is the companion's voice.
- **Big panel (opened on tap)**: the course summary and the real chat. Nothing else. Delete the 3 generic chips; replace them with context buttons (see section 4).

Why not one chat: reactions like petting or achievements would either pop a big panel or get lost inside it. Why not leave it as is: the two chats overlap and the 3 buttons don't do anything real.

- [ ] DECIDE: confirm two layers (mini bubble + big panel)
- [ ] DECIDE: should the big panel keep a text input for free questions? That needs an AI/API call and costs money. The alternative is buttons only.
- [ ] Mini bubble: queue messages so two events never overwrite each other
- [ ] Mini bubble: cooldowns and a daily cap so he doesn't nag
- [ ] Mini bubble: never show while the big panel is open
- [ ] Big panel: when it is open on a course, the mini bubble stays silent
- [ ] Big panel layout: fix how it moves around when the eagle's perch is dragged up or down (the panel flips above or below the eagle based on position). Test near the top, middle and bottom of the screen, desktop and phone.
- [ ] Remove or replace the 3 chips (Study tip / Help me choose / Plan a semester)

## 2. Course summary: when does he summarize? (DECIDE)

Options:
- A. Auto-summarize on opening any preview or course page (today's behavior on desktop).
- B. Eagle wakes and reads only when the user wakes him (tap), and auto-opening wakes him only for something notable.
- C. Hybrid: opening a course makes him wake up and show a one-line teaser in the mini bubble ("Reading this one…"); the full summary appears in the big panel once he has "read" it.

Recommendation: **C.** It gives him the wake-up animation you described without covering the course page, and on phones it avoids the panel blocking the course.

- [ ] DECIDE: A, B or C
- [ ] If he is asleep when a course opens, play the wake-up and have him say "Alright, alright, I'm up…" (see section 3)
- [ ] Real summary content instead of a trimmed description: workload, assessment type, prerequisites, and what students said (from `course_ratings`)
- [ ] Decide if summaries are written by hand/templates or by an AI call (cost, speed and accuracy; no invented facts about a course)
- [ ] Summary text types out word by word in the big panel (typewriter), with a skip on tap
- [ ] Respect `prefers-reduced-motion` (show the full text at once)

## 3. Mini-bubble personality: events to react to

Each event gets 3 to 5 rotating lines so it doesn't repeat.

- [ ] Pet (vary by how many times in a row; annoyed after spamming)
- [ ] Falling asleep
- [ ] Sleeping (occasional "zzz" bubble)
- [ ] Woken up by the user ("Alright, alright…")
- [ ] Woken up automatically by opening a course
- [ ] Achievement unlocked
- [ ] Course added to a shortlist
- [ ] Course removed from a shortlist
- [ ] Review written / review updated
- [ ] Friend added / friend request accepted
- [ ] Profile completed
- [ ] First visit / welcome back / returning after days
- [ ] Late-night browsing (for example after 1am local time): "Get some sleep, the servers are sleepy and so am I." Use the user's local clock.
- [ ] Exam-season or deadline messages (needs a date source; DECIDE whether to include)
- [ ] Rapid-browsing mode (see section 5, "Study grind")
- [ ] Bird-course discovery (see section 6)
- [ ] Keep all lines in one file (`src/lib/eagle-lines.ts`) so they can be edited without touching components
- [ ] Add an in-character tone guide: short, a little sarcastic, never mean, never about grades or the student's ability

## 4. Big-panel buttons

Today's 3 chips don't make sense. Replace with context-aware actions:

- [ ] On a course page or preview: "Is this a bird course?", "What do students say?", "Prereqs", "Workload"
- [ ] On other pages: "Find me a bird course", "What's popular?"
- [ ] Each button answers from real data on the site, not a canned sentence
- [ ] Hide buttons that have no data (for example no reviews yet)

## 5. Animations

Existing: idle, sleep, fall asleep, wake up, pet, celebrate.

- [ ] **Fix celebration eyes** (the frame where the eyes look like they're moving and there's a brow in one frame). Edit/regenerate the celebrate frames (`assets/eagle-src/pixellab-celebrate.png`, `requests/celebrate.json`), rebuild with `scripts/build-eagle-sprites.py`, and check every frame at 1x zoom. Keep the eyes stable and consistent with the idle sprite.
- [ ] Celebration: optional polish only; it can stay as it is once the eyes are fixed
- [ ] **Wake-up animation when triggered by opening a course** (reuse the existing wake-up sheet, then continue into reading)
- [ ] **Reading animation**: holds a small book, eyes sweeping left to right and back while he "reads". Loops while the summary is being prepared or typed.
- [ ] **Speaking animation**: beak or head movement while words appear one by one in the big panel
- [ ] **Study grind** (from the AI suggestion): tiny pixel reading glasses and a flipping mini book when the user is clicking or typing rapidly. Needs a definition of "rapid" (for example 8+ clicks or keystrokes in 10 seconds) and a way to leave the mode.
- [ ] Late-night animation: heavy eyelids / yawn between 1am and 5am
- [ ] Bird-course animation: points a wing at the legendary course
- [ ] Every new sheet is added to `SPRITE_MODES`, `EAGLE_SHEETS` and the CSS in `src/styles.css`, with frame count and timing constants matching
- [ ] Preload new sheets, keep file sizes small, check phone performance
- [ ] Reduced-motion fallback for every animation

## 6. Real bird courses

"Bird course" here means a course students say is easy and low effort. Today `isBird()` guesses it from workload data. This item replaces the guess with evidence.

- [ ] Research: collect what students say on Reddit (UTM, UofT and Mississauga subreddits) and student forums. Record the source link and date for each course.
- [ ] Only list a course if several independent students call it a bird course. Don't list a course on one comment.
- [ ] Cross-check against the course list in `src/lib/courses.ts` and `BIRD_BLOCKLIST`; fix any contradictions (for example a course on the blocklist that students call a bird)
- [ ] Store the result as data (a list of "verified bird" course codes with source notes), not scattered in components
- [ ] Choose a small set (a handful of genuine birds to feature), not every easy-looking course
- [ ] "Legendary" overlay on those cards: golden border/shine, a badge, shown on cards, the preview and the course page. Don't cover the course title or other badges. Works in light and dark mode and on phones.
- [ ] Eagle calls it out when you open one: "Fellow bird. Respect." (mini bubble plus the pointing animation)
- [ ] Wording: say "students report it as light" rather than guaranteeing it, so the site doesn't promise an easy mark
- [ ] DECIDE: show Reddit as the source on the page, or only use it internally?
- [ ] This uses no user data and needs no database migration if the list lives in code. If it moves to a table, the migration only adds a table (see `CLAUDE.md`).

## 7. Cross-cutting

- [ ] A single `eagle` event module that every feature calls (replace the scattered `window.dispatchEvent` custom events with typed helpers)
- [ ] Settings: toggles for the mini bubble, the auto-summary and the eagle itself (the on/off switch already exists in `src/hooks/use-eagle.tsx`)
- [ ] Accessibility: screen-reader friendly status text, focusable controls, no information only in animation
- [ ] Phone behavior: the eagle is tucked away by default (`study-eagle-tuck`). Decide which reactions pop him out and which stay silent.
- [ ] Tests for the event queue, cooldowns and the late-night rule
- [ ] Nothing in this work touches or rewrites existing rows in `course_ratings`, profiles or shortlists. Reads only. (Per `CLAUDE.md`.)

## Suggested order

1. Decide the three open questions (sections 1 and 2, and the bird source policy)
2. Fix celebration eyes (small, visible win)
3. Mini-bubble lines, queue and cooldowns
4. Big-panel buttons and the real summary
5. Reading, speaking and wake-from-course animations
6. Bird-course research, data and legendary overlay
7. Study grind and late-night extras
