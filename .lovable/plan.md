## What I found in the audit

I checked all 57 majors and every course in the catalog. Three real problems:

**1. Course codes are from the wrong campuses.** UTM courses always end in `H5` or `Y5` (`CSC108H5F`, `PSY100Y5Y`). Right now the catalog has:
- St. George codes that don't exist at UTM: `PSL300`, `PSL301`, `PSL440`, `ANA300`, `HMB265`, `BCH210`, `MAT137`, `BIO152`
- A UTSC code: `NROC34`
- No campus suffix anywhere

So a physiology student at UTM would be shown courses they literally cannot enroll in. This is the biggest credibility hole before you send it to friends.

**2. Ratings, professors, and Reddit quotes are invented.** Every star rating, every RMP score, every "reddit" quote in the app was made up. Some are attached to real professors' names with fake scores. That's the thing most likely to embarrass you when a friend checks a course they've taken.

**3. Coverage is lopsided.** Course counts per major: CS 26, HMB 21, Health 18 — but German 1, Chinese 1, HRM 1, Geography 2, Anthropology 2, Art History 2, Religion 2, Professional Writing 2, French/Italian/Spanish/Portuguese 2 each. Those 15+ majors get rails that are mostly backfilled with unrelated courses. Picking "Geography" today is nearly as broken as the physiology case you reported.

## Plan

### Step 1 — Rebuild the catalog on real UTM data

Pull from the official UTM Academic Calendar (`utm.calendar.utoronto.ca`) rather than writing courses from memory. For each course store: real UTM code with `H5`/`Y5` suffix, official title, official description, real credit value (0.5 / 1.0), and real prerequisite string.

- Rewrite `src/lib/majors.ts` so each major maps to its actual UTM program (Specialist/Major/Minor) and its real first-year/core course requirements.
- Rewrite `src/lib/courses.ts`: drop every non-UTM code, add correct UTM equivalents (e.g. `PSL300` → the actual UTM physiology sequence, `HMB265` → `BIO207H5`-style UTM genetics).
- Set a coverage floor: **no major ships with fewer than 8 real courses**, weighted toward first- and second-year requirements since that's who's picking courses. Majors below the floor get filled with their genuine program requirements, not random breadth.
- Replace the "still seeding" banner logic — with a floor in place, it only appears for genuinely thin programs.

### Step 2 — Be honest about ratings

Keep real course data, mark the rest clearly as sample:
- Rename the invented professor entries so they aren't attributed to real named people with fake scores — either generic ("Prof. A, Fall section") or removed until real data exists.
- Add a visible "Sample rating — not yet from real students" badge on rating pills and Reddit quote cards.
- Add a short honest line in the footer and course detail page: course info is from the official UTM calendar; ratings are placeholders until students submit them.

This turns the weakest part of the app into a reason for friends to sign up and contribute.

### Step 3 — Accounts (your chosen priority)

Enable Lovable Cloud and move state off localStorage:
- Email/password + Google sign-in.
- `profiles` table: major, year, completed courses.
- `shortlists` table: saved courses per user.
- On first sign-in, migrate whatever is already in localStorage into the account so nobody loses their picks.
- Header shows the signed-in account and a sign-out option instead of a permanent "Sign in" button.
- Browsing stays fully public and no-login — sign-in is only needed to save.

### The loophole worth naming

Once accounts exist, the natural next thing is student-submitted ratings — that's the only way this app ever has real data, and it's why accounts before ratings is the right order. Not in this plan, but it's the step after.

## Technical details

- Course data stays a typed TS module (fast, no query per page) until real ratings arrive; ratings move to Cloud tables in the ratings step.
- Real prereq strings get parsed into a code array so the prereq chain UI keeps working.
- Auth via Lovable Cloud: `profiles` + `shortlists` tables with row-level security scoped to the signed-in user, plus explicit grants.
- Browse routes stay public/SSR for shareable links; only save/profile actions require a session.
- I'll fetch UTM calendar pages directly during the build rather than relying on recall, so codes and prerequisites are verifiable.
