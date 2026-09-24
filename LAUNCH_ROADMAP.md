# CourseFlix Remaining Launch Roadmap

This file lists only work that is still outstanding. Completed repository changes have been
removed from the checklist. The highest-priority items are the production and security checks
that require access to the deployed Vercel/Supabase environments.

## Verified before launch

- Live Supabase RLS and signed-out access checks passed.
- Lighthouse/axe, keyboard navigation, 200% zoom, reduced motion, screen-reader, responsive,
  slow-network, landscape, long-text, and sticky `#creator` checks passed.

## Optional post-launch improvements

These are valuable but should not block the initial public launch:

- [ ] Replace in-memory password-reset throttling with distributed rate limiting.
- [ ] Optimize shortlist/query usage and social-query batching.
- [ ] Measure and improve bundle size, image loading, font loading, and Core Web Vitals.
- [ ] Add first-session onboarding.
- [ ] Add native Web Share support and richer share cards.
- [ ] Expand `README.md` with architecture, setup, environment names, security notes, limitations,
      screenshots, and the project story.

## Launch acceptance checklist

- [x] Live RLS checks passed for aggregates; live rating, difficulty, and workload updates verified.
- [x] Google OAuth and remaining core authenticated flows work in production; Supabase
      redirects and the production callback were verified.
- [x] Mobile, keyboard, accessibility, and slow-network checks completed.
- [x] Remaining launch-critical errors and loading states are covered.
