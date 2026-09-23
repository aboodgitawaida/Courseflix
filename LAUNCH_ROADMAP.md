# CourseFlix Remaining Launch Roadmap

This file lists only work that is still outstanding. Completed repository changes have been
removed from the checklist. The highest-priority items are the production and security checks
that require access to the deployed Vercel/Supabase environments.

## P0 — Must complete before public sharing

### 1. Complete the live Supabase RLS test matrix

Run with two accounts and a signed-out session. Confirm that the deployed policies, not just the
client filters, enforce these rules:

| Area | Required result |
| --- | --- |
| Profiles | Private profile data is not exposed to unauthorized users. |
| Friendships | Only request participants can accept, update, or delete a friendship. |
| Notifications | Users can read or mark only their own notifications. |
| Aggregates | Course rating statistics are readable but not writable. |

Also test unauthenticated access to each private data path and confirm expected errors are shown
without leaking sensitive details.

## P1 — Complete before or immediately after launch

### 2. Finish the verification baseline

- [ ] Run Lighthouse, axe, keyboard-only navigation, 200% zoom, reduced-motion, and screen-reader
      checks.
- [ ] Validate the deployed site on narrow mobile, tablet, desktop, slow network, and landscape
      layouts.

### 3. Finish accessibility and touch review

- [ ] Confirm long usernames/program names and sticky `#creator` navigation on physical devices.

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

- [ ] Live RLS checks pass for profiles, friendships, notifications, aggregates, and signed-out access.
- [ ] Password reset, OAuth, shortlist sharing, and core authenticated flows work in production.
- [ ] Social preview tested on the intended sharing surfaces.
- [ ] Mobile, keyboard, accessibility, and slow-network checks completed.
- [ ] Remaining launch-critical errors and loading states are covered.
