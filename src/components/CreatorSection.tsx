import { Github, Linkedin, Mail, Code2, Instagram } from "lucide-react";

export function CreatorSection() {
  return (
    <section id="creator" className="px-6 md:px-10 pb-20">
      <div className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-surface p-7 md:p-10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-brand text-4xl font-display text-primary-foreground brand-glow">
            AA
          </div>
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-brand">
              Created by
            </div>
            <h2 className="font-display text-4xl md:text-5xl mt-1 text-white font-bold tracking-tight">Abood Awaida</h2>
            <p className="mt-1 text-sm font-semibold text-neutral-400">
              Software developer · University of Toronto Mississauga
            </p>
            <p className="mt-4 text-sm leading-relaxed text-neutral-500">
              I built Courseflix after spending way too many hours digging through the academic
              calendar, Reddit threads and rating sites just to figure out which courses were
              actually worth taking. Picking courses should feel like picking what to watch
              tonight: fast, visual and honest. So I pulled the entire UTM catalog into one place,
              organised it by program, and opened it up so students can rate courses for each
              other instead of guessing.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <a
                href="mailto:abood.awaida@mail.utoronto.ca"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-brand-glow focus-visible:ring-2 focus-visible:ring-red-600/50"
              >
                <Mail className="h-4 w-4" /> Get in touch
              </a>
              <a
                href="https://github.com/aboodgitawaida"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-surface-2 px-5 py-2.5 text-sm font-semibold transition hover:border-brand/50 hover:shadow-lg hover:shadow-red-900/20 focus-visible:ring-2 focus-visible:ring-red-600/50"
              >
                <Github className="h-4 w-4" /> GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/abood-awaida-83b988417/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-surface-2 px-5 py-2.5 text-sm font-semibold transition hover:border-brand/50 hover:shadow-lg hover:shadow-red-900/20 focus-visible:ring-2 focus-visible:ring-red-600/50"
              >
                <Linkedin className="h-4 w-4" /> LinkedIn
              </a>
              <a
                href="https://www.instagram.com/abood.awaida/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-surface-2 px-5 py-2.5 text-sm font-semibold transition hover:border-brand/50 hover:shadow-lg hover:shadow-red-900/20 focus-visible:ring-2 focus-visible:ring-red-600/50"
              >
                <Instagram className="h-4 w-4" /> Instagram
              </a>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-surface-2 px-5 py-2.5 text-sm font-semibold text-neutral-400">
                <Code2 className="h-4 w-4" /> Student project · unofficial
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
