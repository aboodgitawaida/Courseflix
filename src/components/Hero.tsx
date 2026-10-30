import { Link } from "@tanstack/react-router";
import { SUBJECTS, type Course } from "@/lib/courses";
import { ArrowRight, Search } from "lucide-react";
import { useCourseUI } from "@/hooks/use-course-ui";
import { prefersReducedMotion } from "@/hooks/use-reveal";
import { HeroDeck } from "./HeroDeck";
import { ADVERTISED_COURSE_COUNT } from "@/lib/site";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const HEADLINE: Array<{ text: string; accent?: boolean }> = [
  { text: "Pick" },
  { text: "courses" },
  { text: "like" },
  { text: "you" },
  { text: "pick" },
  { text: "what", accent: true },
  { text: "to", accent: true },
  { text: "watch.", accent: true },
];

function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [n, setN] = useState(value);
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    let frame = 0;
    const start = performance.now();
    const duration = 1600;
    const tick = (t: number) => {
      const p = Math.min((t - start) / duration, 1);
      setN(Math.round(value * (1 - Math.pow(1 - p, 4))));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    setN(0);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return (
    <span className="tabular-nums">
      {n}
      {suffix}
    </span>
  );
}

function Magnetic({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className={`inline-flex transition-transform duration-300 ease-out ${className}`}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.18;
        const y = (e.clientY - r.top - r.height / 2) * 0.3;
        ref.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }}
      onPointerLeave={() => {
        if (ref.current) ref.current.style.transform = "";
      }}
    >
      {children}
    </div>
  );
}

export function Hero({ deck, major }: { deck: Course[]; major: string }) {
  const { setSearchOpen } = useCourseUI();
  const [index, setIndex] = useState(0);
  const deckKey = deck.map((c) => c.code).join();
  // A new program means a new deck: start it from the top.
  useEffect(() => setIndex(0), [deckKey]);
  const feat = deck[index % deck.length]!;

  return (
    <section className="relative isolate overflow-hidden">
      {/* Ambient mesh */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="mesh-blob -left-40 -top-40 h-[520px] w-[520px] bg-brand/25" />
        <div className="mesh-blob right-[-10%] top-[10%] h-[460px] w-[460px] bg-brand-2/15 [animation-delay:-6s]" />
        <div className="mesh-blob bottom-[-20%] left-[30%] h-[380px] w-[380px] bg-violet/10 [animation-delay:-12s]" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(rgb(255 255 255 / 0.04) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.04) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse at 50% 30%, #000 20%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(ellipse at 50% 30%, #000 20%, transparent 70%)",
          }}
        />
      </div>

      {/* Giant outlined code */}
      <div
        aria-hidden="true"
        className="text-outline pointer-events-none absolute -bottom-10 right-[-2%] -z-10 hidden select-none font-mega text-[16vw] font-black leading-none md:block"
      >
        <span key={feat.code} className="inline-block animate-fade-in-up">
          {feat.code}
        </span>
      </div>

      <div className="relative grid items-center gap-8 px-6 pb-10 pt-6 md:gap-12 md:px-10 md:pb-20 md:pt-10 lg:min-h-[calc(100svh-5rem)] lg:grid-cols-[1.25fr_1fr] lg:gap-8 lg:pb-24">
        <div>
          <div className="glass mb-5 inline-flex md:mb-7 items-center gap-2.5 rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/80 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
            </span>
            Now streaming · {major}
          </div>

          <h1 className="font-mega text-[clamp(2.5rem,5.4vw,5.6rem)] font-extrabold leading-[0.95] tracking-[-0.05em]">
            <span className="sr-only">Pick courses like you pick what to watch.</span>
            <span aria-hidden="true">
              {HEADLINE.map((w, i) => (
                <span key={i} className="word-mask mr-[0.22em]">
                  <span className="word-in" style={{ animationDelay: `${0.15 + i * 0.07}s` }}>
                    {w.accent ? (
                      <span className="font-serif-accent text-gradient-brand pr-[0.06em] text-[1.12em]">
                        {w.text}
                      </span>
                    ) : (
                      w.text
                    )}
                  </span>
                </span>
              ))}
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-base md:mt-7 leading-relaxed text-muted-foreground md:text-lg animate-fade-in-up [animation-delay:0.6s] opacity-0">
            Every UTM course in one feed, sorted into rows for your program. Student ratings,
            bird-course signals and prereq trees — no Reddit archaeology required.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3 md:mt-9 animate-fade-in-up [animation-delay:0.75s] opacity-0">
            <Magnetic>
              <Link
                to="/course/$code"
                params={{ code: feat.code }}
                className="shine group inline-flex items-center gap-2.5 rounded-full bg-brand py-3.5 pl-6 pr-3.5 text-sm font-semibold text-primary-foreground shadow-2xl shadow-brand/40 transition hover:bg-brand-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 active:scale-[0.98]"
              >
                Start with {feat.code}
                <span className="grid h-7 w-7 place-items-center rounded-full bg-white/20 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-rotate-45">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </Magnetic>
            <button
              onClick={() => setSearchOpen(true)}
              className="glass inline-flex items-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold transition hover:border-brand/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 active:scale-[0.98]"
            >
              <Search className="h-4 w-4" /> Search all courses
              <kbd className="ml-1 hidden rounded-md border sm:inline border-white/[0.12] px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                ⌘K
              </kbd>
            </button>
          </div>

          <dl className="mt-12 hidden max-w-lg sm:grid grid-cols-3 gap-6 border-t border-white/[0.08] pt-6 animate-fade-in-up [animation-delay:0.9s] opacity-0">
            <div>
              <dt className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Courses
              </dt>
              <dd className="mt-1 font-mega text-2xl font-bold md:text-3xl">
                <CountUp value={ADVERTISED_COURSE_COUNT} suffix="+" />
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Subjects
              </dt>
              <dd className="mt-1 font-mega text-2xl font-bold md:text-3xl">
                <CountUp value={SUBJECTS.length} />
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Cost
              </dt>
              <dd className="mt-1 font-mega text-2xl font-bold md:text-3xl">
                $<CountUp value={0} />
              </dd>
            </div>
          </dl>
        </div>

        {/* Featured course deck */}
        <div className="animate-fade-in-up [animation-delay:0.4s] opacity-0">
          <HeroDeck courses={deck} index={index} onIndexChange={setIndex} />
        </div>
      </div>

      <div
        aria-hidden="true"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Scroll</span>
        <span className="relative h-10 w-px overflow-hidden bg-white/10">
          <span className="scroll-cue-dot absolute inset-x-0 top-0 h-1/2 bg-brand" />
        </span>
      </div>
    </section>
  );
}
