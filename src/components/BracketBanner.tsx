import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { bracketPhase, buildBracket, champion, formatTimeLeft, ROUND_NAMES } from "@/lib/bracket";
import { useBracketConfig, useBracketTallies } from "@/lib/bracket-data";
import { shortCode } from "@/lib/courses";

const SHOW_RESULT_FOR_MS = 14 * 24 * 60 * 60 * 1000;

/** Home-page call to action for the course bracket. Renders nothing until it's set up. */
export function BracketBanner() {
  const { data: config } = useBracketConfig();
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(t);
  }, []);

  const phase = config && now ? bracketPhase(config, now) : null;
  const { data: tallies } = useBracketTallies(config?.id, false, phase?.kind === "finished");

  if (!config || !now || !phase) return null;
  if (phase.kind === "finished" && now.getTime() - phase.endedAt.getTime() > SHOW_RESULT_FOR_MS)
    return null;

  const winner =
    phase.kind === "finished" && tallies ? champion(buildBracket(config, tallies, now)) : null;

  let kicker: string;
  let headline: string;
  if (phase.kind === "open") {
    kicker = `Live · ${ROUND_NAMES[phase.round - 1]} · ${formatTimeLeft(
      phase.closesAt.getTime() - now.getTime(),
    )} left`;
    headline = "What's the hardest course at UTM? Vote now.";
  } else if (phase.kind === "upcoming") {
    kicker = `Starts in ${formatTimeLeft(phase.opensAt.getTime() - now.getTime())}`;
    headline = "16 of UTM's hardest courses. One bracket. You vote.";
  } else {
    kicker = "Final results";
    headline = winner
      ? `UTM voted ${shortCode(winner.code)} the hardest course.`
      : "The hardest-course bracket is over.";
  }

  return (
    <Link
      to="/bracket"
      className="group relative mx-6 mt-6 flex items-center gap-4 overflow-hidden rounded-3xl border border-brand/40 bg-gradient-to-r from-brand/25 via-brand/10 to-transparent p-5 transition hover:border-brand md:mx-10 md:p-6"
    >
      <span className="text-4xl md:text-5xl" aria-hidden="true">
        {phase.kind === "finished" ? "🏆" : "🥊"}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">
          {phase.kind === "open" && (
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
            </span>
          )}
          {kicker}
        </span>
        <span className="mt-1 block font-mega text-lg font-extrabold leading-tight md:text-2xl">
          {headline}
        </span>
      </span>
      <ArrowRight className="h-5 w-5 shrink-0 transition group-hover:translate-x-1" />
    </Link>
  );
}
