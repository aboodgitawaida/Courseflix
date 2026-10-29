# Security

If you find a vulnerability in CourseFlix, please email **abood.awaida@mail.utoronto.ca**
rather than opening a public issue. I'll reply within a few days.

Please include what you found, how to reproduce it, and what an attacker could do with it.
Don't access other users' data or degrade the site while testing.

How the site protects data:

- Every table has Postgres row-level security; reviews are read through a view that hides
  the author's ID.
- Secrets (service-role key, email and AI keys) live only in server-side environment
  variables, never in the browser bundle or the repository.
- Strict security headers (CSP, HSTS, frame denial) are set in `vercel.json`.
