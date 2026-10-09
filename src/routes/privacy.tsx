import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { TopNav } from "@/components/TopNav";
import { PageBackdrop } from "@/components/PageBackdrop";
import { CREATOR_EMAIL } from "@/lib/links";
import { siteUrl } from "@/lib/site";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Courseflix" },
      {
        name: "description",
        content:
          "What Courseflix collects, what is public, who processes it, and how to delete your account.",
      },
    ],
    links: [{ rel: "canonical", href: siteUrl("/privacy") }],
  }),
  component: PrivacyPage,
});

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-2xl text-foreground">{title}</h2>
      <div className="mt-2 space-y-2">{children}</div>
    </section>
  );
}

function PrivacyPage() {
  const mail = (
    <a href={`mailto:${CREATOR_EMAIL}`} className="text-brand hover:underline">
      {CREATOR_EMAIL}
    </a>
  );

  return (
    <div className="relative min-h-screen overflow-x-clip text-foreground">
      <PageBackdrop />
      <TopNav />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-10 md:px-10">
        <Link to="/" className="text-sm text-brand hover:underline">
          ← Back to Courseflix
        </Link>
        <h1 className="mt-6 font-mega text-[clamp(2.6rem,7vw,5.5rem)] font-black leading-[0.92] tracking-[-0.05em] animate-fade-in-up">
          Privacy{" "}
          <span className="font-serif-accent text-gradient-brand pr-[0.05em] text-[1.12em] font-normal">
            policy.
          </span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: October 9, 2026</p>

        <div className="mt-8 space-y-8 text-sm leading-7 text-muted-foreground">
          <Section title="The short version">
            <p>
              You can browse every course without an account. If you sign up, we keep what you need
              to use the site: your email, your profile, the courses you save, your reviews and your
              friends. Reviews are shown without your name. We don&apos;t sell your information,
              show ads, or use advertising trackers. You can delete your account and its data at any
              time from Settings.
            </p>
          </Section>

          <Section title="1. Who we are">
            <p>
              Courseflix is an independent student project for University of Toronto Mississauga
              students. It is not affiliated with the University of Toronto. Questions about this
              policy or your information can be sent to {mail}.
            </p>
          </Section>

          <Section title="2. What we collect">
            <p>
              <strong className="text-foreground">Account.</strong> Your email address and password
              (stored only as a secure hash by our authentication provider). If you sign in with
              Google, we receive your email address and basic account details from Google.
            </p>
            <p>
              <strong className="text-foreground">Profile.</strong> Your display name, username,
              avatar, program, year of study, and whether your shortlist is private. All of these
              are optional except a display name, which defaults to “UTM student”.
            </p>
            <p>
              <strong className="text-foreground">Activity.</strong> The courses you save to your
              shortlist, the ratings and comments you submit, friend requests and friendships,
              notifications, and the achievements you unlock.
            </p>
            <p>
              <strong className="text-foreground">Password resets.</strong> To stop abuse, we keep a
              one-way hash of the email address and IP address for each reset request. These are not
              readable as your email or IP and are deleted after about a day.
            </p>
            <p>
              <strong className="text-foreground">Usage statistics.</strong> We use Vercel Web
              Analytics and Speed Insights to count page views and measure loading speed. They do
              not use cookies and do not identify you across other websites.
            </p>
          </Section>

          <Section title="3. What other people can see">
            <p>
              <strong className="text-foreground">Your profile</strong> (display name, username,
              avatar, program and year) can be seen by anyone, including people who aren&apos;t
              signed in, and can be found through friend search.
            </p>
            <p>
              <strong className="text-foreground">Your shortlist</strong> can be seen by other
              signed-in students unless you make it private in Settings; a private shortlist is
              visible only to your friends. Friends are notified when you save a course.
            </p>
            <p>
              <strong className="text-foreground">Your reviews</strong> are public but are shown
              without your name, username or profile. Anything you write in a comment, including a
              professor&apos;s name, is public, so don&apos;t include details that identify you or
              anyone else.
            </p>
            <p>
              <strong className="text-foreground">Your achievements</strong> are visible to you and
              your friends.
            </p>
          </Section>

          <Section title="4. What stays on your device">
            <p>
              Courseflix uses your browser&apos;s local storage, not cookies, to keep you signed in
              and to remember preferences such as your selected program, theme, sound setting, which
              subjects you browse most (used to suggest a program), dismissed prompts, and the link
              or campaign that first brought you to the site. This information stays in your browser
              and is not sent to us. Clearing your site data removes it.
            </p>
          </Section>

          <Section title="5. How we use it">
            <p>
              Only to run Courseflix: to sign you in, show your shortlist and profile, calculate
              course ratings from student reviews, power friends and notifications, send
              password-reset emails, prevent abuse, and understand which pages are used so we can
              improve the site. We don&apos;t sell personal information or use it for advertising.
            </p>
          </Section>

          <Section title="6. Services that process your information">
            <p>We rely on a small number of providers to run the site:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Supabase: database and sign-in.</li>
              <li>Vercel: website hosting, analytics and performance measurement.</li>
              <li>Resend: sending password-reset emails.</li>
              <li>Google: optional “Sign in with Google”.</li>
              <li>
                Google Fonts: the site&apos;s fonts are loaded from Google, which receives your IP
                address when they load.
              </li>
            </ul>
            <p>
              These providers may store or process information outside Canada, including in the
              United States, where it may be subject to local laws.
            </p>
          </Section>

          <Section title="7. How long we keep it and how to delete it">
            <p>
              We keep your account information until you delete your account. You can delete it at
              any time from Settings; this permanently removes your account, profile, shortlist,
              reviews, friendships, notifications and achievements. Copies may remain in our
              providers&apos; backups for a limited time before they are overwritten.
            </p>
            <p>
              You can also edit your profile, delete individual reviews, remove saved courses, and
              make your shortlist private at any time.
            </p>
          </Section>

          <Section title="8. Your rights">
            <p>
              Under Canadian privacy law, including the Personal Information Protection and
              Electronic Documents Act (PIPEDA), you can ask to access the personal information we
              hold about you, ask us to correct it, or withdraw consent by deleting your account.
              Email {mail} and we&apos;ll respond within 30 days. If you&apos;re not satisfied with
              our response, you can contact the Office of the Privacy Commissioner of Canada.
            </p>
          </Section>

          <Section title="9. Security">
            <p>
              Data is sent over encrypted connections, and database rules limit each account to its
              own private information. No service is perfectly secure; if we learn of a breach that
              affects you, we will notify you as required by law.
            </p>
          </Section>

          <Section title="10. Changes">
            <p>
              If we change this policy, we&apos;ll post the new version here with a new “Last
              updated” date. See also our{" "}
              <Link to="/terms" className="text-brand hover:underline">
                Terms of Use
              </Link>
              .
            </p>
          </Section>
        </div>
      </main>
    </div>
  );
}
