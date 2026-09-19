# CourseFlix Launch Readiness Roadmap

I reviewed the repository structure, route configuration, core UI components, Supabase integrations, authentication flows, metadata, and the main data-access modules. The application already has a strong foundation: TanStack Start/Router, React 19, Tailwind, Radix UI, Supabase authentication, React Query, course rails, shortlist sharing, ratings, friends, comparison, notifications, and route-level metadata.

The highest-priority work is not a major rewrite. It is consistency, security validation, mobile polish, production metadata, error/loading quality, and removing a few launch-visible rough edges.

> Note: GitHub code-search responses are capped and may be incomplete. Additional results can be inspected through the repository’s [GitHub code search](https://github.com/aboodgitawaida/courseflix-utm/search?q=&type=code).

---

## Current architecture observed

```text
src/
  components/
    CourseCard.tsx              Interactive Netflix-style course card
    CourseRail.tsx              Horizontal course carousel
    Hero.tsx                    Featured course hero section
    TopNav.tsx                  Global navigation and search entry point
    CompareDrawer.tsx           Course comparison UI
    CoursePreviewModal.tsx      Preview modal
    CommandPalette.tsx          Global course search
    BrandIntro.tsx              Intro animation
    ui/                         Radix/shadcn-style primitives

  hooks/
    use-auth.ts                 Supabase session state
    use-course-ui.tsx           Preview, comparison, and search state
    use-major.ts                Major preference state
    use-theme.ts                Theme state
    use-sound.ts                Interaction sound state

  lib/
    courses.ts                  Course data, rails, matching, badges
    ratings.ts                  Rating and shortlist queries/mutations
    social.ts                   Friends, notifications, profile search
    profile.ts                  Profile data and updates
    reset-password.ts           Server-side password reset email flow
    error-page.ts               Server fallback rendering

  integrations/supabase/
    client.ts                   Supabase browser client
    auth-attacher.ts            Auth middleware for server functions
    types.ts                    Generated database types

  routes/
    __root.tsx                  Global layout/error boundary
    index.tsx                   Home/discovery experience
    course.$code.tsx            Dynamic course details
    list.tsx                    Shortlist and shared shortlist
    auth.tsx                    Sign-in/sign-up flow
    auth.reset-password.tsx     Password recovery
    friends.tsx                 Social discovery
    settings.tsx                Profile/preferences
    help.tsx                    FAQ/help centre
```

---

# Phase 1: Critical Polish & Cleanup

**Goal:** Remove launch blockers, fix trust-impacting inconsistencies, validate security assumptions, and establish a reliable baseline before visual refinement.

## 1.1 Fix production-domain and metadata inconsistencies

**Priority: P0**

Several routes use inconsistent domains:

- `src/routes/index.tsx` uses `https://courseflix.ca`
- `src/routes/list.tsx` uses `https://courseflix-utm.lovable.app`
- `src/routes/course.$code.tsx` uses `https://courseflix-utm.lovable.app`
- Authentication reset redirects to `https://www.courseflix.ca`

### Actions

1. Choose one canonical public domain:
   - `https://courseflix.ca`, or
   - `https://www.courseflix.ca`
2. Create a shared site configuration value rather than hardcoding URLs in routes.
3. Ensure the canonical domain is used consistently for:
   - `canonical`
   - `og:url`
   - password reset redirects
   - shortlist share URLs
   - OAuth callback URLs
   - sitemap and robots files
4. Confirm the deployed domain is configured in Supabase Auth redirect settings.
5. Add an `og:image` and `twitter:image` to the public pages.

### Why this matters

Domain inconsistency can cause:

- Broken authentication redirects
- Duplicate SEO URLs
- Incorrect Reddit/iMessage previews
- Resume links pointing to a different application origin
- Social share links that look untrustworthy

---

## 1.2 Audit Supabase Row Level Security policies

**Priority: P0**

The frontend correctly relies on Supabase for operations such as:

- Shortlist reads/writes in `src/lib/ratings.ts`
- Ratings in `src/lib/ratings.ts`
- Friendships and friend requests in `src/lib/social.ts`
- Profile access in `src/lib/profile.ts`
- Notifications in `src/lib/social.ts`

However, the repository code alone cannot prove that database policies are safe. The application is making broad queries such as:

- `from("friendships").select("*")`
- `from("shortlists").select("course_code")`
- `from("notifications").select("*")`
- `from("profiles").select(...)`

### Actions

Verify policies for each table:

| Table | Required policy behavior |
|---|---|
| `profiles` | Public fields only; private profile data restricted |
| `shortlists` | Users can read/write their own list; friend/public access must be intentional |
| `course_ratings` | Anyone may read approved ratings; users can insert/update only their own rating |
| `friendships` | Users can only create requests involving themselves; only participants can accept/delete |
| `notifications` | Users can read and mark only their own notifications |
| `course_rating_stats` | Read-only access to aggregated data |
| Any admin/service table | Never exposed to the browser client |

Specifically test:

- A user attempting to update another user’s friendship
- A user attempting to delete another user’s shortlist item
- A user querying a private profile’s shortlist
- An unauthenticated user querying private data
- A user modifying another person’s rating
- A user marking another user’s notification as read

### Important implementation concern

`useRespondToRequest()` and `useRemoveFriend()` use only `.eq("id", id)` on the client. This is acceptable only if database policies enforce participant ownership. The client must not be treated as a security boundary.

---

## 1.3 Tighten input validation and query safety

**Priority: P0**

### Areas to audit

#### Profile search

`src/lib/social.ts` builds an `ilike` expression from raw user input:

```text
.or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
```

Actions:

- Escape `%`, `_`, commas, parentheses, and other PostgREST filter characters.
- Normalize and cap query length.
- Debounce search input.
- Consider a server-side search function if more complex filtering is needed.
- Avoid returning unnecessary profile fields.

#### Ratings

`src/lib/ratings.ts` should validate:

- Rating range
- Difficulty range
- Workload range
- Course code format
- Professor name length
- Comment length
- Empty string normalization

Use shared Zod schemas for both client feedback and server/database boundaries.

#### Settings

`src/routes/settings.tsx` currently normalizes usernames manually. Add explicit validation for:

- Maximum display-name length
- Username length and allowed characters
- Valid academic year values
- Valid major IDs
- Avatar ID membership in the known avatar list

#### Shared shortlist URLs

`src/routes/list.tsx` accepts comma-separated course IDs from the URL. Add:

- Maximum number of IDs
- Course-code format validation
- Duplicate removal
- Invalid-course handling
- URL length consideration
- Clear messaging when some requested courses do not exist

#### Password reset

`src/lib/reset-password.ts` currently returns errors such as `"User not found"`. Use a generic response such as:

> “If an account exists for that email, a reset message has been sent.”

This avoids account enumeration.

---

## 1.4 Remove debugging artifacts and operational leakage

**Priority: P0**

`src/lib/reset-password.ts` contains production logging for:

- Presence of service-role key
- Presence of Resend key
- Supabase URL
- Email address
- Generated-link flow
- Email provider result

Actions:

1. Remove all environment diagnostics from production logs.
2. Never log email addresses or password-reset details.
3. Never log service-role configuration values, even indirectly.
4. Replace raw `console.error` calls with a small structured logging abstraction.
5. Ensure error responses do not expose provider internals.
6. Add rate limiting or abuse protection to password reset requests.
7. Confirm the Supabase service-role key is available only to server-side code.

---

## 1.5 Fix obvious launch-visible UX defects

**Priority: P1**

### Hero “My list” button

`src/components/Hero.tsx` renders a “My list” button but does not currently connect it to shortlist behavior.

Actions:

- Make it use the same shortlist mutation as `CourseCard`.
- Redirect unauthenticated users to authentication with a safe return path.
- Show saved/unsaved state.
- Provide a toast or inline confirmation.

### Help copy typo

`src/routes/help.tsx` contains:

> “same day..”

Correct the punctuation and perform a copy review across all public-facing text.

### Error boundaries

`src/routes/__root.tsx` has a root error component, and server-level fallback handling exists in `src/start.ts` and `src/server.ts`. Improve this by:

- Adding route-specific error states where useful
- Showing a user-friendly error ID or support reference
- Providing retry behavior for query failures
- Avoiding duplicate error logging from both component and server layers
- Supporting a “Report a problem” link

---

## 1.6 Establish a verification baseline

**Priority: P1**

The package scripts currently include development, build, lint, formatting, and preview commands, but no obvious automated test suite.

Before further polish:

1. Run:
   ```bash
   npm run lint
   npm run build
   ```
2. Add a type-check script if it is not already covered by the build.
3. Add at least smoke tests for:
   - Home route rendering
   - Course route with valid and invalid codes
   - Authentication redirect handling
   - Shortlist parsing
   - Rating validation
4. Add an accessibility test pass using:
   - axe DevTools
   - Lighthouse
   - keyboard-only navigation
5. Create a release checklist and test against production, not only local development.

---

# Phase 2: UI/UX Elevation

**Goal:** Make CourseFlix feel deliberately designed rather than simply functional—cinematic, premium, responsive, and easy to use.

## 2.1 Define and enforce a visual system

**Priority: P1**

The existing visual direction is strong:

- Dark cinematic background
- Red brand color
- Display typography
- Gradient course art
- Glass-like navigation
- Horizontal content rails
- Hover elevation

This is already visible in `src/styles.css`, `Hero.tsx`, `CourseCard.tsx`, and `CourseRail.tsx`.

### Actions

Create a concise design system covering:

- Type scale
- Spacing scale
- Border radius rules
- Surface hierarchy
- Text hierarchy
- Motion timing
- Focus states
- Interactive states
- Mobile breakpoints

Avoid allowing every component to invent slightly different values for:

- Border opacity
- Rounded corners
- Hover brightness
- Button height
- Card padding
- Focus rings

This will create the “Apple/Google” precision the application currently lacks.

---

## 2.2 Improve the cinematic hero experience

**Priority: P1**

`src/components/Hero.tsx` already establishes the featured-course experience with gradients, atmospheric glows, typography, and metadata.

Enhancements:

1. Add a more deliberate entrance sequence:
   - Eyebrow label
   - Course code
   - Title
   - Description
   - Rating metadata
   - CTA buttons
2. Use staggered transitions rather than random delays.
3. Add a subtle poster/art treatment or richer course-specific visual.
4. Use a restrained parallax or gradient movement effect.
5. Respect `prefers-reduced-motion`.
6. Ensure the hero is not excessively tall on mobile.
7. Make the primary and secondary CTA hierarchy clearer.
8. Add a visible “Browse all courses” path for first-time users.

### Important cleanup

`CourseRail.tsx` currently uses:

```text
const animationDelay = Math.random() * 0.2;
```

Replace random animation timing with deterministic timing based on rail index. Random render-time animation can cause inconsistent visual output and hydration mismatch risk.

---

## 2.3 Elevate course cards

**Priority: P1**

`src/components/CourseCard.tsx` already supports:

- Keyboard activation
- Hover elevation
- Compare action
- Shortlist action
- Rating
- Match score
- Badges
- Gradient art

Recommended improvements:

1. Add a clear selected/saved state that is visible without hovering.
2. Keep action buttons visible on touch devices.
3. Add a subtle image/art scale effect on hover.
4. Add a stronger but restrained focus state.
5. Improve title truncation and provide a tooltip or expanded view for long titles.
6. Ensure hover controls do not disappear for keyboard users.
7. Add a pressed state on mobile.
8. Consider changing the outer `article role="button"` to a more semantic composition:
   - A real button for preview
   - Separate buttons for shortlist and compare
9. Ensure nested interactive elements do not create confusing screen-reader behavior.
10. Add an explicit “Open course preview” accessible name.

### Mobile behavior

On touchscreens, hover-only affordances do not exist. The compare and shortlist controls should either:

- Always be visible on mobile, or
- Be available inside the preview modal and card action menu.

---

## 2.4 Make rails responsive and discoverable

**Priority: P1**

`src/components/CourseRail.tsx` uses horizontal scrolling with desktop arrow controls.

Enhancements:

- Add a visible scroll gradient or “more” affordance.
- Add `aria-label` and scroll position semantics.
- Make arrow buttons disabled at the beginning/end.
- Support keyboard scrolling.
- Ensure the first card is not hidden under the navigation.
- Tune card widths for:
  - Small mobile
  - Large mobile
  - Tablet
  - Laptop
  - Ultrawide screens
- Test with browser zoom at 200%.
- Test landscape mobile orientation.
- Avoid rails becoming excessively long for users with motor or cognitive accessibility needs.

---

## 2.5 Improve navigation and mobile information architecture

**Priority: P1**

`src/components/TopNav.tsx` has a good desktop structure, but the mobile header is compressed and hides several destinations.

Review:

- Browse
- Shortlist
- Search
- Friends
- Settings
- Help
- Authentication state
- Program selection

Actions:

1. Add a mobile menu or bottom navigation.
2. Ensure Friends, Settings, and Help are reachable without opening the profile menu.
3. Add current-route styling using `aria-current`.
4. Make the brand wordmark link have an accessible label.
5. Ensure the mobile search button has a visible focus state.
6. Test long usernames and long program names.
7. Ensure sticky navigation does not cover anchor targets such as `#creator`.

---

## 2.6 Improve loading and empty states

**Priority: P1**

Some loading states already exist:

- `CourseCardSkeleton`
- Course rail loading behavior
- Friend shortlist loading text
- Notification loading text
- Password reset loading state

Standardize these across the application.

### Add skeletons for

- Course details rating statistics
- Rating lists
- Friends list
- Profile/settings content
- Notifications
- Shortlist loading
- Search results

### Add polished empty states for

- No selected major
- Empty shortlist
- Empty friends list
- No search results
- No notifications
- No course ratings
- Private friend shortlist
- Invalid shared shortlist

Each empty state should include:

- Short explanation
- One clear next action
- Optional visual/icon
- Friendly but concise copy

---

## 2.7 Accessibility audit

**Priority: P1**

Existing positive signals include:

- `aria-label`s on icon-only controls
- Keyboard handling for cards
- Screen-reader-only labels
- Focus rings in several components
- Semantic `details`/`summary` in the help page
- Alt text on avatars and course imagery

Audit and improve:

1. Color contrast for:
   - `muted-foreground`
   - Red text on dark backgrounds
   - Glass controls
   - Badge text
2. Keyboard focus visibility across every interactive element.
3. Focus trapping and focus restoration in:
   - `CoursePreviewModal`
   - `CommandPalette`
   - `CompareDrawer`
   - Dropdown menus
4. Screen-reader announcements for:
   - Added/removed shortlist items
   - Comparison changes
   - Loading completion
   - Search result count
   - Form submission errors
5. Avoid using `role="button"` when a real `<button>` is practical.
6. Add labels and descriptions to rating fields.
7. Ensure error messages are associated with form inputs.
8. Test reduced motion and reduced transparency.
9. Test with:
   - Keyboard only
   - VoiceOver/NVDA
   - 200% zoom
   - High contrast settings
   - Mobile screen readers

---

# Phase 3: Launch Readiness & Enhancements

**Goal:** Make the application shareable, measurable, discoverable, fast, and impressive as a public product and portfolio piece.

## 3.1 Implement a centralized SEO and social metadata strategy

**Priority: P0**

The routes already define route-level titles and descriptions, especially:

- `src/routes/index.tsx`
- `src/routes/course.$code.tsx`
- `src/routes/list.tsx`
- `src/routes/auth.tsx`
- `src/routes/friends.tsx`
- `src/routes/help.tsx`

The next step is making metadata complete and consistent.

### Global metadata

In `src/routes/__root.tsx`, establish:

- Site title template
- Default description
- `og:site_name`
- Canonical origin
- Default `og:image`
- Twitter card defaults
- Theme color
- Favicon and app icons
- `robots` behavior

### Home page

Use:

- `og:type=website`
- Canonical URL
- Branded social image
- Consistent description
- Twitter title/description/image

### Course page

For `src/routes/course.$code.tsx`, use dynamic:

- Title
- Description
- Canonical URL
- `og:type=article`
- Course-specific social image
- Course code/title in the preview
- Optional structured data

### Structured data

Consider adding JSON-LD for:

- WebSite
- SearchAction
- EducationalOrganization or Course where appropriate

Do not claim properties that are not accurate or verifiable.

### Create launch assets

Produce a branded 1200×630 social image that works for:

- Reddit
- LinkedIn
- iMessage
- Discord
- X/Twitter

The image should communicate:

- CourseFlix name
- “Discover UTM courses like Netflix”
- UTM context
- Strong red/black visual identity

---

## 3.2 Add analytics and UTM attribution

**Priority: P1**

Use a lightweight privacy-conscious analytics approach.

### Capture on first landing

Store these parameters in session or local storage:

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`
- Referrer
- Landing path
- First-visit timestamp

Do not store personally identifiable information in analytics events.

### Suggested launch links

Examples:

```text
Reddit:
https://courseflix.ca/?utm_source=reddit&utm_medium=social&utm_campaign=launch

Resume:
https://courseflix.ca/?utm_source=resume&utm_medium=portfolio&utm_campaign=courseflix

Friends:
https://courseflix.ca/?utm_source=direct&utm_medium=referral&utm_campaign=friend-share
```

### Events worth tracking

- Landing page viewed
- Major selected
- Search opened
- Search submitted
- Course preview opened
- Course detail viewed
- Course shortlisted
- Comparison started
- Shortlist shared
- Sign-up started
- Sign-up completed
- Rating submitted
- Friend request sent

For each event, define:

- Event name
- Required properties
- Privacy constraints
- Success criteria
- Whether it is essential or optional

Avoid tracking full email addresses, raw comments, or private friend data.

---

## 3.3 Performance optimization

**Priority: P1**

### React Query and data access

`CourseCard.tsx` calls `useShortlist()` for each card. React Query will deduplicate identical keys, but this still creates unnecessary hook usage throughout the card tree.

Refactor toward:

- A higher-level shortlist context or data hook
- Passing saved-course state into cards
- One shortlist query per page/session
- Targeted cache updates after mutations

### Social queries

`src/lib/social.ts` currently performs multiple follow-up profile queries. Review:

- Query batching
- Selected fields
- Cache lifetimes
- Refetch intervals
- Pagination for notifications
- Search debounce
- Avoiding unnecessary refetch after every mutation

### Course data

`src/lib/courses.ts` appears to contain a large static course dataset. Verify:

- Whether it is unnecessarily included in every route bundle
- Whether route-level code splitting is effective
- Whether large derived arrays are recomputed on render
- Whether `useMemo` is needed for expensive filtering

### Visual performance

- Avoid excessive blurred layers on low-powered mobile devices.
- Respect reduced-motion and reduced-transparency preferences.
- Lazy-load below-the-fold imagery.
- Preload only the hero-critical assets.
- Use explicit image dimensions to prevent layout shifts.
- Verify font loading and fallbacks.
- Test with throttled CPU and slow 3G.

### Performance targets

Set measurable targets:

- Lighthouse Performance: 90+
- Lighthouse Accessibility: 95+
- Largest Contentful Paint: under 2.5 seconds
- Cumulative Layout Shift: under 0.1
- Interaction to Next Paint: under 200 milliseconds where practical

---

## 3.4 Global error and reliability strategy

**Priority: P1**

Existing server fallback logic in:

- `src/start.ts`
- `src/server.ts`
- `src/lib/error-page.ts`

and the root client boundary in:

- `src/routes/__root.tsx`

provide a good foundation.

Add:

1. A consistent error taxonomy:
   - Authentication error
   - Validation error
   - Permission error
   - Network error
   - Database error
   - Unexpected application error
2. Retry behavior for safe reads.
3. Inline fallback UI for individual panels rather than blanking the entire page.
4. Error logging with environment-aware redaction.
5. A user-facing support path from the error screen.
6. Offline or degraded-network messaging.
7. Mutation rollback or clear pending state for:
   - Shortlist actions
   - Friend requests
   - Rating submissions
   - Profile updates

---

## 3.5 Portfolio and recruiter readiness

**Priority: P1**

Add a lightweight public-facing project story:

- What problem CourseFlix solves
- Why Netflix-style discovery was chosen
- How the recommendation rails work
- How Supabase authentication and RLS protect user data
- How shortlist sharing works
- How course comparisons work
- Accessibility and responsive design decisions
- Performance and analytics decisions

The repository README should include:

- Live demo link
- Screenshots or GIF
- Feature list
- Architecture overview
- Stack
- Local setup instructions
- Environment variable names without secrets
- Security notes
- Known limitations
- Future improvements

This helps recruiters evaluate engineering judgment, not just visual polish.

---

## 3.6 High-impact, low-effort feature enhancements

### Feature 1: Smart first-session onboarding

**Impact: High — Effort: Low**

The home page already asks users to choose a major through `MajorPicker`.

Polish this into a short onboarding flow:

1. Select program/major
2. Explain what CourseFlix does
3. Show a few recommended rails
4. Offer “Start browsing” and “Skip for now”

Persist completion locally and allow users to change the program later.

This improves first-time activation and gives the product a clearer story when shared publicly.

---

### Feature 2: Intelligent empty and zero-result states

**Impact: High — Effort: Low**

Enhance empty states with contextual actions:

- Empty shortlist: “Browse popular bird courses”
- No search results: “Try a course code, subject, or keyword”
- No friends: “Find classmates by username”
- No ratings: “Be the first student to rate this course”
- Invalid shared list: show valid courses and explain skipped entries

This makes the product feel intentional even when users have no data.

---

### Feature 3: Shareable course and shortlist cards

**Impact: High — Effort: Medium-Low**

Extend sharing beyond a plain URL:

- Native Web Share API on mobile
- Copy link fallback
- Branded preview image
- Share text containing course name and rating
- Dedicated tracking parameters
- Clear success state after copying

This directly supports the Reddit, friends, and resume launch goals.

---

# Recommended execution order

## First release block

1. Choose and standardize the canonical domain.
2. Audit Supabase RLS policies.
3. Remove password-reset logging and account-enumeration responses.
4. Fix the Hero “My list” button.
5. Validate all user inputs and shared shortlist parameters.
6. Run lint/build/type verification.
7. Add route-level error and loading states where currently missing.

## Second release block

8. Centralize SEO, canonical, OG, and Twitter metadata.
9. Create and wire branded social preview assets.
10. Improve mobile navigation and touch interactions.
11. Replace random animation timing.
12. Improve course-card focus, saved states, and mobile controls.
13. Complete the accessibility audit.

## Third release block

14. Add UTM capture and privacy-conscious analytics.
15. Optimize shortlist/query usage.
16. Add onboarding.
17. Add intelligent empty states.
18. Improve sharing.
19. Update the README with architecture and portfolio documentation.
20. Perform final production QA across mobile, tablet, desktop, slow network, keyboard navigation, and authenticated/unauthenticated flows.

## Launch acceptance criteria

Before posting publicly, CourseFlix should satisfy:

- One canonical production domain everywhere
- No debug or sensitive logs
- Verified RLS policies
- No obvious dead buttons or broken flows
- Complete OG/Twitter metadata with a tested preview image
- Mobile navigation usable at narrow widths
- Keyboard navigation works throughout the core experience
- Loading, error, and empty states are present
- Lint and production build pass
- Password reset and OAuth redirects work on the production domain
- UTM attribution is captured and tested
- README communicates the product and engineering decisions clearly
