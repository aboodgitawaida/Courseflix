# Operations

How Courseflix is run day to day. See [`CLAUDE.md`](../CLAUDE.md) for the rules that protect production data.

## Local development

```sh
cp .env.example .env   # fill in your Supabase and Resend keys
npm ci
npm run dev
```

Before pushing: `npm run check` (typecheck, lint, formatting and tests). CI runs the same checks, plus a production build, on every pull request.

## Database changes

Vercel does not apply Supabase migrations. After merging anything in `supabase/migrations/`, review the new files and run them by hand in the Supabase SQL Editor, oldest first. Never run `supabase db push` or `supabase db reset` against production.

Migrations only add things (tables, columns with defaults, policies, functions). Some must run in a particular order relative to a deploy or a dashboard setting; each file's header comment says when.

## Who can post reviews

Sign-up is instant ("Confirm email" is off in Supabase), so anyone can browse, save courses and add friends straight away. Posting a review requires a confirmed email: Google sign-ins count automatically, and email sign-ups click a one-time link the site sends through Resend (`src/lib/review-verification.ts`). The check runs in `submitReview` and in the `course_ratings` insert/update policies.

## Review moderation

New and edited reviews go through the `submitReview` server function, which can ask Claude to check the comment and instructor field against a deliberately lenient policy in `src/lib/review-moderation.server.ts`. Only threats, hate, sexual harassment, someone's private information and spam are blocked; harsh opinions, profanity and criticism of instructors are published.

- The check runs only when `ANTHROPIC_API_KEY` is set in Vercel. Without it, reviews publish unchecked.
- If the check fails (API error, timeout), the review is published and logged as `review_moderation_failed`. Blocked attempts are logged as `review_blocked` with the category only, never the text.

## Handling reported reviews

Reports arrive by email (the "Report review" link under each review) with the review ID and course code. The Help page promises a response within 48 hours.

Look the review up in the Supabase SQL Editor:

```sql
-- The review, including who wrote it (never shown on the site).
select id, user_id, course_code, prof_name, comment, created_at
from public.course_ratings where id = '<review-id>';

-- Everything else that account has written, if it looks like a pattern.
select id, course_code, comment, created_at
from public.course_ratings where user_id = '<user-id>' order by created_at desc;
```

If it breaks the Terms (personal attacks, someone's private information, spam, fake or duplicate reviews), save a copy of the row first, then delete that one row in the Table Editor (`course_ratings`). Stats update automatically. For repeat or clearly malicious accounts, delete the user under Authentication → Users. Negative but honest reviews ("hard tests, unclear lectures") stay up.

## Course bracket

`/bracket` runs a 16-course "Hardest course at UTM" knockout that signed-in students vote on (`src/lib/bracket.ts`, migration `20261016120000_course_brackets.sql`). Until that migration is run, the page says "coming soon" and the home banner stays hidden.

- **Starting it.** Deploy first, then run the migration. The bracket opens at the next full hour, and each of the four rounds lasts 48 hours (8 days in total). To choose another start, change it before anyone votes: `update public.brackets set starts_at = '2026-10-20 12:00-04' where id = 'hardest-course-fall-2026';`
- **Votes.** One vote per person per matchup, changeable until the round closes. Votes go through the `cast_bracket_vote` function, which rejects closed rounds. The public only sees counts (`bracket_vote_tallies`), never who voted. Ties go to the higher seed.
- **Seeds** are frozen in the migration (the courses r/UTM most often calls hard, at most two per subject), so later Reddit updates don't reshuffle a live bracket.
- **A new bracket** (say "best bird course") is a new `brackets` row with its own id and 16 seeds, plus pointing `ACTIVE_BRACKET_ID` at it. Old votes stay where they are.

## Keeping Supabase awake

Free Supabase projects pause after about a week without activity. `.github/workflows/keep-supabase-awake.yml` makes one read-only request every 3 days. It needs the `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` repository secrets.

## Updating catalogue data

- Course catalogue and descriptions: `src/lib/utm-catalog.ts` and `src/lib/course-descriptions.ts`, generated from the UTM Academic Calendar.
- After changing the catalogue, run `npm run sitemap` to regenerate `public/sitemap.xml`.

## Rate My Professors scores

Professor ratings shown on course pages come from Rate My Professors (`src/lib/professor-ratings.ts`). To hide every score and review count, for example if RMP asks, set `SHOW_RMP_SCORES = false` in that file and deploy. Professors then show a plain "View on Rate My Professors" link instead.
