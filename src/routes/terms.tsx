import { createFileRoute, Link } from "@tanstack/react-router";
import { TopNav } from "@/components/TopNav";
import { PageBackdrop } from "@/components/PageBackdrop";
import { siteUrl } from "@/lib/site";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use — Courseflix" },
      {
        name: "description",
        content: "The terms that apply when you use Courseflix.",
      },
    ],
    links: [{ rel: "canonical", href: siteUrl("/terms") }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="relative min-h-screen overflow-x-clip text-foreground">
      <PageBackdrop />
      <TopNav />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-10 md:px-10">
        <Link to="/" className="text-sm text-brand hover:underline">
          ← Back to Courseflix
        </Link>
        <h1 className="mt-6 font-mega text-[clamp(2.6rem,7vw,5.5rem)] font-black leading-[0.92] tracking-[-0.05em] animate-fade-in-up">
          Terms{" "}
          <span className="font-serif-accent text-gradient-brand pr-[0.05em] text-[1.12em] font-normal">
            of use.
          </span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: October 9, 2026</p>

        <div className="mt-8 space-y-8 text-sm leading-7 text-muted-foreground">
          <section>
            <h2 className="font-display text-2xl text-foreground">1. Agreement to these terms</h2>
            <p className="mt-2">
              These Terms of Use govern your access to and use of Courseflix, including its website,
              course catalogue, ratings, reviews, shortlists, recommendations, and Study Eagle
              features. By accessing Courseflix, you confirm that you have read and accepted these
              Terms. If you do not agree, please do not use the service.
            </p>
          </section>

          <section className="rounded-2xl border border-brand/30 bg-brand/5 p-5">
            <h2 className="font-display text-2xl text-foreground">
              2. Ratings, signals and student reviews
            </h2>
            <p className="mt-2">
              Course rating, difficulty, workload, and “would take again” values on Courseflix are
              calculated only from reviews submitted by students on Courseflix. A course with no
              reviews shows no score. Workload, essay, and project signals are derived from the
              official listed hours and course descriptions; they are not verified student
              experiences, promises, or statements by an instructor or the University of Toronto.
            </p>
            <p className="mt-2">
              Review-based results can change as more reviews are submitted, and a small number of
              reviews may not represent the experience of most students. Use ratings as guidance,
              not as a guarantee of your grade, workload, instructor, or experience.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">
              3. Course information and recommendations
            </h2>
            <p className="mt-2">
              Courseflix is an independent discovery tool. Course descriptions, prerequisites,
              credits, schedules, availability, images, tags, recommendations, summaries, and other
              catalogue information may be incomplete, outdated, or inaccurate. Always confirm
              enrolment requirements, dates, delivery details, and course availability with the
              official UTM Academic Calendar and the University of Toronto before making academic
              decisions.
            </p>
            <p className="mt-2">
              Courseflix does not provide academic, financial, career, or accessibility advice.
              Study Eagle summaries are automated, abbreviated interpretations for convenience and
              should not be treated as official course descriptions.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">
              4. Reviews and other user content
            </h2>
            <p className="mt-2">
              You are responsible for anything you submit, including ratings, comments, professor
              names, profile information, and shared content. You must be truthful, respectful, and
              authorized to submit it. Do not post personal information about another person,
              harassment, hateful or unlawful material, spam, impersonation, or content intended to
              manipulate ratings.
            </p>
            <p className="mt-2">
              By submitting content, you grant Courseflix a non-exclusive, worldwide, royalty-free
              licence to host, reproduce, display, and use it to operate and improve the service.
              You keep ownership of your content. We may remove content or restrict accounts that
              violate these Terms, applicable law, or the integrity of the service.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">
              5. Accounts and acceptable use
            </h2>
            <p className="mt-2">
              Keep your account credentials secure and provide accurate information. You may use
              Courseflix only for lawful, personal, non-commercial purposes. Do not scrape, reverse
              engineer, disrupt, overload, bypass access controls, create deceptive accounts, or use
              the service to invade another person’s privacy.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">6. Privacy</h2>
            <p className="mt-2">
              Courseflix may process account details, profile settings, shortlists, reviews, and
              usage information needed to provide the service. We do not sell personal information.
              We handle personal information in accordance with applicable Canadian privacy laws,
              which may include the federal Personal Information Protection and Electronic Documents
              Act (PIPEDA) and applicable Ontario law. Our{" "}
              <Link to="/privacy" className="text-brand hover:underline">
                Privacy Policy
              </Link>{" "}
              explains what we collect, what is public, and how to delete your account.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">
              7. Availability and disclaimers
            </h2>
            <p className="mt-2">
              Courseflix is provided on an “as is” and “as available” basis. We do not guarantee
              that the service, catalogue, ratings, reviews, recommendations, or saved data will
              always be available, accurate, secure, or error-free. We are not responsible for
              academic, financial, or other decisions made using Courseflix.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">8. Ontario law and disputes</h2>
            <p className="mt-2">
              These Terms are governed by the laws of the Province of Ontario and the federal laws
              of Canada applicable in Ontario, without regard to conflict-of-law rules. Subject to
              any mandatory rights you may have under applicable law, the courts located in Ontario
              have exclusive jurisdiction over disputes arising from these Terms or your use of
              Courseflix.
            </p>
            <p className="mt-2">
              Nothing in these Terms limits a right or remedy that cannot lawfully be excluded or
              limited under Ontario or Canadian law.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">9. Changes and termination</h2>
            <p className="mt-2">
              We may update these Terms as Courseflix changes. The updated version will be posted
              here with a new “Last updated” date. Continued use after an update means you accept
              the revised Terms. We may suspend or discontinue features or access at any time.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">10. Contact</h2>
            <p className="mt-2">
              Questions about these Terms can be sent through the contact method provided in the
              Help centre.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
