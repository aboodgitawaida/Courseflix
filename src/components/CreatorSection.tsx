import { Github, Linkedin, Mail, Code2, Instagram, ArrowUpRight } from "lucide-react";
import { useReveal } from "@/hooks/use-reveal";

const SOCIALS = [
  { href: "https://github.com/aboodgitawaida", label: "GitHub", icon: Github },
  {
    href: "https://www.linkedin.com/in/abood-awaida-83b988417/",
    label: "LinkedIn",
    icon: Linkedin,
  },
  { href: "https://www.instagram.com/abood.awaida/", label: "Instagram", icon: Instagram },
];

export function CreatorSection() {
  const ref = useReveal<HTMLElement>();

  // scroll-mt keeps the Creator link from landing under the sticky nav and filter chips (plus the 28px
  // the reveal animation lifts the section after the jump).
  return (
    <section ref={ref} id="creator" className="reveal scroll-mt-40 px-6 pb-24 md:px-10 md:pb-32">
      <div className="glass relative overflow-hidden rounded-[2rem] p-7 md:p-14">
        <div
          className="mesh-blob pointer-events-none -right-24 -top-24 h-80 w-80 bg-brand/25"
          aria-hidden="true"
        />
        <div
          className="mesh-blob pointer-events-none -bottom-32 left-1/3 h-72 w-72 bg-violet/15 [animation-delay:-8s]"
          aria-hidden="true"
        />

        <div className="relative grid gap-10 md:grid-cols-[auto_1fr] md:items-center md:gap-14">
          <div className="glow-ring mx-auto grid h-36 w-36 place-items-center rounded-[2rem] bg-gradient-to-br from-brand via-brand-glow to-brand-2 font-mega text-5xl font-black text-primary-foreground shadow-2xl shadow-brand/40 md:mx-0 md:h-48 md:w-48 md:text-6xl">
            AA
          </div>
          <div className="max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
              Made by a student, for students
            </div>
            <h2 className="mt-3 font-mega text-4xl font-extrabold leading-[0.95] md:text-6xl">
              Abood{" "}
              <span className="font-serif-accent text-gradient-brand text-[1.15em]">Awaida</span>
            </h2>
            <p className="mt-2 text-sm font-semibold text-muted-foreground">
              Software developer · University of Toronto Mississauga
            </p>
            <p className="mt-6 text-base leading-relaxed text-foreground/75">
              I built Courseflix after spending way too many hours digging through the academic
              calendar, Reddit threads and rating sites just to figure out which courses were
              actually worth taking. Picking courses should feel like picking what to watch tonight:
              fast, visual and honest. So I pulled the entire UTM catalog into one place, organised
              it by program, and opened it up so students can rate courses for each other instead of
              guessing.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              <a
                href="mailto:abood.awaida@mail.utoronto.ca"
                className="shine inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-brand/30 transition hover:bg-brand-glow focus-visible:ring-2 focus-visible:ring-red-600/50"
              >
                <Mail className="h-4 w-4" /> Get in touch
              </a>
              {SOCIALS.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-surface-2/70 px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-brand/60 hover:shadow-lg hover:shadow-red-900/20 focus-visible:ring-2 focus-visible:ring-red-600/50"
                >
                  <Icon className="h-4 w-4" /> {label}
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-50 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                </a>
              ))}
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-neutral-400">
                <Code2 className="h-4 w-4" /> Student project · unofficial
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
