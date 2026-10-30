import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { FEATURES } from "@/lib/features";
import { useEffect, useMemo, useState } from "react";
import { Check, Flame, Link2, Lock, MessageCircle, Trophy } from "lucide-react";
import { toast } from "sonner";
import { TopNav } from "@/components/TopNav";
import { PageBackdrop } from "@/components/PageBackdrop";
import { ShareStoryButton } from "@/components/ShareStoryButton";
import { Burst } from "@/components/Burst";
import { useAuth } from "@/hooks/use-auth";
import { useSound } from "@/hooks/use-sound";
import {
  bracketPhase,
  buildBracket,
  champion,
  formatTimeLeft,
  roundWindow,
  ROUND_NAMES,
  type BracketConfig,
  type BracketPhase,
  type Entrant,
  type Matchup,
} from "@/lib/bracket";
import {
  useBracketConfig,
  useBracketTallies,
  useCastBracketVote,
  useMyBracketVotes,
  type MyVote,
} from "@/lib/bracket-data";
import { getCourse, shortCode } from "@/lib/courses";
import { getRedditSignal } from "@/lib/reddit-signals";
import { pageHead, siteUrl } from "@/lib/site";
import { renderBracketStory } from "@/lib/story-card";

export const Route = createFileRoute("/bracket")({
  beforeLoad: () => {
    if (!FEATURES.bracket) throw notFound();
  },
  head: () =>
    pageHead({
      title: "Hardest Course at UTM: The Bracket",
      description:
        "16 courses r/UTM calls the hardest. Four knockout rounds. UTM students vote on which one is the worst. Cast your vote.",
      path: "/bracket",
    }),
  component: BracketPage,
});

function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(t);
  }, [intervalMs]);
  return now;
}

function BracketPage() {
  const { data: config, isLoading, error } = useBracketConfig();

  return (
    <div className="relative min-h-screen overflow-x-clip text-foreground">
      <PageBackdrop />
      <TopNav />
      <main className="relative mx-auto max-w-6xl px-4 pb-28 pt-8 md:px-10 md:pt-12">
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-10 w-48 animate-pulse rounded-full bg-white/[0.06]" />
            <div className="h-24 w-full max-w-xl animate-pulse rounded-3xl bg-white/[0.06]" />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="h-40 animate-pulse rounded-3xl bg-white/[0.05]" />
              <div className="h-40 animate-pulse rounded-3xl bg-white/[0.05]" />
            </div>
          </div>
        ) : error || !config ? (
          <ComingSoon />
        ) : (
          <LiveBracket config={config} />
        )}
      </main>
    </div>
  );
}

function ComingSoon() {
  return (
    <div className="glass mx-auto max-w-lg rounded-[2rem] p-8 text-center">
      <div className="text-6xl" aria-hidden="true">
        🥊
      </div>
      <h1 className="mt-4 font-mega text-3xl font-black tracking-tight">The bracket is coming.</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        16 of UTM's most feared courses, four rounds, one champion. Check back soon.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-brand-glow"
      >
        Browse courses
      </Link>
    </div>
  );
}

