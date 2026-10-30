import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { FEATURES } from "@/lib/features";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Link2, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { TopNav } from "@/components/TopNav";
import { PageBackdrop } from "@/components/PageBackdrop";
import { ShareStoryButton } from "@/components/ShareStoryButton";
import { useAuth } from "@/hooks/use-auth";
import { useSound } from "@/hooks/use-sound";
import { getCourse, shortCode } from "@/lib/courses";
import { useBirdCourses, useMyRatings, useShortlist } from "@/lib/ratings";
import { pageHead, siteUrl } from "@/lib/site";
import { renderWrappedStory } from "@/lib/story-card";
import { parseShortlistCodesWithStats, parseShortlistSearch } from "@/lib/validation";
import { buildWrapped, type Wrapped } from "@/lib/wrapped";

export const Route = createFileRoute("/wrapped")({
  beforeLoad: () => {
    if (!FEATURES.wrapped) throw notFound();
  },
  validateSearch: parseShortlistSearch,
  head: () =>
    pageHead({
      title: "Course Wrapped",
      description:
        "Your UTM course lineup, Wrapped: your boss fights, bird courses and course persona. Make yours and share it.",
      path: "/wrapped",
    }),
  component: WrappedPage,
});

function WrappedPage() {
  const { ids } = Route.useSearch();
  const shared = Boolean(ids);
  const { signedIn, user, loading: authLoading } = useAuth();
  const { data: saved = [], isLoading: savedLoading } = useShortlist();
  const { data: birdMentions } = useBirdCourses();
  const { data: myReviews = [] } = useMyRatings(shared ? undefined : user?.id);

  const codes = useMemo(() => {
    const raw = shared ? ids!.split(",") : saved;
    return parseShortlistCodesWithStats(raw, (code) => Boolean(getCourse(code))).codes;
  }, [shared, ids, saved]);
  const wrapped = useMemo(() => buildWrapped(codes, birdMentions), [codes, birdMentions]);

  let body: ReactNode;
  if (!shared && (authLoading || (signedIn && savedLoading))) {
    body = (
      <div className="mx-auto aspect-[9/16] w-full max-w-sm animate-pulse rounded-[2rem] bg-white/[0.05]" />
    );
  } else if (!shared && !signedIn) {
    body = (
      <EmptyCard
        title="Your Wrapped needs a lineup"
        text="Sign in and save a few courses. We'll turn them into your persona, your boss fights and your bird-course count."
        cta={{ to: "/auth", label: "Sign in", redirect: "/wrapped" }}
      />
    );
  } else if (!wrapped) {
    body = (
      <EmptyCard
        title={shared ? "This Wrapped link is empty" : "Save a course to get your Wrapped"}
        text={
          shared
            ? "None of the courses in this link exist any more. Make your own instead."
            : "Hit “Add to shortlist” on a few courses you're thinking about, then come back."
        }
        cta={{ to: "/", label: "Browse courses" }}
      />
    );
  } else {
    body = (
      <WrappedStory
        wrapped={wrapped}
        shared={shared}
        reviewCount={shared ? null : myReviews.length}
      />
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-clip text-foreground">
      <PageBackdrop />
      <TopNav />
      <main className="relative mx-auto max-w-5xl px-4 pb-28 pt-8 md:px-10 md:pt-12">
        <div className="mb-6 text-center">
          <div className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
            <Sparkles className="h-3 w-3" /> {shared ? "A friend's Wrapped" : "Course Wrapped"}
          </div>
        </div>
        {body}
      </main>
    </div>
  );
}

function EmptyCard({
  title,
  text,
  cta,
}: {
  title: string;
  text: string;
  cta: { to: "/" | "/auth"; label: string; redirect?: string };
}) {
  return (
    <div className="glass mx-auto max-w-md rounded-[2rem] p-8 text-center">
      <div className="text-5xl" aria-hidden="true">
        🎬
      </div>
      <h1 className="mt-4 font-mega text-2xl font-extrabold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{text}</p>
      <Link
        to={cta.to}
        search={cta.redirect ? { redirect: cta.redirect } : undefined}
        className="shine mt-6 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-brand-glow"
      >
        {cta.label}
      </Link>
    </div>
  );
}

const SLIDE_MS = 6500;

type Slide = { key: string; tone: string; content: ReactNode };

function WrappedStory({
  wrapped,
  shared,
  reviewCount,
}: {
  wrapped: Wrapped;
  shared: boolean;
  reviewCount: number | null;
}) {
  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(true);
  const { play } = useSound();
  const slides = useMemo(
    () => buildSlides(wrapped, shared, reviewCount),
    [wrapped, shared, reviewCount],
  );
  const last = slides.length - 1;
  const current = Math.min(index, last);

  useEffect(() => {
    if (typeof window.matchMedia === "function") {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setAuto(false);
    }
  }, []);

  const go = useCallback(
    (to: number) => {
      const next = Math.max(0, Math.min(last, to));
      setIndex(next);
      if (next !== current) play("tick");
    },
    [current, last, play],
  );

  useEffect(() => {
    if (!auto || current >= last) return;
    const t = window.setTimeout(() => setIndex((i) => Math.min(last, i + 1)), SLIDE_MS);
    return () => window.clearTimeout(t);
  }, [auto, current, last]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setAuto(false);
        go(current + 1);
      } else if (e.key === "ArrowLeft") {
        setAuto(false);
        go(current - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, go]);

  const slide = slides[current]!;
  const onLast = current === last;

  return (
    <div className="mx-auto w-full max-w-sm">
      <div
        className={`relative aspect-[9/16] w-full overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl shadow-black/60 ${slide.tone}`}
      >
        <div className="absolute inset-x-4 top-4 z-20 flex gap-1.5" aria-hidden="true">
          {slides.map((s, i) => (
            <span key={s.key} className="h-1 flex-1 overflow-hidden rounded-full bg-white/25">
              <span
                key={`${s.key}-${current}-${auto}`}
                className={`block h-full origin-left rounded-full bg-white ${
                  i < current
                    ? ""
                    : i === current && auto && !onLast
                      ? "wrapped-progress"
                      : i === current
                        ? ""
                        : "scale-x-0"
                }`}
                style={
                  i === current && auto && !onLast
                    ? { animationDuration: `${SLIDE_MS}ms` }
                    : undefined
                }
              />
            </span>
          ))}
        </div>

        <div
          key={slide.key}
          className="animate-fade-in-up relative z-10 flex h-full flex-col justify-center px-7 pb-10 pt-14 text-white"
          aria-live="polite"
        >
          {slide.content}
        </div>

        {!onLast && (
          <>
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => {
                setAuto(false);
                go(current - 1);
              }}
              className="absolute inset-y-0 left-0 z-10 w-1/3 cursor-w-resize focus-visible:outline-none"
            />
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => {
                setAuto(false);
                go(current + 1);
              }}
              className="absolute inset-y-0 right-0 z-10 w-2/3 cursor-e-resize focus-visible:outline-none"
            />
          </>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            setAuto(false);
            go(current - 1);
          }}
          disabled={current === 0}
          className="glass grid h-11 w-11 place-items-center rounded-full transition hover:border-brand/50 disabled:opacity-40"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-xs font-semibold tabular-nums text-muted-foreground">
          {current + 1} / {slides.length}
        </span>
        {onLast ? (
          <button
            type="button"
            onClick={() => {
              setAuto(true);
              go(0);
            }}
            className="glass grid h-11 w-11 place-items-center rounded-full transition hover:border-brand/50"
            aria-label="Replay"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setAuto(false);
              go(current + 1);
            }}
            className="glass grid h-11 w-11 place-items-center rounded-full transition hover:border-brand/50"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

function Kicker({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/60">
      {children}
    </p>
  );
}

function Big({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 font-mega text-[5.5rem] font-black leading-[0.85] tracking-[-0.06em]">
      {children}
    </p>
  );
}

function buildSlides(w: Wrapped, shared: boolean, reviewCount: number | null): Slide[] {
  const you = shared ? "They" : "You";
  const your = shared ? "Their" : "Your";
  const slides: Slide[] = [
    {
      key: "intro",
      tone: "bg-[radial-gradient(120%_80%_at_0%_0%,#e50914_0%,#3b0a0e_45%,#060607_100%)]",
      content: (
        <>
          <Kicker>Courseflix presents</Kicker>
          <h1 className="mt-4 font-mega text-5xl font-black leading-[0.9] tracking-[-0.05em]">
            {shared ? "A friend's" : "Your"} UTM lineup,{" "}
            <span className="font-serif-accent text-[1.15em] font-normal italic">Wrapped.</span>
          </h1>
          <p className="mt-6 text-sm text-white/70">
            Tap to see what it says about {shared ? "them" : "you"}.
          </p>
        </>
      ),
    },
    {
      key: "count",
      tone: "bg-[radial-gradient(120%_80%_at_100%_0%,#4f46e5_0%,#1a1440_50%,#060607_100%)]",
      content: (
        <>
          <Kicker>{you} saved</Kicker>
          <Big>{w.courses.length}</Big>
          <p className="mt-2 font-mega text-2xl font-extrabold">
            course{w.courses.length === 1 ? "" : "s"}
          </p>
          <p className="mt-6 text-base text-white/80">
            Across {w.subjects.length} subject{w.subjects.length === 1 ? "" : "s"}
            {w.topSubject && w.subjects.length > 1 ? (
              <>
                , mostly <strong className="text-white">{w.topSubject}</strong>.
              </>
            ) : (
              "."
            )}{" "}
            That's {w.credits} credit{w.credits === 1 ? "" : "s"} of ambition.
          </p>
          <ul className="mt-5 flex flex-wrap gap-1.5">
            {w.courses.slice(0, 10).map((c) => (
              <li
                key={c.code}
                className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold"
              >
                {shortCode(c.code)}
              </li>
            ))}
          </ul>
        </>
      ),
    },
    w.hardest
      ? {
          key: "boss",
          tone: "bg-[radial-gradient(120%_80%_at_50%_0%,#b91c1c_0%,#2a0606_55%,#060607_100%)]",
          content: (
            <>
              <Kicker>{your} toughest pick</Kicker>
              <div className="mt-4 text-6xl" aria-hidden="true">
                💀
              </div>
              <p className="mt-4 font-mega text-5xl font-black tracking-[-0.05em]">
                {shortCode(w.hardest.course.code)}
              </p>
              <p className="mt-1 text-sm text-white/70">{w.hardest.course.title}</p>
              <p className="mt-6 text-base text-white/85">
                <strong className="text-white">{w.hardest.percent}%</strong> of {w.hardest.votes}{" "}
                r/UTM opinions call it hard.
                {w.bosses.length > 1 &&
                  ` And it's one of ${w.bosses.length} boss fights on the list.`}
              </p>
            </>
          ),
        }
      : {
          key: "boss",
          tone: "bg-[radial-gradient(120%_80%_at_50%_0%,#0f766e_0%,#062421_55%,#060607_100%)]",
          content: (
            <>
              <Kicker>Boss fights</Kicker>
              <Big>0</Big>
              <p className="mt-6 text-base text-white/85">
                r/UTM doesn't call a single one of {shared ? "their" : "your"} picks hard.
                Suspicious.
              </p>
            </>
          ),
        },
    {
      key: "birds",
      tone: "bg-[radial-gradient(120%_80%_at_0%_100%,#c9a84c_0%,#2b220b_50%,#060607_100%)]",
      content: (
        <>
          <Kicker>Bird count</Kicker>
          <Big>{w.birds.length}</Big>
          <p className="mt-2 font-mega text-2xl font-extrabold">
            bird course{w.birds.length === 1 ? "" : "s"} 🪶
          </p>
          <p className="mt-6 text-base text-white/85">
            {w.birds.length === 0
              ? `Zero. ${you} came here to learn, apparently.`
              : w.birds.length === 1
                ? `${shortCode(w.birds[0]!.code)} is the one r/UTM and reviewers call easy. Smart.`
                : `${w.birds
                    .slice(0, 3)
                    .map((c) => shortCode(c.code))
                    .join(
                      ", ",
                    )}${w.birds.length > 3 ? " and more" : ""}. Strategic GPA protection.`}
          </p>
        </>
      ),
    },
  ];

  if (reviewCount !== null) {
    slides.push({
      key: "reviews",
      tone: "bg-[radial-gradient(120%_80%_at_100%_100%,#22c55e_0%,#062b14_50%,#060607_100%)]",
      content: (
        <>
          <Kicker>Reviews written</Kicker>
          <Big>{reviewCount}</Big>
          <p className="mt-6 text-base text-white/85">
            {reviewCount === 0
              ? "Your take on a course you've finished could save someone's GPA. Drop one after this."
              : reviewCount === 1
                ? "One review that someone picking courses will thank you for."
                : `${reviewCount} reviews. You're carrying the campus.`}
          </p>
        </>
      ),
    });
  }

  slides.push({
    key: "persona",
    tone: "bg-[radial-gradient(130%_90%_at_50%_30%,#ff5a36_0%,#7a0b12_40%,#060607_100%)]",
    content: (
      <div className="text-center">
        <Kicker>{shared ? "They're" : "You're"}</Kicker>
        <div className="mt-6 text-8xl" aria-hidden="true">
          {w.persona.emoji}
        </div>
        <h2 className="mt-6 font-mega text-4xl font-black leading-[0.95] tracking-[-0.05em]">
          {w.persona.name}
        </h2>
        <p className="mt-4 font-serif-accent text-2xl italic text-white/85">{w.persona.tagline}</p>
      </div>
    ),
  });

  slides.push({
    key: "share",
    tone: "bg-[radial-gradient(120%_80%_at_0%_0%,#e50914_0%,#1a0507_50%,#060607_100%)]",
    content: <ShareSlide w={w} shared={shared} />,
  });
  return slides;
}

function ShareSlide({ w, shared }: { w: Wrapped; shared: boolean }) {
  const shareUrl = siteUrl(
    `/wrapped?ids=${encodeURIComponent(w.courses.map((c) => c.code).join(","))}`,
  );

  function copy() {
    if (!navigator.clipboard) {
      toast.error("Copying isn't supported in this browser.");
      return;
    }
    navigator.clipboard.writeText(shareUrl).then(
      () => toast.success("Wrapped link copied"),
      () => toast.error("Could not copy. Check your browser permissions."),
    );
  }

  return (
    <div className="relative z-20 text-center">
      <div className="text-6xl" aria-hidden="true">
        {w.persona.emoji}
      </div>
      <p className="mt-3 font-mega text-2xl font-black tracking-[-0.04em]">{w.persona.name}</p>
      <dl className="mt-6 grid grid-cols-2 gap-2 text-left">
        {[
          [w.courses.length, "courses"],
          [w.subjects.length, "subjects"],
          [w.birds.length, "bird courses"],
          [w.bosses.length, "boss fights"],
        ].map(([value, label]) => (
          <div key={label} className="rounded-2xl bg-white/[0.08] px-4 py-3">
            <dd className="font-mega text-3xl font-black">{value}</dd>
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
              {label}
            </dt>
          </div>
        ))}
      </dl>
      <div className="mt-6 flex flex-col items-center gap-2">
        {shared ? (
          <Link
            to="/list"
            className="shine inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:bg-white/90"
          >
            <Sparkles className="h-4 w-4" /> Get your own Wrapped
          </Link>
        ) : (
          <>
            <ShareStoryButton
              label="Share to your story"
              fileName="courseflix-wrapped.png"
              render={() =>
                renderWrappedStory({
                  persona: w.persona,
                  courseCount: w.courses.length,
                  subjectCount: w.subjects.length,
                  birdCount: w.birds.length,
                  bossCount: w.bosses.length,
                  hardest: w.hardest
                    ? { code: shortCode(w.hardest.course.code), percent: w.hardest.percent }
                    : null,
                  topSubject: w.topSubject,
                })
              }
            />
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold transition hover:bg-white/15"
            >
              <Link2 className="h-4 w-4" /> Copy link
            </button>
          </>
        )}
      </div>
    </div>
  );
}
