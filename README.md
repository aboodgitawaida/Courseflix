# CourseFlix

A "Netflix-style" course recommendation and discovery platform built for University of Toronto Mississauga (UTM) students.

Finding the right university courses shouldn't mean digging through Reddit threads and RateMyProf separately. CourseFlix brings everything together into a clean, personalized recommendation engine based on your major, past classes, and aggregated student reviews.

**Live App**: [courseflix.ca](https://www.courseflix.ca)

## Stack

- TanStack Start (React) deployed on Vercel
- Supabase for auth and Postgres (row-level security on every table)
- Resend for password-reset email

## Local development

```sh
cp .env.example .env   # fill in your Supabase and Resend keys
npm install
npm run dev
```

Before pushing: `npm run typecheck && npm run lint && npm test`. CI runs the same checks on every PR.

## Database changes

Vercel does not apply Supabase migrations. After merging anything in `supabase/migrations/`, run the new files in the Supabase SQL Editor (oldest first) or use `supabase db push`.

## Handling reported reviews

Reports arrive by email (the "Report review" link under each review) with the review ID and course code. The Help page promises a response within 48 hours.

Remove a review that breaks the Terms (personal attacks, someone's private information, spam, fake or duplicate reviews) in the Supabase SQL Editor:

```sql
-- Look at it first, including who wrote it (never shown on the site).
select id, user_id, course_code, prof_name, comment, created_at
from public.course_ratings where id = '<review-id>';

-- Remove it. Stats update automatically.
delete from public.course_ratings where id = '<review-id>';

-- Everything else that account has written, if it looks like a pattern.
select id, course_code, comment, created_at
from public.course_ratings where user_id = '<user-id>' order by created_at desc;
```

For repeat or clearly malicious accounts, delete the user under Authentication → Users in the Supabase dashboard; their profile, reviews, shortlist and friendships are removed with it. Negative but honest reviews ("hard tests, unclear lectures") stay up.
