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