function LiveBracket({ config }: { config: BracketConfig }) {
  const now = useNow();
  const phase = bracketPhase(config, now);
  const { user, signedIn } = useAuth();
  const { data: tallies = [] } = useBracketTallies(config.id, phase.kind === "open");
  const { data: myVotes = [] } = useMyBracketVotes(user?.id, config.id);
  const cast = useCastBracketVote(user?.id, config.id);

  const rounds = useMemo(() => buildBracket(config, tallies, now), [config, tallies, now]);
  const winner = champion(rounds);
  const openRound = phase.kind === "open" ? phase.round : null;
  const featured = openRound ? rounds[openRound - 1]! : phase.kind === "upcoming" ? rounds[0]! : [];
  const totalVotes = tallies.reduce((sum, t) => sum + t.votes, 0);

  const pickFor = (m: Matchup) =>
    myVotes.find((v) => v.round === m.round && v.matchup === m.index)?.course_code;

  async function vote(v: MyVote) {
    try {
      await cast.mutateAsync(v);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save your vote");
    }
  }

  const storyRound = openRound ?? 1;
  const story = () =>
    renderBracketStory({
      title: config.title,
      roundName: ROUND_NAMES[storyRound - 1]!,
      champion: winner ? shortCode(winner.code) : null,
      matchups: rounds[storyRound - 1]!.flatMap((m) =>
        m.a && m.b
          ? [
              {
                a: shortCode(m.a.code),
                b: shortCode(m.b.code),
                pctA: m.votesA + m.votesB > 0 ? pct(m.votesA, m.votesB) : null,
              },
            ]
          : [],
      ),
    });

  return (
    <>
      <Header config={config} phase={phase} totalVotes={totalVotes} now={now} />

      {winner && <Champion entrant={winner} />}

      {featured.length > 0 && (
        <section className="mt-10" aria-labelledby="featured-round">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 id="featured-round" className="font-mega text-2xl font-extrabold md:text-3xl">
              {phase.kind === "upcoming" ? "First-round matchups" : ROUND_NAMES[openRound! - 1]}
            </h2>
            {phase.kind === "open" && !signedIn && (
              <Link
                to="/auth"
                search={{ redirect: "/bracket" }}
                className="text-sm font-semibold text-brand underline-offset-4 hover:underline"
              >
                Sign in to vote →
              </Link>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {phase.kind === "upcoming"
              ? "Voting opens soon. Pick your poison."
              : "Tap the course you think is harder. You can change your pick until the round closes."}
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {featured.map((m) => (
              <MatchupCard
                key={`${m.round}-${m.index}`}
                matchup={m}
                pick={pickFor(m)}
                canVote={phase.kind === "open"}
                signedIn={signedIn}
                busy={cast.isPending}
                onVote={(code) =>
                  void vote({ round: m.round, matchup: m.index, course_code: code })
                }
              />
            ))}
          </div>
        </section>
      )}

      <section className="mt-8 flex flex-wrap gap-2" aria-label="Share the bracket">
        <ShareStoryButton
          render={story}
          fileName="courseflix-bracket.png"
          label={winner ? "Share the result" : "Share to your story"}
        />
        <CopyLinkButton />
        <a
          href={`https://www.reddit.com/r/UTM/submit?title=${encodeURIComponent(
            winner
              ? `UTM voted ${shortCode(winner.code)} the hardest course`
              : "Vote: what's the hardest course at UTM?",
          )}&url=${encodeURIComponent(siteUrl("/bracket"))}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-surface-2 px-5 py-2.5 text-sm font-semibold transition hover:border-brand/50"
        >
          <MessageCircle className="h-4 w-4" /> Post to r/UTM
        </a>
      </section>

      <section className="mt-14" aria-labelledby="full-bracket">
        <h2 id="full-bracket" className="font-mega text-2xl font-extrabold md:text-3xl">
          The full bracket
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Seeded by how often r/UTM calls each course hard (at most two per subject). Ties go to the
          higher seed.
        </p>
        <div className="mt-6 grid gap-8 lg:grid-cols-4 lg:gap-4">
          {rounds.map((matchups, r) => {
            const { opens } = roundWindow(config, r + 1);
            return (
              <div key={r} className="flex flex-col">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {ROUND_NAMES[r]}
                  {matchups[0]?.status === "waiting" && (
                    <span className="ml-2 normal-case tracking-normal text-muted-foreground/70">
                      opens{" "}
                      {opens.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                  )}
                  {matchups[0]?.status === "open" && (
                    <span className="ml-2 rounded-full bg-brand px-2 py-0.5 text-[10px] tracking-normal text-primary-foreground">
                      LIVE
                    </span>
                  )}
                </h3>
                <div className="mt-3 grid flex-1 content-around gap-3">
                  {matchups.map((m) => (
                    <TreeMatch key={m.index} matchup={m} pick={pickFor(m)} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

function Header({
  config,
  phase,
  totalVotes,
  now,
}: {
  config: BracketConfig;
  phase: BracketPhase;
  totalVotes: number;
  now: Date;
}) {
  const words = config.title.split(" ");
  const last = words.pop();
  return (
    <header>
      <div className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
        {phase.kind === "open" ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
            </span>
            Live · {ROUND_NAMES[phase.round - 1]} · closes in{" "}
            {formatTimeLeft(phase.closesAt.getTime() - now.getTime())}
          </>
        ) : phase.kind === "upcoming" ? (
          <>
            <Flame className="h-3 w-3" /> Starts in{" "}
            {formatTimeLeft(phase.opensAt.getTime() - now.getTime())}
          </>
        ) : (
          <>
            <Trophy className="h-3 w-3" /> Final results
          </>
        )}
      </div>
      <h1 className="mt-5 font-mega text-[clamp(2.4rem,7vw,5.5rem)] font-black leading-[0.92] tracking-[-0.05em]">
        {words.join(" ")}{" "}
        <span className="font-serif-accent text-gradient-brand pr-[0.05em] text-[1.12em] font-normal">
          {last}.
        </span>
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
        The 16 courses r/UTM complains about most. Four knockout rounds. Students vote, one course
        walks away with the title nobody wants.
        {totalVotes > 0 && (
          <strong className="text-foreground">
            {" "}
            {totalVotes.toLocaleString()} vote{totalVotes === 1 ? "" : "s"} so far.
          </strong>
        )}
      </p>
    </header>
  );
}

function Champion({ entrant }: { entrant: Entrant }) {
  const course = getCourse(entrant.code);
  return (
    <section className="relative mt-10 overflow-hidden rounded-[2rem] border border-brand/40 bg-gradient-to-br from-brand/25 via-brand/5 to-transparent p-8 text-center md:p-12">
      <div className="text-7xl md:text-8xl" aria-hidden="true">
        🏆
      </div>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
        UTM has spoken
      </p>
      <h2 className="mt-2 font-mega text-5xl font-black tracking-[-0.05em] md:text-7xl">
        {shortCode(entrant.code)}
      </h2>
      {course && <p className="mt-2 text-muted-foreground">{course.title}</p>}
      <p className="mt-4 font-serif-accent text-2xl italic">is the hardest course at UTM.</p>
      <Link
        to="/course/$code"
        params={{ code: entrant.code }}
        className="mt-6 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-brand-glow"
      >
        Read the reviews
      </Link>
    </section>
  );
}

function pct(a: number, b: number) {
  return a + b === 0 ? 50 : Math.round((100 * a) / (a + b));
}

function MatchupCard({
  matchup,
  pick,
  canVote,
  signedIn,
  busy,
  onVote,
}: {
  matchup: Matchup;
  pick: string | undefined;
  canVote: boolean;
  signedIn: boolean;
  busy: boolean;
  onVote: (code: string) => void;
}) {
  const { a, b, votesA, votesB } = matchup;
  const showResults = Boolean(pick) || matchup.status === "closed";
  const total = votesA + votesB;
  const pctA = pct(votesA, votesB);

  return (
    <div className="glass relative overflow-hidden rounded-3xl p-2">
      <div className="relative grid grid-cols-2 gap-2">
        {a && (
          <Side
            entrant={a}
            votes={votesA}
            share={pctA}
            picked={pick === a.code}
            showResults={showResults}
            canVote={canVote}
            signedIn={signedIn}
            busy={busy}
            onVote={onVote}
          />
        )}
        {b && (
          <Side
            entrant={b}
            votes={votesB}
            share={100 - pctA}
            picked={pick === b.code}
            showResults={showResults}
            canVote={canVote}
            signedIn={signedIn}
            busy={busy}
            onVote={onVote}
          />
        )}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 z-10 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-background font-serif-accent text-lg italic text-brand shadow-xl"
        >
          vs
        </span>
      </div>
      {showResults && (
        <p className="px-2 pb-1 pt-2 text-center text-[11px] text-muted-foreground">
          {total} vote{total === 1 ? "" : "s"}
          {pick && canVote && " · tap the other side to switch"}
        </p>
      )}
    </div>
  );
}

function Side({
  entrant,
  votes,
  share,
  picked,
  showResults,
  canVote,
  signedIn,
  busy,
  onVote,
}: {
  entrant: Entrant;
  votes: number;
  share: number;
  picked: boolean;
  showResults: boolean;
  canVote: boolean;
  signedIn: boolean;
  busy: boolean;
  onVote: (code: string) => void;
}) {
  const navigate = useNavigate();
  const { play } = useSound();
  const [burst, setBurst] = useState(0);
  const course = getCourse(entrant.code);
  const signal = getRedditSignal(entrant.code);
  const [c1, c2] = course?.poster ?? ["#1a1a1a", "#333"];

  function click() {
    if (!canVote) return;
    if (!signedIn) {
      void navigate({ to: "/auth", search: { redirect: "/bracket" } });
      return;
    }
    if (picked || busy) return;
    play("pop");
    setBurst((n) => n + 1);
    onVote(entrant.code);
  }

  return (
    <button
      type="button"
      onClick={click}
      disabled={!canVote}
      aria-pressed={picked}
      aria-label={`${entrant.code}${course ? `, ${course.title}` : ""}${
        showResults ? `, ${share}% of votes` : ""
      }${canVote ? (picked ? ", your pick" : ", vote for this course") : ""}`}
      className={`group relative flex min-h-[176px] flex-col justify-between overflow-hidden rounded-[1.25rem] p-4 text-left text-white transition active:scale-[0.98] disabled:cursor-default ${
        picked ? "ring-2 ring-brand ring-offset-2 ring-offset-background" : ""
      } ${canVote && !picked ? "hover:brightness-125" : ""}`}
      style={{ background: `linear-gradient(145deg, ${c1}, ${c2})` }}
    >
      <Burst trigger={burst} />
      <div className="flex items-start justify-between gap-2">
        <span className="rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-bold tracking-wider">
          #{entrant.seed}
        </span>
        {picked && (
          <span className="grid h-6 w-6 place-items-center rounded-full bg-brand">
            <Check className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
      <div>
        <p className="font-mega text-xl font-black tracking-[-0.04em] sm:text-2xl">
          {shortCode(entrant.code)}
        </p>
        {course && <p className="mt-0.5 line-clamp-2 text-[11px] text-white/75">{course.title}</p>}
        {signal?.kind === "hard" && (
          <p className="mt-1.5 text-[10px] font-semibold text-white/60">
            {signal.percent}% of r/UTM: hard
          </p>
        )}
      </div>
      {showResults && (
        <div className="mt-3">
          <div className="flex items-baseline justify-between">
            <span className="font-mega text-2xl font-black">{share}%</span>
            <span className="text-[10px] text-white/60">{votes}</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/40">
            <div
              className="bracket-bar h-full rounded-full bg-white"
              style={{ width: `${share}%` }}
            />
          </div>
        </div>
      )}
    </button>
  );
}

function TreeMatch({ matchup, pick }: { matchup: Matchup; pick: string | undefined }) {
  const rows: Array<[Entrant | null, number]> = [
    [matchup.a, matchup.votesA],
    [matchup.b, matchup.votesB],
  ];
  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-white/[0.03] text-sm ${
        matchup.status === "open" ? "border-brand/40" : "border-white/10"
      }`}
    >
      {rows.map(([entrant, votes], i) => {
        const lost = matchup.winner && entrant && matchup.winner.code !== entrant.code;
        const won = matchup.winner && entrant && matchup.winner.code === entrant.code;
        return (
          <div
            key={i}
            className={`flex items-center gap-2 px-3 py-2 ${i === 0 ? "border-b border-white/10" : ""} ${
              lost ? "opacity-40" : ""
            }`}
          >
            <span className="w-5 text-[10px] tabular-nums text-muted-foreground">
              {entrant?.seed ?? ""}
            </span>
            {entrant ? (
              <Link
                to="/course/$code"
                params={{ code: entrant.code }}
                className={`flex-1 truncate hover:underline ${won ? "font-bold" : "font-medium"}`}
              >
                {shortCode(entrant.code)}
              </Link>
            ) : (
              <span className="flex flex-1 items-center gap-1 text-muted-foreground/60">
                <Lock className="h-3 w-3" /> TBD
              </span>
            )}
            {entrant && pick === entrant.code && (
              <Check className="h-3.5 w-3.5 text-brand" aria-label="Your pick" />
            )}
            {entrant && matchup.status !== "waiting" && (
              <span className="text-xs tabular-nums text-muted-foreground">{votes}</span>
            )}
            {won && <Trophy className="h-3.5 w-3.5 text-amber-400" aria-label="Advanced" />}
          </div>
        );
      })}
    </div>
  );
}

function CopyLinkButton() {
  function copy() {
    if (!navigator.clipboard) {
      toast.error("Copying isn't supported in this browser.");
      return;
    }
    navigator.clipboard.writeText(siteUrl("/bracket")).then(
      () => toast.success("Bracket link copied"),
      () => toast.error("Could not copy. Check your browser permissions."),
    );
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-surface-2 px-5 py-2.5 text-sm font-semibold transition hover:border-brand/50"
    >
      <Link2 className="h-4 w-4" /> Copy link
    </button>
  );
}
