# Courseflix

## Production data is not disposable

Real students' reviews (`public.course_ratings`), profiles, shortlists,
friendships and achievements live in the production Supabase database. They
cannot be recreated. Any change to the repo, Supabase, Vercel or Resend must
keep existing rows intact.

- Never write SQL that removes or overwrites existing user data: no
  `DROP TABLE`, `TRUNCATE`, `DELETE FROM`, `DROP COLUMN`, column type changes
  that can lose data, or bulk `UPDATE`s on user tables. Dropping and recreating
  **views**, policies, functions and triggers is fine because they hold no
  data.
- New migrations only add things (tables, nullable or defaulted columns,
  policies, functions). New `CHECK` constraints on existing tables use
  `NOT VALID` so old rows are never rejected or rewritten.
- Never add a new `ON DELETE CASCADE` that points at `course_ratings` or at a
  table reviews depend on. The only cascade that removes reviews today is
  `auth.users`, which runs when a user deletes their own account.
- Never run `supabase db reset --linked`, `supabase db push` or other
  commands against the linked production project. Migrations are applied by
  hand in the Supabase SQL Editor after review.
- If a task seems to need removing or rewriting existing data, stop and ask
  the owner first. Say exactly which rows would change and how to back them
  up.
