
# CourseFlix — Netflix for UofT Courses

A dark, neon-mint course discovery app for UofT students. Browse courses like Netflix, get "because you took X" recs, see prof + Reddit sentiment at a glance, and shortlist your semester.

## v1 Feature Scope

**1. Netflix-style browse**
- Home = horizontal scroll "rails" of course cards (posters, code, title, rating pill, workload tag)
- Rails: Trending in CS, Bird Courses, Highly Rated Profs, Hidden Gems, New This Year, By Area (AI, Systems, Theory, HCI)
- Hover/tap card → expanded preview with description, prereqs, avg rating, top prof, one-line vibe

**2. Course detail page**
- Big hero (course code + title + tags: Easy / Heavy / Interesting / Bird / Math-Heavy)
- Star ratings: Overall, Difficulty, Workload, Would Take Again
- **Prof section**: RateMyProf-style score + top 2 profs teaching it
- **Reddit vibes**: 3–5 summarized student quotes ("great lectures but brutal midterm")
- Prereqs pill chain + "Take next" suggestions
- Add to Shortlist button

**3. Personalized recommendations**
- Onboarding: pick major (CS default, plus Math, Stats, EngSci, Rotman, Life Sci, etc.), year, completed courses
- Home rails re-order: "Because you took CSC148…", "Popular in your year", "Fits your interests"
- Simple tag-based rec engine (share subject area + prereq graph + rating threshold)

**4. Shortlist / Timetable builder**
- Sidebar drawer: saved courses
- Shows credit total, workload heatmap (light/med/heavy), prereq warnings
- Share shortlist via link (so your friends can send you theirs)

**5. Accounts**
- Email + Google login (Lovable Cloud)
- Profile stores: major, year, completed courses, shortlist

## Design Direction

- **Vibe**: Dark Netflix + neon mint. Deep navy/near-black background, forest-green mid-tones, `#2dd4a8` mint as primary accent, `#73ffb8` glow for hover/CTAs.
- **Type**: Big bold display font for course codes (Space Grotesk), clean sans for body (DM Sans / Inter).
- **Cards**: Rounded-2xl, subtle gradient overlays, glowing mint border on hover, rating pill top-right.
- **Motion**: Smooth horizontal scroll rails, card scale-on-hover, page transitions, skeleton shimmer on load.
- **Mobile-first**: Full-bleed rails, bottom nav (Home / Search / Shortlist / Profile), swipeable cards.

## Data Strategy (Hybrid)

- **Seed now**: I'll hand-seed ~60 popular UofT CS courses (real codes, titles, descriptions from public catalog) + realistic mock ratings, prof names, and Reddit-style quotes so it feels alive on day 1.
- **Wire later**: Structure DB so real RateMyProf/Reddit data can be dropped in via a scraper/API later without schema changes.

## Technical Details

- **Stack**: TanStack Start + Tailwind v4 + shadcn (customized dark/mint theme in `src/styles.css`)
- **Backend**: Lovable Cloud (Supabase) with tables:
  - `courses` (code, title, description, area, credits, prereqs[])
  - `professors` (name, rmp_score, tags)
  - `course_offerings` (course_id, prof_id, term)
  - `ratings` (course_id, overall, difficulty, workload, would_take_again — aggregated)
  - `reviews` (course_id, source: reddit|rmp, quote, sentiment)
  - `profiles` (user_id, major, year, completed_courses[])
  - `shortlists` (user_id, course_id, added_at)
- **Auth**: Email/password + Google via Lovable Cloud (asks about profile table — yes)
- **Recs**: Simple SQL: courses sharing area/prereqs with completed, filtered by rating ≥ 3.5, excluding already-taken

## Build Order

1. Design system + dark-mint theme, layout shell, bottom nav
2. Home rails + course card component (seeded data)
3. Course detail page with prof + Reddit sections
4. Onboarding flow (major, year, completed courses)
5. Auth + profile persistence (Lovable Cloud)
6. Shortlist drawer + shareable link
7. Rec engine wired to profile
8. Polish: animations, empty states, mobile pass

## Out of Scope for v1 (can add later)

- Real-time Reddit/RMP scraping (structured for it, but seeded for now)
- Actual timetable conflict detection with time slots
- Friend social graph / seeing what friends took
- Non-CS majors having full course catalogs (CS is deep, others get top ~20)

Want me to start with step 1 (design system + home rails) so you can see the vibe fast?
