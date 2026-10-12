# CourseFlix

**Browse every UTM course like you browse Netflix.** Pick your program, scroll curated rows, check what students and Rate My Professors say, and build a shortlist you can share with friends.

**Live:** [courseflix.ca](https://www.courseflix.ca)

<!-- Add screenshots here, e.g. docs/screenshots/home.png, course.png, list.png -->

## Why

Choosing courses at the University of Toronto Mississauga means jumping between the Academic Calendar, the Timetable Builder, Rate My Professors and r/UTM. CourseFlix puts all of it on one page per course, and turns 2,491 courses into something you can actually browse.

## Features

- **Program-aware home feed.** Pick from 40+ UTM programs and the home page rebuilds into rows for your core courses, first- and second-year picks, upper-year seminars, lighter-workload options and courses that unlock the most others.
- **A page for every course.** Official description, prerequisites drawn as a "what this unlocks" path, this term's published instructors with their Rate My Professors ratings, and links to the calendar, timetable and Reddit.
- **Student reviews.** Rate difficulty, workload and "would take again". Reviews are anonymous to the public, and posting needs a confirmed email so ratings stay trustworthy.
- **Shortlist and sharing.** Save courses, compare them side by side, share your list as a link, or export it as an Instagram-story image.
- **Friends.** Add classmates, see each other's shortlists (unless set to private) and get notified when a friend saves a course.
- **Search everywhere.** A ⌘K command palette searches codes, titles and descriptions.
- **The little things.** Achievements, the Study Eagle mascot, light and dark themes, and installable as a phone app.

## Tech stack

| Layer         | Choice                                                                  |
| ------------- | ----------------------------------------------------------------------- |
| App           | React 19, TanStack Start (SSR) and Router, TanStack Query, Tailwind CSS |
| Data and auth | Supabase (Postgres, row-level security, email and Google sign-in)       |
| Email         | Resend                                                                  |
| Hosting       | Vercel, with Vercel Analytics and Speed Insights                        |
| Quality       | TypeScript, ESLint, Prettier, Vitest, GitHub Actions CI                 |

## Engineering notes

A few decisions worth calling out:

- **Privacy by design in the database.** Every table has row-level security. Reviews are read through a view that drops the author's ID, so they're public without being traceable, while each user can still edit and delete their own.
- **Trust without friction.** Sign-up is instant so anyone can try the site, but posting a review requires a confirmed email (Google sign-ins count automatically). The check is enforced in both the server function and the database policies, so it can't be bypassed through the API.
- **Abuse limits that live in Postgres.** Friend requests, password resets and verification emails are rate-limited with database-backed counters rather than per-instance memory, so the limits hold across serverless instances.
- **Performance.** Rating stats for every visible course load in one cached request instead of one per card (the home page used to make about 100). Course descriptions are code-split and lazy-loaded because they're about two-thirds of the catalogue's size.
- **SEO.** Each of the 2,491 course pages is server-rendered with its own title, description, canonical URL and social preview, and listed in a generated sitemap.
- **Honest data.** Ratings come only from real student reviews or Rate My Professors, never placeholders, and the site says so when a course has none yet.

Day-to-day running (migrations, moderation, reported reviews) is documented in [docs/operations.md](docs/operations.md).

## How it was built

I designed and run CourseFlix: the product, the data model, the privacy and security decisions, and what ships. I build with AI coding tools: the project started from a Lovable scaffold, and much of the implementation was written with Claude Code, which is why many commits are authored by Claude. I review, test and deploy every change.

## Project layout

```
src/
  routes/          file-based pages (home, course, list, friends, settings, ...)
  components/      UI: course cards, rails, hero, search palette, Study Eagle
  lib/             catalogue data, ratings, reviews, auth helpers, server functions
  integrations/    Supabase clients and generated types
supabase/migrations/  database schema, policies and functions
docs/              operations guide
```

## Data sources

Course information comes from the [UTM Academic Calendar](https://utm.calendar.utoronto.ca/) and instructors from the [UTM Timetable Builder](https://ttb.utoronto.ca/). Professor ratings are from [Rate My Professors](https://www.ratemyprofessors.com/), shown with a link to each profile and the date they were retrieved. CourseFlix is an independent student project, not affiliated with the University of Toronto or Netflix.

## License

Copyright (c) 2026 Abood Awaida. All rights reserved. See [LICENSE](LICENSE).
