import { Link, useNavigate } from "@tanstack/react-router";
import { COURSES, SUBJECTS, type Course } from "@/lib/courses";
import { ArrowRight, ArrowUpRight, Plus, Check, Search } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useCourseUI } from "@/hooks/use-course-ui";
import { prefersReducedMotion } from "@/hooks/use-reveal";
import { useShortlist, useToggleShortlist } from "@/lib/ratings";
import { useCourseDescription } from "@/lib/course-description";
import { FEATURED_DESCRIPTIONS } from "@/lib/featured-descriptions";
import { FALLBACK_SUBJECT_IMAGE, getCourseImage } from "@/lib/subject-images";
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

export function Hero({ featured, major }: { featured: Course; major: string }) {
  const feat = featured;
  const navigate = useNavigate();
  const { signedIn } = useAuth();
  const { setSearchOpen } = useCourseUI();
  const { data: saved = [] } = useShortlist();
  const toggle = useToggleShortlist();
  const inList = saved.includes(feat.code);
  const bundledDescription = FEATURED_DESCRIPTIONS[feat.code];
  // Only fall back to the full description file if this course isn't bundled.
  const loadedDescription = useCourseDescription(bundledDescription ? undefined : feat.code);
  const description = bundledDescription ?? loadedDescription;
  const heroImage = (subject: string) => getCourseImage(subject).replace("w=400", "w=900");
  const [imageSrc, setImageSrc] = useState(() => heroImage(feat.subject));
  const backSubjects = SUBJECTS.filter((s) => s !== feat.subject).slice(0, 2);

  useEffect(() => {
    setImageSrc(heroImage(feat.subject));
  }, [feat.subject]);

  async function onToggleList() {
    if (!signedIn) {
      navigate({ to: "/auth", search: { redirect: `/course/${feat.code}` } });
      return;
    }

    try {
      await toggle.mutateAsync({ code: feat.code, saved: inList });
      toast.success(
        inList
          ? `${feat.code} removed from your shortlist`
          : `${feat.code} added to your shortlist`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update shortlist");
    }
  }

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
        className="text-outline pointer-events-none absolute -bottom-6 right-[-2%] -z-10 select-none font-mega text-[16vw] font-black leading-none md:-bottom-10"
      >
        {feat.code}
      </div>

      <div className="relative grid min-h-[calc(100svh-5rem)] items-center gap-12 px-6 pb-20 pt-10 md:px-10 lg:grid-cols-[1.25fr_1fr] lg:gap-8 lg:pb-24">
        <div>
          <div className="glass mb-7 inline-flex items-center gap-2.5 rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/80 animate-fade-in-up">
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

          <p className="mt-7 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg animate-fade-in-up [animation-delay:0.6s] opacity-0">
            Every UTM course in one feed, sorted into rows for your program. Student ratings,
            bird-course signals and prereq trees — no Reddit archaeology required.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3 animate-fade-in-up [animation-delay:0.75s] opacity-0">
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
              <kbd className="ml-1 rounded-md border border-white/[0.12] px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                ⌘K
              </kbd>
            </button>
          </div>

          <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-white/[0.08] pt-6 animate-fade-in-up [animation-delay:0.9s] opacity-0">
            <div>
              <dt className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Courses
              </dt>
              <dd className="mt-1 font-mega text-2xl font-bold md:text-3xl">
                <CountUp value={COURSES.length} />
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

        {/* Featured poster stack */}
        <div className="relative mx-auto w-full max-w-[420px] animate-fade-in-up [animation-delay:0.4s] opacity-0 lg:mr-0">
          <div aria-hidden="true" className="absolute inset-0 hidden sm:block">
            {backSubjects.map((s, i) => (
              <div
                key={s}
                className={`absolute inset-0 overflow-hidden rounded-[28px] border border-white/[0.08] bg-surface-2 ${
                  i === 0
                    ? "float-slower -rotate-[8deg] -translate-x-10 translate-y-4"
                    : "float-slow rotate-[7deg] translate-x-10 translate-y-6"
                }`}
              >
                <img
                  src={getCourseImage(s)}
                  alt=""
                  className="h-full w-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
              </div>
            ))}
          </div>

          <div className="course-card-art glow-ring relative overflow-hidden rounded-[28px] bg-surface shadow-2xl shadow-black/60">
            <div className="relative aspect-[4/5]">
              <img
                src={imageSrc}
                alt=""
                aria-hidden="true"
                loading="eager"
                decoding="async"
                onError={() => setImageSrc(FALLBACK_SUBJECT_IMAGE)}
                className="hero-course-image absolute inset-0 h-full w-full object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />
              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-brand px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-foreground">
                Top pick
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6">
                <div className="font-mega text-4xl font-black leading-none tracking-tighter text-white md:text-5xl">
                  {feat.code}
                </div>
                <div className="mt-2 text-lg font-semibold leading-snug text-white">
                  {feat.title}
                </div>
                {/* min-h reserves both lines so the card doesn't jump when the description loads. */}
                <p className="mt-2 line-clamp-2 min-h-[2lh] text-sm leading-relaxed text-white/80">
                  {description}
                </p>
                <div className="mt-5 flex items-center gap-2">
                  <Link
                    to="/course/$code"
                    params={{ code: feat.code }}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90 active:scale-[0.98]"
                  >
                    Course info <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => void onToggleList()}
                    disabled={toggle.isPending}
                    aria-pressed={inList}
                    aria-label={
                      inList ? `Remove ${feat.code} from my list` : `Add ${feat.code} to my list`
                    }
                    className="grid h-10 w-10 place-items-center rounded-full border border-white/30 bg-black/45 text-white backdrop-blur transition hover:border-white active:scale-[0.95] disabled:opacity-60"
                  >
                    {inList ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
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
